// MySQL-backed auth session storage (production-safe, survives restarts)
// Stores temporary authentication sessions for OTP verification
import { db } from "../config/db.js";

// ────────────────────────────────────
// Initialize auth_sessions table on startup
// ────────────────────────────────────
export const initAuthSessionTable = async () => {
  try {
    await db().query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        type ENUM('login', 'signup') NOT NULL,
        session_data JSON NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_email (email),
        INDEX idx_session_expires (expires_at)
      )
    `);
    console.log("✅ Auth sessions table initialized");

    // Clean up any expired sessions on startup
    await db().query(`DELETE FROM auth_sessions WHERE expires_at < NOW()`);
  } catch (error) {
    console.error("❌ Failed to initialize auth sessions table:", error.message);
  }
};

// ────────────────────────────────────
// Store auth session (10 minute expiry)
// ────────────────────────────────────
export const storeAuthSession = async (email, type, data) => {
  try {
    // Delete any existing session for this email first
    await db().query(`DELETE FROM auth_sessions WHERE email = ?`, [email]);

    // Insert new session with 10-minute expiry
    await db().query(
      `INSERT INTO auth_sessions (email, type, session_data, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [email, type, JSON.stringify(data)]
    );
  } catch (error) {
    console.error("storeAuthSession error:", error.message);
    throw error;
  }
};

// ────────────────────────────────────
// Get auth session
// ────────────────────────────────────
export const getAuthSession = async (email) => {
  try {
    const [rows] = await db().query(
      `SELECT * FROM auth_sessions WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const session = rows[0];
    return {
      type: session.type,
      data: typeof session.session_data === 'string' 
        ? JSON.parse(session.session_data) 
        : session.session_data,
    };
  } catch (error) {
    console.error("getAuthSession error:", error.message);
    return null;
  }
};

// ────────────────────────────────────
// Remove auth session
// ────────────────────────────────────
export const removeAuthSession = async (email) => {
  try {
    await db().query(`DELETE FROM auth_sessions WHERE email = ?`, [email]);
  } catch (error) {
    console.error("removeAuthSession error:", error.message);
  }
};
