import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ValidationRules, sanitizeText } from '../utils/validation';
import { Button } from './ui/Button';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
  initialName?: string;
  initialAvatar?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialName, initialAvatar }) => {
  const [step, setStep] = useState(1);
  const [diet, setDiet] = useState<UserPreferences['diet']>('Omnivore');
  const [cityType, setCityType] = useState<UserPreferences['cityType']>('Metro');
  const [kitchenSetup, setKitchenSetup] = useState<string[]>(['Stove']);
  const [cookingTime, setCookingTime] = useState<string>('30-45 mins');
  const [budgetInput, setBudgetInput] = useState('500');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  
  // New Scheduling State
  const [cookingSlot, setCookingSlot] = useState('19:00');
  const [shoppingFrequency, setShoppingFrequency] = useState<UserPreferences['shoppingFrequency']>('Every 2 Days');
  
  const [isExiting, setIsExiting] = useState(false);

  const diets = [
    { id: 'Omnivore', icon: '🥩', label: 'Everything' },
    { id: 'Vegetarian', icon: '🥗', label: 'Vegetarian' },
    { id: 'Vegan', icon: '🌱', label: 'Vegan' },
    { id: 'Keto', icon: '🥑', label: 'Keto' },
    { id: 'Mediterranean', icon: '🍋', label: 'Mediterranean' },
    { id: 'Gluten-Free', icon: '🌾', label: 'Gluten-Free' },
    { id: 'Low-Carb', icon: '🍗', label: 'Low-Carb' },
    { id: 'Balanced', icon: '⚖️', label: 'Balanced' },
  ];

  const commonAllergies = ['Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs', 'Tree Nuts'];

  const handleFinish = () => {
    // Final Validation Check
    if (!ValidationRules.budget.isValid(budgetInput)) {
        setBudgetError(ValidationRules.budget.errorMsg);
        setStep(3); // Go back to budget step
        return;
    }

    setIsExiting(true);
    setTimeout(() => {
      onComplete({ 
        diet, 
        allergies, 
        budget: `₹${parseInt(budgetInput, 10)}`, // Store as clean number string formatted
        cityType,
        kitchenSetup,
        cookingTimePerMeal: cookingTime,
        name: sanitizeText(initialName || ''),
        avatar: initialAvatar,
        cookingSlot,
        shoppingFrequency,
        reminderEnabled: true
      });
    }, 500);
  };

  const toggleKitchenItem = (item: string) => {
    setKitchenSetup(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleAllergy = (item: string) => {
    setAllergies(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addCustomAllergy = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customAllergy.trim()) {
      const cleaned = sanitizeText(customAllergy);
      if (cleaned && !allergies.includes(cleaned)) {
        setAllergies([...allergies, cleaned]);
      }
      setCustomAllergy('');
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setBudgetInput(val);
      if (!ValidationRules.budget.isValid(val)) {
          setBudgetError(ValidationRules.budget.errorMsg);
      } else {
          setBudgetError(null);
      }
  };

  // Step 1: Diet & City
  const renderStep1 = () => (
    <>
      <div className="mb-6 text-center">
        <span className="text-sage-500 font-bold tracking-wider text-xs uppercase">Step 1 of 4</span>
        <h2 className="text-3xl font-serif font-bold text-sage-900 mt-2">The Basics</h2>
      </div>
      
      <label className="block text-sm font-bold text-sage-700 mb-2">Diet Type</label>
      <div className="grid grid-cols-2 gap-3 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {diets.map((d) => (
          <button
            key={d.id}
            onClick={() => setDiet(d.id as any)}
            className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${diet === d.id ? 'border-sage-500 bg-sage-50 ring-1 ring-sage-200' : 'border-sage-200 bg-white hover:bg-sage-50'}`}
          >
            <span>{d.icon}</span> <span className="text-sm font-bold text-sage-700">{d.label}</span>
          </button>
        ))}
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Where do you live?</label>
      <div className="flex gap-2 mb-6">
        {['Metro', 'Town', 'Village'].map((city) => (
           <button
             key={city}
             onClick={() => setCityType(city as any)}
             className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all
               ${cityType === city 
                 ? 'bg-sage-800 text-white border-sage-800 shadow-md transform scale-105' 
                 : 'bg-white text-sage-600 border-sage-300 hover:bg-sage-50'}
             `}
           >
             {city}
           </button>
        ))}
      </div>
      
      <Button onClick={() => setStep(2)} fullWidth icon="fa-arrow-right">Next</Button>
    </>
  );

  // Step 2: Kitchen & Time
  const renderStep2 = () => (
    <>
      <div className="mb-6 text-center">
        <span className="text-sage-500 font-bold tracking-wider text-xs uppercase">Step 2 of 4</span>
        <h2 className="text-3xl font-serif font-bold text-sage-900 mt-2">Kitchen & Time</h2>
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Kitchen Setup</label>
      <div className="flex flex-wrap gap-2 mb-6">
        {['Stove', 'Microwave', 'Oven', 'Mixer', 'Air Fryer', 'Rice Cooker'].map((item) => (
          <button
            key={item}
            onClick={() => toggleKitchenItem(item)}
            className={`px-3 py-2 rounded-full text-sm font-bold border transition-colors ${kitchenSetup.includes(item) ? 'bg-sage-100 text-sage-800 border-sage-300' : 'bg-white text-sage-500 border-sage-200'}`}
          >
            {kitchenSetup.includes(item) && <i className="fas fa-check mr-1"></i>} {item}
          </button>
        ))}
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Time per Meal</label>
      <select 
        value={cookingTime} 
        onChange={(e) => setCookingTime(e.target.value)}
        className="w-full p-3 bg-white border border-sage-200 rounded-xl text-sage-800 font-medium focus:ring-2 focus:ring-sage-500 outline-none mb-6"
      >
        <option>15 mins (Quick)</option>
        <option>30-45 mins (Standard)</option>
        <option>60+ mins (Elaborate)</option>
      </select>

      <div className="flex gap-3">
        <Button onClick={() => setStep(1)} variant="ghost">Back</Button>
        <Button onClick={() => setStep(3)} className="flex-1" icon="fa-arrow-right">Next</Button>
      </div>
    </>
  );

  // Step 3: Budget & Allergies
  const renderStep3 = () => (
    <>
       <div className="mb-6 text-center">
        <span className="text-sage-500 font-bold tracking-wider text-xs uppercase">Step 3 of 4</span>
        <h2 className="text-3xl font-serif font-bold text-sage-900 mt-2">Constraints</h2>
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Daily Budget (₹)</label>
      <div className="relative mb-6">
        <span className="absolute left-4 top-3.5 text-sage-400 font-bold">₹</span>
        <input 
           type="number"
           value={budgetInput}
           onChange={handleBudgetChange}
           className={`w-full pl-8 p-3 bg-white border rounded-xl text-sage-900 font-bold focus:ring-2 outline-none
             ${budgetError ? 'border-red-300 focus:ring-red-200' : 'border-sage-200 focus:ring-sage-500'}
           `}
           placeholder="500"
        />
        {budgetError && <p className="text-xs text-red-500 mt-1 font-bold ml-1">{budgetError}</p>}
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Allergies</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {commonAllergies.map(allergy => (
          <button
            key={allergy}
            onClick={() => toggleAllergy(allergy)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${allergies.includes(allergy) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-sage-500 border-sage-200 hover:border-sage-400'}`}
          >
            {allergy} {allergies.includes(allergy) && '✕'}
          </button>
        ))}
      </div>
      <input 
         type="text" 
         value={customAllergy}
         onChange={(e) => setCustomAllergy(e.target.value)}
         onKeyDown={addCustomAllergy}
         placeholder="Type other allergy & press Enter..."
         className="w-full p-4 bg-white border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none text-lg text-sage-900 placeholder-sage-400"
      />

      <div className="flex gap-3 mt-8">
        <Button onClick={() => setStep(2)} variant="ghost">Back</Button>
        <Button 
            onClick={() => {
                if (!budgetError && ValidationRules.budget.isValid(budgetInput)) setStep(4);
            }} 
            disabled={!!budgetError}
            className="flex-1"
            icon="fa-arrow-right"
        >
            Next
        </Button>
      </div>
    </>
  );

  // Step 4: Scheduling (New)
  const renderStep4 = () => (
    <>
      <div className="mb-6 text-center">
        <span className="text-sage-500 font-bold tracking-wider text-xs uppercase">Step 4 of 4</span>
        <h2 className="text-3xl font-serif font-bold text-sage-900 mt-2">Smart Schedule</h2>
      </div>

      <label className="block text-sm font-bold text-sage-700 mb-2">Preferred Cooking Time</label>
      <input 
        type="time" 
        value={cookingSlot}
        onChange={(e) => setCookingSlot(e.target.value)}
        className="w-full p-3 bg-white border border-sage-200 rounded-xl text-sage-900 font-bold focus:ring-2 focus:ring-sage-500 outline-none mb-6"
      />

      <label className="block text-sm font-bold text-sage-700 mb-2">Shopping Frequency</label>
      <div className="grid grid-cols-1 gap-2 mb-6">
        {['Daily', 'Every 2 Days', 'Weekly'].map((freq) => (
          <button
            key={freq}
            onClick={() => setShoppingFrequency(freq as any)}
            className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all
              ${shoppingFrequency === freq 
                ? 'bg-sage-50 border-sage-500 shadow-sm' 
                : 'bg-white border-sage-200 hover:bg-sage-50'}
            `}
          >
            <span className="font-bold text-sage-800">{freq}</span>
            {shoppingFrequency === freq && <i className="fas fa-check-circle text-sage-600"></i>}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={() => setStep(3)} variant="ghost">Back</Button>
        <Button onClick={handleFinish} className="flex-1" icon="fa-check">
           Finish Setup
        </Button>
      </div>
    </>
  );

  return (
    <div className={`h-screen w-full flex items-center justify-center bg-[#f4f7f4] p-4 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-xl w-full">
           {step === 1 && renderStep1()}
           {step === 2 && renderStep2()}
           {step === 3 && renderStep3()}
           {step === 4 && renderStep4()}
        </div>
    </div>
  );
};

export default Onboarding;