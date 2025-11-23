
import { ItemType, Parcel } from './types';

export const GRID_SIZE = 6; // 6x6
export const MAX_ITEM_LEVEL = 10;

export const ITEM_DEFINITIONS: Record<ItemType, { name: string; hue: string; baseValue: number }> = {
  [ItemType.WOOD]: { name: 'Madeira', hue: 'hue-rotate-15', baseValue: 5 },
  [ItemType.STONE]: { name: 'Pedra', hue: 'grayscale', baseValue: 8 },
  [ItemType.CROP]: { name: 'Trigo', hue: 'hue-rotate-90', baseValue: 3 },
  [ItemType.POTION]: { name: 'Elixir', hue: 'hue-rotate-240', baseValue: 15 },
};

export const INITIAL_PARCELS: Parcel[] = [
  {
    id: 'p1',
    name: 'Jardins Reais',
    isUnlocked: false,
    costGold: 100,
    costItems: [{ type: ItemType.WOOD, level: 3, count: 1 }],
    description: 'Restaure a flora antiga para atrair nobres visitantes.',
    imageSeed: 101,
    incomePerTick: 5
  },
  {
    id: 'p2',
    name: 'Torre de Vigia',
    isUnlocked: false,
    costGold: 500,
    costItems: [{ type: ItemType.STONE, level: 4, count: 1 }, { type: ItemType.WOOD, level: 4, count: 1 }],
    description: 'Proteja as fronteiras e cobre taxas dos mercadores.',
    imageSeed: 202,
    incomePerTick: 15
  },
  {
    id: 'p3',
    name: 'Mercado Central',
    isUnlocked: false,
    costGold: 1500,
    costItems: [{ type: ItemType.CROP, level: 5, count: 2 }],
    description: 'O coração do comércio do reino.',
    imageSeed: 303,
    incomePerTick: 40
  },
  {
    id: 'p4',
    name: 'Laboratório Arcano',
    isUnlocked: false,
    costGold: 3000,
    costItems: [{ type: ItemType.STONE, level: 6, count: 1 }, { type: ItemType.POTION, level: 4, count: 1 }],
    description: 'Descubra segredos valiosos da alquimia.',
    imageSeed: 404,
    incomePerTick: 100
  },
  // --- NOVOS REINOS ---
  {
    id: 'p5',
    name: 'Quartel General',
    isUnlocked: false,
    costGold: 6000,
    costItems: [{ type: ItemType.WOOD, level: 7, count: 1 }, { type: ItemType.STONE, level: 6, count: 1 }],
    description: 'Treine soldados para proteger o ouro.',
    imageSeed: 505,
    incomePerTick: 250
  },
  {
    id: 'p6',
    name: 'Porto Real',
    isUnlocked: false,
    costGold: 12000,
    costItems: [{ type: ItemType.WOOD, level: 8, count: 2 }, { type: ItemType.CROP, level: 7, count: 1 }],
    description: 'Comércio marítimo com terras distantes.',
    imageSeed: 606,
    incomePerTick: 600
  },
  {
    id: 'p7',
    name: 'Biblioteca Arcana',
    isUnlocked: false,
    costGold: 25000,
    costItems: [{ type: ItemType.POTION, level: 8, count: 1 }, { type: ItemType.STONE, level: 8, count: 1 }],
    description: 'Conhecimento antigo gera poder.',
    imageSeed: 707,
    incomePerTick: 1500
  },
  {
    id: 'p8',
    name: 'Grande Castelo',
    isUnlocked: false,
    costGold: 100000,
    costItems: [{ type: ItemType.STONE, level: 9, count: 1 }, { type: ItemType.WOOD, level: 9, count: 1 }, { type: ItemType.POTION, level: 9, count: 1 }],
    description: 'A sede do poder supremo do reino.',
    imageSeed: 808,
    incomePerTick: 5000
  }
];
