import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { userProfileData, schemesData } from '../data/schemesData';
import { translations } from '../data/translations';
import { evaluateFarmerProfile } from '../services/eligibilityEngine';
import { evaluateSchemeEligibility } from '../services/eligibilityService';
import { getApiUrl } from '../services/apiConfig';

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

function computeAgeFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const age = Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
  return age >= 0 && age <= 120 ? age : null;
}

export function createProfileFromUser(u) {
  if (!u) return userProfileData;
  const rawFruits = u.fruitsId ? String(u.fruitsId).trim() : '';
  const cleanFruitsId = rawFruits && !rawFruits.startsWith('KA-FRUITS-') && !rawFruits.startsWith('FID-KA-')
    ? rawFruits
    : null;

  const cleanDob = u.dob && String(u.dob).trim() && u.dob !== '25 Aug 2004' ? String(u.dob).trim() : null;
  const cleanAge = u.age !== undefined && u.age !== null && u.age !== '' ? Number(u.age) : computeAgeFromDob(cleanDob);
  const cleanGender = u.gender && String(u.gender).trim() ? String(u.gender).trim() : null;

  return {
    id: u.id || '',
    name: u.fullName || u.name || 'Farmer',
    fullName: u.fullName || u.name || 'Farmer',
    mobile: u.phoneNumber || u.mobile || '',
    dob: cleanDob,
    age: cleanAge,
    gender: cleanGender,
    category: u.category || 'General',
    district: u.district || 'Dharwad',
    taluk: u.taluk || '',
    state: u.state || 'Karnataka',
    landHolding: u.landHolding ? (String(u.landHolding).includes('Acres') ? String(u.landHolding) : `${u.landHolding} Acres`) : '2.0 Acres',
    landType: u.landType || 'Marginal (< 2.5 Acres)',
    cropType: u.cropType || 'Ragi & Vegetables',
    irrigation: u.irrigationType || u.irrigation || 'Rainfed & Borewell',
    irrigationType: u.irrigationType || u.irrigation || 'Rainfed & Borewell',
    annualIncome: u.annualIncome || 'Below 1 Lakh',
    fruitsId: cleanFruitsId,
    fruitsRegistered: Boolean(cleanFruitsId),
    aadhaarStatus: 'Linked & Active'
  };
}

