import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOTP, storeOTP, verifyOTP, isOTPVerified, removeOTP, canResendOTP } from "../utils/otpStore.js";
import { sendLoginOTPEmail, sendOTPEmail, sendSignupOTPEmail } from "../utils/emailService.js";
import { storeAuthSession, getAuthSession, removeAuthSession } from "../utils/authSessionStore.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

// ---------------------------
// Signup (Consumer only)
// ---------------------------
const signupConsumer = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if consumer already exists
    const [existingConsumer] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new consumer
    const [result] = await db().query(
      `INSERT INTO Consumers (first_name, last_name, email, phone, password)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || "", hashedPassword]
    );

    const token = generateToken({ id: result.insertId, role: "consumer" });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      consumer_id: result.insertId,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Login (All roles)
// ---------------------------
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    let tableName;
    let idField;
    let nameField;

    if (role === "owner" || role === "employee") {
      tableName = "Employee";
      idField = "employee_id";
      nameField = "first_name";
    } else if (role === "consumer") {
      tableName = "Consumers";
      idField = "consumer_id";
      nameField = "first_name";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Query user
    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const user = rows[0];

    // Check role for employee/owner
    if (tableName === "Employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ success: false, message: "Not an Owner" });
      }
      if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
        return res.status(403).json({ success: false, message: "Not an Employee" });
      }

    }

    // Check password
    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
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
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Forgot Password - Send OTP
// ---------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email, resend, role } = req.body; 
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required" });
    }

    // Check resend cooldown (1 minute)
    if (resend) {
      const canResend = await canResendOTP(email);
      if (!canResend) {
        return res.status(429).json({
          success: false,
          message: "Please wait 1 minute before requesting a new OTP",
        });
      }
    }

    let user = null;
    let tableName = "";

    if (role === "consumer") {
      tableName = "Consumers";
    } else if (role === "employee" || role === "owner") {
      tableName = "Employee";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    
    if (rows.length > 0) {
      user = rows[0];
      
      // Role validation for employees/owners
      if (tableName === "Employee") {
        if (role === "owner" && user.role.toLowerCase() !== "admin") {
          return res.status(403).json({ success: false, message: "Not an Owner" });
        }
        if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
          return res.status(403).json({ success: false, message: "Not an Employee" });
        }
      }
    }

    if (!user) { 
      return res.status(404).json({success: false,message: "User not found"});
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp); 
    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) { 
      // In development, log OTP to console only (never in API response)
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    } 
    return res.json({
      success: true,
      message: "OTP sent to your email",
      otp: !process.env.COMPANY_EMAIL ? otp : undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Verify OTP
// ---------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const verification = await verifyOTP(email, otp);

    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    return res.json({
      success: true,
      message: verification.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Reset Password
// ---------------------------
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;

    if (!email || !otp || !newPassword || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, new password, and role are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Verify OTP first
    const isVerified = await isOTPVerified(email);
    if (!isVerified) {
      const verification = await verifyOTP(email, otp);
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
    }

    let user = null;
    let tableName = "";

    if (role === "consumer") {
      tableName = "Consumers";
    } else if (role === "employee" || role === "owner") {
      tableName = "Employee";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    
    if (rows.length > 0) {
      user = rows[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db().query(
      `UPDATE ${tableName} SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // Remove OTP after successful password reset
    await removeOTP(email);

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Send Login OTP
// ---------------------------
const sendLoginOtp = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    let tableName;
    let idField;
    let nameField;

    if (role === "owner" || role === "employee") {
      tableName = "Employee";
      idField = "employee_id";
      nameField = "first_name";
    } else if (role === "consumer") {
      tableName = "Consumers";
      idField = "consumer_id";
      nameField = "first_name";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Query user
    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    const user = rows[0];

    // Check role for employee/owner
    if (tableName === "Employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.status(403).json({ success: false, message: "Not an Owner" });
      }
      if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
        return res.status(403).json({ success: false, message: "Not an Employee" });
      }
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // Store auth session data
    await storeAuthSession(email, "login", {
      userId: user[idField],
      role,
      name: user[nameField],
    });

    // Send OTP via email
    const emailResult = await sendLoginOTPEmail(email, otp);

    if (!emailResult.success) {
      // In development, log OTP to console only (never in API response)
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Login OTP for ${email}: ${otp}`);
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your email",
      otp: !process.env.COMPANY_EMAIL ? otp : undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Verify Login OTP
// ---------------------------
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Verify OTP
    const verification = await verifyOTP(email, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Get auth session
    const session = await getAuthSession(email);
    if (!session || session.type !== "login") {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }

    // Generate token
    const token = generateToken({ id: session.data.userId, role: session.data.role });

    // Clean up
    await removeOTP(email);
    await removeAuthSession(email);

    return res.json({
      success: true,
      token,
      user: {
        id: session.data.userId,
        name: session.data.name,
        role: session.data.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Send Signup OTP
// ---------------------------
const sendSignupOtp = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if consumer already exists
    const [existingConsumer] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // Store signup session data (hash password before storing)
    const hashedPassword = await bcrypt.hash(password, 10);
    await storeAuthSession(email, "signup", {
      first_name,
      last_name,
      email,
      phone: phone || "",
      password: hashedPassword,
    });

    // Send OTP via email
    const emailResult = await sendSignupOTPEmail(email, otp);

    if (!emailResult.success) {
      // In development, log OTP to console only (never in API response)
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Signup OTP for ${email}: ${otp}`);
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your email",
      otp: !process.env.COMPANY_EMAIL ? otp : undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Verify Signup OTP
// ---------------------------
const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Verify OTP
    const verification = await verifyOTP(email, otp);
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Get signup session
    const session = await getAuthSession(email);
    if (!session || session.type !== "signup") {
      return res.status(401).json({ success: false, message: "Session expired. Please signup again." });
    }

    // Check if user was created in the meantime
    const [existingConsumer] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      await removeOTP(email);
      await removeAuthSession(email);
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Insert new consumer
    const [result] = await db().query(
      `INSERT INTO Consumers (first_name, last_name, email, phone, password)
       VALUES (?, ?, ?, ?, ?)`,
      [
        session.data.first_name,
        session.data.last_name,
        session.data.email,
        session.data.phone,
        session.data.password,
      ]
    );

    const token = generateToken({ id: result.insertId, role: "consumer" });

    // Clean up
    await removeOTP(email);
    await removeAuthSession(email);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      consumer_id: result.insertId,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------------------
// Google Login / Signup
// ---------------------------
const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token || !role) {
      return res.status(400).json({ success: false, message: "Token and role are required" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error("Google token verification failed:", err);
      return res.status(401).json({ success: false, message: "Invalid Google token" });
    }

    const email = payload.email;
    const firstName = payload.given_name || "Google";
    const lastName = payload.family_name || "User";

    if (role === "consumer") {
      // Check Consumers table
      const [existingConsumer] = await db().query(
        "SELECT * FROM Consumers WHERE email = ?",
        [email]
      );

      if (existingConsumer.length > 0) {
        // Log them in
        const user = existingConsumer[0];
        const jwtToken = generateToken({ id: user.consumer_id, role: "consumer" });
        return res.json({
          success: true,
          message: "Login successful",
          token: jwtToken,
          user: { id: user.consumer_id, name: user.first_name, role: "consumer" },
        });
      } else {
        // Create new consumer account
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        const [result] = await db().query(
          `INSERT INTO Consumers (first_name, last_name, email, phone, password)
           VALUES (?, ?, ?, ?, ?)`,
          [firstName, lastName, email, "", hashedPassword]
        );

        const jwtToken = generateToken({ id: result.insertId, role: "consumer" });
        return res.status(201).json({
          success: true,
          message: "Account created successfully",
          token: jwtToken,
          user: { id: result.insertId, name: firstName, role: "consumer" },
        });
      }
    } else if (role === "employee" || role === "owner") {
      // Check Employee table
      const [existingEmployee] = await db().query(
        "SELECT * FROM Employee WHERE email = ?",
        [email]
      );

      if (existingEmployee.length > 0) {
        const user = existingEmployee[0];
        
        // Verify role constraints
        if (role === "owner" && user.role.toLowerCase() !== "admin") {
          return res.status(403).json({ success: false, message: "Not an Owner" });
        }
        if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
          return res.status(403).json({ success: false, message: "Not an Employee" });
        }

        const jwtToken = generateToken({ id: user.employee_id, role });
        return res.json({
          success: true,
          message: "Login successful",
          token: jwtToken,
          user: { id: user.employee_id, name: user.first_name, role },
        });
      } else {
        // Do NOT auto-create employees
        return res.status(403).json({ success: false, message: "Unauthorized: Email not registered as Employee" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { signupConsumer, login, forgotPassword, verifyOtp, resetPassword, sendLoginOtp, verifyLoginOtp, sendSignupOtp, verifySignupOtp, googleLogin };