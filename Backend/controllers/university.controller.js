// controllers/university.controller.js

const University = require("../models/university.model");

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// CREATE UNIVERSITY
exports.createUniversity = async (req, res) => {
  try {
    const { name, email, domain } = req.body;

    if (!name || !email || !domain) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const university = await University.create({
      name,
      email,
      domain,
    });

    res.status(201).json({
      message: "University created successfully",
      data: university,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "University with given email or domain already exists",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL UNIVERSITIES
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Universities fetched successfully",
      data: universities,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET UNIVERSITY BY ID
exports.getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid university id",
      });
    }

    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    res.status(200).json({
      message: "University fetched successfully",
      data: university,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE UNIVERSITY BY ID
exports.updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, domain } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid university id",
      });
    }

    if (!name && !email && !domain) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    const university = await University.findByIdAndUpdate(
      id,
      { name, email, domain },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    res.status(200).json({
      message: "University updated successfully",
      data: university,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "University with given email or domain already exists",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE UNIVERSITY BY ID
exports.deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid university id",
      });
    }

    const university = await University.findByIdAndDelete(id);

    if (!university) {
      return res.status(404).json({
        message: "University not found",
      });
    }

    res.status(200).json({
      message: "University deleted successfully",
      data: university,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};