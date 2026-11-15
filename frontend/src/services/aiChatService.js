/**
 * Kisan Saathi - AI Eligibility Chat Service
 * 
 * Provides a clean abstraction between the frontend chatbot UI and the backend.
 * 
 * BACKEND INTEGRATION CONTRACT:
 * When you build your backend (e.g. FastAPI / Node.js / Flask / Express),
 * configure the endpoint URL in your environment (VITE_AI_CHAT_API_URL)
 * or expose `POST /api/eligibility-chat`.
 * 
 * Request Payload:
 * {
 *   "sessionId": string,
 *   "message": string,
 *   "step": string,
 *   "language": "en" | "kn",
 *   "collectedProfile": {
 *     fullName?: string,
 *     age?: string | number,
 *     gender?: string,
 *     category?: string,
 *     state?: string,
 *     district?: string,
 *     taluk?: string,
 *     landHolding?: string,
 *     landType?: string,
 *     cropType?: string,
 *     irrigationType?: string,
 *     aadhaarLinked?: boolean,
 *     fruitsRegistered?: boolean
 *   },
 *   "history": Array<{ role: "assistant" | "user", content: string, timestamp: string }>
 * }
 * 
 * Expected Backend Response:
 * {
 *   "reply": string,
 *   "nextStep": string,
 *   "options"?: Array<{ label: string, value: any, subtext?: string }>,
 *   "updatedProfile"?: Partial<CollectedProfile>,
 *   "isComplete"?: boolean
 * }
 */

import { getApiUrl } from './apiConfig.js';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_CHAT_API_URL)
  ? import.meta.env.VITE_AI_CHAT_API_URL
  : getApiUrl('/api/eligibility-chat');

/**
 * Intelligent client-side conversational fallback
 * Handles questions conversationally when backend is not yet started.
 */
