const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const Community = require("../models/community.model");
const Event = require("../models/event.model");
const Discussion = require("../models/discussion.model");

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const JWT_SECRET = process.env.JWT_SECRET || "unicrew_secret_key";
const isDatabaseUnavailableError = (error) => {
  const message = String(error?.message || "");
  return (
    error?.name === "MongooseServerSelectionError" ||
    message.includes("buffering timed out") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND")
  );
};

const generateTokens = (user) => {
  const token = jwt.sign({ id: user._id, role: user.role, universityId: user.universityId }, JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
  return { token, refreshToken };
};

const setCookies = (res, user) => {
  const { token, refreshToken } = generateTokens(user);
  
  const cookieOptions = {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });

  res.cookie("userRole", user.role, {
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });

  res.cookie("userId", user._id.toString(), {
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...cookieOptions,
  });

  return { token, refreshToken };
};

const clearCookies = (res) => {
  const cookieOptions = {
    expires: new Date(0),
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("token", "", { httpOnly: true, ...cookieOptions });
  res.cookie("refreshToken", "", { httpOnly: true, ...cookieOptions });
  res.cookie("userRole", "", { httpOnly: false, ...cookieOptions });
  res.cookie("userId", "", { httpOnly: false, ...cookieOptions });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, degree, year, linkedin, github, universityId, university } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      studentId,
      degree,
      year,
      linkedin,
      github,
      universityId,
      university,
      role: "student",
    });

    const { token, refreshToken } = setCookies(res, user);

    res.status(201).json({
      message: "User registered successfully",
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    if (role && role !== user.role) {
      return res.status(403).json({
        message: "Invalid credentials for selected role",
      });
    }

    const { token, refreshToken } = setCookies(res, user);

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        refreshToken,
        user: {
          id: user._id.toString(),
          name: user.fullName || user.name || "User",
          email: user.email,
          role: user.role,
          university: user.university || null,
          universityId: user.universityId ? user.universityId.toString() : null,
        },
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return res.status(503).json({
        message: "Database is temporarily unavailable. Please try again in a few seconds.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    clearCookies(res);
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.headers["x-refresh-token"] || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      clearCookies(res);
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const { token, refreshToken: newRefreshToken } = setCookies(res, user);

    res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        user,
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    clearCookies(res);
    res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, degree, year, linkedin, github, skills, about } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (degree) updateFields.degree = degree;
    if (year) updateFields.year = year;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (github !== undefined) updateFields.github = github;
    if (skills) updateFields.skills = skills;
    if (about !== undefined) updateFields.about = about;

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, universityId, search } = req.query;
    let query = { isActive: true };

    if (role) {
      query.role = role;
    }

    if (universityId) {
      if (!isValidId(universityId)) {
        return res.status(400).json({ message: "Invalid university ID" });
      }
      query.universityId = universityId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const normalizedUserId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const [joinedCommunities, myCommunityIds, recentPosts] = await Promise.all([
      Community.find({ members: normalizedUserId, isActive: true })
        .sort({ updatedAt: -1 })
        .limit(5),
      Community.find({ members: normalizedUserId, isActive: true }).distinct("_id"),
      Discussion.find({ authorId: String(userId) }).sort({ createdAt: -1 }).limit(5),
    ]);

    const upcomingEventsQuery =
      myCommunityIds.length > 0
        ? { communityId: { $in: myCommunityIds }, status: "upcoming", approvalStatus: "approved" }
        : { _id: null };

    const upcomingEvents = await Event.find(upcomingEventsQuery).sort({ date: 1 }).limit(5);

    res.status(200).json({
      message: "Dashboard fetched successfully",
      data: {
        joinedCommunities,
        upcomingEvents,
        recentPosts,
        metrics: {
          joinedCommunities: joinedCommunities.length,
          upcomingEvents: upcomingEvents.length,
          myPosts: recentPosts.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
