// MySQL-backed OTP storage (production-safe, survives restarts)
import { db } from "../config/db.js";

// ────────────────────────────────────
// Initialize OTP table on startup
// ────────────────────────────────────
export const initOTPTable = async () => {
  try {
    await db().query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_email (email),
        INDEX idx_otp_expires (expires_at)
      )
    `);
    console.log("✅ OTP table initialized");

    // Clean up any expired OTPs on startup
    await db().query(`DELETE FROM otp_store WHERE expires_at < NOW()`);
  } catch (error) {
    console.error("❌ Failed to initialize OTP table:", error.message);
  }
};

// ────────────────────────────────────
// Generate 6-digit OTP
// ────────────────────────────────────
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ────────────────────────────────────
// Check if resend is allowed (1 minute cooldown)
// ────────────────────────────────────
export const canResendOTP = async (email) => {
  try {
    const [rows] = await db().query(
      `SELECT created_at FROM otp_store WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return true;

    const lastSent = new Date(rows[0].created_at).getTime();
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return lastSent < oneMinuteAgo;
  } catch (error) {
    console.error("canResendOTP error:", error.message);
    return true; // Allow on error to avoid blocking users
  }
};

// ────────────────────────────────────
// Store OTP with expiration (10 minutes)
// ────────────────────────────────────
export const storeOTP = async (email, otp) => {
  try {
    // Delete any existing OTP for this email first
    await db().query(`DELETE FROM otp_store WHERE email = ?`, [email]);

    // Insert new OTP with 10-minute expiry
    await db().query(
      `INSERT INTO otp_store (email, otp, verified, expires_at) VALUES (?, ?, FALSE, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [email, otp]
    );
  } catch (error) {
    console.error("storeOTP error:", error.message);
    throw error;
  }
};

// ────────────────────────────────────
// Verify OTP
// ────────────────────────────────────
export const verifyOTP = async (email, otp) => {
  try {
    const [rows] = await db().query(
      `SELECT * FROM otp_store WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return { valid: false, message: "OTP not found or expired" };
    }

    const stored = rows[0];

    if (stored.otp !== otp) {
      return { valid: false, message: "Invalid OTP" };
    }

    // Mark as verified
    await db().query(
      `UPDATE otp_store SET verified = TRUE WHERE id = ?`,
      [stored.id]
    );

    return { valid: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("verifyOTP error:", error.message);
    return { valid: false, message: "OTP verification failed" };
  }
};

// ────────────────────────────────────
// Check if OTP is verified
// ────────────────────────────────────
export const isOTPVerified = async (email) => {
  try {
    const [rows] = await db().query(
      `SELECT verified FROM otp_store WHERE email = ? AND expires_at > NOW() AND verified = TRUE ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("isOTPVerified error:", error.message);
    return false;
  }
};

// ────────────────────────────────────
// Remove OTP after use
// ────────────────────────────────────
export const removeOTP = async (email) => {
  try {
    await db().query(`DELETE FROM otp_store WHERE email = ?`, [email]);
  } catch (error) {
    console.error("removeOTP error:", error.message);
  }
};
