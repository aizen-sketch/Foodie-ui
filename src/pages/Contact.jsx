import React, { useState } from 'react';
import { Mail, Smartphone, MapPin, Clock, Send, Loader2 } from 'lucide-react';

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic form validation check
        const form = e.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setIsSubmitting(true);
        setMessageSent(false);

        // --- Simulate Form Submission API Call ---
        // In a real application, you would send the form data to your backend here.
        setTimeout(() => {
            setIsSubmitting(false);
            setMessageSent(true);
            
            // Clear the form fields after success
            form.reset(); 

        }, 2000); 
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-all duration-300">
            
            {/* Header Section */}
            <header className="py-16 text-center bg-indigo-600 dark:bg-indigo-800 shadow-lg">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-indigo-200">
                        We'd love to hear from you! Send us a message or find our location below.
                    </p>
                </div>
            </header>

            {/* Main Content: Form and Details */}
            <main className="max-w-6xl mx-auto py-16 px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left Column: Contact Form */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                            Send Us a Message
                        </h2>
                        
                        {messageSent && (
                            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 rounded-lg font-semibold">
                                Message sent successfully! We will respond shortly.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Name Input */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name<span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    required
                                    placeholder="Your Name" 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address<span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    required
                                    placeholder="your.email@example.com" 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Message<span className="text-red-500">*</span></label>
                                <textarea 
                                    id="message" 
                                    rows="4" 
                                    required
                                    placeholder="Tell us what you think..." 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                                    w-full flex items-center justify-center space-x-2 
                                    py-3 rounded-xl text-lg font-bold shadow-lg 
                                    transition duration-300
                                    ${isSubmitting 
                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                                        : 'bg-indigo-600 text-white shadow-indigo-500/50 hover:bg-indigo-700'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin"/>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6"/>
                                        <span>Send Message</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Details and Map */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* Contact Information Card */}
                        <div className="bg-indigo-50 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-indigo-200 dark:border-indigo-900/50">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                                Contact Information
                            </h3>
                            <ul className="space-y-4">
                                <ContactDetail icon={MapPin} label="Address" value="101 Gourmet Avenue, Food City, CA 90210" color="text-red-500"/>
                                <ContactDetail icon={Smartphone} label="Phone" value="(555) 123-4567" color="text-teal-500"/>
                                <ContactDetail icon={Mail} label="Email" value="contact@flavor.nest" color="text-blue-500"/>
                                <ContactDetail icon={Clock} label="Hours" value="Daily: 11:00 AM - 10:00 PM" color="text-orange-500"/>
                            </ul>
                        </div>

                        {/* Map Placeholder */}
                        <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-2xl shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                            <p className="font-semibold">Map Placeholder (101 Gourmet Avenue)</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Helper component for displaying contact details
const ContactDetail = ({ icon: Icon, label, value, color }) => (
    <li className="flex items-start space-x-4">
        <Icon className={`w-6 h-6 flex-shrink-0 ${color}`} />
        <div>
            <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
            <span className="block text-base font-medium text-gray-800 dark:text-gray-100">{value}</span>
        </div>
    </li>
);