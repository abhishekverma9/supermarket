import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

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
  const numericCart = cart.map(item => ({
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Checkout
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Shipping Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-100">
            Shipping Information
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              name="receiver_name"
              placeholder="Full Name"
              value={formData.receiver_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="house_no"
              placeholder="House / Apartment No."
              value={formData.house_no}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={formData.street}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="building"
              placeholder="Building"
              value={formData.building}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              name="pincode"
              placeholder="ZIP / Postal Code"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <textarea
              name="delivery_instructions"
              placeholder="Delivery Instructions"
              value={formData.delivery_instructions}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-100">
              Order Summary
            </h3>
            {numericCart.map((item) => (
              <div key={item.product_id} className="flex justify-between mb-2">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{(item.quantity * item.final_price).toFixed(2)}</span>
              </div>
            ))}
            <hr className="my-3 border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order */}
          <button
            type="submit"
            className="mt-6 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
