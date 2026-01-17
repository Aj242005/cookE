import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import confetti from 'canvas-confetti';

interface CookingModeProps {
  recipe: Recipe;
  onComplete: () => void;
  onExit: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onComplete, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Guard clause for recipes with no steps
  if (!recipe?.steps || recipe.steps.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col text-white items-center justify-center p-8 text-center">
        <i className="fas fa-exclamation-circle text-4xl text-orange-500 mb-4"></i>
        <h2 className="text-2xl font-bold mb-2">No Steps Available</h2>
        <p className="text-gray-400 mb-6">This recipe data is incomplete.</p>
        <button 
          onClick={onExit}
          className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Safe access to current step
  const currentStep = recipe.steps[currentStepIndex];

  // Defensive: If index goes out of bounds or step is undefined
  if (!currentStep) {
     return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
           <div className="text-white text-center">
              <p>Step loading error.</p>
              <button onClick={onExit} className="mt-4 underline">Exit</button>
           </div>
        </div>
     );
  }

  const progress = ((currentStepIndex + 1) / recipe.steps.length) * 100;

  // Initialize timer for new step
  useEffect(() => {
    setIsTimerRunning(false); // Stop any previous timer
    if (currentStep?.timerSeconds) {
      setTimeLeft(currentStep.timerSeconds);
    } else {
      setTimeLeft(0);
    }
  }, [currentStepIndex, currentStep]);

  // Timer countdown logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
           if (prev <= 1) {
              // Timer Finished
              setIsTimerRunning(false);
              confetti({
                 particleCount: 30,
                 spread: 40,
                 origin: { y: 0.7 },
                 colors: ['#22c55e']
              });
              return 0;
           }
           return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleNext = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Small confetti burst for progress
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.9 },
        colors: ['#fbbf24']
      });
    } else {
      // Finished entire recipe
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      onComplete();
    }
  };

  const handlePrev = () => {
      if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 flex justify-between items-center bg-gray-900/50 backdrop-blur-sm z-10">
        <button 
            onClick={onExit} 
            className="text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
            aria-label="Exit Cooking Mode"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
        <div className="text-center">
          <p className="text-orange-400 text-[10px] uppercase tracking-widest font-bold mb-1">NOW COOKING</p>
          <h2 className="font-bold text-sm md:text-base max-w-[200px] truncate">{recipe.title}</h2>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-800 w-full">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 max-w-3xl mx-auto text-center w-full overflow-y-auto">
        <div className="mb-6 md:mb-10 animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-full font-bold text-sm border border-gray-700 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Step {currentStepIndex + 1} of {recipe.steps.length}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-serif mb-8 leading-snug md:leading-tight animate-fade-in-up">
          {currentStep.instruction}
        </h1>

        {/* Pro Tip */}
        {currentStep.tip && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 max-w-lg w-full animate-fade-in-up shadow-xl transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold mb-2">
                <i className="fas fa-lightbulb"></i> 
                <span className="text-sm tracking-wide uppercase">Chef's Secret</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed italic">"{currentStep.tip}"</p>
          </div>
        )}

        {/* Timer */}
        {currentStep.timerSeconds ? (
          <div className="mt-10 animate-fade-in">
            <div className={`
                text-6xl md:text-8xl font-mono font-bold tracking-wider mb-6 transition-colors
                ${isTimerRunning ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-gray-500'}
            `}>
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`
                px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg flex items-center gap-3 mx-auto
                ${isTimerRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'}
              `}
            >
              <i className={`fas ${isTimerRunning ? 'fa-pause' : 'fa-play'}`}></i>
              {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
            </button>
          </div>
        ) : (
            /* Spacer if no timer to keep layout consistent */
            <div className="mt-8 h-4"></div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 md:p-8 bg-gray-900/80 border-t border-gray-800 flex justify-between items-center backdrop-blur-md z-10">
        <button 
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`
             flex items-center gap-2 font-bold transition-colors
             ${currentStepIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}
          `}
        >
          <i className="fas fa-arrow-left"></i> <span className="hidden md:inline">Previous</span>
        </button>

        <button 
          onClick={handleNext}
          className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          {currentStepIndex === recipe.steps.length - 1 ? 'Finish Cooking!' : 'Next Step'} 
          <i className={`fas ${currentStepIndex === recipe.steps.length - 1 ? 'fa-check' : 'fa-arrow-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default CookingMode;