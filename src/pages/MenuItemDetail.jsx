import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Plus, Minus, Loader2, Utensils, Star } from "lucide-react";
import { getUserFromToken } from "../utils/auth";

const BASE_URL = "http://localhost:8000/menu";

export default function MenuItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        // Loose comparison to handle String vs Number IDs
        const foundItem = data.find((m) => String(m.id) === String(id));
        
        if (foundItem) {
          setItem(foundItem);
          fetchImage(foundItem.id, token);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  const fetchImage = async (itemId, token) => {
    try {
      const imgRes = await fetch(`${BASE_URL}/image/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        setImageSrc(URL.createObjectURL(blob));
      }
    } catch (err) { console.error("Image load failed"); }
  };

  const handleAddToCart = async () => {
    const user = await getUserFromToken();
    if (!user) return alert("Please login first!");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/order/cart/${user.id}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId: item.id, quantity }),
      });
      if (res.ok) alert("Added to cart!");
    } catch (err) { alert("Failed to add"); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  if (!item) return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Dish not found</h2>
      <button onClick={() => navigate("/menu")} className="text-indigo-600 font-bold underline">
        Back to Menu
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-12">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-indigo-600 transition">
          <ArrowLeft size={20} /> Back to Menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div className="rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100 aspect-square">
            {imageSrc ? (
              <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Utensils size={80} />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white uppercase">{item.name}</h1>
            <p className="text-3xl font-black text-indigo-600">₹{item.price}</p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>

            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-white rounded-xl shadow-sm transition">
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-white rounded-xl shadow-sm transition">
                  <Plus size={20} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition shadow-lg"
              >
                <ShoppingCart size={24} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}