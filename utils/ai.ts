import { GoogleGenAI } from "@google/genai";
import { ItemType, Mission } from "../types";

// Inicialização segura: Se não tiver chave, usamos fallbacks para não quebrar o jogo
const getApiKey = () => {
  try {
    // Check if process is defined (Node.js/Polyfilled env)
    if (typeof process !== "undefined" && process?.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceErrors or access errors
  }
  return undefined;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- FALLBACKS (Caso a IA falhe ou esteja offline) ---
const FALLBACK_LORE = [
  "Um artefato antigo vibrando com energia.",
  "Forjado nas profundezas da montanha esquecida.",
  "Dizem que este item traz sorte aos corajosos.",
  "Brilha com uma luz que não projeta sombras."
];

const FALLBACK_MISSIONS: Mission[] = [
  { id: 'f1', name: "Caverna dos Goblins", cost: 3, targetScore: 3000, moves: 20, rewardType: ItemType.STONE, difficulty: 'Médio', color: 'stone' },
  { id: 'f2', name: "Floresta Encantada", cost: 4, targetScore: 4500, moves: 25, rewardType: ItemType.POTION, difficulty: 'Difícil', color: 'purple' },
];

// --- GEMINI FUNCTIONS ---

export async function generateItemLore(type: ItemType, level: number): Promise<string> {
  if (!ai || level < 5) return ""; // Só gera para itens raros (Lv 5+) para economizar tokens/tempo
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escreva uma descrição mística e curta (máximo 15 palavras) para um item de jogo RPG. 
      Tipo: ${type}. Nível: ${level} (Nível máximo é 10). 
      Seja criativo e épico. Em Português.`,
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });
    return response.text?.trim() || FALLBACK_LORE[Math.floor(Math.random() * FALLBACK_LORE.length)];
  } catch (e) {
    console.warn("AI Lore Gen Failed:", e);
    return FALLBACK_LORE[Math.floor(Math.random() * FALLBACK_LORE.length)];
  }
}

export async function generateDynamicMissions(playerLevel: number): Promise<Mission[]> {
  if (!ai) return FALLBACK_MISSIONS;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Gere 3 missões de RPG para um jogo de Match-3. Nível do jogador: ${playerLevel}.
      Retorne APENAS um JSON válido array de objetos com este schema:
      {
        "name": string (Nome épico do local),
        "description": string (Flavor text curto),
        "cost": number (Energia, entre 2 e 10),
        "targetScore": number (Pontos para vencer, entre ${2000 * playerLevel} e ${5000 * playerLevel}),
        "moves": number (Movimentos, entre 15 e 40),
        "rewardType": string ("wood", "stone", "crop", ou "potion"),
        "difficulty": string ("Fácil", "Médio", "Difícil", "Lendário"),
        "color": string ("emerald", "stone", "yellow", "purple", "red", "cyan")
      }`,
      config: {
        responseMimeType: "application/json",
        temperature: 1,
      }
    });

    const text = response.text || "[]";
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json.map((m: any, i: number) => ({ ...m, id: `ai_${Date.now()}_${i}` }));
    }
    return FALLBACK_MISSIONS;
  } catch (e) {
    console.warn("AI Mission Gen Failed:", e);
    return FALLBACK_MISSIONS;
  }
}
