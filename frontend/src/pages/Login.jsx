import axios from "axios";
import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebook, FaApple, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wrongPasswordAttempted, setWrongPasswordAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState("email"); // "email", "otp", "reset"
  const [otpTimer, setOtpTimer] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for login/signup OTP flow
  const [authStep, setAuthStep] = useState("form"); // "form" or "otp"
  const [authOtp, setAuthOtp] = useState("");
  const [authOtpTimer, setAuthOtpTimer] = useState(60);
  const [canResendAuthOtp, setCanResendAuthOtp] = useState(false);
  const authTimerRef = useRef(null);
  const [selectedRole, setSelectedRole] = useState("owner");
  
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { token, setToken, backendUrl, role, setRole, guestLogin, guestLogout } = useContext(AuthContext);

  const handleSocialClick = () => {
    toast.error("Something went wrong with the social sign-in provider. Please try logging in with email instead.");
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/google`, {
        token: credentialResponse.credential,
        role: selectedRole,
      });

      if (data.success) {
        guestLogout();
        setToken(true);
        localStorage.setItem("role", selectedRole);
        setRole(selectedRole);
        toast.success(data.message || "Login successful!");
        navigate(`/${selectedRole}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google Sign-In failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === "signup") {
        // Send signup OTP
        const { data } = await axios.post(`${backendUrl}/api/auth/send-signup-otp`, {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
        });
        if (data.success) {
          toast.success(data.message || "OTP sent to your email");
          setAuthStep("otp");
          setAuthOtpTimer(60);
          setCanResendAuthOtp(false);
          if (data.otp) {
            // Development mode - show OTP in console
            console.log("OTP (Development):", data.otp);
          }
        } else {
          toast.error(data.message);
        }
      } else {
        // Send login OTP
        const { data } = await axios.post(`${backendUrl}/api/auth/send-login-otp`, {
          email,
          password,
          role: selectedRole,
        });
        if (data.success) {
          toast.success(data.message || "OTP sent to your email");
          setAuthStep("otp");
          setAuthOtpTimer(60);
          setCanResendAuthOtp(false);
          setWrongPasswordAttempted(false);
          if (data.otp) {
            // Development mode - show OTP in console
            console.log("OTP (Development):", data.otp);
          }
        } else {
          toast.error(data.message);
          setWrongPasswordAttempted(true);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setWrongPasswordAttempted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAuthOtp = async () => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/auth/verify-signup-otp`, {
          email,
          otp: authOtp,
        });
        if (data.success) {
          setToken(true);
          localStorage.setItem("role", "consumer");
          guestLogout(); // Clear guest state if previously set
          setToken(data.token);
          toast.success("Account created successfully!");
          navigate("/consumer");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/verify-login-otp`, {
          email,
          otp: authOtp,
        });
        if (data.success) {
          setToken(true);
          localStorage.setItem("role", selectedRole);
          setRole(selectedRole);
          guestLogout(); // Clear guest state
          toast.success("Login successful!");
          navigate(`/${selectedRole}`);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendAuthOtp = async () => {
    if (!canResendAuthOtp || isLoading) return;
    
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { data } = await axios.post(`${backendUrl}/api/auth/send-signup-otp`, {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
        });
        if (data.success) {
          toast.success("OTP resent to your email");
          setAuthOtpTimer(60);
          setCanResendAuthOtp(false);
          if (data.otp) {
            console.log("OTP (Development):", data.otp);
          }
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/send-login-otp`, {
          email,
          password,
          role: selectedRole,
        });
        if (data.success) {
          toast.success("OTP resent to your email");
          setAuthOtpTimer(60);
          setCanResendAuthOtp(false);
          if (data.otp) {
            console.log("OTP (Development):", data.otp);
          }
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect for forgot password OTP countdown
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

  // Timer effect for login/signup OTP countdown
  useEffect(() => {
    if (authStep === "otp" && authOtpTimer > 0) {
      authTimerRef.current = setInterval(() => {
        setAuthOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendAuthOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (authTimerRef.current) {
        clearInterval(authTimerRef.current);
        authTimerRef.current = null;
      }
    }

    return () => {
      if (authTimerRef.current) {
        clearInterval(authTimerRef.current);
      }
    };
  }, [authStep, authOtpTimer]);

  const handleForgotPasswordEmail = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: forgotEmail,
        role: selectedRole,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: forgotEmail,
        role: selectedRole,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email: forgotEmail,
        role: selectedRole,
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col md:flex-row bg-[#0a0a0f] text-[#f0f0f5] overflow-hidden">
      {/* Background blobs to match Home page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-500 opacity-[0.07] rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-[#FF4B91] opacity-[0.06] rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#8A2BE2] opacity-[0.06] rounded-full blur-[120px] animate-float" />
      </div>

      {/* Left Brand Section */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 relative"
      >
        <img
          src="/logooo.png"
          alt="Shop4Ever Logo"
          className="w-20 sm:w-28 md:w-52 lg:w-80 mb-4 drop-shadow-[0_0_20px_rgba(255,140,0,0.6)]"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-[#FF4B91] to-[#8A2BE2] animate-gradient-x drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]">
          Shop4Ever
        </h1>
        <p className="text-sm sm:text-base md:text-lg mt-4 max-w-md text-center text-gray-300 px-4">
          Your one-stop platform for smarter shopping, faster checkout, and better deals — every day.
        </p>
      </motion.div>

      {/* Right Form Section */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12"
      >
        <div className="w-full max-w-md glass p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-orange-500">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h2>

          {/* Role Selector */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            {["owner", "employee", "consumer"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRole(r);
                  setMode(r === "consumer" ? mode : "login");
                  setAuthStep("form");
                  setAuthOtp("");
                }}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  selectedRole === r
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-[#1e1e1e] text-gray-300 hover:bg-[#2e2e2e]"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* OTP Step */}
          {authStep === "otp" ? (
            <div className="space-y-4">
              <p className="text-gray-300 text-center mb-4">
                Enter the OTP sent to <span className="font-semibold text-orange-500">{email}</span>
              </p>
              <input
                value={authOtp}
                onChange={(e) => setAuthOtp(e.target.value)}
                type="text"
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 text-center text-2xl tracking-widest"
                required
              />
              
              {/* Timer and Resend */}
              <div className="flex items-center justify-between">
                {!canResendAuthOtp ? (
                  <p className="text-sm text-gray-400">
                    Resend OTP in{" "}
                    <span className="text-orange-500 font-semibold">
                      {Math.floor(authOtpTimer / 60)}:{(authOtpTimer % 60).toString().padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendAuthOtp}
                    className="text-sm text-orange-500 hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyAuthOtp}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-xl transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(255,140,0,0.3)] hover:scale-[1.02]'}`}
              >
                {isLoading ? <><FaSpinner className="animate-spin inline mr-2" /> Verifying...</> : "Verify OTP"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthStep("form");
                  setAuthOtp("");
                  setAuthOtpTimer(60);
                  setCanResendAuthOtp(false);
                  if (authTimerRef.current) {
                    clearInterval(authTimerRef.current);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg bg-[#2E2E2E] hover:bg-[#3a3a3a] text-gray-200 border border-[#FF8C00]/40 transition"
              >
                Change Email
              </button>
            </div>
          ) : (
            /* Form Step */
            <>
              <form className="space-y-3" onSubmit={handleSubmit}>
                {selectedRole === "consumer" && mode === "signup" && (
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
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {/* Password Strength Indicator (signup only) */}
                {mode === "signup" && password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = (password.length >= 6 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
                        return <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= strength ? colors[strength - 1] : 'bg-gray-700'}`} />;
                      })}
                    </div>
                    <p className="text-xs text-gray-500">Use uppercase, numbers & symbols for stronger password</p>
                  </div>
                )}

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(true)}
                    className="text-sm text-orange-500 hover:underline text-right w-full"
                  >
                    Forgot Password?
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-xl transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(255,140,0,0.3)] hover:scale-[1.02]'}`}
                >
                  {isLoading ? (
                    <><FaSpinner className="animate-spin inline mr-2" /> Loading...</>
                  ) : mode === "signup"
                    ? "Sign Up as Consumer"
                    : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                </button>
              </form>

              {/* Social Logins */}
              <div className="mt-5">
                <div className="relative flex items-center justify-center my-3 mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600/40"></div>
                  </div>
                  <span className="relative px-3 bg-[#242424] text-xs text-gray-400 uppercase">
                    Or continue with
                  </span>
                </div>

                <div className="flex justify-center w-full">
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => {
                        toast.error("Google Sign-In was unsuccessful. Try again.");
                      }}
                      theme="filled_black"
                      size="large"
                      shape="pill"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toast.error(
                          "Google Client ID is not configured. Please define VITE_GOOGLE_CLIENT_ID in your frontend .env file.",
                          { autoClose: 5000 }
                        );
                      }}
                      className="flex items-center justify-center gap-3 px-6 py-2.5 w-full max-w-[250px] rounded-full bg-[#1b1b1b] border border-gray-600 hover:bg-[#282828] text-sm font-semibold transition"
                    >
                      <FaGoogle className="text-red-500 text-lg" />
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Toggle Mode */}
          {selectedRole === "consumer" && authStep === "form" && (
            <p className="text-center mt-4 text-sm text-gray-300">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setAuthStep("form");
                      setAuthOtp("");
                    }}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setAuthStep("form");
                      setAuthOtp("");
                    }}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          )}

          {/* Guest Login Divider */}
          {authStep === "form" && (
            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF8C00]/40 to-transparent"></div>
              <span className="text-xs text-gray-500 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF8C00]/40 to-transparent"></div>
            </div>
          )}

          {/* Continue as Guest Button */}
          {authStep === "form" && (
            <button
              type="button"
              onClick={() => guestLogin()}
              className="mt-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#8A2BE2]/30 to-[#FF4B91]/30 hover:from-[#8A2BE2]/50 hover:to-[#FF4B91]/50 text-gray-200 border border-[#8A2BE2]/40 hover:border-[#8A2BE2]/70 font-medium shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Continue as Guest
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full px-4 py-3 rounded-lg bg-[#2E2E2E] hover:bg-[#3a3a3a] text-gray-200 border border-[#FF8C00]/40 transition"
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
            className="bg-[#2E2E2E] rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-[#FF8C00]/30 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-orange-500">Reset Password</h3>
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
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold shadow-md transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-400 hover:scale-105'}`}
                >
                  {isLoading ? <><FaSpinner className="animate-spin inline mr-2" /> Sending...</> : "Send OTP"}
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
                      <span className="text-orange-500 font-semibold">
                        {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-orange-500 hover:underline font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold shadow-md transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-400 hover:scale-105'}`}
                >
                  {isLoading ? <><FaSpinner className="animate-spin inline mr-2" /> Verifying...</> : "Verify OTP"}
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
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors" tabIndex={-1}>
                    {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors" tabIndex={-1}>
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg bg-orange-500 text-white font-semibold shadow-md transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-400 hover:scale-105'}`}
                >
                  {isLoading ? <><FaSpinner className="animate-spin inline mr-2" /> Resetting...</> : "Reset Password"}
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
