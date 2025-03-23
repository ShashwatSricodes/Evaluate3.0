const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },

  referenceAnswers: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],

  extractedAnswers: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],

  difficulty: { type: String, required: true, enum: ["Easy", "Medium", "Tough"] },

  marks: [{ type: Number }],

  commentsArray: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model("Evaluation", EvaluationSchema);
