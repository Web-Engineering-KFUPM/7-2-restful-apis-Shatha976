import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db.js";
import { Song } from "./models/song.model.js";

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

/** TODO 1 — Connect to MongoDB */
try {
  await connectDB(process.env.MONGO_URL);
  console.log("Mongo connected");
} catch (err) {
  console.error("Connection error:", err.message);
}

/** TODO 4 — GET all + GET by id */
app.get("/api/songs", async (_req, res) => {
  const rows = await Song.find().sort({ createdAt: -1 });
  res.json(rows);
});

app.get("/api/songs/:id", async (req, res) => {
  const s = await Song.findById(req.params.id);
  if (!s) return res.status(404).json({ message: "Song not found" });
  res.json(s);
});

/** TODO 3 — POST Insert song */
app.post("/api/songs", async (req, res) => {
  try {
    const { title = "", artist = "", year } = req.body || {};
    const created = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      year
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message || "Create failed" });
  }
});

/** TODO 5 — PUT Update */
app.put("/api/songs/:id", async (req, res) => {
  try {
    const updated = await Song.findByIdAndUpdate(
      req.params.id,
      req.body || {},
      { new: true, runValidators: true, context: "query" }
    );
    if (!updated) return res.status(404).json({ message: "Song not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Update failed" });
  }
});

/** TODO 6 — DELETE */
app.delete("/api/songs/:id", async (req, res) => {
  const deleted = await Song.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Song not found" });
  res.status(204).end();
});

app.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
