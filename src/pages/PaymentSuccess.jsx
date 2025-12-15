import React from 'react';
import { CheckCircle, Home, FileText } from 'lucide-react';

// This component will receive the order details as props
const PaymentSuccess = ({ orderId, totalAmount, currency, paymentMethod, date, time }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center transform transition-all duration-500 ease-in-out scale-100 opacity-100">
                
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                    <CheckCircle className="w-20 h-20 text-green-500 dark:text-green-400 animate-pulse" />
                </div>

                {/* Title and Message */}
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-3">
                    Order Confirmed!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Your payment was successful. We're getting your delicious meal ready!
                </p>

                {/* Order Details Box */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-8">
                    <DetailItem label="Order ID" value={orderId} isBold={true} />
                    <DetailItem label="Date & Time" value={`${date} at ${time}`} />
                    <DetailItem label="Paid With" value={paymentMethod} />
                    
                    {/* Highlighted Total Amount */}
                    <div className="flex justify-between pt-4 border-t border-gray-300 dark:border-gray-600 mt-4">
                        <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Total Paid</span>
                        <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                            {currency} {totalAmount ? totalAmount.toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl text-lg font-semibold shadow-lg shadow-green-500/50 hover:bg-green-700 transition duration-300"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>
                    <button
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-800 py-3 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
                    >
                        <FileText className="w-5 h-5" />
                        <span>View Receipt</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper component for detail lines
const DetailItem = ({ label, value, isBold = false }) => (
    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`text-sm ${isBold ? 'font-bold' : 'font-medium'} text-gray-800 dark:text-gray-100`}>
            {value}
        </span>
    </div>
);

export default PaymentSuccess;