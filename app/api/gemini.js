import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCy3no6r0imq4RVZjN0oYihQXqdtd_TyOo");

const prompts = [
  // Add more diverse prompts here
];

function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

async function fetchIncompleteGoogleFeudQuestion() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const randomPrompt = getRandomPrompt();
    const result = await model.generateContent([
      `Generate a Google Feud-style question. Keep it general and incomplete for players to guess the answers. Example: "Why do people love" or "How to make" and dont use these exact sentences, think for yourself and be creative, still keeing in mind that the sentences should not be complex because the players have to guess the result. The questions should be specific, so that the resulting suggestion would not exceed 1 or 2 words . Actually, I am using you to generate Google Feud type questions which return questions that people write on Google, like 'why is my cat so' and then the player will have to guess the word following the sentence which people search the most on the internet. And one more thing, don't put any dots or signs after the sentence, just leave it as it is. The question should be open-ended: ${randomPrompt}`,
    ]);

    const questions = result.response.text();
    console.log("Generated questions:", questions); // Debug: Log generated questions
    return [questions]; // Return as an array to keep consistent with previous structure
  } catch (error) {
    console.error("Error fetching incomplete questions from Gemini AI:", error);
    return [];
  }
}

export { fetchIncompleteGoogleFeudQuestion };
