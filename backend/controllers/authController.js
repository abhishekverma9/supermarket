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
    console.log("Login attempt - User found:", { email, role, userRole: user.role, hasPassword: !!user.password });

    // Check role for employee/owner
    if (tableName === "employee") {
      const userRole = user.role ? user.role.toLowerCase().trim() : "";
      
      if (role === "owner") {
        // Owner must have role "admin" or "Admin"
        if (userRole !== "admin") {
          console.log("Owner login failed - user role is not admin:", userRole);
          return res.json({ success: false, message: "Not an Owner. Only users with Admin role can login as Owner." });
        }
      }
      
      if (role === "employee") {
        // Employee can have role "employee", "manager", or empty/NULL (treat as employee)
        if (userRole !== "" && userRole !== "employee" && userRole !== "manager") {
          console.log("Employee login failed - invalid role:", userRole);
          return res.json({ success: false, message: `Not an Employee. User role is: ${user.role || "empty"}` });
        }
      }
    }

    // Check password - try bcrypt first, then fallback to plain text for backward compatibility
    let valid = false;
    if (user.password) {
      // Check if password is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      const isBcryptHash = user.password.startsWith("$2");
      
      if (isBcryptHash) {
        // Try bcrypt comparison for properly hashed passwords
        try {
          valid = await bcrypt.compare(password, user.password);
        } catch (error) {
          console.error("Bcrypt comparison error:", error);
          valid = false;
        }
      } else {
        // Plain text password comparison (for backward compatibility with "hashed_pw_1" etc.)
        valid = password === user.password;
        console.log("Plain text password check:", { provided: password, stored: user.password, match: valid });
      }
    } else {
      console.log("User has no password set");
    }

    if (!valid) {
      console.log("Password validation failed");
      return res.json({ success: false, message: "Invalid credentials. Please check your email and password." });
    }

    // Handle both employee_id and emp_id column names
    const userId = user.employee_id || user.emp_id || user[idField];
    if (!userId) {
      console.error("Could not find user ID field. Available fields:", Object.keys(user));
      return res.json({ success: false, message: "Database error: Could not find user ID" });
    }

    console.log("Login successful for user:", userId);
    const token = generateToken({ id: userId, role });

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
