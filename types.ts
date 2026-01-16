
export interface Activity {
  time: string;
  location: string;
  description: string;
  estimatedCost: string;
  estimatedTime: string; 
  culturalInsight: string;
  mapUrl?: string;
}

export interface DayItinerary {
  day: number;
  activities: Activity[];
}

export interface TravelOption {
  mode: 'Bus' | 'Train' | 'Flight' | 'Private Taxi';
  description: string;
  estimatedCost: string;
  duration: string;
  operatorDetails?: string;
}

export interface HotelRecommendation {
  name: string;
  description: string;
  estimatedPricePerNight: string;
  amenities: string[];
  mapUrl?: string;
  googleRating?: number;
  webRating?: number;
  reviewCount?: string;
}

export interface Itinerary {
  id?: string; // Database ID for updates
  isMerged?: boolean; // Flag for merged plans
  destination: string;
  duration: number;
  theme: string;
  days: DayItinerary[];
  startingLocation: string;
  travelersCount: number;
  travelOptions: TravelOption[];
  hotelRecommendations: HotelRecommendation[];
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
