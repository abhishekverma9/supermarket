import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import OrderCard from "../../components/OrderCard";

const AllOrders = () => {
  const { allOrders } = useContext(AuthContext); // assuming context has allOrders array

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          All Orders
        </h2>
        <p className="text-gray-400">Manage and track all orders in real time</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allOrders.map((order) => (
          <OrderCard
            key={order.order_id}
            order={order}
          />
        ))}
      </div>
    </div>
  );
};

export default AllOrders;
