import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Volume2, User, Globe, Settings, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopHeader({ pageTitle = '' }) {
  const {
    language,
    toggleLanguage,
    profile,
    setCurrentPage,
    speakText,
    stopSpeaking,
    t,
    isSpeaking,
    setIsMobileMenuOpen
  } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  // Stop speaking if header unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return (
    <header className="h-16 px-3 sm:px-6 md:px-8 bg-cream-100 border-b border-stone-200/70 flex items-center justify-between select-none sticky top-0 z-20">

      {/* Left: Mobile Menu Hamburger + Page Title / Mobile Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu Toggle (Mobile only) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-1 sm:ml-0 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-200/70 transition-colors md:hidden flex items-center justify-center active:scale-95"
          title="Open Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-stone-800" />
        </button>

        {/* Mobile Brand Logo if on dashboard or no title */}
        <div
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-2 cursor-pointer md:hidden"
        >
          <img
            src="/logo-emblem.png"
            alt="Kisan Saathi"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
          <span className="font-serif-heading font-bold text-stone-900 text-sm tracking-tight truncate max-w-[130px]">
            {pageTitle || 'Kisan Saathi'}
          </span>
        </div>

        {/* Desktop Page Title */}
        {pageTitle && (
          <h2 className="text-lg font-bold text-stone-800 hidden md:block">
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto">
        {/* Voice Read Aloud Button with Indian Accent */}
        <button
          type="button"
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
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all active:scale-95 ${isSpeaking
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
            : 'bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 border-emerald-300/60'
            }`}
          title={isSpeaking ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop voice') : t.listenAudio}
          aria-label="Listen audio narration"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-emerald-700'}`} />
          <span className="hidden sm:inline">
            {isSpeaking
              ? (language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop')
              : t.listenAudio}
          </span>
        </button>

        {/* Language Switch Pill: [ಕನ್ನಡ | English] */}
        <div className="flex items-center p-0.5 sm:p-1 bg-stone-200/80 rounded-full border border-stone-300/80 shadow-inner">
          <button
            type="button"
            onClick={() => toggleLanguage('kn')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 ${language === 'kn'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
              }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            type="button"
            onClick={() => toggleLanguage('en')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 ${language === 'en'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-700 hover:text-stone-950'
              }`}
          >
            English
          </button>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setCurrentPage('reminders')}
          className="relative p-1.5 sm:p-2 rounded-full text-stone-700 hover:bg-stone-200/70 transition-colors"
          title="Notifications & Deadlines"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-stone-800" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-maroon-700 rounded-full border-2 border-cream-100" />
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 sm:gap-2.5 py-1 px-1 sm:px-2 rounded-full hover:bg-stone-200/60 transition-colors"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            {/* Official Brand Farmer Avatar */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border-2 border-emerald-600/40 shadow-xs overflow-hidden flex items-center justify-center p-0.5">
              <img
                src="/logo-emblem.png"
                alt="Farmer Profile"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-stone-800 hidden md:inline truncate max-w-[120px]">
              {profile.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-stone-100 sm:hidden">
                <p className="text-xs font-bold text-stone-900 truncate">{profile.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{profile.district || 'Karnataka'}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('profile');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span>{t.myProfile}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('settings');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-stone-500" />
                <span>{t.settings}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('login');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm text-maroon-700 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100 font-semibold"
              >
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
