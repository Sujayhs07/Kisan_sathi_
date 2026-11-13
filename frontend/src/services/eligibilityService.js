import { evaluateFarmerProfile } from './eligibilityEngine.js';

/**
 * Service to evaluate scheme eligibility against the backend API with
 * graceful offline deterministic evaluation fallback.
 */
export async function evaluateSchemeEligibility(wizardData = {}) {
  // 1. Calculate local deterministic results first (always immediate and responsive)
  const evaluatedSchemes = evaluateFarmerProfile(wizardData);

  // 2. Prepare payload for authoritative backend rules engine
  let landHoldingAcres = 2.0;
  if (wizardData.landHolding) {
    const parsed = parseFloat(String(wizardData.landHolding).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) landHoldingAcres = parsed;
  }

  const category = (wizardData.category || 'General').toUpperCase();
  const socialCategory = category.includes('SC') ? 'SC'
    : category.includes('ST') ? 'ST'
    : category.includes('OBC') ? 'OBC_2A'
    : 'GEN';

  const farmerCategory = landHoldingAcres <= 2.5 
    ? 'small_marginal' 
    : landHoldingAcres <= 5.0 
      ? 'small_marginal' 
      : 'large';

  const crop = wizardData.cropType || 'Ragi & Cereals';
  const irrigation = wizardData.irrigationType || 'Borewell & Rainfed';
  const hasWaterSource = !irrigation.toLowerCase().includes('pure rainfed');

  const backendPayload = {
    state: wizardData.state || 'Karnataka',
    district: wizardData.district || 'Bengaluru Rural',
    taluk: wizardData.taluk || '',
    socialCategory,
    farmerCategory,
    landHoldingAcres,
    hasLandOwnership: true,
    annualIncome: 45000,
    age: parseInt(wizardData.age || '25', 10),
    cropsGrown: [crop],
    hasWaterSource,
    hasExistingBorewell: irrigation.toLowerCase().includes('borewell'),
    isCooperativeMember: true,
    hasChildrenInHigherEducation: false,
    notifiedCropInHobli: true,
    hasFruitsId: wizardData.fruitsRegistered !== false,
    hasRtcOrPahani: true,
    hasAadhaarBankLinked: wizardData.aadhaarLinked !== false,
    hasCasteIncomeCertificate: socialCategory !== 'GEN',
    hasSowingCertificate: true,
    isInstitutionalLandholder: false,
    isConstitutionalPostHolder: false,
    isGovernmentEmployee: false,
    isIncomeTaxPayee: false,
    isEnrolledInEsiOrCghs: false
  };

  // 3. Attempt to query backend /api/eligibility/evaluate
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/eligibility/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(backendPayload)
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        // Overlay any additional backend verification notes onto the schemes
        const backendMap = new Map();
        data.results.forEach(item => {
          backendMap.set(item.schemeId, item);
        });

        const mergedSchemes = evaluatedSchemes.map(sch => {
          const be = backendMap.get(sch.id);
          if (be) {
            return {
              ...sch,
              backendVerified: true,
              summaryExplanationEn: be.summaryExplanationEn,
              summaryExplanationKn: be.summaryExplanationKn,
              nextActionEn: be.nextActionEn,
              nextActionKn: be.nextActionKn
            };
          }
          return sch;
        });

        return {
          schemes: mergedSchemes,
          backendEvaluated: true,
          backendSummary: data.profileSummary
        };
      }
    }
  } catch (err) {
    // Backend offline or timeout — deterministic engine handles seamlessly
    console.info('[EligibilityService] Evaluated via client-side deterministic rules engine');
  }

  return {
    schemes: evaluatedSchemes,
    backendEvaluated: false
  };
}
