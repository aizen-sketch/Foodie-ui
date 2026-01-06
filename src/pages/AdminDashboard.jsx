import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LayoutDashboard, PlusCircle, Utensils, ShoppingBag, 
  LogOut, Settings, ChevronRight, Upload, X, Trash2, Edit, Loader2 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AllOrdersTable from "../pages/AllOrdersTable";

// Constants
const BASE_URL = "http://localhost:8000/menu";
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop";

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
            <p className="text-gray-500 mt-1">Hello, {user?.username || 'Admin'}. Welcome back.</p>
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
          {activeTab === "add" && <AddMenuItemForm onSuccess={() => setActiveTab("manage")} />}
          {activeTab === "manage" && <ManageMenuTable />}
          {activeTab === "orders" && <AllOrdersTable />}
        </section>
      </main>
    </div>
  );
}

// --- HELPER COMPONENT: SECURE IMAGE LOADER ---
function SecureMenuImage({ itemId }) {
  const [imageSrc, setImageSrc] = useState(PLACEHOLDER_IMG);
  const [loadingImg, setLoadingImg] = useState(true);

  useEffect(() => {
    let objectUrl = null;

    const fetchAuthorizedImage = async () => {
      const token = localStorage.getItem("token");
      const url = `${BASE_URL}/image/${itemId}`;

      if (!itemId || !token) {
        setLoadingImg(false);
        return;
      }

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Image not found");

        const imageBlob = await response.blob();
        objectUrl = URL.createObjectURL(imageBlob);
        setImageSrc(objectUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageSrc(PLACEHOLDER_IMG);
      } finally {
        setLoadingImg(false);
      }
    };

    fetchAuthorizedImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [itemId]);

  return (
    <div className="w-full h-full relative bg-gray-100 dark:bg-gray-800">
      {loadingImg && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-300" size={16} />
        </div>
      )}
      <img 
        src={imageSrc} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${loadingImg ? 'opacity-0' : 'opacity-100'}`} 
        alt="Menu Item" 
      />
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
    if (!formData.image) return alert("Please upload an image");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      const menuObj = { name: formData.name, price: Number(formData.price), description: formData.description };
      const menuBlob = new Blob([JSON.stringify(menuObj)], { type: "application/json" });

      data.append("menu", menuBlob, "data.json"); 
      data.append("image", formData.image);

      await axios.post(`${BASE_URL}/add`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Item added successfully!");
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding item");
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
              <button 
                type="button"
                onClick={() => {setPreview(null); setFormData({...formData, image: null})}} 
                className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-xl"
              >
                <X size={18}/>
              </button>
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
          className="mt-6 w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" /> Processing...</> : "Save to Menu"}
        </button>
      </div>
    </form>
  );
}

// --- SUB-COMPONENT: MANAGE MENU TABLE ---
// --- SUB-COMPONENT: MANAGE MENU TABLE ---
function ManageMenuTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Editing
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-900 rounded-[2.5rem]">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-gray-400 font-bold">Loading Menu...</p>
    </div>
  );

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Dish</th>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                      <SecureMenuImage itemId={item.id} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 font-black text-indigo-600">₹{item.price}</td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-indigo-600 transition-all"
                    >
                      <Edit size={18}/>
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)} 
                      className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <EditItemModal 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={fetchMenu} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: EDIT MODAL ---
function EditItemModal({ item, onClose, onUpdate }) {
  // Access user data from AuthContext to get ID and Role
  const { user } = useAuth(); 
  
  const [formData, setFormData] = useState({ 
    name: item.name, 
    price: item.price, 
    description: item.description,
    image: null 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      
      const menuObj = { 
        name: formData.name, 
        price: Number(formData.price), 
        description: formData.description 
      };

      // Wrap JSON in Blob for @RequestPart("menu")
      const menuBlob = new Blob([JSON.stringify(menuObj)], { type: "application/json" });
      data.append("menu", menuBlob); 

      /**
       * IMPORTANT: Your backend @RequestPart("image") is likely mandatory.
       * If the user didn't pick a new image, you might need to send a blank file 
       * or handle the "required=false" on the Java side.
       */
      if (formData.image) {
        data.append("image", formData.image);
      } else {
        // Sending a dummy blob if your Java backend requires the 'image' part to exist
        data.append("image", new Blob(), ""); 
      }

      // API Call to @PostMapping("update/{id}")
      await axios.post(`${BASE_URL}/update/${item.id}`, data, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          "X-User-Id": user?.id || "",        // Maps to @RequestHeader("X-User-Id")
          "X-User-Role": user?.role || ""      // Maps to @RequestHeader("X-User-Role")
        }
      });

      alert("Updated successfully!");
      onUpdate(); 
      onClose();  
    } catch (err) {
      console.error("Update error:", err.response?.data);
      alert(err.response?.data?.message || "Update failed. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-black">Edit Menu Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* ... inputs for name, price, description stay the same ... */}
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Food Name</label>
            <input 
              type="text" required
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none ring-indigo-500 focus:ring-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Price (₹)</label>
            <input 
              type="number" required
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none ring-indigo-500 focus:ring-2"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Description</label>
            <textarea 
              rows="3" required
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none ring-indigo-500 focus:ring-2"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Replace Image</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700"
              onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Stats Components (OverviewStats & StatCard) remain same as before...
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