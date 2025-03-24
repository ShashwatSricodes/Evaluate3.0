const express = require("express");
const router = express.Router();
const Evaluation = require("../models/Evaluation");
const { evaluateAnswers } = require("../utils/geminiHelper");

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing evaluation ID" });
    }

    const evaluation = await Evaluation.findById(id);
    if (!evaluation || !evaluation.extractedAnswers || evaluation.extractedAnswers.length === 0) {
      return res.status(400).json({ message: "Extracted answers are missing" });
    }

    const evaluationResult = await evaluateAnswers(evaluation.referenceAnswers, evaluation.extractedAnswers);
    if (!evaluationResult) {
      return res.status(500).json({ message: "Gemini evaluation failed" });
    }

    const marksArray = [];
    const commentsArray = [];

    evaluationResult.split("\n").forEach((line) => {
      const match = line.match(/Question (\d+): Score - (\d+)\/5, Comment: "(.*)"/);
      if (match) {
        marksArray.push(parseInt(match[2]));
        commentsArray.push(match[3]);
      }
    });

    evaluation.marks = marksArray;
    evaluation.commentsArray = commentsArray;
    await evaluation.save();

    res.json({ message: "Evaluation successful", marks: marksArray, comments: commentsArray });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
