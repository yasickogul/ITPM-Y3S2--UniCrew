// models/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  role: {
    type: String,
    enum: ["system_admin", "university_admin"],
    default: "university_admin",
  },

  assignedUniversity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);