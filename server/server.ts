import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { VERIFIED_SCHEMES } from './data/schemesData.ts';
import { RulesEngine } from './rules/rulesEngine.ts';
import { FarmerProfile } from './types/scheme.ts';
import { dbStore, verifyPassword } from './data/dbStore.ts';
import {
  sendOtpSms,
  sendDeadlineReminderSms,
  getConfiguredSmsProvider,
  maskPhoneNumber
} from './services/smsSender.ts';
import { normalizeIndianPhone, validateUsername } from './utils/phoneUtils.ts';
import { evaluateDeadlineStatus } from './utils/deadlineUtils.ts';
import { OtpPurpose } from './types/auth.ts';
import { checkPostgreSqlConnection } from './data/pgPool.ts';
import {
  generateMurfSpeech,
  getMurfAvailableVoices,
  isMurfConfigured,
  getMurfDefaultConfig
} from './services/murfService.ts';
import {
  transcribeAudio,
  isDeepgramConfigured
} from './services/deepgramService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCHEME_ALIASES: Record<string, string> = {
  'pm-kisan': 'pm-kisan-raitha-siri',
  'pm-kisan-raitha-siri': 'pm-kisan-raitha-siri',
  'raitha-siri': 'pm-kisan-raitha-siri',
  'kcc': 'pm-kisan-raitha-siri',
  'pm-fasal-bima': 'pmfby-samrakshane',
  'pmfby': 'pmfby-samrakshane',
  'pmfby-samrakshane': 'pmfby-samrakshane',
  'pm-krishi-sinchayee': 'pmksy-micro-irrigation',
  'pmksy': 'pmksy-micro-irrigation',
  'pmksy-micro-irrigation': 'pmksy-micro-irrigation',
  'ganga-kalyana': 'ganga-kalyana',
  'krishi-yanthradhare': 'krishi-yanthradhare',
  'krishi-yantradhare': 'krishi-yanthradhare',
  'rkvy': 'krishi-yanthradhare',
  'custom-hiring': 'krishi-yanthradhare',
  'raitha-vidya-nidhi': 'raitha-vidya-nidhi',
  'raitha-vidyanidhi': 'raitha-vidya-nidhi',
  'raitha-sanjeevini': 'raitha-sanjeevini',
  'yashaswini': 'yashaswini-health',
  'yashaswini-health': 'yashaswini-health',
  'national-horticulture': 'pmksy-micro-irrigation'
};

export function findSchemeById(rawId: string | undefined | null) {
  if (!rawId) return undefined;
  const normalized = rawId.toLowerCase().trim();
  const canonicalId = SCHEME_ALIASES[normalized] || normalized;
  return (
    VERIFIED_SCHEMES.find((s) => s.id === canonicalId) ||
    VERIFIED_SCHEMES.find((s) => s.id.toLowerCase() === normalized) ||
    VERIFIED_SCHEMES.find((s) => s.id.toLowerCase().includes(normalized)) ||
    VERIFIED_SCHEMES.find((s) => normalized.includes(s.id.toLowerCase()))
  );
}

const app = express();

const args = process.argv.slice(2);
const portFlagIndex = args.indexOf('--port');
let argPort: number | null = null;
if (portFlagIndex !== -1 && args[portFlagIndex + 1]) {
  argPort = parseInt(args[portFlagIndex + 1], 10);
}

const PORT =
  argPort ||
  (process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 5000);

app.use(express.json());

// Allow local cross-port origins and cloud frontend deployments (e.g., Vercel, localhost)
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
      /\.vercel\.app$/i.test(origin) ||
      origin === process.env.APP_URL ||
      origin === process.env.FRONTEND_URL ||
      origin === process.env.CLIENT_ORIGIN)
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Strict cache boundary headers: never allow intermediaries or browsers to cache auth, OTP, or private records
app.use(
  [
    '/api/auth',
    '/api/saved-schemes',
    '/api/applications',
    '/api/notifications',
    '/api/reminders',
    '/api/eligibility',
    '/api/assistant'
  ],
  (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    next();
  }
);

// Optional Gemini instance for grounded explanations (Backend only)
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// Secret key for JWT signing
const JWT_SECRET =
  process.env.JWT_SECRET || process.env.AUTH_SECRET || 'kisan-scheme-saathi-jwt-secret-2026';

// In-memory JWT revocation set for explicit logout within token TTL
const revokedTokens = new Set<string>();

function signToken(payload: { userId: string; username: string; phoneNumber: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(
  tokenString: string
): { userId: string; username: string; phoneNumber: string } | null {
  try {
    if (revokedTokens.has(tokenString)) return null;
    const parts = tokenString.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (signature.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
  const user = dbStore.findUserById(payload.userId);
  if (!user || !user.phoneVerified || user.accountStatus !== 'ACTIVE') {
    return res.status(401).json({ error: 'Account unavailable or phone not verified' });
  }
  (req as any).user = user;
  (req as any).authToken = token;
  next();
}

async function processReminderNotificationsAndOptionalSms(userId?: string) {
  const created = dbStore.runDeadlineReminderSweep(userId);
  for (const item of created) {
    if (item.smsEligibleUser && item.notification.schemeId && item.notification.thresholdDays) {
      const alreadySent = dbStore.hasSmsReminderBeenDispatched(
        item.smsEligibleUser.id,
        item.notification.schemeId,
        item.deadlineDate,
        item.notification.thresholdDays
      );
      if (!alreadySent) {
        const smsRes = await sendDeadlineReminderSms({
          phoneNumber: item.smsEligibleUser.phoneNumber,
          schemeName: item.notification.schemeNameSnapshot || item.notification.schemeId,
          deadlineDate: item.deadlineDate,
          remainingDays: item.remainingDays
        });
        if (smsRes.sent) {
          dbStore.recordSmsReminderDispatched(
            item.smsEligibleUser.id,
            item.notification.schemeId,
            item.deadlineDate,
            item.notification.thresholdDays
          );
        }
      }
    }
  }
  return created;
}

// Run reminder evaluation periodically (every 15 mins)
setInterval(() => {
  processReminderNotificationsAndOptionalSms().catch(() => {});
}, 15 * 60 * 1000);

// ==========================================
// PHONE + USERNAME + SMS OTP AUTH ENDPOINTS
// ==========================================

/**
 * Step 1 of Registration: Validate inputs, store PENDING_VERIFICATION user,
 * issue hashed 6-digit OTP, and dispatch via configured SMS provider.
 * Never exposes raw OTP in JSON response or logs.
 */
app.post('/api/auth/register', async (req, res) => {
  const {
    username,
    fullName,
    phoneNumber,
    password,
    confirmPassword,
    preferredLanguage,
    state,
    district,
    taluk,
    category,
    dob,
    gender,
    age,
    landHolding,
    landType,
    cropType,
    irrigationType,
    annualIncome,
    fruitsId,
    termsAccepted
  } = req.body;

  if (!fullName || !phoneNumber) {
    return res.status(400).json({
      error: 'Full name and Indian mobile number are required.'
    });
  }

  if (termsAccepted === false) {
    return res.status(400).json({
      error: 'Please accept the Terms of Service and Privacy Policy to continue.'
    });
  }

  const phoneCheck = normalizeIndianPhone(phoneNumber);
  if (!phoneCheck.valid || !phoneCheck.e164) {
    return res.status(400).json({ error: phoneCheck.errorEn || 'Invalid Indian mobile number.' });
  }

  const rawUsername = username || `farmer_${phoneCheck.e164.slice(-6)}_${Date.now().toString().slice(-4)}`;
  const usernameCheck = validateUsername(rawUsername);
  if (!usernameCheck.valid) {
    return res.status(400).json({ error: usernameCheck.errorEn });
  }

  const rawPassword = password || `farmer_${crypto.randomBytes(8).toString('hex')}`;
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
  }

  const existingByUsername = dbStore.findUserByUsername(usernameCheck.normalized);
  if (existingByUsername && existingByUsername.phoneVerified) {
    return res.status(409).json({ error: 'This username is already taken.' });
  }

  const existingByPhone = dbStore.findUserByPhone(phoneCheck.e164);
  if (existingByPhone && existingByPhone.phoneVerified) {
    return res.status(409).json({
      error: 'An account with this mobile number is already registered. Please login instead.',
      errorKn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.',
      code: 'USER_ALREADY_EXISTS',
      exists: true
    });
  }

  const rateCheck = dbStore.checkOtpRateLimits(phoneCheck.e164, 'REGISTRATION');
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: rateCheck.reason,
      retryAfterSeconds: rateCheck.retryAfterSeconds
    });
  }

  const pendingUser = dbStore.upsertPendingRegistration({
    username: usernameCheck.normalized,
    fullName,
    phoneNumber: phoneCheck.e164,
    password: rawPassword,
    preferredLanguage: preferredLanguage || 'kn',
    state: state || 'Karnataka',
    district: district || '',
    taluk: taluk || '',
    category: category || 'General',
    dob: dob && String(dob).trim() ? String(dob).trim() : undefined,
    gender: gender && String(gender).trim() ? String(gender).trim() : undefined,
    age: age !== undefined ? Number(age) : undefined,
    landHolding: landHolding || '2.0',
    landType: landType || 'Marginal (< 2.5 Acres)',
    cropType: cropType || 'Ragi & Cereals',
    irrigationType: irrigationType || 'Borewell & Rainfed',
    annualIncome: annualIncome || 'Below 1 Lakh',
    fruitsId: fruitsId && String(fruitsId).trim() ? String(fruitsId).trim() : undefined
  });

  const { otpCode, record, expiresInSeconds } = dbStore.issueOtp(
    pendingUser.phoneNumber,
    'REGISTRATION'
  );
  const smsResult = await sendOtpSms({
    phoneNumber: pendingUser.phoneNumber,
    otpCode,
    purpose: 'REGISTRATION'
  });

  if (!smsResult.sent && smsResult.configured) {
    if (process.env.NODE_ENV === 'production') {
      dbStore.rollbackLatestOtp(record.id);
      return res.status(502).json({
        error: smsResult.message || 'SMS gateway failed to send OTP. Please try again shortly.',
        smsDelivered: false,
        smsConfigured: true,
        smsProvider: smsResult.provider
      });
    } else {
      console.warn(`[SMS Gateway Notice] ${smsResult.message}. Falling back to dev OTP.`);
    }
  }

  return res.status(201).json({
    success: true,
    otpRequired: true,
    phoneNumber: pendingUser.phoneNumber,
    phoneNumberMasked: maskPhoneNumber(pendingUser.phoneNumber),
    purpose: 'REGISTRATION' as OtpPurpose,
    expiresInSeconds,
    resendCooldownSeconds: 60,
    smsDelivered: smsResult.sent,
    smsConfigured: smsResult.configured,
    smsProvider: smsResult.provider,
    devOtp: !smsResult.sent ? otpCode : undefined,
    message: smsResult.sent
      ? `A 6-digit verification OTP has been sent via SMS to ${maskPhoneNumber(pendingUser.phoneNumber)}.`
      : `Test OTP: ${otpCode} (or 123456). SMS provider credentials unconfigured in .env.`
  });
});

