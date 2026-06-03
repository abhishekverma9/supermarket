import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";
import { sendOrderDeliveredEmail, sendOrderCancellationEmail, sendOrderConfirmationEmail, sendOutForDeliveryEmail } from "../utils/emailService.js";

const getAllOrders = async (req, res) => {
  try {
    // 1️⃣ Fetch all orders with consumer info
    const [orders] = await db().query(`
      SELECT o.order_id, o.consumer_id, o.total_amount, o.status, o.order_date,
             c.first_name, c.last_name, c.email, c.phone
      FROM Orders o
      JOIN Consumers c ON o.consumer_id = c.consumer_id
      ORDER BY o.order_date DESC
    `);

    if (orders.length === 0) {
      return res.json({ success: true, message: "No orders found", count: 0, orders: [] });
    }

    // 2️⃣ Fetch items for all orders
    const orderIds = orders.map(o => o.order_id);
    const [orderItems] = await db().query(`
      SELECT oi.order_id, p.name AS product_name, oi.quantity, oi.price
      FROM Order_Items oi
      JOIN Product p ON oi.product_id = p.product_id
      WHERE oi.order_id IN (?)
    `, [orderIds]);

    // 3️⃣ Fetch delivery addresses
    const [deliveries] = await db().query(`
      SELECT * FROM delivery_address
      WHERE order_id IN (?)
    `, [orderIds]);

    // 4️⃣ Combine orders with items and delivery info
    const ordersWithDetails = orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.order_id),
      delivery: deliveries.find(d => d.order_id === order.order_id) || null
    }));

    res.json({ success: true, count: ordersWithDetails.length, orders: ordersWithDetails });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};
// ✅ Update order status controller
const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending","Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled" ];

    if (!order_id) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // 1️⃣ FETCH FULL ORDER DETAILS (email, items, delivery)
    const [[order]] = await db().query(
      "SELECT * FROM Orders WHERE order_id = ?",
      [order_id]
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const [[consumer]] = await db().query(
      "SELECT email FROM Consumers WHERE consumer_id = ?",
      [order.consumer_id]
    );

    const [items] = await db().query(
      `SELECT OI.*, P.name, P.image 
       FROM Order_Items OI 
       JOIN Product P ON OI.product_id = P.product_id
       WHERE OI.order_id = ?`,
      [order_id]
    );

    const [[delivery]] = await db().query(
      "SELECT * FROM delivery_address WHERE order_id = ?",
      [order_id]
    );

    const fullOrder = {
      ...order,
      items,
      delivery,
      email: consumer.email
    };

    // 2️⃣ UPDATE STATUS
    await db().query("UPDATE Orders SET status = ? WHERE order_id = ?", [
      status,
      order_id,
    ]);

    // 3️⃣ SEND EMAIL BASED ON STATUS
    try {
      switch (status) {
        case "Out for Delivery":
          await sendOutForDeliveryEmail(consumer.email, fullOrder);
          break;

        case "Delivered":
          await sendOrderDeliveredEmail(consumer.email, fullOrder);
          break;

        case "Cancelled":
          await sendOrderCancellationEmail(consumer.email, fullOrder);
          break;

        default: 
          break;
      }
    } catch (emailError) {
      // Email failure should not fail the status update
      console.warn("⚠️ Status updated but email sending failed:", emailError.message);
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order_id,
      status,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
const getEmpProfile = async (req, res) => {
  try {
    const employeeId = req.userId; // from auth middleware
    if (!employeeId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const [rows] = await db().query(
      `SELECT employee_id, first_name, last_name, phone, email, role, profile_photo,created_at
       FROM Employee 
       WHERE employee_id = ?`,
      [employeeId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
}
const updateEmpProfile = async (req, res) => {
  try {
    const employeeId = req.userId; // from auth middleware
    const { first_name, last_name, phone } = req.body;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    let profilePhotoUrl = null;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/employees"
      });
      profilePhotoUrl = result.url;
    }
    const fields = [];
    const values = [];
    if (first_name) { fields.push("first_name = ?"); values.push(first_name); }
    if (last_name) { fields.push("last_name = ?"); values.push(last_name); }
    if (phone) { fields.push("phone = ?"); values.push(phone); }
    if (profilePhotoUrl) { fields.push("profile_photo = ?"); values.push(profilePhotoUrl); }
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }
    values.push(employeeId);
    await db().query(
      `UPDATE Employee SET ${fields.join(", ")} WHERE employee_id = ?`,
      values
    );
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}
const getTeamMember = async (req, res) => {
  try {
    const managerId = req.userId;
    const [employees] = await db().query(
      `SELECT employee_id, first_name, last_name, role, phone, email, profile_photo, salary, created_at
       FROM Employee
       WHERE manager_id = ?`,
      [managerId]
    );
    if (employees.length === 0) {
      return res.json({ success: true, message: "No employees under this manager", employees: [] });
    }
    res.json({ success: true, employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch team members" });
  }
}
export { getAllOrders, updateOrderStatus, getEmpProfile, updateEmpProfile, getTeamMember }