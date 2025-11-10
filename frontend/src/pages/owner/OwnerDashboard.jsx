import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const OwnerDashboard = () => {
  const { backendUrl, token, role } = useContext(AuthContext);
  const [stats, setStats] = useState([]);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { token },
      });

      if (data.success) {
        // Convert stats object into array for easier rendering
        const arr = [
          { title: "Total Orders", value: data.stats.totalOrders },
          { title: "Pending Orders", value: data.stats.pendingOrders },
          { title: "Total Revenue", value: `₹${data.stats.totalRevenue}` },
          { title: "Low Stock Products", value: data.stats.lowStockProducts },
          { title: "Total Products", value: data.stats.totalProducts },
          { title: "Total Employees", value: data.stats.totalEmployees },
          { title: "Total Salary of Employees", value: `₹${data.stats.totalSalary}` },
          { title: "Total Customers", value: data.stats.totalCustomers },
        ];
        setStats(arr);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && role === "owner") {
      fetchDashboardStats();
    }
  }, [token, role]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-sm">
          Owner Dashboard
        </h2>
        <p className="text-gray-400 mt-1">Business overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-lg ring-1 ring-amber-500/10 hover:shadow-xl transition-shadow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 pointer-events-none" />
            <p className="text-gray-600 dark:text-gray-300 text-sm">{s.title}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