/**
 * Send or Resend OTP (supports REGISTRATION, LOGIN_VERIFICATION, PASSWORD_RESET)
 */
async function handleOtpDispatch(req: express.Request, res: express.Response) {
  const { phoneNumber, purpose = 'REGISTRATION' } = req.body;
  const phoneCheck = normalizeIndianPhone(phoneNumber);

  if (!phoneCheck.valid || !phoneCheck.e164) {
    return res.status(400).json({ error: phoneCheck.errorEn || 'Invalid Indian mobile number.' });
  }

  const validPurposes: OtpPurpose[] = ['REGISTRATION', 'LOGIN_VERIFICATION', 'PASSWORD_RESET'];
  if (!validPurposes.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid OTP purpose.' });
  }

  const rateCheck = dbStore.checkOtpRateLimits(phoneCheck.e164, purpose);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: rateCheck.reason,
      retryAfterSeconds: rateCheck.retryAfterSeconds
    });
  }

  const existingUser = dbStore.findUserByPhone(phoneCheck.e164);

  // If logging in, the mobile number MUST be registered and verified in the database
  if (purpose === 'LOGIN_VERIFICATION' && (!existingUser || !existingUser.phoneVerified)) {
    return res.status(404).json({
      error: 'No account found with this mobile number. Please create an account first.',
      errorKn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಯಾವುದೇ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಹೊಸ ಖಾತೆ ರಚಿಸಿ.',
      code: 'USER_NOT_FOUND',
      exists: false
    });
  }

  // If registering, notify if already active
  if (purpose === 'REGISTRATION' && existingUser && existingUser.phoneVerified) {
    return res.status(409).json({
      error: 'An account with this mobile number is already registered. Please login instead.',
      errorKn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಲ್ಲಿ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.',
      code: 'USER_ALREADY_EXISTS',
      exists: true
    });
  }

  // Prevent account enumeration during PASSWORD_RESET
  if (purpose === 'PASSWORD_RESET' && (!existingUser || !existingUser.phoneVerified)) {
    const providerInfo = getConfiguredSmsProvider();
    return res.json({
      success: true,
      otpRequired: true,
      phoneNumber: phoneCheck.e164,
      phoneNumberMasked: maskPhoneNumber(phoneCheck.e164),
      purpose,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
      smsDelivered: providerInfo.configured,
      smsConfigured: providerInfo.configured,
      smsProvider: providerInfo.provider,
      message: providerInfo.configured
        ? `If an account exists for ${maskPhoneNumber(phoneCheck.e164)}, an OTP has been sent.`
        : `SMS provider (${providerInfo.provider.toUpperCase()}) is unconfigured in .env.`
    });
  }

  const { otpCode, record, expiresInSeconds } = dbStore.issueOtp(phoneCheck.e164, purpose);
  const smsResult = await sendOtpSms({
    phoneNumber: phoneCheck.e164,
    otpCode,
    purpose
  });

  if (!smsResult.sent && smsResult.configured) {
    if (process.env.NODE_ENV === 'production') {
      dbStore.rollbackLatestOtp(record.id);
      return res.status(502).json({
        error: smsResult.message,
        smsDelivered: false,
        smsConfigured: true,
        smsProvider: smsResult.provider
      });
    } else {
      console.warn(`[SMS Gateway Notice] ${smsResult.message}. Falling back to dev OTP.`);
    }
  }

  return res.json({
    success: true,
    otpRequired: true,
    phoneNumber: phoneCheck.e164,
    phoneNumberMasked: maskPhoneNumber(phoneCheck.e164),
    purpose,
    expiresInSeconds,
    resendCooldownSeconds: 60,
    smsDelivered: smsResult.sent,
    smsConfigured: smsResult.configured,
    smsProvider: smsResult.provider,
    devOtp: !smsResult.sent ? otpCode : undefined,
    message: smsResult.sent
      ? `OTP sent to ${maskPhoneNumber(phoneCheck.e164)}. Valid for 5 minutes.`
      : `Test OTP: ${otpCode} (or 123456). SMS provider credentials unconfigured in .env.`
  });
}

app.post('/api/auth/send-otp', handleOtpDispatch);
app.post('/api/auth/resend-otp', handleOtpDispatch);

/**
 * Check if a user exists with the given mobile number
 */
app.post('/api/auth/check-user', (req, res) => {
  const { phoneNumber } = req.body;
  const phoneCheck = normalizeIndianPhone(phoneNumber);
  if (!phoneCheck.valid || !phoneCheck.e164) {
    return res.status(400).json({ error: phoneCheck.errorEn || 'Invalid Indian mobile number.' });
  }
  const existingUser = dbStore.findUserByPhone(phoneCheck.e164);
  const exists = !!(existingUser && existingUser.phoneVerified);
  return res.json({
    exists,
    phoneNumber: phoneCheck.e164,
    maskedPhone: maskPhoneNumber(phoneCheck.e164),
    fullName: exists && existingUser ? existingUser.fullName : undefined
  });
});

/**
 * Verify 6-digit SMS OTP & activate verified user account (issuing JWT)
 */
app.post('/api/auth/verify-otp', (req, res) => {
  const { phoneNumber, otpCode, otp, purpose = 'REGISTRATION' } = req.body;
  const code = String(otpCode ?? otp ?? '').trim();

  const phoneCheck = normalizeIndianPhone(phoneNumber);
  if (!phoneCheck.valid || !phoneCheck.e164) {
    return res.status(400).json({ error: phoneCheck.errorEn || 'Invalid mobile number.' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Enter a valid 6-digit numeric OTP.' });
  }

  // Strictly enforce account existence for LOGIN_VERIFICATION before any verification
  if (purpose === 'LOGIN_VERIFICATION') {
    const existing = dbStore.findUserByPhone(phoneCheck.e164);
    if (!existing || !existing.phoneVerified) {
      return res.status(404).json({
        error: 'No account found with this mobile number. Please create an account first.',
        errorKn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಯಾವುದೇ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಹೊಸ ಖಾತೆ ರಚಿಸಿ.',
        code: 'USER_NOT_FOUND',
        exists: false
      });
    }
  }

  const result = dbStore.verifyOtp({
    phoneNumber: phoneCheck.e164,
    otpCode: code,
    purpose
  });

  if (!result.success) {
    const status = result.code === 'TOO_MANY_ATTEMPTS' ? 429 : 400;
    return res.status(status).json({ error: result.message, code: result.code });
  }

  const user = result.user || dbStore.findUserByPhone(phoneCheck.e164);
  if (!user) {
    if (purpose === 'LOGIN_VERIFICATION') {
      return res.status(404).json({
        error: 'No account found with this mobile number. Please create an account first.',
        errorKn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ ಯಾವುದೇ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಹೊಸ ಖಾತೆ ರಚಿಸಿ.',
        code: 'USER_NOT_FOUND',
        exists: false
      });
    }
    return res.status(400).json({
      error: 'No account record found for this mobile number. Please complete registration first.',
      errorKn: 'ಖಾತೆ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ.',
      code: 'USER_NOT_FOUND'
    });
  }

  if (purpose === 'LOGIN_VERIFICATION' && !user.phoneVerified) {
    return res.status(403).json({
      error: 'Phone number is not verified. Please complete registration first.',
      errorKn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ.',
      code: 'UNVERIFIED_PHONE'
    });
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    phoneNumber: user.phoneNumber
  });

  return res.json({
    success: true,
    message: result.message,
    token,
    user: dbStore.sanitizeUser(user)
  });
});

/**
 * Login with Username OR Indian Phone Number + Password
 */
app.post('/api/auth/login', async (req, res) => {
  const identifierRaw = req.body.identifier || req.body.username || req.body.phoneNumber;
  const { password } = req.body;

  if (!identifierRaw || !password) {
    return res.status(400).json({ error: 'Username or mobile number and password are required.' });
  }

  const user = dbStore.findUserByIdentifier(String(identifierRaw));
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your details and try again.' });
  }

  if (!user.phoneVerified || user.accountStatus !== 'ACTIVE') {
    return res.status(403).json({
      error: 'Phone number not yet verified. Please complete OTP verification first.',
      otpRequired: true,
      phoneNumber: user.phoneNumber,
      phoneNumberMasked: maskPhoneNumber(user.phoneNumber)
    });
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    phoneNumber: user.phoneNumber
  });

  // Evaluate reminders on login cleanly
  await processReminderNotificationsAndOptionalSms(user.id);

  return res.json({
    token,
    user: dbStore.sanitizeUser(user)
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokedTokens.add(authHeader.split(' ')[1]);
  }
  return res.json({ success: true, message: 'Signed out successfully.' });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  req.body.purpose = 'PASSWORD_RESET';
  return handleOtpDispatch(req, res);
});

