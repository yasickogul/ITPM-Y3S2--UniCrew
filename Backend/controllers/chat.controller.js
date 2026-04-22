const Message = require('./model');

// GET all messages (sorted oldest-first for chat display)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create a new message (REST fallback — real-time flow uses Socket.IO)
const addMessage = async (req, res) => {
  try {
    const { sender, text, fileUrl, filename } = req.body;

    if (!sender) {
      return res.status(400).json({ error: 'sender is required' });
    }
    if (!text && !fileUrl) {
      return res.status(400).json({ error: 'Message text or file is required' });
    }

    const message = new Message({ sender, text, fileUrl, filename });
    const saved = await message.save();
    res.status(201).json({ message: 'Message added successfully', data: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update (edit) a message by its MongoDB _id
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'New text is required' });
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { text: text.trim(), edited: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a message by its MongoDB _id
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMessages, addMessage, updateMessage, deleteMessage };


