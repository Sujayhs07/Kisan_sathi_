import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Mic, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Volume2,
  ShieldCheck,
  Landmark,
  Droplets,
  CreditCard,
  Sparkles,
  MapPin,
  Bell,
  Users,
  Award,
  ChevronRight,
  PhoneCall,
  Check,
  Info,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import RubberSegment from '../components/RubberSegment';

export default function LandingPage() {
  const { setCurrentPage, language, toggleLanguage, t, speakText, stopSpeaking, isSpeaking, navigateToAuth } = useApp();
  const [activeNav, setActiveNav] = useState('home');

  // Silence speech synthesis immediately if landing page unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'solutions', 'features', 'home'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        if (section === 'home') {
          if (window.scrollY < 300) {
            setActiveNav('home');
            break;
          }
        } else {
          const el = document.getElementById(section);
          if (el && el.offsetTop <= scrollPosition) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -75;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col overflow-x-hidden font-sans selection:bg-[#7C1A22] selection:text-white scroll-smooth">
      
      {/* Top Government-Grade Utility Ribbon */}
      <div className="bg-[#051C12] text-emerald-200/90 text-[11px] font-medium py-1.5 px-6 md:px-12 border-b border-emerald-900/60 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇ-ಆಡಳಿತ ಉಪಕ್ರಮ' : 'Karnataka Agriculture E-Governance Initiative'}
          </span>
          <span className="text-emerald-700">•</span>
          <span className="text-emerald-300/80">
            {language === 'kn' ? 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಸಹಾಯಕ' : 'Direct Benefit Transfer (DBT) Enabler'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-emerald-300/80">
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>Kisan Call Center: <strong>1800-180-1551</strong> (Toll Free)</span>
          </span>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header className="px-6 md:px-12 py-3.5 flex items-center justify-between bg-[#FBF9F5]/95 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200/80 shadow-xs">
        <div onClick={() => scrollToSection('home')} className="cursor-pointer">
          <Logo variant="light" />
        </div>

        {/* Center Navigation Links with RubberSegment from React Bits */}
        <nav className="hidden md:flex items-center">
          <RubberSegment
            items={[
              { value: 'home', label: t.home },
              { value: 'features', label: t.features },
              { value: 'solutions', label: t.solutions },
              { value: 'about', label: t.about }
            ]}
            value={activeNav}
            onChange={(val) => scrollToSection(val)}
            trackColor="#EBE7DE"
            thumbColor="#7C1A22"
            textColor="#3D3A36"
            activeTextColor="#FFFFFF"
            size="md"
            radius={20}
            inset={3}
            equalSlots={false}
            stretch={80}
            squash={3}
            speed={1}
            glide={60}
            draggable
            aria-label="Landing page sections"
          />
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Language Switcher Pill */}
          <div className="flex items-center p-0.5 bg-stone-200/90 rounded-full border border-stone-300 shadow-inner">
            <button
              onClick={() => toggleLanguage('kn')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'kn' ? 'bg-[#051C12] text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'en' ? 'bg-[#051C12] text-white shadow-xs' : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => navigateToAuth('dashboard', 'login')}
            className="px-5 py-2 rounded-full border border-[#7C1A22] text-[#7C1A22] hover:bg-red-50 text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            {t.login}
          </button>

          <button
            onClick={() => navigateToAuth('dashboard', 'register')}
            className="px-5 py-2 rounded-full bg-[#7C1A22] hover:bg-[#66151C] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            {t.getStarted}
          </button>
        </div>
      </header>

      {/* Mobile Sticky Section Navigation Strip */}
      <div className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBF9F5]/95 border-b border-stone-200/90 text-xs font-bold sticky top-[61px] z-30 backdrop-blur-md">
        {[
          { id: 'home', label: t.home },
          { id: 'features', label: t.features },
          { id: 'solutions', label: t.solutions },
          { id: 'about', label: t.about }
        ].map(sec => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeNav === sec.id 
                ? 'bg-[#7C1A22] text-white shadow-xs' 
                : 'text-stone-700 hover:text-stone-950 bg-stone-200/60'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: HERO CONTAINER matching 01_Landing_Page.png */}
      <section id="home" className="max-w-7xl w-full mx-auto p-4 md:p-8 pt-6 md:pt-8">
        <div className="w-full relative rounded-3xl md:rounded-[36px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(5,28,18,0.25)] border border-stone-300/80 min-h-[580px] lg:min-h-[640px] flex flex-col lg:flex-row bg-[#042418]">

          {/* Right Photograph Area */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[54%] xl:w-[52%] z-0 h-72 lg:h-full overflow-hidden">
            <img
              src="/farmer-sunset-cropped.jpg"
              alt="Farmer plowing agricultural land with oxen at sunset"
              className="w-full h-full object-cover object-center scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
            />
            {/* Subtle atmospheric vignette */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#042418] via-[#042418]/80 to-transparent pointer-events-none" />
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-[#042418] via-[#042418]/85 to-transparent pointer-events-none" />
          </div>

          {/* Left Content Column */}
          <div className="relative z-10 w-full lg:w-[52%] xl:w-[50%] p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[580px] lg:min-h-[640px] bg-[#042418]">
            <div>
              {/* Official Portal Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-amber-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'kn' ? 'ರೈತರಿಗಾಗಿ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : 'Official Government Schemes for Farmers'}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold font-serif-heading text-amber-50 tracking-tight leading-[1.1] mb-5">
                Kisan Scheme <br />
                <span className="text-amber-400">Saathi</span>
              </h1>

              {/* Subtitle */}
              <p className="text-emerald-100/85 text-sm md:text-base lg:text-lg leading-relaxed max-w-lg mb-8 font-normal">
                {t.tagline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={() => navigateToAuth('eligibility', 'register')}
                  className="px-7 py-3.5 rounded-full bg-[#7C1A22] hover:bg-[#66151C] text-white font-semibold text-sm md:text-base flex items-center gap-2.5 shadow-lg shadow-black/30 active:scale-95 transition-all"
                >
                  <span>{t.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('features')}
                  className="px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-emerald-100 hover:text-white font-semibold text-sm md:text-base border border-emerald-400/30 backdrop-blur-md transition-all active:scale-95"
                >
                  {t.learnMore}
                </button>

                {/* Voice Read-Aloud Button */}
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(t.tagline);
                    }
                  }}
                  className={`p-3.5 rounded-full transition-all shadow-md active:scale-95 ${
                    isSpeaking 
                      ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-300/40 shadow-lg' 
                      : 'bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 border border-emerald-500/40'
                  }`}
                  title={isSpeaking ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop audio') : (language === 'kn' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen in chosen language')}
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bottom 4 Feature Pills matching original design */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-emerald-800/60 mt-auto">
              <div 
                onClick={() => speakText(t.voiceSupport)}
                className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-900/80 group-hover:bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-amber-300 transition-colors shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-emerald-200 group-hover:text-white transition-colors">
                  {t.voiceSupport}
                </span>
              </div>

              <div 
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-900/80 group-hover:bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-amber-300 transition-colors shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-emerald-200 group-hover:text-white transition-colors">
                  {t.checkEligibility}
                </span>
              </div>

              <div 
                onClick={() => navigateToAuth('explore', 'login')}
                className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-900/80 group-hover:bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-amber-300 transition-colors shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-emerald-200 group-hover:text-white transition-colors">
                  {t.documentChecklist}
                </span>
              </div>

              <div 
                onClick={() => navigateToAuth('explore', 'login')}
                className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-900/80 group-hover:bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-amber-300 transition-colors shadow-xs">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-emerald-200 group-hover:text-white transition-colors">
                  {t.applyOfficially}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Trust & Transparency Strip */}
      <section className="max-w-7xl w-full mx-auto px-6 md:px-12 py-6">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-stone-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'kn' ? '100% ಉಚಿತ ಸಾರ್ವಜನಿಕ ಸೇವೆ' : '100% Free Public Platform'}</span>
          </div>
          <div className="hidden sm:block text-stone-300">|</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'kn' ? 'ಕರ್ನಾಟಕ ಭೂಮಿ RTC ಮತ್ತು FRUITS ಹೊಂದಾಣಿಕೆ' : 'Karnataka Bhoomi RTC & FRUITS Compliant'}</span>
          </div>
          <div className="hidden sm:block text-stone-300">|</div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'kn' ? 'ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ • ನೇರ ಬ್ಯಾಂಕ್ DBT ವರ್ಗಾವಣೆ' : 'Zero Middlemen • Direct DBT Bank Credit'}</span>
          </div>
          <div className="hidden sm:block text-stone-300">|</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{language === 'kn' ? '31 ಜಿಲ್ಲೆಗಳು & 240+ ತಾಲೂಕುಗಳು' : 'All 31 Karnataka Districts'}</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: BENTO-GRID FEATURES ARCHITECTURE */}
      <section id="features" className="max-w-7xl w-full mx-auto px-4 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-md">
            {language === 'kn' ? 'ವೇದಿಕೆಯ ಪ್ರಮುಖ ಸಾಮರ್ಥ್ಯಗಳು' : 'Core Capabilities'}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif-heading font-bold text-stone-900 tracking-tight mt-3 mb-3">
            {language === 'kn'
              ? 'ರೈತರಿಗಾಗಿ ನಿಖರ ಮತ್ತು ಸರಳ ತಂತ್ರಜ್ಞಾನ'
              : 'Engineered for Practical Grassroots Accessibility'}
          </h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            {language === 'kn'
              ? 'ಸರ್ಕಾರಿ ಕಚೇರಿಗಳಿಗೆ ಅಲೆಯುವುದನ್ನು ತಪ್ಪಿಸಿ. ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಜಮೀನಿನ ವಿವರಗಳಿಗೆ ತಕ್ಕಂತೆ ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ನಿಮಿಷಗಳಲ್ಲಿ ಗುರುತಿಸುತ್ತದೆ.'
              : 'Eliminating paperwork anxiety and commission exploitation through automated rule-matching, regional voice synthesis, and direct portal integration.'}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Large Span-2 - Smart Eligibility Engine */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-6 border border-emerald-100">
                <Sparkles className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-stone-900 mb-2">
                {language === 'kn' ? 'ಬುದ್ಧಿವಂತ ಅರ್ಹತಾ ಪರಿಶೀಲನಾ ಎಂಜಿನ್' : 'Automated Rules-Based Eligibility Matcher'}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed max-w-xl mb-6">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಸಣ್ಣ/ಅತಿ ಸಣ್ಣ), ಬೆಳೆಯ ವರ್ಗ (ಸಿರಿಧಾನ್ಯ/ತರಕಾರಿ), ನೀರಾವರಿ ಮೂಲ ಮತ್ತು ಸಮುದಾಯ ವರ್ಗವನ್ನು ಆಧರಿಸಿ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಗಳ 15ಕ್ಕೂ ಹೆಚ್ಚು ಯೋಜನೆಗಳ ನಿಯಮಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ.'
                  : 'Instead of searching through dense PDF notifications, our automated engine checks your landholding size, crop pattern, irrigation type, and category against 15+ central and Karnataka state gazettes in real time.'}
              </p>

              {/* Simulated criteria chips */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-700">
                <span className="px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200">
                  Land Holding &lt; 2.5 Acres
                </span>
                <span className="px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200">
                  Dryland & Borewell
                </span>
                <span className="px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200">
                  Ragi & Cereals
                </span>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300">
                  ✓ Matched 4 Schemes
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950"
              >
                <span>{t.checkEligibility}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-stone-400">Step-by-step questionnaire</span>
            </div>
          </div>

          {/* Card 2: Interactive Voice Read-Aloud */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-6 border border-amber-100">
                <Volume2 className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
                {language === 'kn' ? 'ದ್ವಿಭಾಷಾ ಧ್ವನಿ ಬೆಂಬಲ' : 'Bilingual Voice Readout'}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {language === 'kn'
                  ? 'ಯಾವುದೇ ಯೋಜನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಆಲಿಸಿ. ಓದುವ ಅಗತ್ಯವಿಲ್ಲದೆ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ನಿಯಮಗಳನ್ನು ಧ್ವನಿಯ ಮೂಲಕ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.'
                  : 'Engineered for elderly farmers and those with limited literacy. Every scheme criteria and deadline can be read aloud in natural Kannada or English.'}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speakText(language === 'kn' ? 'ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಮಗೆ ಯಾವ ಯೋಜನೆಯ ಮಾಹಿತಿ ಬೇಕು?' : 'Kisan Scheme Saathi voice assistant is active. How can we help your farm?');
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border ${
                  isSpeaking
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-emerald-700'}`} />
                <span>
                  {isSpeaking 
                    ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop Audio') 
                    : (language === 'kn' ? 'ಧ್ವನಿ ಮಾದರಿ ಆಲಿಸಿ' : 'Sample Voice Audio')}
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: District and Taluk Precision */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-maroon-700 flex items-center justify-center mb-6 border border-red-100">
                <MapPin className="w-6 h-6 text-[#7C1A22]" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
                {language === 'kn' ? '31 ಜಿಲ್ಲೆಗಳು & ತಾಲೂಕು ಮ್ಯಾಪಿಂಗ್' : 'District & Taluk Localization'}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {language === 'kn'
                  ? 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ತಾಲೂಕುಗಳಿಗೆ ಪ್ರತ್ಯೇಕ ಹೊಂದಾಣಿಕೆ. ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ಇಲಾಖೆ (RSK) ಕಚೇರಿಯ ಮಾರ್ಗದರ್ಶನ.'
                  : 'Granular mapping down to taluk-level agricultural offices (Raitha Samparka Kendras) across all 31 districts of Karnataka.'}
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 text-xs font-semibold text-stone-500">
              Hierarchical State → District → Taluk dropdowns
            </div>
          </div>

          {/* Card 4: Document Verification Checklist */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-6 border border-emerald-100">
                <FileText className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
                {language === 'kn' ? 'ದಾಖಲೆಗಳ ಸಿದ್ಧತಾ ಪಟ್ಟಿ' : 'Document Readiness Checklist'}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {language === 'kn'
                  ? 'ಆಧಾರ್, ಪಹಣಿ/RTC, ಬ್ಯಾಂಕ್ DBT ಸೀಡಿಂಗ್ ಮತ್ತು FRUITS FID ಪಟ್ಟಿಯನ್ನು ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲೇ ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಿ.'
                  : 'Clear checklists for Aadhaar NPCI seeding, Bhoomi RTC land titles, and FRUITS Farmer IDs before visiting Grama One centers.'}
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => navigateToAuth('explore', 'login')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ' : 'Check Required Docs'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 5: Upcoming Deadlines & Calendar */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-6 border border-amber-100">
                <Bell className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
                {language === 'kn' ? 'ಗಡುವು ಮತ್ತು ನೆನಪೋಲೆಗಳು' : 'Seasonal Cutoff Alerts'}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                {language === 'kn'
                  ? 'ಖಾರಿಫ್ ಮತ್ತು ರಬಿ ಋತುವಿನ ಬೆಳೆ ವಿಮೆ, ರಿಯಾಯಿತಿ ಬೀಜಗಳ ವಿತರಣೆ ಗಡುವನ್ನು ಎಂದಿಗೂ ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಡಿ.'
                  : 'Never miss cutoff windows for seasonal crop insurance registration (PMFBY), certified seed distributions, or solar pump grants.'}
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => navigateToAuth('reminders', 'login')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <span>{language === 'kn' ? 'ನೆನಪೋಲೆ ತೆರೆಯಿರಿ' : 'View Reminders'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: STRATEGIC AGRICULTURAL SOLUTIONS */}
      <section id="solutions" className="max-w-7xl w-full mx-auto px-4 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-md">
            {language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆ ವರ್ಗೀಕರಣ' : 'Government Welfare Portfolio'}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif-heading font-bold text-stone-900 tracking-tight mt-3 mb-3">
            {language === 'kn'
              ? 'ಕೃಷಿಯ ಪ್ರತಿಯೊಂದು ಅಗತ್ಯಕ್ಕೂ ಸಮಗ್ರ ನೆರವು'
              : 'Targeted Interventions for Every Agricultural Milestone'}
          </h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            {language === 'kn'
              ? 'ಆದಾಯ ಭದ್ರತೆ, ಸುಲಭ ಸಾಲ, ಅನಿರೀಕ್ಷಿತ ಬೆಳೆ ನಷ್ಟ ಮತ್ತು ಆಧುನಿಕ ನೀರಾವರಿಗೆ ಅಧಿಕೃತ ಸಹಾಯಧನ ವಿವರಗಳು.'
              : 'Direct financial assistance, production credit, calamity shields, and infrastructure subsidies cataloged with real monetary value.'}
          </p>
        </div>

        {/* 4 Clean Solution Dossiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Solution 1: Direct Income Support */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Landmark className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                      {language === 'kn' ? 'ನೇರ ಆದಾಯ ನೆರವು (DBT)' : 'Direct Income & Cash Assistance'}
                    </h3>
                    <span className="text-xs text-stone-500">Unconditional Direct Benefit Transfer</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ₹6,000 - ₹10,000 / yr
                </span>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {language === 'kn'
                  ? 'ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ ಮೂಲಕ ವರ್ಷಕ್ಕೆ ₹6,000 (3 ಕಂತುಗಳಲ್ಲಿ) ಹಾಗೂ ಕರ್ನಾಟಕ ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರಿಗೆ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ.'
                  : 'Secures primary agricultural families through PM-KISAN (₹6,000/yr in three installments) and Karnataka Raitha Siri (₹10,000/ha for millets) directly deposited via NPCI-Aadhaar DBT.'}
              </p>

              <div className="space-y-2 text-xs font-medium text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>PM-KISAN Samman Nidhi (100% Central Government Grant)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Karnataka Raitha Siri Siri Dhanya Incentive Scheme</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToAuth('explore', 'login')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>{language === 'kn' ? 'ಯೋಜನೆಯ ವಿವರ ಮತ್ತು ಅರ್ಜಿ ವಿಧಾನ' : 'View Scheme Guidelines'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Solution 2: Low-Interest Concessional Credit */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                      {language === 'kn' ? 'ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದ ಕೃಷಿ ಸಾಲ' : 'Subsidized Production Credit (KCC)'}
                    </h3>
                    <span className="text-xs text-stone-500">Short-Term Working Capital</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  4% Subsidized
                </span>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {language === 'kn'
                  ? 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಮೂಲಕ ₹3,00,000 ವರೆಗೆ ಕೇವಲ 4% ಬಡ್ಡಿದರದಲ್ಲಿ ಕೃಷಿ ಮತ್ತು ಪಶುಸಂಗೋಪನೆ ಸಾಲ. ಸಕಾಲಿಕ ಮರುಪಾವತಿಗೆ ಹೆಚ್ಚುವರಿ 3% ಬಡ್ಡಿ ಸಬ್ಸಿಡಿ.'
                  : 'Concessional short-term crop loans up to ₹3,00,000 at an effective 4% interest rate with prompt repayment incentive through cooperative and commercial banks.'}
              </p>

              <div className="space-y-2 text-xs font-medium text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Kisan Credit Card (₹1.60 Lakh collateral-free limit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Primary Agriculture Cooperative Society (PACS) loans</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToAuth('explore', 'login')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-950"
            >
              <span>{language === 'kn' ? 'ಸಾಲ ಯೋಜನೆ ವಿವರಗಳು' : 'View Credit Guidelines'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Solution 3: Crop Disaster & Calamity Protection */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-blue-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                      {language === 'kn' ? 'ಬೆಳೆ ವಿಮೆ & ಹವಾಮಾನ ರಕ್ಷಣೆ' : 'Crop Insurance & Calamity Cover'}
                    </h3>
                    <span className="text-xs text-stone-500">Pradhan Mantri Fasal Bima Yojana</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                  1.5% - 2% Premium
                </span>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {language === 'kn'
                  ? 'ಅತಿವೃಷ್ಟಿ, ಬರ, ಕೀಟಬಾಧೆ ಹಾಗೂ ಬೆಳೆ ಕೊಯ್ಲಿನ ನಂತರದ ಹಾನಿಗಳಿಗೆ ಪೂರ್ಣ ವಿಮಾ ರಕ್ಷಣೆ. ಕನಿಷ್ಠ ಪ್ರೀಮಿಯಂ ದರ, ಉಳಿದ ಪ್ರೀಮಿಯಂ ಮೊತ್ತವನ್ನು ಸರ್ಕಾರವೇ ಭರಿಸುತ್ತದೆ.'
                  : 'Comprehensive insurance for non-preventable natural risks (drought, flood, unseasonal rainfall, localized hailstorms) with minimal 1.5% premium for foodgrains.'}
              </p>

              <div className="space-y-2 text-xs font-medium text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>PM Fasal Bima Yojana (Samrakshane Portal Karnataka)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>State Input Subsidy for Declared Drought Taluks</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToAuth('explore', 'login')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-950"
            >
              <span>{language === 'kn' ? 'ವಿಮಾ ಯೋಜನೆ ವಿವರಗಳು' : 'View Insurance Guidelines'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Solution 4: Micro-Irrigation & Solar Energy */}
          <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
                    <Droplets className="w-5 h-5 text-teal-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                      {language === 'kn' ? 'ಹನಿ ನೀರಾವರಿ & ಸೌರ ಪಂಪ್‌ಗಳು' : 'Micro-Irrigation & Solar Pumps'}
                    </h3>
                    <span className="text-xs text-stone-500">Resource Efficiency & Energy</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
                  Up to 90% Subsidy
                </span>
              </div>

              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {language === 'kn'
                  ? 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆ (PMKSY) ಅಡಿಯಲ್ಲಿ ಶೇಕಡಾ 90 ರವರೆಗೆ ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಸಬ್ಸಿಡಿ, ಹಾಗೂ PM-KUSUM ಸೌರ ಪಂಪ್‌ಸೆಟ್ ನೆರವು.'
                  : 'Up to 90% subsidy for small and marginal farmers on modern drip and sprinkler units under PMKSY, plus PM-KUSUM 60% grant for standalone solar agricultural pumps.'}
              </p>

              <div className="space-y-2 text-xs font-medium text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>PM Krishi Sinchayee Yojana (Drip & Sprinkler Subsidies)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>PM-KUSUM Off-Grid Solar Agricultural Pumps</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToAuth('explore', 'login')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-teal-900 hover:text-teal-950"
            >
              <span>{language === 'kn' ? 'ನೀರಾವರಿ ಯೋಜನೆ ವಿವರಗಳು' : 'View Irrigation Guidelines'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 4: EDITORIAL ABOUT SECTION */}
      <section id="about" className="max-w-7xl w-full mx-auto px-4 md:px-8 py-16 md:py-20 border-t border-stone-200">
        <div className="bg-[#051C12] rounded-3xl md:rounded-[36px] p-8 md:p-14 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center justify-between">
            
            {/* Left Narrative Column */}
            <div className="w-full lg:w-3/5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-emerald-900/80 px-3 py-1 rounded-md border border-emerald-500/30">
                {language === 'kn' ? 'ನಮ್ಮ ಧ್ಯೇಯ ಮತ್ತು ಉದ್ದೇಶ' : 'Institutional Mission'}
              </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif-heading font-bold text-amber-50 tracking-tight leading-tight">
                {language === 'kn'
                  ? 'ರೈತರಿಗಾಗಿ ನೇರ ಮತ್ತು ಪಾರದರ್ಶಕ ಸಾರ್ವಜನಿಕ ವೇದಿಕೆ'
                  : 'Bridging the Information Gap for Every Cultivator'}
              </h2>

              <p className="text-emerald-100/85 text-sm md:text-base leading-relaxed">
                {language === 'kn'
                  ? 'ಭಾರತದ ಕೃಷಿ ವಲಯದಲ್ಲಿ ಸಾವಿರಾರು ಕೋಟಿ ರೂಪಾಯಿಗಳ ಸಬ್ಸಿಡಿಗಳು ಕೇವಲ ಮಾಹಿತಿಯ ಕೊರತೆ, ಸಂಕೀರ್ಣ ನಿಯಮಗಳು ಮತ್ತು ಮಧ್ಯವರ್ತಿಗಳ ಶೋಷಣೆಯಿಂದ ಅರ್ಹ ರೈತರಿಗೆ ತಲುಪುವುದಿಲ್ಲ. ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಸರಳ ಭಾಷೆ, ಧ್ವನಿ ಬೆಂಬಲ ಮತ್ತು ನೇರ ಅಧಿಕೃತ ಮಾರ್ಗಗಳ ಮೂಲಕ ಈ ಅಂತರವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಿಸುತ್ತದೆ.'
                  : 'Every agricultural season, millions of rupees in welfare assistance go uncollected simply because notifications are locked inside bureaucratic PDF portals. Kisan Scheme Saathi was built to eliminate information asymmetry, empower smallholders with voice accessibility in their native language, and deliver rightful subsidies straight to verified bank accounts.'}
              </p>

              {/* Verified Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-emerald-900 text-xs md:text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 text-[10px]">✓</div>
                  <span>100% Free Public Service (ಸಂಪೂರ್ಣ ಉಚಿತ)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 text-[10px]">✓</div>
                  <span>Direct Benefit Transfer (DBT) Seeding Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 text-[10px]">✓</div>
                  <span>Bhoomi RTC Land Records Integrated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 text-[10px]">✓</div>
                  <span>Kannada & English Voice Support</span>
                </div>
              </div>
            </div>

            {/* Right Metrics Grid */}
            <div className="w-full lg:w-2/5 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#092B1D] border border-emerald-700/40 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-4xl md:text-5xl font-bold font-serif-heading text-amber-300 mb-1">
                  31
                </span>
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಗಳು' : 'Karnataka Districts'}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#092B1D] border border-emerald-700/40 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-4xl md:text-5xl font-bold font-serif-heading text-amber-300 mb-1">
                  15+
                </span>
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಕೃಷಿ ಯೋಜನೆಗಳು' : 'Govt Schemes'}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#092B1D] border border-emerald-700/40 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-4xl md:text-5xl font-bold font-serif-heading text-amber-300 mb-1">
                  ₹0
                </span>
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಶೂನ್ಯ ದಲ್ಲಾಳಿ ಶುಲ್ಕ' : 'Commission Free'}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#092B1D] border border-emerald-700/40 flex flex-col items-center justify-center text-center shadow-md">
                <span className="text-4xl md:text-5xl font-bold font-serif-heading text-amber-300 mb-1">
                  2
                </span>
                <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಭಾಷೆಗಳು (ಕನ್ನಡ & EN)' : 'Bilingual Voice'}
                </span>
              </div>
            </div>

          </div>

          {/* Call to Action Banner inside About Section */}
          <div className="mt-12 pt-8 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold font-serif-heading text-amber-100">
                {language === 'kn' ? 'ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಭೂಮಿಗೆ ಸೂಕ್ತ ಯೋಜನೆ ತಿಳಿಯಿರಿ' : 'Ready to check your farm scheme eligibility?'}
              </h4>
              <p className="text-xs text-emerald-200 mt-1">
                {language === 'kn' ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳ ಉಚಿತ ಪರಿಶೀಲನೆ. ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ.' : 'Takes under 2 minutes. Free and accessible to all farmers.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {t.checkEligibility}
              </button>
              <button
                onClick={() => navigateToAuth('dashboard', 'register')}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-full border border-emerald-400/50 hover:bg-emerald-800 text-white font-semibold text-xs transition-all active:scale-95"
              >
                {language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Free Account'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* COMPREHENSIVE GOVERNMENT-STANDARD FOOTER */}
      <footer className="bg-[#051C12] text-stone-300 border-t border-emerald-950 mt-auto">
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand & Ministry Reference */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-emblem.png" 
                  alt="Kisan Scheme Saathi Emblem" 
                  className="w-12 h-12 object-contain bg-white/95 rounded-full p-1 border border-emerald-500/40" 
                />
                <div>
                  <h3 className="font-serif-heading font-bold text-lg text-white">
                    Kisan Scheme <span className="text-amber-300">Saathi</span>
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    Government Schemes Portal
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Dedicated digital empowerment platform connecting Indian farming families with central and state agricultural subsidies, crop insurance, and subsidized production loans.
              </p>
              <div className="pt-2 text-[11px] text-emerald-300/80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active Data Sync: Karnataka Bhoomi & FRUITS</span>
              </div>
            </div>

            {/* Col 2: Schemes by Category */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4">
                Schemes
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM-KISAN Samman Nidhi</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Kisan Credit Card (KCC)</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM Fasal Bima Yojana</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM Krishi Sinchayee</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Karnataka Raitha Siri</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Ganga Kalyana Scheme</button></li>
              </ul>
            </div>

            {/* Col 3: Farmer Tools */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4">
                Farmer Tools
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li><button onClick={() => navigateToAuth('eligibility', 'register')} className="hover:text-white transition-colors">Eligibility Questionnaire</button></li>
                <li><button onClick={() => navigateToAuth('reminders', 'login')} className="hover:text-white transition-colors">My Deadlines & Reminders</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Document Readiness Guide</button></li>
                <li><button onClick={() => navigateToAuth('dashboard', 'register')} className="hover:text-white transition-colors">Farmer Registration</button></li>
                <li><button onClick={() => navigateToAuth('profile', 'login')} className="hover:text-white transition-colors">Bhoomi RTC Sync Status</button></li>
              </ul>
            </div>

            {/* Col 4: Official Portals & Helpline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4">
                Official Portals
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li><a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">pmkisan.gov.in <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://fruits.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">fruits.karnataka.gov.in <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://bhoomoj.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Bhoomi RTC Portal <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://pmfby.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">PMFBY Portal <ExternalLink className="w-3 h-3" /></a></li>
              </ul>

              <div className="mt-5 p-3 rounded-xl bg-forest-900 border border-emerald-800/60 text-xs">
                <span className="block text-[10px] text-stone-400 uppercase font-bold">Helpline</span>
                <span className="font-bold text-amber-300">1800-180-1551</span>
                <span className="block text-[10px] text-stone-400 mt-0.5">Toll Free • 6 AM to 10 PM</span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-8 mt-12 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
            <div>
              © 2026 Kisan Scheme Saathi • Public Agritech Portal • All Rights Reserved
            </div>
            <div className="flex items-center gap-4">
              <span>Bhoomi RTC Linked</span>
              <span>•</span>
              <span>NPCI-Aadhaar DBT Compliant</span>
              <span>•</span>
              <span>State of Karnataka</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
