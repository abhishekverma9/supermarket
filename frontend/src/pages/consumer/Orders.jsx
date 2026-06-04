import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaTruck, FaBox, FaShippingFast, FaTimesCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useEffect } from "react";

const OrdersPage = () => {
  const { orders } = useContext(AuthContext);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Animation variants for staggering
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

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function for status badge
  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/20 text-green-300";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300";
      case "Shipped":
        return "bg-blue-500/20 text-blue-300";
      case "Out for Delivery":
        return "bg-purple-500/20 text-purple-300";
      case "Cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  // Tracking steps
  const trackingSteps = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

  const getStepIndex = (status) => {
    if (status === "Cancelled") return -1;
    return trackingSteps.indexOf(status);
  };
  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 md:p-12 flex justify-center items-start">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-orange-500">
          Your Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-400 text-lg p-10">
            You have no orders yet.
          </p>
        ) : (
          <motion.div
            className="flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {orders.map((order,index) => (
              <motion.div
                key={index}
                className="bg-[#2E2E2E]/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0px 8px 20px rgba(255, 140, 0, 0.2)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                  <span className="font-semibold text-xl text-gray-100">
                    Order #{index+1}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium self-start ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Date */}
                <p className="text-sm text-gray-500 mb-4">
                  Placed on: {formatDate(order.order_date)}
                </p>

                {/* Order Tracking Progress */}
                {order.status !== "Cancelled" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      {trackingSteps.map((step, idx) => {
                        const currentIdx = getStepIndex(order.status);
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                isCompleted ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-600'
                              } ${isCurrent ? 'ring-2 ring-green-400/50 ring-offset-2 ring-offset-[#0a0a0f]' : ''}`}>
                                {isCompleted ? <FaCheckCircle size={10} /> : idx + 1}
                              </div>
                              <span className={`text-[9px] mt-1 hidden sm:block ${isCompleted ? 'text-green-400' : 'text-gray-600'}`}>{step}</span>
                            </div>
                            {idx < trackingSteps.length - 1 && (
                              <div className={`flex-1 h-[2px] mx-1 ${idx < currentIdx ? 'bg-green-500' : 'bg-white/10'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Toggle details */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-[#ffa733] transition-colors mb-3"
                >
                  {expandedOrder === index ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  {expandedOrder === index ? "Hide Details" : "View Details"}
                </button>

                {/* Order Date */}
                <p className="text-sm text-gray-400 mb-4">
                  Placed on: {formatDate(order.order_date)}
                </p>

                {expandedOrder === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                  >
                    {/* Items List */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-200 mb-2 text-sm">Items:</h3>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-400 bg-white/5 rounded-lg p-2">
                            <span>{item.name} (x{item.quantity})</span>
                            <span className="text-gray-300">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))} 
                      </div>
                    </div>

                {/* Total Amount */}
                <div className="mt-4 font-bold text-lg text-gray-100 flex justify-between items-center">
                  <span>Total Amount:</span>
                  <span className="text-orange-500 text-xl">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="mt-4 bg-[#1e1e1e] p-4 rounded-xl border border-[#FF8C00]/20 space-y-1">
                  <h4 className="font-semibold text-gray-100 mb-2">
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-300">
                    <strong className="text-gray-100">
                      {order.receiver_name}
                    </strong>
                  </p>
                  <p className="text-sm text-gray-300">{order.phone}</p>
                  <p className="text-sm text-gray-300">
                    {order.house_no}, {order.street}, {order.building}
                  </p>
                  <p className="text-sm text-gray-300">
                    {order.city}, {order.state} - {order.pincode}
                  </p>
                    {order.delivery_instructions && (
                      <p className="text-sm text-gray-400 italic pt-2">
                        "{order.delivery_instructions}"
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OrdersPage;
