require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const universityRoutes = require("./routes/university.routes");
const eventRoutes = require("./routes/event.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const communityRoutes = require("./routes/community.routes");
const universityAdminRoutes = require("./routes/universityAdmin.routes");
const discussionRoutes = require("./routes/discussion.routes");
const aiRoutes = require("./routes/ai.routes");
const systemAdminRoutes = require("./routes/systemAdmin.routes");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected."))
  .catch((err) => console.log(err));

app.use("/api/universities", universityRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/system-admin", systemAdminRoutes);
app.use("/api/system-admin/university-admins", universityAdminRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
