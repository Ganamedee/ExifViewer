const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Changed to memory storage for serverless

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const buffer = req.file.buffer; // Use buffer directly instead of file system
    const tags = await ExifReader.load(buffer);

    const cleanedTags = {};
    for (let [key, value] of Object.entries(tags)) {
      if (key !== "MakerNote") {
        cleanedTags[key] = value;
      }
    }

    res.json({
      metadata: cleanedTags,
      filename: req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing image metadata" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app; // Export for Vercel
