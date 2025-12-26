
export interface Activity {
  time: string;
  location: string;
  description: string;
  estimatedCost: string;
  estimatedTime: string; // New field: e.g., "2-3 hours"
  culturalInsight: string;
}

export interface DayItinerary {
  day: number;
  activities: Activity[];
}

export interface Itinerary {
  destination: string;
  duration: number;
  theme: string;
  days: DayItinerary[];
}

export interface Guide {
  id: string;
  name: string;
  location: string;
  specialty: string[];
  languages: string[];
  rating: number;
  verified: boolean;
  imageUrl: string;
  bio: string;
  pricePerDay: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'guide';
  text: string;
  timestamp: Date;
  translatedText?: string;
}
