import axios from "axios";
import React, { useContext, useState, useEffect, useRef } from "react";
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
  const [wrongPasswordAttempted, setWrongPasswordAttempted] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState("email"); // "email", "otp", "reset"
  const [otpTimer, setOtpTimer] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
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
          setWrongPasswordAttempted(false);
          navigate(`/${role}`);
        } else {
          toast.error(data.message);
          setWrongPasswordAttempted(true);
        }
      }
    } catch (error) {
      toast.error(error.message);
      setWrongPasswordAttempted(true);
    }
  };

  // Timer effect for OTP countdown
  useEffect(() => {
    if (forgotPasswordStep === "otp" && otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [forgotPasswordStep, otpTimer]);

  const handleForgotPasswordEmail = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: forgotEmail,
      });
      if (data.success) {
        toast.success("OTP sent to your email");
        setForgotPasswordStep("otp");
        setOtpTimer(60); // Reset timer to 60 seconds
        setCanResend(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: forgotEmail,
        resend: true,
      });
      if (data.success) {
        toast.success("OTP resent to your email");
        setOtpTimer(60); // Reset timer to 60 seconds
        setCanResend(false);
        setOtp(""); // Clear previous OTP input
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email: forgotEmail,
        otp,
      });
      if (data.success) {
        toast.success("OTP verified successfully");
        setForgotPasswordStep("reset");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email: forgotEmail,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success("Password reset successfully");
        setForgotPasswordModal(false);
        setForgotPasswordStep("email");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#FF8C00]/50 via-[#8A2BE2]/60 to-[#121212] text-[#F5F5F5] overflow-hidden">
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
          className="w-28 md:w-52 lg:w-80 mb-4 drop-shadow-[0_0_20px_rgba(255,140,0,0.6)]"
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

            {wrongPasswordAttempted && mode === "login" && (
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-sm text-[#FF8C00] hover:underline text-right w-full"
              >
                Forgot Password?
              </button>
            )}

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

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2E2E2E] rounded-2xl p-8 max-w-md w-full border border-[#FF8C00]/30 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#FF8C00]">Reset Password</h3>
              <button
                onClick={() => {
                  setForgotPasswordModal(false);
                  setForgotPasswordStep("email");
                  setForgotEmail("");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setOtpTimer(60);
                  setCanResend(false);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                  }
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {forgotPasswordStep === "email" && (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Enter your email address to receive an OTP</p>
                <input
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
                <button
                  onClick={handleForgotPasswordEmail}
                  className="w-full px-4 py-3 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105"
                >
                  Send OTP
                </button>
              </div>
            )}

            {forgotPasswordStep === "otp" && (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Enter the OTP sent to {forgotEmail}</p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  placeholder="Enter OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 text-center text-2xl tracking-widest"
                  required
                />
                
                {/* Timer and Resend */}
                <div className="flex items-center justify-between">
                  {!canResend ? (
                    <p className="text-sm text-gray-400">
                      Resend OTP in{" "}
                      <span className="text-[#FF8C00] font-semibold">
                        {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-[#FF8C00] hover:underline font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full px-4 py-3 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105"
                >
                  Verify OTP
                </button>
                <button
                  onClick={() => {
                    setForgotPasswordStep("email");
                    setOtpTimer(60);
                    setCanResend(false);
                    if (timerRef.current) {
                      clearInterval(timerRef.current);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-[#2E2E2E] hover:bg-[#3a3a3a] text-gray-200 border border-[#FF8C00]/40 transition"
                >
                  Back
                </button>
              </div>
            )}

            {forgotPasswordStep === "reset" && (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Enter your new password</p>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                  required
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full px-4 py-3 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => setForgotPasswordStep("otp")}
                  className="w-full px-4 py-3 rounded-lg bg-[#2E2E2E] hover:bg-[#3a3a3a] text-gray-200 border border-[#FF8C00]/40 transition"
                >
                  Back
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