app.post('/api/auth/reset-password', (req, res) => {
  const { phoneNumber, otpCode, otp, newPassword, confirmPassword } = req.body;
  const code = String(otpCode ?? otp ?? '').trim();

  const phoneCheck = normalizeIndianPhone(phoneNumber);
  if (!phoneCheck.valid || !phoneCheck.e164) {
    return res.status(400).json({ error: phoneCheck.errorEn || 'Invalid mobile number.' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Enter a valid 6-digit numeric OTP.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const otpRes = dbStore.verifyOtp({
    phoneNumber: phoneCheck.e164,
    otpCode: code,
    purpose: 'PASSWORD_RESET'
  });

  if (!otpRes.success) {
    return res.status(otpRes.code === 'TOO_MANY_ATTEMPTS' ? 429 : 400).json({ error: otpRes.message });
  }

  const updated = dbStore.updatePasswordForPhone(phoneCheck.e164, newPassword);
  if (!updated) {
    return res.status(404).json({ error: 'No matching verified account found.' });
  }

  return res.json({
    success: true,
    message: 'Password reset successfully. You can now sign in with your new password.'
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json(dbStore.sanitizeUser(user));
});

app.put('/api/auth/profile', authenticate, (req, res) => {
  const user = (req as any).user;
  const {
    fullName,
    preferredLanguage,
    state,
    district,
    taluk,
    category,
    dob,
    gender,
    age,
    landHolding,
    landType,
    cropType,
    irrigationType,
    annualIncome,
    fruitsId,
    timezone,
    smsRemindersEnabled
  } = req.body;

  const updated = dbStore.updateUserProfile(user.id, {
    fullName,
    preferredLanguage,
    state,
    district,
    taluk,
    category,
    dob: dob !== undefined ? (dob && String(dob).trim() ? String(dob).trim() : '') : undefined,
    gender: gender !== undefined ? (gender && String(gender).trim() ? String(gender).trim() : '') : undefined,
    age: age !== undefined ? (age ? Number(age) : undefined) : undefined,
    landHolding,
    landType,
    cropType,
    irrigationType,
    annualIncome,
    fruitsId,
    timezone,
    smsRemindersEnabled
  });

  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(dbStore.sanitizeUser(updated));
});

// ==========================================
// SAVED SCHEMES + REMINDERS ENDPOINTS
// ==========================================

app.get('/api/saved-schemes', authenticate, (req, res) => {
  const user = (req as any).user;
  const saved = dbStore.getSavedSchemes(user.id);

  const enriched = saved.map((item) => {
    const scheme = findSchemeById(item.schemeId) || null;
    const effectiveDeadline = item.deadlineVerified
      ? item.applicationDeadline
      : item.customDeadline || null;
    const deadlineEval = evaluateDeadlineStatus(effectiveDeadline, user.timezone || 'Asia/Kolkata');

    return {
      ...item,
      deadlineStatus: deadlineEval,
      scheme
    };
  });

  res.json({
    savedSchemes: enriched,
    total: enriched.length
  });
});

app.post('/api/saved-schemes', authenticate, (req, res) => {
  const user = (req as any).user;
  const { schemeId, userNotes, notes, reminderEnabled, reminderDaysBefore, customDeadline } = req.body;

  if (!schemeId) {
    return res.status(400).json({ error: 'Scheme ID is required' });
  }

  const scheme = findSchemeById(schemeId);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme does not exist in verified catalog' });
  }

  const saved = dbStore.saveScheme(user.id, scheme.id, {
    userNotes: userNotes ?? notes,
    reminderEnabled,
    reminderDaysBefore,
    customDeadline
  });

  const effectiveDeadline = saved.deadlineVerified
    ? saved.applicationDeadline
    : saved.customDeadline || null;
  const deadlineEval = evaluateDeadlineStatus(effectiveDeadline, user.timezone || 'Asia/Kolkata');

  res.status(201).json({
    ...saved,
    deadlineStatus: deadlineEval,
    scheme
  });
});

app.patch('/api/saved-schemes/:schemeId/reminder', authenticate, async (req, res) => {
  const user = (req as any).user;
  const {
    reminderEnabled,
    reminderDaysBefore,
    customDeadline,
    userNotes,
    acknowledge,
    dismiss
  } = req.body;

  const targetScheme = findSchemeById(req.params.schemeId);
  const schemeLookupKey = targetScheme ? targetScheme.id : req.params.schemeId;

  const updated = dbStore.updateSavedSchemeReminder(user.id, schemeLookupKey, {
    reminderEnabled,
    reminderDaysBefore,
    customDeadline,
    userNotes,
    acknowledge,
    dismiss
  });

  if (!updated) {
    return res.status(404).json({ error: 'Saved scheme not found for current user.' });
  }

  await processReminderNotificationsAndOptionalSms(user.id);

  const scheme = findSchemeById(updated.schemeId) || null;
  const effectiveDeadline = updated.deadlineVerified
    ? updated.applicationDeadline
    : updated.customDeadline || null;
  const deadlineEval = evaluateDeadlineStatus(effectiveDeadline, user.timezone || 'Asia/Kolkata');

  res.json({
    ...updated,
    deadlineStatus: deadlineEval,
    scheme
  });
});

app.delete('/api/saved-schemes/:schemeId', authenticate, (req, res) => {
  const user = (req as any).user;
  const removed = dbStore.removeSavedScheme(user.id, req.params.schemeId);
  res.json({ success: removed, schemeId: req.params.schemeId });
});

// ==========================================
// UPCOMING DEADLINES & NOTIFICATIONS ENDPOINTS
// ==========================================

app.get('/api/reminders/upcoming', authenticate, async (req, res) => {
  const user = (req as any).user;
  await processReminderNotificationsAndOptionalSms(user.id);

  const saved = dbStore.getSavedSchemes(user.id);
  const timezone = user.timezone || 'Asia/Kolkata';

  const reminders = saved
    .map((item) => {
      const scheme = findSchemeById(item.schemeId) || null;
      const effectiveDeadline = item.deadlineVerified
        ? item.applicationDeadline
        : item.customDeadline || null;
      const deadlineStatus = evaluateDeadlineStatus(effectiveDeadline, timezone);

      return {
        ...item,
        effectiveDeadline,
        deadlineStatus,
        scheme
      };
    })
    .filter((item) => item.deadlineStatus.hasDeadline)
    .sort((a, b) => {
      const da = a.deadlineStatus.remainingDays ?? 9999;
      const db = b.deadlineStatus.remainingDays ?? 9999;
      return da - db;
    });

  res.json({
    timezone,
    reminders,
    total: reminders.length
  });
});

app.post('/api/reminders/:schemeId/acknowledge', authenticate, (req, res) => {
  const user = (req as any).user;
  const updated = dbStore.updateSavedSchemeReminder(user.id, req.params.schemeId, {
    acknowledge: true
  });
  if (!updated) return res.status(404).json({ error: 'Saved scheme not found' });
  res.json({ success: true, savedScheme: updated });
});

app.post('/api/reminders/:schemeId/dismiss', authenticate, (req, res) => {
  const user = (req as any).user;
  const dismiss = req.body?.dismiss !== false;
  const updated = dbStore.updateSavedSchemeReminder(user.id, req.params.schemeId, {
    dismiss
  });
  if (!updated) return res.status(404).json({ error: 'Saved scheme not found' });
  res.json({ success: true, savedScheme: updated });
});

app.get('/api/notifications', authenticate, async (req, res) => {
  const user = (req as any).user;
  await processReminderNotificationsAndOptionalSms(user.id);
  const notifications = dbStore.getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ notifications, unreadCount });
});

app.patch('/api/notifications/:id/read', authenticate, (req, res) => {
  const user = (req as any).user;
  const updated = dbStore.markNotificationRead(user.id, req.params.id);
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json({ success: true, notification: updated });
});

app.post('/api/notifications/read-all', authenticate, (req, res) => {
  const user = (req as any).user;
  const count = dbStore.markAllNotificationsRead(user.id);
  res.json({ success: true, markedCount: count });
});

// ==========================================
// MY APPLICATIONS TRACKING ENDPOINTS
// ==========================================

app.get('/api/applications', authenticate, (req, res) => {
  const user = (req as any).user;
  const applications = dbStore.getApplications(user.id);

  const enriched = applications.map((appItem) => {
    const scheme = findSchemeById(appItem.schemeId);
    return {
      ...appItem,
      scheme: scheme || null
    };
  });

  res.json({
    applications: enriched,
    total: enriched.length
  });
});

app.post('/api/applications', authenticate, (req, res) => {
  const user = (req as any).user;
  const {
    schemeId,
    status,
    notes,
    applicationDate,
    appliedThroughPortal,
    acknowledgementNumber,
    readinessSnapshot,
    eligibilitySnapshot
  } = req.body;

  if (!schemeId) {
    return res.status(400).json({ error: 'Scheme ID is required' });
  }

  const scheme = findSchemeById(schemeId);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme does not exist in verified catalog' });
  }

  const application = dbStore.createApplication({
    userId: user.id,
    schemeId: scheme.id,
    schemeNameSnapshot: scheme.nameEn,
    status,
    notes,
    applicationDate,
    appliedThroughPortal: appliedThroughPortal || scheme.officialPortalUrl,
    acknowledgementNumber,
    readinessSnapshot,
    eligibilitySnapshot
  });

  res.status(201).json({
    ...application,
    scheme
  });
});

app.get('/api/applications/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const application = dbStore.getApplicationById(req.params.id);

  if (!application || application.userId !== user.id) {
    return res.status(404).json({ error: 'Application record not found' });
  }

  const scheme = findSchemeById(application.schemeId);
  res.json({
    ...application,
    scheme: scheme || null
  });
});

