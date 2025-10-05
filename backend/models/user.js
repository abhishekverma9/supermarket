import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = {
  // Create a new consumer
  create: async ({ name, email, password, phone, house_no, street, building }) => {
    // Check if email exists
    const [existing] = await db.query('SELECT * FROM Consumers WHERE email = ?', [email]);
    if (existing.length > 0) return null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO Consumers
       (first_name, email, password, phone, house_no, street, building_or_flat)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, house_no, street, building_or_flat]
    );

    return result.insertId;
  },

  // Find consumer by email
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM Consumers WHERE email = ?', [email]);
    return rows[0];
  },

  // Compare password
  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

export default User;
