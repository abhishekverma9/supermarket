import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const { cart, checkout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    receiver_name: "",
    phone: "",
    house_no: "",
    street: "",
    building: "",
    city: "",
    state: "",
    pincode: "",
    delivery_instructions: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Ensure final_price is a number
  const numericCart = cart.map((item) => ({
    ...item,
    final_price: Number(item.final_price || item.price || 0),
    quantity: Number(item.quantity || 1),
  }));

  const totalAmount = numericCart.reduce(
    (sum, item) => sum + item.quantity * item.final_price,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    checkout(formData);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-6 md:p-12 flex justify-center items-start">
      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-[#FF8C00]">
          Checkout
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left: Shipping Form */}
          <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30">
            <h3 className="font-semibold text-lg mb-6 text-[#FF8C00]">
              Shipping Information
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                placeholder="Receiver's Name"
                className={inputClass}
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className={inputClass}
                required
              />
              <input
                type="text"
                name="house_no"
                value={formData.house_no}
                onChange={handleChange}
                placeholder="House No."
                className={inputClass}
                required
              />
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street"
                className={inputClass}
                required
              />
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                placeholder="Building / Landmark"
                className={inputClass}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className={inputClass}
                  required
                />
              </div>
              <textarea
                name="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={handleChange}
                placeholder="Delivery Instructions (Optional)"
                className={`${inputClass} min-h-[100px]`}
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30 flex flex-col">
            <h3 className="font-semibold text-lg mb-6 text-[#FF8C00]">
              Order Summary
            </h3>
            <div className="flex-1">
              {numericCart.length > 0 ? (
                numericCart.map((item) => (
                  <div
                    key={item.cart_id}
                    className="flex justify-between mb-2 text-gray-300"
                  >
                    <span className="text-gray-100">
                      {item.name} (x{item.quantity})
                    </span>
                    <span>₹{(item.quantity * item.final_price).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Your cart is empty.</p>
              )}

              {numericCart.length > 0 && (
                <>
                  <hr className="my-4 border-[#FF8C00]/30" />
                  <div className="flex justify-between font-bold text-lg text-gray-100">
                    <span>Total</span>
                    <span className="text-[#FF8C00] text-xl">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Place Order */}
            <button
              type="submit"
              disabled={numericCart.length === 0}
              className="mt-6 w-full px-4 py-3 rounded-lg bg-[#FF8C00] hover:bg-[#ffa733] text-black font-semibold shadow-md transition-transform hover:scale-105 disabled:bg-gray-500 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;