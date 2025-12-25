import { GoogleGenAI, Type } from "@google/genai";
import { ActivityType, Difficulty } from "../types";

// Ensure we have a valid key or fallback to empty string to prevent crash on init
// Real key must come from process.env.API_KEY as per instructions.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTripDraft = async (
  location: string,
  activity: ActivityType,
  difficulty: Difficulty
): Promise<{ description: string; equipment: string[] }> => {
  
  if (!apiKey) {
    console.warn("API Key is missing. AI features will return mock data.");
    return {
      description: "Descrizione non disponibile (API Key mancante). Configura process.env.API_KEY.",
      equipment: ["Attrezzatura standard"]
    };
  }

  const prompt = `
    Create a detailed description and equipment list for a mountain guide leading a trip.
    Location: ${location}
    Activity: ${activity}
    Difficulty: ${difficulty}
    
    Return the response in JSON format.
    The description should be exciting and professional (in Italian).
    The equipment list should be a simple array of strings (in Italian).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            equipment: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "equipment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      description: "Descrizione generata manualmente necessaria. (AI Error)",
      equipment: ["Attrezzatura standard"]
    };
  }
};