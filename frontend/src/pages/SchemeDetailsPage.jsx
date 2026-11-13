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
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function SchemeDetailsPage() {
  const { selectedSchemeId, schemes, setCurrentPage, detailsReferrer, t, language } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'eligibility' | 'documents' | 'howto'

  const scheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const getBackLabel = () => {
    if (language === 'kn') return 'ಹಿಂದಕ್ಕೆ';
    if (detailsReferrer === 'results') return 'Back to Results';
    if (detailsReferrer === 'reminders') return 'Back to Reminders';
    return 'Back to Schemes';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* Back Link matching 06_Scheme_Details.png */}
        <button
          onClick={() => setCurrentPage(detailsReferrer || 'explore')}
          className="inline-flex items-center gap-2 text-stone-800 hover:text-maroon-700 font-bold text-xs sm:text-sm transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{getBackLabel()}</span>
        </button>

        {/* Top Scheme Header Card matching 06_Scheme_Details.png */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <Sprout className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-700" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-heading text-stone-900 leading-snug">
                {scheme.title}
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                {scheme.fullDesc}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 self-start sm:self-auto">
            {scheme.status === 'eligible' && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                {language === 'kn' ? 'ಅರ್ಹರು' : 'Eligible'}
              </span>
            )}
            {scheme.status === 'upcoming' && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                {scheme.badge || 'Opens Soon'}
              </span>
            )}
            {scheme.status === 'not_eligible' && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                {language === 'kn' ? 'ಅರ್ಹರಲ್ಲ' : 'Not Eligible'}
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation matching 06_Scheme_Details.png */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'overview'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {t.overview}
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'eligibility'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {language === 'kn' ? 'ಅರ್ಹತಾ ಷರತ್ತುಗಳು' : 'Eligibility'}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'documents'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {t.documents}
          </button>

          <button
            onClick={() => setActiveTab('howto')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'howto'
                ? 'bg-maroon-700 text-white shadow-md'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {t.howToApply}
          </button>
        </div>

        {/* Tab Body Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 md:p-8">
          
          {/* TAB 1: OVERVIEW matching 06_Scheme_Details.png */}
          {activeTab === 'overview' && (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Details */}
              <div className="w-full lg:w-3/5 space-y-6">
                
                {/* Benefit */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {t.benefit}
                    </h4>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {scheme.benefit}
                    </p>
                  </div>
                </div>

                {/* Target Group */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {t.targetGroup}
                    </h4>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {scheme.targetGroup}
                    </p>
                  </div>
                </div>

                {/* Application Mode */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {t.applicationMode}
                    </h4>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {scheme.applicationMode}
                    </p>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4">
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-maroon-700 hover:bg-maroon-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <span>{t.applyOnPortal}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>

              {/* Right Farmer Photograph Card */}
              <div className="w-full lg:w-2/5 flex justify-center">
                <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-amber-200/80 shadow-2xl">
                  <img 
                    src="/farmer-sunset-cropped.jpg" 
                    alt="Karnataka Farmer" 
                    className="w-full h-full object-cover object-center scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent flex items-end justify-center pb-4">
                    <span className="text-[11px] font-bold text-amber-200 bg-forest-900/90 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs">
                      Official Gazette Verified
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ELIGIBILITY CONDITIONS */}
          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-900">
                {language === 'kn' ? 'ಅರ್ಹತಾ ಷರತ್ತುಗಳು ಮತ್ತು ಮೌಲ್ಯಮಾಪನ' : 'Eligibility Evaluation & Criteria'}
              </h3>
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
                {(scheme.matchedConditions || [
                  'Must hold active agricultural land',
                  'Registered in State Bhoomi portal',
                  'Aadhaar seeded bank account'
                ]).map((condition, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-stone-800">{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-900">
                {language === 'kn' ? 'ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳ ಪಟ್ಟಿ' : 'Required Document Checklist'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(scheme.documents || [
                  { name: 'Aadhaar Card', status: 'Ready' },
                  { name: 'Pahani / RTC', status: 'Ready' },
                  { name: 'Bank Passbook', status: 'Ready' },
                  { name: 'Passport Photo', status: 'Ready' }
                ]).map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-maroon-700" />
                      <span className="text-sm font-bold text-stone-800">{doc.name}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO APPLY */}
          {activeTab === 'howto' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-900">
                {language === 'kn' ? 'ಹಂತ ಹಂತವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ' : 'Step-by-step Application Process'}
              </h3>
              <ol className="space-y-3">
                {(scheme.howToApply || [
                  'Open the official portal.',
                  'Register using your mobile number and Aadhaar OTP.',
                  'Fill in your Karnataka Bhoomi RTC details.',
                  'Submit the form and note down your reference application number.'
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="w-6 h-6 rounded-full bg-forest-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-stone-800 font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
