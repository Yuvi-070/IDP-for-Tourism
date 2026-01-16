
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Itinerary, Activity, HotelRecommendation } from "../types";

/**
 * AI Initialization Service
 */

const getAI = () => {
  let apiKey = "AIzaSyBilCh3t2SfI7G1-mlikSRw259ZWjnZYQ0";
  try {
    // Attempt to use environment variable if available
    if (typeof process !== 'undefined' && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Fallback to hardcoded key if process.env access fails
    console.warn("Environment variable access failed, using fallback key.");
  }
  return new GoogleGenAI({ apiKey });
};

// Relaxed Schema: Made mapUrl and operatorDetails optional to prevent generation failures
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
              // Removed mapUrl from required to improve generation success rate
              required: ["time", "location", "description", "culturalInsight", "estimatedTime", "estimatedCost"]
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
        // Removed operatorDetails from required
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
          mapUrl: { type: Type.STRING, description: "Google Maps search URL for the hotel" },
          googleRating: { type: Type.NUMBER, description: "Real-world Google rating (e.g. 4.5)" },
          webRating: { type: Type.NUMBER, description: "Real-world Web/TripAdvisor rating (e.g. 4.6)" },
          reviewCount: { type: Type.STRING, description: "Approx number of reviews (e.g. '1.2K+')" }
        },
        // Removed mapUrl from required
        required: ["name", "description", "estimatedPricePerNight", "amenities", "googleRating", "webRating", "reviewCount"]
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
  const ai = getAI();
  try {
    // Using gemini-3-flash-preview for balanced speed/quality and reliable JSON structure
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Architect a ${duration}-day travel itinerary for ${destination} starting from ${startingLocation} for ${travelersCount} travelers.
      Themes: ${themeString}. Specific Hotel Requirement: ${hotelStars}-star hotels.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty response. The model may have been blocked or timed out.");

    const data = JSON.parse(text);
    // Basic validation to prevent UI crashes
    if (!data.days) data.days = [];
    if (!data.hotelRecommendations) data.hotelRecommendations = [];
    if (!data.travelOptions) data.travelOptions = [];
    
    return data as Itinerary;
  } catch (error) {
    console.error("AI Planner Error:", error);
    throw error;
  }
};

export const generateItineraryFromPrompt = async (prompt: string): Promise<Itinerary> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Synthesize a comprehensive itinerary based on: "${prompt}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("AI returned empty response.");
    
    const data = JSON.parse(text);
    return data as Itinerary;
  } catch (error) {
    console.error("AI Planner (Prompt) Error:", error);
    throw error;
  }
};

export const mergeItineraries = async (itineraries: Itinerary[]): Promise<Itinerary> => {
  const ai = getAI();
  try {
    const itinerariesJson = JSON.stringify(itineraries);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Merge the following ${itineraries.length} travel itineraries into one single, cohesive, sequential itinerary. 
      Combine the durations, costs, and locations logically. If locations are distant, suggest travel between them.
      The output must be a single itinerary object following the schema.
      Input Itineraries: ${itinerariesJson}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("AI returned empty response.");
    
    const data = JSON.parse(text);
    data.isMerged = true; // Flag as merged
    return data as Itinerary;
  } catch (error) {
    console.error("Merge Itineraries Error:", error);
    throw error;
  }
};

export const chatWithLocalAI = async (message: string, context: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are the LocalLens AI Concierge. Context: ${context}. User: ${message}.`,
      config: { tools: [{ googleSearch: {} }, { googleMaps: {} }] }
    });
    return response.text || "I apologize, I am unable to process that request at the moment.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection interrupted. Please try again.";
  }
};

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: "Transcribe precisely." }] }
  });
  return response.text || "";
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const analyzeLocationImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ inlineData: { data: base64Image, mimeType: mimeType } }, { text: "Identify this location in India." }] },
  });
  return response.text || "";
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate to ${targetLanguage}: ${text}`,
  });
  return response.text || "";
}

export const refreshHotelRecommendations = async (
  destination: string,
  hotelStars: number,
  excludedHotels: string[]
): Promise<HotelRecommendation[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 alternative ${hotelStars}-star hotels in ${destination}, excluding: ${excludedHotels.join(", ")}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: ITINERARY_SCHEMA.properties.hotelRecommendations.items },
      }
    });
    return JSON.parse(response.text || "[]") as HotelRecommendation[];
  } catch (error) {
    console.error("Hotel Refresh Error:", error);
    return [];
  }
};

export const getMoreSuggestions = async (destination: string): Promise<Activity[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 additional unique spots in ${destination}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: ITINERARY_SCHEMA.properties.days.items.properties.activities.items },
      }
    });
    return JSON.parse(response.text || "[]") as Activity[];
  } catch (error) {
    console.error("Suggestions Error:", error);
    return [];
  }
};

export const getSpecificSuggestions = async (destination: string, query: string): Promise<Activity[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 spots in ${destination} related to "${query}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: ITINERARY_SCHEMA.properties.days.items.properties.activities.items },
      }
    });
    return JSON.parse(response.text || "[]") as Activity[];
  } catch (error) {
    console.error("Specific Suggestions Error:", error);
    return [];
  }
};

export const getPlaceGrounding = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const toolConfig = lat && lng ? { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } : undefined;
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
};

export const getIconicHotspots = async (category: string = "trending") => {
  const ai = getAI();
  
  // Refine category for better map results.
  // "Trending" can be too abstract for tool usage, so we map it to concrete terms.
  const searchTerm = category === 'trending' ? 'top rated and popular tourist attractions' : `${category} destinations`;

  // Prompt explicitly asks for Google Maps usage to ensure the tool is triggered for every item.
  const query = `List 12 unique ${searchTerm} in India. You MUST use the Google Maps tool to find the specific location for each result. Return at least 10 results.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Must use 2.5 series for Maps
      contents: query,
      config: { tools: [{ googleMaps: {} }] },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .filter((chunk: any) => chunk.maps?.uri && chunk.maps?.title)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        uri: chunk.maps.uri,
        category: category.charAt(0).toUpperCase() + category.slice(1)
      }));
  } catch (error) {
    console.error("Discovery Engine Error:", error);
    return [];
  }
};
