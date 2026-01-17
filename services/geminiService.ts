import { GoogleGenAI } from "@google/genai";
import { Message, UserRole, Recipe, UserPreferences, MealPlan } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { apiCache } from "./cacheService";

// --- Types ---
interface GenerationResult {
  text: string;
  recipe?: Recipe;
  mealPlan?: MealPlan;
}

// --- Configuration ---
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust JSON extraction that handles Markdown code blocks, 
 * plain text wrapping, and potential trailing commas.
 */
const extractJson = <T>(text: string): T | undefined => {
  if (!text) return undefined;

  let jsonString = text;

  // Strategy 1: Remove Markdown Code Blocks (standard)
  const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    jsonString = markdownMatch[1];
  }

  // Strategy 2: Find first '{' and last '}' - Handles text before/after
  const firstOpen = jsonString.indexOf('{');
  const lastClose = jsonString.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    jsonString = jsonString.substring(firstOpen, lastClose + 1);
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    // Strategy 3: Loose cleanup if parse fails (remove non-printable chars)
    try {
        const cleaned = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        return JSON.parse(cleaned) as T;
    } catch (e2) {
        console.warn("JSON Parse Failed even after cleanup", e);
    }
  }
  return undefined;
};

/**
 * Utility: Wait function for backoff
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main Interaction Function with Retry Logic
 */
export const sendToGemini = async (
  history: Message[],
  currentText: string,
  preferences: UserPreferences | null,
  currentImage?: string,
  isZenMode: boolean = false
): Promise<GenerationResult> => {
  // Check Cache first (skip if image is present as it's large/unique)
  if (!currentImage) {
      const cacheKey = apiCache.generateKey(currentText, { 
          historyLastId: history[history.length-1]?.id, 
          zen: isZenMode,
          prefs: preferences 
      });
      const cached = apiCache.get<GenerationResult>(cacheKey);
      if (cached) {
          console.debug("Returning cached response for:", currentText);
          return cached;
      }
  }

  const ai = getClient();
  const modelName = currentImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

  let promptContext = "";
  if (isZenMode) promptContext += "[MODE: ZEN CHEF - CALM, SOOTHING, MINIMAL]. ";
  
  if (preferences) {
      promptContext += `
[USER CONTEXT]
- Diet: ${preferences.diet}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Location: ${preferences.cityType}
- Kitchen: ${preferences.kitchenSetup?.join(', ')}
`;
  }

  const contents = history
    .filter(msg => msg.id !== 'welcome')
    .map(msg => ({
      role: msg.role === UserRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

  const parts: any[] = [];
  if (currentImage) {
    const cleanBase64 = currentImage.split(',')[1] || currentImage;
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: cleanBase64 }
    });
  }
  parts.push({ text: promptContext + currentText });
  contents.push({ role: 'user', parts });

  // Inject preferences into System Instruction
  let finalSystemInstruction = SYSTEM_INSTRUCTION;
  if (preferences) {
      finalSystemInstruction = finalSystemInstruction
          .replace('{{DIET}}', preferences.diet)
          .replace('{{ALLERGIES}}', preferences.allergies?.join(', ') || 'None')
          .replace('{{BUDGET}}', preferences.budget)
          .replace('{{CITY}}', preferences.cityType || 'Metro')
          .replace('{{KITCHEN}}', preferences.kitchenSetup?.join(', ') || 'Standard')
          .replace('{{TIME}}', preferences.cookingTimePerMeal || '45 mins');
  }

  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: finalSystemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I'm having trouble connecting to the kitchen.";
      
      const parsedData = extractJson<any>(responseText);
      // Remove the JSON block from the text shown to user to reduce clutter
      const cleanText = responseText.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();

      let recipe: Recipe | undefined;
      let mealPlan: MealPlan | undefined;

      if (parsedData) {
        if (parsedData.type === 'meal_plan' || parsedData.days) {
          mealPlan = {
            ...parsedData,
            id: parsedData.id || Date.now().toString(),
            days: parsedData.days || [],
            groceryList: parsedData.groceryList || [],
            cookingSequence: parsedData.cookingSequence || [],
            isFallback: !!parsedData.isFallback,
            totalBudgetEstimate: parsedData.totalBudgetEstimate || "Calculated at market rates"
          };
        } else if (parsedData.type === 'recipe' || parsedData.steps) {
          recipe = {
            ...parsedData,
            id: parsedData.id || Date.now().toString(),
            ingredients: parsedData.ingredients?.map((i: any) => ({ ...i, isDone: false })) || [],
            steps: parsedData.steps?.map((s: any) => ({ ...s, isCompleted: false })) || [],
            tags: parsedData.tags || [],
          };
        }
      }

      const result: GenerationResult = {
        text: cleanText || (parsedData ? "Here is the result you asked for:" : responseText),
        recipe,
        mealPlan
      };

      // Cache successful response (only if no image, to save memory)
      if (!currentImage) {
          const cacheKey = apiCache.generateKey(currentText, { 
            historyLastId: history[history.length-1]?.id, 
            zen: isZenMode,
            prefs: preferences 
          });
          apiCache.set(cacheKey, result);
      }

      return result;

    } catch (error) {
      console.error(`Gemini API Attempt ${attempt + 1} Failed:`, error);
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await wait(RETRY_DELAY_MS * Math.pow(2, attempt)); // Exponential backoff
      }
    }
  }

  throw lastError || new Error("Failed to generate content after retries.");
};