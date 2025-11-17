// genHash.js
import bcrypt from "bcrypt";

const plainPassword = "admin@123";  
const saltRounds = 10;

const run = async () => {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  console.log("\n🔐 Plain password:", plainPassword);
  console.log("✅ Hashed password:\n", hash, "\n");
};

run();
