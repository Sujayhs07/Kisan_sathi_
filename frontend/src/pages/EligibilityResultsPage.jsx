import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sprout, 
  ArrowRight, 
  Filter, 
  Check, 
  Sparkles,
  AlertTriangle,
  FileText,
  IndianRupee,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function EligibilityResultsPage() {
  const { schemes, openSchemeDetails, wizardData, setCurrentPage, t, language } = useApp();
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' (Potential match) | 'upcoming' (More info needed) | 'not_eligible' (Does not match)

  const potentialMatchSchemes = schemes.filter(s => s.status === 'eligible');
  const moreInfoNeededSchemes = schemes.filter(s => s.status === 'upcoming');
  const doesNotMatchSchemes = schemes.filter(s => s.status === 'not_eligible');

  const displayedSchemes = 
    activeTab === 'eligible' ? potentialMatchSchemes :
    activeTab === 'upcoming' ? moreInfoNeededSchemes :
    doesNotMatchSchemes;

  const formatSupportNeeded = (supportList) => {
    if (!supportList || supportList.length === 0) return language === 'kn' ? 'ಆದಾಯ ನೆರವು' : 'Income Support';
    const map = {
      income_support: language === 'kn' ? 'ಆದಾಯ ನೆರವು' : 'Income Support',
      crop_loan: language === 'kn' ? 'ಬೆಳೆ ಸಾಲ' : 'Crop Loan',
      crop_insurance: language === 'kn' ? 'ಬೆಳೆ ವಿಮೆ' : 'Crop Insurance',
      drip_sprinkler: language === 'kn' ? 'ಹನಿ ನೀರಾವರಿ' : 'Drip / Sprinkler',
      borewell: language === 'kn' ? 'ಬೋರ್‌ವೆಲ್' : 'Borewell',
      machinery_purchase: language === 'kn' ? 'ಯಂತ್ರ ಖರೀದಿ' : 'Machinery Purchase',
      machinery_rental: language === 'kn' ? 'ಬಾಡಿಗೆ ಯಂತ್ರ' : 'Machinery Rental',
      millet_cultivation: language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ' : 'Millet Cultivation',
      horticulture: language === 'kn' ? 'ತೋಟಗಾರಿಕೆ' : 'Horticulture',
      farm_infra: language === 'kn' ? 'ಮೂಲಸೌಕರ್ಯ' : 'Farm Infrastructure'
    };
    return supportList.map(k => map[k] || k).slice(0, 3).join(', ') + (supportList.length > 3 ? '...' : '');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-6xl w-full mx-auto space-y-5 sm:space-y-8">
        
        {/* Page Heading & Evaluated Profile Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-1 sm:pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ಯೋಜನೆಯ ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ ಫಲಿತಾಂಶಗಳು' : 'Scheme Potential Matches & Results'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'kn' 
                ? 'ಒಂದೇ ರೈತ ಪ್ರೊಫೈಲ್ ಆಧರಿಸಿ ಯೋಜನೆಗಳನ್ನು ವರ್ಗೀಕರಿಸಲಾಗಿದೆ. ಅಂತಿಮ ಅರ್ಹತೆಯನ್ನು ಇಲಾಖೆ ಪರಿಶೀಲಿಸುತ್ತದೆ.' 
                : 'Schemes matched using your single farmer profile. Formal eligibility is confirmed during official department application.'}
            </p>
          </div>

          {/* Quick Re-evaluate Button */}
          <button
            type="button"
            onClick={() => setCurrentPage('eligibility')}
            className="px-3.5 sm:px-4 py-2 bg-white border border-stone-300 hover:border-forest-700 rounded-2xl text-xs font-semibold text-stone-700 hover:text-forest-900 shadow-xs transition-all flex items-center gap-2 self-start md:self-auto active:scale-95"
          >
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            <span>{language === 'kn' ? 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ / ಮರು-ಪರಿಶೀಲಿಸಿ' : 'Edit Profile / Re-evaluate'}</span>
          </button>
        </div>

        {/* Dynamic Profile Evaluation Bar */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl px-4 sm:px-5 py-3 text-xs text-stone-700 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 shadow-xs">
          <span className="font-bold text-stone-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200" />
            {wizardData.fullName || (language === 'kn' ? 'ರೈತ ಮಿತ್ರ' : 'Farmer')}
          </span>
          <span><strong>{language === 'kn' ? 'ಸ್ಥಳ:' : 'Location:'}</strong> {wizardData.village ? `${wizardData.village}, ` : ''}{wizardData.taluk ? `${wizardData.taluk}, ` : ''}{wizardData.district || 'Dharwad'}</span>
          <span><strong>{language === 'kn' ? 'ಭೂಮಿ:' : 'Land:'}</strong> {wizardData.cultivatedAcres || wizardData.landHolding || '2.0'} {wizardData.landUnit || 'Acres'}</span>
          <span><strong>{language === 'kn' ? 'ಬೆಳೆ:' : 'Crops:'}</strong> {Array.isArray(wizardData.cropsGrown) ? wizardData.cropsGrown.join(', ') : (wizardData.cropType || 'Ragi')}</span>
          <span><strong>{language === 'kn' ? 'ನೀರಾವರಿ:' : 'Irrigation:'}</strong> {wizardData.irrigationSource || wizardData.irrigationType || 'Borewell'}</span>
          <span><strong>{language === 'kn' ? 'ನೆರವು:' : 'Support:'}</strong> {formatSupportNeeded(wizardData.supportNeeded)}</span>
        </div>

        {/* 3 Status Summary Badges: Potential match | More info needed | Does not match */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          
          {/* Badge 1: Potential match (Green) */}
          <div 
            onClick={() => setActiveTab('eligible')}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'eligible' 
                ? 'bg-emerald-100/90 border-emerald-500 shadow-md ring-2 ring-emerald-400/30' 
                : 'bg-emerald-50/70 border-emerald-200/90 hover:bg-emerald-100/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-serif-heading">
                {potentialMatchSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-900 mt-0.5">
                {language === 'kn' ? 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ' : 'Potential match'}
              </p>
              <p className="text-[11px] text-emerald-700/80 hidden sm:block">
                {language === 'kn' ? 'ಪ್ರಮುಖ ಷರತ್ತುಗಳಿಗೆ ಸರಿಹೊಂದುತ್ತದೆ' : 'Meets core published criteria'}
              </p>
            </div>
          </div>

          {/* Badge 2: More information needed (Yellow/Amber) */}
          <div 
            onClick={() => setActiveTab('upcoming')}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'upcoming' 
                ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400/30' 
                : 'bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-serif-heading">
                {moreInfoNeededSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5">
                {language === 'kn' ? 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ' : 'More information needed'}
              </p>
              <p className="text-[11px] text-amber-700/80 hidden sm:block">
                {language === 'kn' ? 'ಪರಿಶೀಲನೆ / ಮುಂಬರುವ ದಾಖಲಾತಿ' : 'Verification or upcoming window'}
              </p>
            </div>
          </div>

          {/* Badge 3: Does not match published conditions (Slate/Rose) */}
          <div 
            onClick={() => setActiveTab('not_eligible')}
            className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'not_eligible' 
                ? 'bg-stone-200/90 border-stone-500 shadow-md ring-2 ring-stone-400/30' 
                : 'bg-stone-100/80 border-stone-200/90 hover:bg-stone-200/50'
            }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <XCircle className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-serif-heading">
                {doesNotMatchSchemes.length}
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5">
                {language === 'kn' ? 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ' : 'Does not match published conditions'}
              </p>
              <p className="text-[11px] text-stone-600 hidden sm:block">
                {language === 'kn' ? 'ಪರ್ಯಾಯ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Alternative schemes suggested'}
              </p>
            </div>
          </div>

        </div>

        {/* Filter Pills with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'eligible'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' 
              ? `ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ (${potentialMatchSchemes.length})` 
              : `Potential match (${potentialMatchSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' 
              ? `ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ (${moreInfoNeededSchemes.length})` 
              : `More information needed (${moreInfoNeededSchemes.length})`}
          </button>

          <button
            onClick={() => setActiveTab('not_eligible')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'not_eligible'
                ? 'bg-stone-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' 
              ? `ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ (${doesNotMatchSchemes.length})` 
              : `Does not match published conditions (${doesNotMatchSchemes.length})`}
          </button>
        </div>

        {/* Scheme List Cards */}
        <div className="space-y-4">
          {displayedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                {/* Seedling Icon */}
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0 mt-0.5">
                  <Sprout className="w-6 h-6 text-emerald-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 leading-snug">
                      {scheme.title}
                    </h3>

                    {/* Official Match Classification Badge */}
                    {scheme.status === 'eligible' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {language === 'kn' ? 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ' : 'Potential match'}
                      </span>
                    )}

                    {scheme.status === 'upcoming' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {language === 'kn' ? 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ' : 'More information needed'}
                      </span>
                    )}

                    {scheme.status === 'not_eligible' && (
                      <span className="px-2.5 sm:px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-stone-200 text-stone-700 border border-stone-300">
                        {language === 'kn' ? 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ' : 'Does not match published conditions'}
                      </span>
                    )}
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {scheme.shortDesc}
                  </p>

                  {/* Benefit Callout */}
                  {scheme.benefit && (
                    <div className="mt-2 text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span>{language === 'kn' ? 'ಪ್ರಯೋಜನ:' : 'Benefit:'} {scheme.benefit}</span>
                    </div>
                  )}

                  {/* Why Suggested to Farmer */}
                  {scheme.whySuggested && (
                    <div className="mt-2.5 p-2.5 sm:p-3 bg-forest-50/70 border border-forest-200/80 rounded-xl text-xs text-forest-950 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-forest-900">{language === 'kn' ? 'ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ: ' : 'Why suggested: '}</strong>
                        <span>{scheme.whySuggested}</span>
                      </div>
                    </div>
                  )}

                  {/* Matched Criteria Chips for Potential Match */}
                  {scheme.status !== 'not_eligible' && scheme.matchedConditions && scheme.matchedConditions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {scheme.matchedConditions.map((cond, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 leading-tight"
                        >
                          <Check className="w-3 h-3 text-emerald-700 stroke-[3] flex-shrink-0" />
                          <span>{cond}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pending Documents or Checks Notice */}
                  {scheme.unverifiedDocuments && scheme.unverifiedDocuments.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                      <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        {language === 'kn' 
                          ? `ಪರಿಶೀಲಿಸಬೇಕಾದ ದಾಖಲೆಗಳು: ${scheme.unverifiedDocuments.map(d => d.name).join(', ')}` 
                          : `Documents to verify: ${scheme.unverifiedDocuments.map(d => d.name).join(', ')}`}
                      </span>
                    </div>
                  )}

                  {/* If not eligible, show reason + alternative */}
                  {scheme.status === 'not_eligible' && scheme.reason && (
                    <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1.5">
                      <p><strong className="text-stone-900">{language === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ ಟಿಪ್ಪಣಿ:' : 'Evaluation Note:'}</strong> {scheme.reason}</p>
                      {scheme.alternativeScheme && (
                        <p className="text-emerald-900 font-semibold flex items-center gap-1.5 pt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span>{language === 'kn' ? 'ಪರ್ಯಾಯ ಶಿಫಾರಸು:' : 'Recommended Alternative:'} {scheme.alternativeScheme}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Know More */}
              <button
                type="button"
                onClick={() => openSchemeDetails(scheme.id)}
                className="w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-forest-800 text-forest-900 hover:bg-forest-900 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all flex-shrink-0 active:scale-95 shadow-xs"
              >
                <span>{language === 'kn' ? 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ' : 'Know More'}</span>
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
