import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-wider text-gray-800">
            <span className="text-yellow-600">The</span> Gilded Spoon
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-yellow-600 transition">Home</Link>
            <Link to="/menu" className="text-gray-600 hover:text-yellow-600 transition">Menu</Link>
            <Link to="/about" className="text-gray-600 hover:text-yellow-600 transition">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-yellow-600 transition">Contact</Link>

            {/* Cart Icon */}
            {isAuthenticated && (
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-yellow-600 transition" />
              </Link>
            )}

            {/* Login / Logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  mobileOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700">Home</Link>
              <Link to="/menu" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700">Menu</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700">About</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700">Contact</Link>

              {/* Cart (mobile) */}
              {isAuthenticated && (
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-gray-700 flex items-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Cart
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full mt-2 py-2 bg-red-600 text-white rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogin(true);
                  }}
                  className="w-full mt-2 py-2 bg-yellow-600 text-white rounded-lg"
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
