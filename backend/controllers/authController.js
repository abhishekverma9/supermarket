import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

// ---------------------------
// Signup (Consumer only)
// ---------------------------
const signupConsumer = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !email || !password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check if consumer already exists
    const result = await db().query("SELECT * FROM consumers WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new consumer
    const insertResult = await db().query(
      `INSERT INTO consumers (first_name, last_name, email, phone, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING consumer_id`,
      [first_name, last_name, email, phone || "", hashedPassword]
    );

    const consumerId = insertResult.rows[0].consumer_id;

    const token = generateToken({ id: consumerId, role: "consumer" });

    return res.json({
      success: true,
      message: "Account created successfully",
      consumer_id: consumerId,
      token,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Login (All roles)
// ---------------------------
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.json({ success: false, message: "Email, password, and role are required" });
    }

    let tableName, idField, nameField;

    if (role === "owner" || role === "employee") {
      tableName = "employee";
      idField = "employee_id";
      nameField = "first_name";
    } else if (role === "consumer") {
      tableName = "consumers";
      idField = "consumer_id";
      nameField = "first_name";
    } else {
      return res.json({ success: false, message: "Invalid role" });
    }

    // Query user
    const result = await db().query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const user = result.rows[0];

    // Check role for employee/owner
    if (tableName === "employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.json({ success: false, message: "Not an Owner" });
      }
      if (
        role === "employee" &&
        user.role.toLowerCase() !== "employee" &&
        user.role.toLowerCase() !== "manager"
      ) {
        return res.json({ success: false, message: "Not an Employee" });
      }
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user[idField], role });

    return res.json({
      success: true,
      token,
      user: {
        id: user[idField],
        name: user[nameField],
        role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export { signupConsumer, login };
