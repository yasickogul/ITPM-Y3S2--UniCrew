const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    studentId: {
      type: String,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "university_admin", "system_admin"],
      default: "student",
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    university: {
      type: String,
    },
    degree: {
      type: String,
    },
    year: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
    avatar: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    about: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
