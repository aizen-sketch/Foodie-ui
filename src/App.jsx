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

// --- 1. IMPORT ADMIN DASHBOARD ---
import AdminDashboard from "./pages/AdminDashboard";

// --- 2. PROTECTED ROUTE COMPONENT ---
// This checks if the user is logged in and has the ADMIN role
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  
  // 1. If the AuthContext is still decoding the token, show nothing or a spinner
  // This prevents the "unauthorized" redirect from happening too early
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Verifying...</div>;
  }
  
  // 2. ONLY redirect if loading is finished AND the user is definitely not an admin
  if (!token || user?.role !== "ADMIN") {
    console.log("Access denied. Role is:", user?.role);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <div className="min-h-screen pt-0"> 
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} /> 
            
            {/* User Routes (Should ideally be protected too) */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} /> 
            <Route path="/payment-success" element={<PaymentSuccess />} /> 
            <Route path="/orders" element={<MyOrders />} />                
            <Route path="/profile" element={<MyProfile />} />

            {/* --- 3. ADMIN PROTECTED ROUTE --- */}
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Catch-all for 404s */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </Router>
    </AuthProvider>
  );
}