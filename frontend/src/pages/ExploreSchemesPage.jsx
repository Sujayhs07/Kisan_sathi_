import React, { useState } from 'react';
import { 
  Search, 
  Sprout, 
  CreditCard, 
  ShieldCheck, 
  Droplet, 
  Tractor, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function ExploreSchemesPage() {
  const { schemes, openSchemeDetails, t, language } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Schemes');

  const categories = [
    { id: 'All Schemes', label: t.allSchemes },
    { id: 'Income Support', label: t.incomeSupport },
    { id: 'Crop Insurance', label: t.cropInsurance },
    { id: 'Credit & Loan', label: t.creditLoan },
    { id: 'Irrigation', label: t.irrigation },
    { id: 'Infrastructure', label: t.infrastructure },
  ];

  // Helper icon by scheme/category
  const getSchemeIcon = (scheme) => {
    if (scheme.category === 'Credit & Loan') return <CreditCard className="w-6 h-6 text-forest-700" />;
    if (scheme.category === 'Crop Insurance') return <ShieldCheck className="w-6 h-6 text-forest-700" />;
    if (scheme.category === 'Irrigation') return <Droplet className="w-6 h-6 text-forest-700" />;
    if (scheme.category === 'Infrastructure') return <Tractor className="w-6 h-6 text-forest-700" />;
    return <Sprout className="w-6 h-6 text-forest-700" />;
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = selectedCategory === 'All Schemes' || scheme.category === selectedCategory;
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-6xl w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
            {language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' : 'Explore Government Schemes'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            {language === 'kn' ? 'ರೈತರಿಗಾಗಿ ಇರುವ ವಿವಿಧ ಯೋಜನೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಮತ್ತು ತಿಳಿಯಿರಿ.' : 'Browse and learn about various schemes for farmers.'}
          </p>
        </div>

        {/* Search Input Bar matching 08_Explore_Schemes.png */}
        <div className="relative max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-stone-400">
            <Search className="w-5 h-5 text-stone-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white border border-stone-300 rounded-2xl text-stone-900 text-xs sm:text-sm font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-maroon-700 focus:border-transparent shadow-xs"
          />
        </div>

        {/* Category Filter Pills matching 08_Explore_Schemes.png */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 sm:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-maroon-700 text-white shadow-md'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Scheme Cards (3-col) matching 08_Explore_Schemes.png */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-1 sm:pt-2">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Icon in rounded green/amber square */}
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                  {getSchemeIcon(scheme)}
                </div>

                <h3 className="text-xl font-bold text-stone-900 mb-2">
                  {scheme.name}
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {scheme.shortDesc}
                </p>
              </div>

              {/* Action Button: Know More -> matching design */}
              <button
                onClick={() => openSchemeDetails(scheme.id)}
                className="w-full py-2.5 px-4 rounded-xl border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span>{t.knowMore}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p className="text-base font-semibold">No schemes found matching "{searchTerm}".</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All Schemes'); }}
              className="mt-3 text-maroon-700 font-bold underline"
            >
              Reset filters
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