export function createWizardFromUser(u) {
  const baseDefaults = {
    // 1. Basic Details
    fullName: '',
    preferredLanguage: 'Kannada',
    state: 'Karnataka',
    district: 'Dharwad',
    taluk: 'Dharwad',
    village: '',
    age: '',
    dob: null,
    gender: '', // 'Woman', 'Man', 'Other', 'Prefer not to say'
    phoneNumber: '',
    category: 'General', // 'General', 'OBC', 'SC', 'ST', 'Other', 'Prefer not to say'
    isMinority: 'No', // 'Yes', 'No', 'Prefer not to say'

    // 2. Farm Details
    landLocationType: 'same_as_village', // 'same_as_village' | 'other_location'
    farmLocationDesc: '',
    cultivationArrangement: 'Own land', // 'Own land', 'Lease or rent', 'Sharecropping', 'Family land', 'Other'
    landHolding: '2.0',
    landUnit: 'Acres', // 'Acres', 'Hectares', 'Guntas'
    landType: 'Marginal (< 2.5 Acres)',
    landOwned: '2.0', // 'None' or number
    landRecordOwner: 'My name', // 'My name', 'Joint ownership', 'Family member', 'Landowner', 'Not sure'
    cropsGrown: ['Ragi & Millets'], // multi-select array
    cropType: 'Ragi & Millets',
    cropSeason: 'Kharif', // 'Kharif', 'Rabi', 'Summer', 'Throughout the year', 'Not sure'
    irrigationSource: 'Borewell', // 'Rain only', 'Borewell', 'Open well', 'Canal', 'Pond', 'Other'
    irrigationType: 'Borewell & Rainfed',
    microIrrigation: 'Neither', // 'Drip', 'Sprinkler', 'Both', 'Neither'
    alliedActivities: ['None'], // multi-select array

    // 3. Additional Info: Support Needed & Readiness
    supportNeeded: ['income_support', 'crop_insurance'],
    applicantType: 'Individual', // 'Individual', 'Farmer group', 'FPO', 'Cooperative', 'Other'
    hasReceivedPastBenefits: 'No', // 'Yes', 'No', 'Not sure'
    pastBenefitScheme: '',
    pastBenefitYear: '',
    applicationStatusForSupport: 'Not applied', // 'Not applied', 'Applied', 'Approved', 'Rejected', 'Not sure'
    wantsReminders: true,

    // Document Readiness Checklist
    docReadiness: {
      aadhaar: 'available',
      bank_account: 'available',
      land_record: 'available',
      fruits_id: 'not_sure',
      caste_cert: 'not_available',
      income_cert: 'not_available',
      crop_survey: 'available',
      lease_doc: 'not_available'
    },

    // 4. Follow-up Questions (answers mapped per support type)
    followUps: {
      incomeSupportFamilyReceived: 'No',
      incomeSupportLandInName: 'My name',
      creditActiveLoanOrKCC: 'No',
      creditPurpose: 'Seasonal crop cultivation',
      irrigationCoverArea: '2.0',
      irrigationWaterAvailable: 'Yes',
      milletTypes: 'Ragi (Finger Millet)',
      milletArea: '2.0',
      insuranceCropAndSeason: 'Ragi - Kharif',
      insuranceAlreadyEnrolled: 'Not enrolled yet',
      machineryNeeds: 'Tractor & implements',
      machineryPreference: 'rent', // 'rent' | 'purchase' | 'establish_chc'
      borewellExistingSource: 'No borewell on farm',
      borewellType: 'Individual small/marginal farmer',
      horticultureStructure: 'Greenhouse / Polyhouse',
      horticultureStage: 'New project'
    },

    annualIncome: 'Below 1 Lakh',
    aadhaarLinked: true,
    fruitsRegistered: false,
    fruitsId: null,
    isConfirmed: false
  };

  if (!u) {
    return baseDefaults;
  }

  const rawHolding = u.landHolding ? String(u.landHolding).replace(/[^0-9.]/g, '') : '2.0';
  const rawFruits = u.fruitsId ? String(u.fruitsId).trim() : '';
  const cleanFruitsId = rawFruits && !rawFruits.startsWith('KA-FRUITS-') && !rawFruits.startsWith('FID-KA-')
    ? rawFruits
    : null;

  const cleanDob = u.dob && String(u.dob).trim() && u.dob !== '25 Aug 2004' ? String(u.dob).trim() : null;
  const cleanAge = u.age !== undefined && u.age !== null && u.age !== '' ? String(u.age) : (cleanDob ? String(computeAgeFromDob(cleanDob) || '') : '');
  const cleanGender = u.gender && String(u.gender).trim() ? String(u.gender).trim() : '';

  return {
    ...baseDefaults,
    fullName: u.fullName || u.name || 'Farmer',
    dob: cleanDob,
    age: cleanAge,
    gender: cleanGender,
    phoneNumber: u.phoneNumber || u.mobile || '',
    category: u.category || 'General',
    state: u.state || 'Karnataka',
    district: u.district || 'Dharwad',
    taluk: u.taluk || '',
    village: u.village || '',
    landHolding: rawHolding || '2.0',
    landOwned: rawHolding || '2.0',
    landType: u.landType || 'Marginal (< 2.5 Acres)',
    cropType: u.cropType || 'Ragi & Millets',
    irrigationType: u.irrigationType || u.irrigation || 'Borewell & Rainfed',
    annualIncome: u.annualIncome || 'Below 1 Lakh',
    aadhaarLinked: true,
    fruitsRegistered: Boolean(cleanFruitsId),
    fruitsId: cleanFruitsId
  };
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'kn'
  const [currentPage, setCurrentPageState] = useState('landing'); // 'landing', 'login', 'dashboard', 'eligibility', 'results', 'scheme-details', 'reminders', 'explore', 'profile'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState('pm-kisan');

  // Authenticated user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem('kisan_auth_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_auth_user');
      if (saved) {
        return createProfileFromUser(JSON.parse(saved));
      }
    } catch (e) {}
    return userProfileData;
  });

  const [reminders, setReminders] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kisan_auth_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const userKey = u.id || u.phoneNumber;
        const saved = localStorage.getItem(`kisan_reminders_${userKey}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {}
    return {};
  });
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_auth_user');
      if (saved) {
        return createWizardFromUser(JSON.parse(saved));
      }
    } catch (e) {}
    return createWizardFromUser(null);
  });

  // Eligibility Flow Mode: 'ai-chat' (default AI Assistant first) | 'form' (4-Stage Common Profile Form)
  const [eligibilityMode, setEligibilityMode] = useState('ai-chat');

  // Dynamic Scheme Eligibility State — evaluated deterministically based on farmer profile
  const [evaluatedSchemes, setEvaluatedSchemes] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_auth_user');
      if (saved) {
        return evaluateFarmerProfile(createWizardFromUser(JSON.parse(saved)));
      }
    } catch (e) {}
    return evaluateFarmerProfile(createWizardFromUser(null));
  });
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
  const audioPlayerRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Dedicated speech termination function (defined before any handlers that call it)
  const stopSpeaking = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    // Stop Murf AI audio player if playing
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.onplay = null;
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onerror = null;
        audioPlayerRef.current.src = '';
      } catch (e) {}
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

  // Login handler that stores user, updates profile, and re-evaluates scheme eligibility
  const loginUser = useCallback(async (userData, token) => {
    if (token) {
      try {
        localStorage.setItem('kisan_auth_token', token);
      } catch (e) {}
      setAuthToken(token);
    }
    if (userData) {
      try {
        localStorage.setItem('kisan_auth_user', JSON.stringify(userData));
      } catch (e) {}
      setCurrentUser(userData);
      const newProfile = createProfileFromUser(userData);
      const newWizard = createWizardFromUser(userData);
      setProfile(newProfile);
      setWizardData(newWizard);

      // Load user-specific reminders (starts empty {} for any new account, no preloaded mock data)
      const userKey = userData.id || userData.phoneNumber;
      let userReminders = {};
      try {
        const local = localStorage.getItem(`kisan_reminders_${userKey}`);
        if (local) {
          userReminders = JSON.parse(local);
        }
      } catch (e) {}
      setReminders(userReminders);

      // Immediately evaluate personalized schemes for this logged in farmer
      await evaluateEligibility(newWizard);
    }
  }, [evaluateEligibility]);

  // Logout handler that clears local session and resets state
  const logoutUser = useCallback(() => {
    try {
      localStorage.removeItem('kisan_auth_token');
      localStorage.removeItem('kisan_auth_user');
    } catch (e) {}
    setCurrentUser(null);
    setAuthToken(null);
    setReminders({});
    setProfile(userProfileData);
    const defaultWizard = createWizardFromUser(null);
    setWizardData(defaultWizard);
    setEvaluatedSchemes(evaluateFarmerProfile(defaultWizard));
    stopSpeaking();
    setCurrentPageState('landing');
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

  const toggleReminder = useCallback((schemeId) => {
    setReminders(prev => {
      const updated = {
        ...prev,
        [schemeId]: !prev[schemeId]
      };
      try {
        const savedUser = localStorage.getItem('kisan_auth_user');
        const userKey = savedUser ? (JSON.parse(savedUser).id || JSON.parse(savedUser).phoneNumber) : 'guest';
        localStorage.setItem(`kisan_reminders_${userKey}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // ========================================================
  // INDIAN VOICE & SPEECH SYNTHESIS ENGINE (MURF AI + BROWSER FALLBACK)
  // ========================================================
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState('female'); // 'female' or 'male'
  const [speechSpeed, setSpeechSpeed] = useState(0.92);

  // Murf AI Studio Configuration (accent, voice ID, pitch, rate, style, model)
  const [murfStatus, setMurfStatus] = useState({ murfConfigured: false });
  const [murfConfig, setMurfConfig] = useState({
    voiceId: 'Pooja', // Kannada Female default (kn-IN, Falcon 2.1, Conversation)
    maleVoiceId: 'Harman', // Kannada Male default (kn-IN, Falcon 2.1, Conversation)
    femaleVoiceId: 'Pooja',
    locale: 'kn-IN',
    style: 'Conversation',
    model: 'Falcon 2.1',
    pitch: 0,
    rate: 0
  });

  // Query Murf AI configuration status from backend
  useEffect(() => {
    fetch(getApiUrl('/api/voice/status'))
      .then(res => res.json())
      .then(data => {
        if (data) {
          setMurfStatus(data);
          if (data.defaultVoiceId || data.maleVoiceId || data.femaleVoiceId) {
            setMurfConfig(prev => ({
              ...prev,
              voiceId: selectedVoiceGender === 'male' ? (data.maleVoiceId || 'Harman') : (data.femaleVoiceId || 'Pooja'),
              maleVoiceId: data.maleVoiceId || prev.maleVoiceId,
              femaleVoiceId: data.femaleVoiceId || prev.femaleVoiceId,
              locale: data.defaultLocale || prev.locale,
              style: data.defaultStyle || prev.style,
              model: data.defaultModel || prev.model,
              pitch: data.defaultPitch ?? prev.pitch,
              rate: data.defaultRate ?? prev.rate
            }));
          }
        }
      })
      .catch(() => {});
  }, [selectedVoiceGender]);

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

  // Fallback voice narration via Browser Web Speech API
  const speakWithBrowserSynthesis = useCallback((text, options = {}) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (!text || !text.trim()) return;

    const targetLang = options.lang || language;
    const { voice, isNativeKannada } = getBestIndianVoice(targetLang, options.gender || selectedVoiceGender);

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

    speakTimeoutRef.current = setTimeout(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      }
    }, 40);
  }, [language, speechSpeed, selectedVoiceGender, getBestIndianVoice]);

  // Primary speech function: Tries Murf AI TTS first, gracefully falls back to Web Speech
  const speakText = useCallback(async (text, options = {}) => {
    stopSpeaking();
    if (!text || !text.trim()) return;

    // 1. Attempt High-Fidelity Murf AI Studio Voice Synthesis
    try {
      const activeGender = options.gender || selectedVoiceGender;
      const activeVoiceId = options.voiceId || options.voice_id || (
        activeGender === 'male'
          ? (murfConfig.maleVoiceId || 'Harman')
          : (murfConfig.femaleVoiceId || 'Pooja')
      );

      const response = await fetch(getApiUrl('/api/voice/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: activeVoiceId,
          voice_id: activeVoiceId,
          gender: activeGender,
          style: options.style || murfConfig.style || 'Conversation',
          model: options.model || murfConfig.model || 'Falcon 2.1',
          pitch: options.pitch !== undefined ? options.pitch : murfConfig.pitch,
          rate: options.rate !== undefined ? options.rate : murfConfig.rate,
          locale: options.locale || murfConfig.locale || 'kn-IN'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const audioSource = data.audioUrl || (data.encodedAudio ? `data:audio/mp3;base64,${data.encodedAudio}` : '');
        if (data.success && audioSource) {
          if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio();
          }
          const audio = audioPlayerRef.current;
          audio.src = audioSource;
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            console.warn('Murf audio playback error, falling back to browser voice.');
            setIsSpeaking(false);
            speakWithBrowserSynthesis(text, options);
          };
          await audio.play();
          return;
        }
      }
    } catch (err) {
      // Murf AI not configured or network error; fall through to browser synthesis
    }

    // 2. Resilient Fallback to Browser Speech Synthesis
    speakWithBrowserSynthesis(text, options);
  }, [stopSpeaking, murfConfig, language, speakWithBrowserSynthesis]);

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
      eligibilityMode,
      setEligibilityMode,
      currentUser,
      authToken,
      loginUser,
      logoutUser,
      speakText,
      stopSpeaking,
      speechSpeed,
      setSpeechSpeed,
      selectedVoiceGender,
      setSelectedVoiceGender,
      isSpeaking,
      getActiveVoiceInfo,
      availableVoices,
      murfConfig,
      setMurfConfig,
      murfStatus,
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
