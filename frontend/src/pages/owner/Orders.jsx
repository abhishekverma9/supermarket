import React, { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";

const OwnerOrders = () => {
  const { allOrders } = useContext(AuthContext);

  // Filter out cancelled orders
  const validOrders = useMemo(
    () => allOrders.filter((o) => o.status !== "Cancelled"),
    [allOrders]
  );

  // Calculate total income from Delivered orders
const totalIncome = useMemo(() => {
  return validOrders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
}, [validOrders]);


  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer ID</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {validOrders.map((o) => (
              <tr
                key={o.order_id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-2">{o.order_id}</td>
                <td className="px-4 py-2">{o.consumer_id}</td>
                <td className="px-4 py-2">{o.items.length}</td>
                <td className="px-4 py-2">₹{o.total_amount}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      o.status === "Pending"
                        ? "bg-yellow-500"
                        : o.status === "Shipped"
                        ? "bg-blue-500"
                        : o.status === "Delivered"
                        ? "bg-green-500"
                        : "bg-indigo-500"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Income Section */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex justify-between items-center">
        <h3 className="text-lg font-semibold">Total Income</h3>
        <span className="text-xl font-bold text-green-500">₹{totalIncome.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OwnerOrders;
