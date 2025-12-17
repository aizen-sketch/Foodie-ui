import React, { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import MenuCard from "../components/MenuCard";
import MessageBox from "../components/MessageBox";
import { useAuth } from "../context/AuthContext"; // Import useAuth to get the token
import { Loader2, AlertTriangle } from "lucide-react"; // Icons for loading and error

// Assuming MenuCard expects a standard object structure like this:
// { id: 1, name: "Seared Scallops", description: "...", price: 32, img: "..." }

const API_TOP_THREE_URL = "http://localhost:8000/menu/topThree";

export default function Home() {
  const { token } = useAuth(); // Get the authentication token
  
  // State for dynamic data
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user messages (e.g., "Item added to cart")
  const [msg, setMsg] = useState("");

  // --- Data Fetching Logic ---
  const fetchTopMenu = async () => {
    setLoading(true);
    setError(null);
    
    if (!token) {
      setError("You must be logged in to view the featured menu.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_TOP_THREE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the authentication token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch menu (Status: ${response.status})`);
      }

      const data = await response.json();
      setMenuItems(data); // Assuming 'data' is an array of menu items

    } catch (err) {
      console.error("Fetch Menu Error:", err);
      setError(err.message || "An unexpected error occurred while fetching the menu.");
      setMenuItems([]); // Clear items on failure
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect to trigger fetch on component mount and when token changes ---
  useEffect(() => {
    // Only fetch if a token is present
    if (token) {
      fetchTopMenu();
    } else {
       // Handle case where token might be null (e.g., still loading or logged out)
       setLoading(false);
       setError("Please log in to view the current menu items.");
    }
  }, [token]); // Re-run the effect if the token changes

  // --- Content Render Logic ---
  const renderMenuContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 mr-3 animate-spin text-yellow-600" />
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading today's features...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (menuItems.length === 0) {
      return (
        <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg">
          <p className="font-medium">No featured dishes available right now. Please check back later.</p>
        </div>
      );
    }

    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {menuItems.map((m) => (
          // IMPORTANT: Ensure the data structure returned by the API matches what MenuCard expects.
          <MenuCard 
            key={m.id} 
            item={m} 
            onAdd={() => setMsg(`${m.name} added to cart`)} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <MessageBox message={msg} />
      <HeroSection 
        onCta={(a) => setMsg(`Action: ${a}`)} 
      />
      
      <section className="py-16 bg-gray-100 dark:bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 border-b-2 border-yellow-500 pb-2">
            ✨ Today's Featured Dishes
          </h2>
          
          {renderMenuContent()}

        </div>
      </section>
    </div>
  );
}