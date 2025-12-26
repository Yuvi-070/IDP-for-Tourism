
import { Guide } from './types';

export const INDIAN_DESTINATIONS = [
  "Agra (Taj Mahal)", "Amritsar (Golden Temple)", "Alleppey (Backwaters)", "Ajanta & Ellora Caves",
  "Ayodhya (Ram Mandir)", "Badrinath (Himalayan Temple)", "Chikmagalur (Coffee Land)", "Coorg (Coffee Plantations)", 
  "Darjeeling (Tea Gardens)", "Dharamshala (Little Lhasa)", "Goa (Beaches & Churches)", "Gokarna (Peaceful Beaches)", 
  "Gulmarg (Winter Wonderland)", "Hampi (Vijayanagara Ruins)", "Hyderabad (Pearl City)",
  "Jaipur (Pink City)", "Jaisalmer (Golden City)", "Jodhpur (Blue City)", "Kaziranga (Wild Rhino)",
  "Kedarnath (Shiva's Abode)", "Kevadia (Statue of Unity)", "Kochi (Queen of Arabian Sea)", 
  "Khajuraho (Stone Carvings)", "Kanyakumari (Land's End)", "Kumarakom (Backwaters)", 
  "Ladakh (Moonland)", "Lakshadweep Islands", "Madurai (Temple City)", 
  "Manali (Himalayan Retreat)", "Munnar (Tea Estates)", "Mysuru (Palace City)",
  "Mahabalipuram (Shore Temples)", "Pahalgam (Valley of Shepherds)", "Pondicherry (French Colony)", 
  "Pushkar (Sacred Lake)", "Rishikesh (Yoga Capital)", "Ranthambore (Tiger Safari)", 
  "Shillong (Scotland of East)", "Shimla (Summer Capital)", "Spiti Valley (Cold Desert)", 
  "Srinagar (Dal Lake)", "Tawang (Monastery Hills)", "Udaipur (City of Lakes)", 
  "Varanasi (Spiritual Capital)", "Varkala (Cliff Beaches)", "Wayanad (Green Paradise)", 
  "Ziro Valley (Music & Nature)", "Other (Manual Entry)"
].sort((a, b) => a === "Other (Manual Entry)" ? 1 : b === "Other (Manual Entry)" ? -1 : a.localeCompare(b));

export const THEMES = [
  "Spiritual & Sacred", "Heritage & Royal Architecture", "Culinary & Spice Trails", 
  "Himalayan Adventure", "Artisanal Crafts & Textiles", "Vedic Wellness & Yoga", 
  "Tiger Safaris & Wildlife", "Rural Life & Slow Travel", "Luxury & Palatial Leisure",
  "Hidden Gems & Forgotten Ruins", "Off-the-beaten Path", "Modern India & Nightlife", 
  "Eco-Tourism & Conservation", "Festival & Folk Culture", "Coastal Serenity"
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
