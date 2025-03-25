const express = require("express");
const router = express.Router();
const Evaluation = require("../models/Evaluation");
const { evaluateAnswers } = require("../utils/geminiHelper");

router.get("/", async (req, res) => {
  try {
    console.log("🔍 Received GET request to fetch evaluation");

    const { id } = req.query;
    if (!id) {
      console.log("❌ Missing evaluation ID in request");
      return res.status(400).json({ message: "Missing evaluation ID" });
    }

    console.log(`📌 Fetching evaluation with ID: ${id}`);
    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      console.log(`❌ Evaluation not found for ID: ${id}`);
      return res.status(404).json({ message: "Evaluation not found" });
    }

    if (!evaluation.extractedAnswers || evaluation.extractedAnswers.length === 0) {
      console.log(`⚠️ Extracted answers missing for ID: ${id}`);
      return res.status(400).json({ message: "Extracted answers are missing" });
    }

    console.log("✅ Sending reference and extracted answers to Gemini API...");
    console.log("Reference Answers:", evaluation.referenceAnswers);
    console.log("Extracted Answers:", evaluation.extractedAnswers);

    const evaluationResult = await evaluateAnswers(evaluation.referenceAnswers, evaluation.extractedAnswers);
    
    if (!evaluationResult) {
      console.error("❌ Gemini evaluation failed");
      return res.status(500).json({ message: "Gemini evaluation failed" });
    }

    console.log("📜 Gemini Response:", evaluationResult);

    const marksArray = [];
    const commentsArray = [];

    evaluationResult.split("\n").forEach((line) => {
      const match = line.match(/Question (\d+): Score - (\d+)\/5, Comment: (.+)/);
      if (match) {
        marksArray.push(parseInt(match[2]));
        commentsArray.push(match[3].trim()); // Trim to remove extra spaces
      }
    });
    
    console.log("✅ Parsed Marks:", marksArray);
    console.log("✅ Parsed Comments:", commentsArray);

    evaluation.marks = marksArray;
    evaluation.commentsArray = commentsArray;
    await evaluation.save();

    console.log("✅ Evaluation successfully updated in the database");

    res.json({ message: "Evaluation successful", marks: marksArray, comments: commentsArray });

  } catch (error) {
    console.error("🚨 Error in /api/evaluations GET:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
