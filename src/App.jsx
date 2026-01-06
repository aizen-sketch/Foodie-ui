import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components & Context
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import About from "./pages/About";       
import Contact from "./pages/Contact";
import Payment from "./pages/Payment"; 
import PaymentSuccess from "./pages/PaymentSuccess"; 
import MyOrders from "./pages/MyOrders";             
import MyProfile from "./pages/MyProfile";
import AdminDashboard from "./pages/AdminDashboard";

// --- PROTECTED ROUTE: ADMIN ONLY ---
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Checks for both token presence and the specific ADMIN role
  if (!token || user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// --- PROTECTED ROUTE: ANY LOGGED IN USER ---
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null; 
  return token ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
          <Navbar />

          <main className="flex-grow"> 
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} /> 
              
              {/* Protected User Routes */}
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} /> 
              <Route path="/payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} /> 
              <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />                
              <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />

              {/* Protected Admin Route */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Redirect any unknown routes to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}