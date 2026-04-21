require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.model");

const testPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Get a student user
    const student = await User.findOne({ email: "john.doe@harvard.edu" });
    console.log("Student found:", student.email, student.name);
    
    // Test password
    const isMatch = await student.comparePassword("student123");
    console.log("Password 'student123' matches:", isMatch);
    
    // Also test system admin
    const sysadmin = await User.findOne({ email: "sysadmin@unicrew.com" });
    console.log("\nSystem Admin found:", sysadmin.email, sysadmin.name);
    const isAdminMatch = await sysadmin.comparePassword("admin123");
    console.log("Password 'admin123' matches:", isAdminMatch);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testPassword();
