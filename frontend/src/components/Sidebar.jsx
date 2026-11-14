import React from 'react';
import { 
  Home, 
  CheckSquare, 
  FileText, 
  Bell, 
  BookOpen, 
  User, 
  Settings, 
  LogOut,
  X,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

export default function Sidebar() {
  const { currentPage, setCurrentPage, isMobileMenuOpen, setIsMobileMenuOpen, t, language, logoutUser } = useApp();

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'eligibility', label: t.checkEligibility, icon: CheckSquare },
    { id: 'explore', label: t.exploreSchemes, icon: FileText },
    { id: 'reminders', label: t.myReminders, icon: Bell },
    { id: 'guide', label: t.applicationGuide, icon: BookOpen },
    { id: 'profile', label: t.myProfile, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  const isActive = (itemId) => {
    if (itemId === 'eligibility' && (currentPage === 'eligibility' || currentPage === 'results')) {
      return true;
    }
    if (itemId === 'explore' && (currentPage === 'explore' || currentPage === 'scheme-details')) {
      return true;
    }
    return currentPage === itemId;
  };

  const handleNavClick = (itemId) => {
    setIsMobileMenuOpen(false);
    setCurrentPage(itemId);
  };

  const renderNavContent = () => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-forest-800/60 flex items-center justify-between">
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Logo variant="dark" />
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 rounded-xl text-forest-300 hover:text-white hover:bg-forest-800 transition-colors md:hidden"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 sm:py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-98 ${
                active
                  ? 'bg-maroon-700 text-white shadow-md font-semibold'
                  : 'text-forest-100/90 hover:bg-forest-800/70 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-forest-300'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Helpline banner inside drawer */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-2xl bg-forest-800/80 border border-forest-600/60 text-xs text-forest-200 flex items-center gap-2.5">
        <PhoneCall className="w-4 h-4 text-[#F5DABF] flex-shrink-0" />
        <div>
          <span className="block text-xs text-[#F5DABF] font-bold uppercase tracking-wider">
            {language === 'kn' ? 'ಕಿಸಾನ್ ಸಹಾಯವಾಣಿ' : 'Kisan Helpline'}
          </span>
          <span className="font-extrabold text-white text-sm sm:text-base tracking-wide">1800-180-1551</span>
        </div>
      </div>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-forest-800/60">
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            logoutUser();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-forest-200/80 hover:bg-forest-800/70 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 text-forest-300" />
          <span>{t.logout}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 bg-forest-900 text-stone-200 flex-col min-h-screen flex-shrink-0 select-none shadow-xl border-r border-forest-800 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside 
            className="relative w-72 max-w-[82vw] bg-forest-900 text-stone-200 flex flex-col h-full shadow-2xl z-10 border-r border-forest-800"
          >
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
}
