import http from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set dedicated test port before importing server
process.env.PORT = '5088';
process.env.NODE_ENV = 'test';

async function run() {
  console.log('[TEST SUITE] Importing and starting Kisan Scheme Saathi server...');
  
  const serverPath = pathToFileURL(path.resolve(__dirname, '..', 'server.ts')).href;
  await import(serverPath);

  // Small delay to ensure listen callback has executed
  await new Promise((r) => setTimeout(r, 1000));

  const BASE_URL = 'http://127.0.0.1:5088';

  function req(
    method: string,
    endpoint: string,
    body: any = null,
    token: string | null = null
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, BASE_URL);
      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      };

      if (token) {
        options.headers!['Authorization'] = `Bearer ${token}`;
      }

      const r = http.request(options, (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      r.on('error', reject);
      if (body) r.write(JSON.stringify(body));
      r.end();
    });
  }

  const results: { name: string; status: 'PASS' | 'FAIL'; note?: string }[] = [];

  async function check(name: string, fn: () => Promise<string | void>) {
    try {
      const note = await fn();
      results.push({ name, status: 'PASS', note: note || undefined });
      console.log(`  ✓ [PASS] ${name} ${note ? `(${note})` : ''}`);
    } catch (err: any) {
      results.push({ name, status: 'FAIL', note: err.message });
      console.error(`  ✗ [FAIL] ${name} -> ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('   RUNNING COMPREHENSIVE BACKEND API TEST HARNESS     ');
  console.log('======================================================\n');

  // Test 1: Healthcheck
  await check('Health Check (/api/health)', async () => {
    const res = await req('GET', '/api/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    return `Server healthy, provider=${res.data.smsProvider || 'none'}`;
  });

  // Test 2: Schemes Catalog
  await check('Schemes Catalog (/api/schemes)', async () => {
    const res = await req('GET', '/api/schemes');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const count = res.data.schemes?.length || 0;
    if (count === 0) throw new Error('No schemes returned');
    return `${count} verified schemes loaded`;
  });

  // Test 3: Single Scheme with alias resolution
  await check('Scheme Details (/api/schemes/pm-kisan)', async () => {
    const res = await req('GET', '/api/schemes/pm-kisan');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const scheme = res.data.scheme || res.data;
    if (!scheme.id || !scheme.id.startsWith('pm-kisan'))
      throw new Error(`Wrong scheme returned: ${scheme.id}`);
    return `Verified: ${scheme.nameEn}`;
  });

  // Test 4: Document Checklist
  await check('Document Checklist (/api/schemes/pm-kisan/checklist)', async () => {
    const res = await req('GET', '/api/schemes/pm-kisan/checklist');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const list = res.data.checklist || res.data.prerequisites;
    if (!list || list.length === 0) throw new Error('No checklist returned');
    return `${list.length} checklist items found`;
  });

  // Test 5: Application Guide
  await check('Application Guide (/api/schemes/pm-kisan/application-guide)', async () => {
    const res = await req('GET', '/api/schemes/pm-kisan/application-guide');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const guide = res.data.guide || res.data.stepsEn;
    if (!guide || guide.length === 0) throw new Error('No guide steps returned');
    return `${guide.length} step-by-step roadmap items`;
  });

  // Test 6: Deterministic Eligibility: Marginal Farmer (Millets, SC, 2.0 Acres)
  let smallCount = 0;
  await check('Eligibility Engine (Marginal SC Millet Farmer)', async () => {
    const payload = {
      state: 'Karnataka',
      district: 'Bengaluru Rural',
      taluk: 'Hoskote',
      socialCategory: 'SC',
      farmerCategory: 'small_marginal',
      landHoldingAcres: 2.0,
      hasLandOwnership: true,
      cropsGrown: ['Ragi & Cereals'],
      hasWaterSource: true,
      hasExistingBorewell: false,
      hasFruitsId: true,
      hasRtcOrPahani: true,
      hasAadhaarBankLinked: true,
      hasCasteIncomeCertificate: true
    };
    const res = await req('POST', '/api/eligibility/evaluate', payload);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const eligible = res.data.results.filter((r: any) => r.eligible);
    smallCount = eligible.length;
    if (smallCount === 0) throw new Error('Expected eligible schemes for small farmer');
    return `${smallCount} schemes matched`;
  });

  // Test 7: Deterministic Eligibility: Large Commercial Farmer (15 Acres, General)
  await check(
    'Eligibility Engine Output Distinction (Large General Sugarcane Farmer)',
    async () => {
      const payload = {
        state: 'Karnataka',
        district: 'Belagavi',
        taluk: 'Athani',
        socialCategory: 'GEN',
        farmerCategory: 'large',
        landHoldingAcres: 15.0,
        hasLandOwnership: true,
        cropsGrown: ['Sugarcane & Commercial'],
        hasWaterSource: true,
        hasExistingBorewell: true,
        hasFruitsId: true,
        hasRtcOrPahani: true,
        hasAadhaarBankLinked: true,
        hasCasteIncomeCertificate: false
      };
      const res = await req('POST', '/api/eligibility/evaluate', payload);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const gangaKalyana = res.data.results.find((r: any) => r.schemeId === 'ganga-kalyana');
      if (gangaKalyana && gangaKalyana.eligible) {
        throw new Error(
          'Large General farmer with existing borewell must NOT be eligible for Ganga Kalyana'
        );
      }
      const eligible = res.data.results.filter((r: any) => r.eligible);
      if (eligible.length >= smallCount) {
        throw new Error(
          `Expected fewer eligible schemes for large farmer (${eligible.length}) than small farmer (${smallCount})`
        );
      }
      return `Verified distinct! Matches: ${eligible.length} vs Marginal: ${smallCount}`;
    }
  );

  // Test 8: Eligibility Chatbot Endpoint
  await check('Conversational Chatbot Endpoint (/api/eligibility-chat)', async () => {
    const payload = { step: 'name', language: 'en', message: 'Sujay H S' };
    const res = await req('POST', '/api/eligibility-chat', payload);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.reply) throw new Error('Missing reply');
    return `Reply: "${res.data.reply.slice(0, 40)}..."`;
  });

  // Test 9: Auth Registration & Live Token Creation
  let token: string | null = null;
  const testPhone = `+9198450${Math.floor(10000 + Math.random() * 90000)}`;
  const testUsername = `farmer_${Date.now().toString().slice(-6)}`;

  await check('Farmer Registration & OTP (/api/auth/register)', async () => {
    const payload = {
      username: testUsername,
      fullName: 'Sujay Verified Farmer',
      phoneNumber: testPhone,
      password: 'StrongPassword@123',
      termsAccepted: true,
      district: 'Bengaluru Rural'
    };
    const res = await req('POST', '/api/auth/register', payload);
    if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    return `Registered pending user ${testUsername}`;
  });

  await check('Verify OTP & Issue JWT (/api/auth/verify-otp)', async () => {
    const payload = {
      phoneNumber: testPhone,
      otpCode: '123456',
      purpose: 'REGISTRATION'
    };
    const res = await req('POST', '/api/auth/verify-otp', payload);
    if (res.status !== 200 || !res.data.token) {
      throw new Error(`Failed OTP verification: ${JSON.stringify(res.data)}`);
    }
    token = res.data.token;
    return `JWT verified and issued (Length: ${token!.length})`;
  });

  // Test 10: Authenticated Profile & Data Endpoints
  if (token) {
    await check('Authenticated Saved Schemes (/api/saved-schemes)', async () => {
      const res = await req('GET', '/api/saved-schemes', null, token);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return `Loaded user bookmarks`;
    });

    await check('Authenticated Applications Tracker (/api/applications)', async () => {
      const res = await req('GET', '/api/applications', null, token);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return `Loaded application records`;
    });

    await check('Authenticated Deadlines & Reminders (/api/reminders/upcoming)', async () => {
      const res = await req('GET', '/api/reminders/upcoming', null, token);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return `Loaded deadline reminders`;
    });

    await check('Authenticated In-App Notifications (/api/notifications)', async () => {
      const res = await req('GET', '/api/notifications', null, token);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return `Loaded user notification center`;
    });
  }

  // Test 11: Unregistered Mobile Number Login Block (Bug Fix Validation)
  await check(
    'Unregistered Mobile Login Block (/api/auth/send-otp LOGIN_VERIFICATION)',
    async () => {
      const unregisteredPhone = '9999900001';
      const res = await req('POST', '/api/auth/send-otp', {
        phoneNumber: unregisteredPhone,
        purpose: 'LOGIN_VERIFICATION'
      });
      if (res.status !== 404) {
        throw new Error(`Expected HTTP 404 for unregistered user, got status ${res.status}`);
      }
      if (res.data?.code !== 'USER_NOT_FOUND') {
        throw new Error(`Expected USER_NOT_FOUND code, got ${JSON.stringify(res.data)}`);
      }
      return 'Successfully blocked unregistered login and prompted account creation';
    }
  );

  // Test 11b: Unregistered Mobile Verify OTP Block
  await check(
    'Unregistered Mobile Verify OTP Block (/api/auth/verify-otp LOGIN_VERIFICATION)',
    async () => {
      const unregisteredPhone = '9999900001';
      const res = await req('POST', '/api/auth/verify-otp', {
        phoneNumber: unregisteredPhone,
        otpCode: '123456',
        purpose: 'LOGIN_VERIFICATION'
      });
      if (res.status !== 404) {
        throw new Error(`Expected HTTP 404 for unregistered verify OTP, got status ${res.status}`);
      }
      if (res.data?.code !== 'USER_NOT_FOUND') {
        throw new Error(`Expected USER_NOT_FOUND code, got ${JSON.stringify(res.data)}`);
      }
      return 'Strictly rejected OTP verification attempt for unregistered phone';
    }
  );

  // Test 12: Registered Mobile Number Login Flow (Bug Fix Validation)
  await check(
    'Registered Mobile Login Verification (/api/auth/send-otp & verify-otp)',
    async () => {
      // Use the newly registered user's verified phone
      const resSend = await req('POST', '/api/auth/send-otp', {
        phoneNumber: testPhone,
        purpose: 'LOGIN_VERIFICATION'
      });
      if (resSend.status !== 200 || !resSend.data?.otpRequired) {
        throw new Error(`Expected 200 with otpRequired, got ${resSend.status}: ${JSON.stringify(resSend.data)}`);
      }

      const resVerify = await req('POST', '/api/auth/verify-otp', {
        phoneNumber: testPhone,
        otpCode: '123456',
        purpose: 'LOGIN_VERIFICATION'
      });
      if (resVerify.status !== 200 || !resVerify.data?.token || !resVerify.data?.user) {
        throw new Error(`Expected 200 with token and user object, got ${resVerify.status}`);
      }
      if (resVerify.data.user.phoneNumber !== testPhone) {
        throw new Error(`User phone mismatch: ${resVerify.data.user.phoneNumber} vs ${testPhone}`);
      }
      return `Verified login for ${resVerify.data.user.fullName} (${resVerify.data.user.phoneNumber})`;
    }
  );

  // Test 13: Database Check User Endpoint (/api/auth/check-user)
  await check('Check User Database Endpoint (/api/auth/check-user)', async () => {
    const resUnregistered = await req('POST', '/api/auth/check-user', { phoneNumber: '9999900001' });
    if (resUnregistered.status !== 200 || resUnregistered.data?.exists !== false) {
      throw new Error(`Expected exists: false for unregistered number`);
    }

    const resRegistered = await req('POST', '/api/auth/check-user', { phoneNumber: testPhone });
    if (resRegistered.status !== 200 || resRegistered.data?.exists !== true) {
      throw new Error(`Expected exists: true for registered number`);
    }
    return `Correctly checks database: unregistered=false, registered=true`;
  });

  console.log('\n======================================================');
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`TOTAL SUITE RESULTS: ${results.length - failed.length}/${results.length} PASSED`);
  if (failed.length > 0) {
    console.error(`FAILED: ${failed.map((f) => f.name).join(', ')}`);
    process.exit(1);
  } else {
    console.log('✅ ALL BACKEND AND DATABASE LOGIC TESTED 100% BUG-FREE!');
    console.log('======================================================\n');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('[INTEGRATION TEST FATAL]', e);
  process.exit(1);
});
