import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { userProfileData, schemesData } from '../data/schemesData';
import { translations } from '../data/translations';
import { evaluateFarmerProfile } from '../services/eligibilityEngine';
import { evaluateSchemeEligibility } from '../services/eligibilityService';

// ========================================================
// KANNADA-TO-PHONETIC TRANSLITERATOR
// Ensures Kannada text is spoken aloud clearly via Indian
// accent engines even on PCs/browsers without native Kannada TTS
// ========================================================
const KANNADA_VOWELS = {
  '\u0C85': 'a', '\u0C86': 'aa', '\u0C87': 'i', '\u0C88': 'ee', '\u0C89': 'u',
  '\u0C8A': 'oo', '\u0C8B': 'ru', '\u0C8E': 'e', '\u0C8F': 'e', '\u0C90': 'ai',
  '\u0C92': 'o', '\u0C93': 'o', '\u0C94': 'au'
};

const KANNADA_CONSONANTS = {
  '\u0C95': 'k', '\u0C96': 'kh', '\u0C97': 'g', '\u0C98': 'gh', '\u0C99': 'ng',
  '\u0C9A': 'ch', '\u0C9B': 'chh', '\u0C9C': 'j', '\u0C9D': 'jh', '\u0C9E': 'ny',
  '\u0C9F': 't', '\u0CA0': 'th', '\u0CA1': 'd', '\u0CA2': 'dh', '\u0CA3': 'n',
  '\u0CA4': 'th', '\u0CA5': 'th', '\u0CA6': 'd', '\u0CA7': 'dh', '\u0CA8': 'n',
  '\u0CAA': 'p', '\u0CAB': 'ph', '\u0CAC': 'b', '\u0CAD': 'bh', '\u0CAE': 'm',
  '\u0CAF': 'y', '\u0CB0': 'r', '\u0CB1': 'r', '\u0CB2': 'l', '\u0CB3': 'l',
  '\u0CB5': 'v', '\u0CB6': 'sh', '\u0CB7': 'sh', '\u0CB8': 's', '\u0CB9': 'h'
};

const KANNADA_MATRAS = {
  '\u0CBE': 'aa', '\u0CBF': 'i', '\u0CC0': 'ee', '\u0CC1': 'u', '\u0CC2': 'oo',
  '\u0CC3': 'ru', '\u0CC6': 'e', '\u0CC7': 'e', '\u0CC8': 'ai', '\u0CCA': 'o',
  '\u0CCB': 'o', '\u0CCC': 'au'
};

