// Shared User type
export interface User {
  id: string;
  name: string;
  level: number;
  experience: number;
  maxExperience: number;
  actionPoints: number;
  reputation: number;
  character: string;
  currentExp?: number;
  maxExp?: number;
  currentHP?: number;
  maxHP?: number;
  currentMP?: number;
  maxMP?: number;
  gold?: number;
  stats: {
    strength: number;
    intelligence: number;
    agility: number;
    vitality: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'completed';
  createdAt: Date;
  userId: string;
}

export interface Record {
  id: string;
  questId: string;
  text: string;
  tags: string[];
  images: string[]; // Store image URLs or paths
  createdAt: Date;
  userId: string;
}

// Export other shared types as needed
// Add more shared types here as needed
