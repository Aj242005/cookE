import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  zenMode: boolean;
  toggleZenMode: () => void;
  xp: number;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, zenMode, toggleZenMode, xp, logout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'planner', label: 'Meal Planner', icon: 'fa-calendar-week' },
    { id: 'grocery', label: 'Grocery List', icon: 'fa-shopping-basket' },
    { id: 'studio', label: 'Kitchen Studio', icon: 'fa-wand-magic-sparkles' },
    { id: 'cookbook', label: 'My Cookbook', icon: 'fa-book-open' },
    { id: 'donation', label: 'Donate Food', icon: 'fa-hand-holding-heart' },
    { id: 'profile', label: 'Chef Profile', icon: 'fa-user-circle' },
  ];

  return (
    <div className={`
      flex flex-col h-full border-r transition-all duration-300
      ${zenMode 
        ? 'border-r-sage-200 bg-sage-50' 
        : 'border-r-stone-200 bg-stone-50'} 
    `}>
      {/* Brand */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 p-2">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md transition-colors
            ${zenMode ? 'bg-sage-500' : 'bg-sage-700'}
          `}>
            <i className={`fas ${zenMode ? 'fa-leaf' : 'fa-fire-burner'} text-sm`}></i>
          </div>
          <div>
            <h1 className="font-serif font-bold text-sage-900 text-lg leading-none tracking-tight">
              Cooking<span className="text-sage-600">Pro</span>
            </h1>
          </div>
        </div>
        
        {/* Level Badge */}
        <div className="mt-4 mx-2 px-3 py-2 bg-white rounded-xl border border-stone-200 flex items-center gap-3 shadow-sm">
           <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              {Math.floor(xp / 100) + 1}
           </div>
           <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Chef Level</p>
              <div className="w-24 h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-orange-400 rounded-full" style={{ width: `${xp % 100}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`
              w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
              ${currentView === item.id 
                ? 'bg-white text-sage-900 shadow-sm ring-1 ring-stone-200' 
                : 'text-stone-500 hover:bg-white/60 hover:text-sage-800'
              }
            `}
          >
            <i className={`fas ${item.icon} w-5 text-center ${currentView === item.id ? 'text-sage-600' : 'text-stone-400'}`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 space-y-3 border-t border-stone-200">
        <button
          onClick={toggleZenMode}
          className={`
            w-full p-3 rounded-xl border transition-all duration-300 relative overflow-hidden flex items-center gap-3 group
            ${zenMode 
              ? 'border-sage-300 bg-sage-200 text-sage-800' 
              : 'border-stone-200 bg-white text-stone-600 hover:border-sage-300'
            }
          `}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${zenMode ? 'bg-sage-100 text-sage-600' : 'bg-stone-100 text-stone-400 group-hover:text-sage-600'}`}>
             <i className="fas fa-spa"></i>
          </div>
          <span className="text-sm font-bold">{zenMode ? 'Zen Active' : 'Zen Mode'}</span>
        </button>

        <button
          onClick={logout}
          className="w-full p-3 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
        >
           <i className="fas fa-sign-out-alt"></i> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;