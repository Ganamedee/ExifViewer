const express = require("express");
const multer = require("multer");
const ExifReader = require("exifreader");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "public/uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const tags = await ExifReader.load(buffer);

    // Clean up the tags object for better display
    const cleanedTags = {};
    for (let [key, value] of Object.entries(tags)) {
      if (key !== "MakerNote") {
        // Skip MakerNote as it's usually not useful
        cleanedTags[key] = value;
      }
    }

    res.json({
      metadata: cleanedTags,
      filename: req.file.originalname,
      filepath: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ error: "Error processing image metadata" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