app.patch('/api/applications/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const {
    status,
    notes,
    applicationDate,
    appliedThroughPortal,
    acknowledgementNumber,
    timelineNote,
    readinessSnapshot,
    eligibilitySnapshot
  } = req.body;

  const updated = dbStore.updateApplication(req.params.id, user.id, {
    status,
    notes,
    applicationDate,
    appliedThroughPortal,
    acknowledgementNumber,
    timelineNote,
    readinessSnapshot,
    eligibilitySnapshot
  });

  if (!updated) {
    return res.status(404).json({ error: 'Application record not found or unauthorized' });
  }

  const scheme = findSchemeById(updated.schemeId);
  res.json({
    ...updated,
    scheme: scheme || null
  });
});

app.delete('/api/applications/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const deleted = dbStore.deleteApplication(req.params.id, user.id);
  res.json({ success: deleted, id: req.params.id });
});

// ==========================================
// VOICE & SPEECH (MURF AI TTS & DEEPGRAM STT) ENDPOINTS
// ==========================================

app.get('/api/voice/status', (req, res) => {
  const config = getMurfDefaultConfig();
  res.json({
    murfConfigured: isMurfConfigured(),
    deepgramConfigured: isDeepgramConfigured(),
    defaultVoiceId: config.voiceId,
    femaleVoiceId: config.femaleVoiceId,
    maleVoiceId: config.maleVoiceId,
    defaultLocale: config.locale,
    defaultStyle: config.style,
    defaultModel: config.model,
    defaultPitch: config.pitch,
    defaultRate: config.rate,
    kannadaVoices: {
      male: {
        voice_id: 'Harman',
        style: 'Conversation',
        model: 'Falcon 2.1',
        locale: 'kn-IN'
      },
      female: {
        voice_id: 'Pooja',
        style: 'Conversation',
        model: 'Falcon 2.1',
        locale: 'kn-IN'
      }
    }
  });
});

app.post('/api/voice/tts', async (req, res) => {
  const { text, voiceId, voice_id, gender, style, pitch, rate, locale, model, modelVersion, format } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Text to synthesize is required' });
  }

  const result = await generateMurfSpeech({
    text: String(text).trim(),
    voiceId: voiceId || voice_id,
    gender,
    style,
    model: model || modelVersion,
    pitch: pitch !== undefined ? Number(pitch) : undefined,
    rate: rate !== undefined ? Number(rate) : undefined,
    locale,
    format
  });

  const status = !result.configured ? 503 : (!result.success ? 502 : 200);
  return res.status(status).json(result);
});

app.post('/api/voice/murf/generate', async (req, res) => {
  const result = await generateMurfSpeech(req.body);
  const status = !result.configured ? 503 : (!result.success ? 502 : 200);
  return res.status(status).json(result);
});

app.get('/api/voice/murf/voices', async (req, res) => {
  const localeFilter = req.query.locale as string | undefined;
  const result = await getMurfAvailableVoices(localeFilter);
  const status = !result.configured ? 503 : (!result.success ? 502 : 200);
  return res.status(status).json(result);
});

app.post('/api/voice/stt', async (req, res) => {
  const { audioBase64, audioUrl, mimeType, language, model } = req.body;
  if (!audioBase64 && !audioUrl) {
    return res.status(400).json({ error: 'Audio data (audioBase64 or audioUrl) is required for transcription' });
  }

  let audioBuffer: Buffer | undefined;
  if (audioBase64) {
    const base64Data = String(audioBase64).replace(/^data:[^;]+;base64,/, '');
    audioBuffer = Buffer.from(base64Data, 'base64');
  }

  const result = await transcribeAudio({
    audioBuffer,
    audioUrl,
    mimeType: mimeType || 'audio/webm',
    language,
    model
  });

  const status = !result.configured ? 503 : (!result.success ? 502 : 200);
  return res.status(status).json(result);
});

// ==========================================
// SCHEME CATALOG & ELIGIBILITY ENGINE ENDPOINTS
// ==========================================

app.get('/api/health', (req, res) => {
  const smsConfig = getConfiguredSmsProvider();
  res.json({
    status: 'UP',
    service: 'kisan-scheme-saathi-api',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    rulesEngine: 'authoritative-deterministic',
    smsProvider: smsConfig.provider,
    smsConfigured: smsConfig.configured,
    ttsProvider: isMurfConfigured() ? 'murf' : 'browser-speech-synthesis',
    murfConfigured: isMurfConfigured(),
    sttProvider: isDeepgramConfigured() ? 'deepgram' : 'browser-speech-recognition',
    deepgramConfigured: isDeepgramConfigured(),
    state: 'Karnataka'
  });
});

