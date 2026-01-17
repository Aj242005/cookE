import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-sage-200">
              <i className="fas fa-leaf"></i>
            </div>
            <span className="text-xl font-serif font-bold text-sage-900 tracking-tight">Cooking<span className="text-sage-600">Pro</span></span>
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={onGetStarted}
               className="hidden md:block text-stone-500 hover:text-sage-600 font-medium transition-colors"
             >
               Log In
             </button>
             <button 
               onClick={onGetStarted}
               className="px-6 py-2.5 bg-sage-800 text-white rounded-full font-bold shadow-lg shadow-sage-200 hover:bg-sage-900 hover:scale-105 transition-all"
             >
               Get Started
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-200 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/3 z-0"></div>
        <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-orange-100 rounded-full blur-[100px] opacity-40 -translate-x-1/2 z-0"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sage-100 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-sage-600 uppercase tracking-wider">AI-Powered Kitchen Assistant</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-sage-900 leading-[1.1]">
              Plan Meals. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-600 to-sage-400">Waste Less.</span> <br/>
              Live Better.
            </h1>
            
            <p className="text-xl text-stone-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Your intelligent sous-chef that creates personalized meal plans from ingredients you already have, tailored to your budget and taste.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-sage-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-sage-200 hover:bg-sage-900 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
              >
                Start Cooking Free <i className="fas fa-arrow-right"></i>
              </button>
              <button className="px-8 py-4 bg-white text-sage-800 border border-sage-200 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-all flex items-center justify-center gap-3">
                <i className="fas fa-play-circle text-sage-500"></i> Watch Demo
              </button>
            </div>

            <div className="pt-6 flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-stone-500">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-xs overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=User+${i}`} alt="User" />
                     </div>
                  ))}
               </div>
               <p>Loved by 10,000+ home chefs</p>
            </div>
          </div>

          {/* Floating UI Hero Image */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
             <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-2xl animate-float">
                {/* Mock UI Header */}
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h3 className="font-serif font-bold text-lg text-sage-900">Good Evening</h3>
                      <p className="text-xs text-stone-500">Suggested Dinner • 45 mins</p>
                   </div>
                   <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600">
                      <i className="fas fa-user"></i>
                   </div>
                </div>
                
                {/* Mock Recipe Card */}
                <div className="bg-white rounded-3xl p-4 shadow-lg mb-4">
                   <div className="h-40 bg-stone-200 rounded-2xl mb-4 relative overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Food" />
                      <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                         🔥 450 kcal
                      </div>
                   </div>
                   <div className="flex justify-between items-start">
                      <div>
                         <h4 className="font-bold text-lg text-stone-800">Roasted Buddha Bowl</h4>
                         <p className="text-xs text-stone-500 mt-1">Quinoa • Chickpeas • Avocado</p>
                      </div>
                      <div className="bg-sage-50 p-2 rounded-full text-sage-600">
                         <i className="fas fa-bookmark"></i>
                      </div>
                   </div>
                </div>

                {/* Mock Chat */}
                <div className="space-y-3">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">
                         <i className="fas fa-leaf"></i>
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-stone-600 border border-stone-100">
                         I found chickpeas and spinach in your pantry. Want a curry recipe?
                      </div>
                   </div>
                   <div className="flex gap-3 flex-row-reverse">
                      <div className="bg-sage-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md text-xs">
                         Yes! Make it spicy. 🌶️
                      </div>
                   </div>
                </div>
             </div>

             {/* Decorative Elements */}
             <div className="absolute -bottom-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-stone-50 animate-bounce-slight delay-700">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                      <i className="fas fa-carrot"></i>
                   </div>
                   <div>
                      <p className="font-bold text-stone-800 text-sm">Zero Waste</p>
                      <p className="text-xs text-stone-500">Ingredients saved</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-sage-900 mb-4">Everything you need to master your kitchen</h2>
               <p className="text-stone-500 text-lg">We combine advanced AI with culinary expertise to help you save time, money, and the planet.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { icon: 'fa-wand-magic-sparkles', title: 'AI Meal Planning', desc: 'Generate weekly plans instantly based on your diet, budget, and local ingredients.' },
                  { icon: 'fa-leaf', title: 'Zero Waste Engine', desc: 'Input what you have, and we’ll create recipes to use it up before it spoils.' },
                  { icon: 'fa-hand-holding-dollar', title: 'Smart Budgeting', desc: 'Real-time cost estimation for every meal. Save up to 30% on groceries.' }
               ].map((feature, i) => (
                  <div key={i} className="group p-8 rounded-3xl bg-stone-50 hover:bg-sage-50 border border-stone-100 hover:border-sage-200 transition-all duration-300">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl text-sage-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                        <i className={`fas ${feature.icon}`}></i>
                     </div>
                     <h3 className="text-xl font-bold text-stone-800 mb-3">{feature.title}</h3>
                     <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-20 bg-sage-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-sage-800">
               {[
                  { val: '50k+', label: 'Recipes Generated' },
                  { val: '₹10L+', label: 'Food Value Saved' },
                  { val: '120+', label: 'Dietary Types' },
                  { val: '4.9/5', label: 'User Rating' },
               ].map((stat, i) => (
                  <div key={i} className="p-4">
                     <div className="text-4xl md:text-5xl font-serif font-bold text-sage-300 mb-2">{stat.val}</div>
                     <div className="text-sage-400 font-medium text-sm uppercase tracking-widest">{stat.label}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 px-6 text-center relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-orange-50 rounded-full blur-[100px] -z-10 opacity-60"></div>
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-sage-900 mb-6">Ready to cook smarter?</h2>
            <p className="text-xl text-stone-600 mb-10">Join thousands of food lovers using AI to simplify their daily cooking routine.</p>
            <button 
               onClick={onGetStarted}
               className="px-10 py-5 bg-sage-900 text-white rounded-full font-bold text-xl shadow-2xl hover:bg-sage-800 hover:scale-105 transition-all"
            >
               Get Started for Free
            </button>
         </div>
         <div className="mt-20 border-t border-stone-200 pt-8 text-stone-400 text-sm flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
            <p>&copy; 2024 CookingPro AI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-sage-600">Privacy</a>
               <a href="#" className="hover:text-sage-600">Terms</a>
               <a href="#" className="hover:text-sage-600">Twitter</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;