const QUESTION_FLOW = {
  name: {
    en: {
      question: "Namaskara! I am your Kisan Saathi AI assistant. Let's find all the central and state schemes you qualify for. What is your full name?",
      placeholder: "e.g., Ramesh Kumar, Sujay H S...",
      options: [
        { label: "Sujay H S", value: "Sujay H S" },
        { label: "Ramesh Gowda", value: "Ramesh Gowda" },
        { label: "Lakshmi Devi", value: "Lakshmi Devi" }
      ]
    },
    kn: {
      question: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ ಸಾಥಿ AI ಸಹಾಯಕ. ನೀವು ಅರ್ಹರಾಗಿರುವ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರೇನು?",
      placeholder: "ಉದಾ: ರಮೇಶ್ ಗೌಡ, ಸುಜಯ್...",
      options: [
        { label: "ಸುಜಯ್ ಹೆಚ್ ಎಸ್", value: "Sujay H S" },
        { label: "ರಮೇಶ್ ಗೌಡ", value: "Ramesh Gowda" },
        { label: "ಲಕ್ಷ್ಮಿ ದೇವಿ", value: "Lakshmi Devi" }
      ]
    }
  },
  age: {
    en: {
      question: "Great to meet you, {name}! Could you tell me your age? Certain schemes like PM-KISAN, PM-KMY pension, and youth schemes have specific age criteria.",
      placeholder: "Type your age (e.g. 28, 45, 62)...",
      options: [
        { label: "25 Years", value: "25", subtext: "Young Farmer" },
        { label: "35 Years", value: "35", subtext: "Active Farmer" },
        { label: "48 Years", value: "48", subtext: "Experienced" },
        { label: "62 Years", value: "62", subtext: "Senior / Pension eligible" }
      ]
    },
    kn: {
      question: "ಧನ್ಯವಾದಗಳು {name}! ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು? PM-ಕಿಸಾನ್ ಮತ್ತು ಪಿಂಚಣಿ ಯೋಜನೆಗಳಿಗೆ ವಯಸ್ಸಿನ ಮಾನದಂಡ ಮುಖ್ಯವಾಗಿದೆ.",
      placeholder: "ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಿ (ಉದಾ: 28, 45)...",
      options: [
        { label: "25 ವರ್ಷ", value: "25", subtext: "ಯುವ ರೈತ" },
        { label: "35 ವರ್ಷ", value: "35", subtext: "ಕೃಷಿಕ" },
        { label: "48 ವರ್ಷ", value: "48", subtext: "ಅನುಭವಿ ರೈತ" },
        { label: "62 ವರ್ಷ", value: "62", subtext: "ಹಿರಿಯ ರೈತ / ಪಿಂಚಣಿ" }
      ]
    }
  },
  gender: {
    en: {
      question: "What is your gender? Women farmers often receive additional 10% to 20% bonus subsidies under schemes like PMKSY and farm machinery.",
      placeholder: "Select or type your gender...",
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female", subtext: "Special Women Farmer Subsidies" },
        { label: "Other", value: "Other" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಲಿಂಗ ಯಾವುದು? ಮಹಿಳಾ ರೈತರಿಗೆ ಯಂತ್ರೋಪಕರಣ ಮತ್ತು ಹನಿ ನೀರಾವರಿಯಲ್ಲಿ ಹೆಚ್ಚುವರಿ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ.",
      placeholder: "ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ಪುರುಷ", value: "Male" },
        { label: "ಮಹಿಳೆ", value: "Female", subtext: "ವಿಶೇಷ ಮಹಿಳಾ ಸಬ್ಸಿಡಿ" },
        { label: "ಇತರ", value: "Other" }
      ]
    }
  },
  category: {
    en: {
      question: "What is your social reservation category? (SC, ST, and OBC farmers receive up to 90% subsidy under schemes like Ganga Kalyana and PMKSY).",
      placeholder: "Select your category...",
      options: [
        { label: "General", value: "General" },
        { label: "OBC (2A / 2B / 3A / 3B)", value: "OBC" },
        { label: "SC (Scheduled Caste)", value: "SC", subtext: "Priority Welfare Subsidies" },
        { label: "ST (Scheduled Tribe)", value: "ST", subtext: "Priority Welfare Subsidies" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗ (Category) ಯಾವುದು? ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಹನಿ ನೀರಾವರಿಯಲ್ಲಿ SC/ST ಮತ್ತು ಹಿಂದುಳಿದ ವರ್ಗಗಳಿಗೆ ಗರಿಷ್ಠ 90% ಸಬ್ಸಿಡಿ ಇದೆ.",
      placeholder: "ನಿಮ್ಮ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ಸಾಮಾನ್ಯ (General)", value: "General" },
        { label: "ಹಿಂದುಳಿದ ವರ್ಗ (OBC)", value: "OBC" },
        { label: "ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)", value: "SC", subtext: "ಗರಿಷ್ಠ ಸಬ್ಸಿಡಿ" },
        { label: "ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)", value: "ST", subtext: "ಗರಿಷ್ಠ ಸಬ್ಸಿಡಿ" }
      ]
    }
  },
  location: {
    en: {
      question: "Which district and taluk in Karnataka is your farm situated in? This helps verify district-level schemes and Raitha Samparka Kendra jurisdiction.",
      placeholder: "e.g. Bengaluru Rural, Hoskote...",
      options: [
        { label: "Bengaluru Rural (Hoskote)", value: { district: "Bengaluru Rural", taluk: "Hoskote" } },
        { label: "Mandya (Pandavapura)", value: { district: "Mandya", taluk: "Pandavapura" } },
        { label: "Belagavi (Chikkodi)", value: { district: "Belagavi", taluk: "Chikkodi" } },
        { label: "Shivamogga (Bhadravati)", value: { district: "Shivamogga", taluk: "Bhadravati" } },
        { label: "Mysuru (Nanjangud)", value: { district: "Mysuru", taluk: "Nanjangud" } }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿ ಕರ್ನಾಟಕದ ಯಾವ ಜಿಲ್ಲೆ ಮತ್ತು ತಾಲೂಕಿನಲ್ಲಿದೆ?",
      placeholder: "ಉದಾ: ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ, ಹೊಸಕೋಟೆ...",
      options: [
        { label: "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ (ಹೊಸಕೋಟೆ)", value: { district: "Bengaluru Rural", taluk: "Hoskote" } },
        { label: "ಮಂಡ್ಯ (ಪಾಂಡವಪುರ)", value: { district: "Mandya", taluk: "Pandavapura" } },
        { label: "ಬೆಳಗಾವಿ (ಚಿಕ್ಕೋಡಿ)", value: { district: "Belagavi", taluk: "Chikkodi" } },
        { label: "ಶಿವಮೊಗ್ಗ (ಭದ್ರಾವತಿ)", value: { district: "Shivamogga", taluk: "Bhadravati" } },
        { label: "ಮೈಸೂರು (ನಂಜನಗೂಡು)", value: { district: "Mysuru", taluk: "Nanjangud" } }
      ]
    }
  },
  land: {
    en: {
      question: "How much agricultural land do you own or cultivate? Government schemes categorize farmers based on land size.",
      placeholder: "Select your land category...",
      options: [
        { label: "Marginal (< 2.5 Acres)", value: "Marginal (< 2.5 Acres)", subtext: "Highest DBT Priority" },
        { label: "Small (2.5 - 5 Acres)", value: "Small (2.5 - 5 Acres)", subtext: "Eligible for PM-KISAN & KCC" },
        { label: "Medium (5 - 10 Acres)", value: "Medium (5 - 10 Acres)" },
        { label: "Large (> 10 Acres)", value: "Large (> 10 Acres)" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಕೃಷಿ ಭೂಮಿ ಇದೆ? ಸರ್ಕಾರದ ಯೋಜನೆಗಳು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣದ ಆಧಾರದ ಮೇಲೆ ಸಬ್ಸಿಡಿ ನೀಡುತ್ತವೆ.",
      placeholder: "ಭೂಮಿ ವಿವರ ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ಅತಿ ಸಣ್ಣ ರೈತರು (< 2.5 ಎಕರೆ)", value: "Marginal (< 2.5 Acres)", subtext: "ಅತ್ಯಧಿಕ ಆದ್ಯತೆ" },
        { label: "ಸಣ್ಣ ರೈತರು (2.5 ರಿಂದ 5 ಎಕರೆ)", value: "Small (2.5 - 5 Acres)", subtext: "PM-ಕಿಸಾನ್ ಮತ್ತು KCC ಅರ್ಹ" },
        { label: "ಮಧ್ಯಮ ರೈತರು (5 ರಿಂದ 10 ಎಕರೆ)", value: "Medium (5 - 10 Acres)" },
        { label: "ದೊಡ್ಡ ರೈತರು (> 10 ಎಕರೆ)", value: "Large (> 10 Acres)" }
      ]
    }
  },
  crop: {
    en: {
      question: "Which primary crops do you cultivate? (Special incentives exist: e.g. ₹10,000/ha for Millets under Raitha Siri, crop insurance under PMFBY).",
      placeholder: "Select your primary crop...",
      options: [
        { label: "Ragi / Millets & Food Grains", value: "Ragi & Cereals", subtext: "Raitha Siri ₹10,000/ha incentive" },
        { label: "Paddy / Rice", value: "Paddy / Rice", subtext: "PMFBY & MSP Procurement" },
        { label: "Pulses & Oilseeds", value: "Pulses & Oilseeds", subtext: "Subsidized seeds available" },
        { label: "Horticulture (Fruits & Veggies)", value: "Horticulture", subtext: "Cold storage & solar drying" },
        { label: "Commercial (Sugarcane / Cotton)", value: "Sugarcane / Cotton", subtext: "KCC credit support" }
      ]
    },
    kn: {
      question: "ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯುತ್ತೀರಿ? (ರಾಗಿ ಸಿರಿಧಾನ್ಯಗಳಿಗೆ 'ರೈತ ಸಿರಿ' ಅಡಿಯಲ್ಲಿ ₹10,000/ಹೆಕ್ಟೇರ್ ಪ್ರೋತ್ಸಾಹಧನವಿದೆ).",
      placeholder: "ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ರಾಗಿ ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು", value: "Ragi & Cereals", subtext: "ರೈತ ಸಿರಿ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ" },
        { label: "ಭತ್ತ / ಅಕ್ಕಿ", value: "Paddy / Rice", subtext: "ಬೆಳೆ ವಿಮೆ & ಬೆಂಬಲ ಬೆಲೆ" },
        { label: "ತೊಗರಿ ಮತ್ತು ಎಣ್ಣೆಕಾಳುಗಳು", value: "Pulses & Oilseeds", subtext: "ರಿಯಾಯಿತಿ ದರದ ಬೀಜಗಳು" },
        { label: "ತೋಟಗಾರಿಕೆ (ಹಣ್ಣು, ತರಕಾರಿ)", value: "Horticulture", subtext: "ಶೈತ್ಯಾಗಾರ & ಸಬ್ಸಿಡಿ" },
        { label: "ವಾಣಿಜ್ಯ ಬೆಳೆ (ಕಬ್ಬು, ಹತ್ತಿ)", value: "Sugarcane / Cotton", subtext: "ಕೆಸಿಸಿ ಸಾಲ ನೆರವು" }
      ]
    }
  },
  irrigation: {
    en: {
      question: "What is your irrigation facility? Farmers with borewells can get up to 90% subsidy for micro-drip setups, while solar pumps are offered under PM-KUSUM.",
      placeholder: "Select irrigation source...",
      options: [
        { label: "Borewell & Rainfed", value: "Borewell & Rainfed", subtext: "PMKSY Drip Eligible" },
        { label: "Pure Rainfed (Dryland)", value: "Pure Rainfed (Dryland)", subtext: "Krishi Bhagya Farm Pond" },
        { label: "Canal / River Source", value: "Canal / River Irrigated" },
        { label: "Drip / Micro-Irrigation Installed", value: "Drip / Micro-Irrigation" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಜಮೀನಿನ ನೀರಾವರಿ ಮೂಲ ಯಾವುದು? ಬೋರ್‌ವೆಲ್ ಹೊಂದಿರುವವರಿಗೆ ಹನಿ ನೀರಾವರಿಗೆ 90% ವರೆಗೆ ಸಬ್ಸಿಡಿ ಇದೆ.",
      placeholder: "ನೀರಾವರಿ ಸೌಲಭ್ಯ ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ಬೋರ್‌ವೆಲ್ & ಮಳೆಯಾಶ್ರಿತ", value: "Borewell & Rainfed", subtext: "ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಅರ್ಹ" },
        { label: "ಸಂಪೂರ್ಣ ಮಳೆಯಾಶ್ರಿತ (ಒಣಭೂಮಿ)", value: "Pure Rainfed (Dryland)", subtext: "ಕೃಷಿ ಭಾಗ್ಯ ಕೃಷಿ ಹೊಂಡ" },
        { label: "ಕಾಲುವೆ / ನದಿ ನೀರು", value: "Canal / River Irrigated" },
        { label: "ಈಗಾಗಲೇ ಹನಿ ನೀರಾವರಿ ಇದೆ", value: "Drip / Micro-Irrigation" }
      ]
    }
  },
  benefits: {
    en: {
      question: "Last verification question: Is your bank account linked with Aadhaar (NPCI active for DBT) and are you registered in Karnataka FRUITS (FID)?",
      placeholder: "Select your banking & registration status...",
      options: [
        { label: "Yes, Both Aadhaar DBT & FRUITS Active", value: { aadhaar: true, fruits: true }, subtext: "100% Ready for Direct Subsidy" },
        { label: "Aadhaar Linked, need FRUITS registration", value: { aadhaar: true, fruits: false }, subtext: "Can register online or at RSK" },
        { label: "Not sure / Need assistance", value: { aadhaar: true, fruits: true }, subtext: "We will guide you" }
      ]
    },
    kn: {
      question: "ಕೊನೆಯ ಪ್ರಶ್ನೆ: ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ DBT ಲಿಂಕ್ ಆಗಿದೆಯೇ ಮತ್ತು ಕರ್ನಾಟಕ FRUITS ಪೋರ್ಟಲ್‌ನಲ್ಲಿ FID ನೋಂದಣಿ ಆಗಿದೆಯೇ?",
      placeholder: "ನಿಮ್ಮ ಬ್ಯಾಂಕಿಂಗ್ ಸ್ಥಿತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
      options: [
        { label: "ಹೌದು, ಆಧಾರ್ DBT ಮತ್ತು FRUITS ಎರಡೂ ಸಕ್ರಿಯವಾಗಿವೆ", value: { aadhaar: true, fruits: true }, subtext: "ನೇರ ಜಮೆಗೆ 100% ಸಿದ್ಧ" },
        { label: "ಆಧಾರ್ ಲಿಂಕ್ ಆಗಿದೆ, FRUITS ನೋಂದಣಿ ಬಾಕಿ ಇದೆ", value: { aadhaar: true, fruits: false }, subtext: "ಆನ್‌ಲೈನ್ ಅಥವಾ RSK ನಲ್ಲಿ ಮಾಡಬಹುದು" },
        { label: "ಖಚಿತವಿಲ್ಲ / ಸಹಾಯ ಬೇಕು", value: { aadhaar: true, fruits: true }, subtext: "ನಾವು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇವೆ" }
      ]
    }
  },
  confirm: {
    en: {
      question: "Please confirm your farm profile details.",
      options: [
        { label: "Yes, Details Are Correct", value: "CONFIRM_YES" },
        { label: "No, Want to Change", value: "CONFIRM_NO" },
        { label: "Review in Form Mode", value: "CONFIRM_EDIT_FORM" }
      ]
    },
    kn: {
      question: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ.",
      options: [
        { label: "ಹೌದು, ವಿವರಗಳು ಸರಿಯಾಗಿವೆ", value: "CONFIRM_YES" },
        { label: "ಇಲ್ಲ, ಬದಲಾಯಿಸಬೇಕು", value: "CONFIRM_NO" },
        { label: "ಫಾರ್ಮ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ", value: "CONFIRM_EDIT_FORM" }
      ]
    }
  },
  complete: {
    en: {
      question: "Fantastic! Your agricultural profile is complete. I have evaluated your data against 9 Central and Karnataka State schemes. You qualify for high-impact schemes including PM-KISAN, Raitha Siri, and PMKSY!",
      options: []
    },
    kn: {
      question: "ಅದ್ಭುತ! ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಂಡಿದೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು 9 ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಯೋಜನೆಗಳೊಂದಿಗೆ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ನೀವು PM-ಕಿಸಾನ್, ರೈತ ಸಿರಿ, ಮತ್ತು PMKSY ನಂತಹ ಪ್ರಮುಖ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ!",
      options: []
    }
  }
};

