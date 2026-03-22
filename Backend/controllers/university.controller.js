// controllers/university.controller.js

const University = require("../models/university.model");

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
    res.status(500).json({
      message: error.message,
    });
  }
};