import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#121212] text-white px-6 py-12">
      {/* Background Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF8C00] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-[#FF4B91] opacity-25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-[#8A2BE2] opacity-25 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 flex flex-col gap-6 items-center text-center"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] via-[#FF4B91] to-[#8A2BE2] animate-gradient-x drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]">
          Shop4Ever
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed">
          Discover your next favorite product — smartly, stylishly, and securely.  
          Login to begin your shopping experience.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-8 py-3 text-lg font-semibold text-black bg-[#FF8C00] rounded-xl shadow-lg hover:bg-[#ffa733] transition focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/40"
          >
            Get Started
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/features")}
            className="px-8 py-3 text-lg font-semibold text-[#F5F5F5] bg-[#2E2E2E] rounded-xl shadow-lg hover:bg-[#3a3a3a] border border-[#FF8C00]/50 transition focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/30"
          >
            Explore Features
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Accent Circles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/3 right-10 w-10 h-10 bg-[#FF8C00] rounded-full blur-md"
      ></motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-10 w-8 h-8 bg-[#8A2BE2] rounded-full blur-md"
      ></motion.div>
    </div>
  );
};

export default Home;
