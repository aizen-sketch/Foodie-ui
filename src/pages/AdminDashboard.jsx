import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LayoutDashboard, PlusCircle, Utensils, ShoppingBag, 
  LogOut, Settings, ChevronRight, Upload, X, Trash2, Edit 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "add", label: "Add Menu Item", icon: <PlusCircle size={20} /> },
    { id: "manage", label: "Manage Menu", icon: <Utensils size={20} /> },
    { id: "orders", label: "All Orders", icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-50">
        <div className="p-8">
          <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            ADMIN <span className="text-gray-400">PRO</span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" 
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              }`}
            >
              <div className="flex items-center gap-3 font-bold">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black capitalize tracking-tight">{activeTab.replace("-", " ")}</h1>
            <p className="text-gray-500 mt-1">Hello, {user?.username || 'Admin'}. Welcome to your control panel.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer">
              <Settings className="text-gray-400" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          {activeTab === "overview" && <OverviewStats />}
          {activeTab === "add" && <AddMenuItemForm on处Success={() => setActiveTab("manage")} />}
          {activeTab === "manage" && <ManageMenuTable />}
          {activeTab === "orders" && <div className="p-10 text-center text-gray-400">Orders tracking module coming soon...</div>}
        </section>
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: ADD ITEM FORM ---
function AddMenuItemForm({ onSuccess }) {
  const [formData, setFormData] = useState({ name: "", price: "", description: "", image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/menu/add", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
      alert("Item added successfully!");
      onSuccess?.();
    } catch (err) {
      alert("Error adding item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Food Name</label>
          <input 
            type="text" required
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Price (₹)</label>
          <input 
            type="number" required
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Description</label>
          <textarea 
            required rows="4"
            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      <div className="flex flex-col h-full">
        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Item Image</label>
        <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
          {preview ? (
            <>
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              <button onClick={() => setPreview(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform"><X size={18}/></button>
            </>
          ) : (
            <label className="cursor-pointer text-center p-10">
              <Upload className="mx-auto mb-4 text-indigo-500" size={40} />
              <p className="font-bold text-gray-600">Click to Upload</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
          )}
        </div>
        <button 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? "Adding Item..." : "Save to Menu"}
        </button>
      </div>
    </form>
  );
}

// --- SUB-COMPONENT: MANAGE MENU TABLE ---
function ManageMenuTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:8000/menu/all");
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this dish?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/menu/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(item => item.id !== id));
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="p-6 text-sm font-bold text-gray-400 uppercase">Item</th>
            <th className="p-6 text-sm font-bold text-gray-400 uppercase">Price</th>
            <th className="p-6 text-sm font-bold text-gray-400 uppercase text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden">
                    <img src={`http://localhost:8000/menu/image/${item.id}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-sm text-gray-400 truncate w-48">{item.description}</p>
                  </div>
                </div>
              </td>
              <td className="p-6 font-bold text-indigo-600">₹{item.price}</td>
              <td className="p-6">
                <div className="flex justify-center gap-2">
                  <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"><Edit size={18}/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StatCard title="Total Revenue" value="₹45,200" change="+12%" />
      <StatCard title="New Orders" value="28" change="+5%" />
      <StatCard title="Active Items" value="14" change="Stable" />
    </div>
  );
}

function StatCard({ title, value, change }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">{title}</p>
      <div className="flex justify-between items-end">
        <h3 className="text-4xl font-black">{value}</h3>
        <span className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg text-sm">{change}</span>
      </div>
    </div>
  );
}