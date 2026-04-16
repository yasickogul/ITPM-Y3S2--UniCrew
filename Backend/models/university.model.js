// models/university.model.js

const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 5000,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", universitySchema);