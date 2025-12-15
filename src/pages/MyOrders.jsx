import React, { useState, useEffect, useCallback } from 'react';
import { ListOrdered, Calendar, DollarSign, Package, Clock, Repeat, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import { getUserFromToken } from "../utils/auth"; // Utility function to get user info

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8000';
// -------------------------

// Helper component to display the status badge with color (Unchanged)
const StatusBadge = ({ status }) => {
  let colorClass = '';
  const normalizedStatus = status ? status.toLowerCase() : 'unknown';

  switch (normalizedStatus) {
    case 'delivered':
      colorClass = 'bg-green-100 text-green-700 ring-green-500/10';
      break;
    case 'payment successful':
      colorClass = 'bg-green-100 text-green-700 ring-green-500/10';
      break;
    case 'processing':
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-700 ring-yellow-500/10';
      break;
    case 'cancelled':
    case 'rejected':
      colorClass = 'bg-red-100 text-red-700 ring-red-500/10';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-700 ring-gray-500/10';
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
};

// Component for a single order card (Unchanged logic)
const OrderCard = ({ order }) => {
  // We now rely on the fetched data having the detailed item names and prices
  const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const getTotalItemNumeric = () => {
    const itemTotal = order.items.reduce((total, item) => {
      return total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0));
    }, 0);
  
    const finalTotal = (itemTotal * 1.05) + 40;
    
    // Returns a number rounded to two decimal places
    return Math.round(finalTotal * 100) / 100;
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4 hover:shadow-xl transition duration-300">
      
      {/* Header: ID, Date, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 dark:border-gray-700">
        <div className="mb-2 sm:mb-0">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center">
            <ListOrdered className="w-4 h-4 mr-2 text-yellow-600" />
            Order ID: <span className="text-gray-900 dark:text-gray-50 ml-1">{order.id}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" /> Placed on {dateStr} at {timeStr}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body: Items and Total */}
      <div className="space-y-3">
        {/* Item List */}
        <div className="border-b pb-3 dark:border-gray-700">
            {order.items && order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    {/* These fields (name, price) are now populated via the menu fetch */}
                    <span className="truncate max-w-[70%]">{item.name || "Loading..."} <span className="font-semibold text-xs">x{item.quantity}</span></span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
        </div>

        {/* Summary */}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-800 dark:text-gray-100 flex items-center">
            <DollarSign className="w-5 h-5 mr-1 text-yellow-600" />
            Order Total ({itemCount} items)
          </span>
          <span className="text-yellow-700 dark:text-yellow-500">${getTotalItemNumeric()}</span>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="flex justify-start sm:justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
          <Package className="w-4 h-4 mr-2" />
          View Details
        </button>
        {order.status !== 'Cancelled' && (
          <button className="flex items-center px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900 transition">
            <Repeat className="w-4 h-4 mr-2" />
            Order Again
          </button>
        )}
      </div>
    </div>
  );
};


// Main Orders History Component
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useAuth(); // Get token from context

  // Define the main function to load and detail the orders
  const loadOrdersFromBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const user = await getUserFromToken();
      const authToken = token || localStorage.getItem("token"); // Fallback for token

      if (!user || !authToken) {
        setError("Please login to view your order history.");
        setIsLoading(false);
        return;
      }
      
      const userId = user.id;

      // 1. Fetch the user's list of orders
      const ordersRes = await fetch(
        `${API_BASE_URL}/order/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!ordersRes.ok) {
        throw new Error("Failed to load orders. Status: " + ordersRes.status);
      }

      const ordersData = await ordersRes.json();
      
      // 2. Process each order to fetch item details
      const detailedOrdersPromises = ordersData.map(async (order) => {
        // Create an array of promises for fetching details for items in this specific order
        const detailedItemsPromises = order.items.map(async (orderItem) => {
            if (!orderItem.menuItemId) return { ...orderItem, price: 0 }; 
            
            // Fetch menu details for the item
            const menuRes = await fetch(`${API_BASE_URL}/menu/${orderItem.menuItemId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (menuRes.ok) {
                const menuDetails = await menuRes.json();
                return { 
                    ...orderItem, 
                    price: parseFloat(menuDetails.price) || 0,
                    name: menuDetails.name,
                    imageUrl: menuDetails.imageUrl 
                };
            }
            return { ...orderItem, price: 0, name: "Item Not Found" }; 
        });

        // Wait for all item details to resolve for the current order
        const detailedItems = await Promise.all(detailedItemsPromises);
        
        // Return the original order object but with the new detailed items array
        return {
            ...order,
            items: detailedItems,
        };
      });

      // 3. Wait for all orders (with their detailed items) to resolve
      const detailedOrders = await Promise.all(detailedOrdersPromises);
      setOrders(detailedOrders); 

    } catch (err) {
      console.error(err);
      setError("Failed to load orders. " + err.message);
    } finally {
      setIsLoading(false); 
    }
  }, [token]); // Dependency: token is used to authenticate requests

  useEffect(() => {
    loadOrdersFromBackend();
  }, [loadOrdersFromBackend]); // Call the memoized fetch function on component mount

  return (
    <div className="px-4 md:px-10 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header (Unchanged) */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 flex items-center justify-center">
            <ListOrdered className="w-9 h-9 mr-3 text-yellow-600" />
            My Order History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Track your past feasts and reorder your favorites from **The Gilded Spoon**.
          </p>
        </header>

        {/* --- Loading State --- */}
        {isLoading && (
            <div className="text-center p-12 mt-10">
                <Loader2 className="w-10 h-10 mx-auto text-yellow-600 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your delicious orders...</p>
            </div>
        )}
        
        {/* --- Error State --- */}
        {error && !isLoading && (
            <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl shadow-lg mt-10 border border-red-300">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Error</h2>
                <p className="mt-2">{error}</p>
            </div>
        )}

        {/* --- Orders List / Empty State --- */}
        {!isLoading && !error && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          /* Empty State */
          !isLoading && !error && (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-10">
              <Clock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Orders Yet!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                It looks like your order history is empty. Time to treat yourself!
              </p>
              <button className="mt-5 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition">
                View Menu & Order Now
              </button>
            </div>
          )
        )}

      </div>
    </div>
  );
}