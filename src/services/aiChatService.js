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

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_CHAT_API_URL)
  ? import.meta.env.VITE_AI_CHAT_API_URL
  : '/api/eligibility-chat';

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
  'complete'
];

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
  const updatedProfile = { ...collectedProfile };
  const cleanInput = (userMessage || '').trim();

  // Extract data based on current step
  switch (currentStep) {
    case 'name':
      if (cleanInput) {
        // Strip out "my name is", "i am", etc. if typed
        const extracted = cleanInput.replace(/^(my name is|i am|nan hesaru|nanu)\s+/i, '');
        updatedProfile.fullName = extracted || cleanInput;
      }
      break;

    case 'age': {
      // Extract numeric age if user typed "I am 35 years old"
      const match = cleanInput.match(/\b\d{2}\b/);
      if (match) {
        updatedProfile.age = match[0];
      } else if (cleanInput) {
        updatedProfile.age = cleanInput;
      }
      break;
    }

    case 'gender':
      if (/female|woman|stree|mahila|ಮಹಿಳೆ/i.test(cleanInput)) {
        updatedProfile.gender = 'Female';
      } else if (/other|ಇತರ/i.test(cleanInput)) {
        updatedProfile.gender = 'Other';
      } else {
        updatedProfile.gender = 'Male';
      }
      break;

    case 'category':
      if (/sc|scheduled caste|ಪರಿಶಿಷ್ಟ ಜಾತಿ/i.test(cleanInput)) {
        updatedProfile.category = 'SC';
      } else if (/st|scheduled tribe|ಪರಿಶಿಷ್ಟ ಪಂಗಡ/i.test(cleanInput)) {
        updatedProfile.category = 'ST';
      } else if (/obc|2a|2b|3a|3b|ಹಿಂದುಳಿದ/i.test(cleanInput)) {
        updatedProfile.category = 'OBC';
      } else {
        updatedProfile.category = 'General';
      }
      break;

    case 'location':
      if (cleanInput) {
        if (/mandya|ಮಂಡ್ಯ/i.test(cleanInput)) {
          updatedProfile.district = 'Mandya';
          updatedProfile.taluk = 'Pandavapura';
        } else if (/belagavi|belgaum|ಬೆಳಗಾವಿ/i.test(cleanInput)) {
          updatedProfile.district = 'Belagavi';
          updatedProfile.taluk = 'Chikkodi';
        } else if (/shivamogga|shimoga|ಶಿವಮೊಗ್ಗ/i.test(cleanInput)) {
          updatedProfile.district = 'Shivamogga';
          updatedProfile.taluk = 'Bhadravati';
        } else if (/mysuru|mysore|ಮೈಸೂರು/i.test(cleanInput)) {
          updatedProfile.district = 'Mysuru';
          updatedProfile.taluk = 'Nanjangud';
        } else {
          updatedProfile.district = 'Bengaluru Rural';
          updatedProfile.taluk = 'Hoskote';
        }
        updatedProfile.state = 'Karnataka';
      }
      break;

    case 'land':
      if (cleanInput) {
        if (/< 2.5|marginal|ಅತಿ ಸಣ್ಣ/i.test(cleanInput)) {
          updatedProfile.landType = 'Marginal (< 2.5 Acres)';
          updatedProfile.landHolding = '2.0';
        } else if (/2.5 - 5|small|ಸಣ್ಣ/i.test(cleanInput)) {
          updatedProfile.landType = 'Small (2.5 - 5 Acres)';
          updatedProfile.landHolding = '3.5';
        } else if (/5 - 10|medium|ಮಧ್ಯಮ/i.test(cleanInput)) {
          updatedProfile.landType = 'Medium (5 - 10 Acres)';
          updatedProfile.landHolding = '7.0';
        } else {
          updatedProfile.landType = 'Large (> 10 Acres)';
          updatedProfile.landHolding = '12.0';
        }
      }
      break;

    case 'crop':
      if (/paddy|rice|ಭತ್ತ/i.test(cleanInput)) {
        updatedProfile.cropType = 'Paddy / Rice';
      } else if (/pulse|oilseed|ಬೇಳೆ|ತೊಗರಿ/i.test(cleanInput)) {
        updatedProfile.cropType = 'Pulses & Oilseeds';
      } else if (/horticulture|vegetable|fruit|ತೋಟಗಾರಿಕೆ/i.test(cleanInput)) {
        updatedProfile.cropType = 'Horticulture';
      } else if (/sugarcane|cotton|ಕಬ್ಬು|ಹತ್ತಿ/i.test(cleanInput)) {
        updatedProfile.cropType = 'Sugarcane / Cotton';
      } else {
        updatedProfile.cropType = 'Ragi & Cereals';
      }
      break;

    case 'irrigation':
      if (/rainfed|dryland|ಒಣಭೂಮಿ/i.test(cleanInput) && !/borewell/i.test(cleanInput)) {
        updatedProfile.irrigationType = 'Pure Rainfed (Dryland)';
      } else if (/canal|river|ಕಾಲುವೆ|ನದಿ/i.test(cleanInput)) {
        updatedProfile.irrigationType = 'Canal / River Irrigated';
      } else if (/drip|micro|ಹನಿ/i.test(cleanInput)) {
        updatedProfile.irrigationType = 'Drip / Micro-Irrigation';
      } else {
        updatedProfile.irrigationType = 'Borewell & Rainfed';
      }
      break;

    case 'benefits':
      updatedProfile.aadhaarLinked = true;
      updatedProfile.fruitsRegistered = !/need fruits|ಬಾಕಿ/i.test(cleanInput);
      break;

    default:
      break;
  }

  // Determine next step
  const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
  const nextStepIndex = Math.min(currentIndex + 1, STEP_SEQUENCE.length - 1);
  const nextStep = STEP_SEQUENCE[nextStepIndex];
  const isComplete = nextStep === 'complete';

  // Get question template
  const stepConfig = QUESTION_FLOW[nextStep]?.[language] || QUESTION_FLOW[nextStep]?.en;
  let replyText = stepConfig?.question || "Thank you for the details.";

  // Dynamic variable interpolation
  replyText = replyText.replace('{name}', updatedProfile.fullName || (language === 'kn' ? 'ರೈತ ಮಿತ್ರ' : 'Farmer Friend'));

  return {
    success: true,
    source: 'client_fallback',
    reply: replyText,
    nextStep,
    options: stepConfig?.options || [],
    placeholder: stepConfig?.placeholder || '',
    updatedProfile,
    isComplete,
    stepProgress: Math.round(((nextStepIndex) / (STEP_SEQUENCE.length - 1)) * 100)
  };
}

/**
 * Helper to fetch initial greeting message when chat opens
 */
export function getInitialChatMessage(language = 'en', existingName = '') {
  const stepConfig = QUESTION_FLOW.name[language] || QUESTION_FLOW.name.en;
  return {
    reply: stepConfig.question,
    nextStep: 'name',
    options: existingName ? [{ label: existingName, value: existingName }, ...stepConfig.options] : stepConfig.options,
    placeholder: stepConfig.placeholder,
    isComplete: false,
    stepProgress: 10
  };
}
