import React from 'react';
import { ViewState, Recipe, UserPreferences } from '../types';

interface DashboardProps {
  xp: number;
  recipes: Recipe[];
  setView: (view: ViewState) => void;
  onSelectRecipe: (id: string) => void;
  zenMode: boolean;
  preferences: UserPreferences | null;
  onGenerateDailyPick: () => void;
  isGeneratingPick: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  xp, recipes, setView, onSelectRecipe, zenMode, preferences, onGenerateDailyPick, isGeneratingPick
}) => {
  const level = Math.floor(xp / 100) + 1;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className={`
        rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-colors duration-500
        ${zenMode ? 'bg-gradient-to-r from-sage-600 to-sage-500' : 'bg-gradient-to-r from-earth-600 to-earth-500'}
      `}>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-serif font-bold mb-2">
            {zenMode ? "Breathe. Relax. Cook." : `Welcome back, ${preferences?.name || 'Chef'}!`}
          </h1>
          <p className="text-white/90 mb-6 text-lg">
            {zenMode 
              ? "You're in Zen Mode. Minimal effort, maximum nourishment." 
              : "Ready to nourish yourself today?"}
          </p>
          <button 
            onClick={() => setView('studio')}
            className="bg-white text-sage-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <i className="fas fa-microphone"></i> Start New Chat
          </button>
        </div>
        
        {/* Decorative */}
        <i className={`fas ${zenMode ? 'fa-leaf' : 'fa-carrot'} absolute -bottom-10 -right-10 text-9xl text-white/10 rotate-12`}></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm">
          <h3 className="text-sage-500 text-sm font-bold uppercase tracking-wider mb-4">Your Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-sage-100 text-sage-600">
              {level}
            </div>
            <div>
              <p className="font-bold text-sage-800 text-lg">Level {level} Chef</p>
              <p className="text-sage-500 text-sm">{xp} XP Earned</p>
            </div>
          </div>
          <div className="mb-4">
             <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-sage-50 text-sage-600 rounded text-xs">{preferences?.diet}</span>
                {preferences?.allergies?.map(a => <span key={a} className="px-2 py-1 bg-red-50 text-red-500 rounded text-xs">No {a}</span>)}
             </div>
          </div>
        </div>

        {/* Daily Suggestions Card (New) */}
        <div className="bg-white rounded-2xl p-6 border border-sage-100 shadow-sm md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <i className="fas fa-calendar-day text-8xl text-earth-400 transform -rotate-12"></i>
          </div>
          
          <h3 className="text-sage-500 text-sm font-bold uppercase tracking-wider mb-2">
            Chef's Daily Pick
          </h3>
          <h2 className="text-2xl font-serif font-bold text-sage-800 mb-2">
            What should I cook today?
          </h2>
          <p className="text-sage-500 mb-6 max-w-md">
            Get a personalized recommendation based on your {preferences?.diet?.toLowerCase() || 'dietary'} diet and seasonal ingredients.
          </p>
          
          <button 
             onClick={onGenerateDailyPick}
             disabled={isGeneratingPick}
             className={`
                px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all
                ${isGeneratingPick ? 'bg-gray-400 cursor-wait' : 'bg-sage-800 hover:bg-sage-900 hover:scale-105 shadow-lg'}
             `}
          >
             {isGeneratingPick ? (
                <><i className="fas fa-spinner fa-spin"></i> Asking the Chef...</>
             ) : (
                <><i className="fas fa-magic"></i> Get Daily Suggestion</>
             )}
          </button>
        </div>
      </div>

      {/* Recent Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-sage-800">Your Cookbook</h2>
          <button onClick={() => setView('cookbook')} className="text-sm font-medium text-sage-500 hover:text-sage-900">View All</button>
        </div>
        
        {recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-sage-200">
            <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-3 text-sage-300">
              <i className="fas fa-book text-2xl"></i>
            </div>
            <p className="text-sage-500">No recipes saved yet.</p>
            <p className="text-sm text-sage-400">Go to the Studio to generate one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.slice(0, 3).map(recipe => (
              <div 
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-sage-100 hover:shadow-md hover:border-earth-300 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-4xl">{recipe.emoji}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    recipe.difficulty === 'Easy' ? 'bg-sage-100 text-sage-700' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-sage-800 text-lg mb-1 group-hover:text-earth-600 transition-colors">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-sage-500 mt-3">
                  <span><i className="far fa-clock mr-1"></i> {recipe.time}</span>
                  <span><i className="fas fa-fire mr-1"></i> {recipe.calories}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;