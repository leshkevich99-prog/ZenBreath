import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice } from "../types";

// NOTE: In a production frontend, never expose API keys directly.
// Normally, you would proxy this through your backend.
// For this demo, we assume the environment variable is available.
const API_KEY = process.env.API_KEY || ''; 

let genAI: GoogleGenAI | null = null;

try {
  if (API_KEY) {
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

export const generateDailyWisdom = async (): Promise<AIAdvice> => {
  if (!genAI) {
    return {
      text: "Breathe deeply. The present moment is all you have.",
      mood: "Calm"
    };
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a short, soothing meditation quote or advice in English (max 20 words).";
    
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
            },
            mood: {
              type: Type.STRING,
            },
          },
        },
      }
    });

    const responseText = response.text;
    if (responseText) {
        return JSON.parse(responseText) as AIAdvice;
    }
    throw new Error("No response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Focus on your breath. Inhale peace, exhale stress.",
      mood: "Balance"
    };
  }
};