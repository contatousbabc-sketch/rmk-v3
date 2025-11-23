
export enum ItemType {
  WOOD = 'wood',
  STONE = 'stone',
  CROP = 'crop',
  POTION = 'potion'
}

export interface GameItem {
  id: string; // unique instance id
  type: ItemType;
  level: number;
  isNew?: boolean;
  effectType?: 'spawn' | 'merge';
  lore?: string; // AI Generated Lore
}

export interface GridSlot {
  index: number;
  item: GameItem | null;
}

export interface Parcel {
  id: string;
  name: string;
  isUnlocked: boolean;
  costGold: number;
  costItems: { type: ItemType; level: number; count: number }[];
  description: string;
  imageSeed: number;
  incomePerTick: number; // Gold generated every cycle
}

export interface PlayerState {
  gold: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  xp: number;
  level: number;
}

export type GameTab = 'merge' | 'kingdom' | 'adventure';

export interface Mission {
  id: number | string;
  name: string;
  description?: string;
  cost: number;
  targetScore: number;
  moves: number;
  rewardType: ItemType;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Expert' | 'Mestre' | 'Infernal' | 'Divino';
  color: string;
  icon?: any; // Helper for icon rendering
}
