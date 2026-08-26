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

  // Animated Counter Component
  const AnimatedCounter = ({ value }) => {
    const isCurrency = typeof value === 'string' && value.startsWith('₹');
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 1500;
      if (isNaN(numericValue) || numericValue === 0) {
        setCount(0);
        return;
      }
      const step = numericValue / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);
      return () => clearInterval(timer);
    }, [numericValue]);

    if (isNaN(numericValue)) return <span>{value}</span>;
    return (
      <span>
        {isCurrency ? '₹' : ''}
        {count % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(2).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10 text-center"
      >
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-[#FF4B91] to-[#8A2BE2] drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-[#8A2BE2]/10 pointer-events-none" />

            {/* Icon */}
            <div className="flex items-center justify-between relative z-10">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-[#FF8C00]/30 text-orange-500 shadow-[0_0_10px_rgba(255,140,0,0.3)]">
                {iconMap[s.title]}
              </div>

              <div className="text-right">
                <p className="text-gray-400 text-sm font-medium">{s.title}</p>
                <p className="text-2xl font-bold mt-1 text-[#F5F5F5]">
                  <AnimatedCounter value={s.value} />
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics & Quick Actions Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass rounded-2xl p-6 relative overflow-hidden"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Revenue Overview
          </h3>
          <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-[#12121a]">
            <p className="text-gray-500 flex flex-col items-center gap-3">
              <FaRupeeSign size={32} className="opacity-20" />
              Interactive Analytics Coming Soon
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4B91]"></span>
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Manage Products", icon: <FaBoxes />, link: "/owner/all-products", color: "from-orange-500 to-[#ffa733]" },
              { label: "View Recent Orders", icon: <FaShoppingCart />, link: "/owner/all-orders", color: "from-[#8A2BE2] to-[#a052e6]" },
              { label: "Manage Employees", icon: <FaUsers />, link: "/owner/employees", color: "from-[#FF4B91] to-[#ff7eb1]" },
            ].map((action, i) => (
              <a
                key={i}
                href={action.link}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="font-medium text-gray-200">{action.label}</span>
                </div>
                <span className="text-gray-500 group-hover:text-orange-500 transition-colors">→</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
