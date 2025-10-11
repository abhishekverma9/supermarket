import { db } from "../config/db.js";

// -------------------------
// Add product to cart
// -------------------------
const addToCart = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const qty = quantity || 1;
    const pool = db();

    // Check if product exists
    const productCheck = await pool.query("SELECT * FROM Product WHERE product_id = $1", [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if already in cart
    const existing = await pool.query(
      "SELECT * FROM Cart WHERE consumer_id = $1 AND product_id = $2",
      [consumerId, product_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      await pool.query(
        "UPDATE Cart SET quantity = quantity + $1 WHERE consumer_id = $2 AND product_id = $3",
        [qty, consumerId, product_id]
      );
    } else {
      // Insert new item
      await pool.query(
        "INSERT INTO Cart (consumer_id, product_id, quantity) VALUES ($1, $2, $3)",
        [consumerId, product_id, qty]
      );
    }

    res.json({ success: true, message: "Product added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Get all cart items for consumer
// -------------------------
const getCartItems = async (req, res) => {
  try {
    const consumerId = req.userId;
    const pool = db();

    const result = await pool.query(`
      SELECT 
        c.cart_id, 
        c.quantity,
        p.product_id, 
        p.name, 
        p.price, 
        p.image AS product_image,
        d.value AS discount_value
      FROM Cart c
      JOIN Product p ON c.product_id = p.product_id
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      WHERE c.consumer_id = $1
    `, [consumerId]);

    const cartWithFinalPrice = result.rows.map(item => ({
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

// -------------------------
// Update cart item quantity
// -------------------------
const updateCartItem = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { cart_id, quantity } = req.body;
    const pool = db();

    if (!cart_id || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Valid cart_id and quantity required" });
    }

    await pool.query(
      "UPDATE Cart SET quantity = $1 WHERE cart_id = $2 AND consumer_id = $3",
      [quantity, cart_id, consumerId]
    );

    res.json({ success: true, message: "Cart item updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Remove item from cart
// -------------------------
const removeCartItem = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { cart_id } = req.body;
    const pool = db();

    await pool.query("DELETE FROM Cart WHERE cart_id = $1 AND consumer_id = $2", [cart_id, consumerId]);

    res.json({ success: true, message: "Cart item removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Clear entire cart
// -------------------------
const clearCart = async (req, res) => {
  try {
    const consumerId = req.userId;
    const pool = db();

    await pool.query("DELETE FROM Cart WHERE consumer_id = $1", [consumerId]);

    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------
// Checkout / Place order
// -------------------------
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

  const pool = db();

  try {
    // 1️⃣ Fetch cart items
    const cartRes = await pool.query(`
      SELECT c.product_id, c.quantity, p.price, d.value AS discount_value
      FROM Cart c
      JOIN Product p ON c.product_id = p.product_id
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      WHERE c.consumer_id = $1
    `, [consumerId]);

    const cartItems = cartRes.rows;

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 2️⃣ Calculate total amount & prepare order items
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
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
    const orderResult = await pool.query(
      `INSERT INTO Orders (consumer_id, total_amount, status)
       VALUES ($1, $2, $3) RETURNING order_id`,
      [consumerId, totalAmount, "Pending"]
    );
    const orderId = orderResult.rows[0].order_id;

    // 4️⃣ Insert order items
    for (const item of orderItems) {
      await pool.query(
        `INSERT INTO Order_Items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 5️⃣ Insert delivery address
    await pool.query(
      `INSERT INTO delivery_address 
       (order_id, receiver_name, phone, house_no, street, building, city, state, pincode, delivery_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [orderId, receiver_name, phone, house_no, street, building, city, state, pincode, delivery_instructions]
    );

    // 6️⃣ Clear cart
    await pool.query(`DELETE FROM Cart WHERE consumer_id = $1`, [consumerId]);

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

export { addToCart, getCartItems, updateCartItem, removeCartItem, clearCart, checkout };