const STEP_SEQUENCE = [
  'name',
  'age',
  'gender',
  'category',
  'location',
  'land',
  'crop',
  'irrigation',
  'benefits',
  'confirm',
  'complete'
];

function detectUserQuestion(text) {
  if (!text) return null;
  const t = text.trim().toLowerCase();

  // Who questions
  if (
    /^(who|who\s+(are|is|r)\s+(you|u|this)|neevu\s+yaaru|neev\s+yaaru|yaaru|who\s+are\s+u\??|who\??)$/i.test(t) ||
    /\b(who\s+are\s+you|who\s+is\s+this|who\s+r\s+u|neevu\s+yaaru)\b/i.test(t) ||
    /^(ಯಾರು|ನೀವು\s*ಯಾರು|ಯಾರು\s*ನೀವು)\??$/i.test(t)
  ) {
    return 'who';
  }

  // When questions
  if (
    /^(when|when\s+will|when\s+is|yaavaga|when\??)$/i.test(t) ||
    /\b(when\s+will|when\s+do|when\s+can|application\s+date|last\s+date|release\s+date|yaavaga)\b/i.test(t) ||
    /^(ಯಾವಾಗ|ಯಾವಾಗ\s*ಬರುತ್ತೆ|ಕೊನೆ\s*ದಿನಾಂಕ)\??$/i.test(t)
  ) {
    return 'when';
  }

  // Why questions
  if (
    /^(why|why\s+do\s+you|why\s+need|yaake|yaak\s+beku|why\??)$/i.test(t) ||
    /\b(why\s+do\s+you|why\s+need|why\s+ask|yaake\s+beku)\b/i.test(t) ||
    /^(ಯಾಕೆ|ಯಾತಕ್ಕೆ|ಯಾಕೆ\s*ಬೇಕು)\??$/i.test(t)
  ) {
    return 'why';
  }

  // What questions
  if (
    /^(what|what\s+is\s+this|what\s+is\s+kisan\s+saathi|yenu|enu|what\??)$/i.test(t) ||
    /\b(what\s+is\s+this|what\s+do\s+you\s+do|what\s+schemes)\b/i.test(t) ||
    /^(ಏನು|ಏನಿದು|ಇದು\s*ಏನು)\??$/i.test(t)
  ) {
    return 'what';
  }

  // Where questions
  if (
    /^(where|where\s+to|elli|where\??)$/i.test(t) ||
    /\b(where\s+to\s+apply|where\s+is\s+office|nearest\s+centre|elli)\b/i.test(t) ||
    /^(ಎಲ್ಲಿ|ಎಲ್ಲಿಗೆ\s*ಹೋಗಬೇಕು)\??$/i.test(t)
  ) {
    return 'where';
  }

  // How questions
  if (
    /^(how|how\s+to|how\s+does|hege|how\??)$/i.test(t) ||
    /\b(how\s+to\s+apply|how\s+does\s+it\s+work|hege\s+madodu)\b/i.test(t) ||
    /^(ಹೇಗೆ|ಹೇಗೆ\s*ಅರ್ಜಿ\s*ಹಾಕುವುದು)\??$/i.test(t)
  ) {
    return 'how';
  }

  // Greeting
  if (/^(hi|hello|hey|namaskara|namaste|good\s+morning|good\s+afternoon|good\s+evening)$/i.test(t)) {
    return 'greeting';
  }

  if (t.includes('?')) {
    return 'general_question';
  }

  return null;
}

