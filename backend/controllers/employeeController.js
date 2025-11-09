import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// --------------------
// 🧾 Get All Orders
// --------------------
const getAllOrders = async (req, res) => {
  try {
    // 1️⃣ Fetch all orders with consumer info
    const { rows: orders } = await db().query(`
      SELECT o.order_id, o.consumer_id, o.total_amount, o.status, o.order_date,
             c.first_name, c.last_name, c.email, c.phone
      FROM Orders o
      JOIN Consumers c ON o.consumer_id = c.consumer_id
      ORDER BY o.order_date DESC
    `);

    if (orders.length === 0) {
      return res.json({ success: false, message: "No orders found" });
    }

    // 2️⃣ Get all order IDs
    const orderIds = orders.map(o => o.order_id);
    const { rows: orderItems } = await db().query(
      `
      SELECT oi.order_id, p.name AS product_name, oi.quantity, oi.price
      FROM order_items oi
      JOIN Product p ON oi.product_id = p.product_id
      WHERE oi.order_id = ANY($1)
      `,
      [orderIds]
    );

    // 3️⃣ Fetch delivery addresses
    const { rows: deliveries } = await db().query(
      `
      SELECT * FROM delivery_address
      WHERE order_id = ANY($1)
      `,
      [orderIds]
    );

    // 4️⃣ Combine results
    const ordersWithDetails = orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.order_id),
      delivery: deliveries.find(d => d.order_id === order.order_id) || null,
    }));

    res.json({ success: true, count: ordersWithDetails.length, orders: ordersWithDetails });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------
// 🚚 Update Order Status
// --------------------
const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!order_id) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    if (!status || !validStatuses.includes(status)) {
      return res.json({ success: false, message: "Invalid status value" });
    }

    const result = await db().query(
      `UPDATE Orders SET status = $1 WHERE order_id = $2`,
      [status, order_id]
    );

    if (result.rowCount === 0) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated successfully", order_id, status });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------
// 👤 Get Employee Profile
// --------------------
const getEmpProfile = async (req, res) => {
  try {
    const employeeId = req.userId;
    if (!employeeId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const { rows } = await db().query(
      `SELECT employee_id, first_name, last_name, phone, email, role, profile_photo,salary, created_at
       FROM Employee 
       WHERE employee_id = $1`,
      [employeeId]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------
// ✏️ Update Employee Profile
// --------------------
const updateEmpProfile = async (req, res) => {
  try {
    const employeeId = req.userId;
    const { first_name, last_name, phone } = req.body;

    if (!employeeId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    let profilePhotoUrl = null;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/employees",
      });
      profilePhotoUrl = result.url;
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (first_name) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }
    if (last_name) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }
    if (phone) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (profilePhotoUrl) {
      fields.push(`profile_photo = $${paramIndex++}`);
      values.push(profilePhotoUrl);
    }

    if (fields.length === 0) {
      return res.json({ success: false, message: "No fields to update" });
    }

    values.push(employeeId);

    await db().query(
      `UPDATE Employee SET ${fields.join(", ")} WHERE employee_id = $${paramIndex}`,
      values
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------
// 👥 Get Team Members (Manager view)
// --------------------
const getTeamMember = async (req, res) => {
  try {
    const managerId = req.userId;
    const { rows: employees } = await db().query(
      `SELECT employee_id, first_name, last_name, role, phone, email, profile_photo, salary, created_at
       FROM Employee
       WHERE manager_id = $1`,
      [managerId]
    );

    if (employees.length === 0) {
      return res.json({ success: true, message: "No employees under this manager", employees: [] });
    }

    res.json({ success: true, employees });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { getAllOrders, updateOrderStatus, getEmpProfile, updateEmpProfile, getTeamMember };
