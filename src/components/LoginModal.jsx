import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, ShieldCheck, X, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth(); // Now using the updated async login from AuthContext
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("USER"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:8000/auth/login", {
          username: email,
          password: password,
        });
  
        const tokenValue = res.data; 
  
        // 1. Wait for validation and get the actual user object back
        const verifiedUser = await login(tokenValue); 
  
        console.log("Verified User Role:", verifiedUser?.role);
  
        // 2. Navigate based on the SERVER'S role, not the state 'role'
        if (verifiedUser?.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/menu");
        }
  
        onClose();
      } 
      // ... rest of code
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl relative border border-gray-100 dark:border-gray-800">
        
        {/* Close Button Outside */}
        <button 
          onClick={onClose} 
          className="absolute -top-12 -right-2 p-2 text-white hover:text-gray-200 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Role Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 m-6 rounded-2xl">
          <button
            onClick={() => setRole("USER")}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${
              role === "USER" ? "bg-white dark:bg-gray-700 text-yellow-600 shadow-sm" : "text-gray-500"
            }`}
          >
            <User className="w-4 h-4 mr-2" /> User
          </button>
          <button
            onClick={() => setRole("ADMIN")}
            className={`flex-1 flex items-center justify-center py-3 rounded-xl font-bold transition-all ${
              role === "ADMIN" ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm" : "text-gray-500"
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Admin
          </button>
        </div>

        <div className="px-8 pb-10">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center transition-all active:scale-95 text-white ${
                role === "ADMIN" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {loading ? "Verifying..." : isLogin ? "Login" : "Register"}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
             <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-gray-500 hover:text-indigo-600">
               {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}