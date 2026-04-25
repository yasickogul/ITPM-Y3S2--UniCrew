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

exports.updateUniversityAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, assignedUniversity, status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid admin id" });
    }

    const admin = await UniversityAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "University admin not found" });
    }

    const prevEmail = admin.email;

    if (fullName !== undefined && fullName !== null) {
      const name = String(fullName).trim();
      if (!name) {
        return res.status(400).json({ message: "Full name cannot be empty" });
      }
      admin.fullName = name;
    }

    let newEmail = prevEmail;
    if (email !== undefined && email !== null) {
      newEmail = String(email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(newEmail)) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      if (newEmail !== prevEmail) {
        const dupAdmin = await UniversityAdmin.findOne({ email: newEmail, _id: { $ne: id } });
        const dupUser = await User.findOne({ email: newEmail });
        if (dupAdmin || dupUser) {
          return res.status(409).json({ message: "Email is already in use" });
        }
        admin.email = newEmail;
      }
    }

    if (assignedUniversity !== undefined && assignedUniversity !== null) {
      if (!isValidId(assignedUniversity)) {
        return res.status(400).json({ message: "Invalid university id" });
      }
      const university = await University.findById(assignedUniversity);
      if (!university) {
        return res.status(404).json({ message: "Assigned university not found" });
      }
      admin.university = assignedUniversity;
    }

    if (status !== undefined && status !== null) {
      const s = String(status).trim();
      if (!["Active", "Inactive"].includes(s)) {
        return res.status(400).json({ message: "Status must be Active or Inactive" });
      }
      admin.status = s;
    }

    await admin.save();

    const user = await User.findOne({
      email: prevEmail,
      role: { $regex: /^university_admin$/i },
    });

    if (user) {
      if (fullName !== undefined && fullName !== null) {
        user.fullName = String(fullName).trim();
      }
      if (newEmail !== prevEmail) {
        user.email = newEmail;
      }
      if (assignedUniversity !== undefined && assignedUniversity !== null) {
        user.university = assignedUniversity;
      }
      if (status !== undefined && status !== null) {
        user.status = admin.status;
      }
      await user.save();
    }

    const populated = await UniversityAdmin.findById(admin._id).populate("university", "name domain");

    return res.status(200).json({
      message: "University admin updated successfully",
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already in use" });
    }
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteUniversityAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid admin id" });
    }

    const admin = await UniversityAdmin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "University admin not found" });
    }

    const email = admin.email;

    await User.deleteMany({
      email,
      role: { $regex: /^university_admin$/i },
    });

    await UniversityAdmin.findByIdAndDelete(id);

    return res.status(200).json({
      message: "University admin deleted successfully",
      data: { id, email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
