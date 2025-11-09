import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// -------------------------------
// Get All Employees (excluding Admin)
// -------------------------------
const getAllEmployees = async (req, res) => {
  try {
    const pool = db();
    const result = await pool.query(`
      SELECT 
        employee_id,
        first_name,
        last_name,
        role,
        salary,
        phone,
        email,
        manager_id,
        profile_photo
      FROM Employee
      WHERE LOWER(role) != 'admin'
    `);
    res.json({ success: true, employees: result.rows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------------------
// Delete Employee
// -------------------------------
const deleteEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const pool = db();

    const check = await pool.query(`SELECT * FROM Employee WHERE employee_id = $1`, [employee_id]);
    if (check.rows.length === 0) {
      return res.json({ success: false, message: "Employee not found" });
    }

    await pool.query(`DELETE FROM Employee WHERE employee_id = $1`, [employee_id]);
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------------------
// Add Employee
// -------------------------------
const addEmployee = async (req, res) => {
  try {
    const pool = db();
    const { first_name, last_name, role, email, phone, salary, password, manager_id } = req.body;

    if (!first_name || !last_name || !email || !phone || !salary || !password || !role) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check existing email
    const existing = await pool.query(`SELECT * FROM Employee WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload photo if provided
    let profile_photo_url = null;
    if (req.file) {
      const uploadResult = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/employees",
      });
      profile_photo_url = uploadResult.url;
    }

    const insertQuery = `
      INSERT INTO Employee 
      (first_name, last_name, role, email, phone, salary, password, manager_id, profile_photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING employee_id
    `;

    const result = await pool.query(insertQuery, [
      first_name,
      last_name,
      role,
      email,
      phone,
      salary,
      hashedPassword,
      manager_id || null,
      profile_photo_url,
    ]);

    res.json({
      success: true,
      message: "Employee added successfully",
      employee_id: result.rows[0].employee_id,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------------------
// Update Employee (Manager/Salary)
// -------------------------------
const updateEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { manager_id, salary } = req.body;
    const pool = db();

    if (!manager_id || !salary) {
      return res.json({ success: false, message: "Manager ID and Salary are required" });
    }

    const query = `
      UPDATE Employee 
      SET manager_id = $1, salary = $2 
      WHERE employee_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [manager_id, salary, employee_id]);

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------------------
// Update or Create Product Discount
// -------------------------------
const updateDiscount = async (req, res) => {
  try {
    const { product_Id } = req.params;
    const { value, description } = req.body;
    const pool = db();

    if (!value || !description) {
      return res.json({ success: false, message: "Both value and description are required" });
    }

    // Check existing discount link
    const existing = await pool.query(
      `SELECT discount_id FROM Product_Discount WHERE product_id = $1`,
      [product_Id]
    );

    if (existing.rows.length > 0 && existing.rows[0].discount_id) {
      // Update existing discount
      const discountId = existing.rows[0].discount_id;
      await pool.query(
        `UPDATE Discount SET value = $1, description = $2 WHERE discount_id = $3`,
        [value, description, discountId]
      );

      return res.json({ success: true, message: "Discount updated successfully" });
    } else {
      // Create new discount and link it
      const insert = await pool.query(
        `INSERT INTO Discount (value, description) VALUES ($1, $2) RETURNING discount_id`,
        [value, description]
      );

      const discountId = insert.rows[0].discount_id;

      await pool.query(
        `INSERT INTO Product_Discount (product_id, discount_id) VALUES ($1, $2)`,
        [product_Id, discountId]
      );

      return res.json({
        success: true,
        message: "New discount created and linked to product",
        discountId,
      });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------------------------
// Dashboard Stats
// -------------------------------
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const pool = db();

    const totalOrders = await pool.query(`SELECT COUNT(*) FROM Orders WHERE status != 'Cancelled'`);
    const pendingOrders = await pool.query(`SELECT COUNT(*) FROM Orders WHERE status = 'Pending'`);
    const totalRevenue = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) FROM Orders WHERE status = 'Delivered'`);
    const lowStockProducts = await pool.query(`SELECT COUNT(*) FROM Product WHERE stock_quantity < 5`);
    const totalProducts = await pool.query(`SELECT COUNT(*) FROM Product`);
    const totalEmployees = await pool.query(`SELECT COUNT(*) FROM Employee`);
    const totalSalary = await pool.query(`SELECT COALESCE(SUM(salary), 0) FROM Employee`);
    const totalCustomers = await pool.query(`SELECT COUNT(*) FROM Consumers`);

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrders.rows[0].count,
        pendingOrders: pendingOrders.rows[0].count,
        totalRevenue: totalRevenue.rows[0].coalesce || totalRevenue.rows[0].sum,
        lowStockProducts: lowStockProducts.rows[0].count,
        totalProducts: totalProducts.rows[0].count,
        totalEmployees: totalEmployees.rows[0].count,
        totalSalary: totalSalary.rows[0].coalesce || totalSalary.rows[0].sum,
        totalCustomers: totalCustomers.rows[0].count,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  getAllEmployees,
  deleteEmployee,
  addEmployee,
  updateEmployee,
  updateDiscount,
  getDashboardStats,
};
