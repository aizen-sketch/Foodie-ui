import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Save, Loader2, MapPin, AlertTriangle, Edit, X } from "lucide-react";

// API Endpoints
const SAVE_PROFILE_URL = "http://localhost:8000/details/add/9"; // User ID 9 assumed for save
const FETCH_PROFILE_URL = "http://localhost:8000/details/fetch/9"; // User ID 9 assumed for fetch

// --- Dummy User and Initial Data ---
const DUMMY_USER_DATA = {
    id: '123',
    name: "Demo User",
    email: "demo.user@gildedspoon.com",
};

// Initial state placeholder (used before fetch or if fetch fails to find a profile)
const INITIAL_PROFILE_STATE = {
    "userId": 9,
    name: DUMMY_USER_DATA.name,
    email: DUMMY_USER_DATA.email,
    phone: "",
    address: "",
    city: "",
    pincode: "",
};

// Function to normalize API response data into the component's state structure
const normalizeProfileData = (apiData, user) => {
    // API data structure is assumed to be: { name, email, phone, address: { street, city, pincode } }
    return {
        
        name: apiData.name || user?.name || INITIAL_PROFILE_STATE.name,
        email: apiData.email || user?.email || INITIAL_PROFILE_STATE.email,
        phone: apiData.phone || INITIAL_PROFILE_STATE.phone,
        // Flatten the nested address object
        address: apiData.address?.street || INITIAL_PROFILE_STATE.address,
        city: apiData.address?.city || INITIAL_PROFILE_STATE.city,
        pincode: apiData.address?.pincode || INITIAL_PROFILE_STATE.pincode,
    };
};

