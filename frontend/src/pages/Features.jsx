import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingBag, FaShieldAlt, FaChartLine, FaRobot,
  FaTruck, FaMobileAlt, FaArrowLeft, FaEnvelope,
  FaImage, FaBolt, FaCheckCircle, FaCog,
  FaDatabase, FaLock
} from "react-icons/fa";

const featuresList = [
  { icon: <FaShieldAlt />, text: "User authentication and role-based access" },
  { icon: <FaShoppingBag />, text: "Product catalog with rich details and filtering" },
  { icon: <FaShoppingBag />, text: "Shopping cart with smooth quantity management" },
  { icon: <FaBolt />, text: "Fast and secure checkout flow" },
  { icon: <FaTruck />, text: "Order tracking for consumers and employees" },
  { icon: <FaChartLine />, text: "Employee and admin dashboards with analytics" },
  { icon: <FaRobot />, text: "AI chatbot integration for instant support" },
  { icon: <FaLock />, text: "OTP-based secure payment verification" },
  { icon: <FaEnvelope />, text: "Email notifications for orders and updates" },
  { icon: <FaImage />, text: "Dynamic product images via Unsplash API" },
  { icon: <FaMobileAlt />, text: "Responsive, mobile-first design" },
  { icon: <FaMobileAlt />, text: "Expo-powered mobile app for Android & iOS" },
  { icon: <FaDatabase />, text: "MySQL-backed persistent storage" },
  { icon: <FaCog />, text: "Real-time search and product filtering" },
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      {/* Mini Nav */}
      <nav className="glass border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logooo.png" alt="Shop4Ever" className="w-9 h-9 rounded-full border border-[#FF8C00]/40" />
            <span className="text-lg font-extrabold text-gradient">Shop4Ever</span>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors">
            <FaArrowLeft size={14} /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-16 px-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gradient"
        >
          Project Features
        </motion.h1>

        {/* Overview */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed text-lg"
        >
          A full-stack e-commerce ecosystem designed with modern technologies,
          focusing on speed, security, and a seamless user experience.
        </motion.p>

        {/* Features Grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuresList.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-start gap-4 p-5 rounded-2xl glass hover:border-[#FF8C00]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-[#FF8C00]/20 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="text-gray-200 text-[15px] leading-snug pt-2">{feature.text}</span>
            </motion.li>
          ))}
        </ul>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16 text-gray-600 text-sm"
        >
          Built with React, Node.js, MySQL & modern frameworks
        </motion.div>
      </div>
    </div>
  );
}
