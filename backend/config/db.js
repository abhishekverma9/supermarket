import mysql from "mysql2/promise";
import fs from "fs";

let pool;

export const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        ca: fs.readFileSync("./certs/ca.pem"),
      },
    });

    // Test connection
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected to Aiven with SSL!");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
    process.exit(1);
  }
};

// Export pool for use in queries
export const db = () => pool;
