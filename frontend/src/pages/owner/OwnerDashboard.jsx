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
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-gray-800 dark:text-white"
          >
            <p className="text-sm">{s.title}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
