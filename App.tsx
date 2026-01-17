import React, { useState, useEffect } from 'react';
import { sendToGemini } from './services/geminiService';
import { Message, UserRole, Recipe, ViewState, UserPreferences, MealPlan } from './types';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RecipeView from './components/RecipeView';
import CookingMode from './components/CookingMode';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import MealPlanner from './components/MealPlanner';
import GroceryList from './components/GroceryList';
import SocialShare from './components/SocialShare';
import LandingPage from './components/LandingPage';
import DonationFinder from './components/DonationFinder';
import ChefProfile from './components/ChefProfile';
import { useChat } from './hooks/useChat';

const App: React.FC = () => {
  // --- UI STATE ---
  const [currentView, setView] = useState<ViewState>('landing');
  const [zenMode, setZenMode] = useState(false);
  const [xp, setXp] = useState(150);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');

  // --- LOGIC HOOKS ---
  const { 
    messages, 
    isLoading, 
    recipes, 
    setRecipes, 
    currentMealPlan, 
    setCurrentMealPlan, 
    sendMessage, 
    clearHistory 
  } = useChat({ preferences, zenMode });

  // --- INITIALIZATION ---
  useEffect(() => {
    // Check for persisted user
    const storedUser = localStorage.getItem('cookingPro_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setPreferences(parsedUser);
        // If user exists, skip landing
        if (parsedUser.cityType && parsedUser.kitchenSetup) {
           setView('dashboard');
        } else {
           setView('onboarding');
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('cookingPro_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cookingPro_user');
    setPreferences(null);
    setView('landing');
    clearHistory();
  };

  // --- HANDLERS ---
  const handleGeneratePlan = async (days: number, ingredients: string, optimization?: string) => {
    let prompt = `Generate a ${days}-day meal plan using these ingredients: ${ingredients}. Output strictly as JSON.`;
    if (optimization) prompt += ` Optimise specifically for: ${optimization}.`;

    // Send hidden prompt via hook
    await sendMessage(
      optimization 
        ? `Optimising current plan for ${optimization}...` 
        : `Please create a ${days}-day plan using my ingredients: ${ingredients}`, 
      undefined, 
      prompt
    );
  };

  const handleShareRecipe = async (recipe: Recipe) => {
    try {
      // Direct call since we don't want this in chat history
      const { text } = await sendToGemini([], `Write an engaging Instagram caption for this dish: ${recipe.title}. Include hashtags.`, preferences);
      setShareCaption(text);
      setActiveRecipeId(recipe.id);
      setShowShareModal(true);
    } catch (e) {
      console.error(e);
      alert("Could not generate caption. Please try again.");
    }
  };

  // --- RENDERERS ---
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setView('auth')} />;
  }

  if (currentView === 'auth') {
    return <Auth onLogin={(user) => {
        setPreferences(user as UserPreferences);
        setView('onboarding');
    }} />;
  }

  if (currentView === 'onboarding') {
    return <Onboarding 
      initialName={preferences?.name} 
      initialAvatar={preferences?.avatar}
      onComplete={(prefs) => {
        const merged = { ...preferences, ...prefs };
        setPreferences(merged);
        localStorage.setItem('cookingPro_user', JSON.stringify(merged));
        setView('dashboard');
    }} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            xp={xp} 
            recipes={recipes} 
            setView={setView} 
            onSelectRecipe={(id) => { setActiveRecipeId(id); setView('cookbook'); }}
            zenMode={zenMode}
            preferences={preferences}
            onGenerateDailyPick={async () => {
              setView('studio');
              await sendMessage("What should I cook today based on my preferences?", undefined, "Suggest a daily special meal based on diet/budget. Include JSON.");
            }}
            isGeneratingPick={isLoading}
          />
        );
      
      case 'planner':
        return (
          <MealPlanner 
            preferences={preferences}
            currentPlan={currentMealPlan}
            onGeneratePlan={handleGeneratePlan}
            isLoading={isLoading && !currentMealPlan} 
            onViewRecipe={(r) => {
               if (!recipes.find(ex => ex.id === r.id)) setRecipes(prev => [r, ...prev]);
               setActiveRecipeId(r.id);
               setView('cookbook');
            }}
            onSavePlan={() => setView('grocery')}
          />
        );

      case 'grocery':
        return <GroceryList plan={currentMealPlan} />;
      
      case 'donation':
        return <DonationFinder preferences={preferences} />;

      case 'profile':
        return <ChefProfile preferences={preferences} xp={xp} />;

      case 'studio':
        return (
          <div className="flex flex-col h-full bg-[#fafaf9] relative">
            <div className={`
                border-b p-4 shadow-sm z-10 flex justify-between items-center transition-colors
                ${zenMode ? 'bg-sage-50 border-sage-100' : 'bg-white/80 backdrop-blur-sm border-stone-200'}
            `}>
               <h2 className={`font-bold ${zenMode ? 'text-sage-800' : 'text-stone-700'}`}>
                  {zenMode ? 'Zen Kitchen' : 'Kitchen Studio'}
               </h2>
               {zenMode && <span className="text-xs bg-sage-200 text-sage-800 px-2 py-1 rounded-full font-bold flex items-center gap-1"><i className="fas fa-leaf"></i> MODE ACTIVE</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-2">
                  <ChatMessage message={msg} />
                  
                  {/* Interactive Cards Logic */}
                  {msg.recipeData && (
                    <div className="ml-12 mt-2 max-w-sm bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden animate-fade-in-up group">
                       <div className="h-24 bg-sage-100 flex items-center justify-center text-4xl">
                          {msg.recipeData.emoji}
                       </div>
                       <div className="p-4">
                          <h3 className="font-bold text-lg">{msg.recipeData.title}</h3>
                          <div className="flex gap-2 text-xs text-gray-500 mt-2">
                            <span>{msg.recipeData.time}</span>
                            <span>•</span>
                            <span>{msg.recipeData.difficulty}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                             <button 
                               onClick={() => {
                                 setActiveRecipeId(msg.recipeData!.id);
                                 setView('cookbook');
                               }}
                               className="flex-1 bg-sage-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-sage-800"
                             >
                               View & Cook
                             </button>
                             <button
                               onClick={() => handleShareRecipe(msg.recipeData!)}
                               className="px-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100"
                               title="Share to Instagram"
                             >
                               <i className="fab fa-instagram"></i>
                             </button>
                          </div>
                       </div>
                    </div>
                  )}

                  {msg.mealPlanData && (
                     <div className="ml-12 mt-2 max-w-sm bg-white rounded-xl border border-blue-200 shadow-md p-4 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              <i className="fas fa-calendar-alt"></i>
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800">{msg.mealPlanData.title}</h3>
                              <p className="text-xs text-gray-500">{msg.mealPlanData.days.length} Days • {msg.mealPlanData.totalBudgetEstimate}</p>
                           </div>
                        </div>
                        {msg.mealPlanData.isFallback && <p className="text-xs text-red-500 font-bold mb-2">Budget Adjusted Plan</p>}
                        <button 
                           onClick={() => setView('planner')}
                           className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                        >
                           Open Planner
                        </button>
                     </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-center gap-2 text-sage-400 text-sm ml-4 italic">
                    <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div> 
                    {zenMode ? 'Meditating on ingredients...' : 'Chef is thinking...'}
                 </div>
              )}
            </div>

            <div className={`p-4 border-t ${zenMode ? 'bg-sage-50/30 border-sage-100' : 'bg-white border-stone-200'}`}>
               <InputArea onSendMessage={(t, i) => sendMessage(t, i)} isLoading={isLoading} zenMode={zenMode} />
            </div>
          </div>
        );

      case 'cookbook':
        const recipeToView = recipes.find(r => r.id === activeRecipeId) || recipes[0];
        if (!recipeToView) return <div className="p-8 text-center text-stone-500">No recipe selected.</div>;
        return (
          <RecipeView 
            recipe={recipeToView} 
            onStartCooking={() => setView('cooking')} 
            onBack={() => setView('dashboard')}
          />
        );
      
      case 'cooking':
        let recipeToCook = recipes.find(r => r.id === activeRecipeId);
        if (!recipeToCook && currentMealPlan) {
           for (const day of currentMealPlan.days) {
              const found = day.slots.find(slot => slot.recipe.id === activeRecipeId);
              if (found) {
                 recipeToCook = found.recipe;
                 break;
              }
           }
        }
        if (!recipeToCook) {
           return (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                 <p className="text-sage-500 mb-4">Could not load recipe details.</p>
                 <button onClick={() => setView('dashboard')} className="text-sage-800 font-bold underline">Go Dashboard</button>
              </div>
           );
        }
        return (
          <CookingMode 
            recipe={recipeToCook} 
            onComplete={() => { setXp(prev => prev + 50); setView('dashboard'); }}
            onExit={() => setView('cookbook')}
          />
        );

      default:
        return <div>View not found</div>;
    }
  };

  if (currentView === 'cooking') return renderContent();

  return (
    <div className="flex h-screen bg-[#fafaf9] font-sans text-stone-900">
      <aside className="w-64 hidden md:block h-full z-20">
        <Sidebar 
          currentView={currentView} 
          setView={setView} 
          zenMode={zenMode}
          toggleZenMode={() => setZenMode(!zenMode)}
          xp={xp}
          logout={handleLogout}
        />
      </aside>

      <main className="flex-1 h-full overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Shared Modals */}
      {showShareModal && activeRecipeId && recipes.find(r => r.id === activeRecipeId) && (
         <SocialShare 
            recipe={recipes.find(r => r.id === activeRecipeId)!} 
            caption={shareCaption}
            onClose={() => setShowShareModal(false)} 
         />
      )}
    </div>
  );
};

export default App;