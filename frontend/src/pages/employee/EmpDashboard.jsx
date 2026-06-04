import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaTrash, FaSave, FaEdit, FaTimes, FaBox, FaLayerGroup, FaRupeeSign, FaCalendarAlt, FaTag, FaWarehouse } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { products, setProducts, updateProduct, deleteProduct, formatDate } = useContext(AuthContext);
  const [editStates, setEditStates] = useState({});
  const [imageUrls, setImageUrls] = useState({});

  // Fetch image from Unsplash for each product
  useEffect(() => {
    const fetchImages = async () => {
      const updatedUrls = {};
      for (const p of products) {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(p.name)}&per_page=1&client_id=${
              import.meta.env.VITE_UNSPLASH_API_KEY
            }`
          );
          const data = await response.json();
          updatedUrls[p.product_id] = data.results[0]?.urls?.small || p.product_image;
        } catch {
          updatedUrls[p.product_id] = p.product_image;
        }
      }
      setImageUrls(updatedUrls);
    };
    if (products.length > 0) fetchImages();
  }, [products]);

  // Toggle edit mode
  const handleToggleEdit = (productId) => {
    setEditStates((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Local edit updates
  const handleLocalUpdate = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId
          ? {
              ...p,
              [field]: field === "price" || field === "stock_quantity" ? parseFloat(value) || 0 : value,
            }
          : p
      )
    );
  };

  // Save changes to backend
  const handleSave = (product_id) => {
    const product = products.find((p) => p.product_id === product_id);
    if (!product) return;

    updateProduct(product_id, {
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
    handleToggleEdit(product_id);
  };

  // Delete product
  const handleDelete = (product_id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(product_id);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-extrabold text-orange-500 drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
          Products Inventory
        </h2>
        <p className="text-gray-400 mt-2 text-lg">Manage pricing, stock levels, and product details</p>
      </motion.div>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-12 rounded-2xl border border-[#FF8C00]/30 text-center"
        >
          <FaBox size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-lg">No products available in inventory.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {products.map((p) => {
              const isEdit = editStates[p.product_id] || false;
              const imgSrc = imageUrls[p.product_id] || p.product_image;
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(255,140,0,0.15)" }}
                  className="bg-[#2E2E2E]/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-[#FF8C00]/20 flex flex-col transition-all"
                >
                  <div className="relative">
                    <img src={imgSrc} alt={p.name} className="h-48 w-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-xs bg-black/70 backdrop-blur-md text-gray-200 px-2 py-1 rounded-md border border-white/10 shadow-sm">
                        ID: {p.product_id}
                      </span>
                    </div>
                    {p.discount_value && Number(p.discount_value) > 0 && (
                      <div className="absolute top-3 right-3 text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-md shadow-lg border border-orange-400">
                        {p.discount_value}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-100 mb-2 truncate">{p.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2" title={p.description}>{p.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                        <FaLayerGroup className="text-orange-500 w-4" />
                        <span>{p.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                        <FaCalendarAlt className="text-orange-500 w-4" />
                        <span>Exp: {formatDate(p.exp_date)}</span>
                      </div>
                    </div>

                    <div className={`mb-4 px-3 py-2 rounded-lg border ${stockStatus.bg} ${stockStatus.border}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                        <span className={`text-sm font-bold flex items-center gap-1 ${stockStatus.color}`}>
                          <FaWarehouse size={12} />
                          {stockQuantity} units
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-1 block">Price</label>
                          {isEdit ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                              <input
                                type="number"
                                value={p.price}
                                onChange={(e) => handleLocalUpdate(p.product_id, "price", e.target.value)}
                                className="w-full pl-7 pr-2 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/40 focus:border-[#FF8C00] outline-none transition-colors"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-lg font-bold text-gray-100">
                              <FaRupeeSign className="text-orange-500" size={14} />
                              {Number(p.price).toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-400 mb-1 block">Update Stock</label>
                          {isEdit ? (
                            <input
                              type="number"
                              value={p.stock_quantity}
                              onChange={(e) => handleLocalUpdate(p.product_id, "stock_quantity", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/40 focus:border-[#FF8C00] outline-none transition-colors"
                            />
                          ) : (
                            <div className="flex items-center text-lg font-bold text-gray-100 h-9">
                              {p.stock_quantity}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#FF8C00]/20 flex gap-2">
                        {isEdit ? (
                          <>
                            <button
                              onClick={() => handleSave(p.product_id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-2 rounded-lg font-semibold hover:bg-green-500/30 transition-colors"
                            >
                              <FaSave /> Save
                            </button>
                            <button
                              onClick={() => handleToggleEdit(p.product_id)}
                              className="flex items-center justify-center bg-gray-500/20 text-gray-400 border border-gray-500/40 px-3 py-2 rounded-lg font-semibold hover:bg-gray-500/30 hover:text-white transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleEdit(p.product_id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 px-3 py-2 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.product_id)}
                              className="flex items-center justify-center bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete Product"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;

