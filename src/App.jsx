import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components & Context
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import About from "./pages/About";       
import Contact from "./pages/Contact";

// NEW and UPDATED Pages
import Payment from "./pages/Payment"; 
import PaymentSuccess from "./pages/PaymentSuccess"; 
import MyOrders from "./pages/MyOrders";             
import MyProfile from "./pages/MyProfile";          // <-- 1. IMPORT MyProfile Page


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <div className="min-h-screen pt-0"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} /> 
            
            {/* Payment Flow Routes */}
            <Route path="/payment" element={<Payment />} /> 
            <Route path="/payment-success" element={<PaymentSuccess />} /> 

            {/* User Profile Routes */}
            <Route path="/orders" element={<MyOrders />} />                
            <Route path="/profile" element={<MyProfile />} />              {/* <-- 2. ADD My Profile Route */}
          </Routes>
        </div>

        <Footer />
      </Router>
    </AuthProvider>
  );
}