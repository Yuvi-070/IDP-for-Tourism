
import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, Activity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    duration: { type: Type.NUMBER },
    theme: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
                estimatedTime: { type: Type.STRING, description: "Suggested duration to spend at this location, e.g., 2 hours." },
                culturalInsight: { type: Type.STRING }
              },
              required: ["time", "location", "description", "culturalInsight", "estimatedTime"]
            }
          }
        },
        required: ["day", "activities"]
      }
    }
  },
  required: ["destination", "duration", "theme", "days"]
};

export const generateTravelItinerary = async (destination: string, duration: number, themes: string[]): Promise<Itinerary> => {
  const themeString = themes.join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a detailed ${duration}-day travel itinerary for ${destination} focusing on these interests: "${themeString}". 
    Include specific locations, times, suggested duration for each stop, and provide deep cultural insights for each activity.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA
    }
  });

  return JSON.parse(response.text) as Itinerary;
};

export const generateItineraryFromPrompt = async (prompt: string): Promise<Itinerary> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Plan a trip to India based on: "${prompt}". Parse destination, duration, and interests. Create a detailed itinerary with cultural insights and estimated time to explore each spot.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA
    }
  });

  return JSON.parse(response.text) as Itinerary;
};

export const getMoreSuggestions = async (destination: string): Promise<Activity[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 6 additional unique points of interest or activities for a traveler in ${destination}. Return them as an array of objects with time, location, description, estimatedCost, estimatedTime, and culturalInsight.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedCost: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            culturalInsight: { type: Type.STRING }
          },
          required: ["time", "location", "description", "estimatedCost", "culturalInsight", "estimatedTime"]
        }
      }
    }
  });
  return JSON.parse(response.text) as Activity[];
};

export const chatWithLocalAI = async (message: string, context: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Concierge mode. User: ${message}. Context: ${context}. Respond as a local expert.`,
  });
  return response.text;
};

export const translateText = async (text: string, targetLanguage: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate to ${targetLanguage}: ${text}. Return ONLY the translation.`,
  });
  return response.text;
};
