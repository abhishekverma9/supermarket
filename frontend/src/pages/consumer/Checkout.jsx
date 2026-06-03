import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaCheck, FaTruck, FaMoneyBillWave } from "react-icons/fa";

const CheckoutPage = () => {
  const { cart, checkout } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    // Fallback: Reset state after 5 seconds if navigation doesn't happen
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
    }, 5000);
    
    try {
      await checkout(formData);
      // If checkout succeeds, it navigates away, so clearTimeout and state reset not needed
      clearTimeout(timeoutId);
    } catch (error) {
      // Error is already handled in AuthContext, but we need to reset state
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#1e1e1e] text-gray-100 border border-[#FF8C00]/30 focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/40 outline-none transition-all duration-200";

  return (
    <div className="min-h-screen text-[#f0f0f5] p-4 sm:p-6 md:p-12 flex justify-center items-start">
      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-orange-500">
          Checkout
        </h2>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Cart", "Shipping", "Payment", "Confirm"].map((step, idx) => {
            const isActive = idx <= 1;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    idx < 1 ? 'bg-green-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-500'
                  }`}>
                    {idx < 1 ? <FaCheck size={12} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${idx <= 1 ? 'text-orange-500' : 'text-gray-600'}`}>{step}</span>
                </div>
                {idx < 3 && <div className={`w-8 sm:w-12 h-[2px] mt-[-14px] ${idx < 1 ? 'bg-green-500' : 'bg-white/10'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Left: Shipping Form */}
          <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30">
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-orange-500">
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
                disabled={isSubmitting}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className={inputClass}
                required
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="house_no"
                value={formData.house_no}
                onChange={handleChange}
                placeholder="House No."
                className={inputClass}
                required
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street"
                className={inputClass}
                required
                disabled={isSubmitting}
              />
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                placeholder="Building / Landmark"
                className={inputClass}
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className={inputClass}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <textarea
                name="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={handleChange}
                placeholder="Delivery Instructions (Optional)"
                className={`${inputClass} min-h-[100px]`}
                rows="3"
                disabled={isSubmitting}
              ></textarea>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-[#2E2E2E]/70 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-[#FF8C00]/30 flex flex-col">
            <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-orange-500">
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
                  <hr className="my-4 border-white/10" />
                  <div className="flex justify-between font-bold text-lg text-gray-100">
                    <span>Total</span>
                    <span className="text-orange-500 text-xl">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="mt-6">
              <h3 className="font-semibold text-base mb-3 text-orange-500 flex items-center gap-2">
                <FaMoneyBillWave /> Payment Method
              </h3>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                  paymentMethod === 'cod' ? 'bg-orange-500/10 border-[#FF8C00]/40' : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#FF8C00]" />
                  <div>
                    <p className="font-medium text-gray-100">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-not-allowed opacity-50 border bg-white/5 border-white/10`}>
                  <input type="radio" name="payment" value="online" disabled className="accent-[#FF8C00]" />
                  <div>
                    <p className="font-medium text-gray-400">Online Payment</p>
                    <p className="text-xs text-gray-600">Coming soon</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Place Order */}
            <button
              type="submit"
              disabled={numericCart.length === 0 || isSubmitting}
              className="mt-6 w-full px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold shadow-md transition-transform hover:scale-105 disabled:bg-gray-500 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Placing Order...</span>
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
