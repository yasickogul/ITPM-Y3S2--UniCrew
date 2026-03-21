// models/university.model.js

const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  domain: {
    type: String,
    required: true,
    unique: true,
    // example: @my.sliit.lk
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("University", universitySchema);