import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { 
  ShoppingCart, UserCircle, LogOut, Settings, 
  ListOrdered, Menu, X, LayoutDashboard 
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null); 

  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/");
  };
  
  const handleNavClick = (path) => {
    setMobileOpen(false);
    setShowProfileMenu(false); 
    navigate(path);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (showProfileMenu) setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            <span className="text-yellow-600">The</span> Gilded Spoon
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition duration-150">Home</Link>
            <Link to="/menu" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition duration-150">Menu</Link>
            
            {/* 1. Show About & Contact ONLY if NOT Admin */}
            {!isAdmin && (
              <>
                <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition duration-150">About</Link>
                <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition duration-150">Contact</Link>
              </>
            )}
            
            {/* Admin Panel link */}
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:text-indigo-700 transition duration-150">
                <LayoutDashboard size={18} />
                Admin Panel
              </Link>
            )}

            {/* Icons Section */}
            {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-2">
                    
                    {/* 2. Show Cart ONLY if NOT Admin */}
                    {!isAdmin && (
                      <Link to="/cart" className="relative p-1">
                          <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition" />
                      </Link>
                    )}

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="p-1 rounded-full border-2 border-transparent hover:border-yellow-600 transition"
                        >
                            <UserCircle className="w-7 h-7 text-yellow-600 dark:text-yellow-500" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl py-2 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                                {isAdmin && (
                                  <>
                                    <Link 
                                        to="/admin" 
                                        onClick={() => handleNavClick("/admin")}
                                        className="flex items-center px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 font-black hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Admin Dashboard
                                    </Link>
                                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                  </>
                                )}
                                <Link to="/profile" onClick={() => handleNavClick("/profile")} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <Settings className="w-4 h-4 mr-2" /> My Profile
                                </Link>
                                
                                {/* 3. Show My Orders ONLY if NOT Admin */}
                                {!isAdmin && (
                                  <Link to="/orders" onClick={() => handleNavClick("/orders")} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                      <ListOrdered className="w-4 h-4 mr-2" /> My Orders
                                  </Link>
                                )}
                                
                                <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowLogin(true)} className="px-5 py-2.5 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 shadow-lg shadow-yellow-600/20 transition">
                    Login
                </button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-700 dark:text-gray-300">
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 p-4 space-y-1">
            {isAdmin && (
              <Link to="/admin" onClick={() => handleNavClick("/admin")} className="flex items-center p-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl font-bold mb-2">
                <LayoutDashboard className="mr-3" /> Admin Dashboard
              </Link>
            )}
            <Link to="/" onClick={() => handleNavClick("/")} className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Home</Link>
            <Link to="/menu" onClick={() => handleNavClick("/menu")} className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Menu</Link>
            
            {/* 4. Mobile About & Contact ONLY if NOT Admin */}
            {!isAdmin && (
              <>
                <Link to="/about" onClick={() => handleNavClick("/about")} className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">About</Link>
                <Link to="/contact" onClick={() => handleNavClick("/contact")} className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Contact</Link>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <Link to="/profile" onClick={() => handleNavClick("/profile")} className="block p-3 text-gray-700 dark:text-gray-300">My Profile</Link>
                
                {/* 5. Mobile Orders & Cart ONLY if NOT Admin */}
                {!isAdmin && (
                  <>
                    <Link to="/orders" onClick={() => handleNavClick("/orders")} className="block p-3 text-gray-700 dark:text-gray-300">My Orders</Link>
                    <Link to="/cart" onClick={() => handleNavClick("/cart")} className="block p-3 text-gray-700 dark:text-gray-300">My Cart</Link>
                  </>
                )}
                
                <button onClick={handleLogout} className="w-full p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold text-left mt-2">Logout</button>
              </div>
            ) : (
              <button onClick={() => {setMobileOpen(false); setShowLogin(true);}} className="w-full p-3 bg-yellow-600 text-white rounded-xl font-bold mt-2">Login</button>
            )}
          </div>
        )}
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}