import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaSave, FaUserPlus } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";

const OwnerEmployees = () => {
  const { backendUrl, token, role } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ salary: "", manager_id: "" });

  const totalSalary = useMemo(() => {
    return employees.reduce((sum, o) => sum + Number(o.salary), 0);
  }, [employees]);

  const [newEmp, setNewEmp] = useState({
    first_name: "",
    last_name: "",
    role: "Employee",
    email: "",
    phone: "",
    salary: "",
    password: "",
    manager_id: "",
    profile_photo: null,
  });

  // Fetch Employees
  const fetchAllEmployees = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/employees`, {
        headers: { token },
      });
      if (data.success) setEmployees(data.employees);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add Employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(newEmp).forEach((key) => {
        if (newEmp[key] !== null) formData.append(key, newEmp[key]);
      });

      const { data } = await axios.post(`${backendUrl}/api/admin/add`, formData, {
        headers: { token },
      });

      if (data.success) {
        toast.success(data.message);
        setNewEmp({
          first_name: "",
          last_name: "",
          role: "Employee",
          email: "",
          phone: "",
          salary: "",
          password: "",
          manager_id: "",
          profile_photo: null,
        });
        fetchAllEmployees();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Employee
  const handleDelete = async (employee_id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/delete/${employee_id}`,
        {},
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchAllEmployees();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Edit Employee
  const handleEdit = (emp) => {
    setEditingId(emp.employee_id);
    setEditData({ salary: emp.salary, manager_id: emp.manager_id || "" });
  };

  const handleSave = async (employee_id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/update/${employee_id}`,
        editData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setEditingId(null);
        fetchAllEmployees();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && role === "owner") fetchAllEmployees();
  }, [token, role]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-extrabold text-[#FF8C00]">
  Manage Employees
</h2>
        <p className="text-gray-400 mt-2">Add, edit, or remove employee records</p>
      </motion.div>

      {/* Add Employee Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 mb-10 rounded-2xl bg-[#2E2E2E]/70 border border-[#FF8C00]/20 shadow-xl backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold flex items-center gap-2 text-[#FF8C00] mb-4">
          <FaUserPlus /> Add New Employee
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
          {[
            { name: "first_name", placeholder: "First Name" },
            { name: "last_name", placeholder: "Last Name" },
            { name: "email", placeholder: "Email", type: "email" },
            { name: "phone", placeholder: "Phone" },
            { name: "salary", placeholder: "Salary", type: "number" },
            { name: "password", placeholder: "Password", type: "password" },
            { name: "manager_id", placeholder: "Manager ID" },
          ].map((input) => (
            <input
              key={input.name}
              type={input.type || "text"}
              placeholder={input.placeholder}
              value={newEmp[input.name]}
              onChange={(e) =>
                setNewEmp({ ...newEmp, [input.name]: e.target.value })
              }
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#FF8C00]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00]/50 w-44"
              required
            />
          ))}

          <select
            value={newEmp.role}
            onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#FF8C00]/30 text-white focus:ring-2 focus:ring-[#FF8C00]/50"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
          </select>

          <input
            type="file"
            onChange={(e) =>
              setNewEmp({ ...newEmp, profile_photo: e.target.files[0] })
            }
            className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#FF8C00]/30 text-gray-300 focus:ring-2 focus:ring-[#FF8C00]/50"
            required
          />

          <button
            type="submit"
            className={`px-5 py-2 rounded-lg text-black font-semibold transition-transform hover:scale-105 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#FF8C00] hover:bg-[#ffa733]"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </form>
      </motion.div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="overflow-x-auto bg-[#2E2E2E]/70 border border-[#FF8C00]/20 rounded-2xl shadow-lg"
      >
        <table className="w-full text-sm">
          <thead className="bg-[#1a1a1a] text-[#FF8C00] uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Profile</th>
              <th className="px-4 py-3 text-left">Emp ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Manager ID</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.employee_id}
                className="border-b border-[#FF8C00]/10 hover:bg-[#1E1E1E] transition-all"
              >
                <td className="px-4 py-2">
                  {emp.profile_photo ? (
                    <img
                      src={`${backendUrl}/uploads/${emp.profile_photo}`}
                      className="h-10 w-10 rounded-full border border-[#FF8C00]/40"
                      alt={emp.first_name}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-2">{emp.employee_id}</td>
                <td className="px-4 py-2">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="px-4 py-2">{emp.role}</td>
                <td className="px-4 py-2">{emp.email}</td>
                <td className="px-4 py-2">{emp.phone}</td>

                <td className="px-4 py-2">
                  {editingId === emp.employee_id ? (
                    <input
                      type="text"
                      value={editData.manager_id}
                      onChange={(e) =>
                        setEditData({ ...editData, manager_id: e.target.value })
                      }
                      className="w-20 px-2 py-1 rounded bg-[#1a1a1a] border border-[#FF8C00]/30 text-white"
                    />
                  ) : (
                    emp.manager_id || "—"
                  )}
                </td>

                <td className="px-4 py-2">
                  {editingId === emp.employee_id ? (
                    <input
                      type="number"
                      value={editData.salary}
                      onChange={(e) =>
                        setEditData({ ...editData, salary: e.target.value })
                      }
                      className="w-20 px-2 py-1 rounded bg-[#1a1a1a] border border-[#FF8C00]/30 text-white"
                    />
                  ) : (
                    `₹${emp.salary}`
                  )}
                </td>

                <td className="px-4 py-2 flex gap-3">
                  {editingId === emp.employee_id ? (
                    <button
                      onClick={() => handleSave(emp.employee_id)}
                      className="text-green-500 hover:text-green-400"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(emp.employee_id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Total Salary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 p-6 bg-[#2E2E2E]/70 border border-[#FF8C00]/20 rounded-2xl shadow-xl flex justify-between items-center"
      >
        <h3 className="text-xl font-semibold text-gray-300">Total Salary Paid</h3>
        <span className="text-2xl font-bold text-[#FF8C00]">
          ₹{totalSalary.toFixed(2)}
        </span>
      </motion.div>
    </div>
  );
};

export default OwnerEmployees;
