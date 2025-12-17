import React, { useState, useEffect } from "react";
import { ShoppingCart, UtensilsCrossed, ImageOff } from "lucide-react"; 

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";

export default function MenuCard({ item = {}, onAdd = () => {} }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loadingImg, setLoadingImg] = useState(true);

  useEffect(() => {
    const fetchAuthorizedImage = async () => {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8000/menu/image/${item.id}`;

      if (!item.id || !token) {
        setImageSrc(PLACEHOLDER_IMG);
        setLoadingImg(false);
        return;
      }

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Image not found");

        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImageSrc(imageObjectURL);
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageSrc(PLACEHOLDER_IMG);
      } finally {
        setLoadingImg(false);
      }
    };

    fetchAuthorizedImage();

    // Clean up memory when component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [item.id]);

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 w-full max-w-sm mx-auto border border-gray-100 dark:border-gray-700">
      
      {/* IMAGE SECTION */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {/* Featured Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3" /> Featured
          </span>
        </div>

        {loadingImg ? (
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <UtensilsCrossed className="w-8 h-8 text-gray-400" />
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* CONTENT DETAILS */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate mb-2">
          {item.name || "Gourmet Dish"}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 h-12 line-clamp-2 leading-relaxed mb-4">
          {item.description || "Expertly prepared with the finest ingredients."}
        </p>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-tight">Price</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ₹{item.price ? item.price.toFixed(2) : "0.00"}
            </span>
          </div>

          <button
            onClick={() => onAdd(item.id)}
            disabled={!item.id}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/40 active:scale-95 transition-all duration-200 font-bold disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}