// --- Profile Display Card Component (Unchanged) ---
const ProfileDisplayCard = ({ profile, onEdit }) => (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <header className="mb-8 border-b pb-4 dark:border-gray-700 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
                    <User className="w-7 h-7 mr-3 text-yellow-600" />
                    Welcome, {profile.name || DUMMY_USER_DATA.name}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Your saved account and delivery details.</p>
            </div>
            <button
                onClick={onEdit}
                className="flex items-center text-sm px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
                <Edit className="w-4 h-4 mr-2" /> Edit
            </button>
        </header>

        <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{profile.email}</p>
                </div>
            </div>

            {/* Phone */}
            <div className="flex items-start">
                <Phone className="w-5 h-5 mr-3 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{profile.phone || "Not Set"}</p>
                </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Address</p>
                        <p className="text-lg text-gray-900 dark:text-gray-100">{profile.address}</p>
                        <p className="text-lg text-gray-900 dark:text-gray-100">{profile.city}, {profile.pincode}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


// --- Main MyProfile Component ---
export default function MyProfile() {
    const { user, loading: authLoading, token } = useAuth(); 

    const activeUser = user || DUMMY_USER_DATA; 

    // Initialize state with the basic structure/dummy data
    const [profile, setProfile] = useState(INITIAL_PROFILE_STATE);
    const [isSaving, setIsSaving] = useState(false);
    // Set initial fetching to false, it will be set to true in fetchProfileData when conditions are met
    const [isFetching, setIsFetching] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [message, setMessage] = useState(null); 
    
    // Combined loading state: Wait for Auth to load OR for the data fetch to complete
    const isLoading = authLoading || isFetching;

    // --- Fetch Profile Data ---
    const fetchProfileData = async () => {
        // --- CRITICAL FIX 1: Check for token existence ---
        if (!token) {
            // If the token is null/undefined after authLoading is false, the user is logged out or session expired.
            console.warn("Attempted to fetch profile data without a valid token. User is logged out.");
            setIsFetching(false);
            // We set an error message and let the UI handle the unauthenticated state
            setMessage({ type: 'error', text: "Session expired or you are logged out. Please log in." });
            setProfile(normalizeProfileData({}, activeUser)); // Reset to initial/blank state
            return;
        }
        
        setIsFetching(true);
        setMessage(null);

        try {
            const response = await fetch(FETCH_PROFILE_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Use the token here
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const apiData = await response.json(); 
                const normalizedData = normalizeProfileData(apiData, activeUser);
                setProfile(normalizedData);
                
                // If the profile data is largely empty (e.g., phone is missing), prompt user to edit
                if (!normalizedData.phone) { 
                    setIsEditing(true);
                    setMessage({ type: 'warning', text: "Profile is incomplete. Please fill in your details." });
                }
            } else if (response.status === 401) {
                // Explicitly handle 401 error during fetch
                setMessage({ type: 'error', text: "Authentication Failed (401). Please log in again." });
            } else if (response.status === 404) {
                // Profile not found: Initialize with blank/dummy data and enter edit mode
                setProfile(normalizeProfileData({}, activeUser)); 
                setIsEditing(true);
                setMessage({ type: 'warning', text: "Welcome! No saved profile found. Please create one." });
            } else {
                // General fetch error
                const errorData = await response.json();
                console.error("API Fetch Error:", errorData);
                setMessage({ type: 'error', text: `Failed to load profile: ${errorData.message || response.statusText}` });
            }
        } catch (error) {
            console.error("Network or Fetch Error:", error);
            setMessage({ type: 'error', text: "An error occurred while fetching the profile. Check server status." });
        } finally {
            setIsFetching(false);
        }
    };


    // --- useEffect: Fetch Data on Token Load/User Change ---
    useEffect(() => {
        // --- CRITICAL FIX 2: Gate the fetch by checking if Auth is finished loading AND a token is available ---
        if (!authLoading && token) {
            fetchProfileData();
        } else if (!authLoading && !token) {
             // If loading is done and there's no token, trigger the unauthenticated flow
             fetchProfileData(); 
        }
    // Dependency now includes 'token' to react when the token loads after initial mount
    }, [authLoading, token]); 


    // --- handleUpdate (Save logic remains the same) ---
    const handleUpdate = async () => { 
        if (!activeUser) {
            setMessage({ type: 'error', text: "Please log in before saving." });
            return;
        }
        
        // Ensure token is present for saving as well
        if (!token) {
            setMessage({ type: 'error', text: "Cannot save: Authentication token missing." });
            return;
        }

        // 1. CONSTRUCT THE STRUCTURED DATA FOR THE BACKEND
        const structuredProfileData = {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            "userId": 9,
            // 2. NEST THE ADDRESS FIELDS into an 'address' object
            address: { 
                street: profile.address, 
                city: profile.city,
                pincode: profile.pincode,
            }
        };

        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch(SAVE_PROFILE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(structuredProfileData),
            });

            if (response.ok) {
                const result = await response.json(); 
                console.log("API Success Response:", result);

                setMessage({ type: 'success', text: "Profile updated successfully!" });
                setIsEditing(false); 
            } else {
                const errorData = await response.json();
                setMessage({ 
                    type: 'error', 
                    text: `Failed to save profile. Server message: ${errorData.message || response.statusText}`
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "An error occurred while connecting to the server. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };


    // --- UI Controls ---
    const inputClassName = "bg-transparent w-full outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
    
    const startEditing = () => {
        setMessage(null);
        setIsEditing(true);
    }

    const cancelEditing = () => {
        // Reset by re-fetching the last saved state
        fetchProfileData(); 
        setIsEditing(false);
        setMessage(null);
    };

    // --- Loading State Renderer ---
    if (isLoading) {
         return (
            <div className="flex justify-center items-center min-h-screen pt-28 pb-12 bg-gray-50 dark:bg-gray-900">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-yellow-600 animate-spin" />
                    <p className="mt-4 text-gray-700 dark:text-gray-300">Loading profile data...</p>
                </div>
            </div>
        );
    }

    // --- CRITICAL FIX 3: Unauthenticated Renderer ---
    // If authLoading is false (done initializing) and token is null/undefined (no one is logged in)
    if (!token && !authLoading) { 
         return (
            <div className="min-h-screen pt-28 pb-12 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-xl mx-auto px-4 sm:px-6">
                    <div className={`flex items-center p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg font-medium shadow-lg`}>
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {message?.text || "You must be logged in to view your profile."}
                    </div>
                </div>
            </div>
        );
    }
    
    // --- Main Profile Content (Authenticated User) ---
    return (
        <div className="min-h-screen pt-28 pb-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-xl mx-auto px-4 sm:px-6">
                
                {/* Message Banner (always shown at the top) */}
                {message && (
                    <div className={`flex items-center p-4 mb-6 rounded-lg font-medium shadow-md
                        ${message.type === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : message.type === 'warning'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                    >
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {message.text}
                    </div>
                )}
                
                {/* Conditional Rendering: Display Card or Edit Form */}
                {isEditing ? (
                    // --- PROFILE EDIT FORM ---
                    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
                        
                        <header className="mb-8 border-b pb-4 dark:border-gray-700 flex justify-between items-center">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
                                <Edit className="w-7 h-7 mr-3 text-yellow-600" />
                                {profile.name ? "Edit Profile Details" : "Create Your Profile"}
                            </h1>
                            {!isSaving && isEditing && (profile.name && profile.name !== "") && (
                                <button onClick={cancelEditing} className="text-gray-500 hover:text-red-600 transition">
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </header>

                        <div className="space-y-6">

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Full Name</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                    <User className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className={inputClassName}
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Email Address</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                    <Mail className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        className={inputClassName}
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Street Address</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                    <MapPin className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={profile.address}
                                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                                        className={inputClassName}
                                        placeholder="123 Main St"
                                    />
                                </div>
                            </div>

                            {/* City & Pincode */}
                            <div className="flex gap-4">
                                {/* City */}
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">City</label>
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                        <input
                                            type="text"
                                            value={profile.city}
                                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                                            className={inputClassName}
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                                {/* Pincode */}
                                <div className="w-1/3">
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Pincode</label>
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                        <input
                                            type="text"
                                            value={profile.pincode}
                                            onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                                            className={inputClassName}
                                            placeholder="62704"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone Number</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition">
                                    <Phone className="text-gray-500 dark:text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
                                    <input
                                        type="tel" 
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                        className={inputClassName}
                                        placeholder="e.g., +1 555 123 4567"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={isSaving}
                                className="mt-8 flex items-center justify-center w-full bg-yellow-600 text-white py-3 rounded-xl text-lg font-bold shadow-md shadow-yellow-500/50 hover:bg-yellow-700 transition disabled:bg-yellow-400 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- PROFILE DISPLAY CARD ---
                    <ProfileDisplayCard profile={profile} onEdit={startEditing} />
                )}
            </div>
        </div>
    );
}