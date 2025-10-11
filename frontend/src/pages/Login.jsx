import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { token, setToken, backendUrl, role, setRole } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setIsSubmitting(true)
    try {
      if (mode === 'signup') {
        const { data } = await axios.post(backendUrl + '/api/auth/signup', { first_name: firstName, last_name: lastName, email, password, phone })
        if (data.success) {
          setToken(data.token)
          localStorage.setItem("role", role)
          localStorage.setItem("token", data.token)
          navigate('/consumer')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password, role })
        if (data.success) {
          setToken(data.token)
          localStorage.setItem("token", data.token)
          localStorage.setItem("role", role)
          navigate(`/${role}`)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 shadow-xl">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-rose-500 mb-6">
          {mode === "signup" ? "Sign Up" : "Login"}
        </h1>

        {/* Role Selector */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setRole("owner"); setMode("login"); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${role === "owner" ? "bg-amber-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200"}`}
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => { setRole("employee"); setMode("login"); }}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${role === "employee" ? "bg-amber-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200"}`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => setRole("consumer")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${role === "consumer" ? "bg-amber-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200"}`}
          >
            Consumer
          </button>
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
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100" required
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100" required
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100" required
              />
            </>
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100" required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100" required
          />

          <button disabled={isSubmitting}
            type="submit"
            className={`w-full px-4 py-3 rounded-lg bg-amber-600 ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-700"} text-white font-semibold`}
          >
            {mode === "signup" ? "Sign Up as Consumer" : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {/* Toggle Signup/Login - Only for Consumer */}
        {role === "consumer" && (
          <p className="text-center mt-3 text-sm text-gray-600 dark:text-gray-300">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  disabled={isSubmitting}
                  className={`text-amber-600 font-medium transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:underline"
                    }`}
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
                  disabled={isSubmitting}
                  className={`text-amber-600 font-medium transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:underline"
                    }`}
                >
                  Login
                </button>
              </>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate('/')}
          className={`mt-4 w-full px-4 py-3 rounded-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""} bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100`}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
