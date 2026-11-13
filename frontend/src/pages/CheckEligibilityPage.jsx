import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Bot, FileText, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';
import { getStates, getDistricts, getTaluks } from '../data/locationData';
import EligibilityChatbot from '../components/EligibilityChatbot';

export default function CheckEligibilityPage() {
  const { setCurrentPage, wizardStep, setWizardStep, wizardData, setWizardData, t, language, evaluateEligibility, isEvaluating } = useApp();
  const [mode, setMode] = useState('ai-chat'); // 'ai-chat' | 'form'

  const handleNext = async () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      // Evaluate dynamically against rules engine and navigate to results
      await evaluateEligibility(wizardData);
      setCurrentPage('results');
    }
  };

  const handleBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">

        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-stone-300/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ಯೋಜನೆಯ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check Scheme Eligibility'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              {mode === 'ai-chat'
                ? (language === 'kn'
                  ? 'ಕಿಸಾನ್ ಸಾಥಿ AI ಚಾಟ್‌ಬಾಟ್‌ನೊಂದಿಗೆ ಸಂವಾದ ನಡೆಸಿ ನಿಮ್ಮ ಅರ್ಹತೆಯನ್ನು ತಕ್ಷಣವೇ ತಿಳಿಯಿರಿ.'
                  : 'Chat with Kisan Saathi AI or use the step-by-step form to evaluate your schemes.')
                : (language === 'kn'
                  ? 'ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕೃಷಿಯ ಬಗ್ಗೆ ಕೆಲವು ಸರಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.'
                  : 'Answer a few simple questions about you and your farm.')}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="bg-stone-200/90 p-1 sm:p-1.5 rounded-2xl flex items-center w-full sm:w-auto border border-stone-300 shadow-xs">
            <button
              type="button"
              onClick={() => setMode('ai-chat')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative ${mode === 'ai-chat'
                ? 'bg-forest-800 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{language === 'kn' ? 'AI ಚಾಟ್‌ಬಾಟ್' : 'AI Assistant'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
            </button>

            <button
              type="button"
              onClick={() => setMode('form')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${mode === 'form'
                ? 'bg-white text-forest-900 shadow-md border border-stone-200'
                : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              <FileText className="w-4 h-4 text-forest-700" />
              <span>{language === 'kn' ? 'ಹಂತ-ಹಂತದ ಫಾರ್ಮ್' : 'Step Form'}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Interactive AI Chatbot */}
        {mode === 'ai-chat' ? (
          <EligibilityChatbot onSwitchToForm={() => setMode('form')} />
        ) : (
          /* MODE 2: Classic Step-by-Step Questionnaire Form */
          <>
            {/* Stepper matching 04_Eligibility_Questionnaire.png */}
            <div className="py-4">
              <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                {/* Background progress bar line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-300 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-forest-800 -translate-y-1/2 z-0 transition-all duration-300"
                  style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                />

                {/* Step 1 */}
                <div
                  onClick={() => setWizardStep(1)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-all ${wizardStep >= 1 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                    }`}>
                    {wizardStep > 1 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '1'}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold max-w-[65px] sm:max-w-none text-center leading-tight ${wizardStep === 1 ? 'text-forest-900' : 'text-stone-500'}`}>
                    {t.basicDetails}
                  </span>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setWizardStep(2)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-all ${wizardStep >= 2 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                    }`}>
                    {wizardStep > 2 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '2'}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold max-w-[65px] sm:max-w-none text-center leading-tight ${wizardStep === 2 ? 'text-forest-900' : 'text-stone-500'}`}>
                    {t.farmDetails}
                  </span>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => setWizardStep(3)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-all ${wizardStep >= 3 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                    }`}>
                    {wizardStep > 3 ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : '3'}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold max-w-[65px] sm:max-w-none text-center leading-tight ${wizardStep === 3 ? 'text-forest-900' : 'text-stone-500'}`}>
                    {t.additionalInfo}
                  </span>
                </div>

                {/* Step 4 */}
                <div
                  onClick={() => setWizardStep(4)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md transition-all ${wizardStep >= 4 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                    }`}>
                    4
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-bold max-w-[65px] sm:max-w-none text-center leading-tight ${wizardStep === 4 ? 'text-forest-900' : 'text-stone-500'}`}>
                    {t.review}
                  </span>
                </div>

              </div>
            </div>

            {/* Wizard Form Card matching 04_Eligibility_Questionnaire.png */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-8 md:p-10">

              {/* STEP 1: Basic Details */}
              {wizardStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold font-serif-heading text-maroon-700 mb-6">
                    {t.basicDetails}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Full Name */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.fullName} <span className="text-maroon-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={wizardData.fullName}
                        onChange={(e) => setWizardData({ ...wizardData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.age} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={wizardData.age}
                        onChange={(e) => setWizardData({ ...wizardData, age: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        {[...Array(60)].map((_, i) => (
                          <option key={i + 18} value={i + 18}>
                            {i + 18}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.gender} <span className="text-maroon-700">*</span>
                      </label>
                      <div className="flex items-center gap-4 py-3">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <label key={g} className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-800">
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={wizardData.gender === g}
                              onChange={(e) => setWizardData({ ...wizardData, gender: e.target.value })}
                              className="w-4 h-4 text-forest-800 focus:ring-forest-700 border-stone-300"
                            />
                            <span>{language === 'kn' ? (g === 'Male' ? 'ಪುರುಷ' : g === 'Female' ? 'ಮಹಿಳೆ' : 'ಇತರ') : g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.category} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={wizardData.category}
                        onChange={(e) => setWizardData({ ...wizardData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC (2A/2B/3A/3B)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.state || (language === 'kn' ? 'ರಾಜ್ಯ' : 'State')} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={wizardData.state || 'Karnataka'}
                        onChange={(e) => {
                          const newState = e.target.value;
                          const availableDistricts = getDistricts(newState);
                          const firstDist = availableDistricts[0] || '';
                          const availableTaluks = getTaluks(newState, firstDist);
                          const firstTaluk = availableTaluks[0] || '';
                          setWizardData({
                            ...wizardData,
                            state: newState,
                            district: firstDist,
                            taluk: firstTaluk
                          });
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getStates().map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District (Filtered by State) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.district} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={wizardData.district}
                        onChange={(e) => {
                          const newDist = e.target.value;
                          const availableTaluks = getTaluks(wizardData.state || 'Karnataka', newDist);
                          const firstTaluk = availableTaluks[0] || '';
                          setWizardData({
                            ...wizardData,
                            district: newDist,
                            taluk: firstTaluk
                          });
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getDistricts(wizardData.state || 'Karnataka').map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Taluk (Filtered by District) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {t.taluk} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={wizardData.taluk}
                        onChange={(e) => setWizardData({ ...wizardData, taluk: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getTaluks(wizardData.state || 'Karnataka', wizardData.district).map((taluk) => (
                          <option key={taluk} value={taluk}>{taluk}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2: Farm Details */}
              {wizardStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold font-serif-heading text-maroon-700 mb-6">
                    {t.farmDetails}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಒಟ್ಟು ಭೂಮಿ (ಎಕರೆಗಳಲ್ಲಿ)' : 'Total Land Holding (in Acres)'} *
                      </label>
                      <select
                        value={wizardData.landType}
                        onChange={(e) => {
                          const val = e.target.value;
                          let approx = '2.0';
                          if (val.includes('< 2.5')) approx = '2.0';
                          else if (val.includes('2.5 - 5')) approx = '3.5';
                          else if (val.includes('5 - 10')) approx = '7.5';
                          else if (val.includes('> 10')) approx = '12.0';
                          setWizardData({ ...wizardData, landType: val, landHolding: approx });
                        }}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Marginal (< 2.5 Acres)">Marginal Farmer (&lt; 2.5 Acres / &lt; 1 Hectare)</option>
                        <option value="Small (2.5 - 5 Acres)">Small Farmer (2.5 to 5 Acres / 1 to 2 Hectares)</option>
                        <option value="Medium (5 - 10 Acres)">Semi-Medium / Medium (5 to 10 Acres)</option>
                        <option value="Large (> 10 Acres)">Large Farmer (&gt; 10 Acres)</option>
                      </select>

                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-xs text-stone-600 font-semibold">{language === 'kn' ? 'ಖಚಿತ ಎಕರೆಗಳು:' : 'Exact Acres:'}</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={wizardData.landHolding || '2.0'}
                          onChange={(e) => {
                            const num = parseFloat(e.target.value) || 0;
                            let lType = 'Marginal (< 2.5 Acres)';
                            if (num > 10) lType = 'Large (> 10 Acres)';
                            else if (num > 5) lType = 'Medium (5 - 10 Acres)';
                            else if (num > 2.5) lType = 'Small (2.5 - 5 Acres)';
                            setWizardData({ ...wizardData, landHolding: e.target.value, landType: lType });
                          }}
                          className="w-24 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-bold text-xs focus:ring-2 focus:ring-forest-700 focus:outline-none"
                          placeholder="e.g. 2.0"
                        />
                        <span className="text-xs text-stone-500 font-bold">Acres</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ಬೆಳೆ ಪ್ರಕಾರ' : 'Primary Crop Sown'} *
                      </label>
                      <select
                        value={wizardData.cropType}
                        onChange={(e) => setWizardData({ ...wizardData, cropType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Ragi & Cereals">Ragi / Millets & Food Grains</option>
                        <option value="Paddy / Rice">Paddy / Rice</option>
                        <option value="Pulses & Oilseeds">Pulses (Tur, Gram) & Oilseeds</option>
                        <option value="Horticulture">Horticulture (Vegetables, Fruits, Flowers)</option>
                        <option value="Sugarcane / Cotton">Commercial (Sugarcane / Cotton)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ನೀರಾವರಿ ಸೌಲಭ್ಯ' : 'Irrigation Facility'} *
                      </label>
                      <select
                        value={wizardData.irrigationType}
                        onChange={(e) => setWizardData({ ...wizardData, irrigationType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Borewell & Rainfed">Borewell & Rainfed</option>
                        <option value="Pure Rainfed (Dryland)">Pure Rainfed (No Borewell)</option>
                        <option value="Canal / River Irrigated">Canal / River Source</option>
                        <option value="Drip / Micro-Irrigation">Drip / Micro-Irrigation Installed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'kn' ? 'ವಾರ್ಷಿಕ ಕೃಷಿ ಆದಾಯ' : 'Annual Agricultural Income'} *
                      </label>
                      <select
                        value={wizardData.annualIncome || 'Below 1 Lakh'}
                        onChange={(e) => setWizardData({ ...wizardData, annualIncome: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Below 1 Lakh">Below ₹1,00,000 / year</option>
                        <option value="1 - 2.5 Lakhs">₹1,00,000 - ₹2,50,000 / year</option>
                        <option value="Above 2.5 Lakhs">Above ₹2,50,000 / year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Additional Info */}
              {wizardStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold font-serif-heading text-maroon-700 mb-6">
                    {t.additionalInfo}
                  </h2>

                  <div className="space-y-4 max-w-2xl">
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wizardData.aadhaarLinked}
                        onChange={(e) => setWizardData({ ...wizardData, aadhaarLinked: e.target.checked })}
                        className="w-5 h-5 mt-0.5 text-forest-800 rounded focus:ring-forest-700 border-stone-300"
                      />
                      <div>
                        <span className="text-sm font-bold text-stone-900">
                          {language === 'kn' ? 'ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಖಾತೆ (NPCI ಸಕ್ರಿಯ)' : 'Aadhaar-linked Bank Account with Direct Benefit Transfer (DBT)'}
                        </span>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {language === 'kn' ? 'ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳನ್ನು ನೇರವಾಗಿ ಸ್ವೀಕರಿಸಲು ಇದು ಕಡ್ಡಾಯವಾಗಿದೆ.' : 'Mandatory for direct payment credit from government schemes.'}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wizardData.fruitsRegistered}
                        onChange={(e) => setWizardData({ ...wizardData, fruitsRegistered: e.target.checked })}
                        className="w-5 h-5 mt-0.5 text-forest-800 rounded focus:ring-forest-700 border-stone-300"
                      />
                      <div>
                        <span className="text-sm font-bold text-stone-900">
                          {language === 'kn' ? 'ಕರ್ನಾಟಕ FRUITS ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿತ ರೈತರು (FID)' : 'Registered on Karnataka FRUITS Portal (Farmer FID Active)'}
                        </span>
                        <p className="text-xs text-stone-600 mt-0.5">
                          FID: FID-KA-2024-88392 (Verified with Bhoomi RTC)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: Review */}
              {wizardStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold font-serif-heading text-maroon-700 mb-6">
                    {language === 'kn' ? 'ವಿವರಗಳ ಪರಿಶೀಲನೆ' : 'Review Your Details'}
                  </h2>

                  <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200/80 mb-6 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-stone-500 uppercase">{t.fullName}:</span>
                        <p className="font-bold text-stone-900">{wizardData.fullName}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">{t.age} & {t.gender}:</span>
                        <p className="font-bold text-stone-900">{wizardData.age} Yrs, {wizardData.gender}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">{t.category}:</span>
                        <p className="font-bold text-stone-900">{wizardData.category}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">{t.state || 'State'} / {t.district}:</span>
                        <p className="font-bold text-stone-900">{wizardData.state || 'Karnataka'}, {wizardData.district} ({wizardData.taluk})</p>
                      </div>
                    </div>

                    <div className="border-t border-amber-200/60 pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-stone-500 uppercase">Land Type:</span>
                        <p className="font-bold text-stone-900">{wizardData.landType}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">Crop:</span>
                        <p className="font-bold text-stone-900">{wizardData.cropType}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">Irrigation:</span>
                        <p className="font-bold text-stone-900">{wizardData.irrigationType}</p>
                      </div>
                      <div>
                        <span className="text-xs text-stone-500 uppercase">Annual Income:</span>
                        <p className="font-bold text-stone-900">{wizardData.annualIncome || 'Below 1 Lakh'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                    <span>
                      {language === 'kn'
                        ? 'ಅರ್ಹತಾ ಇಂಜಿನ್ ಸಿದ್ಧವಾಗಿದೆ. ಕ್ಲಿಕ್ ಮಾಡಿದ ನಂತರ ತಕ್ಷಣವೇ ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳು ಸಿಗುತ್ತವೆ.'
                        : 'The Rules Engine is ready to evaluate 9 central and Karnataka state schemes.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
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
                  disabled={isEvaluating}
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 ml-auto"
                >
                  <span>
                    {isEvaluating
                      ? (language === 'kn' ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Evaluating Schemes...')
                      : (wizardStep === 4 ? (language === 'kn' ? 'ಫಲಿತಾಂಶ ನೋಡಿ' : 'Evaluate & View Results') : t.next)}
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
