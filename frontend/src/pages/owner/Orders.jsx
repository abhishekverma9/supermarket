import React, { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaExclamationCircle,
} from "react-icons/fa";

const OwnerOrders = () => {
  const { allOrders } = useContext(AuthContext);

  // Filter out cancelled orders
  const validOrders = useMemo(
    () => allOrders.filter((o) => o.status !== "Cancelled"),
    [allOrders]
  );

  // Calculate total income from Delivered orders
  const totalIncome = useMemo(() => {
    return validOrders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [validOrders]);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const pending = validOrders.filter((o) => o.status === "Pending").length;
    const shipped = validOrders.filter((o) => o.status === "Shipped").length;
    const outForDelivery = validOrders.filter((o) => o.status === "Out for Delivery").length;
    const delivered = validOrders.filter((o) => o.status === "Delivered").length;
    const processing = validOrders.filter((o) => o.status === "Processing").length;
    
    return { pending, shipped, outForDelivery, delivered, processing };
  }, [validOrders]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "Pending":
        return {
          icon: <FaClock />,
          bgColor: "bg-yellow-500/20",
          textColor: "text-yellow-300",
          borderColor: "border-yellow-500/30",
        };
      case "Processing":
        return {
          icon: <FaExclamationCircle />,
          bgColor: "bg-blue-500/20",
          textColor: "text-blue-300",
          borderColor: "border-blue-500/30",
        };
      case "Shipped":
        return {
          icon: <FaTruck />,
          bgColor: "bg-indigo-500/20",
          textColor: "text-indigo-300",
          borderColor: "border-indigo-500/30",
        };
      case "Out for Delivery":
        return {
          icon: <FaTruck />,
          bgColor: "bg-purple-500/20",
          textColor: "text-purple-300",
          borderColor: "border-purple-500/30",
        };
      case "Delivered":
        return {
          icon: <FaCheckCircle />,
          bgColor: "bg-green-500/20",
          textColor: "text-green-300",
          borderColor: "border-green-500/30",
        };
      default:
        return {
          icon: <FaBox />,
          bgColor: "bg-gray-500/20",
          textColor: "text-gray-300",
          borderColor: "border-gray-500/30",
        };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-[#FF8C00]/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(255,140,0,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-100">
                {validOrders.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[#FF8C00]">
              <FaShoppingBag size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(255,193,7,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-300">
                {orderStats.pending}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              <FaClock size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Out for Delivery</p>
              <p className="text-3xl font-bold text-purple-300">
                {orderStats.outForDelivery}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <FaTruck size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-green-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Delivered</p>
              <p className="text-3xl font-bold text-green-300">
                {orderStats.delivered}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
              <FaCheckCircle size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-green-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-300">
                ₹{totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
              <FaRupeeSign size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders List */}
      {validOrders.length === 0 ? (
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
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {validOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <motion.div
                key={order.order_id}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0px 8px 20px rgba(255, 140, 0, 0.2)",
                }}
                className="bg-[#2E2E2E]/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30">
                      <FaShoppingBag className="text-[#FF8C00]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-100">
                        Order #{order.order_id}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-400">
                        <FaUser size={14} />
                        <span className="text-sm">Customer ID: {order.consumer_id}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}
                  >
                    {statusInfo.icon}
                    <span className="font-semibold">{order.status}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <FaBox className="text-[#FF8C00]" />
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#1e1e1e] p-3 rounded-lg border border-[#FF8C00]/20"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-100 font-medium">
                              {item.product_name || item.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              Quantity: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-[#FF8C00] font-semibold">
                            ₹{(item.quantity * Number(item.price)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#FF8C00]/20">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendarAlt className="text-[#FF8C00]" />
                    <span className="text-sm">
                      {formatDate(order.order_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-[#FF8C00]">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default OwnerOrders;