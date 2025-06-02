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

// Export other shared types as needed
// Add more shared types here as needed
