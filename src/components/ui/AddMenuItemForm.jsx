import React, { useState } from "react";
import axios from "axios";
import { Upload, DollarSign, Type, FileText, Loader2 } from "lucide-react";

function AddMenuItemForm() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file)); // Create local URL for preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert("Please select an image");
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
  
      // 1. Prepare JSON
      const menuInfo = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
      };
  
      // 2. Wrap in Blob with explicit type
      const menuBlob = new Blob([JSON.stringify(menuInfo)], {
        type: "application/json",
      });
  
      // 3. Append parts
      // ADDITION: Add a dummy filename 'data.json' as the third argument. 
      // This helps Spring Boot recognize it as a valid @RequestPart.
      data.append("menu", menuBlob, "data.json"); 
      data.append("image", formData.image);
  
      // 4. Send the request
      const response = await axios.post("http://localhost:8000/menu/add", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let Axios handle 'Content-Type', do not set it here!
        },
      });
  
      console.log("Success:", response.data);
      alert("Item Added Successfully!");
      
      setFormData({ name: "", price: "", description: "", image: null });
      setPreview(null);
  
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      // Log the actual server error to see if it's a 415 or 400
      alert("Error: " + (err.response?.data?.message || "Check console"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Type size={16} /> Item Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Spicy Paneer Pizza"
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} /> Price (₹)
            </label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} /> Description
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the flavors, ingredients, etc."
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition outline-none resize-none"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Image Upload */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Upload size={16} /> Item Image
          </label>
          
          <div className="flex-1 relative group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center p-10 text-center">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 mb-4">
                  <Upload size={32} />
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Click to upload image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" required />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Saving Item...
              </>
            ) : (
              "Add Item to Menu"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}