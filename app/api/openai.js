const axios = require("axios");

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions"; // Use Davinci Codex (GPT-3.5) engine

async function fetchIncompleteGoogleFeudQuestion(prompt) {
  try {
    console.log("Using OpenAI API Key:", apiKey); // Debugging purpose, remove in production
    const response = await axios.post(
      apiUrl,
      {
        prompt: `Generate an incomplete Google Feud-style question: ${prompt}`,
        max_tokens: 50, // Adjust based on how many tokens you need
        temperature: 0.7, // Adjust to control the randomness of completions
        stop: ["\n"], // Stop completion at new line
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const questions = response.data.choices.map((choice) => choice.text.trim());
    console.log("Generated questions:", questions); // Debug: Log generated questions
    return questions;
  } catch (error) {
    console.error(
      "Error fetching incomplete questions from OpenAI:",
      error.response ? error.response.data : error.message
    );
    return [];
  }
}

module.exports = { fetchIncompleteGoogleFeudQuestion };
