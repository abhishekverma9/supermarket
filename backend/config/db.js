import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

let pool;

export const connectDB = async () => {
  try {
    if (!pool) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL, // Supabase Transaction Pooler URL
        ssl: { rejectUnauthorized: false },        // Accept self-signed cert
        max: 10,
      });

      // Test connection
      const client = await pool.connect();
      console.log("✅ PostgreSQL (Supabase) Connected!");
      client.release();

      // Handle unexpected errors
      pool.on("error", (err) => {
        console.error("❌ Unexpected PostgreSQL error:", err);
        process.exit(-1);
      });
    }
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err);
    process.exit(1);
  }
};

// Function to get the pool in other files
export const db = () => pool;
