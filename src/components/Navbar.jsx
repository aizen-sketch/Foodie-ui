import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, UserCircle, LogOut, Settings, ListOrdered, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // 1. Create a ref to attach to the profile dropdown container
  const profileRef = useRef(null); 

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/");
  };
  
  // Closes both mobile and desktop profile menu before navigating
  const handleNavClick = (path) => {
    setMobileOpen(false);
    setShowProfileMenu(false); 
    navigate(path);
  }

  // 2. useEffect for handling clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside the profile menu reference
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        if (showProfileMenu) {
            setShowProfileMenu(false);
        }
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <>
      {/* Sticky Header with Dark Mode */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/90 dark:shadow-xl dark:shadow-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            <span className="text-yellow-600">The</span> Gilded Spoon
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 transition duration-150">Home</Link>
            <Link to="/menu" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 transition duration-150">Menu</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 transition duration-150">About</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 transition duration-150">Contact</Link>

            {/* Icons Section */}
            {isAuthenticated ? (
                <div className="flex items-center space-x-4 ml-2">
                    {/* Cart Icon */}
                    <Link to="/cart" className="relative p-1">
                        <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 transition" />
                    </Link>

                    {/* Profile Icon and Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:focus:ring-yellow-500/70"
                        >
                            <UserCircle className="w-7 h-7 text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400 transition" />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl py-1 border border-gray-100 dark:border-gray-700 animate-fade-in origin-top-right">
                                <Link 
                                    to="/profile" 
                                    onClick={() => handleNavClick("/profile")}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700/50 hover:text-yellow-600 transition"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    My Profile
                                </Link>
                                <Link 
                                    to="/orders" 
                                    onClick={() => handleNavClick("/orders")}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-700/50 hover:text-yellow-600 transition"
                                >
                                    <ListOrdered className="w-4 h-4 mr-2" />
                                    My Orders
                                </Link>
                                <div className="border-t my-1 dark:border-gray-700"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:text-red-400 text-left transition"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Login Button (when not authenticated)
                <button
                    onClick={() => setShowLogin(true)}
                    className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-xl font-semibold shadow-md shadow-yellow-500/50 hover:bg-yellow-700 transition duration-300"
                >
                    Login
                </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileOpen ? (
                <X className="w-6 h-6" />
            ) : (
                <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Content */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <div className="px-4 py-3 space-y-1">
              <Link to="/" onClick={() => handleNavClick("/")} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition">Home</Link>
              <Link to="/menu" onClick={() => handleNavClick("/menu")} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition">Menu</Link>
              <Link to="/about" onClick={() => handleNavClick("/about")} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition">About</Link>
              <Link to="/contact" onClick={() => handleNavClick("/contact")} className="block py-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition">Contact</Link>

              {/* Authenticated Mobile Links */}
              {isAuthenticated && (
                <>
                    <Link
                        to="/profile"
                        onClick={() => handleNavClick("/profile")}
                        className="block py-2 text-gray-700 dark:text-gray-300 flex items-center hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition"
                    >
                        <Settings className="w-5 h-5 mr-2" /> Profile
                    </Link>
                    <Link
                        to="/orders"
                        onClick={() => handleNavClick("/orders")}
                        className="block py-2 text-gray-700 dark:text-gray-300 flex items-center hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition"
                    >
                        <ListOrdered className="w-5 h-5 mr-2" /> Orders
                    </Link>
                    <Link
                        to="/cart"
                        onClick={() => handleNavClick("/cart")}
                        className="block py-2 text-gray-700 dark:text-gray-300 flex items-center hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" /> Cart
                    </Link>
                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            handleLogout();
                        }}
                        className="w-full mt-3 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </>
              )}
              
              {/* Login Button (mobile - when not authenticated) */}
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogin(true);
                  }}
                  className="w-full mt-3 py-2 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}