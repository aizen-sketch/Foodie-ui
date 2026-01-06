import React, { useState, useEffect } from "react"; // Added imports
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function AllOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FIX 1: Cleaned up the URL. 
  // If your endpoint is /orders/all, don't add "/all" again in fetchOrders
  const ORDER_BASE_URL = "http://localhost:8000/order/all"; 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // FIX 2: Simplified the URL call to avoid "all/all"
      const res = await axios.get(ORDER_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure we are setting an array even if data is null
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-gray-400 font-bold">Loading Orders...</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Customer ID</th>
            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
            <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-6">
                <span className="font-mono font-bold text-gray-400">#ORD-{order.id}</span>
              </td>
              <td className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {order.userId}
                  </div>
                  <span className="font-bold">User {order.userId}</span>
                </div>
              </td>
              <td className="p-6">
                <div className="space-y-1">
                  {/* FIX 3: Optional chaining check for items */}
                  {order.items?.map((item, idx) => (
                    <p key={idx} className="text-sm font-medium">
                      <span className="text-indigo-600 font-bold">{item.quantity}x</span> {item.name}
                    </p>
                  ))}
                </div>
              </td>
              <td className="p-6 font-black text-gray-900 dark:text-white">
                ₹{Number(order.totalAmount).toFixed(2)}
              </td>
              <td className="p-6">
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {orders.length === 0 && (
        <div className="p-20 text-center text-gray-400 font-bold">
          No orders found in the system.
        </div>
      )}
    </div>
  );
}

// --- HELPER: STATUS BADGE ---
function OrderStatusBadge({ status }) {
  const isSuccess = status?.toLowerCase().includes("successful");
  const isPending = status?.toLowerCase() === "pending";

  if (isSuccess) {
    return (
      <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-black uppercase tracking-wider">
        Completed
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-black uppercase tracking-wider">
        Pending
      </span>
    );
  }

  return (
    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-wider">
      {status}
    </span>
  );
}