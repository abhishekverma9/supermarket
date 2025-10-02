import Employee from "./employee.js";

const Admin = {
  getAllEmployees: async () => {
    const adminUser = { role: "Admin" };
    return await Employee.getAll(adminUser);
  },

  createEmployee: async (data) => {
    // Admin creates new employee
    return await Employee.create(data);
  },

  deleteEmployee: async (emp_id) => {
    return await Employee.delete(emp_id);
  }
};

export default Admin;
