require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const universityRoutes = require("./routes/university.routes");

const app = express();
const PORT = process.env.PORT;

// ONLY REQUIRED middleware (for JSON body)
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected."))
  .catch((err) => console.log(err));

// Routes
app.use("/api/universities", universityRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});