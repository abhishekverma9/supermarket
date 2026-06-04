import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaBoxes,
  FaRupeeSign,
  FaLayerGroup,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTag,
  FaSpinner,
} from "react-icons/fa";

const OwnerProducts = () => {
  const { products, fetchAllProducts, backendUrl, token } = useContext(AuthContext);

  const [editRow, setEditRow] = useState(null); // product_id being edited
  const [formData, setFormData] = useState({ value: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => Number(p.stock_quantity) < 10).length;
    const outOfStock = products.filter((p) => Number(p.stock_quantity) === 0).length;
    const withDiscount = products.filter((p) => p.discount_value && Number(p.discount_value) > 0).length;

    return { totalProducts, lowStock, outOfStock, withDiscount };
  }, [products]);

  const handleEditClick = (p) => {
    setEditRow(p.product_id);
    setFormData({
      value: p.discount_value || 0,
      description: p.discount_desc || "",
    });
  };

  const handleCancel = () => {
    setEditRow(null);
    setFormData({ value: "", description: "" });
  };

  const handleSave = async (product_Id) => {
    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/update-discount/${product_Id}`,
        { value: formData.value, description: formData.description },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchAllProducts();
        setEditRow(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-6 sm:mb-8"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 text-orange-500 drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
          All Products
        </h2>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Manage products and discounts
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-[#FF8C00]/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(255,140,0,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-100">{stats.totalProducts}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 border border-[#FF8C00]/30 text-orange-500">
              <FaBoxes size={24} />
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
              <p className="text-gray-400 text-sm mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-300">{stats.lowStock}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
              <FaExclamationTriangle size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1C1C1C] to-[#2E2E2E] border border-red-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-red-300">{stats.outOfStock}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
              <FaTimes size={24} />
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
              <p className="text-gray-400 text-sm mb-1">On Discount</p>
              <p className="text-3xl font-bold text-green-300">{stats.withDiscount}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300">
              <FaTag size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-12 rounded-2xl border border-[#FF8C00]/30 text-center"
        >
          <FaBoxes size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg">No products found</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((p) => {
            const isEditing = editRow === p.product_id;
            const stockQuantity = Number(p.stock_quantity);
            const stockStatus =
              stockQuantity === 0
                ? { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Out of Stock" }
                : stockQuantity < 10
                ? { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Low Stock" }
                : { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", label: "In Stock" };

            return (
              <motion.div
                key={p.product_id}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow: "0px 8px 20px rgba(255, 140, 0, 0.2)",
                }}
                className="bg-[#2E2E2E]/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-[#FF8C00]/30 flex flex-col"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                        ID: {p.product_id}
                      </span>
                      {p.discount_value && Number(p.discount_value) > 0 && (
                        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded border border-[#FF8C00]/30">
                          {p.discount_value}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-100 mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <FaLayerGroup size={12} />
                      {p.category}
                    </p>
                  </div>
                </div>

                {/* Stock Status */}
                <div className={`mb-4 px-3 py-2 rounded-lg border ${stockStatus.bg} ${stockStatus.border}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                    <span className={`text-sm font-bold ${stockStatus.color}`}>
                      {stockQuantity} units
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <FaRupeeSign className="text-orange-500" size={18} />
                    <span className="text-2xl font-bold text-gray-100">
                      ₹{Number(p.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Discount Section */}
                <div className="mb-4 space-y-3">
                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Discount (%)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all"
                        placeholder="Enter discount %"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#FF8C00]/20">
                        <span className="text-gray-100 font-semibold">
                          {p.discount_value || 0}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Discount Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Discount Description
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all"
                        placeholder="Enter discount description"
                      />
                    ) : (
                      <div className="px-4 py-2 rounded-lg bg-[#1e1e1e] border border-[#FF8C00]/20 min-h-[42px] flex items-center">
                        <span className="text-gray-300 text-sm">
                          {p.discount_desc || "No offer available"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-[#FF8C00]/20">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleSave(p.product_id)}
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                        className={`flex-1 px-4 py-2 rounded-lg text-green-300 border border-green-500/30 font-semibold flex items-center justify-center gap-2 transition-colors ${
                          isSubmitting ? "bg-green-500/10 opacity-50 cursor-not-allowed" : "bg-green-500/20 hover:bg-green-500/30"
                        }`}
                      >
                        {isSubmitting ? (
                          <><FaSpinner className="animate-spin" /> Saving...</>
                        ) : (
                          <><FaSave size={16} /> Save</>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaTimes size={16} />
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleEditClick(p)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <FaEdit size={16} />
                      Edit Discount
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default OwnerProducts;
