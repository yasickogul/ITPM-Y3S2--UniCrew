const UniversityAdmin = require("../models/universityAdmin.model");
const University = require("../models/university.model");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const generateTemporaryPassword = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.createUniversityAdmin = async (req, res) => {
  try {
    const { fullName, email, assignedUniversity } = req.body;

    if (!fullName || !email || !assignedUniversity) {
      return res.status(400).json({
        message: "Full name, email and assigned university are required",
      });
    }

    if (!EMAIL_REGEX.test(String(email).trim().toLowerCase())) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    if (!isValidId(assignedUniversity)) {
      return res.status(400).json({
        message: "Invalid university id",
      });
    }

    const university = await University.findById(assignedUniversity);

    if (!university) {
      return res.status(404).json({
        message: "Assigned university not found",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const admin = await UniversityAdmin.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      university: assignedUniversity,
    });

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "university_admin",
      university: assignedUniversity,
      status: "Active",
    });

    const passwordDeliveryToken = jwt.sign(
      {
        email: normalizedEmail,
        role: "university_admin",
        purpose: "temporary_password_delivery",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const populatedAdmin = await UniversityAdmin.findById(admin._id).populate(
      "university",
      "name domain"
    );

    return res.status(201).json({
      message: "University admin created successfully",
      data: populatedAdmin,
      credentials: {
        // Demo flow until email service is added.
        temporaryPassword,
        passwordDeliveryToken,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "University admin with given email already exists",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getUniversityAdmins = async (_req, res) => {
  try {
    const admins = await UniversityAdmin.find()
      .populate("university", "name domain")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "University admins fetched successfully",
      data: admins,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
