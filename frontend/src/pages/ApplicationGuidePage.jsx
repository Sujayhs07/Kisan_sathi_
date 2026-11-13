import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Globe, 
  HelpCircle, 
  AlertTriangle, 
  ExternalLink, 
  PhoneCall, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  Check,
  Download,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';
import { schemesData } from '../data/schemesData';

export default function ApplicationGuidePage() {
  const { language, t, speakText, stopSpeaking, isSpeaking, setCurrentPage, selectedSchemeId } = useApp();
  const [activeTab, setActiveTab] = useState('schemeGuide'); // 'schemeGuide', 'steps', 'offline', 'online', 'troubleshooting'
  const [activeSchemeId, setActiveSchemeId] = useState(selectedSchemeId || 'pm-kisan');

  // Silence speech synthesis immediately if guide page unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  useEffect(() => {
    if (selectedSchemeId) {
      setActiveSchemeId(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  const currentScheme = schemesData.find(s => s.id === activeSchemeId) || schemesData[0];

  const guideSummaryText = language === 'kn'
    ? 'ಕಿಸಾನ್ ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶಿ: ಹಂತ 1 ದಾಖಲೆ ಸಿದ್ಧತೆ, ಹಂತ 2 ಫ್ರೂಟ್ಸ್ ಮತ್ತು ಆಧಾರ್ ಸೀಡಿಂಗ್, ಹಂತ 3 ಅರ್ಜಿ ಸಲ್ಲಿಕೆ, ಹಂತ 4 ಪರಿಶೀಲನೆ, ಹಂತ 5 ನೇರ ನಗದು ವರ್ಗಾವಣೆ.'
    : 'Kisan Application Guide: Step 1 Document Prep, Step 2 FRUITS & Aadhaar Seeding, Step 3 Application Submission, Step 4 Field Verification, Step 5 Direct Benefit Transfer.';

  const handleToggleAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (activeTab === 'schemeGuide' && currentScheme) {
      const stepsText = (currentScheme.howToApply || []).map((step, idx) => `Step ${idx + 1}: ${step}`).join('. ');
      const schemeText = language === 'kn'
        ? `${currentScheme.name} ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ: ${stepsText}`
        : `How to apply for ${currentScheme.name}: ${stepsText}`;
      speakText(schemeText);
    } else {
      speakText(guideSummaryText);
    }
  };

  const handleTabChange = (newTab) => {
    stopSpeaking();
    setActiveTab(newTab);
  };

  const handleSchemeChange = (schemeId) => {
    stopSpeaking();
    setActiveSchemeId(schemeId);
  };

  const steps = [
    {
      num: 1,
      title: language === 'kn' ? 'ದಾಖಲೆಗಳ ಸಿದ್ಧತೆ' : 'Document Preparation',
      sub: language === 'kn' ? 'ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ಕೃಷಿ ಮತ್ತು ಗುರುತಿನ ದಾಖಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ' : 'Gather necessary land titles and identification proof',
      desc: language === 'kn' 
        ? 'ನಿಮ್ಮ ಜಮೀನಿನ ಇತ್ತೀಚಿನ ಭೂಮಿ RTC (ಪಹಣಿ), ಆಧಾರ್ ಕಾರ್ಡ್, ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ (IFSC ಕೋಡ್ ಸಹಿತ) ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.'
        : 'Obtain current Bhoomi RTC/Pahani copy, Aadhaar card, bank passbook showing active IFSC, and your Aadhaar-linked mobile phone.',
      tips: [
        language === 'kn' ? 'ಪಹಣಿ ಇತ್ತೀಚಿನ 3 ತಿಂಗಳದ್ದಾಗಿರಬೇಕು' : 'Bhoomi RTC should be recently generated (within 3 months)',
        language === 'kn' ? 'ಜಂಟಿ ಮಾಲೀಕತ್ವವಿದ್ದರೆ ಎಲ್ಲಾ ಮಾಲೀಕರ ಒಪ್ಪಿಗೆ ಪತ್ರ ಅಗತ್ಯ' : 'Joint patta requires consent/affidavit from co-owners'
      ]
    },
    {
      num: 2,
      title: language === 'kn' ? 'FRUITS & ಬ್ಯಾಂಕ್ DBT ಸೀಡಿಂಗ್' : 'FRUITS FID & Aadhaar DBT Seeding',
      sub: language === 'kn' ? 'ಕರ್ನಾಟಕ ಫ್ರೂಟ್ಸ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಣಿ ಮತ್ತು ಬ್ಯಾಂಕ್ ಜೋಡಣೆ' : 'Register on Karnataka FRUITS & seed bank account with NPCI',
      desc: language === 'kn'
        ? 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ ಸಬ್ಸಿಡಿಗಳಿಗೆ FRUITS FID (ರೈತರ ಗುರುತಿನ ಸಂಖ್ಯೆ) ಕಡ್ಡಾಯವಾಗಿದೆ. ಜೊತೆಗೆ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ NPCI Aadhaar Seeding ಆಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.'
        : 'Karnataka delivers all farmer benefits via FRUITS Farmer ID (FID). Also ensure your bank account is seeded on NPCI Aadhaar mapper for DBT.',
      tips: [
        language === 'kn' ? 'ಗ್ರಾಮ ಒನ್ ಅಥವಾ RSK ನಲ್ಲಿ ಉಚಿತ FID ಪಡೆಯಬಹುದು' : 'Get free FRUITS FID at your local Grama One or RSK office',
        language === 'kn' ? 'ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ಭೇಟಿ ನೀಡಿ DBT ಸೀಡಿಂಗ್ ಫಾರ್ಮ್ ಸಲ್ಲಿಸಿ' : 'Submit Aadhaar NPCI DBT seeding mandate form at your bank'
      ]
    },
    {
      num: 3,
      title: language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಕೆ & ಸ್ವೀಕೃತಿ ರಶೀದಿ' : 'Submit Application & Get Acknowledgement',
      sub: language === 'kn' ? 'ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ ಅಥವಾ ಕೇಂದ್ರದ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply online or at Raitha Samparka Kendra / Grama One',
      desc: language === 'kn'
        ? 'ಸಂಬಂಧಪಟ್ಟ ಯೋಜನೆಗೆ (PM-KISAN, ಬೆಳೆ ವಿಮೆ, ಹನಿ ನೀರಾವರಿ) ಅರ್ಜಿ ಸಲ್ಲಿಸಿ. ಸಮೀಕ್ಷಾ ಸಂಖ್ಯೆ (Survey No) ಮತ್ತು ಬೆಳೆಯ ವಿವರ ನಮೂದಿಸಿ ಸ್ವೀಕೃತಿ ರಶೀದಿ (Ack Slip) ಪಡೆದುಕೊಳ್ಳಿ.'
        : 'Submit application on the official portal or center with land survey numbers, crop types, and bank info. Always collect your Acknowledgement Number.',
      tips: [
        language === 'kn' ? 'ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆಯನ್ನು SMS ಮೂಲಕವೂ ಪಡೆಯಬಹುದು' : 'Keep the SMS with your Acknowledgement Number safe',
        language === 'kn' ? 'ಅರ್ಜಿಯ ಪ್ರಿಂಟ್ ಪ್ರತಿಯನ್ನು ಕಡತದಲ್ಲಿಟ್ಟುಕೊಳ್ಳಿ' : 'Retain a printed copy of the submitted form for reference'
      ]
    },
    {
      num: 4,
      title: language === 'kn' ? 'ಸ್ಥಳ ಪರಿಶೀಲನೆ (Field Verification)' : 'Field Inspection & Verification',
      sub: language === 'kn' ? 'ಕೃಷಿ ಅಧಿಕಾರಿಗಳಿಂದ ಬೆಳೆ ಮತ್ತು ಭೂ ಪರಿಶೀಲನೆ' : 'Agricultural Officer / Village Accountant verification',
      desc: language === 'kn'
        ? 'ಬೆಳೆ ವಿಮೆ, ನೀರಾವರಿ ಅಥವಾ ಟ್ರ್ಯಾಕ್ಟರ್ ಸಬ್ಸಿಡಿಗಳಿಗೆ ಸ್ಥಳೀಯ ಸಹಾಯಕ ಕೃಷಿ ನಿರ್ದೇಶಕರ (ADA) ಕಚೇರಿ ಅಥವಾ RSK ಅಧಿಕಾರಿಗಳು ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಡೆಸುತ್ತಾರೆ.'
        : 'For crop insurance, borewell or equipment subsidies, the local Raitha Samparka Kendra (RSK) and Agriculture Officer will verify field data.',
      tips: [
        language === 'kn' ? 'ಬೆಳೆ ಸಮೀಕ್ಷೆ (Crop Survey App) ಯಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆ ನಮೂದಾಗಿರಬೇಕು' : 'Ensure crop is logged in Karnataka Farmer Crop Survey Mobile App',
        language === 'kn' ? 'ಪರಿಶೀಲನೆ ದಿನಾಂಕದಂದು ಜಮೀನಿನಲ್ಲಿ ಉಪಸ್ಥಿತರಿರಿ' : 'Be available on field during officer geo-tagging inspection'
      ]
    },
    {
      num: 5,
      title: language === 'kn' ? 'ನೇರ ನಗದು ಜಮಾ (DBT Credit)' : 'Direct Benefit Transfer (DBT Credit)',
      sub: language === 'kn' ? 'ಯಾವುದೇ ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರ ಹಣ ಜಮಾ' : 'Funds credited directly to your Aadhaar-linked bank account',
      desc: language === 'kn'
        ? 'ಅನುಮೋದನೆಯ ನಂತರ ಸಹಾಯಧನ ಮೊತ್ತವು ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ. PFMS / DBT ಪೋರ್ಟಲ್ ಮೂಲಕ ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.'
        : 'Once approved, the subsidy or insurance claim is credited straight to your verified bank account via PFMS with zero intermediary deduction.',
      tips: [
        language === 'kn' ? 'ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಮೊಬೈಲ್ SMS ಅಲರ್ಟ್ ಸಕ್ರಿಯವಾಗಿರಲಿ' : 'Keep SMS transaction alerts active on your bank account',
        language === 'kn' ? 'PFMS ಪೋರ್ಟಲ್‌ನಲ್ಲಿ DBT ಸ್ಟೇಟಸ್ ಪರಿಶೀಲಿಸಬಹುದು' : 'Track DBT payment status using your Aadhaar on pfms.nic.in'
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader pageTitle={t.applicationGuide} />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-5 sm:space-y-8">
        
        {/* Editorial Header Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-[#051C12] text-white p-5 sm:p-8 md:p-12 overflow-hidden shadow-xl border border-emerald-900/60">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-amber-300 text-xs font-semibold mb-3 sm:mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ಸಮಗ್ರ ಕೃಷಿ ಅರ್ಜಿ ಕೈಪಿಡಿ' : 'Comprehensive Application Blueprint'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-heading font-bold text-amber-50 tracking-tight leading-tight mb-2.5 sm:mb-3">
              {t.applicationGuide}
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 max-w-2xl">
              {language === 'kn'
                ? 'ಸರ್ಕಾರಿ ಕಚೇರಿಗಳಿಗೆ ಪದೇಪದೇ ಅಲೆಯುವುದನ್ನು ತಪ್ಪಿಸಿ. ಯೋಜನೆವಾರು ಹಂತಗಳು, ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು, ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಸಾಮಾನ್ಯ ದೋಷಗಳನ್ನು ತಪ್ಪಿಸುವ ವಿಧಾನವನ್ನು ಇಲ್ಲಿ ತಿಳಿದುಕೊಳ್ಳಿ.'
                : 'A clear, step-by-step master guide for Karnataka farmers to apply for central and state agricultural subsidies, crop insurance, and equipment grants without middlemen.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-amber-300 text-stone-950 ring-4 ring-amber-200'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                }`}
              >
                <Volume2 className={`w-4 h-4 text-stone-900 ${isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} />
                <span>
                  {isSpeaking 
                    ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop Audio') 
                    : (language === 'kn' ? 'ಮಾರ್ಗದರ್ಶಿ ಆಲಿಸಿ' : 'Listen to Audio Guide')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('explore')}
                className="px-4 sm:px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 border border-emerald-400/30 font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{t.exploreSchemes}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Decorative artwork */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden lg:flex items-center justify-center">
            <BookOpen className="w-64 h-64 text-emerald-400" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200/90 pb-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('schemeGuide')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schemeGuide' 
                ? 'bg-forest-900 text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಯೋಜನೆವಾರು ಅರ್ಜಿ ವಿಧಾನ' : 'Scheme Guides'}</span>
          </button>

          <button
            onClick={() => handleTabChange('steps')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'steps' 
                ? 'bg-forest-900 text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'kn' ? '5 ಹಂತಗಳ ಪ್ರಕ್ರಿಯೆ' : '5-Step Process'}</span>
          </button>

          <button
            onClick={() => handleTabChange('offline')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'offline' 
                ? 'bg-forest-900 text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಕೇಂದ್ರಗಳು (RSK & ಗ್ರಾಮ ಒನ್)' : 'Offline Centers (RSK & Grama One)'}</span>
          </button>

          <button
            onClick={() => handleTabChange('online')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'online' 
                ? 'bg-forest-900 text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್‌ಗಳು' : 'Official Online Portals'}</span>
          </button>

          <button
            onClick={() => handleTabChange('troubleshooting')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'troubleshooting' 
                ? 'bg-forest-900 text-white shadow-sm' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಅರ್ಜಿ ತಿರಸ್ಕರಿಸುವ ಕಾರಣಗಳು & ಪರಿಹಾರ' : 'Common Rejections & Fixes'}</span>
          </button>
        </div>

        {/* TAB 1: SCHEME-SPECIFIC APPLICATION GUIDES */}
        {activeTab === 'schemeGuide' && currentScheme && (
          <div className="space-y-6">
            {/* Horizontal Scheme Selector Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                {language === 'kn' ? 'ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : 'Select Scheme:'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {schemesData.map((sc) => {
                  const isSelected = sc.id === currentScheme.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSchemeChange(sc.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-maroon-700 text-white border-maroon-700 shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span>{sc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scheme Details Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {currentScheme.category || 'Agricultural Scheme'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      {currentScheme.applicationMode || 'Online / RSK'}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif-heading font-bold text-stone-900">
                    {currentScheme.name}
                  </h2>
                  <p className="text-stone-600 text-xs md:text-sm mt-1 max-w-2xl">
                    {currentScheme.fullDesc || currentScheme.shortDesc}
                  </p>
                  {currentScheme.benefit && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-xs font-bold">
                      <span>💰 {language === 'kn' ? 'ಸೌಲಭ್ಯ:' : 'Benefit:'}</span>
                      <span>{currentScheme.benefit}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {currentScheme.officialUrl && (
                    <a
                      href={currentScheme.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-full bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <span>{language === 'kn' ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply on Official Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={handleToggleAudio}
                    className={`px-4 py-2.5 rounded-full border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSpeaking
                        ? 'bg-amber-300 text-stone-900 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-stone-800" />
                    <span>{isSpeaking ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop') : (language === 'kn' ? 'ಹಂತಗಳನ್ನು ಆಲಿಸಿ' : 'Listen')}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif-heading text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'kn' ? 'ಹಂತ ಹಂತದ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ವಿಧಾನ' : 'Step-by-Step Application Steps'}</span>
                </h3>

                <div className="space-y-3">
                  {(currentScheme.howToApply && currentScheme.howToApply.length > 0
                    ? currentScheme.howToApply
                    : [
                        'Gather your recent Bhoomi RTC (Pahani), Aadhaar card, and bank passbook.',
                        'Visit the official portal or your local Raitha Samparka Kendra (RSK) / Grama One center.',
                        'Verify your FRUITS Farmer ID (FID) and ensure your bank account is Aadhaar seeded for DBT.',
                        'Submit your application with land survey numbers and obtain an official Acknowledgement Slip.'
                      ]
                  ).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-4 transition-all hover:bg-amber-50/40"
                    >
                      <div className="w-8 h-8 rounded-xl bg-forest-900 text-amber-300 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium text-stone-800 leading-relaxed pt-1">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              {currentScheme.documents && currentScheme.documents.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-lg font-bold font-serif-heading text-stone-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-maroon-700" />
                    <span>{language === 'kn' ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳು' : 'Required Documents'}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentScheme.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-stone-800 truncate">{doc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                          {doc.status || 'Required'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Check Eligibility Callout Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-emerald-500/10 rounded-3xl p-6 md:p-8 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಇನ್ನೂ ಪರೀಕ್ಷಿಸಿಲ್ಲವೇ?' : 'Have you verified which schemes you qualify for?'}
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  {language === 'kn' ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.' : 'Takes under 2 minutes. We auto-match your land size, taluk and crops.'}
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('eligibility')}
                className="px-6 py-3 rounded-full bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                {t.checkEligibility}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 5-STEP PROCESS ROADMAP */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {steps.map((st) => (
                <div 
                  key={st.num}
                  className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Step Number Circle */}
                  <div className="w-14 h-14 rounded-2xl bg-forest-900 text-amber-300 flex items-center justify-center font-serif-heading text-2xl font-bold flex-shrink-0 shadow-md">
                    0{st.num}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                        {st.title}
                      </h3>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                        Step {st.num} of 5
                      </span>
                    </div>

                    <p className="text-xs md:text-sm font-semibold text-stone-600">
                      {st.sub}
                    </p>

                    <p className="text-stone-600 text-sm leading-relaxed">
                      {st.desc}
                    </p>

                    {/* Pro-Tips Box */}
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-2 mt-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                        {language === 'kn' ? 'ಮುಖ್ಯ ಸಲಹೆಗಳು' : 'Key Guidelines'}
                      </span>
                      {st.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Check Eligibility Callout Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-emerald-500/10 rounded-3xl p-6 md:p-8 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ಇನ್ನೂ ಪರೀಕ್ಷಿಸಿಲ್ಲವೇ?' : 'Have you verified which schemes you qualify for?'}
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  {language === 'kn' ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.' : 'Takes under 2 minutes. We auto-match your land size, taluk and crops.'}
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('eligibility')}
                className="px-6 py-3 rounded-full bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                {t.checkEligibility}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE APPLICATION CENTERS */}
        {activeTab === 'offline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Center 1: Raitha Samparka Kendra (RSK) */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6 text-emerald-800" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK)' : 'Raitha Samparka Kendra (RSK)'}
              </h3>
              <p className="text-xs text-emerald-800 font-bold">
                {language === 'kn' ? 'ಹೋಬಳಿ ಮಟ್ಟದ ಕೃಷಿ ಇಲಾಖೆ ಕಚೇರಿ' : 'Hobli-level Agriculture Department Office'}
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                {language === 'kn'
                  ? 'ಪ್ರತಿಯೊಂದು ಹೋಬಳಿಯಲ್ಲಿರುವ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದಲ್ಲಿ ಕೃಷಿ ಅಧಿಕಾರಿಗಳು ಉಚಿತವಾಗಿ FRUITS ನೋಂದಣಿ, ರಿಯಾಯಿತಿ ದರದ ಬಿತ್ತನೆ ಬೀಜಗಳು, ಲಘು ಪೋಷಕಾಂಶಗಳು ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಅರ್ಜಿ ಸ್ವೀಕರಿಸುತ್ತಾರೆ.'
                  : 'Located in every hobli across Karnataka. Agricultural officers provide free FRUITS registration, subsidized certified seeds, micronutrient kits, and micro-irrigation sanctions.'}
              </p>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
                <div className="font-bold text-stone-900">{language === 'kn' ? 'ಯಾವಾಗ ಭೇಟಿ ನೀಡಬೇಕು?' : 'When to visit:'}</div>
                <div>Mon - Sat: 10:00 AM - 5:30 PM (Except Govt Holidays)</div>
                <div>{language === 'kn' ? 'ಶುಲ್ಕ: ಸಂಪೂರ್ಣ ಉಚಿತ' : 'Fee: 100% Free Public Service'}</div>
              </div>
            </div>

            {/* Center 2: Grama One & CSC Centers */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಗ್ರಾಮ ಒನ್ & ಬಾಪೂಜಿ ಸೇವಾ ಕೇಂದ್ರ' : 'Grama One & Citizen Service Centers (CSC)'}
              </h3>
              <p className="text-xs text-amber-900 font-bold">
                {language === 'kn' ? 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಮಟ್ಟದ ಸೇವಾ ಕೇಂದ್ರಗಳು' : 'Village Panchayat-Level One-Stop Centers'}
              </p>
              <p className="text-stone-600 text-sm leading-relaxed">
                {language === 'kn'
                  ? 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ವ್ಯಾಪ್ತಿಯಲ್ಲಿರುವ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರಗಳಲ್ಲಿ ಬೆಳೆ ವಿಮೆ ಪ್ರೀಮಿಯಂ ಪಾವತಿ, Seva Sindhu ಅರ್ಜಿಗಳು, ಪಹಣಿ/RTC ಪ್ರಿಂಟ್ ಮತ್ತು ಆಧಾರ್ ಇ-ಕೆವೈಸಿ ಮಾಡಿಸಿಕೊಳ್ಳಬಹುದು.'
                  : 'Grama One centers operate at the village level for paying seasonal crop insurance premiums (PMFBY), printing computerized RTCs, updating Aadhaar e-KYC, and Seva Sindhu submissions.'}
              </p>
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-1.5 text-stone-700">
                <div className="font-bold text-stone-900">{language === 'kn' ? 'ಅಗತ್ಯ ದಾಖಲೆಗಳು:' : 'Bring along:'}</div>
                <div>Original Aadhaar Card + Mobile with active SMS + Bhoomi RTC copy</div>
                <div>{language === 'kn' ? 'ಸರ್ಕಾರಿ ನಿಗದಿತ ಶುಲ್ಕ: ₹25 - ₹40' : 'Nominal Govt Portal Fee: ₹25 - ₹40'}</div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: OFFICIAL ONLINE PORTALS */}
        {activeTab === 'online' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Portal 1: FRUITS Karnataka */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Govt of Karnataka
                  </span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold font-serif-heading text-stone-900 mb-2">
                  FRUITS Portal Karnataka
                </h3>
                <p className="text-xs text-stone-500 mb-3">Farmer Registration and Unified Beneficiary Information System</p>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Unified repository of farmer land, crop and caste data. Generates the mandatory 10-digit FID required for all Karnataka state agricultural and horticulture subsidies.
                </p>
              </div>
              <a 
                href="https://fruits.karnataka.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Visit fruits.karnataka.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Portal 2: Bhoomi RTC Portal */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    Revenue Department
                  </span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold font-serif-heading text-stone-900 mb-2">
                  Bhoomi Online Land Records (RTC)
                </h3>
                <p className="text-xs text-stone-500 mb-3">Digital Land Records Management System</p>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Download authentic, digitally signed Pahani/RTC copies, verify mutation status, and check land ownership details for loan and subsidy sanctioning.
                </p>
              </div>
              <a 
                href="https://bhoomi.karnataka.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Visit bhoomi.karnataka.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Portal 3: PM-KISAN Portal */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                    Central Government
                  </span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold font-serif-heading text-stone-900 mb-2">
                  PM-KISAN Samman Nidhi Portal
                </h3>
                <p className="text-xs text-stone-500 mb-3">Ministry of Agriculture & Farmers Welfare</p>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Check ₹6,000 yearly installment status, perform face authentication e-KYC, update Aadhaar-linked bank accounts, and register new farmer beneficiaries.
                </p>
              </div>
              <a 
                href="https://pmkisan.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Visit pmkisan.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Portal 4: Samrakshane Portal */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
                    Crop Insurance
                  </span>
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="text-lg font-bold font-serif-heading text-stone-900 mb-2">
                  Samrakshane Karnataka (PMFBY)
                </h3>
                <p className="text-xs text-stone-500 mb-3">Karnataka Crop Insurance Decision Support</p>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Enroll in Kharif and Rabi season crop insurance schemes, check claim payout status, compute premium for specific crops and taluks, and view weather station reports.
                </p>
              </div>
              <a 
                href="https://samrakshane.karnataka.gov.in" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Visit samrakshane.karnataka.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

        {/* TAB 5: COMMON REJECTIONS & TROUBLESHOOTING */}
        {activeTab === 'troubleshooting' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <span>
                {language === 'kn'
                  ? 'ಬಹುಪಾಲು ಅರ್ಜಿಗಳು ತಿರಸ್ಕೃತವಾಗುವುದು ದಾಖಲೆಗಳ ತಪ್ಪಾದ ಹೊಂದಾಣಿಕೆ ಅಥವಾ ಬ್ಯಾಂಕ್ ಸೀಡಿಂಗ್ ಸಮಸ್ಯೆಯಿಂದ. ಕೆಳಗಿನ ಪರಿಹಾರಗಳನ್ನು ಗಮನಿಸಿ.'
                  : 'Over 85% of subsidy application delays are caused by name mismatch or unseeded bank accounts. Follow these proven fixes below.'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Issue 1 */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-2">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Issue 1: Name Mismatch (Aadhaar vs RTC)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The spelling in your Aadhaar card does not match the landowner name recorded in Bhoomi RTC records.
                </p>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-emerald-900 font-medium">
                  <strong>Fix:</strong> Obtain a Family Tree / Vamshavruksha Certificate or Name Discrepancy Affidavit from your local Tahsildar / Village Accountant.
                </div>
              </div>

              {/* Issue 2 */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-2">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Issue 2: Bank Account Not NPCI DBT Seeded</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bank account is active for cash, but NOT linked to the National Payments Corporation of India (NPCI) Aadhaar mapping system.
                </p>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-emerald-900 font-medium">
                  <strong>Fix:</strong> Visit your bank branch and ask specifically for "Aadhaar NPCI DBT Mandate Seeding Form". Submit with passbook and Aadhaar copy.
                </div>
              </div>

              {/* Issue 3 */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-2">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Issue 3: Missing Crop Survey App Entry</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Crop is growing on land, but not registered in the Karnataka Digital Crop Survey Mobile App (Bele Samikshe) for the current season.
                </p>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-emerald-900 font-medium">
                  <strong>Fix:</strong> Download the Karnataka Raitha Bele Samikshe App, upload geo-tagged photo of your standing crop, or contact your village Private Resident (PR) surveyor.
                </div>
              </div>

              {/* Issue 4 */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-2">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Issue 4: Joint Ownership Hissa Dispute</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Land is held jointly with siblings or relatives without distinct 11E survey sub-division sketches.
                </p>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-emerald-900 font-medium">
                  <strong>Fix:</strong> Submit a notarized No-Objection Certificate (NOC) signed by all co-owners specifying your exact cultivated acreage.
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
