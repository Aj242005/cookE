import React, { useState, useEffect, useCallback } from 'react';
import { MealPlan, UserPreferences, CalendarEvent, DayPlan } from '../types';
import { generateCalendarEvents, generateICSFile, downloadICS } from '../services/calendarService';
import { sanitizeText, ValidationRules } from '../utils/validation';

interface MealPlannerProps {
  preferences: UserPreferences | null;
  currentPlan: MealPlan | null;
  onGeneratePlan: (days: number, ingredients: string, optimization?: string) => void;
  isLoading: boolean;
  onViewRecipe: (recipe: any) => void;
  onSavePlan: () => void;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ preferences, currentPlan, onGeneratePlan, isLoading, onViewRecipe, onSavePlan }) => {
  const [days, setDays] = useState(3);
  const [ingredients, setIngredients] = useState('');
  const [cachedPlans, setCachedPlans] = useState<Record<string, MealPlan>>({});
  const [activeOptimization, setActiveOptimization] = useState<string>('Standard');
  const [displayedPlan, setDisplayedPlan] = useState<MealPlan | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Sync props to state and cache
  useEffect(() => {
    if (currentPlan) {
        setCachedPlans(prev => ({ ...prev, [activeOptimization]: currentPlan }));
        // Performance: Use structuredClone for deep copy if supported, else fallback
        try {
            setDisplayedPlan(structuredClone(currentPlan));
        } catch(e) {
            setDisplayedPlan(JSON.parse(JSON.stringify(currentPlan)));
        }
    }
  }, [currentPlan, activeOptimization]);

  // Optimization handlers (Memoized to prevent recreation)
  const handleOptimize = useCallback((goal: string) => {
    setActiveOptimization(goal);
    if (cachedPlans[goal]) {
        try {
             setDisplayedPlan(structuredClone(cachedPlans[goal]));
        } catch(e) {
             setDisplayedPlan(JSON.parse(JSON.stringify(cachedPlans[goal])));
        }
    } else {
        const cleanIngredients = sanitizeText(ingredients);
        onGeneratePlan(days, cleanIngredients, goal);
    }
  }, [cachedPlans, days, ingredients, onGeneratePlan]);

  const handleOpenCalendar = () => {
    if (!displayedPlan || !preferences) return;
    const events = generateCalendarEvents(displayedPlan, preferences);
    setCalendarEvents(events);
    setShowCalendarModal(true);
  };

  const handleDownloadICS = () => {
    const icsContent = generateICSFile(calendarEvents);
    downloadICS(`cookingpro-plan-${new Date().toISOString().slice(0,10)}.ics`, icsContent);
    setShowCalendarModal(false);
  };

  const handleSwapRequest = (dayIndex: number, mealType: string) => {
    const cleanIngredients = sanitizeText(ingredients);
    // Explicit prompt construction handled in App.tsx via onGeneratePlan override, 
    // or we pass a specific token. Here we rely on the parent handler.
    onGeneratePlan(days, cleanIngredients, `Swap Day ${dayIndex + 1} ${mealType}`); 
  };

  // --- ADAPTIVE SCHEDULING LOGIC ---

  const handleDayTimeChange = (dayIndex: number, newTime: string) => {
    if (!displayedPlan) return;
    // Performant Local Mutation for UI responsiveness
    const newPlan = structuredClone(displayedPlan);
    if (!newPlan.days[dayIndex].scheduleOverride) {
      newPlan.days[dayIndex].scheduleOverride = { isSkipped: false };
    }
    newPlan.days[dayIndex].scheduleOverride!.customTime = newTime;
    setDisplayedPlan(newPlan);
  };

  const handleDaySkip = (dayIndex: number) => {
    if (!displayedPlan) return;
    const newPlan = structuredClone(displayedPlan);
    const day = newPlan.days[dayIndex];
    
    // Toggle Skipped Status
    const isSkipped = !(day.scheduleOverride?.isSkipped);
    
    // Generate Rescue Note (Mock logic for now, could be AI in future)
    let rescueNote = "";
    if (isSkipped) {
      // Robust check for slots existing
      const slots = day.slots || [];
      const firstRecipe = slots[0]?.recipe;
      const perishables = firstRecipe?.ingredients?.slice(0, 3).map(i => i.item).join(', ') || "fresh produce";
      rescueNote = `Freeze: ${perishables}. Use remaining veggies in Day ${dayIndex + 2} salad.`;
    }

    newPlan.days[dayIndex].scheduleOverride = {
      ...day.scheduleOverride,
      isSkipped: isSkipped,
      rescueNote: isSkipped ? rescueNote : undefined
    };

    setDisplayedPlan(newPlan);
  };

  const planToShow = displayedPlan || currentPlan;

  const handleGenerateClick = () => {
      const cleanIngredients = sanitizeText(ingredients);
      if (ValidationRules.ingredients.isValid(cleanIngredients)) {
          onGeneratePlan(days, cleanIngredients);
      }
  };

  // -- Empty State --
  if (!planToShow && !isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto animate-fade-in">
        <div className="bg-[#fdfaf7] rounded-[2rem] p-8 shadow-xl border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="text-center mb-10 relative z-10">
            <div className="w-24 h-24 bg-white text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-orange-50">
               <i className="fas fa-utensils"></i>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">Meal Planner</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Create a personalized {preferences?.diet?.toLowerCase()} menu using ingredients you already have.
            </p>
          </div>
          <div className="space-y-8 max-w-xl mx-auto relative z-10">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 group focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex justify-between items-center">
                   <span><i className="fas fa-carrot text-orange-400 mr-2"></i> Your Ingredients</span>
                   <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wider">Required</span>
                </label>
                <textarea 
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., 2 Potatoes, Onion, Tomato, Rice, Dal, Spinach..."
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg text-gray-900 placeholder-gray-400 font-medium min-h-[80px] resize-none leading-relaxed"
                />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Duration</label>
                  <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100">
                     {[1, 2, 3].map(d => (
                        <button 
                          key={d}
                          onClick={() => setDays(d)}
                          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all
                             ${days === d ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}
                          `}
                        >
                          {d} Day{d > 1 ? 's' : ''}
                        </button>
                     ))}
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-3">Goal</label>
                   <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 text-gray-500 text-sm font-medium flex items-center justify-between">
                      <span>Balanced Diet</span>
                      <i className="fas fa-check-circle text-green-500"></i>
                   </div>
                </div>
             </div>
             <button 
                onClick={handleGenerateClick}
                disabled={!ValidationRules.ingredients.isValid(ingredients)}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95
                  ${ValidationRules.ingredients.isValid(ingredients) 
                     ? 'bg-gray-900 text-white shadow-xl hover:shadow-2xl' 
                     : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
             >
                <i className="fas fa-wand-magic-sparkles"></i> Generate Plan
             </button>
          </div>
        </div>
      </div>
    );
  }

  // -- Loading State --
  if (isLoading && !planToShow) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#fdfaf7]">
         <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-orange-100 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <i className="fas fa-utensils absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-xl"></i>
         </div>
         <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Chef is thinking...</h2>
         <p className="text-gray-500 max-w-xs mx-auto">Creating a budget-friendly plan for {preferences?.cityType} using your ingredients.</p>
      </div>
    );
  }

  // -- Active Plan View --
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-[#faf9f6]">
       {/* Header */}
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                   {planToShow?.days.length}-Day Plan
                </span>
                {planToShow?.isFallback && (
                   <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                      <i className="fas fa-exclamation-triangle mr-1"></i> Budget Adjusted
                   </span>
                )}
             </div>
             <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{planToShow?.title}</h1>
             <p className="text-gray-500 italic flex items-center gap-2 text-sm">
                <i className="fas fa-quote-left text-gray-300"></i> {planToShow?.personalisationProof}
             </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
             <button onClick={handleOpenCalendar} className="px-4 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                <i className="far fa-calendar-plus"></i> Sync Calendar
             </button>
             <button onClick={onSavePlan} className="flex-1 lg:flex-none px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-shopping-basket"></i> Grocery List
             </button>
             <button onClick={() => window.print()} className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
                <i className="fas fa-print"></i>
             </button>
          </div>
       </div>

       {/* Tabs */}
       <div className="mb-8 overflow-x-auto pb-2">
         <div className="flex gap-2 min-w-max">
            {['Standard', 'Taste', 'Protein', 'Cheapest', 'Fastest'].map(goal => (
               <button 
                 key={goal}
                 onClick={() => handleOptimize(goal)}
                 className={`
                   px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2
                   ${activeOptimization === goal ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-200'}
                 `}
               >
                 {goal}
                 {cachedPlans[goal] && activeOptimization !== goal && <span className="w-2 h-2 rounded-full bg-blue-500" title="Cached"></span>}
               </button>
            ))}
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
             {planToShow?.days?.map((day, dIdx) => (
                <div 
                    key={day.day} 
                    className={`
                        rounded-[2rem] border overflow-hidden shadow-sm transition-all
                        ${day.scheduleOverride?.isSkipped 
                            ? 'bg-gray-50 border-gray-200 opacity-80' 
                            : 'bg-white border-gray-100 hover:shadow-md'
                        }
                    `}
                >
                   {/* Adaptive Day Header */}
                   <div className="bg-[#fcf8f3] p-5 border-b border-[#f3e9dc] flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex items-center gap-3">
                         <h3 className={`font-serif font-bold text-xl ${day.scheduleOverride?.isSkipped ? 'text-gray-400 line-through' : 'text-gray-800'}`}>Day {day.day}</h3>
                         {day.scheduleOverride?.isSkipped && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">SKIPPED</span>}
                      </div>
                      
                      {/* Adaptive Scheduling Controls */}
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200" title="Change cooking time for this day">
                            <i className="far fa-clock text-gray-400 text-xs"></i>
                            <input 
                                type="time" 
                                value={day.scheduleOverride?.customTime || preferences?.cookingSlot || "19:00"}
                                onChange={(e) => handleDayTimeChange(dIdx, e.target.value)}
                                disabled={!!day.scheduleOverride?.isSkipped}
                                className="text-sm font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0 w-16 cursor-pointer"
                            />
                         </div>
                         <button 
                            onClick={() => handleDaySkip(dIdx)}
                            className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                ${day.scheduleOverride?.isSkipped 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                                }
                            `}
                            title={day.scheduleOverride?.isSkipped ? "Restore Day" : "Skip/Eat Out"}
                         >
                            <i className={`fas ${day.scheduleOverride?.isSkipped ? 'fa-undo' : 'fa-ban'}`}></i>
                         </button>
                      </div>
                   </div>

                   {/* Ingredient Rescue Alert */}
                   {day.scheduleOverride?.isSkipped && (
                       <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-start gap-3">
                           <i className="fas fa-recycle text-orange-500 mt-1"></i>
                           <div>
                               <p className="text-sm font-bold text-orange-800">Ingredient Rescue Plan</p>
                               <p className="text-xs text-orange-700">{day.scheduleOverride.rescueNote}</p>
                           </div>
                       </div>
                   )}
                   
                   {/* Slots */}
                   {!day.scheduleOverride?.isSkipped && (
                    <div className="divide-y divide-gray-50">
                        {day.slots?.map((slot, idx) => (
                            <div key={idx} className="flex gap-5 items-center p-5 hover:bg-[#fafaf9] transition-colors group relative">
                                <div className="flex-1 flex gap-5 items-center cursor-pointer" onClick={() => onViewRecipe(slot.recipe)}>
                                    <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform z-10 relative">
                                        {slot.recipe.emoji}
                                    </div>
                                    <div className="absolute inset-0 bg-orange-100 rounded-2xl rotate-6 -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{slot.meal}</p>
                                    <h4 className="font-bold text-gray-900 text-lg truncate">{slot.recipe.title}</h4>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500 mt-2">
                                        <span className="flex items-center gap-1"><i className="far fa-clock"></i> {slot.recipe.time}</span>
                                        <span className="flex items-center gap-1"><i className="fas fa-fire-alt text-orange-400"></i> {slot.recipe.calories || '400 kcal'}</span>
                                    </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleSwapRequest(dIdx, slot.meal); }}
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-colors"
                                    title="Swap this meal"
                                >
                                    <i className="fas fa-exchange-alt"></i>
                                </button>
                                <div onClick={() => onViewRecipe(slot.recipe)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-orange-500 group-hover:text-white transition-all cursor-pointer">
                                <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                   )}
                </div>
             ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-[#fffbf0] rounded-3xl p-6 border border-[#fcefd0] shadow-sm">
                <h3 className="font-bold text-[#855f2d] mb-4 flex items-center gap-2 text-lg">
                   <i className="fas fa-clipboard-list"></i> Prep Flow
                </h3>
                <ul className="space-y-4 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#fcefd0]">
                   {planToShow?.cookingSequence?.map((seq, i) => (
                      <li key={i} className="flex gap-4 relative">
                         <div className="w-8 h-8 rounded-full bg-white border-2 border-[#fcefd0] flex items-center justify-center text-[#855f2d] font-bold text-xs shrink-0 z-10">
                            {i+1}
                         </div>
                         <p className="text-sm text-[#8a7049] leading-relaxed pt-1">{seq}</p>
                      </li>
                   )) || <p className="text-sm opacity-50 pl-10">No sequence generated.</p>}
                </ul>
             </div>
             <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full"></div>
                <h3 className="font-bold text-gray-800 mb-1 relative z-10">Estimated Cost</h3>
                <p className="text-sm text-gray-400 mb-4 relative z-10">Market rates in {preferences?.cityType}</p>
                <div className="flex items-end gap-2 relative z-10">
                   <span className="text-3xl font-bold text-gray-900">{planToShow?.totalBudgetEstimate}</span>
                </div>
             </div>
          </div>
       </div>

       {/* Modal */}
       {showCalendarModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
               <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900">Sync to Calendar</h3>
                  <p className="text-sm text-gray-500">Includes your day-specific adjustments.</p>
               </div>
               <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar">
                  {calendarEvents.map((evt, idx) => (
                     <div key={idx} className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-white">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${evt.type === 'shopping' ? 'bg-green-100 text-green-600' : evt.type === 'reminder' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                           <i className={`fas ${evt.type === 'shopping' ? 'fa-shopping-cart' : evt.type === 'reminder' ? 'fa-exclamation' : 'fa-utensils'}`}></i>
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-800 text-sm">{evt.title}</h4>
                           <p className="text-xs text-gray-500">
                              {new Date(evt.startTime).toLocaleDateString()} • {new Date(evt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
                  <button 
                     onClick={handleDownloadICS}
                     className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                     <i className="fas fa-download"></i> Download Schedule (.ics)
                  </button>
                  <button onClick={() => setShowCalendarModal(false)} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">
                     Cancel
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default MealPlanner;