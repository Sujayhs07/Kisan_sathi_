import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Bot, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Search, 
  Sprout, 
  Droplets, 
  CreditCard, 
  ShieldCheck, 
  Tractor, 
  Layers, 
  Home, 
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';
import { getStates, getDistricts, getTaluks } from '../data/locationData';
import EligibilityChatbot from '../components/EligibilityChatbot';

export default function CheckEligibilityPage() {
  const { 
    setCurrentPage, 
    wizardStep, 
    setWizardStep, 
    wizardData, 
    setWizardData, 
    eligibilityMode,
    setEligibilityMode,
    t, 
    language, 
    evaluateEligibility, 
    isEvaluating 
  } = useApp();

  // AI Assistant page first by default, anyone can change anytime
  const [mode, setMode] = useState(eligibilityMode || 'ai-chat'); // 'ai-chat' (default) | 'form'
  const [cropSearch, setCropSearch] = useState('');
  const [confirmed, setConfirmed] = useState(true);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (setEligibilityMode) {
      setEligibilityMode(newMode);
    }
  };

  // Available crops list for searchable multi-select
  const allCrops = useMemo(() => [
    'Ragi & Millets',
    'Paddy / Rice',
    'Maize (Corn)',
    'Jowar (Sorghum)',
    'Bajra (Pearl Millet)',
    'Pulses (Tur, Bengal Gram, Green Gram)',
    'Groundnut & Oilseeds',
    'Sugarcane',
    'Cotton',
    'Vegetables (Tomato, Onion, Chilli)',
    'Fruits (Mango, Banana, Pomegranate)',
    'Flowers & Sericulture',
    'Coffee & Plantation Crops'
  ], []);

  const filteredCrops = useMemo(() => {
    if (!cropSearch.trim()) return allCrops;
    return allCrops.filter(c => c.toLowerCase().includes(cropSearch.toLowerCase()));
  }, [allCrops, cropSearch]);

  // Support categories options
  const supportOptions = [
    { id: 'income_support', label: language === 'kn' ? 'ಆದಾಯ ನೆರವು (PM-Kisan / Raitha Siri)' : 'Income support (PM-KISAN / Raitha Siri)', icon: Sprout },
    { id: 'crop_loan', label: language === 'kn' ? 'ಬೆಳೆ ಸಾಲ / ಕ್ರೆಡಿಟ್ (KCC 0-4% ಬಡ್ಡಿ)' : 'Crop loan or agricultural credit (KCC 0-4% interest)', icon: CreditCard },
    { id: 'crop_insurance', label: language === 'kn' ? 'ಬೆಳೆ ವಿಮೆ (PM Fasal Bima)' : 'Crop insurance (PM Fasal Bima Yojana)', icon: ShieldCheck },
    { id: 'drip_sprinkler', label: language === 'kn' ? 'ಹನಿ / ತುಂತುರು ನೀರಾವರಿ ಸಬ್ಸಿಡಿ (PMKSY 90%)' : 'Drip or sprinkler irrigation (PMKSY up to 90% subsidy)', icon: Droplets },
    { id: 'borewell', label: language === 'kn' ? 'ಬೋರ್‌ವೆಲ್ ಅಥವಾ ನೀರು (ಗಂಗಾ ಕಲ್ಯಾಣ ಯೋಜನೆ)' : 'Borewell or water access (Ganga Kalyana Scheme)', icon: Droplets },
    { id: 'machinery_purchase', label: language === 'kn' ? 'ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಖರೀದಿ ಸಬ್ಸಿಡಿ' : 'Machinery purchase subsidy (RKVY)', icon: Tractor },
    { id: 'machinery_rental', label: language === 'kn' ? 'ಬಾಡಿಗೆ ಆಧಾರದ ಯಂತ್ರಗಳು (ಕಸ್ಟಮ್ ಹೈರಿಂಗ್)' : 'Machinery rental (Custom Hiring Centre at 50% rates)', icon: Tractor },
    { id: 'millet_cultivation', label: language === 'kn' ? 'ಸಿರಿಧಾನ್ಯ ಬೆಳೆ ಪ್ರೋತ್ಸಾಹ ಧನ (₹10,000/ಹೆಕ್ಟೇರ್)' : 'Millet cultivation incentive (Raitha Siri ₹10,000/ha)', icon: Sprout },
    { id: 'horticulture', label: language === 'kn' ? 'ತೋಟಗಾರಿಕೆ / ಹಸಿರುಮನೆ / ಪಾಲಿಹೌಸ್ (NHM)' : 'Horticulture, greenhouse, or polyhouse (NHM)', icon: Home },
    { id: 'farm_infra', label: language === 'kn' ? 'ಕೃಷಿ ಮೂಲಸೌಕರ್ಯ (ಗೋದಾಮು, ಸಂಸ್ಕರಣೆ)' : 'Farm infrastructure (Storage, processing, cold chain)', icon: Layers },
    { id: 'not_sure', label: language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ — ಎಲ್ಲಾ ಸೂಕ್ತ ಆಯ್ಕೆಗಳನ್ನು ತೋರಿಸಿ' : 'Not sure — show me all relevant options', icon: HelpCircle }
  ];

  // Document readiness items
  const docItems = [
    { key: 'aadhaar', label: language === 'kn' ? 'ಆಧಾರ್ ಕಾರ್ಡ್ ಅಥವಾ ಗುರುತಿನ ಚೀಟಿ' : 'Aadhaar or other identity document' },
    { key: 'bank_account', label: language === 'kn' ? 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ (DBT/NPCI ಸಕ್ರಿಯ)' : 'Bank account details (DBT/NPCI active)' },
    { key: 'land_record', label: language === 'kn' ? 'ಪಹಣಿ / RTC ಭೂ ದಾಖಲೆ' : 'Land record, such as RTC / Pahani' },
    { key: 'fruits_id', label: language === 'kn' ? 'ರೈತರ ನೋಂದಣಿ ಸಂಖ್ಯೆ (FRUITS FID)' : 'Farmer registration number (FRUITS FID), if any' },
    { key: 'caste_cert', label: language === 'kn' ? 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ (SC/ST/OBC ಗೆ ಅನ್ವಯಿಸಿದರೆ)' : 'Category / Caste certificate, if applicable' },
    { key: 'income_cert', label: language === 'kn' ? 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (ಅನ್ವಯಿಸಿದರೆ)' : 'Income certificate, if applicable' },
    { key: 'crop_survey', label: language === 'kn' ? 'ಬೆಳೆ ದರ್ಶಕ್ / ಬಿತ್ತನೆ ವಿವರಗಳು' : 'Crop or sowing details (Bele Darshak / survey)' },
    { key: 'lease_doc', label: language === 'kn' ? 'ಗೇಣಿ ಅಥವಾ ಒಡಂಬಡಿಕೆ ಪತ್ರ' : 'Lease or cultivation agreement, if applicable' }
  ];

  // Check which follow-ups are needed based on supportNeeded
  const activeFollowUps = useMemo(() => {
    const s = wizardData.supportNeeded || [];
    return {
      income: s.includes('income_support') || s.includes('not_sure'),
      credit: s.includes('crop_loan') || s.includes('not_sure'),
      irrigation: s.includes('drip_sprinkler') || s.includes('not_sure'),
      millet: s.includes('millet_cultivation') || s.includes('not_sure'),
      insurance: s.includes('crop_insurance') || s.includes('not_sure'),
      machinery: s.includes('machinery_purchase') || s.includes('machinery_rental') || s.includes('not_sure'),
      borewell: s.includes('borewell') || s.includes('not_sure'),
      horticulture: s.includes('horticulture') || s.includes('not_sure')
    };
  }, [wizardData.supportNeeded]);

  // Count skipped optional questions
  const skippedCount = useMemo(() => {
    let count = 0;
    if (!wizardData.fullName || wizardData.fullName === 'Farmer') count++;
    if (!wizardData.phoneNumber) count++;
    if (!wizardData.age) count++;
    if (!wizardData.village) count++;
    if (wizardData.category === 'Prefer not to say' || !wizardData.category) count++;
    if (wizardData.isMinority === 'Prefer not to say') count++;
    return count;
  }, [wizardData]);

  // Toggle crop selection
  const handleToggleCrop = (crop) => {
    const current = wizardData.cropsGrown || [];
    let updated;
    if (current.includes(crop)) {
      updated = current.filter(c => c !== crop);
      if (updated.length === 0) updated = [crop]; // keep at least one
    } else {
      updated = [...current, crop];
    }
    setWizardData({
      ...wizardData,
      cropsGrown: updated,
      cropType: updated.join(', ')
    });
  };

  // Toggle support needed
  const handleToggleSupport = (id) => {
    const current = wizardData.supportNeeded || [];
    let updated;
    if (id === 'not_sure') {
      updated = current.includes('not_sure') ? ['income_support'] : ['not_sure'];
    } else {
      const withoutNotSure = current.filter(c => c !== 'not_sure');
      if (withoutNotSure.includes(id)) {
        updated = withoutNotSure.filter(c => c !== id);
        if (updated.length === 0) updated = ['income_support'];
      } else {
        updated = [...withoutNotSure, id];
      }
    }
    setWizardData({ ...wizardData, supportNeeded: updated });
  };

  // Update doc readiness
  const handleDocReadinessChange = (docKey, status) => {
    setWizardData({
      ...wizardData,
      docReadiness: {
        ...(wizardData.docReadiness || {}),
        [docKey]: status
      }
    });
  };

  // Update follow-up answer
  const handleFollowUpChange = (field, value) => {
    setWizardData({
      ...wizardData,
      followUps: {
        ...(wizardData.followUps || {}),
        [field]: value
      }
    });
  };

  // Navigation handlers
  const handleNext = async () => {
    if (wizardStep < 5) {
      setWizardStep(wizardStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 5: Execute Rules Engine and navigate to Results
      await evaluateEligibility(wizardData);
      setCurrentPage('results');
    }
  };

  const handleBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">

        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-300/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              <span>{language === 'kn' ? 'ಏಕರೂಪದ ರೈತ ಪ್ರೊಫೈಲ್' : 'One Common Farmer Profile'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ಯೋಜನೆಯ ಅರ್ಹತೆ ಪ್ರಶ್ನಾವಳಿ' : 'Scheme Eligibility Assessment'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {language === 'kn' 
                ? 'ಒಂದೇ ಸರಳ ಪ್ರೊಫೈಲ್ ಮೂಲಕ ನಿಮ್ಮ ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಸಂಭಾವ್ಯ ಅರ್ಹತೆ, ದಾಖಲೆಗಳು ಮತ್ತು ಗಡುವನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ. ಪ್ರತಿ ಯೋಜನೆಗೂ ಪ್ರತ್ಯೇಕ ಫಾರ್ಮ್ ತುಂಬುವ ಅಗತ್ಯವಿಲ್ಲ.'
                : 'Complete one common profile to shortlist relevant schemes, then review scheme-specific follow-ups. No need to fill separate forms for each scheme.'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="bg-stone-200/90 p-1 sm:p-1.5 rounded-2xl flex items-center w-full sm:w-auto border border-stone-300 shadow-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => handleModeChange('ai-chat')}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative ${
                mode === 'ai-chat'
                  ? 'bg-forest-800 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{language === 'kn' ? 'AI ಸಹಾಯಕ' : 'AI Assistant'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('form')}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                mode === 'form'
                  ? 'bg-white text-forest-900 shadow-md border border-stone-200'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4 text-forest-700" />
              <span>{language === 'kn' ? '4-ಹಂತದ ಫಾರ್ಮ್' : '4-Stage Form'}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Interactive AI Chatbot (Default First View) */}
        {mode === 'ai-chat' ? (
          <EligibilityChatbot onSwitchToForm={() => handleModeChange('form')} />
        ) : (
          /* MODE 2: Unified 4-Stage Questionnaire + Review Flow */
          <>
            {/* Quick Switch to AI Assistant Banner */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 sm:p-4 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <span className="font-bold block text-emerald-950">
                    {language === 'kn' ? 'ಧ್ವನಿ ಅಥವಾ AI ಚಾಟ್ ಮೂಲಕ ಉತ್ತರಿಸಲು ಬಯಸುವಿರಾ?' : 'Prefer answering conversationally with voice or chat?'}
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    {language === 'kn' 
                      ? 'AI ಸಹಾಯಕ ನಿಮ್ಮ ಪ್ರಶ್ನಾವಳಿಯನ್ನು ಸಂವಾದದ ಮೂಲಕ ಪೂರ್ಣಗೊಳಿಸುತ್ತದೆ.' 
                      : 'The AI Assistant guides you step-by-step and autofills your answers.'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleModeChange('ai-chat')}
                className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'kn' ? 'AI ಸಹಾಯಕಕ್ಕೆ ಬದಲಾಯಿಸಿ' : 'Switch to AI Assistant'}</span>
              </button>
            </div>
            {/* 5-Step Stepper Header */}
            <div className="py-2 sm:py-4">
              <div className="flex items-center justify-between relative max-w-4xl mx-auto px-2">
                {/* Background line */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-stone-300 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-4 h-1 bg-forest-800 -translate-y-1/2 z-0 transition-all duration-300"
                  style={{ width: `${((wizardStep - 1) / 4) * 94}%` }}
                />

                {[
                  { num: 1, label: language === 'kn' ? 'ಮೂಲ ವಿವರ' : 'Basic Details' },
                  { num: 2, label: language === 'kn' ? 'ಕೃಷಿ ವಿವರ' : 'Farm Details' },
                  { num: 3, label: language === 'kn' ? 'ನೆರವು & ದಾಖಲೆ' : 'Support & Docs' },
                  { num: 4, label: language === 'kn' ? 'ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ' : 'Follow-ups' },
                  { num: 5, label: language === 'kn' ? 'ಪರಿಶೀಲನೆ' : 'Review' }
                ].map((s) => (
                  <div
                    key={s.num}
                    onClick={() => setWizardStep(s.num)}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-all ${
                      wizardStep >= s.num ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {wizardStep > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : s.num}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold max-w-[65px] sm:max-w-none text-center leading-tight ${
                      wizardStep === s.num ? 'text-forest-900' : 'text-stone-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questionnaire Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-8 md:p-10">

              {/* ============================================================== */}
              {/* STAGE 1: BASIC DETAILS */}
              {/* ============================================================== */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif-heading text-maroon-700">
                      {language === 'kn' ? '1. ಮೂಲ ವಿವರಗಳು (Basic Details)' : '1. Basic Details'}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {language === 'kn' 
                        ? 'ಅರ್ಜಿದಾರರು ಯಾರು ಮತ್ತು ಅವರು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತಾರೆ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಈ ವಿವರಗಳು ಸಹಕಾರಿ.'
                        : 'Understand who the applicant is and where they live.'}
                    </p>
                  </div>

                  {/* Sensitive Data Notice */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        {language === 'kn' ? 'ವಿಶೇಷ ಸೌಲಭ್ಯಗಳಿಗಾಗಿ ಮಾತ್ರ:' : 'Why we ask demographic details:'}
                      </span>{' '}
                      {language === 'kn'
                        ? 'ಮಹಿಳಾ ರೈತರು, ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ ಮತ್ತು ಅಲ್ಪಸಂಖ್ಯಾತ ಸಮುದಾಯಗಳಿಗೆ ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಆರ್‌ಕೆವಿವೈ ಅಡಿಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಸಬ್ಸಿಡಿ (90% ವರೆಗೆ) ಇರುತ್ತದೆ. ಸೂಕ್ಷ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಬಿಟ್ಟುಬಿಡಲು (Skip) ನಿಮಗೆ ಅವಕಾಶವಿದೆ.'
                        : 'Special subsidies (up to 90%), free borewells, and targeted welfare exist for women, SC/ST, and minority farmers. You may skip any sensitive question.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ನಿಮ್ಮ ಹೆಸರು (What is your name?)' : 'What is your name?'}
                        <span className="text-[10px] text-stone-600 font-normal ml-1">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={wizardData.fullName}
                        onChange={(e) => setWizardData({ ...wizardData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        placeholder={language === 'kn' ? 'ರೈತರ ಹೆಸರು' : 'e.g. Ramesh Gowda'}
                      />
                    </div>

                    {/* Preferred Language */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಆದ್ಯತೆಯ ಭಾಷೆ (Preferred Language)' : 'Which language would you prefer?'}
                      </label>
                      <select
                        value={wizardData.preferredLanguage || (language === 'kn' ? 'Kannada' : 'English')}
                        onChange={(e) => setWizardData({ ...wizardData, preferredLanguage: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                        <option value="English">English</option>
                        <option value="Hindi">हिंदी (Hindi)</option>
                        <option value="Other">Other / ಇತರ</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ನಿಮ್ಮ ವಯಸ್ಸು (What is your age?)' : 'What is your age?'}
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="100"
                        value={wizardData.age || ''}
                        onChange={(e) => setWizardData({ ...wizardData, age: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        placeholder="e.g. 42"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಲಿಂಗ (Gender)' : 'What is your gender?'}
                      </label>
                      <select
                        value={wizardData.gender || 'Man'}
                        onChange={(e) => setWizardData({ ...wizardData, gender: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Man">{language === 'kn' ? 'ಪುರುಷ (Man)' : 'Man'}</option>
                        <option value="Woman">{language === 'kn' ? 'ಮಹಿಳೆ (Woman - Enhanced subsidies)' : 'Woman (Enhanced subsidies)'}</option>
                        <option value="Other">{language === 'kn' ? 'ಇತರ (Other)' : 'Other'}</option>
                        <option value="Prefer not to say">{language === 'kn' ? 'ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ (Prefer not to say)' : 'Prefer not to say'}</option>
                      </select>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile Number)' : 'Mobile Number'}
                        <span className="text-[10px] text-stone-600 font-normal ml-1">(Optional for preview)</span>
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        value={wizardData.phoneNumber || ''}
                        onChange={(e) => setWizardData({ ...wizardData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        placeholder="e.g. 9845012345"
                      />
                    </div>

                    {/* Social Category */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಸಾಮಾಜಿಕ ವರ್ಗ (Social Category)' : 'Which social category do you belong to?'}
                      </label>
                      <select
                        value={wizardData.category || 'General'}
                        onChange={(e) => setWizardData({ ...wizardData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="General">General / ಸಾಮಾನ್ಯ</option>
                        <option value="OBC">OBC (2A / 2B / 3A / 3B / Cat-1)</option>
                        <option value="SC">SC (Scheduled Caste - 90-100% subsidy)</option>
                        <option value="ST">ST (Scheduled Tribe - 90-100% subsidy)</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say / ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ</option>
                      </select>
                    </div>

                    {/* Minority Community */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಅಲ್ಪಸಂಖ್ಯಾತ ಸಮುದಾಯ (Minority Community)' : 'Do you belong to a minority community?'}
                      </label>
                      <select
                        value={wizardData.isMinority || 'No'}
                        onChange={(e) => setWizardData({ ...wizardData, isMinority: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="No">{language === 'kn' ? 'ಇಲ್ಲ (No)' : 'No'}</option>
                        <option value="Yes">{language === 'kn' ? 'ಹೌದು (Yes - Muslim, Christian, Jain, Sikh, Buddhist)' : 'Yes (Eligible for KMDC / Minority schemes)'}</option>
                        <option value="Prefer not to say">{language === 'kn' ? 'ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ (Prefer not to say)' : 'Prefer not to say'}</option>
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ರಾಜ್ಯ (State)' : 'State'}
                      </label>
                      <select
                        value={wizardData.state || 'Karnataka'}
                        onChange={(e) => {
                          const newState = e.target.value;
                          const dists = getDistricts(newState);
                          const firstD = dists[0] || '';
                          const taluks = getTaluks(newState, firstD);
                          setWizardData({
                            ...wizardData,
                            state: newState,
                            district: firstD,
                            taluk: taluks[0] || ''
                          });
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        {getStates().map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಜಿಲ್ಲೆ (District)' : 'District'}
                      </label>
                      <select
                        value={wizardData.district || 'Dharwad'}
                        onChange={(e) => {
                          const newD = e.target.value;
                          const taluks = getTaluks(wizardData.state || 'Karnataka', newD);
                          setWizardData({
                            ...wizardData,
                            district: newD,
                            taluk: taluks[0] || ''
                          });
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        {getDistricts(wizardData.state || 'Karnataka').map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Taluk */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ತಾಲೂಕು (Taluk)' : 'Taluk'}
                      </label>
                      <select
                        value={wizardData.taluk || ''}
                        onChange={(e) => setWizardData({ ...wizardData, taluk: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        {getTaluks(wizardData.state || 'Karnataka', wizardData.district || 'Dharwad').map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Village */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಗ್ರಾಮ (Village)' : 'Village'}
                      </label>
                      <input
                        type="text"
                        value={wizardData.village || ''}
                        onChange={(e) => setWizardData({ ...wizardData, village: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        placeholder="e.g. Hebsur / Navalgund"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 2: FARM DETAILS */}
              {/* ============================================================== */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif-heading text-maroon-700">
                      {language === 'kn' ? '2. ಕೃಷಿ ವಿವರಗಳು (Farm Details)' : '2. Farm Details'}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {language === 'kn'
                        ? 'ನಿಮ್ಮ ಜಮೀನು, ಮಾಲೀಕತ್ವ, ಬೆಳೆಗಳು ಮತ್ತು ನೀರಿನ ಸೌಲಭ್ಯದ ವಿವರಗಳನ್ನು ನೀಡಿ.'
                        : 'Understand the farm, land arrangement, crops, and water access.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {/* Land Location */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಜಮೀನಿನ ಸ್ಥಳ (Where is your land located?)' : 'Where is your agricultural land located?'}
                      </label>
                      <select
                        value={wizardData.landLocationType || 'same_as_village'}
                        onChange={(e) => setWizardData({ ...wizardData, landLocationType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="same_as_village">{language === 'kn' ? 'ನನ್ನ ಗ್ರಾಮದಲ್ಲೇ ಇದೆ (Same as my village)' : 'Same as my village'}</option>
                        <option value="other_location">{language === 'kn' ? 'ಬೇರೆ ಸ್ಥಳದಲ್ಲಿದೆ (Select another location)' : 'Different location in Karnataka'}</option>
                      </select>
                    </div>

                    {/* Land Cultivation Arrangement */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಜಮೀನಿನ ಮಾಲೀಕತ್ವ / ನಿರ್ವಹಣೆ' : 'How do you cultivate the land?'}
                      </label>
                      <select
                        value={wizardData.cultivationArrangement || 'Own land'}
                        onChange={(e) => setWizardData({ ...wizardData, cultivationArrangement: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Own land">{language === 'kn' ? 'ಸ್ವಂತ ಜಮೀನು (Own land)' : 'Own land'}</option>
                        <option value="Lease or rent">{language === 'kn' ? 'ಗೇಣಿ / ಬಾಡಿಗೆ (Lease or rent)' : 'Lease or rent'}</option>
                        <option value="Sharecropping">{language === 'kn' ? 'ಪಾಲುದಾರಿಕೆ (Sharecropping)' : 'Sharecropping'}</option>
                        <option value="Family land">{language === 'kn' ? 'ಕುಟುಂಬದ ಜಮೀನು (Family land)' : 'Family land'}</option>
                        <option value="Other">{language === 'kn' ? 'ಇತರ (Other / Not sure)' : 'Other / Not sure'}</option>
                      </select>
                    </div>

                    {/* Total Land Cultivated */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಒಟ್ಟು ಸಾಗುವಳಿ ಜಮೀನು' : 'How much land do you cultivate in total?'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={wizardData.landHolding || '2.0'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseFloat(val) || 0;
                            let lType = 'Marginal (< 2.5 Acres)';
                            if (num > 10) lType = 'Large (> 10 Acres)';
                            else if (num > 5) lType = 'Medium (5 - 10 Acres)';
                            else if (num > 2.5) lType = 'Small (2.5 - 5 Acres)';
                            setWizardData({ ...wizardData, landHolding: val, landType: lType });
                          }}
                          className="w-2/3 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-forest-700 focus:outline-none"
                          placeholder="e.g. 2.5"
                        />
                        <select
                          value={wizardData.landUnit || 'Acres'}
                          onChange={(e) => setWizardData({ ...wizardData, landUnit: e.target.value })}
                          className="w-1/3 px-3 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold text-xs"
                        >
                          <option value="Acres">Acres / ಎಕರೆ</option>
                          <option value="Hectares">Hectares / ಹೆಕ್ಟೇರ್</option>
                          <option value="Guntas">Guntas / ಗುಂಟೆ</option>
                        </select>
                      </div>
                    </div>

                    {/* Land Owned */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಇದರಲ್ಲಿ ನಿಮ್ಮ ಸ್ವಂತ ಜಮೀನು ಎಷ್ಟು?' : 'How much of this land do you own?'}
                      </label>
                      <select
                        value={wizardData.landOwned || '2.0'}
                        onChange={(e) => setWizardData({ ...wizardData, landOwned: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="All">{language === 'kn' ? 'ಎಲ್ಲವೂ ನನ್ನದೇ (All of it)' : 'All of it (Entire holding)'}</option>
                        <option value="2.0">Around 2.0 Acres</option>
                        <option value="Partially">{language === 'kn' ? 'ಭಾಗಶಃ (Partially owned)' : 'Partially owned'}</option>
                        <option value="None">{language === 'kn' ? 'ಸ್ವಂತ ಜಮೀನಿಲ್ಲ (None - Tenant / Lessee)' : 'None (Pure tenant / lease)'}</option>
                        <option value="Not sure">{language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ (Not sure)' : 'Not sure'}</option>
                      </select>
                    </div>

                    {/* Land Record Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಪಹಣಿಯಲ್ಲಿ ಯಾರ ಹೆಸರಿದೆ?' : 'In whose name are the land records?'}
                      </label>
                      <select
                        value={wizardData.landRecordOwner || 'My name'}
                        onChange={(e) => setWizardData({ ...wizardData, landRecordOwner: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="My name">{language === 'kn' ? 'ನನ್ನ ಹೆಸರಲ್ಲಿದೆ (My name)' : 'My name'}</option>
                        <option value="Joint ownership">{language === 'kn' ? 'ಜಂಟಿ ಮಾಲೀಕತ್ವ (Joint ownership)' : 'Joint ownership'}</option>
                        <option value="Family member">{language === 'kn' ? 'ಕುಟುಂಬದ ಹಿರಿಯರ ಹೆಸರಲ್ಲಿದೆ (Family member)' : 'Parents / Family member'}</option>
                        <option value="Landowner">{language === 'kn' ? 'ಭೂಮಾಲೀಕರ ಹೆಸರಲ್ಲಿದೆ (Landowner)' : 'Landowner (I cultivate on lease)'}</option>
                        <option value="Not sure">{language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ (Not sure)' : 'Not sure'}</option>
                      </select>
                    </div>

                    {/* Cultivation Season */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಯಾವ ಹಂಗಾಮಿನಲ್ಲಿ ಕೃಷಿ ಮಾಡುತ್ತೀರಿ?' : 'In which season do you cultivate?'}
                      </label>
                      <select
                        value={wizardData.cropSeason || 'Kharif'}
                        onChange={(e) => setWizardData({ ...wizardData, cropSeason: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Kharif">{language === 'kn' ? 'ಖಾರಿಫ್ / ಮುಂಗಾರು (Kharif / Monsoon)' : 'Kharif (Monsoon)'}</option>
                        <option value="Rabi">{language === 'kn' ? 'ರಬಿ / ಹಿಂಗಾರು (Rabi / Winter)' : 'Rabi (Winter)'}</option>
                        <option value="Summer">{language === 'kn' ? 'ಬೇಸಿಗೆ (Summer)' : 'Summer'}</option>
                        <option value="Throughout the year">{language === 'kn' ? 'ವರ್ಷವಿಡೀ (Throughout the year)' : 'Throughout the year'}</option>
                        <option value="Not sure">{language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ (Not sure)' : 'Not sure'}</option>
                      </select>
                    </div>

                    {/* Irrigation Source */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಮುಖ್ಯ ನೀರಾವರಿ ಮೂಲ' : 'What is your main source of irrigation?'}
                      </label>
                      <select
                        value={wizardData.irrigationSource || 'Borewell'}
                        onChange={(e) => setWizardData({ ...wizardData, irrigationSource: e.target.value, irrigationType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Rain only">{language === 'kn' ? 'ಕೇವಲ ಮಳೆ ಆಶ್ರಿತ (Rain only / Dryland)' : 'Rain only (Dryland)'}</option>
                        <option value="Borewell">{language === 'kn' ? 'ಬೋರ್‌ವೆಲ್ (Borewell)' : 'Borewell'}</option>
                        <option value="Open well">{language === 'kn' ? 'ತೆರೆದ ಬಾವಿ (Open well)' : 'Open well'}</option>
                        <option value="Canal">{language === 'kn' ? 'ಕಾಲುವೆ / ನದಿ (Canal / River)' : 'Canal / River'}</option>
                        <option value="Pond">{language === 'kn' ? 'ಕೃಷಿ ಹೊಂಡ / ಕೆರೆ (Farm pond / Tank)' : 'Farm pond / Tank'}</option>
                        <option value="Other">{language === 'kn' ? 'ಇತರ (Other / Not sure)' : 'Other / Not sure'}</option>
                      </select>
                    </div>

                    {/* Micro-irrigation installed */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಹನಿ / ತುಂತುರು ನೀರಾವರಿ ಬಳಸುತ್ತಿದ್ದೀರಾ?' : 'Do you use drip or sprinkler irrigation?'}
                      </label>
                      <select
                        value={wizardData.microIrrigation || 'Neither'}
                        onChange={(e) => setWizardData({ ...wizardData, microIrrigation: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Neither">{language === 'kn' ? 'ಇಲ್ಲ (Neither - Interested in 90% subsidy)' : 'Neither (Want to install with subsidy)'}</option>
                        <option value="Drip">{language === 'kn' ? 'ಹೌದು, ಹನಿ ನೀರಾವರಿ (Drip installed)' : 'Drip irrigation installed'}</option>
                        <option value="Sprinkler">{language === 'kn' ? 'ಹೌದು, ತುಂತುರು ನೀರಾವರಿ (Sprinkler installed)' : 'Sprinkler installed'}</option>
                        <option value="Both">{language === 'kn' ? 'ಎರಡೂ ಇದೆ (Both)' : 'Both installed'}</option>
                      </select>
                    </div>

                    {/* Allied Activities */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಉಪ ಕಸುಬುಗಳು (Allied Activities)' : 'Allied agricultural activities'}
                      </label>
                      <select
                        value={(wizardData.alliedActivities && wizardData.alliedActivities[0]) || 'None'}
                        onChange={(e) => setWizardData({ ...wizardData, alliedActivities: [e.target.value] })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="None">{language === 'kn' ? 'ಯಾವುದೂ ಇಲ್ಲ (None / ಕೃಷಿ ಮಾತ್ರ)' : 'None (Only crop cultivation)'}</option>
                        <option value="Dairy">{language === 'kn' ? 'ಹೈನುಗಾರಿಕೆ (Dairy / Cattle)' : 'Dairy farming'}</option>
                        <option value="Poultry">{language === 'kn' ? 'ಕೋಳಿ ಸಾಕಾಣಿಕೆ (Poultry)' : 'Poultry farming'}</option>
                        <option value="Fisheries">{language === 'kn' ? 'ಮೀನುಗಾರಿಕೆ (Fisheries)' : 'Fisheries / Aquaculture'}</option>
                        <option value="Sericulture">{language === 'kn' ? 'ರೇಷ್ಮೆ ಕೃಷಿ (Sericulture)' : 'Sericulture'}</option>
                        <option value="Other">{language === 'kn' ? 'ಇತರ (Other)' : 'Other'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Searchable Crop Multi-Select Section */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {language === 'kn' ? 'ಯಾವ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯುತ್ತೀರಿ? (Which crops do you grow or plan to grow?)' : 'Which crops do you currently grow or plan to grow?'}
                      <span className="text-forest-700 font-semibold ml-1.5">(Select all that apply)</span>
                    </label>

                    {/* Search filter */}
                    <div className="relative mb-3 max-w-md">
                      <Search className="w-4 h-4 text-stone-600 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={cropSearch}
                        onChange={(e) => setCropSearch(e.target.value)}
                        placeholder={language === 'kn' ? 'ಬೆಳೆ ಹುಡುಕಿ (ಉದಾ: ರಾಗಿ, ಭತ್ತ, ತರಕಾರಿ)...' : 'Search crops (e.g. Ragi, Paddy, Cotton)...'}
                        className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      />
                    </div>

                    {/* Chips grid */}
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                      {filteredCrops.map(crop => {
                        const isSelected = (wizardData.cropsGrown || []).includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => handleToggleCrop(crop)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-forest-800 text-white border-forest-900 shadow-xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                            <span>{crop}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 3: ADDITIONAL INFO & SUPPORT NEEDED */}
              {/* ============================================================== */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif-heading text-maroon-700">
                      {language === 'kn' ? '3. ನೆರವು ಮತ್ತು ದಾಖಲೆಗಳ ಲಭ್ಯತೆ (Support Needed & Readiness)' : '3. Support Needed & Document Readiness'}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {language === 'kn'
                        ? 'ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಸರ್ಕಾರಿ ನೆರವು ಬೇಕು ಮತ್ತು ನಿಮ್ಮ ಬಳಿ ಯಾವ ದಾಖಲೆಗಳು ಸಿದ್ಧವಾಗಿವೆ ಎಂಬುದನ್ನು ಗುರುತಿಸಿ.'
                        : 'Identify what help you want and what documents you already have ready.'}
                    </p>
                  </div>

                  {/* 1. What support do you need? */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      {language === 'kn' ? 'ನಿಮಗೆ ಯಾವ ನೆರವು ಬೇಕು? (What support do you need? Select all that apply)' : 'What support do you need? Select all that apply:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {supportOptions.map(opt => {
                        const isChecked = (wizardData.supportNeeded || []).includes(opt.id);
                        const Icon = opt.icon;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleToggleSupport(opt.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isChecked
                                ? 'bg-emerald-50 border-forest-800 text-forest-950 shadow-xs ring-1 ring-forest-800/20'
                                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 mt-0.5 text-forest-800 rounded focus:ring-forest-700 border-stone-300 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block leading-snug">{opt.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Context Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                    {/* Applying As */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ರೀತಿ' : 'Applying as an individual or group?'}
                      </label>
                      <select
                        value={wizardData.applicantType || 'Individual'}
                        onChange={(e) => setWizardData({ ...wizardData, applicantType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Individual">{language === 'kn' ? 'ವೈಯಕ್ತಿಕ ರೈತ (Individual)' : 'Individual Farmer'}</option>
                        <option value="Farmer group">{language === 'kn' ? 'ರೈತರ ಸಂಘ / SHG (Farmer group)' : 'Farmer Group / SHG'}</option>
                        <option value="FPO">{language === 'kn' ? 'ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ (FPO)' : 'FPO (Farmer Producer Org)'}</option>
                        <option value="Cooperative">{language === 'kn' ? 'ಸಹಕಾರಿ ಸಂಘ (Cooperative)' : 'Cooperative Society'}</option>
                      </select>
                    </div>

                    {/* Past Benefits */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಹಿಂದೆ ಯಾವುದೇ ಯೋಜನೆಯ ಪ್ರಯೋಜನ ಪಡೆದಿದ್ದೀರಾ?' : 'Received scheme benefits before?'}
                      </label>
                      <select
                        value={wizardData.hasReceivedPastBenefits || 'No'}
                        onChange={(e) => setWizardData({ ...wizardData, hasReceivedPastBenefits: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="No">{language === 'kn' ? 'ಇಲ್ಲ (No)' : 'No'}</option>
                        <option value="Yes">{language === 'kn' ? 'ಹೌದು (Yes - PM-Kisan / KCC)' : 'Yes (PM-Kisan / KCC / Subsidy)'}</option>
                        <option value="Not sure">{language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ (Not sure)' : 'Not sure'}</option>
                      </select>
                    </div>

                    {/* Application Status */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಆಯ್ಕೆ ಮಾಡಿದ ನೆರವಿಗೆ ಈಗಾಗಲೇ ಅರ್ಜಿ ಹಾಕಿದ್ದೀರಾ?' : 'Already applied for this support?'}
                      </label>
                      <select
                        value={wizardData.applicationStatusForSupport || 'Not applied'}
                        onChange={(e) => setWizardData({ ...wizardData, applicationStatusForSupport: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Not applied">{language === 'kn' ? 'ಅರ್ಜಿ ಹಾಕಿಲ್ಲ (Not applied yet)' : 'Not applied yet'}</option>
                        <option value="Applied">{language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ (Applied - Under Review)' : 'Applied (Under review)'}</option>
                        <option value="Approved">{language === 'kn' ? 'ಮಂಜೂರಾಗಿದೆ (Approved)' : 'Approved'}</option>
                        <option value="Rejected">{language === 'kn' ? 'ತಿರಸ್ಕೃತವಾಗಿದೆ (Rejected previously)' : 'Rejected previously'}</option>
                        <option value="Not sure">{language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ (Not sure)' : 'Not sure'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Document Readiness Checklist */}
                  <div className="pt-3 border-t border-stone-200">
                    <div className="mb-3">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                        {language === 'kn' ? 'ದಾಖಲೆಗಳ ಲಭ್ಯತೆಯ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ (Document Readiness Checklist)' : 'Which of the following do you have available?'}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {language === 'kn'
                          ? 'ಯಾವುದೇ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ. ಕೇವಲ ಲಭ್ಯತೆಯನ್ನು ತಿಳಿಸಿ; ಇದು ನಿಮ್ಮ ಸಿದ್ಧತೆಯನ್ನು ಅಳೆಯಲು ಮಾತ್ರ.'
                          : 'Readiness checklist only. No document uploads or account numbers are collected.'}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {docItems.map(d => {
                        const currentStatus = (wizardData.docReadiness && wizardData.docReadiness[d.key]) || 'available';
                        return (
                          <div 
                            key={d.key} 
                            className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <span className="text-xs font-bold text-stone-800">{d.label}</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] font-semibold">
                              {[
                                { val: 'available', label: language === 'kn' ? 'ಲಭ್ಯವಿದೆ (Available)' : 'Available', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                                { val: 'not_available', label: language === 'kn' ? 'ಲಭ್ಯವಿಲ್ಲ' : 'Not Available', color: 'bg-stone-200 text-stone-700 border-stone-300' },
                                { val: 'not_sure', label: language === 'kn' ? 'ಖಚಿತವಿಲ್ಲ' : 'Not Sure', color: 'bg-amber-100 text-amber-900 border-amber-300' }
                              ].map(st => (
                                <button
                                  key={st.val}
                                  type="button"
                                  onClick={() => handleDocReadinessChange(d.key, st.val)}
                                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                                    currentStatus === st.val
                                      ? `${st.color} font-bold shadow-xs`
                                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-100'
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 4: SCHEME-SPECIFIC FOLLOW-UP QUESTIONS */}
              {/* ============================================================== */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold uppercase mb-1">
                      Adaptive Follow-ups
                    </div>
                    <h2 className="text-xl font-bold font-serif-heading text-maroon-700">
                      {language === 'kn' ? '4. ಸಂಬಂಧಿತ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗಳು (Follow-up Questions)' : '4. Relevant Scheme Follow-ups'}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {language === 'kn'
                        ? 'ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ನೆರವಿನ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಈ ಕೆಲವು ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲಾಗುತ್ತದೆ.'
                        : 'Asked only when relevant to narrow down exact scheme matching conditions.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Follow-up 1: Income Support */}
                    {activeFollowUps.income && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Income Support Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Does your family already receive PM-Kisan or Raitha Siri?
                            </label>
                            <select
                              value={wizardData.followUps?.incomeSupportFamilyReceived || 'No'}
                              onChange={(e) => handleFollowUpChange('incomeSupportFamilyReceived', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="No">No, nobody receives it</option>
                              <option value="Yes_self">Yes, I receive it</option>
                              <option value="Yes_family">Yes, a family member receives it</option>
                              <option value="Not sure">Not sure</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Are land records in your or a family member's name?
                            </label>
                            <select
                              value={wizardData.followUps?.incomeSupportLandInName || 'My name'}
                              onChange={(e) => handleFollowUpChange('incomeSupportLandInName', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="My name">In my name (Verified on Bhoomi)</option>
                              <option value="Family member">In parent's / family member's name</option>
                              <option value="Leased">Leased / Not in family</option>
                              <option value="Not sure">Not sure</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 2: Agricultural Credit */}
                    {activeFollowUps.credit && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Crop Loan & Credit Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Do you already have an active Kisan Credit Card (KCC)?
                            </label>
                            <select
                              value={wizardData.followUps?.creditActiveLoanOrKCC || 'No'}
                              onChange={(e) => handleFollowUpChange('creditActiveLoanOrKCC', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="No">No active KCC (Need new card)</option>
                              <option value="Yes">Yes, have active KCC</option>
                              <option value="Not sure">Not sure</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              What agricultural activity do you need credit for?
                            </label>
                            <select
                              value={wizardData.followUps?.creditPurpose || 'Seasonal crop cultivation'}
                              onChange={(e) => handleFollowUpChange('creditPurpose', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Seasonal crop cultivation">Seasonal crop cultivation (Seeds, fertilizer)</option>
                              <option value="Farm machinery">Farm machinery & maintenance</option>
                              <option value="Dairy/allied">Dairy / Livestock / Animal Husbandry</option>
                              <option value="Land improvement">Land improvement / Solar pump</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 3: Micro-Irrigation */}
                    {activeFollowUps.irrigation && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Drip & Sprinkler Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              How much area would you like to cover with micro-irrigation?
                            </label>
                            <input
                              type="text"
                              value={wizardData.followUps?.irrigationCoverArea || wizardData.landHolding || '2.0'}
                              onChange={(e) => handleFollowUpChange('irrigationCoverArea', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                              placeholder="e.g. 2.0 Acres"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Is an active water source available on the plot?
                            </label>
                            <select
                              value={wizardData.followUps?.irrigationWaterAvailable || 'Yes'}
                              onChange={(e) => handleFollowUpChange('irrigationWaterAvailable', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Yes">Yes, working borewell/canal/well</option>
                              <option value="Seasonal">Seasonal water only</option>
                              <option value="No">No working water source</option>
                              <option value="Not sure">Not sure</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 4: Machinery Rental vs Purchase vs Centre */}
                    {activeFollowUps.machinery && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Tractor className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Machinery Needs & Custom Hiring Centre</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Which best describes your machinery need?
                            </label>
                            <select
                              value={wizardData.followUps?.machineryPreference || 'rent'}
                              onChange={(e) => handleFollowUpChange('machineryPreference', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="rent">I want to RENT machinery at 50% subsidized hourly rates</option>
                              <option value="purchase">I want to PURCHASE equipment with 50% capital subsidy</option>
                              <option value="establish_chc">I want to ESTABLISH a hiring centre as an entrepreneur/FPO</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Which equipment or facility do you need?
                            </label>
                            <select
                              value={wizardData.followUps?.machineryNeeds || 'Tractor & implements'}
                              onChange={(e) => handleFollowUpChange('machineryNeeds', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Tractor & implements">Tractor & tilling implements</option>
                              <option value="Power Tiller">Power Tiller / Rotary Tiller</option>
                              <option value="Harvester">Combine Harvester / Thresher</option>
                              <option value="Sprayers">Power Sprayer / Drone Sprayer</option>
                              <option value="Processing">Post-harvest cleaning & grading unit</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 5: Borewell / Water Access (Ganga Kalyana) */}
                    {activeFollowUps.borewell && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Borewell & Ganga Kalyana Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Do you currently have a working borewell on this farm?
                            </label>
                            <select
                              value={wizardData.followUps?.borewellExistingSource || 'No borewell on farm'}
                              onChange={(e) => handleFollowUpChange('borewellExistingSource', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="No borewell on farm">No borewell on farm (Need 100% free borewell)</option>
                              <option value="Failed borewell">Have dried/failed borewell</option>
                              <option value="Working borewell">Already have working borewell</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Is the proposed support for an individual farm or group?
                            </label>
                            <select
                              value={wizardData.followUps?.borewellType || 'Individual small/marginal farmer'}
                              onChange={(e) => handleFollowUpChange('borewellType', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Individual small/marginal farmer">Individual small/marginal farmer (1.5 - 5 Acres)</option>
                              <option value="Group of adjacent farmers">Group of adjacent farmers (8 - 15 Acres community well)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 6: Millet Cultivation */}
                    {activeFollowUps.millet && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">Raitha Siri Millet Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Which millets do you grow or plan to grow?
                            </label>
                            <select
                              value={wizardData.followUps?.milletTypes || 'Ragi (Finger Millet)'}
                              onChange={(e) => handleFollowUpChange('milletTypes', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Ragi (Finger Millet)">Ragi (Finger Millet / ರಾಗಿ)</option>
                              <option value="Jowar (Sorghum)">Jowar (Sorghum / ಜೋಳ)</option>
                              <option value="Bajra (Pearl Millet)">Bajra (Sajje / ಸಜ್ಜೆ)</option>
                              <option value="Foxtail/Minor">Navane, Same, Haraka (Minor Millets)</option>
                              <option value="Multiple">Multiple Millets</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Planned cultivated area for millets (Acres):
                            </label>
                            <input
                              type="text"
                              value={wizardData.followUps?.milletArea || wizardData.landHolding || '2.0'}
                              onChange={(e) => handleFollowUpChange('milletArea', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                              placeholder="e.g. 2.0 Acres"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow-up 7: Horticulture & Greenhouse */}
                    {activeFollowUps.horticulture && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-forest-700" />
                          <span className="font-bold text-xs uppercase text-stone-800">National Horticulture Mission Follow-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              What structure or horticulture project are you planning?
                            </label>
                            <select
                              value={wizardData.followUps?.horticultureStructure || 'Greenhouse / Polyhouse'}
                              onChange={(e) => handleFollowUpChange('horticultureStructure', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="Greenhouse / Polyhouse">Naturally ventilated Polyhouse</option>
                              <option value="Shade net house">Shade net house structure</option>
                              <option value="High-density orchard">High-density fruit orchard (Mango/Pomegranate/Banana)</option>
                              <option value="Cold storage">Cold storage / Pack house</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Is this a new project or an expansion?
                            </label>
                            <select
                              value={wizardData.followUps?.horticultureStage || 'New project'}
                              onChange={(e) => handleFollowUpChange('horticultureStage', e.target.value)}
                              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                            >
                              <option value="New project">New project (First-time establishment)</option>
                              <option value="Expansion">Expansion of existing commercial unit</option>
                              <option value="Not sure">Not sure</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 5: REVIEW SCREEN */}
              {/* ============================================================== */}
              {wizardStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif-heading text-maroon-700">
                      {language === 'kn' ? '5. ವಿವರಗಳ ಪರಿಶೀಲನೆ (Review & Verify)' : '5. Review Your Farmer Profile'}
                    </h2>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {language === 'kn'
                        ? 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕುವ ಮೊದಲು ನಿಮ್ಮ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.'
                        : 'Review your responses before shortlisting matching schemes. You can edit any answer below.'}
                    </p>
                  </div>

                  {/* Plain-Language Profile Summary Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-forest-900 text-white shadow-sm space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                      Profile Statement
                    </span>
                    <p className="text-sm sm:text-base font-serif-heading font-medium leading-relaxed">
                      {language === 'kn'
                        ? `ನೀವು ${wizardData.district || 'ಧಾರವಾಡ'} (${wizardData.taluk || 'ತಾಲೂಕು'}) ನಲ್ಲಿ ${wizardData.landHolding || '2.0'} ${wizardData.landUnit || 'ಎಕರೆ'} ಜಮೀನಿನಲ್ಲಿ ${wizardData.cropsGrown?.join(', ') || 'ರಾಗಿ'} ಬೆಳೆಯುತ್ತಿದ್ದು, ${wizardData.supportNeeded?.length || 2} ರೀತಿಯ ಸರ್ಕಾರಿ ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ.`
                        : `You cultivate ${wizardData.landHolding || '2.0'} ${wizardData.landUnit || 'Acres'} of ${wizardData.cultivationArrangement || 'own'} land in ${wizardData.village ? wizardData.village + ', ' : ''}${wizardData.taluk || 'Taluk'}, ${wizardData.district || 'Karnataka'}, grow ${wizardData.cropsGrown?.join(', ') || 'Ragi & Millets'} (${wizardData.cropSeason || 'Kharif'}), and are looking for ${wizardData.supportNeeded?.length || 2} support areas.`}
                    </p>
                  </div>

                  {/* Skipped Questions Indicator */}
                  {skippedCount > 0 && (
                    <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <span>
                          {language === 'kn'
                            ? `${skippedCount} ಐಚ್ಛಿಕ ಪ್ರಶ್ನೆಗಳನ್ನು ಉತ್ತರಿಸಲಾಗಿಲ್ಲ (ಪರವಾಗಿಲ್ಲ, ನೀವು ಯೋಜನೆಗಳನ್ನು ನೋಡಬಹುದು!)`
                            : `${skippedCount} optional questions were skipped. You can still proceed to find matching schemes!`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-forest-800">Ready to match</span>
                    </div>
                  )}

                  {/* 4 Summary Cards with Edit shortcuts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Details Card */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">1. Basic Details</span>
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-forest-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-stone-700">
                        <div><span className="text-stone-500 block text-[10px]">Name:</span><strong>{wizardData.fullName || 'Farmer'}</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Age & Gender:</span><strong>{wizardData.age || 'Not specified'} Yrs, {wizardData.gender || 'Not specified'}</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Category:</span><strong>{wizardData.category || 'General'}</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Location:</span><strong>{wizardData.district}, {wizardData.state}</strong></div>
                      </div>
                    </div>

                    {/* Farm Details Card */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">2. Farm Details</span>
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-forest-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-stone-700">
                        <div><span className="text-stone-500 block text-[10px]">Land Holding:</span><strong>{wizardData.landHolding} {wizardData.landUnit || 'Acres'} ({wizardData.cultivationArrangement})</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Crops:</span><strong>{wizardData.cropsGrown?.join(', ')}</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Irrigation:</span><strong>{wizardData.irrigationSource}</strong></div>
                        <div><span className="text-stone-500 block text-[10px]">Micro-Irrigation:</span><strong>{wizardData.microIrrigation}</strong></div>
                      </div>
                    </div>

                    {/* Support Needed Card */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">3. Support Requested</span>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="text-forest-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(wizardData.supportNeeded || []).map(id => {
                          const item = supportOptions.find(o => o.id === id);
                          return (
                            <span key={id} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-bold text-[10px]">
                              {item?.label?.split('(')[0] || id}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Document Readiness Card */}
                    <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">4. Document Readiness</span>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="text-forest-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <div>Aadhaar: <strong className="text-emerald-700 capitalize">{wizardData.docReadiness?.aadhaar || 'Available'}</strong></div>
                        <div>Bank A/C: <strong className="text-emerald-700 capitalize">{wizardData.docReadiness?.bank_account || 'Available'}</strong></div>
                        <div>Pahani/RTC: <strong className="text-emerald-700 capitalize">{wizardData.docReadiness?.land_record || 'Available'}</strong></div>
                        <div>FRUITS FID: <strong className="text-amber-700 capitalize">{wizardData.docReadiness?.fruits_id || 'Not sure'}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation and Reminders Consent */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-forest-800 rounded focus:ring-forest-700 border-stone-300"
                      />
                      <span className="text-stone-800 font-medium">
                        {language === 'kn'
                          ? 'ಮೇಲೆ ನೀಡಲಾದ ವಿವರಗಳು ನನ್ನ ಜ್ಞಾನದ ಮಟ್ಟಿಗೆ ಸರಿಯಾಗಿವೆ ಎಂದು ನಾನು ದೃಢೀಕರಿಸುತ್ತೇನೆ.'
                          : 'I confirm that the information provided above is correct to the best of my knowledge.'}
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wizardData.wantsReminders !== false}
                        onChange={(e) => setWizardData({ ...wizardData, wantsReminders: e.target.checked })}
                        className="w-4 h-4 mt-0.5 text-forest-800 rounded focus:ring-forest-700 border-stone-300"
                      />
                      <span className="text-stone-800 font-medium">
                        {language === 'kn'
                          ? 'ನನ್ನ ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ ಮತ್ತು ಮುಂಬರುವ ಯೋಜನೆಗಳ ಗಡುವು ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನನಗೆ ನೆನಪೋಲೆ ನೀಡಿ.'
                          : 'Save my farmer profile and notify me of upcoming application deadlines and missing documents.'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Bottom Stepper Controls */}
              <div className="mt-8 pt-6 border-t border-stone-200/80 flex items-center justify-between">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-sm flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t.back}</span>
                  </button>
                ) : <div />}

                <button
                  type="button"
                  disabled={isEvaluating || (wizardStep === 5 && !confirmed)}
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 ml-auto"
                >
                  <span>
                    {isEvaluating
                      ? (language === 'kn' ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Evaluating Schemes...')
                      : (wizardStep === 5
                          ? (language === 'kn' ? 'ಹೊಂದಾಣಿಕೆಯಾಗುವ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ' : 'Find Matching Schemes')
                          : t.next)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
