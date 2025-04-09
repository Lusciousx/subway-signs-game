const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch"); // Ensure this is installed

const app = express();
require("dotenv").config();

const Score = require("./models/Score");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB error:", err));

// Default route for Railway health check
app.get("/", (req, res) => {
  res.send("Subway Signs Game server is running 🚀");
});

// Save score to DB
app.post("/api/leaderboard", async (req, res) => {
  const { username, score } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ message: "Username and score required" });
  }

  try {
    const newScore = new Score({ username, score });
    await newScore.save();
    res.status(201).json({ message: "Score submitted!" });
  } catch (error) {
    console.error("Score submission failed:", error);
    res.status(500).json({ message: "Failed to submit score" });
  }
});

// Get top 10 scores
app.get("/api/leaderboard", async (req, res) => {
  try {
    const topScores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(topScores);
  } catch (error) {
    console.error("Fetching leaderboard failed:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
