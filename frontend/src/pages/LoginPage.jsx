import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ArrowLeft,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit2,
  ArrowRight,
  Volume2,
  Check,
  CheckSquare,
  FileText,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStates, getDistricts, getTaluks } from '../data/locationData';

export default function LoginPage({ initialMode = 'login' }) {
  const {
    setCurrentPage,
    language,
    toggleLanguage,
    t,
    setProfile,
    setWizardData,
    intendedDestination,
    setIntendedDestination,
    speakText,
    stopSpeaking,
    isSpeaking
  } = useApp();

  // Silence speech synthesis immediately if login page unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');

  useEffect(() => {
    setIsSignUp(initialMode === 'register');
  }, [initialMode]);

  // LOGIN STATE (OTP-based, starts empty without fake data)
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtpBoxes, setLoginOtpBoxes] = useState(['', '', '', '', '', '']);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginCountdown, setLoginCountdown] = useState(30);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // SIGN UP / CREATE ACCOUNT STATE (OTP-based, starts empty)
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    mobile: '',
    state: 'Karnataka',
    district: '',
    taluk: ''
  });
  const [signupOtpBoxes, setSignupOtpBoxes] = useState(['', '', '', '', '', '']);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupCountdown, setSignupCountdown] = useState(30);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // OTP input box refs
  const loginInputRefs = useRef([]);
  const signupInputRefs = useRef([]);

  // Countdown timer for Login OTP resend
  useEffect(() => {
    let timer;
    if (loginOtpSent && loginCountdown > 0) {
      timer = setInterval(() => {
        setLoginCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginOtpSent, loginCountdown]);

  // Countdown timer for Signup OTP resend
  useEffect(() => {
    let timer;
    if (signupOtpSent && signupCountdown > 0) {
      timer = setInterval(() => {
        setSignupCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupOtpSent, signupCountdown]);

  // Location Cascade Handlers for Registration
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setSignupForm(prev => ({
      ...prev,
      state: selectedState,
      district: '',
      taluk: ''
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setSignupForm(prev => ({
      ...prev,
      district: selectedDistrict,
      taluk: ''
    }));
  };

  const handleTalukChange = (e) => {
    setSignupForm(prev => ({
      ...prev,
      taluk: e.target.value
    }));
  };

  // SEND OTP FOR LOGIN
  const handleSendLoginOtp = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanNum = loginMobile.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setLoginError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 10-ಅಂಕಿಯ ಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setLoginOtpSent(true);
    setLoginCountdown(30);
    setLoginOtpBoxes(['', '', '', '', '', '']);
  };

  // OTP BOX CHANGE HANDLER (Login)
  const handleLoginBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newBoxes = [...loginOtpBoxes];
    newBoxes[index] = digit;
    setLoginOtpBoxes(newBoxes);

    if (digit && index < 5) {
      loginInputRefs.current[index + 1]?.focus();
    }
  };

  const handleLoginBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !loginOtpBoxes[index] && index > 0) {
      loginInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginBoxPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newBoxes = [...loginOtpBoxes];
    digits.forEach((digit, i) => {
      if (i < 6) newBoxes[i] = digit;
    });
    setLoginOtpBoxes(newBoxes);
    const nextIdx = Math.min(digits.length, 5);
    loginInputRefs.current[nextIdx]?.focus();
  };

  // VERIFY OTP FOR LOGIN
  const handleVerifyLoginOtp = (e) => {
    e.preventDefault();
    setLoginError('');

    const otpCode = loginOtpBoxes.join('');
    if (otpCode.length < 6) {
      setLoginError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ನಮೂದಿಸಿ'
          : 'Please enter the complete 6-digit verification code'
      );
      return;
    }

    setLoginSuccess(true);
    setTimeout(() => {
      const destination = intendedDestination && intendedDestination !== 'landing' ? intendedDestination : 'dashboard';
      setIntendedDestination('dashboard');
      setCurrentPage(destination);
    }, 900);
  };

  // RESEND LOGIN OTP
  const handleResendLoginOtp = () => {
    setLoginCountdown(30);
    setLoginOtpBoxes(['', '', '', '', '', '']);
    setLoginError('');
  };

  // SEND OTP FOR SIGN UP / REGISTER
  const handleSendSignupOtp = (e) => {
    e.preventDefault();
    setSignupError('');

    if (!signupForm.fullName.trim()) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter your full name');
      return;
    }

    const cleanNum = signupForm.mobile.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      setSignupError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 10-ಅಂಕಿಯ ಮಾನ್ಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    if (!signupForm.district) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Please select your district');
      return;
    }

    if (!signupForm.taluk) {
      setSignupError(language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ತಾಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Please select your taluk');
      return;
    }

    setSignupOtpSent(true);
    setSignupCountdown(30);
    setSignupOtpBoxes(['', '', '', '', '', '']);
  };

  // OTP BOX CHANGE HANDLER (Signup)
  const handleSignupBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newBoxes = [...signupOtpBoxes];
    newBoxes[index] = digit;
    setSignupOtpBoxes(newBoxes);

    if (digit && index < 5) {
      signupInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSignupBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !signupOtpBoxes[index] && index > 0) {
      signupInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSignupBoxPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const digits = pastedData.split('');
    const newBoxes = [...signupOtpBoxes];
    digits.forEach((digit, i) => {
      if (i < 6) newBoxes[i] = digit;
    });
    setSignupOtpBoxes(newBoxes);
    const nextIdx = Math.min(digits.length, 5);
    signupInputRefs.current[nextIdx]?.focus();
  };

  // VERIFY OTP AND COMPLETE REGISTRATION
  const handleVerifySignupOtp = (e) => {
    e.preventDefault();
    setSignupError('');

    const otpCode = signupOtpBoxes.join('');
    if (otpCode.length < 6) {
      setSignupError(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಒಟಿಪಿ ನಮೂದಿಸಿ'
          : 'Please enter the complete 6-digit verification code'
      );
      return;
    }

    const formattedMobile = signupForm.mobile.startsWith('+91')
      ? signupForm.mobile
      : `+91 ${signupForm.mobile.replace(/\D/g, '')}`;

    setProfile(prev => ({
      ...prev,
      name: signupForm.fullName,
      mobile: formattedMobile || prev.mobile,
      state: signupForm.state,
      district: signupForm.district,
      taluk: signupForm.taluk
    }));

    setWizardData(prev => ({
      ...prev,
      fullName: signupForm.fullName,
      state: signupForm.state,
      district: signupForm.district,
      taluk: signupForm.taluk
    }));

    setSignupSuccess(true);
    setTimeout(() => {
      const destination = intendedDestination && intendedDestination !== 'landing' ? intendedDestination : 'dashboard';
      setIntendedDestination('dashboard');
      setCurrentPage(destination);
    }, 1000);
  };

  // RESEND SIGNUP OTP
  const handleResendSignupOtp = () => {
    setSignupCountdown(30);
    setSignupOtpBoxes(['', '', '', '', '', '']);
    setSignupError('');
  };

  // Voice narration helper
  const handleVoiceHelp = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const message = isSignUp
      ? (language === 'kn'
        ? 'ರೈತ ನೋಂದಣಿ: ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಜಮೀನಿನ ತಾಲೂಕನ್ನು ಆಯ್ಕೆಮಾಡಿ ಒಟಿಪಿ ಪಡೆಯಿರಿ.'
        : 'Farmer Registration: Enter your name, mobile number and taluk, then click send OTP.')
      : (language === 'kn'
        ? 'ರೈತ ಲಾಗಿನ್: ದಯವಿಟ್ಟು ನಿಮ್ಮ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ಮತ್ತು ಒಟಿಪಿ ಪಡೆಯಿರಿ.'
        : 'Farmer Login: Enter your 10-digit mobile number and get OTP to sign in.');
    speakText(message);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-cream-100 font-sans selection:bg-[#7C1A22] selection:text-white">

      {/* ============================================================ */}
      {/* LEFT PANEL: Matches 02_Login_Page.png Design Mockup          */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[46%] xl:w-[44%] lg:min-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden bg-[#0A3D2A] text-white">

        {/* Top: Home Navigation Button */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/90 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-full border border-emerald-400/20 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </button>
        </div>

        {/* Center: Official Brand Logo & Actual Portal Features */}
        <div className="relative z-10 my-auto py-3 lg:py-6 space-y-3 lg:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/95 p-1.5 sm:p-2 shadow-xl border-2 border-amber-300/60 flex items-center justify-center flex-shrink-0">
              <img
                src="/logo-emblem.png"
                alt="Kisan Scheme Saathi Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif-heading font-bold text-white tracking-tight leading-tight">
                Kisan Scheme <span className="text-amber-300">Saathi</span>
              </h1>
              <p className="text-emerald-200/90 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5">
                {language === 'kn' ? 'ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್' : 'Government Agricultural Schemes Portal'}
              </p>
            </div>
          </div>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-md font-normal hidden sm:block">
            {language === 'kn'
              ? 'ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಕೃಷಿ ಸಬ್ಸಿಡಿಗಳು, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಧನಸಹಾಯ ಯೋಜನೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಕಂಡುಕೊಳ್ಳಿ.'
              : 'Discover central and Karnataka state agricultural subsidies, crop insurance, and financial benefits tailored to your farm.'}
          </p>

          {/* Genuine Portal Features (visible on desktop) */}
          <div className="space-y-2.5 pt-1 hidden lg:block">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              {language === 'kn' ? 'ಪೋರ್ಟಲ್‌ನ ಪ್ರಮುಖ ಸೇವೆಗಳು' : 'Key Portal Features'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Feature 1: Eligibility Checker */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <CheckSquare className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಅರ್ಹತಾ ಪರಿಶೀಲನೆ' : 'Check Eligibility'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಬೆಳೆಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.'
                    : 'Match central and state schemes suited for your land size and crop.'}
                </p>
              </div>

              {/* Feature 2: Document Checklist */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ದಾಖಲೆಗಳ ಪಟ್ಟಿ' : 'Document Checklist'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಬೇಕಾದ ದಾಖಲೆಗಳ (ಆಧಾರ್, ಭೂಮಿ RTC, FRUITS ID) ನಿಖರ ವಿವರ.'
                    : 'Know the required documents (Bhoomi RTC, FRUITS FID, Aadhaar) beforehand.'}
                </p>
              </div>

              {/* Feature 3: Official Application Guide */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಅರ್ಜಿ ಮಾರ್ಗದರ್ಶಿ' : 'Application Guide'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಹಂತ-ಹಂತದ ವಿಧಾನ.'
                    : 'Step-by-step instructions and direct links to official government portals.'}
                </p>
              </div>

              {/* Feature 4: Bilingual Voice Assistance */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>{language === 'kn' ? 'ಧ್ವನಿ ಓದುವ ಸಹಾಯಕ' : 'Voice Assistance'}</span>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-snug">
                  {language === 'kn'
                    ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಯೋಜನೆಗಳ ವಿವರಗಳನ್ನು ಧ್ವನಿಯ ಮೂಲಕ ಆಲಿಸಿ.'
                    : 'Listen to scheme criteria and guidance read aloud in Kannada and English.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* RIGHT AUTH PANEL: Clean, Fast, OTP-Based Authentication     */}
      {/* ============================================================ */}
      <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-cream-100">

        {/* Top Controls: Voice Assist & Language Switcher */}
        <div className="flex items-center justify-between pb-6">
          <button
            type="button"
            onClick={handleVoiceHelp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-xs font-bold border border-emerald-300/70 transition-all shadow-xs active:scale-95"
            title="Listen to instructions"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>{language === 'kn' ? 'ಧ್ವನಿ ಸೂಚನೆ ಕೇಳಿ' : 'Listen Instructions'}</span>
          </button>

          {/* Bilingual Switcher Pill */}
          <div className="flex items-center p-1 bg-stone-200/80 rounded-full border border-stone-300 shadow-inner">
            <button
              onClick={() => toggleLanguage('kn')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'kn' ? 'bg-[#0A3D2A] text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-[#0A3D2A] text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Central Auth Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">

          {/* Mobile Branded Header (visible on mobile only) */}
          <div className="lg:hidden flex flex-col items-center justify-center pb-5 text-center">
            <img
              src="/logo.png"
              alt="Kisan Scheme Saathi"
              className="h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>

          {/* Title Header (Matching 02_Login_Page.png) */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-heading text-stone-900 mb-2">
              {isSignUp
                ? (language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Account')
                : (language === 'kn' ? 'ಮರಳಿ ಸ್ವಾಗತ' : 'Welcome Back')}
            </h2>
            <p className="text-stone-600 text-sm md:text-base">
              {isSignUp
                ? (language === 'kn' ? 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸುಲಭವಾಗಿ ನೋಂದಾಯಿಸಿ' : 'Register for Kisan Scheme Saathi with your mobile')
                : (language === 'kn' ? 'ನಿಮ್ಮ ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ' : 'Login to your Kisan Scheme Saathi account')}
            </p>
          </div>

          {/* Status Notifications */}
          {(loginError || signupError) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError || signupError}</span>
            </div>
          )}

          {(loginSuccess || signupSuccess) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {language === 'kn'
                  ? 'ಒಟಿಪಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ತೆರಳಲಾಗುತ್ತಿದೆ...'
                  : 'OTP verified successfully! Loading your dashboard...'}
              </span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN (100% OTP-BASED, NO PASSWORDS)              */}
          {/* ======================================================== */}
          {!isSignUp ? (
            <div>
              {!loginOtpSent ? (
                /* Step 1: Enter Mobile Number & Request OTP */
                <form onSubmit={handleSendLoginOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.mobileNumber} <span className="text-[#7C1A22]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-700 font-bold text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        placeholder={language === 'kn' ? '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Enter 10-digit mobile number'}
                        className="w-full pl-14 pr-11 py-3.5 bg-white border border-stone-300 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2A] transition-all shadow-xs text-base tracking-wider"
                        required
                        autoFocus
                      />
                      {loginMobile.replace(/\D/g, '').length === 10 && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-4 rounded-2xl bg-[#7C1A22] hover:bg-[#66151C] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{language === 'kn' ? 'ಒಟಿಪಿ ಪಡೆಯಿರಿ' : 'Get OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-4 text-center text-sm text-stone-600">
                    <span>{language === 'kn' ? 'ಖಾತೆ ಇಲ್ಲವೇ?' : "Don't have an account?"} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setLoginError('');
                        setSignupError('');
                      }}
                      className="font-bold text-[#7C1A22] underline hover:text-[#5a1322] transition-colors ml-1"
                    >
                      {language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ' : 'Create Account'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Interactive 6-Box OTP Verification */
                <form onSubmit={handleVerifyLoginOtp} className="space-y-5">
                  {/* Mobile confirmation strip */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase font-bold tracking-wider">SMS Dispatched</span>
                        <span className="font-bold text-emerald-950 text-sm">+91 {loginMobile.replace(/\D/g, '')}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLoginOtpSent(false); setLoginError(''); }}
                      className="text-xs font-bold text-[#0A3D2A] hover:text-[#7C1A22] flex items-center gap-1 underline"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t.changeMobile}</span>
                    </button>
                  </div>

                  {/* 6 Individual Interactive OTP Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {t.enterOtp} <span className="text-[#7C1A22]">*</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {language === 'kn' ? '6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್' : '6-digit SMS verification code'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
                      {loginOtpBoxes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => loginInputRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleLoginBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleLoginBoxKeyDown(idx, e)}
                          onPaste={handleLoginBoxPaste}
                          className="w-full h-11 sm:h-14 text-center font-mono font-bold text-lg sm:text-2xl bg-white border-2 border-stone-300 focus:border-[#0A3D2A] rounded-lg sm:rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A3D2A]/20 transition-all shadow-xs p-0"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown Strip */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                    <span>
                      {loginCountdown > 0 ? (
                        <span>
                          {language === 'kn' ? 'ಮರುಕಳುಹಿಸಿ:' : 'Resend OTP in'}{' '}
                          <strong className="text-stone-900 font-mono font-bold">{loginCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendLoginOtp}
                          className="font-bold text-[#7C1A22] hover:text-[#66151C] flex items-center gap-1 transition-colors underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.resendOtp}</span>
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Verify & Login CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 px-4 rounded-2xl bg-[#7C1A22] hover:bg-[#66151C] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.verifyAndLogin}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ======================================================== */
            /* TAB 2: CREATE ACCOUNT (100% OTP-BASED, NO PASSWORDS)     */
            /* ======================================================== */
            <div>
              {!signupOtpSent ? (
                /* Step 1: Farmer Registration Form */
                <form onSubmit={handleSendSignupOtp} className="space-y-4">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {t.fullName} <span className="text-[#7C1A22]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        placeholder={language === 'kn' ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು' : 'Your full name'}
                        className="w-full pl-10 pr-3.5 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2A] transition-all shadow-xs text-sm"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      {t.mobileNumber} <span className="text-[#7C1A22]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-700 font-bold text-sm">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={signupForm.mobile}
                        onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                        placeholder={language === 'kn' ? '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Enter 10-digit mobile number'}
                        className="w-full pl-14 pr-10 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2A] transition-all shadow-xs text-sm"
                        required
                      />
                      {signupForm.mobile.replace(/\D/g, '').length === 10 && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cascading Location Section: State -> District -> Taluk */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-300 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'kn' ? 'ಸ್ಥಳ ವಿವರಗಳು' : 'Location Details'}</span>
                      </span>
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        {t.state || (language === 'kn' ? 'ರಾಜ್ಯ' : 'State')} <span className="text-[#7C1A22]">*</span>
                      </label>
                      <select
                        value={signupForm.state}
                        onChange={handleStateChange}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0A3D2A] focus:outline-none cursor-pointer"
                      >
                        {getStates().map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District & Taluk in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* District Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {t.district || (language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District')} <span className="text-[#7C1A22]">*</span>
                        </label>
                        <select
                          value={signupForm.district}
                          onChange={handleDistrictChange}
                          className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0A3D2A] focus:outline-none cursor-pointer"
                          required
                        >
                          <option value="">{language === 'kn' ? '-- ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ --' : '-- Select District --'}</option>
                          {getDistricts(signupForm.state).map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      {/* Taluk Dropdown */}
                      <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">
                          {t.taluk || (language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk')} <span className="text-[#7C1A22]">*</span>
                        </label>
                        <select
                          value={signupForm.taluk}
                          onChange={handleTalukChange}
                          disabled={!signupForm.district}
                          className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 font-medium text-xs focus:ring-2 focus:ring-[#0A3D2A] focus:outline-none cursor-pointer disabled:bg-stone-100 disabled:text-stone-400"
                          required
                        >
                          <option value="">{language === 'kn' ? '-- ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ --' : '-- Select Taluk --'}</option>
                          {signupForm.district && getTaluks(signupForm.state, signupForm.district).map((taluk) => (
                            <option key={taluk} value={taluk}>{taluk}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Send OTP & Register CTA Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-4 rounded-2xl bg-[#7C1A22] hover:bg-[#66151C] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{language === 'kn' ? 'ಒಟಿಪಿ ಪಡೆಯಿರಿ' : 'Get OTP & Register'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Back to Login */}
                  <div className="pt-4 text-center text-sm text-stone-600">
                    <span>{language === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have an account?'} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setSignupError('');
                        setLoginError('');
                      }}
                      className="font-bold text-[#7C1A22] underline hover:text-[#5a1322] transition-colors ml-1"
                    >
                      {language === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Login'}
                    </button>
                  </div>

                </form>
              ) : (
                /* Step 2: Interactive 6-Box OTP for Registration */
                <form onSubmit={handleVerifySignupOtp} className="space-y-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                      <div>
                        <span className="font-bold text-stone-900 text-sm block">{signupForm.fullName}</span>
                        <span className="text-[11px] text-stone-600">+91 {signupForm.mobile.replace(/\D/g, '')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSignupOtpSent(false); setSignupError(''); }}
                        className="text-xs font-bold text-[#0A3D2A] hover:text-[#7C1A22] flex items-center gap-1 underline"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{language === 'kn' ? 'ತಿದ್ದುಪಡಿ' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="text-stone-600 text-[11px]">
                      <span>{signupForm.taluk}, {signupForm.district}, {signupForm.state}</span>
                    </div>
                  </div>

                  {/* 6 Individual Interactive OTP Boxes */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        {t.enterOtp} <span className="text-[#7C1A22]">*</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {language === 'kn' ? '6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್' : '6-digit SMS verification code'}
                      </span>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
                      {signupOtpBoxes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => signupInputRefs.current[idx] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleSignupBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleSignupBoxKeyDown(idx, e)}
                          onPaste={handleSignupBoxPaste}
                          className="w-full h-11 sm:h-14 text-center font-mono font-bold text-lg sm:text-2xl bg-white border-2 border-stone-300 focus:border-[#0A3D2A] rounded-lg sm:rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A3D2A]/20 transition-all shadow-xs p-0"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                    <span>
                      {signupCountdown > 0 ? (
                        <span>
                          {language === 'kn' ? 'ಮರುಕಳುಹಿಸಿ:' : 'Resend OTP in'}{' '}
                          <strong className="text-stone-900 font-mono font-bold">{signupCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendSignupOtp}
                          className="font-bold text-[#7C1A22] hover:text-[#66151C] flex items-center gap-1 transition-colors underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.resendOtp}</span>
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Complete Registration CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 px-4 rounded-2xl bg-[#7C1A22] hover:bg-[#66151C] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.verifyAndRegister}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
