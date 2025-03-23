const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const extractTextFromImage = require("../utils/geminiExtractor");
const Evaluation = require("../models/Evaluation");

const router = express.Router();

// Configure Multer to use memory storage (no temp files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST - Create Evaluation
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { referenceAnswers, difficulty } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ error: "Image is required" });

    // Upload image to Cloudinary from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "evaluations" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Image upload failed" });
        }

        const imageUrl = result.secure_url;

        // Extract text from image buffer instead of file path
        const extractedAnswers = await extractTextFromImage(imageFile.buffer);

        // Save extracted data to MongoDB
        const newEvaluation = new Evaluation({
          imageUrl,
          referenceAnswers,
          extractedAnswers,
          difficulty,
        });

        await newEvaluation.save();

        res.status(201).json({ message: "Evaluation created successfully", data: newEvaluation });
      }
    );

    uploadStream.end(imageFile.buffer);
  } catch (error) {
    console.error("Evaluation Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
