import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Volume2, 
  Bell, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Smartphone, 
  Save, 
  Database, 
  Sparkles,
  User,
  Sliders,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function SettingsPage() {
  const { 
    language, 
    toggleLanguage, 
    t, 
    speakText, 
    stopSpeaking,
    profile,
    speechSpeed,
    setSpeechSpeed,
    selectedVoiceGender,
    setSelectedVoiceGender,
    getActiveVoiceInfo,
    isSpeaking 
  } = useApp();

  // Silence speech synthesis immediately if settings page unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Local settings state
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large'
  const [autoRead, setAutoRead] = useState(false);
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    deadlineSms: true,
    dbtPaymentSms: true,
    fruitsSyncSms: true,
    whatsappUpdates: false
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSyncBhoomi = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    }, 1500);
  };

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const testVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const sample = language === 'kn'
      ? 'ನಮಸ್ಕಾರ! ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಧ್ವನಿ ಸಹಾಯಕ ಅಧಿಕೃತ ಭಾರತೀಯ ಧ್ವನಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.'
      : 'Namaskara! You are listening to Kisan Scheme Saathi in an authentic Indian English voice. All agricultural subsidies and direct benefit transfer details are ready.';
    speakText(sample);
  };

  const activeVoice = getActiveVoiceInfo();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader pageTitle={t.settings} />

      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Title Banner */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800 border border-stone-200 shadow-xs flex-shrink-0">
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-stone-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
                {t.settings}
              </h1>
              <p className="text-stone-500 text-xs md:text-sm mt-0.5">
                {language === 'kn'
                  ? 'ಭಾಷೆ, ಧ್ವನಿ ಸಹಾಯಕ, ಎಸ್‌ಎಂಎಸ್ ನೆನಪೋಲೆಗಳು ಮತ್ತು ಭೂಮಿ ಸಿಂಕ್ ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ'
                  : 'Manage language, speech synthesizer, SMS alerts, and Bhoomi sync preferences'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full sm:w-auto justify-center px-6 py-2.5 min-h-[44px] rounded-full bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Save confirmation toast */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!'
                : 'Preferences saved successfully! All updates applied.'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* SECTION 1: LANGUAGE & DISPLAY */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <Globe className="w-5 h-5 text-forest-800" />
              <h2 className="text-base sm:text-lg font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಭಾಷೆ ಮತ್ತು ಪ್ರದರ್ಶನ' : 'Language & Display'}
              </h2>
            </div>

            {/* Language Switcher */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {language === 'kn' ? 'ಪ್ರಾಥಮಿಕ ಭಾಷೆ' : 'Primary Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleLanguage('kn')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all min-h-[48px] ${
                    language === 'kn'
                      ? 'border-forest-900 bg-emerald-50/80 text-forest-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-left">
                    <span className="block text-sm">ಕನ್ನಡ</span>
                    <span className="text-[10px] text-stone-500 font-normal">Kannada (Regional)</span>
                  </div>
                  {language === 'kn' && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all min-h-[48px] ${
                    language === 'en'
                      ? 'border-forest-900 bg-emerald-50/80 text-forest-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-left">
                    <span className="block text-sm">English</span>
                    <span className="text-[10px] text-stone-500 font-normal">National Format</span>
                  </div>
                  {language === 'en' && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-1" />}
                </button>
              </div>
            </div>

            {/* Font Size Comfort Mode */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {language === 'kn' ? 'ಅಕ್ಷರದ ಗಾತ್ರ (ಹಿರಿಯ ರೈತರಿಗಾಗಿ)' : 'Font Scale (Comfort Mode)'}
              </label>
              <div className="flex gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`flex-1 py-2.5 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all flex items-center justify-center text-center ${
                    fontSize === 'normal'
                      ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {language === 'kn' ? 'ಸಾಮಾನ್ಯ (Standard)' : 'Standard (14px)'}
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`flex-1 py-2.5 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all flex items-center justify-center text-center ${
                    fontSize === 'large'
                      ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {language === 'kn' ? 'ದೊಡ್ಡ ಅಕ್ಷರ (Large 16px)' : 'Large (16px)'}
                </button>
              </div>
            </div>

          </div>

          {/* SECTION 2: INDIAN ACCENT VOICE & AUDIO ASSISTANT */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-sm space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2.5">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-serif-heading text-stone-900">
                    {language === 'kn' ? 'ಭಾರತೀಯ ಧ್ವನಿ ಸಹಾಯಕ' : 'Indian Voice & Speech Synthesizer'}
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    {language === 'kn' ? 'ಅಧಿಕೃತ ಭಾರತೀಯ ಧ್ವನಿ ಮತ್ತು ಉಚ್ಚಾರಣೆ' : 'Natural Indian English (en-IN) & Kannada (kn-IN) accent'}
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Indian Accent (en-IN)</span>
              </span>
            </div>

            {/* Active Voice Diagnostics Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">Active Voice Engine</span>
                <span className="font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                  {language === 'kn' ? 'ಕನ್ನಡ / ಭಾರತೀಯ ಧ್ವನಿ' : 'Indian English Dialect'}
                </span>
              </div>
              <p className="font-mono font-bold text-stone-900 text-sm">
                {activeVoice.name}
              </p>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                {language === 'kn'
                  ? 'ಕರ್ನಾಟಕದ ರೈತ ಸಮುದಾಯಕ್ಕಾಗಿ ಕೃಷಿ, ಬೆಳೆ ಮತ್ತು ಸಬ್ಸಿಡಿ ಪದಗಳ ನಿಖರ ಉಚ್ಚಾರಣೆಗೆ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.'
                  : 'Calibrated for natural Indian cadence, Indic phonetics, and scheme terms (Bhoomi RTC, FRUITS, PM-KISAN, Raitha Vidyanidhi).'}
              </p>
            </div>

            {/* Indian Voice Persona / Gender Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {language === 'kn' ? 'ಧ್ವನಿ ಮಾದರಿ (ಜೆಂಡರ್)' : 'Indian Accent Persona'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVoiceGender('female')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between min-h-[48px] ${
                    selectedVoiceGender === 'female'
                      ? 'border-forest-900 bg-emerald-50 text-forest-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <span className="block text-sm">Indian Female</span>
                    <span className="text-[10px] text-stone-500 font-normal">Heera / Neerja</span>
                  </div>
                  {selectedVoiceGender === 'female' && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVoiceGender('male')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between min-h-[48px] ${
                    selectedVoiceGender === 'male'
                      ? 'border-forest-900 bg-emerald-50 text-forest-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <span className="block text-sm">Indian Male</span>
                    <span className="text-[10px] text-stone-500 font-normal">Ravi / Prabhat</span>
                  </div>
                  {selectedVoiceGender === 'male' && <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 ml-1" />}
                </button>
              </div>
            </div>

            {/* Speech Rate Controls */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {language === 'kn' ? 'ಧ್ವನಿ ಓದುವ ವೇಗ' : 'Speech Speed Rate'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold">
                {[
                  { val: 0.8, label: language === 'kn' ? 'ನಿಧಾನ (0.8x)' : 'Slow (0.8x)' },
                  { val: 0.92, label: language === 'kn' ? 'ಸಾಮಾನ್ಯ (0.92x)' : 'Standard (0.92x)' },
                  { val: 1.1, label: language === 'kn' ? 'ವೇಗ (1.1x)' : 'Fast (1.1x)' }
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSpeechSpeed(item.val)}
                    className={`py-2.5 px-1.5 sm:px-3 min-h-[44px] rounded-xl border transition-all flex items-center justify-center text-center ${
                      Math.abs(speechSpeed - item.val) < 0.05
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-xs' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-read Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 gap-2">
              <div>
                <span className="font-bold text-stone-800 text-xs block">
                  {language === 'kn' ? 'ಪುಟ ತೆರೆದಾಗ ಸ್ವಯಂಚಾಲಿತ ಧ್ವನಿ ವಿವರಣೆ' : 'Auto-Read Scheme Summaries'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {language === 'kn' ? 'ಹೊಸ ಪುಟ ತೆರೆದಾಗ ಧ್ವನಿಯ ಮೂಲಕ ಓದಲಾಗುತ್ತದೆ' : 'Automatically speaks criteria when opening scheme pages'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRead}
                onChange={() => setAutoRead(!autoRead)}
                className="w-5 h-5 rounded text-forest-800 focus:ring-forest-800 cursor-pointer flex-shrink-0"
              />
            </div>

            {/* Voice Test Sample Button */}
            <button
              type="button"
              onClick={testVoice}
              className={`w-full py-3 px-4 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 ${
                isSpeaking 
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80'
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-800 flex-shrink-0" />
              <span>
                {isSpeaking
                  ? (language === 'kn' ? 'ಧ್ವನಿ ಚಾಲನೆಯಲ್ಲಿದೆ...' : 'Speaking in Indian Accent...')
                  : (language === 'kn' ? 'ಭಾರತೀಯ ಧ್ವನಿ ಮಾದರಿ ಪರೀಕ್ಷಿಸಿ (Test Audio)' : 'Test Indian Accent Voice Output')}
              </span>
            </button>
          </div>

          {/* SECTION 3: SMS ALERTS & NOTIFICATIONS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <Bell className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಎಸ್‌ಎಂಎಸ್ ಮತ್ತು ನೆನಪೋಲೆಗಳು' : 'SMS Alerts & Deadlines'}
              </h2>
            </div>

            <p className="text-stone-600 text-xs">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತದೆ.'
                : 'Direct SMS notifications dispatched to your verified mobile number.'}
            </p>

            <div className="space-y-3">
              {/* Item 1 */}
              <label className="flex items-start justify-between p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 cursor-pointer hover:bg-stone-100/60 transition-colors gap-2">
                <div className="pr-2">
                  <span className="font-bold text-stone-800 text-xs block">
                    {language === 'kn' ? 'ಬೆಳೆ ವಿಮೆ & ಗಡುವು ದಿನಾಂಕಗಳ ಎಚ್ಚರಿಕೆ' : 'Seasonal Cutoff & PMFBY Deadline Alerts'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {language === 'kn' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಕೊನೆಯ ದಿನಾಂಕಕ್ಕೆ 7 ದಿನಗಳ ಮೊದಲು ನೆನಪೋಲೆ' : 'SMS warning 7 days before seasonal insurance registration closes'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.deadlineSms}
                  onChange={() => toggleNotification('deadlineSms')}
                  className="w-5 h-5 rounded text-forest-800 focus:ring-forest-800 mt-1 cursor-pointer flex-shrink-0"
                />
              </label>

              {/* Item 2 */}
              <label className="flex items-start justify-between p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 cursor-pointer hover:bg-stone-100/60 transition-colors gap-2">
                <div className="pr-2">
                  <span className="font-bold text-stone-800 text-xs block">
                    {language === 'kn' ? 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಹಣ ಜಮಾ ಮಾಹಿತಿ' : 'Direct Benefit Transfer (DBT) Credit Alerts'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {language === 'kn' ? 'ಪಿಎಂ-ಕಿಸಾನ್ ಹಾಗೂ ಸಬ್ಸಿಡಿ ಮೊತ್ತ ಬ್ಯಾಂಕ್‌ಗೆ ಜಮೆಯಾದ ತಕ್ಷಣ ಮಾಹಿತಿ' : 'Instant notification when PM-KISAN or subsidies credit your bank account'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dbtPaymentSms}
                  onChange={() => toggleNotification('dbtPaymentSms')}
                  className="w-5 h-5 rounded text-forest-800 focus:ring-forest-800 mt-1 cursor-pointer flex-shrink-0"
                />
              </label>

              {/* Item 3 */}
              <label className="flex items-start justify-between p-3 sm:p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 cursor-pointer hover:bg-stone-100/60 transition-colors gap-2">
                <div className="pr-2">
                  <span className="font-bold text-stone-800 text-xs block">
                    {language === 'kn' ? 'ಹೊಸ ಯೋಜನೆಗಳ ಬಿಡುಗಡೆ ಎಚ್ಚರಿಕೆಗಳು' : 'New Scheme Launch Broadcasts'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆಯ ಹೊಸ ಸಬ್ಸಿಡಿಗಳ ವಿವರ' : 'Announcements for solar pumps, seed grants and equipment subsidies'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.fruitsSyncSms}
                  onChange={() => toggleNotification('fruitsSyncSms')}
                  className="w-5 h-5 rounded text-forest-800 focus:ring-forest-800 mt-1 cursor-pointer flex-shrink-0"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: DATA SYNC & REGISTRATION IDENTIFIERS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-stone-200/90 shadow-sm space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <Database className="w-5 h-5 text-emerald-800 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಭೂಮಿ ಮತ್ತು FRUITS ಡೇಟಾ ಲಿಂಕ್' : 'Bhoomi & FRUITS Integration'}
              </h2>
            </div>

            {/* Verified Farmer ID Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">FRUITS Farmer ID (FID)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Verified
                </span>
              </div>
              <div className="font-mono font-bold text-stone-900 text-sm">
                KA-FRUITS-2026-98124
              </div>

              <div className="pt-2 border-t border-stone-200 text-xs flex items-center justify-between">
                <span className="text-stone-500">Bhoomi RTC Survey Sync</span>
                <span className="font-bold text-stone-800">
                  {profile.taluk}, {profile.district}
                </span>
              </div>
            </div>

            {/* Sync Feedback Alert */}
            {syncSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {language === 'kn'
                    ? 'ಭೂಮಿ ಮತ್ತು FRUITS ಸರ್ವರ್‌ನೊಂದಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ!'
                    : 'Land records & FID synchronized with Karnataka Bhoomi server!'}
                </span>
              </div>
            )}

            {/* Sync Button */}
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncBhoomi}
              className="w-full py-2.5 px-4 min-h-[44px] rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-700 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing 
                  ? (language === 'kn' ? 'ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Syncing with Bhoomi...') 
                  : (language === 'kn' ? 'ಭೂಮಿ RTC ದಾಖಲೆಗಳನ್ನು ಮರು-ಸಿಂಕ್ ಮಾಡಿ' : 'Sync Bhoomi RTC Records Now')}
              </span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
