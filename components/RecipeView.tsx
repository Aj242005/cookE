import React from 'react';
import { Recipe } from '../types';

interface RecipeViewProps {
  recipe: Recipe;
  onStartCooking: () => void;
  onBack: () => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onStartCooking, onBack }) => {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Notion-style Banner */}
      <div className="h-48 bg-gradient-to-r from-orange-100 to-rose-100 relative group">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/50 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-all text-gray-600"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="absolute -bottom-8 left-8 text-6xl shadow-sm rounded-full bg-white p-1">
          {recipe.emoji}
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-12 px-8 pb-24">
        {/* Header */}
        <h1 className="text-4xl font-bold font-serif text-gray-900 mb-4">{recipe.title}</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">#{tag}</span>
          ))}
        </div>

        <p className="text-lg text-gray-600 border-l-4 border-orange-500 pl-4 italic mb-8">
          {recipe.description}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Time</p>
            <p className="font-semibold text-gray-800">{recipe.time}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Difficulty</p>
            <p className="font-semibold text-gray-800">{recipe.difficulty}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold">Calories</p>
            <p className="font-semibold text-gray-800">{recipe.calories || 'N/A'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Ingredients Column */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-basket-shopping text-orange-500"></i> Ingredients
            </h2>
            <div className="space-y-3">
              {recipe.ingredients?.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                  <div className="flex-1 border-b border-gray-100 pb-2 group-hover:border-transparent">
                    <span className="font-medium text-gray-900">{ing.item}</span>
                    <span className="text-gray-400 text-sm ml-2">{ing.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Preview Column */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-list-ol text-orange-500"></i> Steps Overview
            </h2>
            <div className="space-y-4">
              {recipe.steps?.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button 
            onClick={onStartCooking}
            className="bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center gap-3 animate-bounce-slight"
          >
            <i className="fas fa-play"></i> Start Cooking Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeView;