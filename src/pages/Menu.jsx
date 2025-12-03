import React, { useState, useEffect } from "react";
import MenuCard from "../components/MenuCard";
import { getUserFromToken } from "../utils/auth";
import { ShoppingCart, Utensils, Loader2 } from "lucide-react";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/menu/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch menu: ${res.statusText}`);
      }

      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Error loading menu:", err);
      setError("Failed to load menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (itemId) => {
    const user = await getUserFromToken();
    if (!user) {
      alert("Please login first to add items to your cart!");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8000/order/cart/${user.id}/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menuItemId: itemId, // FIXED
            quantity: 1,
          }),
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error("Failed to add item to cart.");
      }

      setMessage("Item added to cart successfully!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage(`Error: ${err.message || "Could not add item to cart."}`);
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="px-4 md:px-12 py-10 min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      
      {/* Header */}
      <header className="flex flex-col items-center text-center mb  -12">
        <Utensils className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-3" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50">
          Our Full Menu
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-xl">
          Explore our delicious offerings, crafted with the freshest ingredients just for you.
        </p>
      </header>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mr-2" />
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading menu...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 p-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg">
          <p className="text-xl font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={loadMenu}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md"
          >
            Retry Loading
          </button>
        </div>
      ) : menu.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No items available on the menu. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {menu.map((m) => (
            <MenuCard key={m.id} item={m} onAdd={() => handleAddToCart(m.id)} />
          ))}
        </div>
      )}

      {/* Toast message */}
      {message && (
        <div
          className={`fixed right-4 bottom-4 p-4 flex items-center rounded-xl shadow-2xl transition-all duration-300 
          ${message.includes("Error") ? "bg-red-600 dark:bg-red-700" : "bg-green-600 dark:bg-green-700"}`}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span className="font-medium">{message}</span>
        </div>
      )}
    </div>
  );
}
