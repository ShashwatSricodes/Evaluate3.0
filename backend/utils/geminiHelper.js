const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluateAnswers = async (teacherQuestions, teacherAnswers, studentQuestions, studentAnswers) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Evaluate the student's answers based on the teacher's answers.  

  - Match student answers to the correct question numbers.
  - Award marks out of 5 based on accuracy, completeness, and logical correctness.
  - Strict checking is required—focus on logic rather than words.

  Format:
  - Question 1: Score - X/5, Comment: "..."
  - Question 2: Score - Y/5, Comment: "..."

  Teacher's Answers:
  ${teacherQuestions.map((q, i) => `Ques No ${q}: ${teacherAnswers[i]}`).join("\n")}

  Student's Answers:
  ${studentQuestions.map((q, i) => `Ques No ${q}: ${studentAnswers[i]}`).join("\n")}
  `;

  try {
    const result = await model.generateContent(prompt);
    return await result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

module.exports = { evaluateAnswers };
