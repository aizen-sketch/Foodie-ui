import { useEffect, useState } from "react";
import { X, Loader2, AlertTriangle, Minus, Plus } from "lucide-react"; // Import icons

// Hardcoded Placeholder Image
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=100&h=100&auto=format&fit=crop";

export default function CartItem({ item, onRemove }) {
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItemDetails();
  }, []);

  const loadMenuItemDetails = async () => {
    try {
      // Skip loading if necessary data (menuItemId) is missing
      if (!item || !item.menuItemId) {
          throw new Error("Missing item ID.");
      }
      
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/menu/${item.menuItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load menu item details from server.");

      const data = await res.json();
      setMenuItem(data);

    } catch (err) {
      console.error("Failed to load menu item", err);
    } finally {
      setLoading(false);
    }
  };
  
  // NOTE: You would typically implement updateQuantity here, 
  // which would call a backend endpoint to change the quantity 
  // and then refresh the cart data in the parent component (Cart.jsx).
  // const updateQuantity = (newQuantity) => { /* API call here */ };


  // --- Conditional Renderings ---

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-3" />
        <p className="text-gray-600 dark:text-gray-400">Loading item details...</p>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300">
        <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700 dark:text-red-300">Item details unavailable.</p>
        </div>
        <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition"
        >
             <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // --- Main Component Render ---
  
  const totalPrice = (menuItem.price * item.quantity).toFixed(2);
  const imageSrc = menuItem.imageUrl || PLACEHOLDER_IMG;

  return (
    <div className="
      flex items-center justify-between 
      bg-white dark:bg-gray-800 
      p-2 md:p-4 rounded-xl 
      transition duration-200 
      hover:bg-gray-50 dark:hover:bg-gray-700 
    ">

      {/* 1. Image */}
      <img
        src={imageSrc}
        alt={menuItem.name}
        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
      />

      {/* 2. Details (Name & Price) */}
      <div className="flex-1 mx-3 md:mx-4 overflow-hidden">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {menuItem.name}
        </h3>

        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          Price: ₹{menuItem.price ? menuItem.price.toFixed(2) : 'N/A'}
        </p>
      </div>
      
      {/* 3. Quantity Control (Placeholder for future feature) */}
      <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200 mx-2">
        {/* Placeholder buttons for quantity update */}
        <button 
            // onClick={() => updateQuantity(item.quantity - 1)}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            disabled={item.quantity <= 1}
        >
            <Minus className="w-4 h-4"/>
        </button>
        <span className="font-bold w-4 text-center">{item.quantity}</span>
        <button 
            // onClick={() => updateQuantity(item.quantity + 1)}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
            <Plus className="w-4 h-4"/>
        </button>
      </div>
      
      {/* 4. Total Price for Item */}
      <div className="hidden sm:block font-bold text-lg text-indigo-600 dark:text-indigo-400 w-24 text-right">
        ₹{totalPrice}
      </div>


      {/* 5. Remove button (Icon only) */}
      <button
        onClick={onRemove}
        className="
          ml-4 p-2 rounded-full 
          text-red-500 hover:text-white 
          hover:bg-red-500 
          transition duration-200 
          ring-1 ring-red-500/50 
        "
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}