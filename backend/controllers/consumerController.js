import { db } from "../config/db.js";

// Get Consumer Profile
export const getProfile = async (req, res) => {
  try {
    const consumer_id = req.userId;
    const [rows] = await db().query(
      "SELECT consumer_id, first_name, last_name, email, phone FROM Consumers WHERE consumer_id = ?",
      [consumer_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get order count for loyalty points/stats placeholder
    const [orders] = await db().query(
      "SELECT COUNT(*) as count FROM Orders WHERE consumer_id = ?",
      [consumer_id]
    );

    const user = rows[0];
    user.orders_count = orders[0].count;

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update Consumer Profile
export const updateProfile = async (req, res) => {
  try {
    const consumer_id = req.userId;
    const { first_name, last_name, phone } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ success: false, message: "First and last name are required" });
    }

    const [result] = await db().query(
      "UPDATE Consumers SET first_name = ?, last_name = ?, phone = ? WHERE consumer_id = ?",
      [first_name, last_name, phone || "", consumer_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found or no changes made" });
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
