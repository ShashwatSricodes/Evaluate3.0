const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const evaluateAnswers = async (teacherAnswers, studentAnswers) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Evaluate the student's answers based on the teacher's answers. Strict checking is required—focus on logic rather than words.

  - Award marks out of 5 based on accuracy, completeness, and logical correctness.
  - Format:
    - Question 1: Score - X/5, Comment: "..."
    - Question 2: Score - Y/5, Comment: "..."

  Teacher's Answers:
  ${teacherAnswers.map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join("\n")}

  Student's Answers:
  ${studentAnswers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return null;
  }
};

module.exports = { evaluateAnswers };
