const express = require("express");
const multer = require("multer");
const extractTextFromImage = require("../utils/geminiExtractor");
const Evaluation = require("../models/Evaluation");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("🔹 Received POST request to /api/evaluations");

    const { referenceAnswers, difficulty } = req.body;
    const imageFile = req.file;

    console.log("📌 Request Body:", req.body);
    console.log("📸 Uploaded Image:", imageFile ? "Received" : "Not Received");

    if (!imageFile || !referenceAnswers || referenceAnswers.length === 0 || !difficulty) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("🔍 Extracting text from image...");
    const extractedAnswers = await extractTextFromImage(imageFile.buffer);
    console.log("📝 Extracted Answers:", extractedAnswers);

    const parsedReferenceAnswers = JSON.parse(referenceAnswers);
    console.log("📚 Parsed Reference Answers:", parsedReferenceAnswers);

    const newEvaluation = new Evaluation({
      referenceAnswers: parsedReferenceAnswers,
      extractedAnswers,
      difficulty,
    });

    await newEvaluation.save();
    console.log("✅ Evaluation saved with ID:", newEvaluation._id);

    res.status(201).json({ message: "Evaluation created", id: newEvaluation._id });
  } catch (error) {
    console.error("🚨 Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
