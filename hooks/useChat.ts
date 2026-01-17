import { useState, useCallback } from 'react';
import { Message, UserRole, Recipe, MealPlan, UserPreferences } from '../types';
import { sendToGemini } from '../services/geminiService';
import { WELCOME_MESSAGE } from '../constants';

interface UseChatProps {
  preferences: UserPreferences | null;
  zenMode: boolean;
}

export const useChat = ({ preferences, zenMode }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: UserRole.MODEL, text: WELCOME_MESSAGE, timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);

  const sendMessage = useCallback(async (text: string, imageBase64?: string, hiddenPrompt?: string) => {
    // 1. Optimistic Update
    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: UserRole.USER,
      text: text,
      image: imageBase64,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // 2. Service Call
      const promptToSend = hiddenPrompt || text;
      const { text: responseText, recipe, mealPlan } = await sendToGemini(
        messages, 
        promptToSend, 
        preferences, 
        imageBase64, 
        zenMode
      );

      // 3. Process Response
      const aiMsgId = (Date.now() + 1).toString();
      const newAiMessage: Message = {
        id: aiMsgId,
        role: UserRole.MODEL,
        text: responseText,
        timestamp: Date.now(),
        recipeData: recipe,
        mealPlanData: mealPlan
      };

      setMessages(prev => [...prev, newAiMessage]);
      
      if (recipe) {
        setRecipes(prev => {
          // Deduplicate recipes
          if (prev.some(r => r.id === recipe.id)) return prev;
          return [recipe, ...prev];
        });
      }
      
      if (mealPlan) setCurrentMealPlan(mealPlan);

    } catch (err) {
      console.error("Chat Error:", err);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: UserRole.MODEL,
        text: "I'm having a bit of trouble connecting to the cloud kitchen right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, preferences, zenMode]);

  const clearHistory = useCallback(() => {
    setMessages([{ id: 'welcome', role: UserRole.MODEL, text: WELCOME_MESSAGE, timestamp: Date.now() }]);
  }, []);

  return {
    messages,
    isLoading,
    recipes,
    setRecipes,
    currentMealPlan,
    setCurrentMealPlan,
    sendMessage,
    clearHistory
  };
};