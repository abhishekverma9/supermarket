import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { token, setToken, backendUrl, role, setRole } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/auth/signup`, {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
        });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", "consumer");
          navigate("/consumer");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password,
          role,
        });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", role);
          navigate(`/${role}`);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#FF8C00]/40 via-[#8A2BE2]/50 to-[#121212] text-[#F5F5F5] overflow-hidden">
      {/* Left Brand Section */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-10 md:p-16 relative"
      >
        <img
          src="/logooo.png"
          alt="Shop4Ever Logo"
          className="w-28 md:w-44 lg:w-64 mb-6 drop-shadow-[0_0_20px_rgba(255,140,0,0.6)]"
        />
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] via-[#FF4B91] to-[#8A2BE2] animate-gradient-x drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]">
          Shop4Ever
        </h1>
        <p className="text-lg mt-4 max-w-md text-center text-gray-300">
          Your one-stop platform for smarter shopping, faster checkout, and better deals — every day.
        </p>
      </motion.div>

      {/* Right Form Section */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex items-center justify-center p-6 md:p-12"
      >
        <div className="w-full max-w-md bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#FF8C00]">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h2>

          {/* Role Selector */}
          <div className="flex justify-center gap-3 mb-5">
            {["owner", "employee", "consumer"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setMode(r === "consumer" ? mode : "login");
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  role === r
                    ? "bg-[#FF8C00] text-black shadow-md"
                    : "bg-[#1e1e1e] text-gray-300 hover:bg-[#2e2e2e]"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {role === "consumer" && mode === "signup" && (
              <>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  placeholder="First Name"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
              </>
            )}

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
              required
            />

            <button
              type="submit"
              className="w-full px-4 py-3 mt-2 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105"
            >
              {mode === "signup"
                ? "Sign Up as Consumer"
                : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          {/* Toggle Mode */}
          {role === "consumer" && (
            <p className="text-center mt-4 text-sm text-gray-300">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-[#FF8C00] font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-[#FF8C00] font-medium hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 w-full px-4 py-3 rounded-lg bg-[#2E2E2E] hover:bg-[#3a3a3a] text-gray-200 border border-[#FF8C00]/40 transition"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
