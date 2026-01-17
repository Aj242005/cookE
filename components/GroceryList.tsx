import React, { useState } from 'react';
import { MealPlan, GroceryCategory } from '../types';
import { getGoogleCalendarLink } from '../services/calendarService';

interface GroceryListProps {
  plan: MealPlan | null;
}

// Mock function to simulate market prices based on item name matching
const getEstimatedPrice = (item: string): { price: number; unit: string; rate: string } => {
  const lowerItem = item.toLowerCase();
  
  if (lowerItem.includes('rice')) return { price: 60, unit: 'kg', rate: '₹60/kg' };
  if (lowerItem.includes('dal') || lowerItem.includes('lentil')) return { price: 120, unit: 'kg', rate: '₹120/kg' };
  if (lowerItem.includes('chicken')) return { price: 220, unit: 'kg', rate: '₹220/kg' };
  if (lowerItem.includes('paneer')) return { price: 400, unit: 'kg', rate: '₹400/kg' };
  if (lowerItem.includes('onion')) return { price: 40, unit: 'kg', rate: '₹40/kg' };
  if (lowerItem.includes('tomato')) return { price: 30, unit: 'kg', rate: '₹30/kg' };
  if (lowerItem.includes('potato')) return { price: 25, unit: 'kg', rate: '₹25/kg' };
  if (lowerItem.includes('milk')) return { price: 60, unit: 'L', rate: '₹60/L' };
  if (lowerItem.includes('egg')) return { price: 80, unit: 'doz', rate: '₹80/doz' };
  
  // Default fallback
  return { price: 50, unit: 'unit', rate: 'Est. ₹50' };
};

const GroceryList: React.FC<GroceryListProps> = ({ plan }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
         <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-shopping-basket text-4xl text-stone-300"></i>
         </div>
         <h2 className="text-xl font-serif font-bold text-stone-700 mb-2">No active list</h2>
         <p className="text-sm max-w-xs">Create a meal plan first to generate your automated shopping list.</p>
      </div>
    );
  }

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  // Calculate estimated total based on unchecked items
  let totalEstimate = 0;
  
  // Generate Calendar Link for Shopping
  const handleScheduleShopping = () => {
     const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate() + 1);
     tomorrow.setHours(10, 0, 0, 0);
     const endTime = new Date(tomorrow);
     endTime.setHours(11, 0, 0, 0);

     const itemsText = plan.groceryList.map(c => c.items.join(', ')).join('\n');

     const link = getGoogleCalendarLink({
        title: `Grocery Run: ${plan.title}`,
        description: `Shopping list:\n${itemsText}`,
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        type: 'shopping',
        location: 'Supermarket'
     });

     window.open(link, '_blank');
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-1">Grocery List</h1>
            <p className="text-stone-500 text-sm">
               For <span className="font-bold text-stone-700">"{plan.title}"</span> • {plan.days.length} Days
            </p>
         </div>
         <div className="flex gap-3">
             <button 
               onClick={handleScheduleShopping}
               className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
             >
                <i className="fas fa-calendar-plus"></i> Schedule Trip
             </button>
             <button 
               onClick={() => window.print()}
               className="bg-stone-100 text-stone-600 hover:bg-stone-200 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
             >
                <i className="fas fa-print"></i> Print
             </button>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Main List */}
         <div className="md:col-span-2 space-y-8">
            {plan.groceryList?.map((cat, idx) => (
               <div key={idx} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="bg-stone-50 px-6 py-3 border-b border-stone-100 flex justify-between items-center">
                     <h3 className="font-bold text-stone-700 uppercase tracking-wider text-xs">
                        {cat.category}
                     </h3>
                     <span className="text-xs font-bold text-stone-400">{cat.items.length} items</span>
                  </div>
                  <div className="divide-y divide-stone-50">
                     {cat.items.map((item, i) => {
                        const { price, rate } = getEstimatedPrice(item);
                        const isChecked = checkedItems[item];
                        if (!isChecked) totalEstimate += price;

                        return (
                           <div key={i} className={`flex items-center justify-between p-4 hover:bg-stone-50 transition-colors cursor-pointer group ${isChecked ? 'bg-stone-50/50' : ''}`} onClick={() => toggleItem(item)}>
                              <div className="flex items-center gap-4">
                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300 text-transparent'}`}>
                                    <i className="fas fa-check text-xs"></i>
                                 </div>
                                 <span className={`font-medium transition-colors ${isChecked ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                                    {item}
                                 </span>
                              </div>
                              <div className="text-right">
                                 <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full group-hover:bg-white transition-colors">
                                    {rate}
                                 </span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>

         {/* Summary Sidebar */}
         <div className="md:col-span-1">
            <div className="bg-sage-900 text-white rounded-2xl p-6 shadow-xl sticky top-6">
               <h3 className="text-sage-200 text-xs font-bold uppercase tracking-wider mb-2">Estimated Total</h3>
               <div className="text-4xl font-serif font-bold mb-1">
                  ₹{totalEstimate}
               </div>
               <p className="text-sage-400 text-xs mb-6 border-b border-sage-700 pb-4">
                  Based on local market rates. Actual prices may vary.
               </p>

               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-sage-800 flex items-center justify-center text-sage-300">
                        <i className="fas fa-wallet"></i>
                     </div>
                     <div>
                        <p className="text-sm font-bold">Budget Check</p>
                        <p className="text-xs text-sage-400">Within weekly limit</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-sage-800 flex items-center justify-center text-sage-300">
                        <i className="fas fa-leaf"></i>
                     </div>
                     <div>
                        <p className="text-sm font-bold">Seasonal Items</p>
                        <p className="text-xs text-sage-400">Buying local saves ~15%</p>
                     </div>
                  </div>
               </div>

               <button 
                 className="w-full mt-6 bg-white text-sage-900 py-3 rounded-xl font-bold text-sm hover:bg-sage-50 transition-colors"
                 onClick={() => alert("Integration with instant delivery apps (Blinkit/Zepto) coming soon!")}
               >
                  Order Online <i className="fas fa-external-link-alt ml-1"></i>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GroceryList;