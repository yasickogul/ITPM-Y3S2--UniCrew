const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded files publicly
app.use('/uploads', express.static(uploadDir));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ====================== FILE UPLOAD ROUTE ======================
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl: fileUrl,
    filename: req.file.originalname
  });
});

// In-memory messages
let messages = [];
let nextId = 1;

io.on('connection', (socket) => {
  console.log('✅ A user connected');

  socket.emit('previousMessages', messages);

  socket.on('sendMessage', (data) => {
    const message = {
      id: nextId++,
      text: data.text || "",
      sender: data.sender || 'Anonymous',
      timestamp: new Date().toISOString(),
      edited: false,
      fileUrl: data.fileUrl || null,
      filename: data.filename || null
    };

    messages.push(message);
    io.emit('receiveMessage', message);
  });

  socket.on('editMessage', (data) => {
    const msg = messages.find(m => m.id === data.id);
    if (msg) {
      msg.text = data.newText;
      msg.edited = true;
      io.emit('messageUpdated', msg);
    }
  });

  socket.on('deleteMessage', (data) => {
    messages = messages.filter(m => m.id !== data.id);
    io.emit('messageDeleted', { id: data.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

