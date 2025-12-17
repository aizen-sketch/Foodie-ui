import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Save, Loader2, MapPin, AlertTriangle, Edit, X } from "lucide-react";
import { getUserFromToken } from "../utils/auth";

// API Endpoints
const SAVE_PROFILE_URL = "http://localhost:8000/details/add/"; 
const FETCH_PROFILE_URL = "http://localhost:8000/details/fetch/"; 

// --- Dummy User and Initial Data ---
const DUMMY_USER_DATA = {
    id: '123',
    name: "Demo User",
    email: "demo.user@gildedspoon.com",
};

// Initial state placeholder
const INITIAL_PROFILE_STATE = {
    userId: 0,
    name: DUMMY_USER_DATA.name,
    email: DUMMY_USER_DATA.email,
    phone: "",
    address: "",
    city: "",
    pincode: "",
};

// Function to normalize API response data into the component's state structure
const normalizeProfileData = (apiData, user) => {
    return {
        name: apiData.name || user?.name || INITIAL_PROFILE_STATE.name,
        email: apiData.email || user?.email || INITIAL_PROFILE_STATE.email,
        phone: apiData.phone || INITIAL_PROFILE_STATE.phone,
        address: apiData.address?.street || INITIAL_PROFILE_STATE.address,
        city: apiData.address?.city || INITIAL_PROFILE_STATE.city,
        pincode: apiData.address?.pincode || INITIAL_PROFILE_STATE.pincode,
    };
};

// --- HELPER FUNCTION: Safely Parse JSON ---
const getResponseData = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json") && response.status !== 204) {
        try {
            return await response.json();
        } catch (e) {
            console.error("Error parsing response JSON:", e);
            return { message: response.statusText || "Server response error (Invalid JSON format)." };
        }
    }
    return { message: response.statusText || "An unknown error occurred." };
};

// --- Message Alert Component ---
const MessageAlert = ({ message }) => {
    if (!message) return null;

    const baseClasses = "flex items-center p-4 mb-6 rounded-xl font-semibold shadow-lg";
    let typeClasses = "";

    switch (message.type) {
        case 'success':
            typeClasses = 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800';
            break;
        case 'warning':
            typeClasses = 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800';
            break;
        case 'error':
            typeClasses = 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800';
            break;
        default:
            typeClasses = 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            {message.text}
        </div>
    );
};

