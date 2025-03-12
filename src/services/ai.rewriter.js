"use strict";

const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required. Set it in .env file or pass it to constructor"
      );
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    this.generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
  }

  async generateResponse(prompt, history = []) {
    try {
      const chatSession = this.model.startChat({
        generationConfig: this.generationConfig,
        history,
      });

      const result = await chatSession.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error call Gemini API:", error.message);
      throw error;
    }
  }
}

module.exports = new GeminiService();
