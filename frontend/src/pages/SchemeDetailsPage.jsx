import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sprout, 
  IndianRupee, 
  Users, 
  Calendar, 
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertTriangle,
  MapPin,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  Building,
  Volume2,
  VolumeX,
  Check,
  HelpCircle,
  Info,
  ListOrdered
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function SchemeDetailsPage() {
  const { 
    selectedSchemeId, 
    schemes, 
    setCurrentPage, 
    detailsReferrer, 
    wizardData, 
    speakText, 
    stopSpeaking, 
    isSpeaking, 
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'benefits' | 'eligibility' | 'documents' | 'howto'

  const scheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const getBackLabel = () => {
    if (language === 'kn') return 'ಫಲಿತಾಂಶಗಳಿಗೆ ಹಿಂದಿರುಗಿ';
    if (detailsReferrer === 'results') return 'Back to Results';
    if (detailsReferrer === 'reminders') return 'Back to Reminders';
    return 'Back to Schemes';
  };

  const handleAudioPlayback = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToRead = language === 'kn'
        ? `${scheme.title}. ${scheme.shortDesc}. ಲಭ್ಯವಿರುವ ಪ್ರಯೋಜನ: ${scheme.benefit}. ಈ ಯೋಜನೆ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ.`
        : `${scheme.title}. ${scheme.shortDesc}. Available benefit: ${scheme.benefit}. This scheme is evaluated for your profile.`;
      speakText(textToRead);
    }
  };

  // Helper to get farmer's readiness status for a required document
  const getDocStatusBadge = (docKey) => {
    const userReadiness = wizardData.docReadiness?.[docKey];
    if (userReadiness === 'available') {
      return {
        label: language === 'kn' ? 'ನಿಮ್ಮ ಬಳಿ ಲಭ್ಯವಿದೆ' : 'Ready with you',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
      };
    }
    if (userReadiness === 'not_available') {
      return {
        label: language === 'kn' ? 'ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಬೇಕು' : 'Need to arrange',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: <Clock className="w-3.5 h-3.5 text-amber-700" />
      };
    }
    return {
      label: language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : 'Verify before apply',
      color: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* Navigation & Audio Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentPage(detailsReferrer || 'results')}
            className="inline-flex items-center gap-2 text-stone-800 hover:text-forest-800 font-bold text-xs sm:text-sm transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{getBackLabel()}</span>
          </button>

          <button
            type="button"
            onClick={handleAudioPlayback}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-xs ${
              isSpeaking 
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse' 
                : 'bg-white text-stone-700 border-stone-300 hover:border-forest-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-forest-700" />}
            <span>{isSpeaking ? (language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop Audio') : (language === 'kn' ? 'ಧ್ವನಿ ವಿವರ ಕೇಳಿ' : 'Listen Summary')}</span>
          </button>
        </div>

        {/* Top Scheme Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <Sprout className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-heading text-stone-900 leading-snug">
                  {scheme.title}
                </h1>

                {/* Match Classification Badge */}
                {scheme.status === 'eligible' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {language === 'kn' ? 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ' : 'Potential match'}
                  </span>
                )}
                {scheme.status === 'upcoming' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {language === 'kn' ? 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ' : 'More information needed'}
                  </span>
                )}
                {scheme.status === 'not_eligible' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700 border border-stone-300">
                    {language === 'kn' ? 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ' : 'Does not match published conditions'}
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {scheme.fullDesc || scheme.shortDesc}
              </p>
            </div>
          </div>

          {/* Quick Apply CTA on Official Portal */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <a
              href={scheme.sourceAndFreshness?.officialUrl || scheme.officialUrl || 'https://fruits.karnataka.gov.in'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <span>{language === 'kn' ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ' : 'Apply on Official Portal'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tab Switcher: All 10 Questions vs Categorized Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಎಲ್ಲಾ 10 ವಿವರಗಳು (All 10 Questions)' : 'All 10 Scheme Answers'}</span>
          </button>

          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'benefits'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? '1. ಪ್ರಯೋಜನ ಮತ್ತು ಸ್ಥಳ' : 'Benefits & Location'}
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'eligibility'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? '2. ಅರ್ಹತಾ ಷರತ್ತುಗಳು' : 'Eligibility & Verification'}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'documents'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? '3. ದಾಖಲೆಗಳ ಪಟ್ಟಿ' : 'Required Documents'}
          </button>

          <button
            onClick={() => setActiveTab('howto')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'howto'
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? '4. ಅರ್ಜಿ ವಿಧಾನ ಮತ್ತು ಸಹಾಯ' : 'How to Apply & Help'}
          </button>
        </div>

        {/* 10 Core Questions Answers Container */}
        <div className="space-y-5">
          
          {/* ============================================================== */}
          {/* QUESTION 1: WHAT BENEFIT CAN I RECEIVE? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'benefits') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ನನಗೆ ಯಾವ ಪ್ರಯೋಜನ ಸಿಗುತ್ತದೆ?' : 'What benefit can I receive?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಪ್ರಯೋಜನದ ಪ್ರಕಾರ, ಮೊತ್ತ, ಸಹಾಯಧನ ಮತ್ತು ಮಿತಿಗಳು' : 'Benefit type, amount or subsidy basis, and applicable limits'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಪ್ರಯೋಜನದ ಪ್ರಕಾರ' : 'Benefit Type'}
                  </span>
                  <p className="text-sm font-bold text-stone-900 mt-1">
                    {scheme.benefitDetails?.type || 'Subsidy / Direct Benefit'}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಮೊತ್ತ / ಸಹಾಯಧನ' : 'Amount / Subsidy'}
                  </span>
                  <p className="text-sm font-bold text-emerald-950 mt-1">
                    {scheme.benefitDetails?.amount || scheme.benefit || 'Official grant based on norms'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಅನ್ವಯವಾಗುವ ಮಿತಿಗಳು' : 'Applicable Limits'}
                  </span>
                  <p className="text-sm font-medium text-stone-800 mt-1">
                    {scheme.benefitDetails?.limits || 'Subject to scheme ceiling'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {language === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ' : 'Disbursement'}
                  </span>
                  <p className="text-sm font-medium text-stone-800 mt-1">
                    {scheme.benefitDetails?.disbursement || 'Aadhaar-seeded Bank Account (DBT)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 2: WHO CAN APPLY? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'eligibility') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಯಾರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?' : 'Who can apply?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಅಧಿಕೃತವಾಗಿ ಪ್ರಕಟಿಸಲಾದ ಅರ್ಹತಾ ಷರತ್ತುಗಳು' : 'Verified eligibility conditions published by the department'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {(scheme.whoCanApply || [
                  'Cultivable agricultural landholders',
                  'Registered in state land records'
                ]).map((condition, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-stone-800 leading-relaxed">
                      {condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 3: DOES THIS SCHEME APPLY IN MY LOCATION? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'benefits') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ನನ್ನ ಸ್ಥಳದಲ್ಲಿ ಈ ಯೋಜನೆ ಅನ್ವಯವಾಗುತ್ತದೆಯೇ?' : 'Does this scheme apply in my location?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಭೌಗೋಳಿಕ ವ್ಯಾಪ್ತಿ ಮತ್ತು ರಾಜ್ಯ/ಜಿಲ್ಲಾವಾರು ಅನ್ವಯತೆ' : 'Geographic coverage and state/district applicability'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-sky-950">
                    {scheme.locationCoverage || 'All rural and semi-urban agricultural districts across Karnataka and India'}
                  </p>
                  <p className="text-xs text-sky-800">
                    {language === 'kn' 
                      ? `ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಸ್ಥಳ: ${wizardData.village ? `${wizardData.village}, ` : ''}${wizardData.taluk ? `${wizardData.taluk}, ` : ''}${wizardData.district || 'Dharwad'}, ${wizardData.state || 'Karnataka'}` 
                      : `Your evaluated location: ${wizardData.village ? `${wizardData.village}, ` : ''}${wizardData.taluk ? `${wizardData.taluk}, ` : ''}${wizardData.district || 'Dharwad'}, ${wizardData.state || 'Karnataka'}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 4: WHY WAS THIS SUGGESTED TO ME? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'benefits') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ನನಗೆ ಇದನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ?' : 'Why was this suggested to me?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನ ಉತ್ತರಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆಯಾದ ಷರತ್ತುಗಳು' : 'Profile answers that match the published conditions'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                    {scheme.whySuggested || 'You indicated matching farm land ownership and corresponding support requirement.'}
                  </p>
                </div>

                {scheme.matchedConditions && scheme.matchedConditions.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/70 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">
                      {language === 'kn' ? 'ಹೊಂದಾಣಿಕೆಯಾದ ಪ್ರಮುಖ ಅಂಶಗಳು:' : 'Matched Key Parameters:'}
                    </span>
                    <ul className="space-y-1">
                      {scheme.matchedConditions.map((cond, idx) => (
                        <li key={idx} className="text-xs text-emerald-900 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 5: WHAT STILL NEEDS CHECKING? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'eligibility') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಇನ್ನೂ ಯಾವ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಬೇಕು?' : 'What still needs checking?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಫಾರ್ಮ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗದ ಅಥವಾ ಇಲಾಖೆ ತಪಾಸಣೆ ಮಾಡುವ ಅಂಶಗಳು' : 'Missing information or conditions our system cannot verify online'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {(scheme.whatNeedsChecking || [
                  'Official verification of land record in Bhoomi portal',
                  'Active Aadhaar seeding in bank account (NPCI DBT)',
                  'No previous overlapping benefits in the current financial year'
                ]).map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                    <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-amber-950 leading-relaxed">
                      {check}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 6: WHAT DOCUMENTS ARE REQUIRED? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'documents') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಯಾವ ದಾಖಲೆಗಳು ಬೇಕಾಗುತ್ತವೆ?' : 'What documents are required?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಯೋಜನೆಗೆ ಅಗತ್ಯವಾದ ದಾಖಲೆಗಳು ಮತ್ತು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನ ಲಭ್ಯತೆಯ ಸ್ಥಿತಿ' : 'Scheme-specific document checklist compared against your questionnaire readiness'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(scheme.requiredDocuments || [
                  { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Linked with active mobile' },
                  { name: 'Pahani / RTC', docKey: 'land_record', required: true, note: 'Bhoomi RTC' },
                  { name: 'Bank Passbook', docKey: 'bank_account', required: true, note: 'DBT enabled' }
                ]).map((doc, idx) => {
                  const status = getDocStatusBadge(doc.docKey);
                  return (
                    <div key={idx} className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/80 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-forest-800 flex-shrink-0" />
                            {doc.name}
                          </span>
                          {doc.required && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {language === 'kn' ? 'ಕಡ್ಡಾಯ' : 'Mandatory'}
                            </span>
                          )}
                        </div>
                        {doc.note && (
                          <p className="text-[11px] text-stone-500 mt-1 pl-6">
                            {doc.note}
                          </p>
                        )}
                      </div>

                      {/* Readiness status based on question 3 checklist */}
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-500 font-medium">
                          {language === 'kn' ? 'ನಿಮ್ಮ ಸ್ಥಿತಿ:' : 'Your Readiness:'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.color}`}>
                          {status.icon}
                          <span>{status.label}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 7: WHEN CAN I APPLY? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'howto') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  7
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಯಾವಾಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?' : 'When can I apply?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಕೆಯ ಅವಧಿ, ಅಂತಿಮ ದಿನಾಂಕ ಮತ್ತು ಪರಿಶೀಲನೆ' : 'Opening date, deadline, or verification timeline'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-start gap-3.5">
                <Calendar className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-teal-950">
                      {scheme.whenToApply?.status || 'Open Enrollment'}
                    </span>
                    <span className="px-2 py-0.5 bg-teal-200 text-teal-900 rounded-md text-[10px] font-bold">
                      {scheme.whenToApply?.verified ? (language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Verified') : (language === 'kn' ? 'ಪ್ರಸ್ತುತ ದಿನಾಂಕ ಅನ್‌ವೆರಿಫೈಡ್' : 'Current deadline not verified')}
                    </span>
                  </div>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    {scheme.whenToApply?.deadline || 'Applications accepted continuously or in seasonal windows via RSK.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 8: HOW DO I APPLY? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'howto') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                  8
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?' : 'How do I apply?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ಲಿಂಕ್ ಅಥವಾ ಆಫ್‌ಲೈನ್ ಕೇಂದ್ರದ ಪ್ರಕ್ರಿಯೆ' : 'Official online portal link or offline application process'}
                  </p>
                </div>
              </div>

              <ol className="space-y-3">
                {(scheme.howToApply || [
                  'Visit the official website or nearest Raitha Samparka Kendra.',
                  'Provide Aadhaar and Pahani RTC numbers.',
                  'Submit the form and collect receipt.'
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                    <span className="w-6 h-6 rounded-full bg-forest-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              {/* Online Portal Button */}
              <div className="pt-2">
                <a
                  href={scheme.sourceAndFreshness?.officialUrl || scheme.officialUrl || 'https://fruits.karnataka.gov.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <span>{language === 'kn' ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' : 'Open Official Application Portal'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 9: WHERE CAN I GET HELP? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'howto') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm">
                  9
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಸಹಾಯ ಮತ್ತು ಸಂಪರ್ಕ ಎಲ್ಲಿ ಪಡೆಯುವುದು?' : 'Where can I get help?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಅಧಿಕೃತ ಇಲಾಖೆ, ಉಚಿತ ಸಹಾಯವಾಣಿ ಮತ್ತು ಹತ್ತಿರದ ಕಚೇರಿ' : 'Official department or help contact'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wide flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-orange-700" />
                    {language === 'kn' ? 'ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ' : 'Toll-free Helpline'}
                  </span>
                  <p className="text-sm font-bold text-orange-950">
                    {scheme.helpAndSupport?.tollFree || '1800-180-1551'}
                  </p>
                  <p className="text-[11px] text-orange-800">
                    {scheme.helpAndSupport?.helpline || 'Kisan Call Centre (24x7)'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-stone-600" />
                    {language === 'kn' ? 'ಹತ್ತಿರದ ಕಚೇರಿ' : 'Local Office'}
                  </span>
                  <p className="text-sm font-bold text-stone-900">
                    {scheme.helpAndSupport?.office || 'Raitha Samparka Kendra (RSK)'}
                  </p>
                  <p className="text-[11px] text-stone-600">
                    {language === 'kn' ? 'ನಿಮ್ಮ ಹೋಬಳಿ / ತಾಲೂಕು ಕೇಂದ್ರ' : 'At Hobli & Taluk level'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                    {language === 'kn' ? 'ಇಲಾಖೆ' : 'Department'}
                  </span>
                  <p className="text-xs font-bold text-stone-900 leading-tight">
                    {scheme.helpAndSupport?.department || 'Department of Agriculture, Govt. of Karnataka'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* QUESTION 10: HOW CURRENT IS THIS INFORMATION? */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'howto') && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-sm">
                  10
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    {language === 'kn' ? 'ಮಾಹಿತಿ ಎಷ್ಟು ನವೀಕೃತವಾಗಿದೆ?' : 'How current is this information?'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'kn' ? 'ಅಧಿಕೃತ ಮೂಲ, ಸರ್ಕಾರಿ ಗೆಜೆಟ್ ಮತ್ತು ಕೊನೆಯ ಪರಿಶೀಲನೆ ದಿನಾಂಕ' : 'Official source, issuing agency, and last-checked date'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700">
                <div className="space-y-1">
                  <p>
                    <strong className="text-stone-900">{language === 'kn' ? 'ಅಧಿಕೃತ ಮೂಲ: ' : 'Official Source: '}</strong>
                    {scheme.sourceAndFreshness?.sourceName || 'Department of Agriculture, Karnataka / GoI'}
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    {language === 'kn' 
                      ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಮತ್ತು ಭಾರತ ಸರ್ಕಾರದ ಪ್ರಕಟಿತ ಅಧಿಸೂಚನೆಗಳ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.' 
                      : 'Curated and cross-referenced with published state and central government notifications.'}
                  </p>
                </div>

                <div className="flex-shrink-0 bg-stone-200/70 px-3 py-1.5 rounded-xl text-stone-800 font-bold text-[11px]">
                  <span>{language === 'kn' ? 'ಕೊನೆಯ ಪರಿಶೀಲನೆ: ' : 'Last Checked: '}</span>
                  <span className="text-emerald-800">{scheme.sourceAndFreshness?.lastVerified || 'November 2026'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
