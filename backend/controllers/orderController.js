import { db } from "../config/db.js";

// --------------------------
// 🧾 Get all orders for a consumer
// --------------------------
const getOrders = async (req, res) => {
  try {
    const consumerId = req.userId;

    // Fetch all orders with delivery address
    const { rows: orders } = await db().query(
      `
      SELECT o.order_id, o.total_amount, o.status, o.order_date,
             da.receiver_name, da.phone, da.house_no, da.street, da.building,
             da.city, da.state, da.pincode, da.delivery_instructions
      FROM Orders o
      JOIN delivery_address da ON o.order_id = da.order_id
      WHERE o.consumer_id = $1
      ORDER BY o.order_date DESC
      `,
      [consumerId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const { rows: items } = await db().query(
        `
        SELECT oi.order_item_id, oi.product_id, p.name, oi.quantity, oi.price, p.image
        FROM Order_Items oi
        JOIN Product p ON oi.product_id = p.product_id
        WHERE oi.order_id = $1
        `,
        [order.order_id]
      );
      order.items = items;
    }

    res.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------
// 📦 Get single order by ID
// --------------------------
const getOrderById = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { order_id } = req.params;

    // Fetch order with address
    const { rows: orders } = await db().query(
      `
      SELECT o.order_id, o.total_amount, o.status, o.order_date,
             da.receiver_name, da.phone, da.house_no, da.street, da.building,
             da.city, da.state, da.pincode, da.delivery_instructions
      FROM Orders o
      JOIN delivery_address da ON o.order_id = da.order_id
      WHERE o.consumer_id = $1 AND o.order_id = $2
      `,
      [consumerId, order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orders[0];

    // Fetch order items
    const { rows: items } = await db().query(
      `
      SELECT oi.order_item_id, oi.product_id, p.name, oi.quantity, oi.price, p.image
      FROM Order_Items oi
      JOIN Product p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      `,
      [order.order_id]
    );

    order.items = items;

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getOrders, getOrderById };
