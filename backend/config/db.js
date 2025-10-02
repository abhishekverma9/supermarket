import mysql from "mysql2/promise";

let pool;
export const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "supermarket",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected!");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
    process.exit(1); // Stop server if DB connection fails
  }
};

// Export pool for models
export const db = () => pool;
