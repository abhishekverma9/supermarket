import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import OrderCard from "../../components/OrderCard";

const AllOrders = () => {
  const { allOrders } = useContext(AuthContext); // assuming context has allOrders array

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
      <div className="overflow-x-auto">
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
