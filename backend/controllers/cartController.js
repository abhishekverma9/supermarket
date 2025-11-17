import { db } from "../config/db.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const qty = quantity || 1;

    // Check if product exists
    const [productRows] = await db().query("SELECT * FROM Product WHERE product_id = ?", [product_id]);
    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if already in cart
    const [existingCart] = await db().query(
      "SELECT * FROM Cart WHERE consumer_id=? AND product_id=?",
      [consumerId, product_id]
    );

    if (existingCart.length > 0) {
      // Update quantity
      await db().query(
        "UPDATE Cart SET quantity=quantity+? WHERE consumer_id=? AND product_id=?",
        [qty, consumerId, product_id]
      );
    } else {
      // Insert new item
      await db().query(
        "INSERT INTO Cart (consumer_id, product_id, quantity) VALUES (?, ?, ?)",
        [consumerId, product_id, qty]
      );
    }

    res.json({ success: true, message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all cart items for consumer
const getCartItems = async (req, res) => {
  try {
    const consumerId = req.userId;

    const [cartItems] = await db().query(`
      SELECT c.cart_id, c.quantity,
             p.product_id, p.name, p.price, p.image AS product_image,
             d.value AS discount_value
      FROM Cart c
      JOIN Product p ON c.product_id = p.product_id
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      WHERE c.consumer_id = ?
    `, [consumerId]);

    const cartWithFinalPrice = cartItems.map(item => ({
      ...item,
      final_price: item.discount_value
        ? (item.price - (item.price * item.discount_value) / 100).toFixed(2)
        : item.price
    }));

    res.json({ success: true, cart: cartWithFinalPrice, count: cartWithFinalPrice.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { cart_id, quantity } = req.body;

    if (!cart_id || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Valid cart_id and quantity required" });
    }

    await db().query(
      "UPDATE Cart SET quantity=? WHERE cart_id=? AND consumer_id=?",
      [quantity, cart_id, consumerId]
    );

    res.json({ success: true, message: "Cart item updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { cart_id } = req.body;

    await db().query("DELETE FROM Cart WHERE cart_id=? AND consumer_id=?", [cart_id, consumerId]);

    res.json({ success: true, message: "Cart item removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const consumerId = req.userId;
    await db().query("DELETE FROM Cart WHERE consumer_id=?", [consumerId]);

    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const checkout = async (req, res) => {
  const consumerId = req.userId;
  const {
    receiver_name,
    phone,
    house_no,
    street,
    building,
    city,
    state,
    pincode,
    delivery_instructions
  } = req.body;

  try {
    // 1️⃣ Fetch cart items
    const [cartItems] = await db().query(`
      SELECT c.product_id, c.quantity, p.price, d.value AS discount_value
      FROM Cart c
      JOIN Product p ON c.product_id = p.product_id
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      WHERE c.consumer_id = ?
    `, [consumerId]);

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 2️⃣ Calculate total amount & prepare order items
    let totalAmount = 0;
    const calculatedItems = cartItems.map(item => {
      const finalPrice = item.discount_value
        ? Number(item.price) - (Number(item.price) * Number(item.discount_value)) / 100
        : Number(item.price);

      totalAmount += finalPrice * Number(item.quantity);

      return {
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: finalPrice
      };
    });

    // 3️⃣ Create order
    const [orderResult] = await db().query(
      `INSERT INTO Orders (consumer_id, total_amount, status) VALUES (?, ?, ?)`,
      [consumerId, totalAmount, "Pending"]
    );
    const orderId = orderResult.insertId;

    // 4️⃣ Insert order items
    for (const item of calculatedItems) {
      await db().query(
        `INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 5️⃣ Insert delivery address
    await db().query(
      `INSERT INTO delivery_address (order_id, receiver_name, phone, house_no, street, building, city, state, pincode, delivery_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, receiver_name, phone, house_no, street, building, city, state, pincode, delivery_instructions]
    );

    // 6️⃣ Clear cart
    await db().query(`DELETE FROM Cart WHERE consumer_id = ?`, [consumerId]);

    // 7️⃣ Fetch order header details
    const [orderDetails] = await db().query(`
      SELECT o.order_id, o.total_amount, o.status, o.order_date,
             da.receiver_name, da.phone, da.house_no, da.street, da.building,
             da.city, da.state, da.pincode, da.delivery_instructions
      FROM Orders o
      JOIN delivery_address da ON o.order_id = da.order_id
      WHERE o.order_id = ?
    `, [orderId]);

    // 8️⃣ Fetch order items with product details
    const [dbOrderItems] = await db().query(`
      SELECT oi.product_id, p.name, oi.quantity, oi.price, p.image
      FROM Order_Items oi
      JOIN Product p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [orderId]);

    // 9️⃣ Get consumer email
    const [consumer] = await db().query(
      "SELECT email FROM Consumers WHERE consumer_id = ?",
      [consumerId]
    );

    // 🔟 Send confirmation email
    if (consumer.length > 0 && consumer[0].email) {
      const orderData = {
        order_id: orderId,
        total_amount: totalAmount,
        status: "Pending",
        order_date: orderDetails[0]?.order_date || new Date(),
        items: dbOrderItems,
        delivery: {
          receiver_name,
          phone,
          house_no,
          street,
          building: building || "",
          city,
          state,
          pincode,
          delivery_instructions: delivery_instructions || "",
        },
      };

      const emailResult = await sendOrderConfirmationEmail(
        consumer[0].email,
        orderData
      );

      if (!emailResult.success) {
        console.warn("⚠️ Order placed but email sending failed:", emailResult.message);
      }
    }

    res.json({
      success: true,
      message: "Order placed successfully",
      order_id: orderId,
      total_amount: totalAmount.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addToCart, getCartItems, updateCartItem, removeCartItem, clearCart,checkout };