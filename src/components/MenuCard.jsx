import React from "react";
// Import a professional shopping cart icon
import { ShoppingCart } from "lucide-react"; 

// Hardcoded Placeholder Image
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=160&auto=format&fit=crop";

export default function MenuCard({ item = {}, onAdd = () => {} }) {
  // Use the item's image if available, otherwise use the placeholder
  const imageSrc = item.img || PLACEHOLDER_IMG; 
  
  return (
    // Card Container: Dark mode compatible, elevated shadow, rounded corners
    <div className="
      bg-white dark:bg-gray-800 
      rounded-xl shadow-2xl hover:shadow-indigo-500/30 
      overflow-hidden transform hover:scale-[1.02] 
      transition-all duration-300 w-full max-w-sm mx-auto 
      border border-gray-100 dark:border-gray-700
    ">
      
      {/* IMAGE */}
      <div className="h-48 w-full overflow-hidden">
        <img
          src={imageSrc} // Use the image source
          alt={item.name}
          className="w-full h-full object-cover transition duration-300 group-hover:opacity-90"
          // Adding a small gradient overlay for a polished look (via pseudo-elements or an extra div if necessary)
        />
      </div>

      {/* DETAILS */}
      <div className="p-5">
        
        {/* Title */}
        <h3 className="
          text-xl font-bold mb-2 
          text-gray-900 dark:text-gray-50 
          truncate
        ">
          {item.name || "Delicious Item Name"}
        </h3>

        {/* Description */}
        <p className="
          text-sm mb-4 h-12 overflow-hidden 
          text-gray-600 dark:text-gray-400
        ">
          {item.description || "A brief and appetizing description of this fantastic item."}
        </p>
        
        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>


        {/* PRICE + BUTTON */}
        <div className="flex items-center justify-between">
          
          {/* Price */}
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ₹{item.price ? item.price.toFixed(2) : "0.00"}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAdd(item.id)}
            className="
              flex items-center space-x-1
              bg-indigo-600 text-white 
              px-4 py-2 rounded-full 
              hover:bg-indigo-700 active:bg-indigo-800
              shadow-lg hover:shadow-indigo-500/40
              transition duration-200 font-medium
              disabled:opacity-50
            "
            disabled={!item.id} // Disable if item data is missing
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}