const Event = require("../models/event.model");

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const isPendingStatus = (status) => status === "pending" || status === undefined || status === null;

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, communityId, communityName, organizer, organizerId, googleFormUrl } = req.body;

    // Check authorization - user can only create events for themselves
    if (req.user && req.user.id !== organizerId) {
      return res.status(403).json({
        message: "You can only create events for yourself",
      });
    }

    if (!title || !description || !date || !time || !location || !communityId || !communityName || !organizer || !organizerId) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (!isValidId(communityId) || !isValidId(organizerId)) {
      return res.status(400).json({
        message: "Invalid community or organizer ID",
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      communityId,
      communityName,
      organizer,
      organizerId,
      googleFormUrl: googleFormUrl || "",
      approvalStatus: "pending",
    });

    res.status(201).json({
      message: "Event created successfully. Awaiting admin approval.",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { communityId, status, search, approvalStatus } = req.query;
    let query = {};

    if (communityId) {
      if (!isValidId(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }
      query.communityId = communityId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by approval status
    // Students see: approved events + their own pending events
    // Admins see: all events
    if (req.user?.role === "student") {
      query.$or = [
        { approvalStatus: "approved" },
        { organizerId: req.user.id, approvalStatus: "pending" },
        { organizerId: req.user.id, approvalStatus: { $exists: false } }
      ];
    } else if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.status(200).json({
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check if student can view pending events - only their own
    if (req.user?.role === "student" && isPendingStatus(event.approvalStatus) && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to view this event",
      });
    }

    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.status(200).json({
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, googleFormUrl, status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check authorization - only organizer can update their own event
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own events",
      });
    }

    // Students can only update pending events
    if (req.user?.role === "student" && !isPendingStatus(event.approvalStatus)) {
      return res.status(403).json({
        message: "You can only edit events that are pending approval",
      });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (date) updateFields.date = date;
    if (time) updateFields.time = time;
    if (location) updateFields.location = location;
    if (googleFormUrl !== undefined) updateFields.googleFormUrl = googleFormUrl;
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check authorization - only organizer can delete their own event
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own events",
      });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    res.status(200).json({
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "upcoming",
      approvalStatus: "approved",
      date: { $gte: new Date() },
    }).sort({ date: 1 }).limit(10);

    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.status(200).json({
      message: "Upcoming events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getPendingEvents = async (req, res) => {
  try {
    // Only university admins can view pending events
    if (req.user?.role !== "university_admin") {
      return res.status(403).json({
        message: "Access denied. Only university admins can view pending events.",
      });
    }

    const events = await Event.find({
      $or: [
        { approvalStatus: "pending" },
        { approvalStatus: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });

    res.status(200).json({
      message: "Pending events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    // Only university admins can approve events
    if (req.user?.role !== "university_admin") {
      return res.status(403).json({
        message: "Access denied. Only university admins can approve events.",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (!isPendingStatus(event.approvalStatus)) {
      return res.status(400).json({
        message: "Only pending events can be approved",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { approvalStatus: "approved", declineReason: "" },
      { new: true }
    );

    res.status(200).json({
      message: "Event approved successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.declineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid event ID",
      });
    }

    // Only university admins can decline events
    if (req.user?.role !== "university_admin") {
      return res.status(403).json({
        message: "Access denied. Only university admins can decline events.",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (!isPendingStatus(event.approvalStatus)) {
      return res.status(400).json({
        message: "Only pending events can be declined",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { approvalStatus: "declined", declineReason: reason || "" },
      { new: true }
    );

    res.status(200).json({
      message: "Event declined successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
