import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Bot, FileText, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';
import { getStates, getDistricts, getTaluks } from '../data/locationData';
import EligibilityChatbot from '../components/EligibilityChatbot';

export default function CheckEligibilityPage() {
  const { setCurrentPage, wizardStep, setWizardStep, wizardData, setWizardData, t, language } = useApp();
  const [mode, setMode] = useState('ai-chat'); // 'ai-chat' | 'form'

  const handleNext = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      // Evaluate and go to results
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

      <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
        
        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-300/80">
          <div>
            <h1 className="text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ಯೋಜನೆಯ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check Scheme Eligibility'}
            </h1>
            <p className="text-stone-600 text-sm mt-1">
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
          <div className="bg-stone-200/90 p-1.5 rounded-2xl flex items-center self-start md:self-auto border border-stone-300 shadow-sm">
            <button
              type="button"
              onClick={() => setMode('ai-chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative ${
                mode === 'ai-chat' 
                  ? 'bg-forest-800 text-white shadow-md' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{language === 'kn' ? '🤖 AI ಚಾಟ್‌ಬಾಟ್' : '🤖 AI Saathi Assistant'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setMode('form')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                mode === 'form' 
                  ? 'bg-white text-forest-900 shadow-md border border-stone-200' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4 text-forest-700" />
              <span>{language === 'kn' ? '📋 ಹಂತ-ಹಂತದ ಫಾರ್ಮ್' : '📋 Step-by-Step Form'}</span>
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                    wizardStep >= 1 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {wizardStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${wizardStep === 1 ? 'text-forest-900' : 'text-stone-600'}`}>
                    {t.basicDetails}
                  </span>
                </div>

                {/* Step 2 */}
                <div 
                  onClick={() => setWizardStep(2)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                    wizardStep >= 2 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {wizardStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${wizardStep === 2 ? 'text-forest-900' : 'text-stone-600'}`}>
                    {t.farmDetails}
                  </span>
                </div>

                {/* Step 3 */}
                <div 
                  onClick={() => setWizardStep(3)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                    wizardStep >= 3 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {wizardStep > 3 ? <Check className="w-5 h-5" /> : '3'}
                  </div>
                  <span className={`text-xs mt-2 font-bold ${wizardStep === 3 ? 'text-forest-900' : 'text-stone-600'}`}>
                    {t.additionalInfo}
                  </span>
                </div>

                {/* Step 4 */}
                <div 
                  onClick={() => setWizardStep(4)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                    wizardStep >= 4 ? 'bg-forest-800 text-white ring-4 ring-forest-100' : 'bg-stone-200 text-stone-600'
                  }`}>
                    4
                  </div>
                  <span className={`text-xs mt-2 font-bold ${wizardStep === 4 ? 'text-forest-900' : 'text-stone-600'}`}>
                    {t.review}
                  </span>
                </div>

              </div>
            </div>

            {/* Wizard Form Card matching 04_Eligibility_Questionnaire.png */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-8 md:p-10">
              
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
                        onChange={(e) => setWizardData({ ...wizardData, landType: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                      >
                        <option value="Marginal (< 2.5 Acres)">Marginal Farmer (&lt; 2.5 Acres / &lt; 1 Hectare)</option>
                        <option value="Small (2.5 - 5 Acres)">Small Farmer (2.5 to 5 Acres / 1 to 2 Hectares)</option>
                        <option value="Medium (5 - 10 Acres)">Semi-Medium / Medium (5 to 10 Acres)</option>
                        <option value="Large (> 10 Acres)">Large Farmer (&gt; 10 Acres)</option>
                      </select>
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

                    <div className="border-t border-amber-200/60 pt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-maroon-700 hover:bg-maroon-800 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 ml-auto"
                >
                  <span>{wizardStep === 4 ? (language === 'kn' ? 'ಫಲಿತಾಂಶ ನೋಡಿ' : 'Evaluate & View Results') : t.next}</span>
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
