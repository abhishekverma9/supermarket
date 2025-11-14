import React, { useEffect, useContext } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCartItems, updateCartItem, removeCartItem } =
    useContext(AuthContext);

  useEffect(() => {
    fetchCartItems(); // fetch cart when page loads
  }, [fetchCartItems]); // Added dependency

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * Number(item.final_price || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-6 md:p-12 flex justify-center items-start">
      <motion.div
        className="w-full max-w-4xl bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-[#FF8C00]">
          Your Cart
        </h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-400 text-lg p-10">
            Your cart is empty.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <motion.div
                  key={item.cart_id}
                  className="bg-[#1e1e1e] rounded-xl shadow-lg border border-[#FF8C00]/20 p-4 flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Product Image */}
                  <img
                    src={item.product_image || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Price: ₹{Number(item.final_price || 0).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateCartItem(item.cart_id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="bg-[#2E2E2E] text-gray-200 p-2 rounded-full hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-2 font-semibold text-lg text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItem(item.cart_id, item.quantity + 1)
                        }
                        className="bg-[#2E2E2E] text-gray-200 p-2 rounded-full hover:bg-[#3a3a3a] transition-colors"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div className="flex flex-col items-end justify-center gap-2">
                    <p className="font-semibold text-lg text-gray-100">
                      ₹{(item.quantity * Number(item.final_price || 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeCartItem(item.cart_id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total Amount Box */}
            <div className="mt-8 p-6 bg-[#1e1e1e] rounded-xl border border-[#FF8C00]/20 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-100">
                Total Amount:
              </span>
              <span className="text-xl font-bold text-[#FF8C00]">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate("/consumer/checkout")}
              className="mt-6 w-full px-4 py-3 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CartPage;