app.get('/api/schemes', (req, res) => {
  const categoryFilter = req.query.category as string;
  let schemes = VERIFIED_SCHEMES;

  if (categoryFilter) {
    schemes = schemes.filter((s) => s.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({
    schemes,
    total: schemes.length,
    version: '2026.5-KAR',
    lastVerifiedDate: '2026-11-10'
  });
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = findSchemeById(req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found', schemeId: req.params.id });
  }
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({
    ...scheme,
    scheme
  });
});

app.post('/api/eligibility/evaluate', (req, res) => {
  const profile: Partial<FarmerProfile> = req.body;

  if (!profile || typeof profile !== 'object') {
    return res.status(400).json({ error: 'Invalid profile payload provided' });
  }

  if (!profile.state) {
    profile.state = 'Karnataka';
  }

  const results = RulesEngine.evaluateAllSchemes(VERIFIED_SCHEMES, profile);

  res.json({
    timestamp: new Date().toISOString(),
    evaluatedCount: results.length,
    profileSummary: {
      state: profile.state,
      district: profile.district || 'Unspecified',
      category: profile.farmerCategory || 'small_marginal',
      landAcres: profile.landHoldingAcres ?? 0
    },
    results
  });
});

app.get('/api/schemes/:id/checklist', (req, res) => {
  const scheme = findSchemeById(req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found' });
  }
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({
    schemeId: scheme.id,
    schemeNameEn: scheme.nameEn,
    schemeNameKn: scheme.nameKn,
    prerequisites: scheme.prerequisites,
    checklist: scheme.prerequisites
  });
});

app.get('/api/schemes/:id/application-guide', (req, res) => {
  const scheme = findSchemeById(req.params.id);
  if (!scheme) {
    return res.status(404).json({ error: 'Scheme not found' });
  }
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({
    schemeId: scheme.id,
    schemeNameEn: scheme.nameEn,
    schemeNameKn: scheme.nameKn,
    officialPortalUrl: scheme.officialPortalUrl,
    informationUrl: scheme.informationUrl,
    helplinePhone: scheme.helplinePhone,
    stepsEn: scheme.applicationStepsEn,
    stepsKn: scheme.applicationStepsKn,
    guide: scheme.applicationStepsEn,
    assistanceCentresEn: scheme.assistanceCentresEn,
    assistanceCentresKn: scheme.assistanceCentresKn,
    lastVerifiedDate: scheme.lastVerifiedDate,
    applicationDeadline: scheme.applicationDeadline ?? null,
    deadlineVerified: Boolean(scheme.deadlineVerified)
  });
});

app.post('/api/assistant/explain', async (req, res) => {
  const { schemeId, result, userQuestion, language } = req.body;

  if (!result || !schemeId) {
    return res.status(400).json({ error: 'Missing evaluation result context' });
  }

  const scheme = findSchemeById(schemeId);
  const lang = language === 'kn' ? 'Kannada' : 'English';

  if (!aiClient) {
    const fallback =
      language === 'kn'
        ? `ಯೋಜನೆ: ${result.schemeNameKn}\nಅರ್ಹತಾ ಫಲಿತಾಂಶ: ${result.statusLabelKn}\n\nವಿವರಣೆ: ${result.summaryExplanationKn}\nಮುಂದಿನ ಕ್ರಮ: ${result.nextActionKn}\nಅಧಿಕೃತ ಪೋರ್ಟಲ್: ${result.officialPortalUrl}\n\n(ಗಮನಿಸಿ: ಅಂತಿಮ ಅರ್ಹತೆ ಮತ್ತು ಸೌಲಭ್ಯದ ಅನುಮೋದನೆಯನ್ನು ಸಂಬಂಧಪಟ್ಟ ಸರ್ಕಾರಿ ಪ್ರಾಧಿಕಾರವೇ ನಿರ್ಧರಿಸುತ್ತದೆ.)`
        : `Scheme: ${result.schemeName}\nEligibility Status: ${result.statusLabelEn}\n\nExplanation: ${result.summaryExplanationEn}\nNext Step: ${result.nextActionEn}\nOfficial Portal: ${result.officialPortalUrl}\n\n(Note: Final eligibility and benefit approval are determined exclusively by the authorized government agency.)`;
    return res.json({ explanation: fallback, source: 'deterministic-rules' });
  }

  try {
    const prompt = `You are "Kisan Scheme Saathi Assistant", a helpful, empathetic agricultural advisor for Karnataka, India.
Explain the following verified scheme eligibility evaluation to the farmer in clear, polite ${lang}.

STRICT RULES:
1. Do NOT determine eligibility or change the status. The authoritative status is already determined as: "${result.status}".
2. Do NOT invent new scheme criteria, documents, or links. Use only the provided context.
3. Explicitly explain satisfied conditions, failed conditions (if any), and unknown verification requirements.
4. Conclude with this mandatory disclaimer: "Final eligibility and benefit approval are determined by the responsible government authority."
5. Language: Answer fluently and naturally in ${lang}.

CONTEXT:
Scheme: ${result.schemeName} (${scheme?.nameKn || ''})
Category: ${result.category}
Status: ${result.status}
Benefits: ${result.benefitsEn}
Official Portal: ${result.officialPortalUrl}
Department: ${result.officialSource}
Satisfied Conditions: ${JSON.stringify(result.satisfiedConditions.map((c: any) => c.condition.titleEn))}
Failed Conditions: ${JSON.stringify(result.failedConditions.map((c: any) => c.condition.titleEn))}
Unknown Conditions: ${JSON.stringify(result.unknownConditions.map((c: any) => c.condition.titleEn))}
Next Action: ${result.nextActionEn}

Farmer's specific question: "${userQuestion || 'Can you explain why I received this result and what I need to do next?'}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    res.json({ explanation: text, source: 'grounded-gemini' });
  } catch (err: any) {
    console.error('Gemini explanation error:', err);
    const fallback =
      language === 'kn'
        ? `${result.schemeNameKn} ಯೋಜನೆಗೆ ನಿಮ್ಮ ಸ್ಥಿತಿ: ${result.statusLabelKn}.\n${result.summaryExplanationKn}\nಮುಂದಿನ ಕ್ರಮ: ${result.nextActionKn}\n(ಅಂತಿಮ ಅನುಮೋದನೆ ಸರ್ಕಾರಿ ಪ್ರಾಧಿಕಾರದಿಂದ ಮಾತ್ರ)`
        : `Status: ${result.statusLabelEn} for ${result.schemeName}.\n${result.summaryExplanationEn}\nNext Action: ${result.nextActionEn}\n(Final approval determined by government authority)`;
    res.json({ explanation: fallback, source: 'deterministic-fallback' });
  }
});

// ==========================================
// CONVERSATIONAL AI ELIGIBILITY CHAT ENDPOINT
// ==========================================

function isUnknownOrEvasiveInput(text: string): boolean {
  if (!text) return true;
  const t = text.trim().toLowerCase();
  return (
    /^(i\s+)?(don'?t|do\s+not)\s+know/i.test(t) ||
    /^(idk|dontknow|no\s+idea|not\s+sure|unsure|cannot\s+say|dunno|no\s+clue)$/i.test(t) ||
    /^(gott?h?illa|nanage\s+gott?h?illa|tilidilla|gothilla)$/i.test(t) ||
    /^(none|nothing|no|illa|nahi|na|nil|null|nan)$/i.test(t) ||
    /^(test|fake|asdf|qwerty|xyz|abc|aaa|123|1234|foo|bar|dummy|unknown)$/i.test(t)
  );
}

const CHAT_FLOW_CONFIG: Record<string, {
  next: string | null;
  en: { question: string; options?: Array<{ label: string; value: any }> };
  kn: { question: string; options?: Array<{ label: string; value: any }> };
}> = {
  name: {
    next: 'age',
    en: { question: "Namaskara! I am your Kisan Saathi AI assistant. What is your full name?" },
    kn: { question: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕಿಸಾನ್ ಸಾಥಿ ಎಐ ಸಹಾಯಕ. ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರೇನು?" }
  },
  age: {
    next: 'gender',
    en: {
      question: "Nice to meet you! How old are you?",
      options: [
        { label: "25-35 yrs", value: "30" },
        { label: "36-50 yrs", value: "45" },
        { label: "50+ yrs", value: "55" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಲು ಸಂತೋಷವಾಗಿದೆ! ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
      options: [
        { label: "25-35 ವರ್ಷ", value: "30" },
        { label: "36-50 ವರ್ಷ", value: "45" },
        { label: "50+ ವರ್ಷ", value: "55" }
      ]
    }
  },
  gender: {
    next: 'category',
    en: {
      question: "What is your gender?",
      options: [
        { label: "Male (ಪುರುಷ)", value: "Male" },
        { label: "Female (ಮಹಿಳೆ)", value: "Female" },
        { label: "Other (ಇತರ)", value: "Other" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಲಿಂಗ ಯಾವುದು?",
      options: [
        { label: "ಪುರುಷ", value: "Male" },
        { label: "ಮಹಿಳೆ", value: "Female" },
        { label: "ಇತರ", value: "Other" }
      ]
    }
  },
  category: {
    next: 'district',
    en: {
      question: "Which social category do you belong to? (Helps determine reservation-specific subsidies like Ganga Kalyana & PMKSY)",
      options: [
        { label: "General", value: "General" },
        { label: "OBC", value: "OBC" },
        { label: "SC (Scheduled Caste)", value: "SC" },
        { label: "ST (Scheduled Tribe)", value: "ST" }
      ]
    },
    kn: {
      question: "ನೀವು ಯಾವ ಸಾಮಾಜಿಕ ವರ್ಗಕ್ಕೆ ಸೇರಿದವರು? (ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಇತರ ಸಬ್ಸಿಡಿಗಳಿಗೆ ಇದು ಮುಖ್ಯ)",
      options: [
        { label: "ಸಾಮಾನ್ಯ", value: "General" },
        { label: "ಹಿಂದುಳಿದ ವರ್ಗ (OBC)", value: "OBC" },
        { label: "ಪರಿಶಿಷ್ಟ ಜಾತಿ (SC)", value: "SC" },
        { label: "ಪರಿಶಿಷ್ಟ ಪಂಗಡ (ST)", value: "ST" }
      ]
    }
  },
  district: {
    next: 'landHolding',
    en: {
      question: "Which district in Karnataka is your agricultural land located in?",
      options: [
        { label: "Dharwad", value: "Dharwad" },
        { label: "Mandya", value: "Mandya" },
        { label: "Belagavi", value: "Belagavi" },
        { label: "Mysuru", value: "Mysuru" }
      ]
    },
    kn: {
      question: "ಕರ್ನಾಟಕದಲ್ಲಿ ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿ ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿದೆ?",
      options: [
        { label: "ಧಾರವಾಡ", value: "Dharwad" },
        { label: "ಮಂಡ್ಯ", value: "Mandya" },
        { label: "ಬೆಳಗಾವಿ", value: "Belagavi" },
        { label: "ಮೈಸೂರು", value: "Mysuru" }
      ]
    }
  },
  landHolding: {
    next: 'cropType',
    en: {
      question: "How many acres of agricultural land do you own?",
      options: [
        { label: "Up to 2.5 acres (Marginal)", value: "1.5" },
        { label: "2.5 to 5.0 acres (Small)", value: "3.5" },
        { label: "5.0 to 10 acres (Semi-Medium)", value: "7.0" },
        { label: "10+ acres (Medium/Large)", value: "12.0" }
      ]
    },
    kn: {
      question: "ನೀವು ಎಷ್ಟು ಎಕರೆ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಹೊಂದಿದ್ದೀರಿ?",
      options: [
        { label: "2.5 ಎಕರೆವರೆಗೆ (ಅತಿ ಸಣ್ಣ)", value: "1.5" },
        { label: "2.5 ರಿಂದ 5.0 ಎಕರೆ (ಸಣ್ಣ)", value: "3.5" },
        { label: "5.0 ರಿಂದ 10 ಎಕರೆ (ಮಧ್ಯಮ)", value: "7.0" },
        { label: "10+ ಎಕರೆ (ದೊಡ್ಡ)", value: "12.0" }
      ]
    }
  },
  cropType: {
    next: 'irrigation',
    en: {
      question: "What main crops do you cultivate?",
      options: [
        { label: "Paddy (ಭತ್ತ)", value: "Paddy" },
        { label: "Ragi (ರಾಗಿ)", value: "Ragi" },
        { label: "Sugarcane (ಕಬ್ಬು)", value: "Sugarcane" },
        { label: "Cotton (ಹತ್ತಿ)", value: "Cotton" }
      ]
    },
    kn: {
      question: "ನೀವು ಮುಖ್ಯವಾಗಿ ಯಾವ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯುತ್ತೀರಿ?",
      options: [
        { label: "ಭತ್ತ", value: "Paddy" },
        { label: "ರಾಗಿ", value: "Ragi" },
        { label: "ಕಬ್ಬು", value: "Sugarcane" },
        { label: "ಹತ್ತಿ", value: "Cotton" }
      ]
    }
  },
  irrigation: {
    next: 'fruitsId',
    en: {
      question: "What is your primary irrigation source?",
      options: [
        { label: "Rainfed (ಮಳೆ ಆಶ್ರಿತ)", value: "Rainfed" },
        { label: "Borewell / Open Well", value: "Borewell" },
        { label: "Canal / River", value: "Canal" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಮುಖ್ಯ ನೀರಾವರಿ ಮೂಲ ಯಾವುದು?",
      options: [
        { label: "ಮಳೆ ಆಶ್ರಿತ", value: "Rainfed" },
        { label: "ಬೋರ್‌ವೆಲ್ / ತೆರೆದ ಬಾವಿ", value: "Borewell" },
        { label: "ಕಾಲುವೆ / ನದಿ", value: "Canal" }
      ]
    }
  },
  fruitsId: {
    next: 'aadhaar',
    en: {
      question: "Do you have a Karnataka FRUITS (Farmer Registration & Unified Beneficiary Information System) ID?",
      options: [
        { label: "Yes, I have FRUITS ID", value: "true" },
        { label: "No / Not yet registered", value: "false" }
      ]
    },
    kn: {
      question: "ನೀವು ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಫ್ರೂಟ್ಸ್ (FRUITS ID) ಹೊಂದಿದ್ದೀರಾ?",
      options: [
        { label: "ಹೌದು, FRUITS ID ಇದೆ", value: "true" },
        { label: "ಇಲ್ಲ / ಇನ್ನೂ ನೋಂದಾಯಿಸಿಲ್ಲ", value: "false" }
      ]
    }
  },
  aadhaar: {
    next: 'confirm',
    en: {
      question: "Is your bank account linked and NPCI seeded with your Aadhaar for Direct Benefit Transfer (DBT)?",
      options: [
        { label: "Yes, Bank Aadhaar Linked", value: "true" },
        { label: "Not sure / Not Linked", value: "false" }
      ]
    },
    kn: {
      question: "ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಆಧಾರ್ ಲಿಂಕ್ ಮತ್ತು ಡಿಬಿಟಿ (DBT) ಸೀಡಿಂಗ್ ಆಗಿದೆಯೇ?",
      options: [
        { label: "ಹೌದು, ಲಿಂಕ್ ಆಗಿದೆ", value: "true" },
        { label: "ಖಚಿತವಿಲ್ಲ / ಆಗಿಲ್ಲ", value: "false" }
      ]
    }
  },
  confirm: {
    next: null,
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
  }
};

function formatProfileSummary(profile: any, isKn: boolean): string {
  const name = profile.fullName || (isKn ? 'ರೈತರು' : 'Farmer');
  const age = profile.age ? `${profile.age} ${isKn ? 'ವರ್ಷ' : 'Yrs'}` : (isKn ? 'ತಿಳಿಸಿಲ್ಲ' : 'Not specified');
  const gender = profile.gender || (isKn ? 'ಪುರುಷ' : 'Male');
  const category = profile.category || (isKn ? 'ಸಾಮಾನ್ಯ' : 'General');
  const district = profile.district ? `${profile.district}, ಕರ್ನಾಟಕ` : (isKn ? 'ಕರ್ನಾಟಕ' : 'Karnataka');
  const land = profile.landHolding ? `${profile.landHolding} ${isKn ? 'ಎಕರೆ' : 'Acres'}` : (isKn ? '2.5 ಎಕರೆ' : '2.5 Acres');
  const crop = profile.cropType || (isKn ? 'ಭತ್ತ' : 'Paddy');
  const irrigation = profile.irrigationType || (isKn ? 'ಮಳೆ ಆಶ್ರಿತ' : 'Rainfed');
  const fruits = profile.hasFruitsId || profile.fruitsRegistered
    ? (isKn ? 'ಹೌದು (FRUITS ID ಇದೆ)' : 'Registered (FRUITS active)')
    : (isKn ? 'ಇಲ್ಲ / ಬಾಕಿ' : 'Not registered');
  const aadhaar = profile.hasAadhaarBankLinked || profile.aadhaarLinked
    ? (isKn ? 'ಹೌದು (DBT ಲಿಂಕ್ ಆಗಿದೆ)' : 'Linked (DBT active)')
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

function buildFarmerEvaluationResponse(updatedProfile: any, isKn: boolean) {
  const farmerProfile: Partial<FarmerProfile> = {
    state: 'Karnataka',
    district: updatedProfile.district || 'Dharwad',
    farmerCategory: (updatedProfile.landHoldingAcres || parseFloat(updatedProfile.landHolding) || 2.5) <= 5 ? 'small_marginal' : 'large',
    socialCategory:
      updatedProfile.category === 'SC'
        ? 'SC'
        : updatedProfile.category === 'ST'
        ? 'ST'
        : updatedProfile.category === 'OBC'
        ? 'OBC'
        : 'GEN',
    landHoldingAcres: updatedProfile.landHoldingAcres || parseFloat(updatedProfile.landHolding) || 2.5,
    hasLandOwnership: updatedProfile.hasLandOwnership ?? true,
    age: typeof updatedProfile.age === 'number' ? updatedProfile.age : (parseInt(updatedProfile.age, 10) || 35),
    cropsGrown: updatedProfile.cropsGrown || [updatedProfile.cropType || 'Paddy'],
    hasWaterSource: updatedProfile.hasWaterSource ?? true,
    hasExistingBorewell: updatedProfile.hasExistingBorewell ?? false,
    hasFruitsId: updatedProfile.hasFruitsId ?? true,
    hasRtcOrPahani: true,
    hasAadhaarBankLinked: updatedProfile.hasAadhaarBankLinked ?? true,
    isCooperativeMember: true,
    hasChildrenInHigherEducation: false,
    notifiedCropInHobli: true,
    hasCasteIncomeCertificate: true,
    hasSowingCertificate: true,
    isInstitutionalLandholder: false,
    isConstitutionalPostHolder: false,
    isGovernmentEmployee: false,
    isIncomeTaxPayee: false,
    isEnrolledInEsiOrCghs: false
  };

  const evaluationResults = RulesEngine.evaluateAllSchemes(VERIFIED_SCHEMES, farmerProfile);
  const eligibleCount = evaluationResults.filter((r) => r.status === 'ELIGIBLE' || r.status === 'LIKELY_ELIGIBLE').length;

  const completionReply = isKn
    ? `ಧನ್ಯವಾದಗಳು ${updatedProfile.fullName || 'ರೈತ ಬಾಂಧವರೇ'}! ನಿಮ್ಮ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ. ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕಂತೆ ${eligibleCount} ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ.`
    : `Thank you ${updatedProfile.fullName || 'Farmer'}! Your details have been evaluated. Based on your verified profile, you qualify for ${eligibleCount} verified government schemes.`;

  return {
    reply: completionReply,
    nextStep: null,
    isComplete: true,
    updatedProfile,
    evaluatedSchemes: evaluationResults
  };
}

app.post('/api/eligibility-chat', async (req, res) => {
  try {
    const { message, step = 'name', language = 'en', collectedProfile = {} } = req.body;
    const isKn = language === 'kn';
    const langKey = isKn ? 'kn' : 'en';

    const updatedProfile = { ...collectedProfile };
    const rawInput = (message || '').trim();

    // Direct "Evaluate Now" trigger (from quick button, chip, or speech command)
    const isEvaluateCommand =
      rawInput === 'EVALUATE_NOW' ||
      /^(evaluate|check\s+schemes?|show\s+schemes?|evaluate\s+now|check\s+eligibility|results?|ಪರಿಶೀಲಿಸಿ|ಯೋಜನೆಗಳನ್ನು\s+ತೋರಿಸಿ|ಈಗಲೇ\s+ಪರಿಶೀಲಿಸಿ)$/i.test(rawInput);

    if (isEvaluateCommand) {
      return res.json(buildFarmerEvaluationResponse(updatedProfile, isKn));
    }

    // Handle Confirmation Step
    if (step === 'confirm') {
      const lower = rawInput.toLowerCase();
      const isConfirmed =
        rawInput === 'CONFIRM_YES' ||
        /^(yes|correct|right|true|accurate|ha|haa|sari|houdu|ಹೌದು|ಸರಿ|ಖಚಿತ|ok|okay)$/i.test(lower);

      const isDeclined =
        rawInput === 'CONFIRM_NO' ||
        /^(no|nope|wrong|change|modify|edit|tappu|illa|ಇಲ್ಲ|ತಪ್ಪು|ಬದಲಾವಣೆ)$/i.test(lower);

      if (isConfirmed) {
        return res.json(buildFarmerEvaluationResponse(updatedProfile, isKn));
      } else if (isDeclined) {
        // Offer specific fields to change
        const editPrompt = isKn
          ? "ಯಾವ ಮಾಹಿತಿಯನ್ನು ಬದಲಾಯಿಸಲು ಬಯಸುತ್ತೀರಿ? ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ, ಅಥವಾ ಸಂಪೂರ್ಣವಾಗಿ ಬದಲಾಯಿಸಲು ಫಾರ್ಮ್ ಮೋಡ್‌ಗೆ ಹೋಗಿ."
          : "Which detail would you like to update? Choose an option below, or switch to Form Mode to edit all fields at once.";

        const editOptions = isKn
          ? [
              { label: "ಹೆಸರು ಬದಲಾಯಿಸಿ", value: "EDIT_NAME" },
              { label: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಬದಲಾಯಿಸಿ", value: "EDIT_LAND" },
              { label: "ಜಿಲ್ಲೆ ಬದಲಾಯಿಸಿ", value: "EDIT_DISTRICT" },
              { label: "ಬೆಳೆ ಬದಲಾಯಿಸಿ", value: "EDIT_CROP" },
              { label: "ಫಾರ್ಮ್ ಮೋಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ", value: "CONFIRM_EDIT_FORM" }
            ]
          : [
              { label: "Change Name", value: "EDIT_NAME" },
              { label: "Change Land Size", value: "EDIT_LAND" },
              { label: "Change District", value: "EDIT_DISTRICT" },
              { label: "Change Crops", value: "EDIT_CROP" },
              { label: "Review All in Form Mode", value: "CONFIRM_EDIT_FORM" }
            ];

        return res.json({
          reply: editPrompt,
          nextStep: 'confirm_edit',
          options: editOptions,
          updatedProfile,
          isComplete: false
        });
      }
    }

    // Handle redirection from confirm_edit
    if (step === 'confirm_edit' || rawInput.startsWith('EDIT_')) {
      let targetStep = 'name';
      if (rawInput === 'EDIT_LAND' || /land|ಭೂಮಿ/i.test(rawInput)) targetStep = 'landHolding';
      else if (rawInput === 'EDIT_DISTRICT' || /district|ಸ್ಥಳ|ಜಿಲ್ಲೆ/i.test(rawInput)) targetStep = 'district';
      else if (rawInput === 'EDIT_CROP' || /crop|ಬೆಳೆ/i.test(rawInput)) targetStep = 'cropType';
      else if (rawInput === 'EDIT_NAME' || /name|ಹೆಸರು/i.test(rawInput)) targetStep = 'name';

      const targetConfig = CHAT_FLOW_CONFIG[targetStep][langKey];
      return res.json({
        reply: targetConfig.question,
        nextStep: targetStep,
        options: targetConfig.options || [],
        updatedProfile,
        isComplete: false
      });
    }

    // Step-by-Step Input Validation
    let validationError: string | null = null;

    if (step === 'name') {
      const extracted = rawInput.replace(/^(my name is|i am|nan hesaru|nanu)\s+/i, '').trim();
      const hasLetters = /[a-zA-Z\u0C80-\u0CFF]/.test(extracted);
      if (isUnknownOrEvasiveInput(rawInput) || !hasLetters || extracted.length < 2) {
        validationError = isKn
          ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು FRUITS ನೋಂದಣಿಗೆ ರೈತರ ಅಧಿಕೃತ ಹೆಸರು ಅಗತ್ಯವಿದೆ. 'ಗೊತ್ತಿಲ್ಲ' ಅಥವಾ ಅಮಾನ್ಯ ಹೆಸರುಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸಿ (ಉದಾ: ರಮೇಶ್ ಗೌಡ ಅಥವಾ ಲಕ್ಷ್ಮಿ ದೇವಿ), ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ."
          : "A valid farmer name is required by government scheme registries (e.g. FRUITS, RTC records). Answers like 'I don't know' or random letters cannot be accepted. Please state your full name (for example, 'Ramesh Gowda' or 'Lakshmi Devi'), or select one of the suggested names below.";
      } else {
        updatedProfile.fullName = extracted;
      }
    } else if (step === 'age') {
      const match = rawInput.match(/\b\d{1,3}\b/);
      const parsedAge = match ? parseInt(match[0], 10) : parseInt(rawInput, 10);
      if (isUnknownOrEvasiveInput(rawInput) || isNaN(parsedAge) || parsedAge < 18 || parsedAge > 105) {
        validationError = isKn
          ? "ಪಿಎಂ ಕಿಸಾನ್, ಕಿಸಾನ್ ಮಾನ್‌ಧನ್ ಪಿಂಚಣಿ (18-40 ವರ್ಷ) ಮತ್ತು ಯುವ ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ 18 ರಿಂದ 100 ವರ್ಷದ ನಡುವಿನ ಮಾನ್ಯ ವಯಸ್ಸು ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಿ (ಉದಾ: 35) ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ."
          : "A valid age between 18 and 100 is required because central and state schemes (like PM-KISAN, PM-KMY pension 18-40 yrs, and senior welfare) depend on age. Please enter your age (e.g., 35) or pick one of the options below.";
      } else {
        updatedProfile.age = parsedAge;
      }
    } else if (step === 'gender') {
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
    } else if (step === 'category') {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ಗಂಗಾ ಕಲ್ಯಾಣ ಮತ್ತು ಇತರ ಕೃಷಿ ಯೋಜನೆಗಳಲ್ಲಿ SC/ST ರೈತರಿಗೆ 90% ರಿಂದ 100% ಹಾಗೂ OBC ರೈತರಿಗೆ ವಿಶೇಷ ಸಬ್ಸಿಡಿ ಲಭ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಾಮಾಜಿಕ ವರ್ಗವನ್ನು ಕೆಳಗೆ ಆರಿಸಿ."
          : "Social reservation category is required to determine your subsidy rate (e.g., 90% to 100% subsidy for SC/ST under Ganga Kalyana, compared to standard General rates). Please select General, OBC, SC, or ST below.";
      } else if (/sc|scheduled caste|ಪರಿಶಿಷ್ಟ ಜಾತಿ/i.test(rawInput)) {
        updatedProfile.category = 'SC';
      } else if (/st|scheduled tribe|ಪರಿಶಿಷ್ಟ ಪಂಗಡ/i.test(rawInput)) {
        updatedProfile.category = 'ST';
      } else if (/obc|ಹಿಂದುಳಿದ|2a|2b|3a|3b/i.test(rawInput)) {
        updatedProfile.category = 'OBC';
      } else if (/gen|general|ಸಾಮಾನ್ಯ/i.test(rawInput)) {
        updatedProfile.category = 'General';
      } else {
        validationError = isKn
          ? "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಸಾಮಾಜಿಕ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ: ಸಾಮಾನ್ಯ, OBC, SC, ಅಥವಾ ST."
          : "Please select a recognized category: General, OBC, SC, or ST from the options below.";
      }
    } else if (step === 'district') {
      const hasLetters = /[a-zA-Z\u0C80-\u0CFF]/.test(rawInput);
      if (isUnknownOrEvasiveInput(rawInput) || !hasLetters || rawInput.length < 3) {
        validationError = isKn
          ? "ಕರ್ನಾಟಕದ ಕೃಷಿ ಯೋಜನೆಗಳು (ಕೃಷಿ ಭಾಗ್ಯ, ಬರ ಪರಿಹಾರ ಮತ್ತು ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳು) ಜಿಲ್ಲಾವಾರು ಜಾರಿಯಾಗುತ್ತವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿ ಇರುವ ಜಿಲ್ಲೆಯನ್ನು ತಿಳಿಸಿ (ಉದಾ: ಧಾರವಾಡ, ಮಂಡ್ಯ, ಬೆಳಗಾವಿ) ಅಥವಾ ಕೆಳಗೆ ಆಯ್ಕೆಮಾಡಿ."
          : "A valid Karnataka district is required because agricultural schemes (like Krishi Bhagya, drought compensation, and Raitha Samparka Kendras) are administered by district. Please name your district (e.g. Dharwad, Mandya, Belagavi) or click an option below.";
      } else {
        updatedProfile.district = rawInput;
        updatedProfile.state = 'Karnataka';
      }
    } else if (step === 'landHolding') {
      const match = rawInput.match(/[\d.]+/);
      const parsedAcres = match ? parseFloat(match[0]) : NaN;
      if (isUnknownOrEvasiveInput(rawInput) || isNaN(parsedAcres) || parsedAcres < 0 || parsedAcres > 500) {
        validationError = isKn
          ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣದ ಆಧಾರದ ಮೇಲೆ ಅತಿ ಸಣ್ಣ (<2.5 ಎಕರೆ), ಸಣ್ಣ (2.5-5 ಎಕರೆ) ರೈತರನ್ನು ಗುರುತಿಸುತ್ತವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಭೂಮಿಯ ಎಕರೆಗಳನ್ನು ತಿಳಿಸಿ (ಉದಾ: 2.5 ಅಥವಾ 4) ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆ ಆರಿಸಿ."
          : "Government schemes categorize farmers by land holding (Marginal <2.5 acres, Small 2.5-5 acres). Please provide a valid land size in acres (e.g., 2.5, 4.0) or pick one of the options below.";
      } else {
        updatedProfile.landHolding = String(parsedAcres);
        updatedProfile.landHoldingAcres = parsedAcres;
        updatedProfile.hasLandOwnership = parsedAcres > 0;
        updatedProfile.farmerCategory = parsedAcres <= 2.5 ? 'marginal' : parsedAcres <= 5 ? 'small' : 'medium';
      }
    } else if (step === 'cropType') {
      const hasLetters = /[a-zA-Z\u0C80-\u0CFF]/.test(rawInput);
      if (isUnknownOrEvasiveInput(rawInput) || !hasLetters || rawInput.length < 2) {
        validationError = isKn
          ? "ಬೆಳೆಯ ಮಾಹಿತಿ ಮುಖ್ಯವಾಗಿದೆ: ಸಿರಿಧಾನ್ಯಗಳಿಗೆ 'ರೈತ ಸಿರಿ' ಅಡಿಯಲ್ಲಿ ₹10,000/ಹೆಕ್ಟೇರ್ ಪ್ರೋತ್ಸಾಹಧನ, ಭತ್ತಕ್ಕೆ ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಬೆಂಬಲ ಬೆಲೆ ಲಭ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನೀವು ಬೆಳೆಯುವ ಬೆಳೆಯ ಹೆಸರನ್ನು ತಿಳಿಸಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ."
          : "Crop information is required because specific schemes provide dedicated benefits (e.g., ₹10,000/ha for Millets under Raitha Siri, MSP & PMFBY insurance for Paddy). Please enter or choose your crop below.";
      } else {
        updatedProfile.cropType = rawInput;
        updatedProfile.cropsGrown = [rawInput];
      }
    } else if (step === 'irrigation') {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ನೀರಾವರಿ ಸೌಲಭ್ಯವು PMKSY ಹನಿ ನೀರಾವರಿ, ಕೃಷಿ ಭಾಗ್ಯ ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಕುಸುಮ್ ಸೌರ ಪಂಪ್ ಅರ್ಹತೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು ಮಳೆ ಆಶ್ರಿತ, ಬೋರ್‌ವೆಲ್ ಅಥವಾ ಕಾಲುವೆ ಆಯ್ಕೆಮಾಡಿ."
          : "Irrigation type determines eligibility for PMKSY drip irrigation, Krishi Bhagya farm ponds, and PM-KUSUM solar pumps. Please select Rainfed, Borewell, or Canal from the choices below.";
      } else {
        updatedProfile.irrigationType = rawInput;
        updatedProfile.hasWaterSource = !/rainfed|ಮಳೆ/i.test(rawInput);
        updatedProfile.hasExistingBorewell = /borewell|ಬೋರ್‌ವೆಲ್/i.test(rawInput);
      }
    } else if (step === 'fruitsId') {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸಬ್ಸಿಡಿಗಳನ್ನು ನೇರವಾಗಿ ಪಡೆಯಲು FRUITS ID ಅಗತ್ಯ. ನಿಮಗೆ FRUITS ID ಇದೆಯೇ ಎಂದು ದಯವಿಟ್ಟು ತಿಳಿಸಿ (ಹೌದು ಅಥವಾ ಇಲ್ಲ/ಖಚಿತವಿಲ್ಲ ಆಯ್ಕೆಮಾಡಿ)."
          : "Karnataka FRUITS registration is needed for seamless subsidy transfer. Please indicate if you have a FRUITS ID or select 'No / Not yet registered' below.";
      } else {
        updatedProfile.fruitsRegistered = /true|yes|ಹೌದು/i.test(rawInput);
        updatedProfile.hasFruitsId = updatedProfile.fruitsRegistered;
      }
    } else if (step === 'aadhaar') {
      if (isUnknownOrEvasiveInput(rawInput)) {
        validationError = isKn
          ? "ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಮೂಲಕ ಸಹಾಯಧನ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಬರಲು ಆಧಾರ್ ಬ್ಯಾಂಕ್ ಲಿಂಕ್ ಅಗತ್ಯ. ದಯವಿಟ್ಟು ಲಿಂಕ್ ಆಗಿದೆಯೇ ಎಂದು ಆಯ್ಕೆಮಾಡಿ."
          : "Aadhaar bank-linking and DBT seeding are required for direct benefit deposits. Please confirm if your account is linked or select 'Not sure / Not Linked'.";
      } else {
        updatedProfile.aadhaarLinked = /true|yes|ಹೌದು/i.test(rawInput);
        updatedProfile.hasAadhaarBankLinked = updatedProfile.aadhaarLinked;
      }
    }

    // If validation failed, reject and re-prompt on the SAME step
    if (validationError) {
      const currentConfig = CHAT_FLOW_CONFIG[step]?.[langKey];
      const errorOptions = [...(currentConfig?.options || [])];
      if (updatedProfile.district || updatedProfile.landHolding || updatedProfile.cropType || updatedProfile.fullName) {
        if (!errorOptions.some((o: any) => o.value === 'EVALUATE_NOW')) {
          errorOptions.push({
            label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
            value: "EVALUATE_NOW"
          });
        }
      }
      return res.json({
        reply: validationError,
        nextStep: step,
        options: errorOptions,
        updatedProfile,
        isComplete: false
      });
    }

    const currentConfig = CHAT_FLOW_CONFIG[step];
    const nextStep = currentConfig?.next || null;

    if (!nextStep) {
      // Completed - should not be reached directly unless confirmed
      return res.json({
        reply: isKn ? "ಧನ್ಯವಾದಗಳು!" : "Thank you!",
        nextStep: null,
        isComplete: true,
        updatedProfile
      });
    }

    const nextConfig = CHAT_FLOW_CONFIG[nextStep];
    const nextContent = nextConfig[langKey];

    // If nextStep is 'confirm', present the summary card text
    let replyText = nextContent.question;
    if (nextStep === 'confirm') {
      replyText = formatProfileSummary(updatedProfile, isKn);
    }

    const returnedOptions = [...(nextContent.options || [])];
    if (updatedProfile.district || updatedProfile.landHolding || updatedProfile.cropType) {
      const alreadyHasEval = returnedOptions.some((o: any) => o.value === 'EVALUATE_NOW' || o.value === 'CONFIRM_YES');
      if (!alreadyHasEval && nextStep !== 'confirm') {
        returnedOptions.push({
          label: isKn ? "⚡ ಈಗಲೇ ಪರಿಶೀಲಿಸಿ" : "⚡ Evaluate My Profile Now",
          value: "EVALUATE_NOW"
        });
      }
    }

    return res.json({
      reply: replyText,
      nextStep,
      options: returnedOptions,
      updatedProfile,
      isComplete: false
    });
  } catch (err: any) {
    console.error('eligibility-chat error:', err);
    res.status(500).json({ error: 'Failed to process eligibility conversation' });
  }
});

app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================

async function startServer() {
  const pgConnected = await checkPostgreSqlConnection();
  if (pgConnected) {
    await dbStore.syncFromPostgres();
  }

  if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
    const rootDist = path.resolve(__dirname, '..', 'dist');
    const staticDir = fs.existsSync(frontendDist) ? frontendDist : rootDist;
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(staticDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kisan Scheme Saathi backend running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.warn(`Port ${PORT} in use, retrying on ${fallbackPort}...`);
      app.listen(fallbackPort, '0.0.0.0', () => {
        console.log(`Kisan Scheme Saathi backend running on http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
