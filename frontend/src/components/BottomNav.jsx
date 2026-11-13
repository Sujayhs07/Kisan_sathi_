import React from 'react';
import { Home, CheckSquare, FileText, Bell, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { currentPage, setCurrentPage, reminders, isMobileMenuOpen, setIsMobileMenuOpen, language } = useApp();

  const reminderCount = Object.values(reminders || {}).filter(Boolean).length;

  const isTabActive = (tabId) => {
    if (tabId === 'eligibility') {
      return currentPage === 'eligibility' || currentPage === 'results';
    }
    if (tabId === 'explore') {
      return currentPage === 'explore' || currentPage === 'scheme-details';
    }
    return currentPage === tabId;
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      {/* 1. Dashboard / Home */}
      <button
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          setCurrentPage('dashboard');
        }}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
          isTabActive('dashboard')
            ? 'text-maroon-700 font-bold'
            : 'text-stone-600 hover:text-stone-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isTabActive('dashboard') ? 'bg-maroon-50' : ''}`}>
          <Home className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight truncate max-w-[64px]">
          {language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}
        </span>
      </button>

      {/* 2. Check Eligibility */}
      <button
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          setCurrentPage('eligibility');
        }}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
          isTabActive('eligibility')
            ? 'text-maroon-700 font-bold'
            : 'text-stone-600 hover:text-stone-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isTabActive('eligibility') ? 'bg-maroon-50' : ''}`}>
          <CheckSquare className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight truncate max-w-[64px]">
          {language === 'kn' ? 'ಅರ್ಹತೆ' : 'Eligibility'}
        </span>
      </button>

      {/* 3. Explore Schemes */}
      <button
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          setCurrentPage('explore');
        }}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
          isTabActive('explore')
            ? 'text-maroon-700 font-bold'
            : 'text-stone-600 hover:text-stone-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isTabActive('explore') ? 'bg-maroon-50' : ''}`}>
          <FileText className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight truncate max-w-[64px]">
          {language === 'kn' ? 'ಯೋಜನೆಗಳು' : 'Schemes'}
        </span>
      </button>

      {/* 4. Reminders */}
      <button
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          setCurrentPage('reminders');
        }}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all relative ${
          isTabActive('reminders')
            ? 'text-maroon-700 font-bold'
            : 'text-stone-600 hover:text-stone-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors relative ${isTabActive('reminders') ? 'bg-maroon-50' : ''}`}>
          <Bell className="w-5 h-5 stroke-[2]" />
          {reminderCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-maroon-700 rounded-full" />
          )}
        </div>
        <span className="text-[10px] tracking-tight truncate max-w-[64px]">
          {language === 'kn' ? 'ಜ್ಞಾಪನೆಗಳು' : 'Reminders'}
        </span>
      </button>

      {/* 5. Menu Drawer Toggle */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
          isMobileMenuOpen
            ? 'text-forest-900 font-bold'
            : 'text-stone-600 hover:text-stone-900 font-medium'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${isMobileMenuOpen ? 'bg-forest-100 text-forest-900' : ''}`}>
          <Menu className="w-5 h-5 stroke-[2]" />
        </div>
        <span className="text-[10px] tracking-tight truncate max-w-[64px]">
          {language === 'kn' ? 'ಮೆನು' : 'Menu'}
        </span>
      </button>
    </nav>
  );
}
