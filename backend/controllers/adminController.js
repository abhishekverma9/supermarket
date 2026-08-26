import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

const getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db().query(`
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
            FROM Employee where role != 'Admin'
        `);
        res.json({ success: true, employees: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch employees" });
    }
};
const deleteEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const [rows] = await db().query("SELECT * FROM Employee WHERE employee_id = ?", [employee_id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        await db().query("DELETE FROM Employee WHERE employee_id = ?", [employee_id]);
        res.json({ success: true, message: "Employee deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to delete employee" });
    }
}

const addEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      role,
      email,
      phone,
      salary,
      password,
      manager_id,
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !phone || !salary || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if email already exists
    const [existing] = await db().query("SELECT * FROM Employee WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // Hash password before inserting
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Optional: profile photo
    let profile_photo_url = null;
    if (req.file) {
      const uploadResult = await imagekit.upload({
        file: req.file.buffer, // multer with memory storage
        fileName: req.file.originalname,
        folder: "/employees",
      });
      profile_photo_url = uploadResult.url;
    }

    // Insert new employee
    const [result] = await db().query(
      `INSERT INTO Employee
        (first_name, last_name, role, email, phone, salary, password, manager_id, profile_photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        role,
        email,
        phone,
        salary,
        hashedPassword,  
        manager_id || null,
        profile_photo_url,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add employee" });
  }
};

const updateEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const { manager_id, salary } = req.body;
    if (!manager_id || !salary) {
        return res.status(400).json({ success: false, message: "Manager ID and Salary are required" });
    }
    try {
        // Update employee in DB
        const query = `
      UPDATE Employee 
      SET manager_id = ?, salary = ? 
      WHERE employee_id = ?
    `;
        const [result] = await db().execute(query, [manager_id, salary, employee_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        res.json({ success: true, message: "Employee updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update employee" });
    }
}
const updateDiscount = async (req, res) => {
    try {
        const { product_Id } = req.params;
        const { value, description } = req.body;
        if (!value || !description) {
            return res.status(400).json({
                success: false,
                message: "Both value and description are required",
            });
        }
        // 1. Find if product already has a discount
        const [rows] = await db().query(
            `SELECT discount_id FROM Product_Discount WHERE product_id = ?`,
            [product_Id]
        );
        if (rows.length > 0 && rows[0].discount_id) {
            // ✅ Update existing discount
            const discountId = rows[0].discount_id;
            const [result] = await db().query(
                `UPDATE Discount 
         SET value = ?, description = ? 
         WHERE discount_id = ?`,
                [value, description, discountId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Discount not found",
                });
            }
            return res.json({
                success: true,
                message: "Discount updated successfully",
            });
        } else {
            // 🚀 Insert new discount + link it
            const [insertRes] = await db().query(
                `INSERT INTO Discount (value, description) VALUES (?, ?)`,
                [value, description]
            );
            const newDiscountId = insertRes.insertId;
            await db().query(
                `INSERT INTO Product_Discount (product_id, discount_id) VALUES (?, ?)`,
                [product_Id, newDiscountId]
            );
            return res.status(201).json({
                success: true,
                message: "New discount created and linked to product",
                discountId: newDiscountId,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update discount" });
    }
}
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.userId
    if(!adminId){
        return res.status(401).json({success:false,message:"Not Authorized"})
    }
    const [totalOrders] = await db().query("SELECT COUNT(*) AS count FROM Orders WHERE status != 'Cancelled'");
    const [pendingOrders] = await db().query("SELECT COUNT(*) AS count FROM Orders WHERE status = 'Pending'");
    const [totalRevenue] = await db().query("SELECT COALESCE(SUM(total_amount),0) AS amount FROM Orders WHERE status = 'Delivered'");
    const [lowStockProducts] = await db().query("SELECT COUNT(*) AS count FROM Product WHERE stock_quantity < 5");
    const [totalProducts] = await db().query("SELECT COUNT(*) AS count FROM Product");
    const [totalEmployees] = await db().query("SELECT COUNT(*) AS count FROM Employee");
    const [totalSalary] = await db().query("SELECT COALESCE(SUM(salary),0) AS amount FROM Employee");
    const [totalCustomers] = await db().query("SELECT COUNT(*) AS count FROM Consumers");

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrders[0].count,
        pendingOrders: pendingOrders[0].count,
        totalRevenue: totalRevenue[0].amount,
        lowStockProducts: lowStockProducts[0].count,
        totalProducts: totalProducts[0].count,
        totalEmployees: totalEmployees[0].count,
        totalSalary: totalSalary[0].amount,
        totalCustomers: totalCustomers[0].count,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

export { getAllEmployees, deleteEmployee, addEmployee, updateEmployee,updateDiscount,getDashboardStats }