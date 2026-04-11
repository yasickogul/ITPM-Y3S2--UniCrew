require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user.model");

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, "email role name");
    console.log("Users in database:");
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
  }
};

checkUsers();
