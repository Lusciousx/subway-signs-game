const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const scoreSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  score: Number,
  date: { type: Date, default: Date.now }
});

const Score = mongoose.model("Score", scoreSchema);

router.post("/", async (req, res) => {
  const { name, avatar, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const newScore = new Score({ name, avatar, score });
    await newScore.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/top", async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
