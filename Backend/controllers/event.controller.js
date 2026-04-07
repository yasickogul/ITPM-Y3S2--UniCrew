const Event = require("../models/event.model");

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, communityId, communityName, organizer, organizerId, googleFormUrl } = req.body;

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
    });

    res.status(201).json({
      message: "Event created successfully",
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
    const { communityId, status, search } = req.query;
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

    const events = await Event.find(query).sort({ date: 1 });

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

    const event = await Event.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event updated successfully",
      data: event,
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

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event deleted successfully",
      data: event,
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
      date: { $gte: new Date() },
    }).sort({ date: 1 }).limit(10);

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
