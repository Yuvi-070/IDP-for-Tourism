
import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, Activity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || 
                        error?.message?.includes('429') || 
                        error?.message?.includes('quota');
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    duration: { type: Type.NUMBER },
    theme: { type: Type.STRING },
    startingLocation: { type: Type.STRING },
    travelersCount: { type: Type.NUMBER },
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
                time: { type: Type.STRING, description: "Suggested start time in 24h HH:mm format" },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCost: { type: Type.STRING, description: "Price in INR" },
                estimatedTime: { type: Type.STRING },
                culturalInsight: { type: Type.STRING },
                mapUrl: { type: Type.STRING }
              },
              required: ["time", "location", "description", "culturalInsight", "estimatedTime", "estimatedCost", "mapUrl"]
            }
          }
        },
        required: ["day", "activities"]
      }
    },
    travelOptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mode: { type: Type.STRING, description: "Mode of transport: Bus, Train, Flight, or Private Taxi" },
          description: { type: Type.STRING },
          estimatedCost: { type: Type.STRING, description: "Total cost for all travelers in INR" },
          duration: { type: Type.STRING }
        },
        required: ["mode", "description", "estimatedCost", "duration"]
      }
    },
    hotelRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedPricePerNight: { type: Type.STRING, description: "Price in INR for one room" },
          amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
          mapUrl: { type: Type.STRING, description: "Google Maps search URL for the hotel" }
        },
        required: ["name", "description", "estimatedPricePerNight", "amenities", "mapUrl"]
      }
    }
  },
  required: ["destination", "duration", "theme", "days", "travelOptions", "hotelRecommendations", "startingLocation", "travelersCount"]
};

export const generateTravelItinerary = async (
  destination: string, 
  duration: number, 
  themes: string[],
  startingLocation: string,
  hotelStars: number,
  travelersCount: number
): Promise<Itinerary> => {
  const themeString = themes.join(", ");
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Architect a ${duration}-day travel itinerary for ${destination} starting from ${startingLocation} for ${travelersCount} travelers.
      Themes: ${themeString}.
      Specific Hotel Requirement: ${hotelStars}-star hotels.
      
      CRITICAL:
      1. Provide detailed travel options (Bus, Train, Flight) from ${startingLocation} to ${destination} with real-world price estimates in INR for ${travelersCount} people.
      2. Suggest 3 hotels in ${destination} matching the ${hotelStars}-star rating. Include a Google Maps URL for each hotel in the mapUrl field.
      3. Use Google Search to verify current prices and routes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    return JSON.parse(response.text) as Itinerary;
  });
};

export const generateItineraryFromPrompt = async (prompt: string): Promise<Itinerary> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Synthesize a professional travel itinerary based on this intent: "${prompt}". 
      Include travel options from the user's inferred starting point and hotel recommendations with map links.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    return JSON.parse(response.text) as Itinerary;
  });
};

export const getMoreSuggestions = async (destination: string): Promise<Activity[]> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 additional unique spots in ${destination}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: ITINERARY_SCHEMA.properties.days.items.properties.activities.items
        },
        tools: [{ googleSearch: {} }]
      }
    });
    return JSON.parse(response.text) as Activity[];
  });
};

export const getPlaceGrounding = async (query: string, lat?: number, lng?: number) => {
  const toolConfig = lat && lng ? {
    retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
  } : undefined;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: { tools: [{ googleMaps: {} }], toolConfig: toolConfig },
    });
    return { 
      text: response.text || "", 
      mapLinks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
        .filter((chunk: any) => chunk.maps?.uri)
        .map((chunk: any) => ({ uri: chunk.maps.uri, title: chunk.maps.title }))
    };
  });
};

export const getIconicHotspots = async (category: string = "trending") => {
  const query = `List 12 unique ${category} spots in India with official Google Maps links.`;
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: { tools: [{ googleMaps: {} }] },
    });
    return (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter((chunk: any) => chunk.maps?.uri)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        uri: chunk.maps.uri,
        category: category.charAt(0).toUpperCase() + category.slice(1)
      }));
  });
};

export const chatWithLocalAI = async (message: string, context: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Concierge mode. User: ${message}. Context: ${context}.`,
      config: { tools: [{ googleMaps: {} }] }
    });
    return response.text;
  });
};

export const analyzeLocationImage = async (base64Image: string, mimeType: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [{ inlineData: { data: base64Image, mimeType: mimeType } }, { text: "Identify this landmark in India." }],
      },
    });
    return response.text;
  });
};

export const translateText = async (text: string, targetLanguage: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate to ${targetLanguage}: ${text}`,
    });
    return response.text;
  });
}
