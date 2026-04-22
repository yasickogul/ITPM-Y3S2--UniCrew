const express = require('express');
const router = express.Router();
const {
  getMessages,
  addMessage,
  updateMessage,
  deleteMessage,
} = require('./controller');

// GET  /api/messages        — fetch all chat messages
router.get('/messages', getMessages);

// POST /api/messages        — create a new message (REST fallback)
router.post('/messages', addMessage);

// PUT  /api/messages/:id    — edit a message by _id
router.put('/messages/:id', updateMessage);

// DELETE /api/messages/:id  — delete a message by _id
router.delete('/messages/:id', deleteMessage);

module.exports = router;