export function transliterateKannada(text) {
  if (!text) return '';
  let out = '';
  const len = text.length;
  for (let i = 0; i < len; i++) {
    const ch = text[i];
    const next = i + 1 < len ? text[i + 1] : '';

    if (KANNADA_VOWELS[ch]) {
      out += KANNADA_VOWELS[ch];
    } else if (KANNADA_CONSONANTS[ch]) {
      const base = KANNADA_CONSONANTS[ch];
      if (next === '\u0CCD') { // Halant (virama)
        out += base;
        i++;
      } else if (KANNADA_MATRAS[next]) {
        out += base + KANNADA_MATRAS[next];
        i++;
      } else {
        out += base + 'a';
      }
    } else if (ch === '\u0C82') { // Anusvara
      out += 'm';
    } else if (ch === '\u0C83') { // Visarga
      out += 'h';
    } else {
      out += ch;
    }
  }
  return out;
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'kn'
  const [currentPage, setCurrentPageState] = useState('landing'); // 'landing', 'login', 'dashboard', 'eligibility', 'results', 'scheme-details', 'reminders', 'explore', 'profile'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('pm-kisan');
  const [profile, setProfile] = useState(userProfileData);
  const [reminders, setReminders] = useState({
    'pm-fasal-bima': true,
    'rkvy': true
  });
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    fullName: 'Sujay H S',
    age: '25',
    gender: 'Male',
    category: 'General',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    taluk: 'Hoskote',
    landHolding: '2.0',
    landType: 'Marginal (< 2.5 Acres)',
    cropType: 'Ragi & Cereals',
    irrigationType: 'Borewell & Rainfed',
    annualIncome: 'Below 1 Lakh',
    aadhaarLinked: true,
    fruitsRegistered: true
  });

  // Dynamic Scheme Eligibility State — evaluated deterministically based on farmer profile
  const [evaluatedSchemes, setEvaluatedSchemes] = useState(() => evaluateFarmerProfile({
    fullName: 'Sujay H S',
    age: '25',
    gender: 'Male',
    category: 'General',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    taluk: 'Hoskote',
    landHolding: '2.0',
    cropType: 'Ragi & Cereals',
    irrigationType: 'Borewell & Rainfed',
    annualIncome: 'Below 1 Lakh',
    aadhaarLinked: true,
    fruitsRegistered: true
  }));
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Evaluate schemes against farmer profile (hits backend or uses offline rules engine)
  const evaluateEligibility = useCallback(async (profileOverride = null) => {
    setIsEvaluating(true);
    const targetProfile = profileOverride || wizardData;
    try {
      const result = await evaluateSchemeEligibility(targetProfile);
      if (result && Array.isArray(result.schemes)) {
        setEvaluatedSchemes(result.schemes);
        return result.schemes;
      }
    } catch (err) {
      console.warn('Evaluation error, using local rules:', err);
    } finally {
      setIsEvaluating(false);
    }
    const fallback = evaluateFarmerProfile(targetProfile);
    setEvaluatedSchemes(fallback);
    return fallback;
  }, [wizardData]);

  const t = translations[language] || translations.en;

  // Reference to prevent Chromium GC bug and manage speech timers
  const currentUtteranceRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Dedicated speech termination function
  const stopSpeaking = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onstart = null;
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.pause();
        }
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancel notice:', e);
      }
    }
    setIsSpeaking(false);
  }, []);

  // Synchronously stops voice narration the instant the page shifts
  const setCurrentPage = useCallback((newPage) => {
    stopSpeaking();
    setIsMobileMenuOpen(false);
    setCurrentPageState(newPage);
  }, [stopSpeaking]);

  // Reactive listener to guarantee speech cuts off on every route shift
  useEffect(() => {
    stopSpeaking();
  }, [currentPage, stopSpeaking]);

  // Silence speech synthesis when browser tab is minimized or switched
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopSpeaking();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopSpeaking]);

  const toggleLanguage = useCallback((lang) => {
    stopSpeaking();
    if (typeof lang === 'string' && (lang === 'kn' || lang === 'en')) {
      setLanguage(lang);
    } else {
      setLanguage(prev => (prev === 'kn' ? 'en' : 'kn'));
    }
  }, [stopSpeaking]);

  const toggleReminder = (schemeId) => {
    setReminders(prev => ({
      ...prev,
      [schemeId]: !prev[schemeId]
    }));
  };

  // ========================================================
  // INDIAN VOICE & SPEECH SYNTHESIS ENGINE
  // ========================================================
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState('female'); // 'female' or 'male'
  const [speechSpeed, setSpeechSpeed] = useState(0.92);

  // Initialize and dynamically track available speech voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const populateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Helper to discover and prioritize genuine Indian accented voices
  const getBestIndianVoice = useCallback((targetLang, gender = selectedVoiceGender) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return { voice: null, isNativeKannada: false };
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length === 0) return { voice: null, isNativeKannada: false };

    const isKannada = targetLang === 'kn';

    if (isKannada) {
      // 1. Direct native Kannada voice if installed on device
      const knVoice = voices.find(v => {
        const name = (v.name || '').toLowerCase();
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        return vLang.startsWith('kn') || name.includes('kannada') || name.includes('sapna') || name.includes('gagan');
      });
      if (knVoice) {
        return { voice: knVoice, isNativeKannada: true };
      }
    }

    // 2. Authentic Indian English Voices (speaks English and phonetic Kannada naturally)
    const femaleIndianNames = ['heera', 'neerja', 'veena', 'sangeeta', 'priya', 'aditi', 'swara', 'isha'];
    const maleIndianNames = ['ravi', 'prabhat', 'rishi', 'madhav', 'gagan', 'karan'];

    const targetNames = gender === 'female' 
      ? [...femaleIndianNames, ...maleIndianNames]
      : [...maleIndianNames, ...femaleIndianNames];

    // Priority 1: Match preferred gender Indian voice by name
    for (const nameKey of targetNames) {
      const match = voices.find(v => {
        const name = (v.name || '').toLowerCase();
        const vLang = (v.lang || '').toLowerCase().replace('_', '-');
        return (vLang.includes('in') || name.includes('india')) && name.includes(nameKey);
      });
      if (match) return { voice: match, isNativeKannada: false };
    }

    // Priority 2: Any voice tagged en-IN
    const enInVoice = voices.find(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      return vLang === 'en-in';
    });
    if (enInVoice) return { voice: enInVoice, isNativeKannada: false };

    // Priority 3: Any voice with "India" in its name
    const anyIndiaVoice = voices.find(v => {
      const name = (v.name || '').toLowerCase();
      return name.includes('india') || name.includes('indian');
    });
    if (anyIndiaVoice) return { voice: anyIndiaVoice, isNativeKannada: false };

    // Fallback: Default system voice
    const defaultVoice = voices.find(v => v.default) || voices[0] || null;
    return { voice: defaultVoice, isNativeKannada: false };
  }, [selectedVoiceGender]);

  // Speech function with authentic Indian accent & guaranteed Kannada playback
  const speakText = useCallback((text, options = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Immediately cancel and clear any existing/pending utterance
    stopSpeaking();

    if (!text || !text.trim()) return;

    const targetLang = options.lang || language;
    const { voice, isNativeKannada } = getBestIndianVoice(targetLang, options.gender || selectedVoiceGender);

    // If text contains Kannada script and no native Kannada voice is on this machine:
    // Transliterate to phonetic Kannada so Indian English voice speaks fluent, understandable Kannada!
    let textToSpeak = text;
    const hasKannadaScript = /[\u0C80-\u0CFF]/.test(text);

    if (hasKannadaScript && !isNativeKannada) {
      textToSpeak = transliterateKannada(text);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtteranceRef.current = utterance; // Retain reference to prevent GC silence bug

    if (voice) {
      utterance.voice = voice;
      utterance.lang = isNativeKannada ? 'kn-IN' : (voice.lang || 'en-IN');
    } else {
      utterance.lang = isNativeKannada ? 'kn-IN' : 'en-IN';
    }

    // Measured rate for clear, authentic Indian cadence and easy comprehension
    utterance.rate = options.rate !== undefined ? options.rate : (speechSpeed || 0.92);
    utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    // Stored in speakTimeoutRef so stopSpeaking can clear it if page shifts before 40ms
    speakTimeoutRef.current = setTimeout(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      }
    }, 40);
  }, [language, speechSpeed, selectedVoiceGender, getBestIndianVoice, stopSpeaking]);

  // Active voice diagnostics
  const getActiveVoiceInfo = useCallback(() => {
    const { voice, isNativeKannada } = getBestIndianVoice(language, selectedVoiceGender);
    if (voice) {
      return {
        name: voice.name,
        lang: voice.lang,
        isNativeKannada,
        mode: isNativeKannada ? 'Native Kannada Engine' : 'Indian Voice Accent Engine (Phonetic Transliteration)'
      };
    }
    return {
      name: language === 'kn' ? 'Phonetic Kannada (Indian Engine)' : 'Indian English (en-IN) Natural Voice',
      lang: language === 'kn' ? 'kn-IN' : 'en-IN',
      isNativeKannada: false,
      mode: 'Indian Accent Engine'
    };
  }, [language, selectedVoiceGender, getBestIndianVoice]);

  const [intendedDestination, setIntendedDestination] = useState('dashboard');

  const navigateToAuth = useCallback((destination = 'dashboard', mode = 'login') => {
    stopSpeaking();
    setIntendedDestination(destination);
    setCurrentPage(mode);
  }, [stopSpeaking, setCurrentPage]);

  const [detailsReferrer, setDetailsReferrer] = useState('explore');

  const openSchemeDetails = useCallback((schemeId, referrer) => {
    stopSpeaking();
    setSelectedSchemeId(schemeId);
    setDetailsReferrer(referrer || currentPage);
    setCurrentPage('scheme-details');
  }, [stopSpeaking, currentPage, setCurrentPage]);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      currentPage,
      setCurrentPage,
      intendedDestination,
      setIntendedDestination,
      navigateToAuth,
      selectedSchemeId,
      setSelectedSchemeId,
      detailsReferrer,
      setDetailsReferrer,
      openSchemeDetails,
      profile,
      setProfile,
      reminders,
      toggleReminder,
      wizardStep,
      setWizardStep,
      wizardData,
      setWizardData,
      speakText,
      stopSpeaking,
      speechSpeed,
      setSpeechSpeed,
      selectedVoiceGender,
      setSelectedVoiceGender,
      isSpeaking,
      getActiveVoiceInfo,
      availableVoices,
      schemes: evaluatedSchemes,
      evaluatedSchemes,
      evaluateEligibility,
      isEvaluating,
      isMobileMenuOpen,
      setIsMobileMenuOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
