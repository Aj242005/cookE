import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg transform rotate-3">
            <i className="fas fa-utensils"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-none font-serif tracking-tight">
              Cooking<span className="text-orange-600">Pro</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">AI CULINARY ASSISTANT</p>
          </div>
        </div>
        
        <button 
            className="text-gray-400 hover:text-orange-600 transition-colors"
            onClick={() => window.location.reload()}
            title="Start New Chat"
        >
            <i className="fas fa-redo-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;