function getQuestionAnswer(questionType, step, isKn, _farmerName = '') {
  const stepPrompts = {
    name: {
      fieldEn: 'Full Name',
      fieldKn: 'ಪೂರ್ಣ ಹೆಸರು',
      reAskEn: 'What is your official full name?',
      reAskKn: 'ನಿಮ್ಮ ಅಧಿಕೃತ ಪೂರ್ಣ ಹೆಸರೇನು?',
      whyEn: 'Your real full name is required to match your records with Karnataka FRUITS (FID) and land RTC/Pahani.',
      whyKn: 'ಕರ್ನಾಟಕ FRUITS ಪೋರ್ಟಲ್ ಮತ್ತು ಪಹಣಿ (RTC) ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ನಿಜವಾದ ಹೆಸರು ಅಗತ್ಯ.'
    },
    age: {
      fieldEn: 'Age',
      fieldKn: 'ವಯಸ್ಸು',
      reAskEn: 'How old are you in years (e.g. 35)?',
      reAskKn: 'ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು (ಉದಾ: 35)?',
      whyEn: 'Age is required because schemes have age criteria (e.g., PM-KMY pension is for 18-40 yrs, youth schemes for under 40).',
      whyKn: 'ಪಿಎಂ-ಕಿಸಾನ್ ಮಾನ್‌ಧನ್ ಪಿಂಚಣಿ (18-40 ವರ್ಷ) ಮತ್ತು ಯುವ ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ ವಯಸ್ಸಿನ ಮಾನದಂಡ ಅನ್ವಯಿಸುತ್ತದೆ.'
    },
    gender: {
      fieldEn: 'Gender',
      fieldKn: 'ಲಿಂಗ',
      reAskEn: 'What is your gender (Male, Female, or Other)?',
      reAskKn: 'ನಿಮ್ಮ ಲಿಂಗ ಯಾವುದು (ಪುರುಷ, ಮಹಿಳೆ ಅಥವಾ ಇತರ)?',
      whyEn: 'Women farmers receive up to 90% subsidy and extra bonus subsidies for farm machinery and micro-irrigation.',
      whyKn: 'ಮಹಿಳಾ ರೈತರಿಗೆ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಮತ್ತು ಹನಿ ನೀರಾವರಿಯಲ್ಲಿ ವಿಶೇಷ ಹೆಚ್ಚುವರಿ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ.'
    },
    category: {
      fieldEn: 'Social Category',
      fieldKn: 'ಸಾಮಾಜಿಕ ವರ್ಗ',
      reAskEn: 'Which reservation category do you belong to (General, OBC, SC, ST)?',
      reAskKn: 'ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗ ಯಾವುದು (ಸಾಮಾನ್ಯ, OBC, SC, ST)?',
      whyEn: 'SC/ST farmers receive up to 90-100% free borewell subsidy under Ganga Kalyana and high subsidies under PMKSY.',
      whyKn: 'ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಇತರ ಕೃಷಿ ಯೋಜನೆಗಳಲ್ಲಿ SC/ST ರೈತರಿಗೆ 90% ರಿಂದ 100% ವರೆಗೆ ಉಚಿತ ಬೋರ್‌ವೆಲ್ ಸೌಲಭ್ಯವಿದೆ.'
    },
    location: {
      fieldEn: 'District & Taluk',
      fieldKn: 'ಜಿಲ್ಲೆ ಮತ್ತು ತಾಲೂಕು',
      reAskEn: 'Which district in Karnataka is your farmland located in?',
      reAskKn: 'ಕರ್ನಾಟಕದ ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನು ಇದೆ?',
      whyEn: 'Agricultural schemes, drought relief, and Raitha Samparka Kendra benefits are distributed by district.',
      whyKn: 'ಕೃಷಿ ಭಾಗ್ಯ, ಬರ ಪರಿಹಾರ ಮತ್ತು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳ ಯೋಜನೆಗಳು ಜಿಲ್ಲಾವಾರು ಜಾರಿಯಾಗುತ್ತವೆ.'
    },
    district: {
      fieldEn: 'District',
      fieldKn: 'ಜಿಲ್ಲೆ',
      reAskEn: 'Which district in Karnataka is your farmland located in?',
      reAskKn: 'ಕರ್ನಾಟಕದ ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನು ಇದೆ?',
      whyEn: 'Agricultural schemes, drought relief, and Raitha Samparka Kendra benefits are distributed by district.',
      whyKn: 'ಕೃಷಿ ಭಾಗ್ಯ, ಬರ ಪರಿಹಾರ ಮತ್ತು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳ ಯೋಜನೆಗಳು ಜಿಲ್ಲಾವಾರು ಜಾರಿಯಾಗುತ್ತವೆ.'
    },
    land: {
      fieldEn: 'Land Size',
      fieldKn: 'ಭೂಮಿ ವಿಸ್ತೀರ್ಣ',
      reAskEn: 'How many acres of agricultural land do you own or cultivate?',
      reAskKn: 'ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಎಕರೆ ಕೃಷಿ ಭೂಮಿ ಇದೆ?',
      whyEn: 'Marginal (<2.5 acres) and Small (2.5-5 acres) farmers receive highest priority and maximum DBT subsidies.',
      whyKn: 'ಅತಿ ಸಣ್ಣ (<2.5 ಎಕರೆ) ಮತ್ತು ಸಣ್ಣ (2.5-5 ಎಕರೆ) ರೈತರಿಗೆ ಗರಿಷ್ಠ ಡಿಬಿಟಿ ಸಹಾಯಧನ ಲಭ್ಯವಿದೆ.'
    },
    landHolding: {
      fieldEn: 'Land Size',
      fieldKn: 'ಭೂಮಿ ವಿಸ್ತೀರ್ಣ',
      reAskEn: 'How many acres of agricultural land do you own or cultivate?',
      reAskKn: 'ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಎಕರೆ ಕೃಷಿ ಭೂಮಿ ಇದೆ?',
      whyEn: 'Marginal (<2.5 acres) and Small (2.5-5 acres) farmers receive highest priority and maximum DBT subsidies.',
      whyKn: 'ಅತಿ ಸಣ್ಣ (<2.5 ಎಕರೆ) ಮತ್ತು ಸಣ್ಣ (2.5-5 ಎಕರೆ) ರೈತರಿಗೆ ಗರಿಷ್ಠ ಡಿಬಿಟಿ ಸಹಾಯಧನ ಲಭ್ಯವಿದೆ.'
    },
    crop: {
      fieldEn: 'Primary Crop',
      fieldKn: 'ಮುಖ್ಯ ಬೆಳೆ',
      reAskEn: 'Which main crop do you cultivate (e.g. Paddy, Ragi, Sugarcane)?',
      reAskKn: 'ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತೀರಿ (ಉದಾ: ಭತ್ತ, ರಾಗಿ, ಕಬ್ಬು)?',
      whyEn: 'Certain crops receive special subsidies (e.g. ₹10,000/ha for Millets under Raitha Siri, PMFBY crop insurance for Paddy).',
      whyKn: 'ಸಿರಿಧಾನ್ಯಗಳಿಗೆ "ರೈತ ಸಿರಿ" ಅಡಿಯಲ್ಲಿ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ, ಭತ್ತಕ್ಕೆ ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ ಸಿಗುತ್ತದೆ.'
    },
    cropType: {
      fieldEn: 'Primary Crop',
      fieldKn: 'ಮುಖ್ಯ ಬೆಳೆ',
      reAskEn: 'Which main crop do you cultivate (e.g. Paddy, Ragi, Sugarcane)?',
      reAskKn: 'ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತೀರಿ (ಉದಾ: ಭತ್ತ, ರಾಗಿ, ಕಬ್ಬು)?',
      whyEn: 'Certain crops receive special subsidies (e.g. ₹10,000/ha for Millets under Raitha Siri, PMFBY crop insurance for Paddy).',
      whyKn: 'ಸಿರಿಧಾನ್ಯಗಳಿಗೆ "ರೈತ ಸಿರಿ" ಅಡಿಯಲ್ಲಿ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ, ಭತ್ತಕ್ಕೆ ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ ಸಿಗುತ್ತದೆ.'
    },
    irrigation: {
      fieldEn: 'Irrigation Source',
      fieldKn: 'ನೀರಾವರಿ ಸೌಲಭ್ಯ',
      reAskEn: 'What is your irrigation facility (Rainfed, Borewell, or Canal)?',
      reAskKn: 'ನಿಮ್ಮ ನೀರಾವರಿ ಸೌಲಭ್ಯ ಯಾವುದು (ಮಳೆ ಆಶ್ರಿತ, ಬೋರ್‌ವೆಲ್ ಅಥವಾ ಕಾಲುವೆ)?',
      whyEn: 'Irrigation type determines eligibility for PMKSY drip irrigation, Krishi Bhagya farm ponds, and PM-KUSUM solar pumps.',
      whyKn: 'ನೀರಾವರಿ ಮೂಲವು PMKSY ಹನಿ ನೀರಾವರಿ, ಕೃಷಿ ಭಾಗ್ಯ ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಕುಸುಮ್ ಸೌರ ಪಂಪ್ ಸಬ್ಸಿಡಿಗೆ ಮುಖ್ಯವಾಗಿದೆ.'
    },
    benefits: {
      fieldEn: 'FRUITS & Aadhaar DBT',
      fieldKn: 'ಫ್ರೂಟ್ಸ್ & ಆಧಾರ್ ಡಿಬಿಟಿ',
      reAskEn: 'Is your bank account Aadhaar-linked and do you have a Karnataka FRUITS ID?',
      reAskKn: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಲಿಂಕ್ ಮತ್ತು FRUITS ನೋಂದಣಿ ಆಗಿದೆಯೇ?',
      whyEn: 'Direct Benefit Transfer (DBT) requires active NPCI Aadhaar seeding and FRUITS registration.',
      whyKn: 'ಸರ್ಕಾರದ ಸಹಾಯಧನ ನೇರವಾಗಿ ಖಾತೆಗೆ ಜಮೆಯಾಗಲು ಆಧಾರ್ ಡಿಬಿಟಿ ಮತ್ತು FRUITS ನೋಂದಣಿ ಕಡ್ಡಾಯ.'
    },
    fruitsId: {
      fieldEn: 'FRUITS ID',
      fieldKn: 'FRUITS ನೋಂದಣಿ',
      reAskEn: 'Do you have a Karnataka FRUITS ID registered?',
      reAskKn: 'ನಿಮ್ಮ ಬಳಿ ಕರ್ನಾಟಕ ಸರ್ಕಾರದ FRUITS ID ನೋಂದಣಿ ಆಗಿದೆಯೇ?',
      whyEn: 'Direct Benefit Transfer (DBT) requires FRUITS registration in Karnataka.',
      whyKn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿಗಳನ್ನು ನೇರವಾಗಿ ಪಡೆಯಲು FRUITS ID ಅಗತ್ಯ.'
    },
    aadhaar: {
      fieldEn: 'Aadhaar DBT Linking',
      fieldKn: 'ಆಧಾರ್ ಡಿಬಿಟಿ ಲಿಂಕ್',
      reAskEn: 'Is your bank account Aadhaar-linked for DBT deposits?',
      reAskKn: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಲಿಂಕ್ ಆಗಿದೆಯೇ?',
      whyEn: 'Direct Benefit Transfer (DBT) deposits can only be credited to Aadhaar-seeded accounts.',
      whyKn: 'ಸಹಾಯಧನದ ಹಣ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಬರಲು ಆಧಾರ್ ಲಿಂಕ್ ಕಡ್ಡಾಯ.'
    }
  };

  const p = stepPrompts[step] || stepPrompts.name;

  let answerText = '';
  if (questionType === 'who') {
    answerText = isKn
      ? `🤖 ನಾನು ಕಿಸಾನ್ ಸಾಥಿ AI ಸಹಾಯಕ. ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ 9 ಅಧಿಕೃತ ಕೇಂದ್ರ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು ಹಾಗೂ ಸಬ್ಸಿಡಿಗಳನ್ನು (ಪಿಎಂ-ಕಿಸಾನ್, ಗಂಗಾ ಕಲ್ಯಾಣ, ರೈತ ಸಿರಿ ಇತ್ಯಾದಿ) ಕಂಡುಕೊಳ್ಳಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.`
      : `🤖 I am Kisan Saathi AI, an intelligent agricultural assistant for Karnataka farmers. I help you discover and qualify for all official central and Karnataka government schemes (such as PM-KISAN, Ganga Kalyana, Raitha Siri, and PMKSY).`;
  } else if (questionType === 'when') {
    answerText = isKn
      ? `📅 ಯೋಜನೆಗಳ ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಮತ್ತು ಹಣ ಬಿಡುಗಡೆಯು ಆಯಾ ಯೋಜನೆಗೆ ತಕ್ಕಂತೆ ಇರುತ್ತದೆ: ಉದಾಹರಣೆಗೆ ಪಿಎಂ-ಕಿಸಾನ್ ₹2,000 ಪ್ರತಿ 4 ತಿಂಗಳಿಗೊಮ್ಮೆ ಬರುತ್ತದೆ, ಮತ್ತು ಯಂತ್ರೋಪಕರಣಗಳ ಸಬ್ಸಿಡಿ ಮುಂಗಾರು/ಹಿಂಗಾರು ಹಂಗಾಮಿನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ. ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿದ ತಕ್ಷಣ ನಿಖರವಾದ ದಿನಾಂಕಗಳನ್ನು ನೀಡಲಾಗುವುದು.`
      : `📅 Benefit schedules and application dates depend on the specific scheme: PM-KISAN transfers ₹2,000 every 4 months, while agricultural equipment and irrigation subsidies open during seasonal windows. Once we evaluate your eligibility, I will list the exact dates and deadlines for each scheme.`;
  } else if (questionType === 'why') {
    answerText = isKn
      ? `💡 ${p.whyKn}`
      : `💡 ${p.whyEn}`;
  } else if (questionType === 'what') {
    answerText = isKn
      ? `🌾 ಇದು ಕಿಸಾನ್ ಸಾಥಿ ಯೋಜನಾ ಅರ್ಹತಾ ಪರಿಶೀಲಕ. ಕೆಲವೇ ವಿವರಗಳೊಂದಿಗೆ ನೀವು ಅರ್ಹರಾಗಿರುವ ಎಲ್ಲಾ ಸಬ್ಸಿಡಿಗಳು, ಆರ್ಥಿಕ ನೆರವು ಮತ್ತು ಕೃಷಿ ಸೌಲಭ್ಯಗಳನ್ನು ಇಲ್ಲಿ ತಿಳಿಯಬಹುದು.`
      : `🌾 This is the Kisan Saathi Eligibility Checker. By answering a few quick questions about your farm, our deterministic rules engine matches you with all qualifying subsidies, financial aid, and equipment grants.`;
  } else if (questionType === 'where') {
    answerText = isKn
      ? `📍 ಅರ್ಹತೆ ಖಚಿತವಾದ ನಂತರ, ನೀವು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳ (FRUITS, Seva Sindhu) ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಥವಾ ನಿಮ್ಮ ಸಮೀಪದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದಲ್ಲಿ (RSK) ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.`
      : `📍 Once evaluated, you can apply online through official government portals (FRUITS, Seva Sindhu) or visit your nearest Raitha Samparka Kendra (RSK).`;
  } else if (questionType === 'how') {
    answerText = isKn
      ? `⚙️ ಇದು ಸರಳವಾಗಿದೆ: ನಿಮ್ಮ ಜಮೀನು, ಬೆಳೆ ಮತ್ತು ನೀರಾವರಿಯ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ನೀವು ಪಡೆಯಬಹುದಾದ ಯೋಜನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಪಟ್ಟಿ ಮಾಡುತ್ತದೆ.`
      : `⚙️ It is very simple: share a few details about your land, crop, and irrigation, and our automated system will instantly calculate the schemes you qualify for.`;
  } else if (questionType === 'greeting') {
    answerText = isKn
      ? `🙏 ನಮಸ್ಕಾರ! ಕಿಸಾನ್ ಸಾಥಿ ಯೋಜನಾ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ.`
      : `🙏 Namaskara! Welcome to Kisan Saathi.`;
  } else {
    answerText = isKn
      ? `ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಗಮನಿಸಲಾಗಿದೆ. ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಪರಿಶೀಲನೆಗೆ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು ಅಗತ್ಯವಿದೆ.`
      : `Thank you for your question. To evaluate government schemes accurately, we need to collect your verified farm details.`;
  }

  const promptFollowUp = isKn
    ? `\n\n👉 ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲು, ದಯವಿಟ್ಟು ${p.fieldKn} ತಿಳಿಸಿ:\n"${p.reAskKn}"`
    : `\n\n👉 To evaluate your matching schemes, please provide your ${p.fieldEn}:\n"${p.reAskEn}"`;

  return answerText + promptFollowUp;
}

