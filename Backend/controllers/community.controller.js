const Community = require("../models/community.model");
const University = require("../models/university.model");

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, faculty, year, banner, universityId, universityName } = req.body;

    if (!name || !description || !faculty) {
      return res.status(400).json({
        message: "Name, description, and faculty are required",
      });
    }

    let resolvedUniversityId = universityId || req.user.universityId || "";
    let resolvedUniversityName = String(universityName || "").trim();

    if (!resolvedUniversityId && resolvedUniversityName) {
      const matchedUniversity = await University.findOne({
        name: { $regex: `^${resolvedUniversityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      }).lean();

      if (matchedUniversity) {
        resolvedUniversityId = String(matchedUniversity._id);
        resolvedUniversityName = matchedUniversity.name;
      }
    }

    if (!resolvedUniversityId || !isValidId(resolvedUniversityId)) {
      return res.status(400).json({
        message: "Invalid or missing university ID",
      });
    }

    if (!resolvedUniversityName) {
      const matchedUniversity = await University.findById(resolvedUniversityId).lean();
      resolvedUniversityName = matchedUniversity?.name || "";
    }

    if (!resolvedUniversityName) {
      return res.status(400).json({
        message: "University name is required",
      });
    }

    const community = await Community.create({
      name,
      description,
      faculty,
      year: year || "All Years",
      banner: banner || "",
      members: [req.user.id],
      universityId: resolvedUniversityId,
      universityName: resolvedUniversityName,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Community created successfully",
      data: community,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getCommunities = async (req, res) => {
  try {
    const { universityId: queryUniversityId, faculty, search } = req.query;
    let query = { isActive: true };

    // If user is authenticated, use their universityId (or allow override for system admins)
    let universityId = queryUniversityId;
    if (req.user && !universityId) {
      universityId = req.user.universityId;
    }

    if (universityId) {
      if (!isValidId(universityId)) {
        return res.status(400).json({ message: "Invalid university ID" });
      }
      query.universityId = universityId;
    }

    if (faculty) {
      query.faculty = faculty;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const communities = await Community.find(query)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const result = communities.map((c) => ({
      ...c.toObject(),
      memberCount: c.members.length,
    }));

    res.status(200).json({
      message: "Communities fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all communities including inactive ones - for university admin management
exports.getAllCommunitiesForAdmin = async (req, res) => {
  try {
    const { universityId, faculty, search } = req.query;
    let query = {};

    if (universityId) {
      if (!isValidId(universityId)) {
        return res.status(400).json({ message: "Invalid university ID" });
      }
      query.universityId = universityId;
    }

    if (faculty) {
      query.faculty = faculty;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const communities = await Community.find(query)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const result = communities.map((c) => ({
      ...c.toObject(),
      memberCount: c.members.length,
    }));

    res.status(200).json({
      message: "Communities fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid community ID",
      });
    }

    const community = await Community.findById(id)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email");

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    const result = {
      ...community.toObject(),
      memberCount: community.members.length,
    };

    res.status(200).json({
      message: "Community fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, faculty, year, banner, isActive } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid community ID",
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.createdBy.toString() !== req.user.id && req.user.role !== "system_admin" && req.user.role !== "university_admin") {
      return res.status(403).json({
        message: "Only the creator, university admin, or system admin can update this community",
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (faculty) updateFields.faculty = faculty;
    if (year) updateFields.year = year;
    if (banner !== undefined) updateFields.banner = banner;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updated = await Community.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate("members", "name email avatar")
      .populate("createdBy", "name email");

    res.status(200).json({
      message: "Community updated successfully",
      data: { ...updated.toObject(), memberCount: updated.members.length },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid community ID",
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.createdBy.toString() !== req.user.id && req.user.role !== "system_admin") {
      return res.status(403).json({
        message: "Only the creator or system admin can delete this community",
      });
    }

    await Community.findByIdAndDelete(id);

    res.status(200).json({
      message: "Community deleted successfully",
      data: community,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid community ID",
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "Already a member of this community",
      });
    }

    community.members.push(req.user.id);
    await community.save();

    res.status(200).json({
      message: "Joined community successfully",
      data: community,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid community ID",
      });
    }

    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.id)) {
      return res.status(400).json({
        message: "Not a member of this community",
      });
    }

    if (community.createdBy.toString() === req.user.id) {
      return res.status(400).json({
        message: "Creator cannot leave the community. Delete it instead.",
      });
    }

    community.members = community.members.filter((m) => m.toString() !== req.user.id);
    await community.save();

    res.status(200).json({
      message: "Left community successfully",
      data: community,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getMyCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      members: req.user.id,
      isActive: true,
    })
      .populate("members", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const result = communities.map((c) => ({
      ...c.toObject(),
      memberCount: c.members.length,
    }));

    res.status(200).json({
      message: "My communities fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
