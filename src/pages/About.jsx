import React from 'react';
import { ChefHat, Star, MapPin, Utensils } from 'lucide-react';

// Sample background image URL (replace with your restaurant's actual image if available)
const RESTAURANT_IMAGE = "https://placehold.co/1200x600/1e293b/f8fafc?text=Our+Beautiful+Restaurant+Interior";
const CHEF_IMAGE = "https://placehold.co/400x400/0d9488/fff?text=Head+Chef+Portrait";

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-all duration-300">
            
            {/* Header Section with Background Image */}
            <header 
                className="relative h-96 bg-cover bg-center flex items-center justify-center text-white p-4 shadow-xl"
                style={{ backgroundImage: `url(${RESTAURANT_IMAGE})` }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative text-center max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 animate-fadeInUp">
                        Our Story
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-gray-200">
                        Where Passion Meets Plate: Crafting culinary experiences since 2020.
                    </p>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto py-16 px-4 md:px-8">
                
                {/* Section 1: The Philosophy */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Philosophy Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4 flex items-center">
                                <Utensils className="w-8 h-8 mr-3 text-indigo-500"/> The Culinary Philosophy
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
                                At **The Flavor Nest**, we believe food is more than just sustenance; it's an exploration. Our philosophy centers on sourcing the finest, local ingredients and transforming them into dishes that are both familiar and delightfully surprising. We are committed to sustainability, quality, and creativity in every dish we serve.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                "Every ingredient tells a story, and we are here to weave them into a memorable tale for our guests."
                            </p>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-indigo-600 p-8 rounded-2xl shadow-2xl text-white">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <Star className="w-6 h-6 mr-2 text-yellow-300"/> Highlights
                            </h3>
                            <ul className="space-y-4 text-lg">
                                <li className="flex items-center space-x-3">
                                    <Star className="w-5 h-5 text-yellow-300"/> 
                                    <span>Voted Best Local Cuisine for 3 years.</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <ChefHat className="w-5 h-5 text-yellow-300"/> 
                                    <span>Recipes perfected over a decade.</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5 text-yellow-300"/> 
                                    <span>100% Locally Sourced Produce.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Section 2: Meet the Chef */}
                <section className="mb-16">
                    <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-inner grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        
                        {/* Chef Image */}
                        <div className="md:col-span-1 flex justify-center">
                            <img 
                                src={CHEF_IMAGE} 
                                alt="Head Chef Michael Chen" 
                                className="w-48 h-48 object-cover rounded-full border-4 border-indigo-500 shadow-xl"
                            />
                        </div>

                        {/* Chef Bio */}
                        <div className="md:col-span-2 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                                Meet Head Chef, Jane Doe
                            </h2>
                            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
                                Culinary Visionary & Founder
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Chef Jane Doe, a graduate of the Culinary Institute of Excellence, brought her vision of fusion cuisine to life with The Flavor Nest. Her dishes are a beautiful blend of traditional techniques and modern, global influences. She leads her team with a dedication to detail and a passion for creating truly unforgettable dining experiences.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Location and Contact */}
                <section className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Visit Us
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center space-x-2 mb-2">
                        <MapPin className="w-6 h-6 text-red-500"/>
                        <span>101 Gourmet Avenue, Food City, CA 90210</span>
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Open Daily: 11:00 AM - 10:00 PM
                    </p>
                </section>

            </main>
        </div>
    );
}