import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ open, onClose }) {
    const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (isLogin) {
        // ⚡ LOGIN API CALL
        const res = await axios.post("http://localhost:8000/auth/login", {
          username: email,
          password: password,
        });

        console.log("Login success:", res.data);

        // ⭐ SAVE TOKEN PROPERLY
        const token = res.data;
        if (!token) {
          alert("Token missing in response!");
          return;
        }

        localStorage.setItem("token", token);

        // ⭐ Notify AuthContext
        login(token);

        onClose();
        navigate("/menu");
      } else {
        // ⚡ REGISTER API CALL
        const res = await axios.post("http://localhost:8000/auth/register", {
          username: email,
          password: password,
          role: "USER",
        });

        console.log("Registration success:", res.data);
        alert("Registration Successful. Please Login!");

        // Switch to login mode
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 w-96 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg text-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Switch Between Login/Register */}
        <p className="text-center mt-4 text-gray-600">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setIsLogin(false)}
                className="text-yellow-600 font-semibold cursor-pointer"
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setIsLogin(true)}
                className="text-yellow-600 font-semibold cursor-pointer"
              >
                Login
              </span>
            </>
          )}
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
