import React from 'react';
import { UserPreferences } from '../types';

interface ChefProfileProps {
  preferences: UserPreferences | null;
  xp: number;
}

const ChefProfile: React.FC<ChefProfileProps> = ({ preferences, xp }) => {
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = level * 100;
  const progress = (xp % 100);

  // Mock Badges
  const badges = [
    { icon: 'fa-fire', name: 'Meal Streaker', color: 'text-orange-500 bg-orange-50' },
    { icon: 'fa-leaf', name: 'Zero Waste', color: 'text-green-500 bg-green-50' },
    { icon: 'fa-carrot', name: 'Veggie Master', color: 'text-sage-600 bg-sage-50' },
  ];

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto h-full overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-sage-800 to-stone-800"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
            {preferences.avatar ? (
              <img src={preferences.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-user text-4xl text-stone-300"></i>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-stone-900">{preferences.name || 'Chef'}</h1>
            <p className="text-stone-500"><i className="fas fa-map-marker-alt mr-1"></i> {preferences.cityType} • {preferences.diet}</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors">
                Edit Profile
             </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Col: Stats */}
        <div className="md:col-span-1 space-y-6">
           {/* XP Card */}
           <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-stone-700">Chef Level</h3>
                 <span className="text-2xl font-bold text-sage-600">{level}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-sage-500 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-stone-400 text-right">{xp} / {nextLevelXp} XP</p>
           </div>

           {/* Preferences Summary */}
           <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <h3 className="font-bold text-stone-700 mb-4">Kitchen Specs</h3>
              <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Budget</span>
                    <span className="font-bold text-stone-800">{preferences.budget}/day</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Time</span>
                    <span className="font-bold text-stone-800">{preferences.cookingTimePerMeal}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Shop Freq.</span>
                    <span className="font-bold text-stone-800">{preferences.shoppingFrequency}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Col: Badges & Activity */}
        <div className="md:col-span-2 space-y-6">
           
           {/* Badges */}
           <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <h3 className="font-bold text-stone-700 mb-4">Achievements</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                 {badges.map((b, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[100px] p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer">
                       <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-sm ${b.color}`}>
                          <i className={`fas ${b.icon}`}></i>
                       </div>
                       <span className="text-xs font-bold text-stone-600">{b.name}</span>
                    </div>
                 ))}
                 <div className="flex flex-col items-center gap-2 min-w-[100px] p-3 opacity-50 grayscale">
                       <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-sm bg-stone-100 text-stone-400">
                          <i className="fas fa-lock"></i>
                       </div>
                       <span className="text-xs font-bold text-stone-400">Master Chef</span>
                 </div>
              </div>
           </div>

           {/* Recent Activity Stub */}
           <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <h3 className="font-bold text-stone-700 mb-4">Cooking History</h3>
              <div className="space-y-4">
                 {[1,2,3].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                       <div className="w-10 h-10 bg-sage-50 text-sage-600 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check"></i>
                       </div>
                       <div>
                          <h4 className="font-bold text-stone-800 text-sm">Completed "Spicy Lentil Curry"</h4>
                          <p className="text-xs text-stone-500">2 days ago • +50 XP</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ChefProfile;