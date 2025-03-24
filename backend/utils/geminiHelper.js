const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluateAnswers = async (teacherAnswers, studentAnswers) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Evaluate the student's answers based on the teacher's answers. Strict checking is required—focus on logic rather than words.
  - Award marks out of 5 based on accuracy, completeness, and logical correctness.
  - Format:
    - Question 1: Score - X/5, Comment: "..."
    - Question 2: Score - Y/5, Comment: "..."

  Teacher's Answers:
  ${teacherAnswers.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n")}

  Student's Answers:
  ${studentAnswers.map((a, i) => `A${i + 1}: ${a}`).join("\n")}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return null;
  }
};

module.exports = { evaluateAnswers };
