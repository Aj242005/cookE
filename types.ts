export enum UserRole {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: UserRole;
  text: string;
  image?: string;
  timestamp: number;
  recipeData?: Recipe;
  mealPlanData?: MealPlan;
}

export interface Ingredient {
  item: string;
  amount: string;
  isDone: boolean;
  substitution?: string; // Required: 2 substitutions per meal
}

export interface Step {
  instruction: string;
  tip?: string;
  isCompleted: boolean;
  timerSeconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  calories?: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  emoji: string;
  budget?: 'Low' | 'Medium' | 'High';
}

export interface MealSlot {
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  recipe: Recipe;
}

export interface ScheduleOverride {
  isSkipped: boolean;
  customTime?: string; // e.g. "20:00"
  rescueNote?: string; // Generated tip for unused ingredients
}

export interface DayPlan {
  day: number;
  slots: MealSlot[];
  scheduleOverride?: ScheduleOverride;
}

export interface GroceryCategory {
  category: string;
  items: string[];
}

export interface MealPlan {
  id: string;
  title: string;
  personalisationProof: string; // "Based on your inputs..."
  days: DayPlan[];
  totalBudgetEstimate: string;
  groceryList: GroceryCategory[]; // Grouped by category
  cookingSequence: string[]; // Daily cooking sequence
  isFallback?: boolean; // If budget validation failed
}

export interface UserPreferences {
  diet: 'Omnivore' | 'Vegetarian' | 'Vegan' | 'Pescatarian' | 'Keto' | 'Paleo' | 'Mediterranean' | 'Gluten-Free' | 'Low-Carb' | 'Balanced';
  allergies: string[];
  budget: string; // e.g. "₹500"
  cityType: 'Metro' | 'Town' | 'Village';
  kitchenSetup: string[]; // e.g., ["Stove", "Mixer"]
  cookingTimePerMeal: string; // e.g., "30 mins"
  name?: string;
  avatar?: string;
  // Scheduling Preferences
  cookingSlot: string; // e.g., "19:00" (24h format)
  shoppingFrequency: 'Daily' | 'Every 2 Days' | 'Weekly';
  reminderEnabled: boolean;
}

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  location?: string;
  type: 'shopping' | 'prep' | 'cooking' | 'reminder';
}

export type ViewState = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'studio' | 'cookbook' | 'cooking' | 'planner' | 'grocery' | 'donation' | 'profile';

export interface AppState {
  currentView: ViewState;
  zenMode: boolean;
  recipes: Recipe[];
  activeRecipeId: string | null;
  xp: number;
  preferences: UserPreferences | null;
  currentMealPlan: MealPlan | null;
}