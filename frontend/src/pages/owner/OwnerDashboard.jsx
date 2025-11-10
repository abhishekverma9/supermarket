import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaClock,
  FaRupeeSign,
  FaExclamationTriangle,
  FaBoxes,
  FaUsers,
  FaUserTie,
  FaWallet,
} from "react-icons/fa";

const iconMap = {
  "Total Orders": <FaShoppingCart size={26} />,
  "Pending Orders": <FaClock size={26} />,
  "Total Revenue": <FaRupeeSign size={26} />,
  "Low Stock Products": <FaExclamationTriangle size={26} />,
  "Total Products": <FaBoxes size={26} />,
  "Total Employees": <FaUserTie size={26} />,
  "Total Salary of Employees": <FaWallet size={26} />,
  "Total Customers": <FaUsers size={26} />,
};

const OwnerDashboard = () => {
  const { backendUrl, token, role } = useContext(AuthContext);
  const [stats, setStats] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { token },
      });

      if (data.success) {
        const arr = [
          { title: "Total Orders", value: data.stats.totalOrders },
          { title: "Pending Orders", value: data.stats.pendingOrders },
          { title: "Total Revenue", value: `₹${data.stats.totalRevenue}` },
          { title: "Low Stock Products", value: data.stats.lowStockProducts },
          { title: "Total Products", value: data.stats.totalProducts },
          { title: "Total Employees", value: data.stats.totalEmployees },
          { title: "Total Salary of Employees", value: `₹${data.stats.totalSalary}` },
          { title: "Total Customers", value: data.stats.totalCustomers },
        ];
        setStats(arr);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && role === "owner") {
      fetchDashboardStats();
    }
  }, [token, role]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10 text-center"
      >
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] via-[#FF4B91] to-[#8A2BE2] drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
          Owner Dashboard
        </h2>
        <p className="text-gray-400 mt-2 text-lg">
          Comprehensive business insights at a glance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {stats.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-[#FF8C00]/30 shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_25px_rgba(255,140,0,0.5)] transition-all"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00]/10 to-[#8A2BE2]/10 pointer-events-none" />

            {/* Icon */}
            <div className="flex items-center justify-between relative z-10">
              <div className="p-3 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.3)]">
                {iconMap[s.title]}
              </div>

              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">{s.title}</p>
                <p className="text-2xl font-bold mt-1 text-[#F5F5F5]">
                  {s.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default OwnerDashboard;
