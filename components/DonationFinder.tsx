import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Button } from './ui/Button';
import { ValidationRules } from '../utils/validation';

interface DonationFinderProps {
  preferences: UserPreferences | null;
}

const DonationFinder: React.FC<DonationFinderProps> = ({ preferences }) => {
  const [activeTab, setActiveTab] = useState<'locate' | 'schedule' | 'history'>('locate');

  // Form State
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('Morning (9AM - 12PM)');
  const [errors, setErrors] = useState<{desc?: string; date?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for demo purposes
  const donationSpots = [
    { name: "Community Food Bank", dist: "1.2 km", type: "Shelter", opens: "9:00 AM" },
    { name: "Hope Kitchen", dist: "2.5 km", type: "Kitchen", opens: "11:00 AM" },
    { name: "City Mission", dist: "3.8 km", type: "NGO", opens: "24/7" },
  ];

  const handleScheduleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!ValidationRules.text.isValid(desc)) newErrors.desc = ValidationRules.text.errorMsg;
    if (!ValidationRules.futureDate.isValid(date)) newErrors.date = ValidationRules.futureDate.errorMsg;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        alert("Pickup Scheduled Successfully!");
        setDesc('');
        setDate('');
        setActiveTab('history');
      }, 1500);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in h-full overflow-y-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
           <i className="fas fa-hand-holding-heart"></i>
        </div>
        <h1 className="text-3xl font-serif font-bold text-sage-900 mb-2">Share the Love</h1>
        <p className="text-sage-600 max-w-md mx-auto">
          Have leftovers or extra groceries? Donate them to a nearby shelter in <strong>{preferences?.cityType || 'your area'}</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm inline-flex">
            {[
                { id: 'locate', label: 'Find Centers', icon: 'fa-map-marked-alt' },
                { id: 'schedule', label: 'Schedule Pickup', icon: 'fa-truck' },
                { id: 'history', label: 'My Impact', icon: 'fa-history' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-sage-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                    <i className={`fas ${tab.icon}`}></i> {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'locate' && (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
                {/* Map Placeholder */}
                <div className="bg-sage-50 rounded-3xl overflow-hidden border border-sage-200 relative min-h-[300px] flex items-center justify-center group cursor-pointer shadow-inner">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4241,37.78,14.25,0,0/600x600?access_token=pk.123')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all"></div>
                <div className="relative z-10 bg-white px-6 py-3 rounded-full shadow-lg font-bold text-sage-800 flex items-center gap-2 hover:scale-105 transition-transform">
                    <i className="fas fa-map-marker-alt text-red-500"></i> Open Live Map
                </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                <h3 className="font-bold text-sage-800 uppercase tracking-wider text-sm flex justify-between items-center">
                    Nearby Locations
                    <span className="text-xs bg-sage-100 text-sage-600 px-2 py-1 rounded-full">3 Found</span>
                </h3>
                {donationSpots.map((spot, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:border-sage-300 transition-colors flex justify-between items-center group">
                        <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-sage-700 transition-colors">{spot.name}</h4>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span className="bg-sage-50 px-2 py-0.5 rounded text-sage-600 font-bold">{spot.type}</span>
                            <span><i className="fas fa-clock text-stone-300"></i> {spot.opens}</span>
                        </div>
                        </div>
                        <div className="text-right">
                        <p className="font-bold text-sage-600">{spot.dist}</p>
                        <button className="text-xs font-bold text-stone-400 hover:text-sage-600 mt-1 transition-colors">
                            Directions <i className="fas fa-chevron-right ml-1"></i>
                        </button>
                        </div>
                    </div>
                ))}
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mt-6">
                    <p className="text-xs text-yellow-800 italic">
                        <i className="fas fa-info-circle mr-1"></i> 
                        Tip: Pack food in clean, disposable containers and label with the date prepared.
                    </p>
                </div>
                </div>
            </div>
        )}

        {activeTab === 'schedule' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-stone-100 animate-fade-in-up">
                <h3 className="text-xl font-bold text-stone-800 mb-6">Request Home Pickup</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">What are you donating?</label>
                        <textarea 
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          className={`w-full bg-stone-50 border rounded-xl p-4 text-stone-800 focus:ring-2 focus:ring-sage-500 ${errors.desc ? 'border-red-300' : 'border-stone-100'}`}
                          rows={3} 
                          placeholder="e.g. 2kg Rice, 5 cans of soup (Min 10 chars)..."
                        />
                        {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Preferred Date</label>
                            <input 
                              type="date" 
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className={`w-full bg-stone-50 border rounded-xl p-3 text-stone-800 focus:ring-2 focus:ring-sage-500 ${errors.date ? 'border-red-300' : 'border-stone-100'}`}
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Time Slot</label>
                            <select 
                              value={slot}
                              onChange={(e) => setSlot(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-100 rounded-xl p-3 text-stone-800 focus:ring-2 focus:ring-sage-500"
                            >
                                <option>Morning (9AM - 12PM)</option>
                                <option>Afternoon (1PM - 5PM)</option>
                            </select>
                        </div>
                    </div>
                    <Button 
                      onClick={handleScheduleSubmit} 
                      isLoading={isSubmitting}
                      fullWidth
                    >
                        Confirm Pickup Request
                    </Button>
                    <p className="text-center text-xs text-stone-400">Partnered with local volunteers.</p>
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="max-w-3xl mx-auto animate-fade-in-up">
                 <div className="bg-gradient-to-r from-sage-600 to-green-600 rounded-3xl p-8 text-white mb-8 shadow-lg">
                    <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/20">
                        <div>
                            <div className="text-3xl font-serif font-bold">0kg</div>
                            <div className="text-xs opacity-80 uppercase tracking-wider mt-1">Food Donated</div>
                        </div>
                        <div>
                            <div className="text-3xl font-serif font-bold">0</div>
                            <div className="text-xs opacity-80 uppercase tracking-wider mt-1">People Fed</div>
                        </div>
                        <div>
                            <div className="text-3xl font-serif font-bold">0kg</div>
                            <div className="text-xs opacity-80 uppercase tracking-wider mt-1">CO2 Saved</div>
                        </div>
                    </div>
                 </div>

                 <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-3xl">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <i className="fas fa-box-open text-2xl"></i>
                    </div>
                    <p className="text-stone-500 font-medium">No donation history yet.</p>
                    <button onClick={() => setActiveTab('locate')} className="text-sage-600 font-bold text-sm mt-2 hover:underline">
                        Make your first donation
                    </button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DonationFinder;