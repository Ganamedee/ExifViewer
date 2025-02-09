const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Set correct static file serving
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
