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
  const { schemes, openSchemeDetails, t, language } = useApp();
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

      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto space-y-8">
        
        {/* Page Heading */}
        <div>
          <h1 className="text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
            {language === 'kn' ? 'ನಿಮ್ಮ ಯೋಜನೆಯ ಅರ್ಹತೆ ಫಲಿತಾಂಶಗಳು' : 'Your Scheme Eligibility Results'}
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            {language === 'kn' ? 'ನಿಮ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ, ಯೋಜನೆಗಳು ಮತ್ತು ಅವುಗಳ ಸ್ಥಿತಿ ಇಲ್ಲಿದೆ.' : 'Based on your details, here are the schemes and their status.'}
          </p>
        </div>

        {/* 3 Summary Badges matching 05_Eligibility_Results.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Badge 1: Eligible Schemes (Green) */}
          <div 
            onClick={() => setActiveTab('eligible')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-5 ${
              activeTab === 'eligible' 
                ? 'bg-emerald-100/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40' 
                : 'bg-emerald-50/70 border-emerald-200/90 hover:bg-emerald-100/50'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-950 font-serif-heading">
                {eligibleSchemes.length}
              </span>
              <p className="text-sm font-bold text-emerald-900 mt-0.5">
                {language === 'kn' ? 'ಅರ್ಹ ಯೋಜನೆಗಳು' : 'Eligible Schemes'}
              </p>
            </div>
          </div>

          {/* Badge 2: Upcoming Schemes (Yellow/Amber) */}
          <div 
            onClick={() => setActiveTab('upcoming')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-5 ${
              activeTab === 'upcoming' 
                ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400/40' 
                : 'bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/50'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-3xl font-black text-amber-950 font-serif-heading">
                {upcomingSchemes.length}
              </span>
              <p className="text-sm font-bold text-amber-900 mt-0.5">
                {language === 'kn' ? 'ಮುಂಬರುವ ಯೋಜನೆಗಳು (ಅರ್ಹರು)' : 'Upcoming Schemes (You qualify)'}
              </p>
            </div>
          </div>

          {/* Badge 3: Not Eligible (Red/Pink) */}
          <div 
            onClick={() => setActiveTab('not_eligible')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-5 ${
              activeTab === 'not_eligible' 
                ? 'bg-rose-100 border-rose-500 shadow-md ring-2 ring-rose-400/40' 
                : 'bg-rose-50/80 border-rose-200/90 hover:bg-rose-100/50'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
              <XCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-3xl font-black text-rose-950 font-serif-heading">
                {notEligibleSchemes.length}
              </span>
              <p className="text-sm font-bold text-rose-900 mt-0.5">
                {language === 'kn' ? 'ಅರ್ಹರಲ್ಲದ ಯೋಜನೆಗಳು' : 'Not Eligible'}
              </p>
            </div>
          </div>

        </div>

        {/* Filter Pills matching 05_Eligibility_Results.png */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'eligible'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಅರ್ಹ ಯೋಜನೆಗಳು (${eligibleSchemes.length})` : `Eligible Schemes (${eligibleSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಮುಂಬರುವ (${upcomingSchemes.length})` : `Upcoming (${upcomingSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('not_eligible')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'not_eligible'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? `ಅರ್ಹರಲ್ಲ (${notEligibleSchemes.length})` : `Not Eligible (${notEligibleSchemes.length})`}
          </button>
        </div>

        {/* Scheme List Cards matching 05_Eligibility_Results.png */}
        <div className="space-y-4">
          {displayedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl p-5 md:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                {/* Seedling Icon in amber/cream box */}
                <div className="w-12 h-12 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
                  <Sprout className="w-6 h-6 text-emerald-700" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h3 className="text-lg md:text-xl font-bold text-stone-900">
                      {scheme.title}
                    </h3>

                    {/* Status Pill Badge */}
                    {scheme.status === 'eligible' && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {language === 'kn' ? 'ಅರ್ಹರು' : 'Eligible'}
                      </span>
                    )}

                    {scheme.status === 'upcoming' && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {scheme.badge || 'Opens Soon'}
                      </span>
                    )}

                    {scheme.status === 'not_eligible' && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {language === 'kn' ? 'ಅರ್ಹರಲ್ಲ' : 'Not Eligible'}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-600 text-sm">
                    {scheme.shortDesc}
                  </p>

                  {/* If not eligible, show reason + alternative */}
                  {scheme.status === 'not_eligible' && scheme.reason && (
                    <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1">
                      <p><strong className="text-rose-700">Reason:</strong> {scheme.reason}</p>
                      {scheme.alternativeScheme && (
                        <p className="text-emerald-800 font-semibold flex items-center gap-1.5 pt-1">
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
                onClick={() => openSchemeDetails(scheme.id)}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-bold text-sm flex items-center justify-center gap-2 transition-all flex-shrink-0 active:scale-95 shadow-sm"
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
