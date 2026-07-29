import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FaPlusCircle,
  FaBox,
  FaImage,
  FaTag,
  FaLayerGroup,
  FaRupeeSign,
  FaWarehouse,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";

const AddProduct = () => {
  const { backendUrl, token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expDate, setExpDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock_quantity", stockQuantity);
      formData.append("exp_date", expDate);
      if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/product/add",
        formData
      );

      if (data.success) {
        toast.success(data.message);
        // Reset form
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setStockQuantity("");
        setExpDate("");
        setImage(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all duration-200";

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 flex justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold mb-2 text-orange-500 drop-shadow-[0_0_10px_rgba(255,140,0,0.4)]">
            Add New Product
          </h2>
          <p className="text-gray-400 text-lg">
            Create a new product to add to the inventory
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <FaTag className="text-orange-500" />
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <FaBox className="text-orange-500" />
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className={inputClass}
                required
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaLayerGroup className="text-orange-500" />
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Electronics, Food"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaRupeeSign className="text-orange-500" />
                  Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Stock and Expiry Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaWarehouse className="text-orange-500" />
                  Stock Quantity
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-orange-500" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <FaImage className="text-orange-500" />
                Product Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-[#ffa733] file:cursor-pointer"
                />
                {image && (
                  <p className="mt-2 text-sm text-gray-400">
                    Selected: {image.name}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <><FaSpinner className="animate-spin mr-2 inline" /> Adding Product...</>
              ) : (
                <><FaPlusCircle size={20} /> Add Product</>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AddProduct;
