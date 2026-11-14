import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Mic,
  CheckCircle2,
  FileText,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldCheck,
  Landmark,
  Droplets,
  CreditCard,
  Sparkles,
  MapPin,
  Bell,
  Users,
  ChevronRight,
  PhoneCall,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import RubberSegment from '../components/RubberSegment';

/**
 * Design Read (taste-skill Section 0.B):
 * Three-Tone Signature Palette:
 * - BORDO: #6C151E (maroon-700 / bordo-700)
 * - GREEN: #0F3D3A (forest-900) & #071E1C (forest-950)
 * - CREAM: #F5DABF (cream-200) & #FCF8F3 (canvas background)
 */

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
    <div className="min-h-screen bg-[#FCF8F3] text-stone-900 flex flex-col overflow-x-hidden font-sans selection:bg-[#6C151E] selection:text-white scroll-smooth">

      {/* Top Gazette Utility Ribbon - Harmonized Green #071E1C / #0F3D3A */}
      <div className="bg-forest-950 text-white text-xs sm:text-sm font-medium py-2 px-4 sm:px-6 md:px-12 border-b border-forest-800/80 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5DABF]" />
            <strong className="font-semibold text-stone-100">{language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇ-ಆಡಳಿತ ಉಪಕ್ರಮ' : 'Karnataka Agriculture E-Governance Initiative'}</strong>
          </span>
          <span className="text-forest-600 font-bold">•</span>
          <span className="text-[#F5DABF] font-semibold">
            {language === 'kn' ? 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಸಹಾಯಕ' : 'Direct Benefit Transfer (DBT) Enabler'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#F5DABF]">
          <span className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#F5DABF]" />
            <span className="text-stone-200">Kisan Call Center: <strong className="text-white text-xs sm:text-sm font-bold tracking-wide">1800-180-1551</strong> (Toll Free 24x7)</span>
          </span>
        </div>
      </div>

      {/* Main Sticky Navigation Header */}
      <header className="px-3 sm:px-6 md:px-12 py-3 sm:py-4 flex items-center justify-between bg-[#FCF8F3]/95 backdrop-blur-md sticky top-0 z-40 border-b border-stone-300 shadow-xs">
        <div onClick={() => scrollToSection('home')} className="cursor-pointer flex-shrink-0">
          <Logo variant="light" />
        </div>

        {/* Section Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm md:text-base font-bold text-stone-800">
          <button
            onClick={() => scrollToSection('home')}
            className={`transition-colors py-1 ${activeNav === 'home' ? 'text-[#6C151E] border-b-2 border-[#6C151E]' : 'hover:text-stone-950'}`}
          >
            {language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className={`transition-colors py-1 ${activeNav === 'features' ? 'text-[#6C151E] border-b-2 border-[#6C151E]' : 'hover:text-stone-950'}`}
          >
            {language === 'kn' ? 'ಸಾಮರ್ಥ್ಯಗಳು' : 'Capabilities'}
          </button>
          <button
            onClick={() => scrollToSection('solutions')}
            className={`transition-colors py-1 ${activeNav === 'solutions' ? 'text-[#6C151E] border-b-2 border-[#6C151E]' : 'hover:text-stone-950'}`}
          >
            {language === 'kn' ? 'ಯೋಜನಾ ಪಟ್ಟಿ' : 'Gazette Register'}
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className={`transition-colors py-1 ${activeNav === 'about' ? 'text-[#6C151E] border-b-2 border-[#6C151E]' : 'hover:text-stone-950'}`}
          >
            {language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'Mission'}
          </button>
        </nav>

        {/* Right Action Stack */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Bilingual Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-400 text-stone-900 hover:text-stone-950 hover:border-stone-600 text-xs sm:text-sm font-bold bg-white shadow-xs transition-colors"
            title={language === 'kn' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ'}
          >
            <span className="font-extrabold text-[#6C151E]">{language === 'kn' ? 'ಕನ್ನಡ' : 'English'}</span>
            <span className="text-stone-400">|</span>
            <span className="text-stone-600 font-medium">{language === 'kn' ? 'ENG' : 'ಕನ್ನ'}</span>
          </button>

          {/* Quick Login / Dashboard CTA */}
          <button
            type="button"
            onClick={() => navigateToAuth('dashboard', 'login')}
            className="px-3.5 sm:px-4 py-1.5 rounded-full border border-stone-400 hover:border-stone-600 text-stone-900 text-xs sm:text-sm font-bold bg-white shadow-xs transition-colors"
          >
            {language === 'kn' ? 'ಲಾಗಿನ್' : 'Sign In'}
          </button>

          {/* Primary CTA - Bordo #6C151E */}
          <button
            type="button"
            onClick={() => navigateToAuth('eligibility', 'register')}
            className="px-4 sm:px-5 py-2 rounded-full bg-[#6C151E] hover:bg-[#521016] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>{t.checkEligibility}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sub-nav pills for mobile navigation */}
      <div className="lg:hidden flex items-center justify-between px-3 py-2 bg-stone-100/90 border-b border-stone-200 text-xs overflow-x-auto gap-2">
        {[
          { id: 'home', label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home' },
          { id: 'features', label: language === 'kn' ? 'ಸಾಮರ್ಥ್ಯಗಳು' : 'Capabilities' },
          { id: 'solutions', label: language === 'kn' ? 'ಯೋಜನಾ ಪಟ್ಟಿ' : 'Gazette' },
          { id: 'about', label: language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'Mission' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeNav === sec.id
                ? 'bg-[#6C151E] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 bg-stone-200/60'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: HERO - AUTHENTIC AGRICULTURAL PUBLICATION SPREAD         */}
      {/* =================================================================== */}
      <section id="home" className="max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-8 pt-4 sm:pt-6">
        <div className="w-full relative rounded-2xl sm:rounded-3xl md:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(3,31,22,0.35)] border border-stone-300/90 flex flex-col lg:flex-row bg-forest-900">

          {/* Right Photograph Showcase Frame */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[52%] xl:w-[50%] z-0 h-64 sm:h-72 lg:h-full overflow-hidden">
            <img
              src="/farmer-sunset-cropped.jpg"
              alt="Karnataka farmer plowing agricultural land with oxen at golden hour"
              className="w-full h-full object-cover object-center scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
            />
            {/* Atmospheric gradient transitions */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-forest-900 via-forest-900/85 to-transparent pointer-events-none" />
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/85 to-transparent pointer-events-none" />
            
            {/* Publication Verification Stamp */}
            <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-950/90 border border-forest-500/40 text-[#F5DABF] text-xs font-bold tracking-wide backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-forest-400 inline-block animate-pulse" />
              <span>{language === 'kn' ? 'ಗೆಜೆಟ್ ದೃಢೀಕೃತ · 2026' : 'Gazette Verified · 2026'}</span>
            </div>
          </div>

          {/* Left Content Column */}
          <div className="relative z-10 w-full lg:w-[54%] xl:w-[52%] p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] bg-forest-900">
            <div className="space-y-4 sm:space-y-6">
              
              {/* Publication Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-950/90 border border-forest-600/50 text-[#F5DABF] text-xs sm:text-sm font-bold tracking-wide backdrop-blur-md shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'kn' ? 'ಕರ್ನಾಟಕ ಮತ್ತು ಕೇಂದ್ರ ಕೃಷಿ ಕಲ್ಯಾಣ ಗೆಜೆಟ್' : 'Official Central & State Agriculture Gazette'}</span>
              </div>

              {/* Hero Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold font-serif-heading text-white tracking-tight leading-[1.08]">
                Kisan Scheme <br />
                <span className="text-[#F5DABF] font-serif-heading">Saathi</span>
              </h1>

              {/* Concise Subtext */}
              <p className="text-stone-100 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg font-normal">
                {language === 'kn'
                  ? 'ಒಂದೇ ಸರಳ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಕನ್ನಡ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನದ ಮೂಲಕ ಅರ್ಹ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳು, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಕೃಷಿ ಸಾಲಗಳನ್ನು ತಕ್ಷಣ ಕಂಡುಕೊಳ್ಳಿ.'
                  : 'Instantly verify eligible government subsidies, crop insurance, and production loans with natural voice guidance in Kannada and English.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={() => navigateToAuth('eligibility', 'register')}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#6C151E] hover:bg-[#521016] text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-black/40 active:scale-95 transition-all"
                >
                  <span>{language === 'kn' ? 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Check Eligibility Now'}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-forest-400/40 backdrop-blur-md transition-all active:scale-95"
                >
                  {language === 'kn' ? 'ವೇದಿಕೆ ತಿಳಿಯಿರಿ' : 'Explore Platform'}
                </button>

                {/* Voice Readout Control */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(language === 'kn' ? t.tagline : 'Kisan Scheme Saathi helps you discover eligible agricultural schemes with voice guidance in Kannada and English.');
                    }
                  }}
                  className={`p-3.5 sm:p-4 rounded-full transition-all shadow-md active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center ${
                    isSpeaking
                      ? 'bg-amber-400 text-forest-950 ring-4 ring-amber-300/40 shadow-lg'
                      : 'bg-forest-800 hover:bg-forest-700 text-[#F5DABF] border border-forest-600/50'
                  }`}
                  title={isSpeaking ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop voice audio') : (language === 'kn' ? 'ಧ್ವನಿ ಆಲಿಸಿ' : 'Listen aloud')}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
              </div>

            </div>

            {/* Publication Ledger Quick-Index - Integrated hairline row in forest tones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-forest-800/80 pt-6 sm:pt-7 border-t border-forest-800/80 mt-6 sm:mt-8">
              <div
                onClick={() => speakText(language === 'kn' ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲ' : 'Voice support in Kannada and English')}
                className="py-2.5 sm:py-0 sm:px-3 first:pl-0 flex flex-col items-start gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-[#F5DABF]">
                  <Mic className="w-4 h-4 text-[#F5DABF]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5DABF]">01</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5DABF] transition-colors">
                  {language === 'kn' ? 'ದ್ವಿಭಾಷಾ ಧ್ವನಿ' : 'Voice Guidance'}
                </span>
                <span className="text-xs sm:text-sm text-stone-200 font-medium">Kannada & English</span>
              </div>

              <div
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="py-2.5 sm:py-0 sm:px-3 flex flex-col items-start gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-[#F5DABF]">
                  <CheckCircle2 className="w-4 h-4 text-[#F5DABF]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5DABF]">02</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5DABF] transition-colors">
                  {language === 'kn' ? 'ಏಕರೂಪ ಪ್ರೊಫೈಲ್' : 'Common Profile'}
                </span>
                <span className="text-xs sm:text-sm text-stone-200 font-medium">Single questionnaire</span>
              </div>

              <div
                onClick={() => navigateToAuth('explore', 'login')}
                className="py-2.5 sm:py-0 sm:px-3 flex flex-col items-start gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-[#F5DABF]">
                  <FileText className="w-4 h-4 text-[#F5DABF]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5DABF]">03</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5DABF] transition-colors">
                  {language === 'kn' ? 'ದಾಖಲೆ ಸಿದ್ಧತೆ' : 'Document Audit'}
                </span>
                <span className="text-xs sm:text-sm text-stone-200 font-medium">RTC & FID ready</span>
              </div>

              <div
                onClick={() => navigateToAuth('explore', 'login')}
                className="py-2.5 sm:py-0 sm:px-3 last:pr-0 flex flex-col items-start gap-1 cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-[#F5DABF]">
                  <ExternalLink className="w-4 h-4 text-[#F5DABF]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5DABF]">04</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5DABF] transition-colors">
                  {language === 'kn' ? 'ನೇರ ಪೋರ್ಟಲ್' : 'Direct Portals'}
                </span>
                <span className="text-xs sm:text-sm text-stone-200 font-medium">Official State DBT</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 2: VERIFIED WELFARE LEDGER STRIP (CARD-FREE BROADSIDE)      */}
      {/* =================================================================== */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="border-y border-stone-300/90 py-6 sm:py-8">
          
          {/* Top Ledger Header Note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-5 border-b border-stone-300 mb-6">
            <div className="flex items-center gap-2 text-stone-900 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-forest-800" />
              <span>{language === 'kn' ? 'ಅಧಿಕೃತ ಕೃಷಿ ಸಹಾಯಧನ ಲೆಕ್ಕಪತ್ರ' : 'Verified Welfare Ledger & Grounded Benchmarks'}</span>
            </div>
            <span className="text-xs sm:text-sm text-stone-700 font-mono font-semibold">
              {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಇಲಾಖೆ ಗೆಜೆಟ್ ೨೦೨೬' : 'Karnataka Agriculture Dept Gazette Norms · 2026'}
            </span>
          </div>

          {/* 4 Grounded Almanac Metrics - Continuous hairline divide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300">
            
            {/* Metric 1: Direct Income Support */}
            <div className="py-4 sm:py-0 sm:px-6 first:pl-0 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider">
                {language === 'kn' ? 'ನೇರ ಆದಾಯ ನೆರವು (DBT)' : 'Direct Income Security'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-serif-heading text-stone-900 tracking-tight">
                ₹6,000 - ₹10,000
              </div>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal pt-1">
                {language === 'kn' ? 'PM-ಕಿಸಾನ್ ಹಾಗೂ ರೈತ ಸಿರಿ ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹಧನ ನೇರ ಬ್ಯಾಂಕ್ ಜಮೆ' : 'Per year via PM-KISAN & Karnataka Raitha Siri direct bank transfer'}
              </p>
            </div>

            {/* Metric 2: Concessional Credit Rate */}
            <div className="py-4 sm:py-0 sm:px-6 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider">
                {language === 'kn' ? 'ರಿಯಾಯಿತಿ ಬೆಳೆ ಸಾಲ (KCC)' : 'Concessional Production Credit'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-serif-heading text-stone-900 tracking-tight">
                4% Subsidized
              </div>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal pt-1">
                {language === 'kn' ? '₹3 ಲಕ್ಷದವರೆಗೆ ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಸಾಲ, ಸಕಾಲಿಕ ಮರುಪಾವತಿಗೆ ಬಡ್ಡಿ ರಿಯಾಯಿತಿ' : 'Short-term crop credit up to ₹3,00,000 with prompt repayment rebate'}
              </p>
            </div>

            {/* Metric 3: Irrigation Subsidies */}
            <div className="py-4 sm:py-0 sm:px-6 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider">
                {language === 'kn' ? 'ಹನಿ ನೀರಾವರಿ & ಸೌರ ಪಂಪ್' : 'Micro-Irrigation & Solar'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-serif-heading text-stone-900 tracking-tight">
                Up to 90%
              </div>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal pt-1">
                {language === 'kn' ? 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ PMKSY ಹಾಗೂ ಗಂಗಾ ಕಲ್ಯಾಣ ಸಬ್ಸಿಡಿ' : 'Government grant on drip units and standalone solar pump units'}
              </p>
            </div>

            {/* Metric 4: Free & Direct */}
            <div className="py-4 sm:py-0 sm:px-6 last:pr-0 space-y-1.5">
              <div className="text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider">
                {language === 'kn' ? 'ಪಾರದರ್ಶಕತೆ & ಮಧ್ಯವರ್ತಿ ಮುಕ್ತ' : 'Zero Middlemen · 100% Free'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-serif-heading text-stone-900 tracking-tight">
                100% Direct
              </div>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-normal pt-1">
                {language === 'kn' ? 'ಯಾವುದೇ ದಲ್ಲಾಳಿ ಶುಲ್ಕವಿಲ್ಲ, ನೇರ ಆಧಾರ್ ಲಿಂಕ್ಡ್ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ' : 'Direct benefit transfer straight into Aadhaar seeded bank accounts'}
              </p>
            </div>

          </div>

          {/* Bottom Transparency Ribbon */}
          <div className="mt-8 pt-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-800 font-bold">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-forest-700 stroke-[3]" />
              <span>{language === 'kn' ? 'ಕರ್ನಾಟಕ ಭೂಮಿ RTC ಪಹಣಿ ದತ್ತಾಂಶ ಹೊಂದಾಣಿಕೆ' : 'Karnataka Bhoomi RTC & Survey Number Ready'}</span>
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-forest-700 stroke-[3]" />
              <span>{language === 'kn' ? 'FRUITS FID ರೈತರ ನೋಂದಣಿ ಬೆಂಬಲ' : 'FRUITS Farmer Registration (FID) Compatible'}</span>
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-forest-700 stroke-[3]" />
              <span>{language === 'kn' ? '31 ಜಿಲ್ಲೆಗಳು & 240+ ತಾಲೂಕು ಕೇಂದ್ರಗಳು' : 'Active Across All 31 Karnataka Districts'}</span>
            </span>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3: THE FARMER JOURNEY - CARD-FREE ASYMMETRIC SPREAD        */}
      {/* =================================================================== */}
      <section id="features" className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Section Headline */}
        <div className="pb-8 border-b border-stone-300 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-heading font-extrabold text-stone-900 tracking-tight leading-tight max-w-3xl">
            {language === 'kn'
              ? 'ರೈತರಿಗಾಗಿ ನೇರ, ಸರಳ ಮತ್ತು ಪಾರದರ್ಶಕ ಕಾರ್ಯವಿಧಾನ'
              : 'Engineered for Practical Grassroots Accessibility'}
          </h2>
          <p className="text-stone-800 text-sm sm:text-base md:text-lg leading-relaxed mt-2 max-w-2xl font-normal">
            {language === 'kn'
              ? 'ಪ್ರತಿ ಯೋಜನೆಗೂ ಪ್ರತ್ಯೇಕ ಕಚೇರಿ ಅಲೆಯುವ ಬದಲು, ಒಂದೇ ಸಾಮಾನ್ಯ ಪ್ರೊಫೈಲ್ ಮೂಲಕ ನಿಮ್ಮ ಎಲ್ಲಾ ಸಂಭಾವ್ಯ ಯೋಜನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿ.'
              : 'Eliminating paperwork anxiety and commission exploitation through automated rule-matching, regional voice synthesis, and direct official portal integration.'}
          </p>
        </div>

        {/* 2-Column Editorial Spread: Left Photographic Anchor + Right Progressive Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">

          {/* Left Column (Sticky Visual Anchor) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md group">
              <img
                src="/images/farmer_harvest_ragi.jpg"
                alt="Karnataka farmer with golden ragi harvest"
                className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-103 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-[#F5DABF] font-mono">
                  {language === 'kn' ? 'ಸ್ಥಳೀಯ ಬೆಳೆ & ಕೃಷಿಕ' : 'Authentic Cultivator Heritage · Karnataka'}
                </span>
                <p className="text-xs sm:text-sm text-stone-200 font-medium">
                  {language === 'kn'
                    ? '31 ಜಿಲ್ಲೆಗಳು ಹಾಗೂ 240+ ತಾಲೂಕುಗಳ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರ ನೇರ ಸಬಲೀಕರಣ.'
                    : 'Direct empowerment for marginal and smallholders cultivating ragi, millets, paddy, and horticultural crops.'}
                </p>
              </div>
            </div>

            {/* Quick Action Prompt */}
            <div className="p-5 bg-white border border-stone-300 rounded-2xl space-y-3">
              <div className="text-sm sm:text-base font-bold text-stone-900">
                {language === 'kn' ? 'ನಿಮ್ಮ ಅರ್ಹತೆ ತಿಳಿಯಲು ಸಿದ್ಧರಿದ್ದೀರಾ?' : 'Instant Eligibility Verification'}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳ ಉಚಿತ ಪ್ರಶ್ನಾವಳಿ. ಯಾವುದೇ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ.'
                  : 'Zero document uploads required for instant scheme matching. Completely free public service.'}
              </p>
              <button
                type="button"
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="w-full py-3 px-4 rounded-full bg-[#6C151E] hover:bg-[#521016] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-95"
              >
                <span>{language === 'kn' ? 'ಪ್ರಶ್ನಾವಳಿ ಪ್ರಾರಂಭಿಸಿ' : 'Launch Questionnaire'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column (Numbered Progressive Flow) */}
          <div className="lg:col-span-7 divide-y divide-stone-300">

            {/* Step 01: Rules-Based Eligibility Engine */}
            <div className="py-6 first:pt-0 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-forest-800 bg-forest-100 px-2.5 py-0.5 rounded border border-forest-200">
                  01 / 04
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ಬುದ್ಧಿವಂತ ಅರ್ಹತಾ ಪರಿಶೀಲನಾ ಎಂಜಿನ್' : 'Deterministic Rules-Based Eligibility Engine'}
                </h3>
              </div>
              <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಸಣ್ಣ/ಅತಿ ಸಣ್ಣ), ಬೆಳೆಯ ವರ್ಗ (ಸಿರಿಧಾನ್ಯ/ತರಕಾರಿ), ನೀರಾವರಿ ಮೂಲ ಮತ್ತು ಸಾಮಾಜಿಕ ವರ್ಗವನ್ನು ಆಧರಿಸಿ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರಗಳ ಯೋಜನೆಗಳ ನಿಯಮಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ.'
                  : 'Instead of searching through dense PDF gazettes, our automated engine checks your landholding size, crop pattern, irrigation type, and social category against central and Karnataka state gazettes in real time.'}
              </p>
              {/* Profile Match Sample Tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs sm:text-sm font-semibold text-stone-800">
                <span className="px-3 py-1 bg-stone-200/80 rounded border border-stone-300">Marginal Land (&lt; 2.5 Acres)</span>
                <span className="px-3 py-1 bg-stone-200/80 rounded border border-stone-300">Dryland & Borewell</span>
                <span className="px-3 py-1 bg-stone-200/80 rounded border border-stone-300">Ragi / Millets</span>
                <span className="px-3 py-1 bg-forest-100 text-forest-900 rounded border border-forest-300 font-bold">Matched 4 Schemes</span>
              </div>
            </div>

            {/* Step 02: Bilingual Voice Readout */}
            <div className="py-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                  02 / 04
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ದ್ವಿಭಾಷಾ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ' : 'Bilingual Voice Readout for Full Accessibility'}
                </h3>
              </div>
              <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ಓದುವ ಅಗತ್ಯವಿಲ್ಲದೆ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಯೋಜನೆಗಳ ನಿಯಮಗಳನ್ನು ಧ್ವನಿಯ ಮೂಲಕ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಗ್ರಾಮೀಣ ರೈತರ ಅನುಕೂಲಕ್ಕಾಗಿ ವಿಶೇಷ ಧ್ವನಿ ಬೆಂಬಲ.'
                  : 'Engineered for farmers of all literacy levels. Hear scheme benefits, mandatory document requirements, and seasonal deadlines read aloud in natural Kannada or English.'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(language === 'kn' ? 'ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಮಗೆ ಯಾವ ಯೋಜನೆಯ ಮಾಹಿತಿ ಬೇಕು?' : 'Kisan Scheme Saathi voice assistant is active. How can we help your farm?');
                    }
                  }}
                  className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold border transition-colors ${
                    isSpeaking
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                      : 'bg-stone-200/80 hover:bg-stone-300 text-stone-900 border-stone-300'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-stone-800'}`} />
                  <span>
                    {isSpeaking
                      ? (language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : 'Stop Audio')
                      : (language === 'kn' ? 'ಧ್ವನಿ ಮಾದರಿ ಆಲಿಸಿ' : 'Sample Voice Audio')}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 03: Pre-Application Document Readiness */}
            <div className="py-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 bg-stone-200 px-2.5 py-0.5 rounded border border-stone-300">
                  03 / 04
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ದಾಖಲೆಗಳ ಸಿದ್ಧತಾ ಪಟ್ಟಿ & ಪರಿಶೀಲನೆ' : 'Pre-Application Document Readiness Audit'}
                </h3>
              </div>
              <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಯಾವ ದಾಖಲೆಗಳು ಲಭ್ಯವಿವೆ, ಯಾವುದನ್ನು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಬೇಕು ಎಂದು ಪರಿಶೀಲಿಸಿ. ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರಗಳಿಗೆ ಭೇಟಿ ನೀಡುವ ಮುನ್ನ ಸಿದ್ಧರಾಗಿ.'
                  : 'Clear readiness audits for Aadhaar NPCI seeding, Bhoomi RTC land records, and FRUITS Farmer IDs before visiting Grama One centers.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3.5 bg-white rounded-xl border border-stone-300 shadow-xs">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm block">Aadhaar e-KYC</span>
                  <span className="text-stone-700 text-xs sm:text-sm font-medium">NPCI bank account linked</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-stone-300 shadow-xs">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm block">Bhoomi RTC / Pahani</span>
                  <span className="text-stone-700 text-xs sm:text-sm font-medium">Active survey number title</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-stone-300 shadow-xs">
                  <span className="font-bold text-stone-900 text-xs sm:text-sm block">FRUITS FID Number</span>
                  <span className="text-stone-700 text-xs sm:text-sm font-medium">Auto DBT disbursement</span>
                </div>
              </div>
            </div>

            {/* Step 04: Direct Government Portals */}
            <div className="py-6 last:pb-0 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-forest-800 bg-forest-100 px-2.5 py-0.5 rounded border border-forest-200">
                  04 / 04
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-serif-heading text-stone-900">
                  {language === 'kn' ? 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಸಂಪರ್ಕ' : 'Direct Official State & Central Portals'}
                </h3>
              </div>
              <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ಯಾವುದೇ ಮಧ್ಯವರ್ತಿ ಶುಲ್ಕವಿಲ್ಲದೆ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಂರಕ್ಷಣೆ, ಕೃಷಿ ಇಲಾಖೆ ಹಾಗೂ ಕೇಂದ್ರ ಸರ್ಕಾರದ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್‌ಗಳ ನೇರ ಲಿಂಕ್‌ಗಳು.'
                  : 'Zero broker intervention. Connect directly to official state application links including Karnataka Samrakshane, Bhoomi RTC, and central ministry portals.'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigateToAuth('explore', 'login')}
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#6C151E] hover:text-[#521016] transition-colors"
                >
                  <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ' : 'Browse Full Government Scheme Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4: OFFICIAL GAZETTE REGISTER - CARD-FREE DIRECTORY TABLE   */}
      {/* =================================================================== */}
      <section id="solutions" className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 border-t border-stone-300">
        
        {/* Section Header */}
        <div className="pb-6 border-b border-stone-300 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-heading font-extrabold text-stone-900 tracking-tight leading-tight">
              {language === 'kn'
                ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಸಹಾಯಧನ ಗೆಜೆಟ್ ನೋಂದಣಿ'
                : 'Official Agriculture Welfare Gazette Register'}
            </h2>
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed mt-1 max-w-xl font-normal">
              {language === 'kn'
                ? 'ಆದಾಯ ಭದ್ರತೆ, ಸುಲಭ ಸಾಲ, ಅನಿರೀಕ್ಷಿತ ಬೆಳೆ ನಷ್ಟ ಮತ್ತು ಆಧುನಿಕ ನೀರಾವರಿಗೆ ಅಧಿಕೃತ ಸಹಾಯಧನ ವಿವರಗಳು.'
                : 'Direct financial assistance, production credit, calamity shields, and infrastructure grants cataloged by official gazette norms.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToAuth('explore', 'login')}
            className="text-sm sm:text-base font-bold text-[#6C151E] hover:text-[#521016] flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ' : 'View Complete Directory (15+ Schemes)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tabular Directory Ledger */}
        <div className="divide-y divide-stone-300 border-y border-stone-300">

          {/* Row 1: Direct Income Support */}
          <div className="py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-stone-200/40 transition-colors px-2 rounded">
            <div className="lg:col-span-4 space-y-1">
              <span className="font-mono text-xs sm:text-sm font-bold text-forest-800 uppercase tracking-wider block">
                REF: DBT-2026-01 · INCOME SUPPORT
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಪಿಎಂ-ಕಿಸಾನ್ ಹಾಗೂ ರೈತ ಸಿರಿ ಪ್ರೋತ್ಸಾಹಧನ' : 'PM-KISAN Samman Nidhi & Raitha Siri'}
              </h3>
              <span className="text-xs sm:text-sm text-stone-700 font-medium block">Direct Benefit Transfer via Aadhaar-NPCI</span>
            </div>

            <div className="lg:col-span-5 text-sm sm:text-base text-stone-800 leading-relaxed font-normal">
              {language === 'kn'
                ? 'ವರ್ಷಕ್ಕೆ ₹6,000 (3 ಕಂತುಗಳಲ್ಲಿ) ಹಾಗೂ ಕರ್ನಾಟಕ ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ಸಿರಿಧಾನ್ಯ ಬೆಳೆಗಾರರಿಗೆ ಹೆಕ್ಟೇರಿಗೆ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮಾ.'
                : 'Annual income grant of ₹6,000/yr in three installments, plus Karnataka Raitha Siri ₹10,000/ha incentive for minor millet cultivators.'}
            </div>

            <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <span className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900 block leading-tight">
                  ₹6,000 - ₹10,000
                </span>
                <span className="text-xs sm:text-sm text-forest-800 font-bold">100% Direct DBT</span>
              </div>
              <button
                type="button"
                onClick={() => navigateToAuth('explore', 'login')}
                className="px-4 py-2 rounded-full border border-stone-400 hover:border-stone-600 text-stone-900 hover:text-stone-950 bg-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Guidelines</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Concessional Credit */}
          <div className="py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-stone-200/40 transition-colors px-2 rounded">
            <div className="lg:col-span-4 space-y-1">
              <span className="font-mono text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wider block">
                REF: KCC-2026-02 · WORKING CAPITAL
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಬೆಳೆ ಸಾಲ' : 'Subsidized Production Credit (KCC)'}
              </h3>
              <span className="text-xs sm:text-sm text-stone-700 font-medium block">Short-term crop loan through PACS & Banks</span>
            </div>

            <div className="lg:col-span-5 text-sm sm:text-base text-stone-800 leading-relaxed font-normal">
              {language === 'kn'
                ? 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಮೂಲಕ ₹3,00,000 ವರೆಗೆ ಕೇವಲ 4% ಬಡ್ಡಿದರದಲ್ಲಿ ಕೃಷಿ ಮತ್ತು ಪಶುಸಂಗೋಪನೆ ಸಾಲ. ₹1.60 ಲಕ್ಷದವರೆಗೆ ಯಾವುದೇ ಅಡಮಾನವಿಲ್ಲ.'
                : 'Concessional short-term crop loans up to ₹3,00,000 at 4% effective interest with prompt repayment rebate. Up to ₹1.60 Lakh collateral-free.'}
            </div>

            <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <span className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900 block leading-tight">
                  4% Subsidized
                </span>
                <span className="text-xs sm:text-sm text-amber-900 font-bold">Up to ₹3.00 Lakh</span>
              </div>
              <button
                type="button"
                onClick={() => navigateToAuth('explore', 'login')}
                className="px-4 py-2 rounded-full border border-stone-400 hover:border-stone-600 text-stone-900 hover:text-stone-950 bg-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Guidelines</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 3: Crop Insurance */}
          <div className="py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-stone-200/40 transition-colors px-2 rounded">
            <div className="lg:col-span-4 space-y-1">
              <span className="font-mono text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider block">
                REF: PMFBY-2026-03 · CALAMITY COVER
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ' : 'Pradhan Mantri Fasal Bima (PMFBY)'}
              </h3>
              <span className="text-xs sm:text-sm text-stone-700 font-medium block">Karnataka Samrakshane Portal Verified</span>
            </div>

            <div className="lg:col-span-5 text-sm sm:text-base text-stone-800 leading-relaxed font-normal">
              {language === 'kn'
                ? 'ಅತಿವೃಷ್ಟಿ, ಬರ, ಕೀಟಬಾಧೆ ಹಾಗೂ ಬೆಳೆ ಕೊಯ್ಲಿನ ನಂತರದ ಹಾನಿಗಳಿಗೆ ಪೂರ್ಣ ವಿಮಾ ರಕ್ಷಣೆ. ಆಹಾರ ಧಾನ್ಯಗಳಿಗೆ ಕೇವಲ 1.5% - 2% ಕನಿಷ್ಠ ಪ್ರೀಮಿಯಂ.'
                : 'Comprehensive cover for non-preventable natural risks (drought, flood, unseasonal rainfall, localized hailstorms) with minimal 1.5% foodgrain premium.'}
            </div>

            <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <span className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900 block leading-tight">
                  1.5% - 2% Premium
                </span>
                <span className="text-xs sm:text-sm text-stone-800 font-bold">Govt Pays Balance</span>
              </div>
              <button
                type="button"
                onClick={() => navigateToAuth('explore', 'login')}
                className="px-4 py-2 rounded-full border border-stone-400 hover:border-stone-600 text-stone-900 hover:text-stone-950 bg-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Guidelines</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 4: Micro-Irrigation & Solar */}
          <div className="py-5 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-stone-200/40 transition-colors px-2 rounded">
            <div className="lg:col-span-4 space-y-1">
              <span className="font-mono text-xs sm:text-sm font-bold text-stone-800 uppercase tracking-wider block">
                REF: PMKSY-2026-04 · INFRASTRUCTURE
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900">
                {language === 'kn' ? 'ಹನಿ ನೀರಾವರಿ & ಕುಸುಮ್ ಸೌರ ಪಂಪ್' : 'Micro-Irrigation & PM-KUSUM Solar'}
              </h3>
              <span className="text-xs sm:text-sm text-stone-700 font-medium block">Drip units & off-grid agricultural solar pumps</span>
            </div>

            <div className="lg:col-span-5 text-sm sm:text-base text-stone-800 leading-relaxed font-normal">
              {language === 'kn'
                ? 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರಿಗೆ ಹನಿ ಮತ್ತು ತುಂತುರು ನೀರಾವರಿ ಘಟಕಗಳಿಗೆ ಶೇಕಡಾ 90 ರವರೆಗೆ ಸಹಾಯಧನ ಹಾಗೂ PM-KUSUM ಸೌರ ಪಂಪ್‌ಸೆಟ್ 60% ಸಬ್ಸಿಡಿ.'
                : 'Up to 90% subsidy on modern drip and sprinkler units under PMKSY for small and marginal farmers, plus 60% standalone solar pump grant.'}
            </div>

            <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <span className="text-base sm:text-lg md:text-xl font-bold font-serif-heading text-stone-900 block leading-tight">
                  Up to 90% Grant
                </span>
                <span className="text-xs sm:text-sm text-stone-800 font-bold">Smallholders Tier</span>
              </div>
              <button
                type="button"
                onClick={() => navigateToAuth('explore', 'login')}
                className="px-4 py-2 rounded-full border border-stone-400 hover:border-stone-600 text-stone-900 hover:text-stone-950 bg-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Guidelines</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5: INSTITUTIONAL MISSION & MONOLITHIC METRICS               */}
      {/* =================================================================== */}
      <section id="about" className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:py-20 border-t border-stone-300">
        <div className="bg-forest-900 rounded-2xl sm:rounded-3xl md:rounded-[36px] p-6 sm:p-10 md:p-14 lg:p-16 text-white relative overflow-hidden shadow-2xl">

          {/* Panoramic Agricultural Photography Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img
              src="/images/karnataka_fields_dawn.jpg"
              alt="Karnataka agricultural fields at dawn"
              className="w-full h-full object-cover object-center opacity-15 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-900/95 to-forest-900/85" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 sm:gap-12 items-center justify-between">

            {/* Left Narrative Column */}
            <div className="w-full lg:w-3/5 space-y-5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F5DABF] bg-forest-950/90 px-3.5 py-1.5 rounded-md border border-forest-600/50">
                {language === 'kn' ? 'ನಮ್ಮ ಧ್ಯೇಯ ಮತ್ತು ಉದ್ದೇಶ' : 'Institutional Mission'}
              </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif-heading font-extrabold text-amber-50 tracking-tight leading-tight">
                {language === 'kn'
                  ? 'ರೈತರಿಗಾಗಿ ನೇರ ಮತ್ತು ಪಾರದರ್ಶಕ ಸಾರ್ವಜನಿಕ ವೇದಿಕೆ'
                  : 'Bridging the Information Gap for Every Cultivator'}
              </h2>

              <p className="text-stone-100 text-base md:text-lg leading-relaxed font-normal">
                {language === 'kn'
                  ? 'ಭಾರತದ ಕೃಷಿ ವಲಯದಲ್ಲಿ ಸಾವಿರಾರು ಕೋಟಿ ರೂಪಾಯಿಗಳ ಸಬ್ಸಿಡಿಗಳು ಕೇವಲ ಮಾಹಿತಿಯ ಕೊರತೆ, ಸಂಕೀರ್ಣ ನಿಯಮಗಳು ಮತ್ತು ಮಧ್ಯವರ್ತಿಗಳ ಶೋಷಣೆಯಿಂದ ಅರ್ಹ ರೈತರಿಗೆ ತಲುಪುವುದಿಲ್ಲ. ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಸರಳ ಭಾಷೆ, ಧ್ವನಿ ಬೆಂಬಲ ಮತ್ತು ನೇರ ಅಧಿಕೃತ ಮಾರ್ಗಗಳ ಮೂಲಕ ಈ ಅಂತರವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಿಸುತ್ತದೆ.'
                  : 'Every agricultural season, welfare assistance goes uncollected simply because notifications are locked inside bureaucratic PDF portals. Kisan Scheme Saathi eliminates information asymmetry, empowers smallholders with voice accessibility in their native language, and delivers rightful subsidies straight to verified bank accounts.'}
              </p>

              {/* Verified Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-forest-800/80 text-sm md:text-base text-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest-700 flex items-center justify-center text-[#F5DABF] text-xs font-bold">✓</div>
                  <span className="font-medium">100% Free Public Service (ಸಂಪೂರ್ಣ ಉಚಿತ)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest-700 flex items-center justify-center text-[#F5DABF] text-xs font-bold">✓</div>
                  <span className="font-medium">Direct Benefit Transfer (DBT) Ready</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest-700 flex items-center justify-center text-[#F5DABF] text-xs font-bold">✓</div>
                  <span className="font-medium">Bhoomi RTC Land Records Integrated</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-forest-700 flex items-center justify-center text-[#F5DABF] text-xs font-bold">✓</div>
                  <span className="font-medium">Kannada & English Voice Support</span>
                </div>
              </div>
            </div>

            {/* Right Monolithic Ledger - Harmonized forest-950 container */}
            <div className="w-full lg:w-2/5 grid grid-cols-2 divide-x divide-y divide-forest-800/80 border border-forest-800/80 rounded-2xl bg-forest-950 overflow-hidden shadow-lg">
              <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif-heading text-[#F5DABF] mb-1">
                  31
                </span>
                <span className="text-xs sm:text-sm font-bold text-forest-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆಗಳು' : 'Karnataka Districts'}
                </span>
              </div>

              <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center border-t-0">
                <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif-heading text-[#F5DABF] mb-1">
                  15+
                </span>
                <span className="text-xs sm:text-sm font-bold text-forest-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಕೃಷಿ ಯೋಜನೆಗಳು' : 'Govt Schemes'}
                </span>
              </div>

              <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif-heading text-[#F5DABF] mb-1">
                  ₹0
                </span>
                <span className="text-xs sm:text-sm font-bold text-forest-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಶೂನ್ಯ ದಲ್ಲಾಳಿ ಶುಲ್ಕ' : 'Commission Free'}
                </span>
              </div>

              <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif-heading text-[#F5DABF] mb-1">
                  2
                </span>
                <span className="text-xs sm:text-sm font-bold text-forest-100 uppercase tracking-wider">
                  {language === 'kn' ? 'ಭಾಷೆಗಳು (ಕನ್ನಡ & EN)' : 'Bilingual Voice'}
                </span>
              </div>
            </div>

          </div>

          {/* Call to Action Banner */}
          <div className="mt-12 pt-8 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl sm:text-2xl font-bold font-serif-heading text-amber-100">
                {language === 'kn' ? 'ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಭೂಮಿಗೆ ಸೂಕ್ತ ಯೋಜನೆ ತಿಳಿಯಿರಿ' : 'Ready to check your farm scheme eligibility?'}
              </h4>
              <p className="text-sm sm:text-base text-stone-200 mt-1 font-normal">
                {language === 'kn' ? 'ಕೇವಲ 2 ನಿಮಿಷಗಳ ಉಚಿತ ಪರಿಶೀಲನೆ. ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ.' : 'Takes under 2 minutes. Free and accessible to all farmers.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigateToAuth('eligibility', 'register')}
                className="flex-1 sm:flex-initial px-7 py-3.5 rounded-full bg-[#6C151E] hover:bg-[#521016] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-95"
              >
                {t.checkEligibility}
              </button>
              <button
                type="button"
                onClick={() => navigateToAuth('dashboard', 'register')}
                className="flex-1 sm:flex-initial px-7 py-3.5 rounded-full border border-forest-400 hover:bg-forest-800 text-white font-bold text-sm sm:text-base transition-all active:scale-95"
              >
                {language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Free Account'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* COMPREHENSIVE GOVERNMENT-STANDARD FOOTER - Harmonized forest-950   */}
      {/* =================================================================== */}
      <footer className="bg-forest-950 text-stone-200 border-t border-forest-800/80 mt-auto">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* Col 1: Brand & Ministry Reference */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-emblem.png"
                  alt="Kisan Scheme Saathi Emblem"
                  className="w-12 h-12 object-contain bg-white/95 rounded-full p-1 border border-forest-600/40"
                />
                <div>
                  <h3 className="font-serif-heading font-bold text-lg text-white">
                    Kisan Scheme <span className="text-[#F5DABF]">Saathi</span>
                  </h3>
                  <p className="text-xs uppercase font-bold tracking-wider text-forest-200">
                    Government Schemes Portal
                  </p>
                </div>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed max-w-sm font-normal">
                Dedicated digital empowerment platform connecting Indian farming families with central and state agricultural subsidies, crop insurance, and subsidized production loans.
              </p>
              <div className="pt-2 text-xs sm:text-sm text-forest-200 flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-400" />
                <span>Active Data Sync: Karnataka Bhoomi & FRUITS</span>
              </div>
            </div>

            {/* Col 2: Schemes by Category */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5DABF] mb-4">
                Schemes
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-300">
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM-KISAN Samman Nidhi</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Kisan Credit Card (KCC)</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM Fasal Bima Yojana</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">PM Krishi Sinchayee</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Karnataka Raitha Siri</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Ganga Kalyana Scheme</button></li>
              </ul>
            </div>

            {/* Col 3: Portal Features */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5DABF] mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-300">
                <li><button onClick={() => navigateToAuth('eligibility', 'register')} className="hover:text-white transition-colors">Eligibility Questionnaire</button></li>
                <li><button onClick={() => navigateToAuth('explore', 'login')} className="hover:text-white transition-colors">Document Checklist</button></li>
                <li><button onClick={() => navigateToAuth('reminders', 'login')} className="hover:text-white transition-colors">Seasonal Reminders</button></li>
                <li><button onClick={() => navigateToAuth('dashboard', 'login')} className="hover:text-white transition-colors">Farmer Dashboard</button></li>
                <li><button onClick={() => navigateToAuth('dashboard', 'login')} className="hover:text-white transition-colors">Official Application Links</button></li>
              </ul>
            </div>

            {/* Col 4: Official Helpline & Grievance */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#F5DABF] mb-4">
                Support & Contact
              </h4>
              <ul className="space-y-2.5 text-sm text-stone-300">
                <li className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
                  <PhoneCall className="w-4 h-4 text-[#F5DABF]" />
                  <span>1800-180-1551 (Toll Free)</span>
                </li>
                <li>Kisan Call Centre (24x7)</li>
                <li>Raitha Samparka Kendra (RSK)</li>
                <li>Grama One Service Centres</li>
                <li className="pt-2 text-xs sm:text-sm text-stone-300 font-medium">
                  Department of Agriculture, Govt. of Karnataka
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="mt-12 pt-8 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-stone-400 font-medium">
            <p>
              © {new Date().getFullYear()} Kisan Scheme Saathi. Karnataka Public E-Governance Platform.
            </p>
            <p className="text-center sm:text-right">
              Curated from verified central and Karnataka state gazettes.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
