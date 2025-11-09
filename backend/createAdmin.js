import bcrypt from "bcrypt";
import { db, connectDB } from "./config/db.js";

const createAdmin = async () => {
  try {
    await connectDB();
    const pool = db();
    if (!pool) throw new Error("DB pool not initialized");

    // Admin details
    const adminData = {
      firstName: "Abhishek",
      lastName: "Verma",
      role: "Admin",
      email: "abhishek@admin.com",
      password: "admin123", // plaintext, will be hashed
      salary: 500000,
      phone: "9876543210",
      managerId: null,      // first admin has no manager
      profilePhoto: "https://i.pravatar.cc/150?img=12", // sample photo URL
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insert into Employee table
    const result = await pool.query(
      `INSERT INTO Employee
      (first_name, last_name, role, salary, phone, email, password, manager_id, profile_photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        adminData.firstName,
        adminData.lastName,
        adminData.role,
        adminData.salary,
        adminData.phone,
        adminData.email,
        hashedPassword,
        adminData.managerId,
        adminData.profilePhoto,
      ]
    );

    console.log("✅ Admin created:", result.rows[0]);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
