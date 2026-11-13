import React from 'react';
import { 
  Home, 
  CheckSquare, 
  FileText, 
  Bell, 
  BookOpen, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

export default function Sidebar() {
  const { currentPage, setCurrentPage, t, language } = useApp();

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'eligibility', label: t.checkEligibility, icon: CheckSquare },
    { id: 'explore', label: t.exploreSchemes, icon: FileText },
    { id: 'reminders', label: t.myReminders, icon: Bell },
    { id: 'guide', label: t.applicationGuide, icon: BookOpen },
    { id: 'profile', label: t.myProfile, icon: User },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  // Helper to determine active state
  const isActive = (itemId) => {
    if (itemId === 'eligibility' && (currentPage === 'eligibility' || currentPage === 'results')) {
      return true;
    }
    if (itemId === 'explore' && (currentPage === 'explore' || currentPage === 'scheme-details')) {
      return true;
    }
    return currentPage === itemId;
  };

  return (
    <aside className="w-64 bg-forest-900 text-stone-200 flex flex-col min-h-screen flex-shrink-0 select-none shadow-xl border-r border-forest-800">
      {/* Brand Header */}
      <div 
        onClick={() => setCurrentPage('dashboard')}
        className="p-5 border-b border-forest-800/60 cursor-pointer hover:bg-forest-800/30 transition-colors"
      >
        <Logo variant="dark" />
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                active
                  ? 'bg-maroon-700 text-white shadow-md font-semibold'
                  : 'text-emerald-100/90 hover:bg-forest-800/70 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-emerald-300'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-forest-800/60">
        <button
          onClick={() => setCurrentPage('login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-200/80 hover:bg-forest-800/70 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 text-emerald-300" />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
