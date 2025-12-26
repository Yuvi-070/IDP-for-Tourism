
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

/**
 * Uses Maps Grounding to fetch current location information and official links.
 */
export const getPlaceGrounding = async (query: string, lat?: number, lng?: number) => {
  const toolConfig = lat && lng ? {
    retrievalConfig: {
      latLng: {
        latitude: lat,
        longitude: lng
      }
    }
  } : undefined;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: toolConfig,
    },
  });

  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const mapLinks = groundingChunks
    .filter((chunk: any) => chunk.maps?.uri)
    .map((chunk: any) => ({
      uri: chunk.maps.uri,
      title: chunk.maps.title
    }));

  return { text, mapLinks };
};

/**
 * Fetches 12 dynamic hotspots using real-time Maps Grounding.
 */
export const getIconicHotspots = async (category: string = "trending") => {
  const query = `List 12 unique and top-rated ${category} tourist destinations in India. For each, give its name, a very short 1-sentence cultural highlight, and provide its official Google Maps link. Make sure the results are diverse across the country.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const spots = groundingChunks
    .filter((chunk: any) => chunk.maps?.uri)
    .map((chunk: any) => ({
      name: chunk.maps.title,
      uri: chunk.maps.uri,
      category: category.charAt(0).toUpperCase() + category.slice(1)
    }));

  return spots;
};

export const getTrendingHotspots = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "List 5 trending or top-rated unique tourism destinations in India right now with a very brief 1-sentence reason why. Provide Google Maps links for each.",
    config: {
      tools: [{ googleMaps: {} }],
    },
  });

  const text = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const trending = groundingChunks
    .filter((chunk: any) => chunk.maps?.uri)
    .map((chunk: any) => ({
      name: chunk.maps.title,
      uri: chunk.maps.uri,
    }));

  return { text, trending };
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
    model: "gemini-2.5-flash",
    contents: `Concierge mode. User: ${message}. Context: ${context}. Respond as a local expert. Provide location links if relevant.`,
    config: {
      tools: [{ googleMaps: {} }]
    }
  });
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const mapLinks = groundingChunks
    .filter((chunk: any) => chunk.maps?.uri)
    .map((chunk: any) => `[${chunk.maps.title}](${chunk.maps.uri})`)
    .join(", ");

  return response.text + (mapLinks ? `\n\n**Relevant Places:** ${mapLinks}` : "");
};

export const analyzeLocationImage = async (base64Image: string, mimeType: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Identify this location or landmark in India and explain the captivating story, history, or cultural significance behind it. Respond as an expert local storyteller with warmth and depth.",
        },
      ],
    },
  });
  return response.text;
};

export const translateText = async (text: string, targetLanguage: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate to ${targetLanguage}: ${text}. Return ONLY the translation.`,
  });
  return response.text;
}
