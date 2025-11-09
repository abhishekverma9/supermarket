import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const OrdersPage = () => {
  const { orders } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Your Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          You have no orders yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-xl text-gray-800 dark:text-gray-100">
                  Order #{order.order_id}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Date */}
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                <strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}
              </p>

              {/* Items */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Items:
                </h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  {order.items.map((item) => (
                    <li key={item.order_item_id}>
                      {item.name} x {item.quantity} (₹{item.price})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total Amount */}
              <p className="font-bold text-gray-800 dark:text-gray-100 mb-3">
                Total: ₹{order.total_amount}
              </p>

              {/* Delivery Address */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Delivery Address
                </h4>
                <p><strong>Receiver:</strong> {order.receiver_name}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p>
                  <strong>Address:</strong> {order.house_no}, {order.street}, {order.building}, {order.city}, {order.state} - {order.pincode}
                </p>
                <p><strong>Instructions:</strong> {order.delivery_instructions || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
