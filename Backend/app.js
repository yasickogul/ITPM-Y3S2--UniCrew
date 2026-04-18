require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const universityRoutes = require("./routes/university.routes");
const discussionRoutes = require("./routes/discussion.routes");
const aiRoutes = require("./routes/ai.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5050;
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.FRONTEND_URL,
      ...(process.env.FRONTEND_URLS || '').split(',').map((value) => value.trim()),
      'http://localhost:5173',
      'http://localhost:5174',
    ].filter(Boolean)
  )
);

// middleware (for JSON body with 50MB limit for images)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'x-user-name',
    'x-user-university',
    'x-user-role',
  ],
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected."))
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/universities", universityRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/ai", aiRoutes);

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Test Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
