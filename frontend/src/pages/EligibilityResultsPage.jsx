import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sprout, 
  ArrowRight, 
  ExternalLink,
  Filter,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function EligibilityResultsPage() {
  const { schemes, openSchemeDetails, wizardData, setCurrentPage, t, language } = useApp();
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'upcoming' | 'not_eligible'

  const eligibleSchemes = schemes.filter(s => s.status === 'eligible');
  const upcomingSchemes = schemes.filter(s => s.status === 'upcoming');
  const notEligibleSchemes = schemes.filter(s => s.status === 'not_eligible');

  const displayedSchemes = 
    activeTab === 'eligible' ? eligibleSchemes :
    activeTab === 'upcoming' ? upcomingSchemes :
    notEligibleSchemes;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-6xl w-full mx-auto space-y-5 sm:space-y-8">
        
        {/* Page Heading & Evaluated Profile Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-1 sm:pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ನಿಮ್ಮ ಯೋಜನೆಯ ಅರ್ಹತೆ ಫಲಿತಾಂಶಗಳು' : 'Your Scheme Eligibility Results'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              {language === 'kn' ? 'ನಿಮ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ, ಯೋಜನೆಗಳು ಮತ್ತು ಅವುಗಳ ಸ್ಥಿತಿ ಇಲ್ಲಿದೆ.' : 'Based on your farm profile and location, here are the dynamically evaluated schemes.'}
            </p>
          </div>

          {/* Evaluated Profile Badge & Quick Re-evaluate Button */}
          <button
            type="button"
            onClick={() => setCurrentPage('eligibility')}
            className="px-3.5 sm:px-4 py-2 bg-white border border-stone-300 hover:border-forest-700 rounded-2xl text-xs font-semibold text-stone-700 hover:text-forest-900 shadow-xs transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'kn' ? 'ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ / ಮರು-ಪರಿಶೀಲಿಸಿ' : 'Change Details / Re-evaluate'}</span>
          </button>
        </div>

        {/* Dynamic Profile Evaluation Bar */}
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3 text-[11px] sm:text-xs text-stone-700 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1.5 sm:gap-y-2 shadow-xs">
          <span className="font-bold text-stone-900 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {wizardData.fullName || 'Farmer'}
          </span>
          <span><strong>{language === 'kn' ? 'ವರ್ಗ:' : 'Category:'}</strong> {wizardData.category || 'General'}</span>
          <span><strong>{language === 'kn' ? 'ಭೂಮಿ:' : 'Land:'}</strong> {wizardData.landHolding || '2.0'} Acres</span>
          <span><strong>{language === 'kn' ? 'ಬೆಳೆ:' : 'Crop:'}</strong> {wizardData.cropType || 'Ragi & Cereals'}</span>
          <span><strong>{language === 'kn' ? 'ನೀರಾವರಿ:' : 'Irrigation:'}</strong> {wizardData.irrigationType || 'Borewell & Rainfed'}</span>
          <span><strong>{language === 'kn' ? 'ಸ್ಥಳ:' : 'Location:'}</strong> {wizardData.state || 'Karnataka'}, {wizardData.district || 'Bengaluru Rural'}</span>
        </div>

        {/* 3 Summary Badges matching 05_Eligibility_Results.png */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          
          {/* Badge 1: Eligible Schemes (Green) */}
          <div 
            onClick={() => setActiveTab('eligible')}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 sm:gap-5 ${
              activeTab === 'eligible' 
                ? 'bg-emerald-100/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40' 
                : 'bg-emerald-50/70 border-emerald-200/90 hover:bg-emerald-100/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif-heading">
                {eligibleSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-900 mt-0.5">
                {language === 'kn' ? 'ಅರ್ಹ ಯೋಜನೆಗಳು' : 'Eligible Schemes'}
              </p>
            </div>
          </div>

          {/* Badge 2: Upcoming Schemes (Yellow/Amber) */}
          <div 
            onClick={() => setActiveTab('upcoming')}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 sm:gap-5 ${
              activeTab === 'upcoming' 
                ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400/40' 
                : 'bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-serif-heading">
                {upcomingSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
                {language === 'kn' ? 'ಮುಂಬರುವ ಯೋಜನೆಗಳು (ಅರ್ಹರು)' : 'Upcoming Schemes (You qualify)'}
              </p>
            </div>
          </div>

          {/* Badge 3: Not Eligible (Red/Pink) */}
          <div 
            onClick={() => setActiveTab('not_eligible')}
            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 sm:gap-5 ${
              activeTab === 'not_eligible' 
                ? 'bg-rose-100 border-rose-500 shadow-md ring-2 ring-rose-400/40' 
                : 'bg-rose-50/80 border-rose-200/90 hover:bg-rose-100/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-rose-950 font-serif-heading">
                {notEligibleSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-rose-900 mt-0.5">
                {language === 'kn' ? 'ಅರ್ಹರಲ್ಲದ ಯೋಜನೆಗಳು' : 'Not Eligible'}
              </p>
            </div>
          </div>

        </div>

        {/* Filter Pills matching 05_Eligibility_Results.png */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'eligible'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಅರ್ಹ ಯೋಜನೆಗಳು (${eligibleSchemes.length})` : `Eligible Schemes (${eligibleSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಮುಂಬರುವ (${upcomingSchemes.length})` : `Upcoming (${upcomingSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('not_eligible')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'not_eligible'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಅರ್ಹರಲ್ಲ (${notEligibleSchemes.length})` : `Not Eligible (${notEligibleSchemes.length})`}
          </button>
        </div>

        {/* Scheme List Cards matching 05_Eligibility_Results.png */}
        <div className="space-y-3.5 sm:space-y-4">
          {displayedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                {/* Seedling Icon in amber/cream box */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
                  <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 leading-snug">
                      {scheme.title}
                    </h3>

                    {/* Status Pill Badge */}
                    {scheme.status === 'eligible' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {language === 'kn' ? 'ಅರ್ಹರು' : 'Eligible'}
                      </span>
                    )}

                    {scheme.status === 'upcoming' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {scheme.badge || 'Opens Soon'}
                      </span>
                    )}

                    {scheme.status === 'not_eligible' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {language === 'kn' ? 'ಅರ್ಹರಲ್ಲ' : 'Not Eligible'}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {scheme.shortDesc}
                  </p>

                  {/* Matched Conditions Tags for Eligible & Upcoming schemes */}
                  {scheme.status !== 'not_eligible' && scheme.matchedConditions && scheme.matchedConditions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {scheme.matchedConditions.map((cond, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/90 leading-tight"
                        >
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3] flex-shrink-0" />
                          <span>{cond}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* If not eligible, show reason + alternative */}
                  {scheme.status === 'not_eligible' && scheme.reason && (
                    <div className="mt-2.5 p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs text-stone-700 space-y-1">
                      <p><strong className="text-rose-800">{language === 'kn' ? 'ಕಾರಣ:' : 'Evaluation Note:'}</strong> {scheme.reason}</p>
                      {scheme.alternativeScheme && (
                        <p className="text-emerald-900 font-semibold flex items-center gap-1.5 pt-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>{language === 'kn' ? 'ಪರ್ಯಾಯ ಯೋಜನೆ:' : 'Recommended Alternative:'} {scheme.alternativeScheme}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: View Details -> */}
              <button
                type="button"
                onClick={() => openSchemeDetails(scheme.id)}
                className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all flex-shrink-0 active:scale-95 shadow-xs"
              >
                <span>{t.viewDetails}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}

          {displayedSchemes.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-500">
                <CheckCircle2 className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {language === 'kn' ? 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No schemes in this category'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'kn' ? 'ದಯವಿಟ್ಟು ಇತರ ವರ್ಗಗಳ ಟ್ಯಾಬ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಹೊಸ ಅರ್ಹತಾ ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ.' : 'Check other status tabs or modify your farm details in the questionnaire.'}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
