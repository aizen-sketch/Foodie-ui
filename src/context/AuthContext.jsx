import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Will hold { id, username, role, valid }
  const [authLoading, setAuthLoading] = useState(true);

  // --- FUNCTION TO VALIDATE TOKEN WITH BACKEND ---
  const validateToken = async (tokenValue) => {
    try {
      const res = await axios.get("http://localhost:8000/auth/validate", {
        headers: { Authorization: `Bearer ${tokenValue}` },
      });

      if (res.data.valid) {
        setUser(res.data); // Stores the full object: { id, username, role, valid }
        setToken(tokenValue);
      } else {
        logout(); // Token on server side is invalid
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      logout();
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      validateToken(savedToken);
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = async (tokenValue) => {
    localStorage.setItem("token", tokenValue);
    setToken(tokenValue);
    
    try {
      const res = await axios.get("http://localhost:8000/auth/validate", {
        headers: { Authorization: `Bearer ${tokenValue}` },
      });
  
      if (res.data.valid) {
        setUser(res.data);
        setAuthLoading(false);
        return res.data; // 🔥 CRITICAL: Return the data to the Modal
      }
    } catch (err) {
      logout();
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
      authLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);