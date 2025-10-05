import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const OrderCard = ({ order }) => {
  const { formatDate, token, backendUrl } = useContext(AuthContext);
  const [status, setStatus] = useState(order.status);

  const changeStatus = async (newStatus) => {
    try {
      const { data } = await axios.post(
        backendUrl + `/api/employee/status/${order.order_id}`,
        { status: newStatus },
        { headers: { token } }
      );
      if (data.success) {
        setStatus(newStatus); // ✅ update UI if backend succeeds
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const delivery = order.delivery || {};

  return (
    <div className="mb-6 border rounded bg-gray-800 p-4">
      <div className="flex justify-between gap-4 flex-wrap">
        {/* Left half */}
        <div className="flex-1 min-w-[250px]">
          <div className="mb-2">
            <strong>Order ID:</strong> {order.order_id} <br />
            <strong>Date:</strong> {formatDate(order.order_date)} <br />
            <strong>Status:</strong>{" "}
            {status === "Delivered" || status === "Cancelled" ? (
              <span
                className={`px-2 py-1 rounded ${
                  status === "Delivered"
                    ? "text-green-500 bg-gray-700"
                    : "text-red-500 bg-gray-700"
                }`}
              >
                {status}
              </span>
            ) : (
              <select
                value={status}
                onChange={(e) => changeStatus(e.target.value)} // ✅ call API directly
                className="px-2 py-1 bg-gray-600 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
            <br />
            <strong>Total:</strong> ₹{order.total_amount}
          </div>

          <div className="mb-2">
            <strong>Customer:</strong> {order.first_name} {order.last_name} |{" "}
            {order.email} | {order.phone}
          </div>

          {delivery && (
            <div className="mb-2">
              <strong>Delivery Info:</strong>
              <p>
                {delivery.receiver_name}, {delivery.phone}
              </p>
              <p>
                {delivery.house_no}, {delivery.street}, {delivery.building},{" "}
                {delivery.city}, {delivery.state} - {delivery.pincode}
              </p>
              {delivery.delivery_instructions && (
                <p>
                  <strong>Instructions:</strong>{" "}
                  {delivery.delivery_instructions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right half */}
        <div className="flex-1 min-w-[300px]">
          <strong>Items:</strong>
          <table className="w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-700">
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{item.product_name}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1">₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
