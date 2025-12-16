import { GoogleGenAI } from "@google/genai";
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
      text: "Дышите глубоко. Настоящий момент — это всё, что у вас есть.",
      mood: "Спокойствие"
    };
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = "Сгенерируй короткую, успокаивающую фразу для медитации на русском языке (максимум 20 слов). Верни ответ в формате JSON: { \"text\": \"фраза\", \"mood\": \"настроение\" }";
    
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
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
      text: "Сосредоточьтесь на дыхании. Вдохните спокойствие, выдохните стресс.",
      mood: "Баланс"
    };
  }
};