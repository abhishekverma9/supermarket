import React, { useEffect, useContext } from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    fetchCartItems,
    updateCartItem,
    removeCartItem,
  } = useContext(AuthContext);

  useEffect(() => {
    fetchCartItems(); // fetch cart when page loads
  }, []);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.final_price,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Your Cart
      </h2>

      {cart.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={item.cart_id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4"
            >
              {/* Product Image */}
              <img
                src={item.product_image || "https://via.placeholder.com/80"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Price: ₹{item.final_price}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      updateCartItem(item.cart_id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded disabled:opacity-50"
                  >
                    <FaMinus />
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartItem(item.cart_id, item.quantity + 1)
                    }
                    className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeCartItem(item.cart_id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <FaTrash />
              </button>
            </div>
          ))}

          {/* Total Amount */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl flex justify-between items-center font-bold">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => navigate("/consumer/checkout")}
            className="mt-4 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
