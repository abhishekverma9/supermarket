import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const featuresList = [
  "User authentication and role-based access",
  "Product catalog with rich details and filtering",
  "Shopping cart with smooth quantity management",
  "Fast and secure checkout flow",
  "Order tracking for consumers and employees",
  "Employee and admin dashboards with analytics",
  "Chatbot integration for instant support",
  "Secure payment processing",
  "Email notifications for orders and updates",
  "High-quality image upload and media management",
  "Responsive, mobile-first design",
  "Expo-powered mobile app for Android & iOS",
  "Performance-optimized backend with caching",
  "Real-time updates using WebSockets",
];

export default function Features() {
  return (
    <div className="max-w-4xl mx-auto py-14 px-6">
      {/* Title Section */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-[#FF8C00] to-[#FF5E00] bg-clip-text text-transparent"
      >
        Project Features
      </motion.h1>

      {/* Project Overview */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-center text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed text-lg"
      >
        This project is a full-stack e-commerce ecosystem designed with modern technologies, 
        focusing on speed, security, and a seamless user experience. It includes web and mobile 
        interfaces, a robust backend, an intelligent chatbot, and dedicated dashboards for admins 
        and employees.
      </motion.p>

      {/* Features List */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {featuresList.map((feature, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-[#FF8C00]/20 hover:-translate-y-1 transition-all"
          >
            <CheckCircle className="text-[#FF8C00] mt-1" size={22} />
            <span className="text-gray-200 text-[16px] leading-snug">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-14 text-gray-400 text-sm"
      >
        Built with modern frameworks, elegant UI, and scalable architecture.
      </motion.div>
    </div>
  );
}