function isInvalidFarmerName(name) {
  if (!name) return true;
  const n = name.trim().toLowerCase().replace(/[.,!?;:'"()]/g, '');

  if (n.length < 2 || n.length > 50) return true;

  const blacklisted = new Set([
    'who', 'when', 'why', 'what', 'where', 'how', 'which', 'whose', 'whom',
    'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'u', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
    'we', 'us', 'our', 'ours', 'they', 'them', 'their', 'theirs',
    'farmer', 'raitha', 'raitharu', 'user', 'admin', 'guest', 'test', 'tester', 'testing',
    'nobody', 'no one', 'someone', 'anyone', 'everybody', 'everyone',
    'bot', 'ai', 'assistant', 'robot', 'person', 'human', 'sir', 'madam', 'bro', 'friend', 'brother', 'sister',
    'yes', 'no', 'ok', 'okay', 'hi', 'hello', 'hey', 'namaskara', 'namaste', 'bye', 'good', 'bad', 'fine',
    'thanks', 'thank you', 'please', 'help', 'sure', 'yep', 'nope',
    'dont know', 'dontknow', 'idk', 'unknown', 'skip', 'null', 'nil', 'none', 'nothing', 'nan',
    'ರೈತ', 'ರೈತರು', 'ನಾನು', 'ನೀವು', 'ಅವರು', 'ಯಾರೋ', 'ಹೆಸರಿಲ್ಲ', 'ಯಾರು', 'ಏನು', 'ಯಾವಾಗ', 'ಯಾಕೆ', 'ಎಲ್ಲಿ', 'ಹೇಗೆ', 'ಗೊತ್ತಿಲ್ಲ', 'ತಿಳಿದಿಲ್ಲ'
  ]);

  if (blacklisted.has(n)) return true;

  // Starting with question words
  if (/^(who|when|why|what|where|how|which)\b/i.test(n)) return true;
  if (/^(ಯಾರು|ಏನು|ಯಾವಾಗ|ಯಾಕೆ|ಎಲ್ಲಿ|ಹೇಗೆ)\b/i.test(n)) return true;

  // Has digits or special symbols
  if (/[0-9!@#$%^&*_+={}\[\]<>~`]/.test(name)) return true;

  // Repeated single character like "aaaa", "zzzz"
  if (/^(.)\1+$/.test(n)) return true;

  // Keyboard mash
  if (/^(asdf|qwerty|zxcv|ghjk|hjkl|qwer|asdfg|xyz|abc|1234?)$/i.test(n)) return true;

  // Must contain at least two letters (Latin or Kannada)
  const letters = n.match(/[a-zA-Z\u0C80-\u0CFF]/g);
  if (!letters || letters.length < 2) return true;

  return false;
}

function isUnknownOrEvasiveInput(text) {
  if (!text) return true;
  const t = text.trim().toLowerCase();
  return (
    /^(i\s+)?(don'?t|do\s+not)\s+know/i.test(t) ||
    /^(idk|dontknow|no\s+idea|not\s+sure|unsure|cannot\s+say|dunno|no\s+clue|dont\s+know|do\s+not\s+know)$/i.test(t) ||
    /^(gott?h?illa|nanage\s+gott?h?illa|tilidilla|gothilla|gothu\s+illa|gottilla)$/i.test(t) ||
    /^(none|nothing|no|illa|nahi|na|nil|null|nan)$/i.test(t) ||
    /^(test|fake|asdf|qwerty|xyz|abc|aaa|123|1234|foo|bar|dummy|unknown|random|skip)$/i.test(t) ||
    /^(who|when|why|what|where|how|which|whose|whom)$/i.test(t) ||
    /^(ಯಾರು|ಏನು|ಯಾವಾಗ|ಯಾಕೆ|ಎಲ್ಲಿ|ಹೇಗೆ)$/i.test(t)
  );
}

function formatClientProfileSummary(profile, isKn) {
  const name = profile.fullName || (isKn ? 'ರೈತರು' : 'Farmer');
  const age = profile.age ? `${profile.age} ${isKn ? 'ವರ್ಷ' : 'Yrs'}` : (isKn ? 'ತಿಳಿಸಿಲ್ಲ' : 'Not specified');
  const gender = profile.gender || (isKn ? 'ಪುರುಷ' : 'Male');
  const category = profile.category || (isKn ? 'ಸಾಮಾನ್ಯ' : 'General');
  const district = profile.district ? `${profile.district}${profile.taluk ? ` (${profile.taluk})` : ''}, ಕರ್ನಾಟಕ` : (isKn ? 'ಕರ್ನಾಟಕ' : 'Karnataka');
  const land = profile.landType || (profile.landHolding ? `${profile.landHolding} ${isKn ? 'ಎಕರೆ' : 'Acres'}` : (isKn ? '2.5 ಎಕರೆ' : '2.5 Acres'));
  const crop = profile.cropType || (isKn ? 'ಭತ್ತ' : 'Paddy');
  const irrigation = profile.irrigationType || (isKn ? 'ಮಳೆ ಆಶ್ರಿತ' : 'Rainfed');
  const fruits = profile.fruitsRegistered
    ? (isKn ? 'ಹೌದು (FRUITS ID ಇದೆ)' : 'Active (FRUITS registered)')
    : (isKn ? 'ಇಲ್ಲ / ಬಾಕಿ' : 'Not registered');
  const aadhaar = profile.aadhaarLinked
    ? (isKn ? 'ಹೌದು (DBT ಸೀಡಿಂಗ್ ಆಗಿದೆ)' : 'Linked (DBT active)')
    : (isKn ? 'ಖಚಿತವಿಲ್ಲ / ಬಾಕಿ' : 'Not linked');

  if (isKn) {
    return (
      `📋 ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಸಾರಾಂಶ:\n` +
      `• ಹೆಸರು: ${name}\n` +
      `• ವಯಸ್ಸು & ಲಿಂಗ: ${age}, ${gender}\n` +
      `• ಸಾಮಾಜಿಕ ವರ್ಗ: ${category}\n` +
      `• ಜಮೀನಿನ ಸ್ಥಳ: ${district}\n` +
      `• ಕೃಷಿ ಭೂಮಿ: ${land}\n` +
      `• ಮುಖ್ಯ ಬೆಳೆ: ${crop}\n` +
      `• ನೀರಾವರಿ: ${irrigation}\n` +
      `• ದಾಖಲೆಗಳು: FRUITS (${fruits}), ಆಧಾರ್ DBT (${aadhaar})\n\n` +
      `⚠️ ದೃಢೀಕರಣ ಅಗತ್ಯ:\n` +
      `ರೈತರು ಕೆಲವೊಮ್ಮೆ ತಿಳಿಯದೆ ತಪ್ಪು ಮಾಹಿತಿ ನೀಡಿರಬಹುದು. ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಪರಿಶೀಲನೆಗೆ ಮುನ್ನ, ಮೇಲಿನ ಎಲ್ಲಾ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ ಎಂದು ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ.`
    );
  }

  return (
    `📋 Farmer Profile Summary:\n` +
    `• Name: ${name}\n` +
    `• Age & Gender: ${age}, ${gender}\n` +
    `• Social Category: ${category}\n` +
    `• Location: ${district}\n` +
    `• Cultivated Land: ${land}\n` +
    `• Primary Crop: ${crop}\n` +
    `• Irrigation: ${irrigation}\n` +
    `• Documents: FRUITS ID (${fruits}), Aadhaar DBT (${aadhaar})\n\n` +
    `⚠️ Confirmation Required:\n` +
    `Farmers sometimes enter approximate or incorrect information by mistake. Please confirm if these details are correct before we evaluate your verified scheme eligibility.`
  );
}

/**
 * Main Service API call
 * Attempts to hit your future backend, and gracefully falls back to the local
 * conversational engine if backend is not yet running.
 */
export async function sendEligibilityChatMessage({
  sessionId = 'session_' + Date.now(),
  userMessage = '',
  currentStep = 'name',
  language = 'en',
  collectedProfile = {},
  history = []
}) {
  // 1. Try hitting the actual backend endpoint first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick check

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        sessionId,
        message: userMessage,
        step: currentStep,
        language,
        collectedProfile,
        history
      })
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        source: 'backend',
        ...data
      };
    }
  } catch {
    // Backend offline / not yet running. Proceed to intelligent client state machine.
    // (This is normal until the user launches the backend server)
  }

  // 2. Intelligent Client-Side Conversational State Machine Fallback
  return evaluateClientConversationStep({
    userMessage,
    currentStep,
    language,
    collectedProfile
  });
}

