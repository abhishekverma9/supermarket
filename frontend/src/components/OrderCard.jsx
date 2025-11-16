import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaShoppingBag,
  FaUser,
  FaMapMarkerAlt,
  FaBox,
  FaCalendarAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaExclamationCircle,
  FaShippingFast,
} from "react-icons/fa";

const OrderCard = ({ order }) => {
  const { formatDate, token, backendUrl } = useContext(AuthContext);
  const [status, setStatus] = useState(order.status);

  const changeStatus = async (newStatus) => {
    try {
      const { data } = await axios.post(
        backendUrl + `/api/employee/status/${order.order_id}`,
        { status: newStatus },
        { headers: { token } }
      );
      if (data.success) {
        setStatus(newStatus);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const delivery = order.delivery || {};

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
      case "Confirmed":
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
          icon: <FaShippingFast />,
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
      case "Cancelled":
        return {
          icon: <FaTimesCircle />,
          bgColor: "bg-red-500/20",
          textColor: "text-red-300",
          borderColor: "border-red-500/30",
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

  const statusInfo = getStatusInfo(status);
  const isEditable = status !== "Delivered" && status !== "Cancelled";

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0px 8px 20px rgba(255, 140, 0, 0.2)",
      }}
      className="bg-[#2E2E2E]/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-2xl border border-[#FF8C00]/30 flex flex-col h-full min-h-[600px] sm:min-h-[700px]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/30">
            <FaShoppingBag className="text-[#FF8C00]" size={20} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-100">
              Order #{order.order_id}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs sm:text-sm">
              <FaCalendarAlt size={12} />
              <span>{formatDate(order.order_date)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge/Dropdown - Enhanced Visibility */}
        {isEditable ? (
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            <label className="text-xs text-gray-400 font-semibold">Change Status:</label>
            <select
              value={status}
              onChange={(e) => changeStatus(e.target.value)}
              className={`w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-3 rounded-lg border-2 font-bold text-sm sm:text-base cursor-pointer transition-all shadow-lg hover:shadow-xl ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} bg-[#1e1e1e] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FF8C00]/50 sm:min-w-[160px]`}
              style={{
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF8C00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '40px'
              }}
            >
              <option value="Pending" className="bg-[#1e1e1e] text-yellow-300">Pending</option>
              <option value="Confirmed" className="bg-[#1e1e1e] text-blue-300">Confirmed</option>
              <option value="Shipped" className="bg-[#1e1e1e] text-indigo-300">Shipped</option>
              <option value="Out for Delivery" className="bg-[#1e1e1e] text-purple-300">Out for Delivery</option>
              <option value="Delivered" className="bg-[#1e1e1e] text-green-300">Delivered</option>
              <option value="Cancelled" className="bg-[#1e1e1e] text-red-300">Cancelled</option>
            </select>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-full border-2 ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} font-bold text-sm sm:text-base shadow-lg`}
          >
            {statusInfo.icon}
            <span>{status}</span>
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="mb-4 sm:mb-6 bg-[#1e1e1e] p-3 sm:p-4 rounded-xl border border-[#FF8C00]/20">
        <h4 className="font-semibold text-sm sm:text-base text-gray-200 mb-2 sm:mb-3 flex items-center gap-2">
          <FaUser className="text-[#FF8C00]" />
          Customer Information
        </h4>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">Name:</span>{" "}
            {order.first_name} {order.last_name}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">Email:</span> {order.email}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-gray-400">Phone:</span> {order.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Delivery Address */}
      {delivery && Object.keys(delivery).length > 0 && (
        <div className="mb-4 sm:mb-6 bg-[#1e1e1e] p-3 sm:p-4 rounded-xl border border-[#FF8C00]/20">
          <h4 className="font-semibold text-sm sm:text-base text-gray-200 mb-2 sm:mb-3 flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#FF8C00]" />
            Delivery Address
          </h4>
          <div className="space-y-1 text-xs sm:text-sm text-gray-300">
            <p>
              <span className="font-semibold text-gray-100">{delivery.receiver_name}</span> - {delivery.phone}
            </p>
            <p>
              {delivery.house_no}, {delivery.street}, {delivery.building}
            </p>
            <p>
              {delivery.city}, {delivery.state} - {delivery.pincode}
            </p>
            {delivery.delivery_instructions && (
              <p className="pt-2 text-gray-400 italic">
                <span className="font-semibold text-gray-300">Instructions:</span>{" "}
                {delivery.delivery_instructions}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Order Items - Fixed height with scroll */}
      <div className="mb-4 sm:mb-6 bg-[#1e1e1e] p-3 sm:p-4 rounded-xl border border-[#FF8C00]/20 flex-1 flex flex-col min-h-[150px] sm:min-h-[200px]">
        <h4 className="font-semibold text-sm sm:text-base text-gray-200 mb-2 sm:mb-3 flex items-center gap-2">
          <FaBox className="text-[#FF8C00]" />
          Order Items ({order.items?.length || 0})
        </h4>
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] sm:max-h-[250px] pr-2 custom-scrollbar">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 bg-[#121212] rounded-lg"
            >
              <div>
                <p className="text-gray-100 font-medium">{item.product_name}</p>
                <p className="text-sm text-gray-400">
                  Quantity: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="text-[#FF8C00] font-semibold">
                ₹{(item.quantity * Number(item.price)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total Amount - Fixed at bottom */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#FF8C00]/20 mt-auto">
        <span className="text-gray-300 font-semibold text-base sm:text-lg">Total Amount:</span>
        <span className="text-xl sm:text-2xl font-bold text-[#FF8C00] flex items-center gap-1">
          <FaRupeeSign size={18} />
          {Number(order.total_amount).toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
};

export default OrderCard;