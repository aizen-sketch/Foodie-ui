import { useEffect, useState } from "react";
import { X, Loader2, AlertTriangle, Minus, Plus } from "lucide-react"; // Import icons
import { getUserFromToken } from "../utils/auth"; // Need this to get user ID for the API call

// Hardcoded Placeholder Image
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=100&h=100&auto=format&fit=crop";

// Note: Assuming the parent Cart.jsx passes an onUpdateQuantity function
// This function must trigger a full cart reload in the parent component.
export default function CartItem({ item, onRemove, onUpdateQuantity }) { 
  // We don't need to fetch menu item details here anymore 
  // because Cart.jsx is now responsible for enriching the 'item' object with 'price', 'name', etc.
  // The 'item' prop should now already contain the necessary details.
  
  // We'll rename menuItem details state to simplify and directly use the item prop,
  // but we'll keep the useEffect hook for demonstration that this item has all fields.
  const [isUpdating, setIsUpdating] = useState(false); 
  
  // Since Cart.jsx now fetches menu details, we don't need the local fetch, 
  // but we can simulate the successful initial load.
  // We will assume 'item' is fully loaded if it has a price.
  const itemIsReady = item.price !== undefined && item.price !== null;

  // --- New: Quantity Update Function ---
  const handleUpdateQuantity = async (newQuantity) => {
    // 1. Calculate the change (delta)
    const delta = newQuantity - item.quantity;

    if (newQuantity < 1) {
        // If the user tries to go below 1, trigger the remove function instead
        onRemove();
        return;
    }

    try {
        setIsUpdating(true);
        const user = await getUserFromToken();
        const token = localStorage.getItem("token");

        // Use the /add endpoint, sending the delta (+1 or -1) in the quantity field.
        // This relies on the backend being configured to handle negative quantities for removal.
        const res = await fetch(`http://localhost:8000/order/cart/${user.id}/add`, { 
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                menuItemId: item.menuItemId,
                // Sending the change (+1 or -1)
                quantity: delta, 
            }),
        });

        if (!res.ok) {
            throw new Error("Failed to update quantity.");
        }

        // Tell the parent component to reload the cart for accurate totals.
        if (onUpdateQuantity) {
             onUpdateQuantity(); 
        }

    } catch (err) {
        console.error("Error updating quantity:", err);
        alert("Failed to update item quantity. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };


  // --- Conditional Renderings ---

  // Simplified loading check since parent (Cart.jsx) handles the main loading
  if (!itemIsReady) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-3" />
        <p className="text-gray-600 dark:text-gray-400">Loading item details...</p>
      </div>
    );
  }


  // --- Main Component Render ---
  
  // Use data directly from the enriched 'item' prop
  const totalPrice = (item.price * item.quantity).toFixed(2);
  const imageSrc = item.imageUrl || PLACEHOLDER_IMG;
  const currentQuantity = item.quantity;
  const itemName = item.name || "Unknown Item";
  const itemPrice = item.price ? item.price.toFixed(2) : 'N/A';


  return (
    <div className={`
      flex items-center justify-between 
      bg-white dark:bg-gray-800 
      p-2 md:p-4 rounded-xl 
      transition duration-200 
      hover:bg-gray-50 dark:hover:bg-gray-700 
      ${isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'}
    `}>

      {/* 1. Image */}
      <img
        src={imageSrc}
        alt={itemName}
        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
      />

      {/* 2. Details (Name & Price) */}
      <div className="flex-1 mx-3 md:mx-4 overflow-hidden">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {itemName}
        </h3>

        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          Price: ₹{itemPrice}
        </p>
      </div>
      
      {/* 3. Quantity Control */}
      <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-200 mx-2">
        
        {/* Decrease Button */}
        <button 
            onClick={() => handleUpdateQuantity(currentQuantity - 1)}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={currentQuantity <= 1 || isUpdating}
        >
            <Minus className="w-4 h-4"/>
        </button>
        
        {/* Quantity Display */}
        <span className="font-bold w-4 text-center">
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-indigo-500"/> : currentQuantity}
        </span>
        
        {/* Increase Button */}
        <button 
            onClick={() => handleUpdateQuantity(currentQuantity + 1)}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={isUpdating}
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
          disabled:opacity-30 disabled:bg-transparent
        "
        disabled={isUpdating}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}