/**
 * Client-Side Conversational Evaluator & Profile Extractor
 */
function evaluateClientConversationStep({
  userMessage,
  currentStep,
  language = 'en',
  collectedProfile = {}
}) {
  const isKn = language === 'kn';
  const updatedProfile = { ...collectedProfile };
  const rawInput = (userMessage || '').trim();

  // 0. Direct "Evaluate Now" trigger (from quick button, chip, or speech command)
  const isEvaluateCommand =
    rawInput === 'EVALUATE_NOW' ||
    /^(evaluate|check\s+schemes?|show\s+schemes?|evaluate\s+now|check\s+eligibility|results?|ಪರಿಶೀಲಿಸಿ|ಯೋಜನೆಗಳನ್ನು\s+ತೋರಿಸಿ|ಈಗಲೇ\s+ಪರಿಶೀಲಿಸಿ)$/i.test(rawInput);

  if (isEvaluateCommand) {
    const completionReply = isKn
      ? `ಧನ್ಯವಾದಗಳು ${updatedProfile.fullName || 'ರೈತ ಬಾಂಧವರೇ'}! ನಿಮ್ಮ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳ ಫಲಿತಾಂಶಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.`
      : `Thank you ${updatedProfile.fullName || 'Farmer'}! Your farm profile has been evaluated against Central and Karnataka State schemes. View your qualified schemes below.`;

    return {
      success: true,
      source: 'client_fallback',
      reply: completionReply,
      nextStep: 'complete',
      options: [],
      placeholder: '',
      updatedProfile,
      isComplete: true,
      stepProgress: 100
    };
  }

  // 1. Handle confirmation step
  if (currentStep === 'confirm') {
    const lower = rawInput.toLowerCase();
    const isConfirmed =
      rawInput === 'CONFIRM_YES' ||
      /^(yes|correct|right|true|accurate|ha|haa|sari|houdu|ಹೌದು|ಸರಿ|ಖಚಿತ|ok|okay)$/i.test(lower);

    const isDeclined =
      rawInput === 'CONFIRM_NO' ||
      /^(no|nope|wrong|change|modify|edit|tappu|illa|ಇಲ್ಲ|ತಪ್ಪು|ಬದಲಾವಣೆ)$/i.test(lower);

    if (isConfirmed) {
      const completionReply = isKn
        ? `ಧನ್ಯವಾದಗಳು ${updatedProfile.fullName || 'ರೈತ ಬಾಂಧವರೇ'}! ನಿಮ್ಮ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ. ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾದ 9 ಕೇಂದ್ರ ಮತ್ತು ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.`
        : `Thank you ${updatedProfile.fullName || 'Farmer'}! Your farm profile has been confirmed. I have evaluated your data against 9 Central and Karnataka State schemes.`;

      return {
        success: true,
        source: 'client_fallback',
        reply: completionReply,
        nextStep: 'complete',
        options: [],
        placeholder: '',
        updatedProfile,
        isComplete: true,
        stepProgress: 100
      };
    } else if (isDeclined) {
      const editPrompt = isKn
        ? "ಯಾವ ಮಾಹಿತಿಯನ್ನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೀರಿ? ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ, ಅಥವಾ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಲು ಫಾರ್ಮ್ ಮೋಡ್‌ಗೆ ಹೋಗಿ."
        : "Which detail would you like to update? Choose an option below, or switch to Form Mode to edit all fields at once.";

      const editOptions = isKn
        ? [
            { label: "ಹೆಸರು ಬದಲಾಯಿಸಿ", value: "EDIT_NAME" },
            { label: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಬದಲಾಯಿಸಿ", value: "EDIT_LAND" },
            { label: "ಸ್ಥಳ / ಜಿಲ್ಲೆ ಬದಲಾಯಿಸಿ", value: "EDIT_LOCATION" },
            { label: "ಬೆಳೆ ಬದಲಾಯಿಸಿ", value: "EDIT_CROP" },
            { label: "ಫಾರ್ಮ್ ಮೋಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ", value: "CONFIRM_EDIT_FORM" }
          ]
        : [
            { label: "Change Name", value: "EDIT_NAME" },
            { label: "Change Land Size", value: "EDIT_LAND" },
            { label: "Change Location", value: "EDIT_LOCATION" },
            { label: "Change Crop", value: "EDIT_CROP" },
            { label: "Review All in Form Mode", value: "CONFIRM_EDIT_FORM" }
          ];

      return {
        success: true,
        source: 'client_fallback',
        reply: editPrompt,
        nextStep: 'confirm_edit',
        options: editOptions,
        placeholder: '',
        updatedProfile,
        isComplete: false,
        stepProgress: 90
      };
    }
  }

  // Handle jump back to specific edit field
  if (currentStep === 'confirm_edit' || rawInput.startsWith('EDIT_')) {
    let targetStep = 'name';
    if (rawInput === 'EDIT_LAND' || /land|ಭೂಮಿ/i.test(rawInput)) targetStep = 'land';
    else if (rawInput === 'EDIT_LOCATION' || /location|ಸ್ಥಳ|ಜಿಲ್ಲೆ/i.test(rawInput)) targetStep = 'location';
    else if (rawInput === 'EDIT_CROP' || /crop|ಬೆಳೆ/i.test(rawInput)) targetStep = 'crop';
    else if (rawInput === 'EDIT_NAME' || /name|ಹೆಸರು/i.test(rawInput)) targetStep = 'name';

    const targetConfig = QUESTION_FLOW[targetStep]?.[language] || QUESTION_FLOW[targetStep]?.en;
    return {
      success: true,
      source: 'client_fallback',
      reply: targetConfig.question,
      nextStep: targetStep,
      options: targetConfig.options || [],
      placeholder: targetConfig.placeholder || '',
      updatedProfile,
      isComplete: false,
      stepProgress: Math.round((STEP_SEQUENCE.indexOf(targetStep) / (STEP_SEQUENCE.length - 1)) * 100)
    };
  }

  // Handle user questions / counter-inquiries (e.g. "who", "when", "why", "what", "where", "how")
  const userQuestionType = detectUserQuestion(rawInput);
  if (userQuestionType) {
    const questionReply = getQuestionAnswer(userQuestionType, currentStep, isKn, updatedProfile.fullName);
    const currentStepConfig = QUESTION_FLOW[currentStep]?.[language] || QUESTION_FLOW[currentStep]?.en;
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    const hasCaptured = Boolean(
      updatedProfile.fullName ||
      updatedProfile.district ||
      updatedProfile.landHolding ||
      updatedProfile.landType ||
      updatedProfile.cropType
    );
    const stepOptions = [...(currentStepConfig?.options || [])];
    if (hasCaptured && !stepOptions.some(o => o.value === 'EVALUATE_NOW')) {
      stepOptions.push({
        label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
        value: "EVALUATE_NOW",
        subtext: isKn ? "ದಾಖಲಾದ ವಿವರಗಳೊಂದಿಗೆ" : "With captured details"
      });
    }

    return {
      success: true,
      source: 'client_fallback',
      reply: questionReply,
      nextStep: currentStep,
      options: stepOptions,
      placeholder: currentStepConfig?.placeholder || '',
      updatedProfile,
      isComplete: false,
      stepProgress: Math.round(((currentIndex) / (STEP_SEQUENCE.length - 1)) * 100)
    };
  }

  // Input Validation per step
  let validationError = null;

  switch (currentStep) {
    case 'name': {
      const extracted = rawInput.replace(/^(my name is|i am|nan hesaru|nanu)\s+/i, '').trim();
      if (isUnknownOrEvasiveInput(rawInput) || isInvalidFarmerName(extracted)) {
        validationError = isKn
          ? `'${extracted || rawInput}' ಎಂಬುದು ವ್ಯಕ್ತಿಯ ಮಾನ್ಯ ಹೆಸರಲ್ಲ. ಅಧಿಕೃತ FRUITS ಮತ್ತು ಪಹಣಿ (RTC) ದಾಖಲೆಗಳಲ್ಲಿರುವ ನಿಮ್ಮ ಅಧಿಕೃತ ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸಿ (ಉದಾ: ರಮೇಶ್ ಗೌಡ ಅಥವಾ ಲಕ್ಷ್ಮಿ ದೇವಿ), ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ.`
          : `'${extracted || rawInput}' is not a valid person's name. Official Karnataka scheme registries (FRUITS and RTC records) require the farmer's real legal name. Please state your full name (for example, 'Ramesh Gowda' or 'Lakshmi Devi'), or select one of the suggested names below.`;
      } else {
        updatedProfile.fullName = extracted;
      }
      break;
    }

    case 'age': {
      const match = rawInput.match(/\b\d{1,3}\b/);
      const parsedAge = match ? parseInt(match[0], 10) : parseInt(rawInput, 10);
      if (isUnknownOrEvasiveInput(rawInput) || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 105) {
        validationError = isKn
          ? "ಪಿಎಂ ಕಿಸಾನ್, ಕಿಸಾನ್ ಮಾನ್‌ಧನ್ ಪಿಂಚಣಿ (18-40 ವರ್ಷ) ಮತ್ತು ಯುವ ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ 18 ರಿಂದ 100 ವರ್ಷದ ನಡುವಿನ ಮಾನ್ಯ ವಯಸ್ಸು ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಿ (ಉದಾ: 35) ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ."
          : "A valid age between 18 and 100 is required because central and state schemes (like PM-KISAN, PM-KMY pension 18-40 yrs, and senior welfare) depend on age. Please enter your age (e.g., 35) or pick one of the options below.";
      } else {
        updatedProfile.age = String(parsedAge);
      }
      break;
    }

    case 'gender': {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ಮಹಿಳಾ ರೈತರಿಗೆ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಮತ್ತು ಹನಿ ನೀರಾವರಿಯಲ್ಲಿ ವಿಶೇಷ ಹೆಚ್ಚುವರಿ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಪುರುಷ, ಮಹಿಳೆ ಅಥವಾ ಇತರ)."
          : "Gender is needed because women farmers receive special bonus subsidies under PMKSY micro-irrigation and machinery schemes. Please select Male, Female, or Other from the options below.";
      } else if (/female|woman|stree|mahila|ಮಹಿಳೆ|ಹೆಣ್ಣು/i.test(rawInput)) {
        updatedProfile.gender = 'Female';
      } else if (/other|trans|ಇತರ/i.test(rawInput)) {
        updatedProfile.gender = 'Other';
      } else if (/male|man|purusha|ಪುರುಷ|ಗಂಡು/i.test(rawInput)) {
        updatedProfile.gender = 'Male';
      } else {
        validationError = isKn
          ? "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ (ಪುರುಷ, ಮಹಿಳೆ ಅಥವಾ ಇತರ). ಕೆಳಗಿನ ಬಟನ್‌ಗಳಲ್ಲಿ ಒಂದನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ."
          : "Please specify a valid gender (Male, Female, or Other). You can tap one of the suggested buttons below.";
      }
      break;
    }

    case 'category': {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಇತರ ಕೃಷಿ ಯೋಜನೆಗಳಲ್ಲಿ SC/ST ರೈತರಿಗೆ 90% ರಿಂದ 100% ಹಾಗೂ OBC ರೈತರಿಗೆ ವಿಶೇಷ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗವನ್ನು ಕೆಳಗೆ ಆರಿಸಿ."
          : "Social reservation category is required to determine your subsidy rate (e.g., 90% to 100% subsidy for SC/ST under Ganga Kalyana, compared to standard General rates). Please select General, OBC, SC, or ST below.";
      } else if (/sc|scheduled caste|ಪರಿಶಿಷ್ಟ ಜಾತಿ/i.test(rawInput)) {
        updatedProfile.category = 'SC';
      } else if (/st|scheduled tribe|ಪರಿಶಿಷ್ಟ ಪಂಗಡ/i.test(rawInput)) {
        updatedProfile.category = 'ST';
      } else if (/obc|2a|2b|3a|3b|ಹಿಂದುಳಿದ/i.test(rawInput)) {
        updatedProfile.category = 'OBC';
      } else if (/gen|general|ಸಾಮಾನ್ಯ/i.test(rawInput)) {
        updatedProfile.category = 'General';
      } else {
        validationError = isKn
          ? "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಸಾಮಾಜಿಕ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ: ಸಾಮಾನ್ಯ, OBC, SC, ಅಥವಾ ST."
          : "Please select a recognized category: General, OBC, SC, or ST from the options below.";
      }
      break;
    }

    case 'location': {
      const hasLetters = /[a-zA-Z\u0C80-\u0CFF]/.test(rawInput);
      if (isUnknownOrEvasiveInput(rawInput) || !hasLetters || rawInput.length < 3) {
        validationError = isKn
          ? "ಕರ್ನಾಟಕದ ಕೃಷಿ ಯೋಜನೆಗಳು ಜಿಲ್ಲಾವಾರು ಜಾರಿಯಾಗುತ್ತವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿ ಇರುವ ಜಿಲ್ಲೆಯನ್ನು ತಿಳಿಸಿ (ಉದಾ: ಮಂಡ್ಯ, ಬೆಳಗಾವಿ, ಮೈಸೂರು) ಅಥವಾ ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ."
          : "A valid Karnataka district is required because agricultural schemes operate by district. Please name your district (e.g. Mandya, Belagavi, Mysuru) or click an option below.";
      } else {
        if (/mandya|ಮಂಡ್ಯ/i.test(rawInput)) {
          updatedProfile.district = 'Mandya';
          updatedProfile.taluk = 'Pandavapura';
        } else if (/belagavi|belgaum|ಬೆಳಗಾವಿ/i.test(rawInput)) {
          updatedProfile.district = 'Belagavi';
          updatedProfile.taluk = 'Chikkodi';
        } else if (/shivamogga|shimoga|ಶಿವಮೊಗ್ಗ/i.test(rawInput)) {
          updatedProfile.district = 'Shivamogga';
          updatedProfile.taluk = 'Bhadravati';
        } else if (/mysuru|mysore|ಮೈಸೂರು/i.test(rawInput)) {
          updatedProfile.district = 'Mysuru';
          updatedProfile.taluk = 'Nanjangud';
        } else {
          updatedProfile.district = rawInput;
          updatedProfile.taluk = 'Taluk';
        }
        updatedProfile.state = 'Karnataka';
      }
      break;
    }

    case 'land': {
      const match = rawInput.match(/[\d.]+/);
      const parsedAcres = match ? parseFloat(match[0]) : NaN;
      if (isUnknownOrEvasiveInput(rawInput) || (isNaN(parsedAcres) && !/marginal|small|medium|large|ಅತಿ ಸಣ್ಣ|ಸಣ್ಣ|ಮಧ್ಯಮ|ದೊಡ್ಡ/i.test(rawInput))) {
        validationError = isKn
          ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣದ ಆಧಾರದ ಮೇಲೆ ಅತಿ ಸಣ್ಣ (<2.5 ಎಕರೆ), ಸಣ್ಣ (2.5-5 ಎಕರೆ) ರೈತರನ್ನು ಗುರುತಿಸುತ್ತವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯ ಎಕರೆಗಳನ್ನು ತಿಳಿಸಿ (ಉದಾ: 2.5 ಅಥವಾ 4) ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆ ಆರಿಸಿ."
          : "Government schemes categorize farmers by land holding (Marginal <2.5 acres, Small 2.5-5 acres). Please provide a valid land size in acres (e.g., 2.5, 4.0) or pick one of the options below.";
      } else {
        if (/< 2.5|marginal|ಅತಿ ಸಣ್ಣ/i.test(rawInput) || parsedAcres <= 2.5) {
          updatedProfile.landType = 'Marginal (< 2.5 Acres)';
          updatedProfile.landHolding = String(parsedAcres || 2.0);
        } else if (/2.5 - 5|small|ಸಣ್ಣ/i.test(rawInput) || parsedAcres <= 5.0) {
          updatedProfile.landType = 'Small (2.5 - 5 Acres)';
          updatedProfile.landHolding = String(parsedAcres || 3.5);
        } else if (/5 - 10|medium|ಮಧ್ಯಮ/i.test(rawInput) || parsedAcres <= 10.0) {
          updatedProfile.landType = 'Medium (5 - 10 Acres)';
          updatedProfile.landHolding = String(parsedAcres || 7.0);
        } else {
          updatedProfile.landType = 'Large (> 10 Acres)';
          updatedProfile.landHolding = String(parsedAcres || 12.0);
        }
      }
      break;
    }

    case 'crop': {
      const hasLetters = /[a-zA-Z\u0C80-\u0CFF]/.test(rawInput);
      if (isUnknownOrEvasiveInput(rawInput) || !hasLetters || rawInput.length < 2) {
        validationError = isKn
          ? "ಬೆಳೆಯ ಮಾಹಿತಿ ಮುಖ್ಯವಾಗಿದೆ: ಸಿರಿಧಾನ್ಯಗಳಿಗೆ 'ರೈತ ಸಿರಿ' ಅಡಿಯಲ್ಲಿ ₹10,000/ಹೆಕ್ಟೇರ್ ಪ್ರೋತ್ಸಾಹಧನ, ಭತ್ತಕ್ಕೆ ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ ಲಭ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನೀವು ಬೆಳೆಯುವ ಬೆಳೆಯ ಹೆಸರನ್ನು ತಿಳಿಸಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ."
          : "Crop information is required because specific schemes provide dedicated benefits (e.g., ₹10,000/ha for Millets under Raitha Siri, MSP & PMFBY insurance for Paddy). Please enter or choose your crop below.";
      } else {
        if (/paddy|rice|ಭತ್ತ/i.test(rawInput)) {
          updatedProfile.cropType = 'Paddy / Rice';
        } else if (/pulse|oilseed|ಬೇಳೆ|ತೊಗರಿ/i.test(rawInput)) {
          updatedProfile.cropType = 'Pulses & Oilseeds';
        } else if (/horticulture|vegetable|fruit|ತೋಟಗಾರಿಕೆ/i.test(rawInput)) {
          updatedProfile.cropType = 'Horticulture';
        } else if (/sugarcane|cotton|ಕಬ್ಬು|ಹತ್ತಿ/i.test(rawInput)) {
          updatedProfile.cropType = 'Sugarcane / Cotton';
        } else {
          updatedProfile.cropType = rawInput || 'Ragi & Cereals';
        }
      }
      break;
    }

    case 'irrigation': {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ನೀರಾವರಿ ಸೌಲಭ್ಯವು PMKSY ಹನಿ ನೀರಾವರಿ, ಕೃಷಿ ಭಾಗ್ಯ ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಕುಸುಮ್ ಸೌರ ಪಂಪ್ ಅರ್ಹತೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು ಮಳೆ ಆಶ್ರಿತ, ಬೋರ್‌ವೆಲ್ ಅಥವಾ ಕಾಲುವೆ ಆಯ್ಕೆಮಾಡಿ."
          : "Irrigation type determines eligibility for PMKSY drip irrigation, Krishi Bhagya farm ponds, and PM-KUSUM solar pumps. Please select Rainfed, Borewell, or Canal from the choices below.";
      } else {
        if (/rainfed|dryland|ಒಣಭೂಮಿ/i.test(rawInput) && !/borewell/i.test(rawInput)) {
          updatedProfile.irrigationType = 'Pure Rainfed (Dryland)';
        } else if (/canal|river|ಕಾಲುವೆ|ನದಿ/i.test(rawInput)) {
          updatedProfile.irrigationType = 'Canal / River Irrigated';
        } else if (/drip|micro|ಹನಿ/i.test(rawInput)) {
          updatedProfile.irrigationType = 'Drip / Micro-Irrigation';
        } else {
          updatedProfile.irrigationType = 'Borewell & Rainfed';
        }
      }
      break;
    }

    case 'benefits': {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ಸರ್ಕಾರದ ಸಹಾಯಧನ ನೇರವಾಗಿ ಖಾತೆಗೆ ಜಮೆಯಾಗಲು FRUITS ID ಮತ್ತು ಆಧಾರ್ DBT ಸ್ಥಿತಿ ಮುಖ್ಯ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ."
          : "FRUITS registration and Aadhaar DBT status are required for direct benefit deposits. Please pick one of the options below.";
      } else {
        updatedProfile.aadhaarLinked = true;
        updatedProfile.fruitsRegistered = !/need fruits|ಬಾಕಿ/i.test(rawInput);
      }
      break;
    }

    default:
      break;
  }

  const hasCapturedDetails = Boolean(
    updatedProfile.fullName ||
    updatedProfile.district ||
    updatedProfile.landHolding ||
    updatedProfile.landType ||
    updatedProfile.cropType
  );

  // If validation failed, stay on the same step and re-prompt
  if (validationError) {
    const currentStepConfig = QUESTION_FLOW[currentStep]?.[language] || QUESTION_FLOW[currentStep]?.en;
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    const returnedOptions = [...(currentStepConfig?.options || [])];
    if (hasCapturedDetails && !returnedOptions.some(o => o.value === 'EVALUATE_NOW')) {
      returnedOptions.push({
        label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
        value: "EVALUATE_NOW",
        subtext: isKn ? "ದಾಖಲಾದ ವಿವರಗಳೊಂದಿಗೆ" : "With captured details"
      });
    }
    return {
      success: true,
      source: 'client_fallback',
      reply: validationError,
      nextStep: currentStep,
      options: returnedOptions,
      placeholder: currentStepConfig?.placeholder || '',
      updatedProfile,
      isComplete: false,
      stepProgress: Math.round(((currentIndex) / (STEP_SEQUENCE.length - 1)) * 100)
    };
  }

  // Advance to next step
  const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
  const nextStepIndex = Math.min(currentIndex + 1, STEP_SEQUENCE.length - 1);
  const nextStep = STEP_SEQUENCE[nextStepIndex];
  const isComplete = nextStep === 'complete';

  // Get question template
  const stepConfig = QUESTION_FLOW[nextStep]?.[language] || QUESTION_FLOW[nextStep]?.en;
  let replyText = stepConfig?.question || "Thank you for the details.";

  // If next step is 'confirm', output formatted summary
  if (nextStep === 'confirm') {
    replyText = formatClientProfileSummary(updatedProfile, isKn);
  } else {
    // Dynamic variable interpolation
    replyText = replyText.replace('{name}', updatedProfile.fullName || (isKn ? 'ರೈತ ಮಿತ್ರ' : 'Farmer Friend'));
  }

  const returnedOptions = [...(stepConfig?.options || [])];
  if (hasCapturedDetails && nextStep !== 'complete' && nextStep !== 'confirm') {
    if (!returnedOptions.some(o => o.value === 'EVALUATE_NOW')) {
      returnedOptions.push({
        label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
        value: "EVALUATE_NOW",
        subtext: isKn ? "ದಾಖಲಾದ ವಿವರಗಳೊಂದಿಗೆ" : "With captured details"
      });
    }
  }

  return {
    success: true,
    source: 'client_fallback',
    reply: replyText,
    nextStep,
    options: returnedOptions,
    placeholder: stepConfig?.placeholder || '',
    updatedProfile,
    isComplete,
    stepProgress: Math.round(((nextStepIndex) / (STEP_SEQUENCE.length - 1)) * 100)
  };
}

/**
 * Helper to fetch initial greeting message when chat opens
 */
export function getInitialChatMessage(language = 'en', existingName = '', existingProfile = {}) {
  const stepConfig = QUESTION_FLOW.name[language] || QUESTION_FLOW.name.en;
  const isKn = language === 'kn';
  const options = existingName ? [{ label: existingName, value: existingName }, ...stepConfig.options] : [...stepConfig.options];

  const hasCapturedDetails = Boolean(
    existingName ||
    existingProfile?.district ||
    existingProfile?.landHolding ||
    existingProfile?.landType ||
    existingProfile?.cropType
  );

  if (hasCapturedDetails && !options.some(o => o.value === 'EVALUATE_NOW')) {
    options.unshift({
      label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
      value: "EVALUATE_NOW",
      subtext: isKn ? "ದಾಖಲಾದ ವಿವರಗಳೊಂದಿಗೆ" : "Use existing details"
    });
  }

  return {
    reply: stepConfig.question,
    nextStep: 'name',
    options,
    placeholder: stepConfig.placeholder,
    isComplete: false,
    stepProgress: 10
  };
}
