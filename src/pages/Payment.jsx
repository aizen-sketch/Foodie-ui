import React, { useState } from "react";
import { CreditCard, MapPin, Loader2, AlertTriangle, DollarSign } from "lucide-react";
import PaymentSuccess from './PaymentSuccess'; 
import { useAuth } from '../context/AuthContext'; 
import { useLocation } from 'react-router-dom';
import { getUserFromToken } from "../utils/auth";

const API_BASE_URL = 'http://localhost:8000';

export default function Payment() {
    const location = useLocation();
    const { token, user } = useAuth(); 
    
    // 1. DYNAMICALLY RETRIEVE ORDER DATA FROM NAVIGATION STATE
    const orderIdget = location.state?.orderId;
    const totalAmountget = location.state?.totalAmount;    
    console.log("orderIdget: " + orderIdget + " totalAmountget: " + totalAmountget);

    // --- State to track component status ---
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State for Form Data (ADDED) ---
    const [formData, setFormData] = useState({
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
        // Billing/Shipping Address defaults
        fullName: user?.name || "John Doe", 
        street: "123 Main St",
        city: "Springfield",
        pincode: "62704"
    });

    // 2. INITIALIZE orderDetails using received data
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

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;

        const user = await getUserFromToken();
        const token = localStorage.getItem("token");

        if (!user || !token) {
            setError("Missing token please login again");
            return;
        }

        setIsLoading(true);
        setError(null);

        // 3. CONSTRUCT THE FINAL PAYLOAD USING STATE AND FORM DATA
        const payload = {
            orderId: orderIdget, // <-- DYNAMIC ID
            userId: user.id,   // <-- AUTHENTICATED USER ID
            cardNumber: formData.cardNumber,
            cardHolderName: formData.cardHolderName || formData.fullName,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
            // Constructing a single string for billingAddress
            billingAddress: `${formData.street}, ${formData.city}, IL, ${formData.pincode}`, 
        };
        console.log("Payment Payload:", payload);
        try {
            // API endpoint uses the current authenticated user's ID
            const response = await fetch(`${API_BASE_URL}/payment/pay/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
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


    // --- Validation and Fallback ---
    if (!orderIdget || totalAmountget === undefined || totalAmountget === null) {
        return (
            <div className="text-center p-12 mt-20">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h2 className="text-2xl text-red-700 font-semibold">Missing Order Information</h2>
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

    // Define the corrected input className once for readability.
    // dark:text-white ensures entered text is clearly visible on the dark background.
    // dark:placeholder-gray-400 ensures placeholder text is readable.
    const inputClassName = "w-full mt-1 p-3 border rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"; // <-- **CRITICAL CHANGE**


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
                </div>

                {/* Right Column: Payment Details and Final Button */}
                <div className="lg:w-1/2 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl space-y-4">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-gray-100">
                        <CreditCard className="w-5 h-5 mr-2"/> Payment Details
                    </h2>
                    
                    {/* Display Total Amount */}
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
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
                        disabled={isLoading}
                        className="w-full mt-6 flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-green-500/50 hover:bg-green-700 transition duration-300 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span>Pay {orderDetails.currency}{totalAmountget.toFixed(2)} Now</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}