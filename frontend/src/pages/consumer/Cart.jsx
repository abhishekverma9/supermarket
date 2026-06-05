import React, { useEffect, useContext, useState, useCallback, useRef } from "react";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCartItems, updateCartItem, removeCartItem } =
    useContext(AuthContext);

  const [cartWithImages, setCartWithImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const hasFetched = useRef(false);

  // Fetch image from Unsplash
  const fetchProductImage = useCallback(async (query) => {
    const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${apiKey}`
      );
      const data = await res.json();
      if (data?.results?.length > 0) return data.results[0].urls.small;
      return null;
    } catch {
      return null;
    }
  }, []);

  // Fetch cart items only once on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCartItems();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Load images when cart changes
  useEffect(() => {
    const loadImages = async () => {
      if (cart.length === 0) {
        setCartWithImages([]);
        setImagesLoaded(true);
        return;
      }
      const updated = await Promise.all(
        cart.map(async (item) => {
          const img = await fetchProductImage(item.name);
          return { ...item, product_image: img || item.product_image || "https://via.placeholder.com/80" };
        })
      );
      setCartWithImages(updated);
      setImagesLoaded(true);
    };
    loadImages();
  }, [cart, fetchProductImage]);

  const totalAmount = cartWithImages.reduce(
    (sum, item) => sum + item.quantity * Number(item.final_price || 0),
    0
  );

  const totalSavings = cartWithImages.reduce((sum, item) => {
    const original = Number(item.price || item.final_price || 0);
    const final = Number(item.final_price || 0);
    return sum + (original - final) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] p-4 sm:p-6 md:p-12 flex justify-center items-start">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-500">
            Your Cart
          </h2>
          <button
            onClick={() => navigate("/consumer")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            <FaArrowLeft size={14} />
            Continue Shopping
          </button>
        </div>

        {/* Loading skeleton */}
        {!imagesLoaded ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : cartWithImages.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-[#FF8C00]/20 flex items-center justify-center">
              <FaShoppingBag className="text-orange-500" size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Looks like you haven't added any products yet. Start exploring our collection!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/consumer")}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-lg"
            >
              Browse Products
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex flex-col gap-4">
              {cartWithImages.map((item, idx) => (
                <motion.div
                  key={item.cart_id}
                  className="glass rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {/* Product Image */}
                  <img
                    src={item.product_image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1 w-full sm:w-auto">
                    <h3 className="font-semibold text-base text-gray-100">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      ₹{Number(item.final_price || 0).toFixed(2)} each
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateCartItem(item.cart_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-[#1a1a2e] text-gray-200 flex items-center justify-center hover:bg-[#252540] transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-white/5"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="w-8 text-center font-semibold text-lg text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItem(item.cart_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-[#1a1a2e] text-gray-200 flex items-center justify-center hover:bg-[#252540] transition-colors border border-white/5"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto">
                    <p className="font-bold text-lg text-orange-500">
                      ₹{(item.quantity * Number(item.final_price || 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeCartItem(item.cart_id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-8 glass rounded-xl p-6 space-y-3">
              <h3 className="font-semibold text-gray-200 mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal ({cartWithImages.length} items)</span>
                <span className="text-gray-200">₹{(totalAmount + totalSavings).toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Discount</span>
                  <span className="text-green-400">-₹{totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Delivery</span>
                <span className="text-green-400 font-medium">Free</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-100">Total</span>
                <span className="text-2xl font-bold text-orange-500">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/consumer/checkout")}
              className="mt-6 w-full px-4 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-xl hover:shadow-[0_0_30px_rgba(255,140,0,0.2)] transition-all"
            >
              Proceed to Checkout
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CartPage;
