
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Itinerary, Activity, HotelRecommendation } from "../types";

// The API key is retrieved exclusively from process.env.API_KEY.
// When running locally, ensure your build tool (e.g., Vite) or environment
// is configured to inject this variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
          duration: { type: Type.STRING },
          operatorDetails: { type: Type.STRING, description: "E.g., Train Name/No, Flight Carrier, Bus Operator" }
        },
        required: ["mode", "description", "estimatedCost", "duration", "operatorDetails"]
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
          mapUrl: { type: Type.STRING, description: "Google Maps search URL for the hotel" },
          googleRating: { type: Type.NUMBER, description: "Real-world Google rating (e.g. 4.5)" },
          webRating: { type: Type.NUMBER, description: "Real-world Web/TripAdvisor rating (e.g. 4.6)" },
          reviewCount: { type: Type.STRING, description: "Approx number of reviews (e.g. '1.2K+')" }
        },
        required: ["name", "description", "estimatedPricePerNight", "amenities", "mapUrl", "googleRating", "webRating", "reviewCount"]
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
      model: "gemini-3-pro-preview", // Complex task: Use Pro for deeper reasoning
      contents: `Architect a ${duration}-day travel itinerary for ${destination} starting from ${startingLocation} for ${travelersCount} travelers.
      Themes: ${themeString}.
      Specific Hotel Requirement: ${hotelStars}-star hotels.
      
      CRITICAL:
      1. Provide detailed travel options (Bus, Train, Flight) from ${startingLocation} to ${destination} with real-world price estimates in INR for ${travelersCount} people. Include specific operator names (e.g., IndiGo, Rajdhani Express).
      2. Suggest 3 hotels in ${destination} matching the ${hotelStars}-star rating. Include a Google Maps URL for each hotel in the mapUrl field. Provide Google and Web ratings.
      3. Use Google Search to verify current prices, ratings, and routes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    return JSON.parse(response.text || "{}") as Itinerary;
  });
};

export const generateItineraryFromPrompt = async (prompt: string): Promise<Itinerary> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex reasoning: Use Pro
      contents: `Synthesize a comprehensive, professional travel itinerary based on this user intent: "${prompt}". 

      INSTRUCTIONS:
      1. Identify the target destination and inferred starting location. If not specified, default starting location to Mumbai.
      2. Default travelers count to 2 if not specified.
      3. Default duration to 3 days if not specified.
      4. Create a detailed day-by-day plan with specific activities and times.
      5. Provide travel options (Flight/Train/Bus) from the starting location to the destination with operator names.
      6. Provide 3 high-quality hotel recommendations with description, amenities, and real-world ratings.
      7. Strictly follow the provided JSON schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
        tools: [{ googleSearch: {} }]
      }
    });

    return JSON.parse(response.text || "{}") as Itinerary;
  });
};

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Transcribe the following audio precisely. Provide only the transcribed text." }
        ]
      }
    });
    return response.text || "";
  });
};

export const generateSpeech = async (text: string): Promise<string> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this travel insight warmly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

export const chatWithLocalAI = async (message: string, context: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Efficient task: Use Flash
      contents: `You are the LocalLens AI Concierge. A high-end Indian tourism assistant. 
      Context: ${context}.
      User Message: ${message}.
      Provide accurate, culturally deep, and helpful responses. Use Google Search and Maps tools as needed.`,
      config: { 
        tools: [{ googleSearch: {} }, { googleMaps: {} }] 
      }
    });
    return response.text || "";
  });
};

export const analyzeLocationImage = async (base64Image: string, mimeType: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Multimodal reasoning: Use Pro
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } }, 
          { text: "Identify this landmark or location in India. Provide a rich cultural context and why it is significant for a traveler." }
        ],
      },
    });
    return response.text || "";
  });
};

export const translateText = async (text: string, targetLanguage: string) => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Maintain the cultural nuance: ${text}`,
    });
    return response.text || "";
  });
}

export const refreshHotelRecommendations = async (
  destination: string,
  hotelStars: number,
  excludedHotels: string[]
): Promise<HotelRecommendation[]> => {
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 alternative ${hotelStars}-star hotel recommendations in ${destination}.
      IMPORTANT: Do NOT include any of these hotels: ${excludedHotels.join(", ")}.
      Provide fresh options with Google Maps search links and real-world ratings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: ITINERARY_SCHEMA.properties.hotelRecommendations.items
        },
        tools: [{ googleSearch: {} }]
      }
    });
    return JSON.parse(response.text || "[]") as HotelRecommendation[];
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
    return JSON.parse(response.text || "[]") as Activity[];
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
