const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const fileToGenerativePart = (imageUrl) => ({
  inlineData: {
    data: Buffer.from(fs.readFileSync(imageUrl)).toString("base64"),
    mimeType: "image/jpeg",
  },
});

const extractTextFromImage = async (imageUrl) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Extract the text from this handwritten answer sheet. 
    Each answer should be labeled as follows:

    Ques No 1: (Answer)

    Ques No 2: (Answer)`;

    const imagePart = fileToGenerativePart(imageUrl);
    const generatedContent = await model.generateContent([prompt, imagePart]);

    const extractedText = generatedContent.response.text();

    // Extract questions and answers separately
    const questions = [];
    const answers = [];

    extractedText.split("\n").forEach((line) => {
      const match = line.match(/Ques No (\d+):\s*(.*)/);
      if (match) {
        questions.push(match[1]); // Store question number
        answers.push(match[2].trim()); // Store corresponding answer
      }
    });

    return { questions, answers };
  } catch (error) {
    console.error("❌ Error in Gemini API:", error);
    return { questions: [], answers: [] };
  }
};

module.exports = extractTextFromImage;
