const UniversityAdmin = require("../models/universityAdmin.model");
const University = require("../models/university.model");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

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

    const admin = await UniversityAdmin.create({
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      university: assignedUniversity,
    });

    const populatedAdmin = await UniversityAdmin.findById(admin._id).populate(
      "university",
      "name domain"
    );

    return res.status(201).json({
      message: "University admin created successfully",
      data: populatedAdmin,
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
