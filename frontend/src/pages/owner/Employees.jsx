import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const OwnerEmployees = () => {
  const { backendUrl, token, role } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ salary: "", manager_id: "" });
  const totalSalary = useMemo(() => {
    return employees.reduce((sum, o) => sum + Number(o.salary), 0);
  }, [employees]);
  // New Employee state including all attributes
  const [newEmp, setNewEmp] = useState({
    first_name: "",
    last_name: "",
    role: "Employee",
    email: "",
    phone: "",
    salary: "",
    password: "",
    manager_id: "",
    profile_photo: null, // File input
  });

  // Fetch all employees
  const fetchAllEmployees = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/employees`, {
        headers: { token },
      });

      if (data.success) {
        setEmployees(data.employees);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // start submitting
    try {
      const formData = new FormData();
      Object.keys(newEmp).forEach((key) => {
        if (newEmp[key] !== null) {
          formData.append(key, newEmp[key]);
        }
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
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false); // stop submitting
    }
  };


  const handleDelete = async (employee_id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/delete/${employee_id}`, {}, {
        headers: { token },
      });
      if (data.success) {
        toast.success(data.message);
        fetchAllEmployees()
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleEdit = (emp) => {
    setEditingId(emp.employee_id);
    setEditData({ salary: emp.salary, manager_id: emp.manager_id || "" });
  };
  const handleSave = async (employee_id) => {
    try {
      const { data } = await axios.post(backendUrl + `/api/admin/update/${employee_id}`, editData, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        setEditingId(null);
        fetchAllEmployees()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    if (token && role === "owner") {
      fetchAllEmployees();
    }
  }, [token, role]);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Employees</h2>

      {/* Add Employee Form */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-3">
        <h3 className="text-xl font-semibold">Add New Employee</h3>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={newEmp.first_name}
            onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newEmp.last_name}
            onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            required
          />
          <select
            value={newEmp.role}
            onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
            className="px-3 py-2 border rounded w-40 bg-gray-800"
          >
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={newEmp.email}
            onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
            className="px-3 py-2 border rounded w-60"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={newEmp.phone}
            onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            required
          />
          <input
            type="number"
            placeholder="Salary"
            value={newEmp.salary}
            onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newEmp.password}
            onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
            className="px-3 py-2 border rounded w-60"
            required
          />
          <input
            type="text"
            placeholder="Manager ID"
            value={newEmp.manager_id}
            onChange={(e) => setNewEmp({ ...newEmp, manager_id: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            required
          />
          <input
            type="file"
            onChange={(e) => setNewEmp({ ...newEmp, profile_photo: e.target.files[0] })}
            className="px-3 py-2 border rounded w-60"
            required
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>

        </form>
      </div>


      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow ">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2">Profile</th>
              <th className="px-4 py-2">Emp_id</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Man_id</th>
              <th className="px-4 py-2">Salary</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.employee_id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-2">
                  {emp.profile_photo ? (
                    <img
                      src={`${backendUrl}/uploads/${emp.profile_photo}`}
                      className="h-10 w-10 rounded-full"
                      alt={emp.first_name}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-2">{emp.employee_id}</td>
                <td className="px-4 py-2">{emp.first_name} {emp.last_name}</td>
                <td className="px-4 py-2">{emp.role}</td>
                <td className="px-4 py-2">{emp.email}</td>
                <td className="px-4 py-2">{emp.phone}</td>
                <td className="px-4 py-2">
                  {editingId === emp.employee_id ? (
                    <input
                      type="text"
                      value={editData.manager_id}
                      onChange={(e) => setEditData({ ...editData, manager_id: e.target.value })}
                      className="px-2 py-1 border rounded w-24"
                    />
                  ) : (
                    emp.manager_id || "None"
                  )}
                </td>

                <td className="px-4 py-2">
                  {editingId === emp.employee_id ? (
                    <input
                      type="number"
                      value={editData.salary}
                      onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                      className="px-2 py-1 border rounded w-24"
                    />
                  ) : (
                    emp.salary
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {editingId === emp.employee_id ? (
                    <button
                      onClick={() => handleSave(emp.employee_id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(emp.employee_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex justify-between items-center">
        <h3 className="text-lg font-semibold">Total Paid Salary</h3>
        <span className="text-xl font-bold text-green-500">₹{totalSalary.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OwnerEmployees;
