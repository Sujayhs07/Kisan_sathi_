import React from 'react';
import { 
  CheckSquare, 
  FileText, 
  Bell, 
  BookOpen, 
  User, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function DashboardPage() {
  const { setCurrentPage, profile, t, language } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans selection:bg-maroon-700 selection:text-white">
      <TopHeader />

      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-5 sm:space-y-7">
        
        {/* ======================================================== */}
        {/* Welcome Greeting Banner (Matches 03_Dashboard.png)       */}
        {/* ======================================================== */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-stone-200/70 p-5 sm:p-8 md:p-10 overflow-hidden shadow-xs flex flex-col justify-between min-h-[170px] sm:min-h-[220px]">
          
          {/* Right Farm Sunrise Illustration with smooth left gradient blend */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-5/12 lg:w-4/12 pointer-events-none overflow-hidden hidden sm:block">
            <img 
              src="/images/dashboard_banner_illustration_clean.png" 
              alt="Farm Sunrise Illustration" 
              className="w-full h-full object-cover object-left"
            />
            {/* Smooth gradient blend into the white card */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
          </div>

          {/* Left Text Content */}
          <div className="relative z-10 max-w-xl space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? `ನಮಸ್ಕಾರ, ${profile.name}` : `Namaskara, ${profile.name}`}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              {t.greetingSub}
            </p>

            {/* Discreet Farmer Verified Credentials Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>FRUITS: {profile.fruitsId || 'KA-FRUITS-2026-98124'}</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Bhoomi RTC: {profile.taluk || 'Hoskote'}, {profile.district || 'Bengaluru Rural'}</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                • Aadhaar DBT Linked
              </span>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* Top Row: 2 Primary Action Cards (03_Dashboard.png)       */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: Check Your Eligibility */}
          <div 
            onClick={() => setCurrentPage('eligibility')}
            className="group p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 sm:gap-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-[#E8F5E9] border border-emerald-200/70 flex items-center justify-center text-emerald-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-800 stroke-[1.8]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-1 group-hover:text-emerald-900 transition-colors">
                {t.checkEligibilityTitle}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {t.checkEligibilityDesc}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
          </div>

          {/* Card 2: Explore Schemes */}
          <div 
            onClick={() => setCurrentPage('explore')}
            className="group p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 sm:gap-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-[#FFF3E0] border border-amber-200/70 flex items-center justify-center text-amber-800 flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-amber-800 stroke-[1.8]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-1 group-hover:text-amber-900 transition-colors">
                {t.exploreSchemes}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {t.exploreSchemesDesc}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
          </div>

        </div>

        {/* ======================================================== */}
        {/* Bottom Row: 3 Secondary Utility Cards (03_Dashboard.png)  */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 3: My Reminders */}
          <div 
            onClick={() => setCurrentPage('reminders')}
            className="group p-5 sm:p-7 md:p-8 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[190px]"
          >
            <div className="mb-2.5 sm:mb-3 text-[#7C1A22] group-hover:scale-110 transition-transform">
              <Bell className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-1 group-hover:text-[#7C1A22] transition-colors">
              {t.myReminders}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              {t.remindersDesc}
            </p>
          </div>

          {/* Card 4: Application Guide */}
          <div 
            onClick={() => setCurrentPage('guide')}
            className="group p-5 sm:p-7 md:p-8 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[190px]"
          >
            <div className="mb-2.5 sm:mb-3 text-[#7C1A22] group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-1 group-hover:text-[#7C1A22] transition-colors">
              {t.applicationGuide}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              {t.appGuideDesc}
            </p>
          </div>

          {/* Card 5: My Profile */}
          <div 
            onClick={() => setCurrentPage('profile')}
            className="group p-5 sm:p-7 md:p-8 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[190px] sm:col-span-2 md:col-span-1"
          >
            <div className="mb-2.5 sm:mb-3 text-[#7C1A22] group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-1 group-hover:text-[#7C1A22] transition-colors">
              {t.myProfile}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm">
              {t.profileDesc}
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
