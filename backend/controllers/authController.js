import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOTP, storeOTP, verifyOTP, isOTPVerified, removeOTP, canResendOTP } from "../utils/otpStore.js";
import { sendLoginOTPEmail, sendOTPEmail, sendSignupOTPEmail } from "../utils/emailService.js";
import { storeAuthSession, getAuthSession, removeAuthSession } from "../utils/authSessionStore.js";

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
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      return res.json({ success: false, message: "User already exists" });
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
      tableName = "Employee";
      idField = "employee_id";
      nameField = "first_name";
    } else if (role === "consumer") {
      tableName = "Consumers";
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
    if (tableName === "Employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.json({ success: false, message: "Not an Owner" });
      }
      if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
        return res.json({ success: false, message: "Not an Employee" });
      }

    }

    // Check password
    // For consumer, you might still want bcrypt.compare
    const valid = await bcrypt.compare(password, user.password)
    // const valid = password === user.password ? true : false

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

// ---------------------------
// Forgot Password - Send OTP
// ---------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email, resend } = req.body; 
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // Check resend cooldown (1 minute)
    if (resend) {
      if (!canResendOTP(email)) {
        return res.json({
          success: false,
          message: "Please wait 1 minute before requesting a new OTP",
        });
      }
    }

    // Check if user exists (check both Consumers and Employee tables)
    let user = null;
    let tableName = null;

    // Check Consumers table
    const [consumers] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );

    if (consumers.length > 0) {
      user = consumers[0];
      tableName = "Consumers";
    } else {
      // Check Employee table
      const [employees] = await db().query(
        "SELECT * FROM Employee WHERE email = ?",
        [email]
      );

      if (employees.length > 0) {
        user = employees[0];
        tableName = "Employee";
      }
    }

    if (!user) { 
      return res.json({success: false,message: "User not found"});
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp); 
    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) { 
      // In development, return OTP in response for testing
      if (process.env.NODE_ENV === "development") {
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
          otp: otp, // Only in development
        });
      }
      return res.json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    } 
    return res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Verify OTP
// ---------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    const verification = verifyOTP(email, otp);

    if (!verification.valid) {
      return res.json({ success: false, message: verification.message });
    }

    return res.json({
      success: true,
      message: verification.message,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Reset Password
// ---------------------------
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Verify OTP first
    if (!isOTPVerified(email)) {
      const verification = verifyOTP(email, otp);
      if (!verification.valid) {
        return res.json({ success: false, message: verification.message });
      }
    }

    // Find user
    let user = null;
    let tableName = null;
    let idField = null;

    // Check Consumers table
    const [consumers] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );

    if (consumers.length > 0) {
      user = consumers[0];
      tableName = "Consumers";
      idField = "consumer_id";
    } else {
      // Check Employee table
      const [employees] = await db().query(
        "SELECT * FROM Employee WHERE email = ?",
        [email]
      );

      if (employees.length > 0) {
        user = employees[0];
        tableName = "Employee";
        idField = "employee_id";
      }
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db().query(
      `UPDATE ${tableName} SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // Remove OTP after successful password reset
    removeOTP(email);

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Send Login OTP
// ---------------------------
const sendLoginOtp = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.json({ success: false, message: "Email, password, and role are required" });
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
      return res.json({ success: false, message: "Invalid role" });
    }

    // Query user
    const [rows] = await db().query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const user = rows[0];

    // Check role for employee/owner
    if (tableName === "Employee") {
      if (role === "owner" && user.role.toLowerCase() !== "admin") {
        return res.json({ success: false, message: "Not an Owner" });
      }
      if (role === "employee" && user.role.toLowerCase() !== "employee" && user.role.toLowerCase() !== "manager") {
        return res.json({ success: false, message: "Not an Employee" });
      }
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Store auth session data
    storeAuthSession(email, "login", {
      userId: user[idField],
      role,
      name: user[nameField],
    });

    // Send OTP via email
    const emailResult = await sendLoginOTPEmail(email, otp);

    if (!emailResult.success) {
      // In development, return OTP in response for testing
      if (process.env.NODE_ENV === "development") {
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
          otp: otp, // Only in development
        });
      }
      return res.json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Verify Login OTP
// ---------------------------
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
      return res.json({ success: false, message: verification.message });
    }

    // Get auth session
    const session = getAuthSession(email);
    if (!session || session.type !== "login") {
      return res.json({ success: false, message: "Session expired. Please login again." });
    }

    // Generate token
    const token = generateToken({ id: session.data.userId, role: session.data.role });

    // Clean up
    removeOTP(email);
    removeAuthSession(email);

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
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Send Signup OTP
// ---------------------------
const sendSignupOtp = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !email || !password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check if consumer already exists
    const [existingConsumer] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Store signup session data (hash password before storing)
    const hashedPassword = await bcrypt.hash(password, 10);
    storeAuthSession(email, "signup", {
      first_name,
      last_name,
      email,
      phone: phone || "",
      password: hashedPassword,
    });

    // Send OTP via email
    const emailResult = await sendSignupOTPEmail(email, otp);

    if (!emailResult.success) {
      // In development, return OTP in response for testing
      if (process.env.NODE_ENV === "development") {
        return res.json({
          success: true,
          message: "OTP generated (email sending failed - check console)",
          otp: otp, // Only in development
        });
      }
      return res.json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ---------------------------
// Verify Signup OTP
// ---------------------------
const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    if (!verification.valid) {
      return res.json({ success: false, message: verification.message });
    }

    // Get signup session
    const session = getAuthSession(email);
    if (!session || session.type !== "signup") {
      return res.json({ success: false, message: "Session expired. Please signup again." });
    }

    // Check if user was created in the meantime
    const [existingConsumer] = await db().query(
      "SELECT * FROM Consumers WHERE email = ?",
      [email]
    );
    if (existingConsumer.length > 0) {
      removeOTP(email);
      removeAuthSession(email);
      return res.json({ success: false, message: "User already exists" });
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
    removeOTP(email);
    removeAuthSession(email);

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

export { signupConsumer, login, forgotPassword, verifyOtp, resetPassword, sendLoginOtp, verifyLoginOtp, sendSignupOtp, verifySignupOtp };