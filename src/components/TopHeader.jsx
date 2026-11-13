import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Volume2, User, Globe, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopHeader({ pageTitle = '' }) {
  const { language, toggleLanguage, profile, setCurrentPage, speakText, stopSpeaking, t, isSpeaking } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  // Stop speaking if header unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return (
    <header className="h-16 px-8 bg-cream-100 border-b border-stone-200/70 flex items-center justify-between select-none sticky top-0 z-20">
      {/* Optional Left Page Title Indicator on Mobile/Desktop */}
      <div className="flex items-center gap-3">
        {pageTitle && (
          <h2 className="text-lg font-bold text-stone-800 hidden md:block">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Voice Read Aloud Button with Indian Accent */}
        <button
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
              return;
            }
            const pageSpeech = language === 'kn' 
              ? 'ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಪೋರ್ಟಲ್ ಗೆ ಸ್ವಾಗತ. ಯೋಜನೆಗಳ ವಿವರ ಮತ್ತು ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ.' 
              : 'Welcome to Kisan Scheme Saathi. Explore government schemes and calculate your eligibility.';
            speakText(pageSpeech);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all active:scale-95 ${
            isSpeaking 
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
              : 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 border-emerald-300/60'
          }`}
          title={isSpeaking ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop voice') : t.listenAudio}
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-emerald-700'}`} />
          <span className="hidden sm:inline">
            {isSpeaking 
              ? (language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop') 
              : t.listenAudio}
          </span>
        </button>

        {/* Language Switch Pill: [ಕನ್ನಡ | English] matching design */}
        <div className="flex items-center p-1 bg-stone-200/80 rounded-full border border-stone-300/80 shadow-inner">
          <button
            onClick={() => toggleLanguage('kn')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
              language === 'kn'
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => toggleLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
              language === 'en'
                ? 'bg-forest-900 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            English
          </button>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setCurrentPage('reminders')}
          className="relative p-2 rounded-full text-stone-700 hover:bg-stone-200/70 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-stone-800" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-maroon-700 rounded-full border-2 border-cream-100" />
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 py-1 px-2 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            {/* Official Brand Farmer Avatar */}
            <div className="w-9 h-9 rounded-full bg-white border-2 border-emerald-600/40 shadow-xs overflow-hidden flex items-center justify-center p-0.5">
              <img 
                src="/logo-emblem.png" 
                alt="Farmer Profile" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-stone-800 hidden sm:inline">
              {profile.name}
            </span>
            <ChevronDown className="w-4 h-4 text-stone-600" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-30">
              <button
                onClick={() => {
                  setCurrentPage('profile');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-stone-500" />
                {t.myProfile}
              </button>
              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-stone-500" />
                {t.settings}
              </button>
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
