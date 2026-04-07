require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const University = require("./models/university.model");
const User = require("./models/user.model");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await University.deleteMany({});

    console.log("Seeding universities...");
    const universities = await University.insertMany([
      {
        name: "Harvard University",
        email: "admin@harvard.edu",
        domain: "harvard.edu",
      },
      {
        name: "Stanford University",
        email: "admin@stanford.edu",
        domain: "stanford.edu",
      },
      {
        name: "MIT",
        email: "admin@mit.edu",
        domain: "mit.edu",
      },
      {
        name: "Yale University",
        email: "admin@yale.edu",
        domain: "yale.edu",
      },
      {
        name: "Princeton University",
        email: "admin@princeton.edu",
        domain: "princeton.edu",
      },
    ]);

    console.log("Seeding system admin...");
    const sysAdmin = await User.create({
      name: "System Administrator",
      email: "sysadmin@unicrew.com",
      password: "admin123",
      role: "system_admin",
    });

    console.log("Seeding university admins...");
    const uniAdmins = await User.insertMany([
      {
        name: "Harvard Admin",
        email: "admin@harvard.edu",
        password: "admin123",
        role: "university_admin",
        university: "Harvard University",
        universityId: universities[0]._id,
      },
      {
        name: "Stanford Admin",
        email: "admin@stanford.edu",
        password: "admin123",
        role: "university_admin",
        university: "Stanford University",
        universityId: universities[1]._id,
      },
      {
        name: "MIT Admin",
        email: "admin@mit.edu",
        password: "admin123",
        role: "university_admin",
        university: "MIT",
        universityId: universities[2]._id,
      },
    ]);

    console.log("Seeding sample students...");
    const students = await User.insertMany([
      {
        name: "John Doe",
        email: "john.doe@harvard.edu",
        password: "student123",
        role: "student",
        studentId: "STU2024001",
        degree: "Computer Science",
        year: "3",
        university: "Harvard University",
        universityId: universities[0]._id,
        skills: ["React", "Node.js", "Python"],
        about: "Passionate about building innovative solutions.",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@stanford.edu",
        password: "student123",
        role: "student",
        studentId: "STU2024002",
        degree: "Data Science",
        year: "2",
        university: "Stanford University",
        universityId: universities[1]._id,
        skills: ["Python", "Machine Learning", "SQL"],
        about: "Data enthusiast and problem solver.",
      },
      {
        name: "Alex Chen",
        email: "alex.chen@mit.edu",
        password: "student123",
        role: "student",
        studentId: "STU2024003",
        degree: "Engineering",
        year: "4",
        university: "MIT",
        universityId: universities[2]._id,
        skills: ["C++", "Java", "Algorithms"],
        about: "Love competitive programming.",
      },
    ]);

    console.log("\n✅ Seeding completed successfully!\n");
    console.log("=" .repeat(50));
    console.log("SYSTEM ADMIN CREDENTIALS:");
    console.log(`  Email: sysadmin@unicrew.com`);
    console.log(`  Password: admin123`);
    console.log("\nUNIVERSITY ADMIN CREDENTIALS:");
    console.log(`  Email: admin@harvard.edu / Password: admin123`);
    console.log(`  Email: admin@stanford.edu / Password: admin123`);
    console.log(`  Email: admin@mit.edu / Password: admin123`);
    console.log("\nSTUDENT CREDENTIALS:");
    console.log(`  Email: john.doe@harvard.edu / Password: student123`);
    console.log(`  Email: jane.smith@stanford.edu / Password: student123`);
    console.log(`  Email: alex.chen@mit.edu / Password: student123`);
    console.log("=" .repeat(50));

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
