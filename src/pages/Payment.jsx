import React, { useState, useEffect, useCallback } from "react";
import { CreditCard, MapPin, Loader2, AlertTriangle, DollarSign } from "lucide-react";
import PaymentSuccess from './PaymentSuccess'; 
import { useAuth } from '../context/AuthContext'; 
import { useLocation } from 'react-router-dom';
import { getUserFromToken } from "../utils/auth"; // Utility to decode token

const API_BASE_URL = 'http://localhost:8000';
const FETCH_ADDRESS_URL = `${API_BASE_URL}/details/fetch/`; // Base URL for fetching address

export default function Payment() {
    const location = useLocation();
    const { token, user: authUser } = useAuth(); // Renamed 'user' to 'authUser' to avoid conflict
    
    // 1. DYNAMICALLY RETRIEVE ORDER DATA
    const orderIdget = location.state?.orderId;
    const totalAmountget = location.state?.totalAmount;    

    // --- State to track component status ---
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(true); // New loading state for address
    const [error, setError] = useState(null);

    // --- State for Form Data ---
    const [formData, setFormData] = useState({
        // Payment details
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
        // Shipping/Billing Address defaults (will be overwritten by fetch)
        fullName: authUser?.name || "", 
        street: "",
        city: "",
        pincode: ""
    });

    // 2. INITIALIZE orderDetails
    const [orderDetails] = useState({
        orderId: orderIdget,
        totalAmount: totalAmountget, 
        currency: '₹', 
        paymentMethod: 'Visa **** 4111', 
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- 🔑 NEW FUNCTION: Fetch Shipping Address ---
    const fetchShippingAddress = useCallback(async (userId, authToken) => {
        if (!authToken || !userId) {
            setIsAddressLoading(false);
            return;
        }

        setIsAddressLoading(true);
        try {
            const response = await fetch(`${FETCH_ADDRESS_URL}${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                // Safely update form data with fetched profile details
                setFormData(prev => ({
                    ...prev,
                    // Use fetched name, falling back to authUser name
                    fullName: data.name || authUser?.name || '', 
                    street: data.address?.street || '',
                    city: data.address?.city || '',
                    pincode: data.address?.pincode || '',
                }));
                console.log("Shipping address loaded successfully.");

            } else if (response.status === 404) {
                 // Profile not found, this is acceptable, just continue with defaults
                 console.log("No saved profile found. User will enter address manually.");
            } else {
                console.error("Failed to fetch shipping address:", response.statusText);
            }
        } catch (err) {
            console.error("Network error during address fetch:", err);
            // Optionally set a non-blocking error message
        } finally {
            setIsAddressLoading(false);
        }
    }, [authUser]); // Dependency on authUser ensures name fallback is correct

    // --- 📞 useEffect: Trigger Address Fetch on Component Load ---
    useEffect(() => {
        const loadAddress = async () => {
            const userData = await getUserFromToken();
            const authToken = localStorage.getItem("token");

            if (userData && authToken) {
                fetchShippingAddress(userData.id, authToken);
            } else {
                // If no token/user data, stop loading state quickly
                setIsAddressLoading(false);
            }
        };

        if (token) {
            loadAddress();
        }
    }, [token, fetchShippingAddress]);


    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;

        const user = await getUserFromToken();
        const authToken = localStorage.getItem("token");

        if (!user || !authToken) {
            setError("Missing token. Please log in again.");
            return;
        }

        setIsLoading(true);
        setError(null);

        // 3. CONSTRUCT THE FINAL PAYLOAD USING STATE AND FORM DATA
        const payload = {
            orderId: orderIdget, 
            userId: user.id,   
            cardNumber: formData.cardNumber,
            cardHolderName: formData.cardHolderName || formData.fullName, // Use full name if cardHolderName is empty
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
            billingAddress: `${formData.street}, ${formData.city}, IL, ${formData.pincode}`, 
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/payment/pay/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error("Authorization failed. Please log in again.");
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Payment failed with status: ${response.status}`);
            }

            // Payment successful
            setIsPaymentSuccessful(true);
            window.scrollTo(0, 0); 

        } catch (err) {
            console.error("Payment API Error:", err);
            setError(err.message || "An unexpected error occurred during payment.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Validation and Fallback (Check for order data) ---
    if (!orderIdget || totalAmountget === undefined || totalAmountget === null) {
        return (
            <div className="text-center p-12 mt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h2 className="text-2xl text-red-700 font-semibold dark:text-red-400">Missing Order Information</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The order details could not be loaded. Please return to your cart and try checking out again.
                </p>
            </div>
        );
    }


    // Conditional Rendering
    if (isPaymentSuccessful) {
        return <PaymentSuccess {...orderDetails} />;
    }

    // Define the corrected input className
    const inputClassName = "w-full mt-1 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors duration-150";


    // --- Payment Form JSX ---
    return (
        <div className="px-4 md:px-10 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="flex items-center space-x-3 mb-10">
                <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50">
                    Secure Checkout & Payment
                </h1>
            </header>
            
            <form onSubmit={handlePayment} className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Address and Contact */}
                <div className="lg:w-1/2 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
                        <MapPin className="w-5 h-5 mr-2"/> Shipping Address
                    </h2>
                    
                    {/* Address Loading State */}
                    {isAddressLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="flex gap-4">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Loading saved address...
                            </div>
                        </div>
                    ) : (
                        // Address Form Fields (Visible after loading)
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input 
                                    type="text" 
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="John Doe" 
                                    required
                                    className={inputClassName}
                                />
                            </div>
                            {/* Street */}
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                                <input 
                                    type="text" 
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    placeholder="123 Main St" 
                                    required
                                    className={inputClassName}
                                />
                            </div>
                            <div className="flex gap-4">
                                {/* City */}
                                <div className="flex-1">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <input 
                                        type="text" 
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Springfield" 
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                                {/* Pincode */}
                                <div className="w-1/3">
                                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                <input 
                                        type="text" 
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="62704" 
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Payment Details and Final Button */}
                <div className="lg:w-1/2 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl space-y-4">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
                        <CreditCard className="w-5 h-5 mr-2"/> Payment Details
                    </h2>
                    
                    {/* Display Total Amount */}
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center">
                            <DollarSign className="w-5 h-5 mr-1" /> Order Total:
                        </span>
                        <span className="text-2xl font-extrabold text-green-800 dark:text-green-300">
                            {orderDetails.currency}{totalAmountget.toFixed(2)}
                        </span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Card Holder Name */}
                    <div>
                        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Holder Name</label>
                        <input 
                            type="text" 
                            id="cardHolderName"
                            name="cardHolderName"
                            value={formData.cardHolderName}
                            onChange={handleChange}
                            placeholder="John Doe" 
                            required
                            className={inputClassName}
                        />
                    </div>

                    {/* Card Number */}
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                        <input 
                            type="text" 
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="4111 XXXX XXXX XXXX" 
                            maxLength="16" 
                            required
                            className={inputClassName}
                        />
                    </div>
                    <div className="flex gap-4">
                        {/* Expiry Date */}
                        <div className="flex-1">
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                            <input 
                                type="text" 
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                placeholder="MM/YY" 
                                maxLength="5" 
                                required
                                className={inputClassName}
                            />
                        </div>
                        {/* CVV */}
                        <div className="w-1/3">
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                            <input 
                                type="text" 
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                placeholder="123" 
                                maxLength="3" 
                                required
                                className={inputClassName}
                            />
                        </div>
                    </div>

                    {/* Final Payment Button */}
                    <button 
                        type="submit"
                        disabled={isLoading || isAddressLoading} // Disable if either payment or address is loading
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-green-500/50 hover:bg-green-700 transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Processing Payment...</span>
                            </>
                        ) : (
                            <>
                                <span>Pay {orderDetails.currency}{totalAmountget.toFixed(2)} Now</span>
                            </>
                        )}
                    </button>
                    {isAddressLoading && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">Waiting for address data...</p>}
                </div>
            </form>
        </div>
    );
}