import React, { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import OrderCard from "../../components/OrderCard";
import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaExclamationCircle,
} from "react-icons/fa";

const AllOrders = () => {
  const { allOrders } = useContext(AuthContext);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const pending = allOrders.filter((o) => o.status === "Pending").length;
    const confirmed = allOrders.filter((o) => o.status === "Confirmed").length;
    const shipped = allOrders.filter((o) => o.status === "Shipped").length;
    const delivered = allOrders.filter((o) => o.status === "Delivered").length;
    const cancelled = allOrders.filter((o) => o.status === "Cancelled").length;

    return { pending, confirmed, shipped, delivered, cancelled, total: allOrders.length };
  }, [allOrders]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-6 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-extrabold mb-2 text-[#FF8C00] drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
          All Orders
        </h2>
        <p className="text-gray-400 text-lg">
          Manage and track all customer orders
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-[#FF8C00]/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(255,140,0,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00] mb-2">
              <FaShoppingBag size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-100">{orderStats.total}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-yellow-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(255,193,7,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 mb-2">
              <FaClock size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-300">{orderStats.pending}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-blue-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 mb-2">
              <FaExclamationCircle size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-blue-300">{orderStats.confirmed}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-indigo-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-2">
              <FaTruck size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Shipped</p>
            <p className="text-2xl font-bold text-indigo-300">{orderStats.shipped}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-green-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 mb-2">
              <FaCheckCircle size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-300">{orderStats.delivered}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-red-500/30 rounded-2xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 mb-2">
              <FaExclamationCircle size={20} />
            </div>
            <p className="text-gray-400 text-xs mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-300">{orderStats.cancelled}</p>
          </div>
        </motion.div>
      </div>

      {/* Orders List */}
      {allOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-12 rounded-2xl border border-[#FF8C00]/30 text-center"
        >
          <FaShoppingBag size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg">No orders found</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {allOrders.map((order, index) => (
            <motion.div
              key={order.order_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <OrderCard order={order} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AllOrders;
