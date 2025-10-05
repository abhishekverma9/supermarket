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
    const [existingConsumer] = await db().query(
      "SELECT * FROM consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new consumer
    const [result] = await db().query(
      `INSERT INTO consumers (first_name, last_name, email, phone, password)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || "", hashedPassword]
    );

    const token = generateToken({ id: result.insertId, role: "consumer" });

    return res.json({
      success: true,
      message: "Account created successfully",
      consumer_id: result.insertId,
      token,
    });
  } catch (error) {
    console.error(error);
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

    let tableName;
    let idField;
    let nameField;

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
    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const user = rows[0];

    // Check role for employee/owner
    if (tableName === "employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.json({ success: false, message: "Not an Owner" });
      }
      if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
        return res.json({ success: false, message: "Not an Employee" });
      }

    }

    // Check password
    // For consumer, you might still want bcrypt.compare
    // const valid = await bcrypt.compare(password, user.password)
    const valid = password === user.password ? true : false

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
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

export { signupConsumer, login };