// --- Skeleton Loader Component (Styled) ---
const SkeletonLoader = () => (
    <div className="p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-3xl border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="mb-8 border-b border-yellow-100/50 pb-6 dark:border-gray-700 flex justify-between items-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-3/5 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {[...Array(2)].map((_, sectionIndex) => (
                <div key={sectionIndex} className="space-y-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 w-40 rounded-lg"></div>
                    {[...Array(2)].map((_, itemIndex) => (
                        <div key={`${sectionIndex}-${itemIndex}`} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="w-5 h-5 mr-3 mt-1 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                            <div className="flex-grow">
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 w-24 mb-2 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 w-full rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);


// --- Profile Display Card Component (Styled) ---
const ProfileDisplayCard = ({ profile, onEdit }) => (
    <div className="relative z-10 p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-3xl border border-gray-100 dark:border-gray-700 transform hover:shadow-yellow-500/30 transition duration-300">
        <header className="mb-8 border-b border-yellow-100/50 pb-6 dark:border-gray-700 flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
                    <User className="w-8 h-8 mr-4 text-yellow-600" />
                    Welcome, {profile.name || DUMMY_USER_DATA.name}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Your account and delivery details.</p>
            </div>
            <button
                onClick={onEdit}
                className="flex items-center text-sm px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition shadow-md shadow-yellow-500/30"
            >
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Contact Details */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 border-yellow-500 pl-3">Contact Info</h3>
                
                {/* Email */}
                <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm">
                    <Mail className="w-5 h-5 mr-3 mt-1 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.email}</p>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm">
                    <Phone className="w-5 h-5 mr-3 mt-1 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.phone || "Not Set"}</p>
                    </div>
                </div>
            </div>

            {/* Address Details */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-l-4 border-yellow-500 pl-3">Delivery Address</h3>
                
                <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm min-h-[100px]">
                    <MapPin className="w-5 h-5 mr-3 mt-1 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                        <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                            {profile.address || "Address Not Saved"}
                        </p>
                        <p className="text-base text-gray-900 dark:text-gray-100 font-medium mt-1">
                            {profile.city && profile.pincode ? `${profile.city}, ${profile.pincode}` : ''}
                        </p>
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

    const [profile, setProfile] = useState(INITIAL_PROFILE_STATE);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(false); 
    const [isEditing, setIsEditing] = useState(false); 
    const [message, setMessage] = useState(null); 
    
    const isLoading = authLoading || isFetching;

    // --- Fetch Profile Data (Logic unchanged) ---
    const fetchProfileData = async () => {
        if (!token) {
            console.warn("Attempted to fetch profile data without a valid token.");
            setIsFetching(false);
            setMessage({ type: 'error', text: "Session expired or you are logged out. Please log in." });
            setProfile(normalizeProfileData({}, activeUser));
            return;
        }
        
        const userData = await getUserFromToken();
        if (!userData || !userData.id) {
            setMessage({ type: 'error', text: "User ID could not be retrieved from token." });
            return;
        }

        setIsFetching(true);
        setMessage(null);

        try {
            const response = await fetch(FETCH_PROFILE_URL + userData.id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const apiData = await response.json(); 
                const normalizedData = normalizeProfileData(apiData, activeUser);
                setProfile(normalizedData);
                
                if (!normalizedData.phone) { 
                    setIsEditing(true);
                    setMessage({ type: 'warning', text: "Profile is incomplete. Please fill in your details." });
                }
            } else {
                const errorData = await getResponseData(response);

                if (response.status === 404) {
                    setProfile(normalizeProfileData({}, activeUser)); 
                    setIsEditing(true);
                    setMessage({ type: 'warning', text: "Welcome! No saved profile found. Please create one." });
                } else if (response.status === 401) {
                    setMessage({ type: 'error', text: `Authentication Failed (401). ${errorData.message || 'Please log in again.'}` });
                } else {
                    console.error("API Fetch Error:", errorData);
                    setMessage({ type: 'error', text: `Failed to load profile: ${errorData.message || response.statusText}` });
                }
            }
        } catch (error) {
            console.error("Network or Fetch Error:", error);
            setMessage({ type: 'error', text: "An error occurred while connecting to the server. Check server status." });
        } finally {
            setIsFetching(false);
        }
    };


    // --- useEffect: Fetch Data on Token Load/User Change (Logic unchanged) ---
    useEffect(() => {
        if (!authLoading) {
            fetchProfileData();
        }
    }, [authLoading, token]); 


    // --- handleUpdate (Logic unchanged) ---
    const handleUpdate = async () => { 
        if (!token) {
            setMessage({ type: 'error', text: "Cannot save: Authentication token missing." });
            return;
        }
        const userData = await getUserFromToken();
        if (!userData || !userData.id) {
            setMessage({ type: 'error', text: "User ID could not be retrieved from token." });
            return;
        }


        const structuredProfileData = {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            userId: userData.id,
            address: { 
                street: profile.address, 
                city: profile.city,
                pincode: profile.pincode,
            }
        };

        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch(SAVE_PROFILE_URL + userData.id, {
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
                const errorData = await getResponseData(response);
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
    const inputClassName = "bg-white dark:bg-gray-700/50 w-full outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none focus:ring-0";
    
    const startEditing = () => {
        setMessage(null);
        setIsEditing(true);
    }

    const cancelEditing = () => {
        fetchProfileData(); 
        setIsEditing(false);
        setMessage(null);
    };

    // --- Loading State Renderer ---
    if (isLoading) {
         return (
            // APPLYING BACKGROUND GRADIENT TO THE OUTER CONTAINER
            <div className="min-h-screen pt-28 pb-12 bg-gradient-to-br from-yellow-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <div className="max-w-xl mx-auto px-4 sm:px-6 w-full">
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    // --- Unauthenticated Renderer ---
    if (!token && !authLoading) { 
         return (
            // APPLYING BACKGROUND GRADIENT TO THE OUTER CONTAINER
            <div className="min-h-screen pt-28 pb-12 bg-gradient-to-br from-yellow-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <div className="max-w-xl mx-auto px-4 sm:px-6">
                    <MessageAlert message={{ type: 'error', text: message?.text || "You must be logged in to view your profile." }} />
                </div>
            </div>
        );
    }
    
    // --- Main Profile Content (Authenticated User) ---
    return (
        // APPLYING BACKGROUND GRADIENT TO THE OUTER CONTAINER
        <div className="min-h-screen pt-28 pb-12 bg-gradient-to-br from-yellow-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
            {/* Subtle background graphic (for visual depth) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 dark:bg-yellow-700 opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 dark:bg-yellow-800 opacity-5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

            <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10">
                
                {/* Message Banner */}
                <MessageAlert message={message} />
                
                {/* Conditional Rendering: Display Card or Edit Form */}
                {isEditing ? (
                    // --- PROFILE EDIT FORM ---
                    <div className="p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-3xl border border-gray-100 dark:border-gray-700">
                        
                        <header className="mb-8 border-b border-yellow-100/50 pb-6 dark:border-gray-700 flex justify-between items-center">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center">
                                <Edit className="w-7 h-7 mr-3 text-yellow-600" />
                                {profile.name ? "Edit Profile Details" : "Create Your Profile"}
                            </h1>
                            {!isSaving && isEditing && (profile.name && profile.name !== "") && (
                                <button onClick={cancelEditing} className="text-gray-500 hover:text-red-600 transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </header>

                        <div className="space-y-6">

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">Full Name</label>
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 shadow-inner focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 transition duration-150">
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
                                className="mt-8 flex items-center justify-center w-full bg-yellow-600 text-white py-3 rounded-xl text-lg font-bold shadow-lg shadow-yellow-500/50 hover:bg-yellow-700 transition duration-300 disabled:bg-yellow-400 disabled:shadow-none disabled:cursor-not-allowed"
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