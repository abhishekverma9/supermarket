import db from "../config/db.js";
import bcrypt from "bcrypt";

const Employee = {
  // Create new employee (Admin/Manager/Employee)
  create: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const sql = `
      INSERT INTO employee (first_name, last_name, email, password, role, salary, phone, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.first_name,
      data.last_name,
      data.email,
      hashedPassword,
      data.role || "Employee", // default role
      data.salary || 0,
      data.phone || null,
      data.manager_id || null
    ]);
    return result.insertId;
  },

  // Find by email for login
  findByEmail: async (email) => {
    const sql = "SELECT * FROM employee WHERE email = ? LIMIT 1";
    const [rows] = await db.query(sql, [email]);
    return rows[0];
  },

  // Find by emp_id
  findById: async (emp_id) => {
    const sql = "SELECT * FROM employee WHERE emp_id = ? LIMIT 1";
    const [rows] = await db.query(sql, [emp_id]);
    return rows[0];
  },

  // Get all employees (Admin sees all, Manager sees team)
  getAll: async (user) => {
    let sql, params = [];
    if (user.role === "Admin") {
      sql = "SELECT * FROM employee";
    } else if (user.role === "Manager") {
      sql = "SELECT * FROM employee WHERE manager_id = ?";
      params.push(user.emp_id);
    } else {
      sql = "SELECT * FROM employee WHERE emp_id = ?";
      params.push(user.emp_id);
    }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  // Update employee
  update: async (emp_id, data) => {
    const sql = `
      UPDATE employee SET first_name = ?, last_name = ?, phone = ?, salary = ?, role = ?, manager_id = ?
      WHERE emp_id = ?
    `;
    const [result] = await db.query(sql, [
      data.first_name,
      data.last_name,
      data.phone,
      data.salary,
      data.role,
      data.manager_id,
      emp_id
    ]);
    return result.affectedRows;
  },

  // Delete employee
  delete: async (emp_id) => {
    const sql = "DELETE FROM employee WHERE emp_id = ?";
    const [result] = await db.query(sql, [emp_id]);
    return result.affectedRows;
  }
};

export default Employee;
