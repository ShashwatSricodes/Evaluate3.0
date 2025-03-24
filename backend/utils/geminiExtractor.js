const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const fileToGenerativePart = (imageBuffer) => ({
  inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") },
});

const extractTextFromImage = async (imageBuffer) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Extract the text from this handwritten answer sheet. Format: 
    Ques No 1: (Answer)
    Ques No 2: (Answer)`;

    const imagePart = fileToGenerativePart(imageBuffer);
    const generatedContent = await model.generateContent({ contents: [{ role: "user", parts: [imagePart, { text: prompt }] }] });
    const extractedText = generatedContent.response.text();

    return extractedText.split("\n").map((line) => {
      const match = line.match(/Ques No \d+:\s*(.*)/);
      return match ? match[1].trim() : null;
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
};

module.exports = extractTextFromImage;
