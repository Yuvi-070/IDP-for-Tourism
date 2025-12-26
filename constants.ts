
import { Guide } from './types';

export const INDIAN_DESTINATIONS = [
  "Agra (Taj Mahal)", "Amritsar (Golden Temple)", "Alleppey (Backwaters)", "Ajanta & Ellora Caves",
  "Coorg (Coffee Plantations)", "Darjeeling (Tea Gardens)", "Goa (Beaches & Churches)", 
  "Gokarna (Peaceful Beaches)", "Hampi (Vijayanagara Ruins)", "Hyderabad (Pearl City)",
  "Jaipur (Pink City)", "Jaisalmer (Golden City)", "Jodhpur (Blue City)", "Kochi (Queen of Arabian Sea)", 
  "Khajuraho (Stone Carvings)", "Kanyakumari (Land's End)", "Ladakh (Moonland)", "Lakshadweep Islands",
  "Madurai (Temple City)", "Manali (Himalayan Retreat)", "Munnar (Tea Estates)", "Mysuru (Palace City)",
  "Mahabalipuram (Shore Temples)", "Pondicherry (French Colony)", "Pushkar (Sacred Lake)",
  "Rishikesh (Yoga Capital)", "Ranthambore (Tiger Safari)", "Shillong (Scotland of East)",
  "Shimla (Summer Capital)", "Spiti Valley (Cold Desert)", "Tawang (Monastery Hills)",
  "Udaipur (City of Lakes)", "Varanasi (Spiritual Capital)", "Ziro Valley (Music & Nature)"
].sort();

export const THEMES = [
  "Spiritual & Religious", "Heritage & Architecture", 
  "Culinary & Foodie", "Adventure & Nature", "Art & Craftsmanship",
  "Wellness & Yoga", "Wildlife & Photography", "Slow Travel & Local Life"
];

export const MOCK_GUIDES: Guide[] = [
  {
    id: 'g1',
    name: 'Rajesh Sharma',
    location: 'Jaipur',
    specialty: ['Rajput History', 'Gemstone Craft'],
    languages: ['Hindi', 'English', 'Marwari'],
    rating: 4.9,
    verified: true,
    imageUrl: 'https://picsum.photos/seed/guide1/300/300',
    bio: 'A heritage enthusiast with 15 years of experience walking the lanes of the Pink City.',
    pricePerDay: 2500
  },
  {
    id: 'g2',
    name: 'Anjali Menon',
    location: 'Kochi',
    specialty: ['Spice Trade History', 'Kathakali Art'],
    languages: ['Malayalam', 'English', 'Tamil'],
    rating: 4.8,
    verified: true,
    imageUrl: 'https://picsum.photos/seed/guide2/300/300',
    bio: 'Passionate about Kerala coastal traditions and the history of Fort Kochi.',
    pricePerDay: 3000
  },
  {
    id: 'g3',
    name: 'Vikram Singh',
    location: 'Varanasi',
    specialty: ['Ghat Rituals', 'Silk Weaving'],
    languages: ['Hindi', 'English', 'French'],
    rating: 5.0,
    verified: true,
    imageUrl: 'https://picsum.photos/seed/guide3/300/300',
    bio: 'Third-generation local storyteller focusing on the spiritual heart of Kashi.',
    pricePerDay: 2200
  },
  {
    id: 'g4',
    name: 'Suhail Khan',
    location: 'Amritsar',
    specialty: ['Sikh History', 'Street Food'],
    languages: ['Punjabi', 'Hindi', 'English'],
    rating: 4.7,
    verified: true,
    imageUrl: 'https://picsum.photos/seed/guide4/300/300',
    bio: 'Let me show you the golden heart of Punjab and the secret culinary spots.',
    pricePerDay: 2000
  }
];
