import bcrypt from "bcrypt";
import { db,connectDB } from "../config/db.js";

const addAdmin = async () => {
  try { 
    await connectDB();
    // 1. Generate a hashed password
    const plainPassword = "Admin@123"; // Change this as needed
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("🔐 Hashed Password:", hashedPassword);

    // 2. Insert admin user into Employee table
    const [result] = await db().query(
      `INSERT INTO Employee (first_name, last_name, role, salary, phone, email, password)
       VALUES (?, ?, 'Admin', ?, ?, ?, ?)`,
      ["John", "Doe", 75000.0, "9876543210", "admin@supermarket.com", hashedPassword]
    );

    console.log("✅ Admin added with employee_id:", result.insertId);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding admin:", error);
    process.exit(1);
  }
};

addAdmin();
