import { useState, useEffect } from "react";
import CartItem from "../components/CartItem";
import { getUserFromToken } from "../utils/auth";
import { ShoppingCart, Loader2, Frown, DollarSign } from "lucide-react"; // Import icons

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Hardcoded delivery fee for summary display
  const DELIVERY_FEE = 40; 

  useEffect(() => {
    loadCartFromBackend();
  }, []);

  // --- Backend Interaction Functions ---

  const loadCartFromBackend = async () => {
    try {
      setLoading(true);
      setError("");

      const user = await getUserFromToken();
      if (!user) {
        setError("Please login to view your cart.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      // 1. Fetch the initial cart structure
      const cartRes = await fetch(
        `http://localhost:8000/order/cart/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!cartRes.ok) {
        throw new Error("Failed to load cart. Status: " + cartRes.status);
      }

      const cartData = await cartRes.json();
      const initialCartItems = Array.isArray(cartData.items) ? cartData.items : cartData;
      
      // 2. Fetch price/details for each item concurrently (Data Enrichment)
      const detailedItemsPromises = initialCartItems.map(async (cartItem) => {
          
          // Skip if the item ID is missing
          if (!cartItem.menuItemId) return { ...cartItem, price: 0 }; 
          
          const menuRes = await fetch(`http://localhost:8000/menu/${cartItem.menuItemId}`, {
              headers: { Authorization: `Bearer ${token}` },
          });

          if (menuRes.ok) {
              const menuDetails = await menuRes.json();
              // Merge item details (name, price, imageUrl) into the cart item object
              return { 
                  ...cartItem, 
                  price: parseFloat(menuDetails.price) || 0, // Ensure price is a number
                  name: menuDetails.name,
                  imageUrl: menuDetails.imageUrl 
              };
          }
          // Fallback if menu lookup fails
          return { ...cartItem, price: 0, name: "Item Not Found" }; 
      });

      const detailedCartItems = await Promise.all(detailedItemsPromises);
      
      // 3. Update state with enriched data
      setCart(detailedCartItems); 

    } catch (err) {
      console.error(err);
      setError("Failed to load cart. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const user = await getUserFromToken();
      const token = localStorage.getItem("token");

      // Call backend to remove from cart
      const res = await fetch(
        `http://localhost:8000/order/cart/${user.id}/remove/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!res.ok) {
        throw new Error("Server failed to remove item.");
      }

      // Update UI by filtering out the removed item
      setCart(cart.filter((item) => item.menuItemId !== itemId));
    } catch (err) {
      console.error(err);
      // Use an alert or a toast for immediate feedback
      alert("Failed to remove item. Please try again.");
    }
  };

  // --- Calculation ---

  const getSubtotal = () =>
    cart.reduce((sum, item) => {
      // Safely parse price and quantity, defaulting to 0 if not a valid number
      // This is still necessary as a safeguard against corrupted API responses
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      
      return sum + (price * quantity);
    }, 0).toFixed(2);
     
  const getTotal = () =>
    (parseFloat(getSubtotal()) + DELIVERY_FEE).toFixed(2);

  const getTaxAmount = () => 
    (parseFloat(getSubtotal()) * 0.05).toFixed(2);

  // --- Render ---
  
  return (
    <div className="
      px-4 md:px-10 py-12 
      bg-gray-100 dark:bg-gray-900 
      min-h-screen transition-all duration-300
    ">

      {/* Header Section */}
      <header className="flex items-center space-x-3 mb-10">
        <ShoppingCart className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-50">
          Your Shopping Cart
        </h1>
      </header>
      
      {/* --- */}

      {/* Loading, Error, or Empty State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mr-2" />
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading cart...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border-2 border-red-300 dark:border-red-600">
          <Frown className="w-10 h-10 text-red-600 dark:text-red-400 mb-4"/>
          <p className="text-xl font-semibold text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
            Your cart is empty.
          </p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Add some delicious items from the menu!
          </p>
        </div>
      ) : (
        /* Cart Content: Items and Summary */
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Cart Items List */}
          <div className="flex-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700">
              Review Items ({cart.length})
            </h2>

            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 gap-6">
              {cart.map((item) => (
                <CartItem
                  key={item.menuItemId}
                  item={item}
                  onRemove={() => removeItem(item.menuItemId)}
                />
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/3 h-fit sticky top-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-700/50">

            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
              Order Summary
            </h2>

            {/* Summary Details */}
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              
              <div className="flex justify-between text-lg">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-semibold">₹{getSubtotal()}</span>
              </div>

              <div className="flex justify-between text-lg">
                <span>Delivery Fee</span>
                <span className="font-semibold">₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-lg">
                <span>Tax (5% assumed)</span>
                <span className="font-semibold">₹{getTaxAmount()}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 my-5 pt-5">
              <div className="flex justify-between text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                <span>Grand Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{getTotal()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={() => alert("Proceeding to Checkout!")}
              className="
                w-full mt-6 
                flex items-center justify-center space-x-2
                bg-indigo-600 text-white 
                py-4 rounded-xl text-lg font-bold 
                shadow-lg shadow-indigo-500/50 
                hover:bg-indigo-700 transition duration-300
              "
            >
              <DollarSign className="w-6 h-6"/>
              <span>Checkout Now</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}