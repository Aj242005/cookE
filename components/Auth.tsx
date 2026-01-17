import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface AuthProps {
  onLogin: (user: Partial<UserPreferences>) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    // Simulate API delay
    setTimeout(() => {
      // Create a mock user object that looks like it came from Google
      const mockUser: Partial<UserPreferences> = {
        name: "Alex Johnson",
        avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=ea580c&color=fff",
        // We'll default preferences here, but they will be overwritten/merged by onboarding if needed
      };
      
      // Persist for "real" feeling
      localStorage.setItem('cookingPro_user', JSON.stringify(mockUser));
      
      setIsLoggingIn(false);
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center animate-fade-in-up border border-white/20">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-3 mx-auto mb-6">
          <i className="fas fa-utensils text-3xl"></i>
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Cooking<span className="text-orange-600">Pro</span></h1>
        <p className="text-gray-500 mb-8 font-medium">Your Personal AI Sous-Chef.</p>

        {isLoggingIn ? (
          <div className="py-4 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-500">Connecting to Google Securely...</p>
          </div>
        ) : (
          <>
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all mb-3 group"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
            >
              Guest Access
            </button>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-xs">
           <span><i className="fas fa-lock"></i> Secure Login</span>
           <span>•</span>
           <span><i className="fas fa-shield-alt"></i> Privacy First</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;