import dotenv from "dotenv";
dotenv.config();
import { connectDB, db } from "./config/db.js";

const checkUsers = async () => {
  try {
    await connectDB();
    const pool = db();
    
    console.log("\n--- Consumer Accounts ---");
    const [consumers] = await pool.query("SELECT consumer_id, first_name, last_name, email FROM Consumers");
    if (consumers.length === 0) {
      console.log("No consumers found in the database.");
    } else {
      console.table(consumers);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUsers();
