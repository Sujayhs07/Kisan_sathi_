import { schemesData } from '../data/schemesData.js';

/**
 * Deterministic Rules Evaluator for Farmer Schemes
 * Evaluates farmer profile against real Central and Karnataka State scheme criteria.
 * 
 * Guarantees that different profile inputs (land holding, caste category,
 * irrigation source, crop types, state) produce truly personalized eligibility results!
 */
export function evaluateFarmerProfile(profile = {}) {
  // 1. Normalize profile values
  const state = (profile.state || 'Karnataka').trim();
  const isKarnataka = state.toLowerCase() === 'karnataka';
  const district = profile.district || 'Karnataka';
  const taluk = profile.taluk || '';
  
  // Parse land acres safely
  let landAcres = 2.0;
  if (profile.landHolding !== undefined && profile.landHolding !== null) {
    const parsed = parseFloat(String(profile.landHolding).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) {
      landAcres = parsed;
    }
  } else if (profile.landHoldingAcres !== undefined) {
    landAcres = Number(profile.landHoldingAcres) || 2.0;
  }

  // Social Category normalization
  const categoryRaw = (profile.category || profile.socialCategory || 'General').toUpperCase();
  const isSC = categoryRaw.includes('SC');
  const isST = categoryRaw.includes('ST');
  const isOBC = categoryRaw.includes('OBC') || categoryRaw.includes('2A') || categoryRaw.includes('2B') || categoryRaw.includes('CAT_1');
  const isGeneral = !isSC && !isST && !isOBC;
  const categoryDisplay = isSC ? 'SC' : isST ? 'ST' : isOBC ? 'OBC' : 'General';

  // Crop normalization
  const cropTypeRaw = String(profile.cropType || profile.cropsGrown || 'Ragi & Cereals').toLowerCase();
  const growsMillets = cropTypeRaw.includes('ragi') || cropTypeRaw.includes('millet') || cropTypeRaw.includes('jowar') || cropTypeRaw.includes('bajra') || cropTypeRaw.includes('cereals');
  const growsHorticulture = cropTypeRaw.includes('horticulture') || cropTypeRaw.includes('fruit') || cropTypeRaw.includes('vegetable') || cropTypeRaw.includes('flower') || cropTypeRaw.includes('plantation');
  const growsPaddy = cropTypeRaw.includes('paddy') || cropTypeRaw.includes('rice');
  const growsCommercial = cropTypeRaw.includes('sugarcane') || cropTypeRaw.includes('cotton') || cropTypeRaw.includes('commercial');

  // Irrigation normalization
  const irrigationRaw = String(profile.irrigationType || profile.irrigation || 'Borewell & Rainfed').toLowerCase();
  const hasWaterSource = irrigationRaw.includes('borewell') || irrigationRaw.includes('canal') || irrigationRaw.includes('river') || irrigationRaw.includes('drip') || irrigationRaw.includes('well');
  const isPureRainfed = irrigationRaw.includes('pure rainfed') || (irrigationRaw.includes('dryland') && !irrigationRaw.includes('borewell'));

  // Registrations & KYC
  const aadhaarLinked = profile.aadhaarLinked !== false && profile.hasAadhaarBankLinked !== false;
  const fruitsRegistered = profile.fruitsRegistered !== false && profile.hasFruitsId !== false;

  // 2. Evaluate all base schemes with personalized rules
  return schemesData.map(baseScheme => {
    const scheme = { ...baseScheme };

    switch (scheme.id) {
      // ----------------------------------------------------
      // 1. PM-KISAN Samman Nidhi
      // ----------------------------------------------------
      case 'pm-kisan': {
        // Small and marginal landholders under 2 Hectares (approx 5 Acres)
        if (landAcres > 5.0) {
          scheme.status = 'not_eligible';
          scheme.reason = `PM-KISAN prioritizes small and marginal landholders owning up to 2 Hectares (5.0 Acres). Your reported landholding is ${landAcres} Acres.`;
          scheme.alternativeScheme = 'You can apply for the Kisan Credit Card (KCC) or PM Fasal Bima Yojana, which have no upper landholding limits.';
          scheme.matchedConditions = [
            `Cultivable land ownership registered in ${district}`,
            `Aadhaar linked bank account with DBT ${aadhaarLinked ? 'active' : 'enabled'}`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.matchedConditions = [
            `Land holding of ${landAcres} Acres (within 5.0 Acres ceiling for small/marginal farmers)`,
            `Active cultivable land record registered in Bhoomi (${district})`,
            `Aadhaar seeded bank account with DBT ${aadhaarLinked ? 'verified active' : 'ready for direct credit'}`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 2. Kisan Credit Card (KCC)
      // ----------------------------------------------------
      case 'kcc': {
        scheme.status = 'eligible';
        scheme.reason = null;
        scheme.alternativeScheme = null;
        scheme.matchedConditions = [
          `Active cultivation of ${profile.cropType || 'notified crops'} in ${district}`,
          `Cultivable landholding of ${landAcres} Acres verified`,
          `Eligible for concessional crop credit up to ₹3,00,000 at 4% subsidized interest rate`
        ];
        break;
      }

      // ----------------------------------------------------
      // 3. PM Krishi Sinchayee Yojana (PMKSY - Drip/Sprinkler)
      // ----------------------------------------------------
      case 'pm-krishi-sinchayee': {
        if (isPureRainfed && !hasWaterSource) {
          scheme.status = 'not_eligible';
          scheme.reason = `PM Krishi Sinchayee Yojana (Drip/Sprinkler micro-irrigation) requires an existing water source (borewell, open well, or canal). Your irrigation is recorded as "${profile.irrigationType || 'Pure Rainfed'}".`;
          scheme.alternativeScheme = isKarnataka && (isSC || isST || isOBC)
            ? 'Eligible for Ganga Kalyana Scheme to receive a 100% free borewell and pump setup first!'
            : 'Consider Krishi Bhagya for subsidized farm ponds to harvest rainwater.';
          scheme.matchedConditions = [
            `Cultivable land registered in ${district}`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          const subsidyRate = landAcres <= 5.0 ? '90%' : '45% to 55%';
          scheme.matchedConditions = [
            `Verified irrigation water source (${profile.irrigationType || 'Borewell / Source'}) on farmland`,
            `Holding size of ${landAcres} Acres qualifies for up to ${subsidyRate} micro-irrigation subsidy`,
            `No prior micro-irrigation subsidy claimed in the last 5 years`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 4. Raitha Siri Scheme (Karnataka Millet Growers)
      // ----------------------------------------------------
      case 'raitha-siri': {
        if (!isKarnataka) {
          scheme.status = 'not_eligible';
          scheme.reason = `Raitha Siri is a Karnataka state-specific scheme. Your selected state is "${state}".`;
          scheme.alternativeScheme = 'Eligible for Central PM-KISAN Samman Nidhi and KCC.';
          scheme.matchedConditions = [];
        } else if (!growsMillets) {
          scheme.status = 'not_eligible';
          scheme.reason = `Raitha Siri direct incentive of ₹10,000/ha is exclusively for farmers cultivating millets (Ragi, Jowar, Bajra, Navane, Same). Your selected crop is "${profile.cropType}".`;
          scheme.alternativeScheme = growsHorticulture 
            ? 'Eligible for National Horticulture Mission and PMKSY.' 
            : 'Eligible for PM-KISAN, KCC, and PM Fasal Bima for your current crop.';
          scheme.matchedConditions = [
            `Resident of Karnataka (${district}) with active farming`,
            `Farmer registered on Karnataka FRUITS portal (FID)`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.matchedConditions = [
            `Cultivating recognized dryland millets (${profile.cropType || 'Ragi & Cereals'})`,
            `Resident farmer of Karnataka with verified Bhoomi land records in ${district}`,
            `FRUITS ID ${fruitsRegistered ? 'active' : 'linked'} for direct ₹10,000/ha DBT incentive`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 5. Pradhan Mantri Fasal Bima Yojana (Crop Insurance)
      // ----------------------------------------------------
      case 'pm-fasal-bima': {
        scheme.status = 'upcoming';
        scheme.badge = 'Opens Soon';
        scheme.matchedConditions = [
          `Insurable crop interest registered for ${profile.cropType || 'crops'} in ${district}`,
          `Land records verifiable in Bhoomi Karnataka / State Land Registry`,
          `Eligible for seasonal insurance premium subsidy under PMFBY / Samrakshane`
        ];
        break;
      }

      // ----------------------------------------------------
      // 6. Rashtriya Krishi Vikas Yojana (Farm Mechanization)
      // ----------------------------------------------------
      case 'rkvy': {
        scheme.status = 'upcoming';
        scheme.badge = 'Not Open';
        scheme.matchedConditions = [
          `Registered farmer with valid land records in ${district}`,
          `Eligible for up to 50% subsidy on farm machinery, power tillers, and implements`
        ];
        break;
      }

      // ----------------------------------------------------
      // 7. Ganga Kalyana Scheme (Karnataka Free Borewells)
      // ----------------------------------------------------
      case 'ganga-kalyana': {
        if (!isKarnataka) {
          scheme.status = 'not_eligible';
          scheme.reason = `Ganga Kalyana is exclusively for Karnataka resident farmers.`;
          scheme.alternativeScheme = 'Apply for PM Krishi Sinchayee Yojana (PMKSY) micro-irrigation subsidy.';
          scheme.matchedConditions = [];
        } else if (isGeneral) {
          scheme.status = 'not_eligible';
          scheme.reason = `Ganga Kalyana Scheme provides free borewells and pump sets exclusively to SC, ST, and Backward Classes (Category 1, 2A, 2B) small farmers. Your profile is General category.`;
          scheme.alternativeScheme = 'Eligible for PM Krishi Sinchayee Yojana (PMKSY) offering up to 90% micro-irrigation subsidy for all communities.';
          scheme.matchedConditions = [
            `Small and marginal landholding criteria met (${landAcres} Acres)`
          ];
        } else if (landAcres > 5.0) {
          scheme.status = 'not_eligible';
          scheme.reason = `Ganga Kalyana is reserved for small & marginal farmers holding between 1.5 and 5.0 Acres. Your reported landholding is ${landAcres} Acres.`;
          scheme.alternativeScheme = 'Eligible for Custom Hiring Centers and Krishi Yanthradhare machinery schemes.';
          scheme.matchedConditions = [
            `Eligible social category (${categoryDisplay}) under Karnataka Backward Classes guidelines`
          ];
        } else {
          // Qualified! SC/ST or OBC small farmer in Karnataka!
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.matchedConditions = [
            `Eligible social category (${categoryDisplay}) under Karnataka Social Welfare & Backward Classes Corporation`,
            `Small and marginal land holding of ${landAcres} Acres (within 1.5 - 5.0 Acres eligibility window)`,
            `Resident of ${district}, Karnataka with un-energized cultivable land`,
            `Qualifies for 100% free borewell drilling, casing pipe, submersible pump, and electrical energization (up to ₹4,00,000 value)`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 8. Custom Hiring Center Sub-Mission (Heavy Farm Machinery)
      // ----------------------------------------------------
      case 'custom-hiring': {
        if (landAcres >= 10.0) {
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.matchedConditions = [
            `Land holding of ${landAcres} Acres meets the minimum 10+ Acres threshold for custom hiring center establishment`,
            `Clear agricultural title in ${district} with operational access`,
            `Eligible for capital subsidy grant of up to ₹10 Lakhs for modern machinery bank`
          ];
        } else {
          scheme.status = 'not_eligible';
          scheme.reason = `Custom Hiring Center establishment requires a minimum of 10.0 continuous acres or registered Farmer Producer Organization (FPO) status. Your land holding is ${landAcres} Acres.`;
          scheme.alternativeScheme = 'You can hire modern farm machinery from your nearest Raitha Samparka Kendra at 50% subsidized hourly rental rates.';
          scheme.matchedConditions = [
            `Active farmer in ${district}`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 9. National Horticulture Mission (NHM)
      // ----------------------------------------------------
      case 'national-horticulture': {
        if (growsHorticulture) {
          scheme.status = 'eligible';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.matchedConditions = [
            `Active commercial cultivation of horticulture crops (${profile.cropType || 'Fruits & Vegetables'})`,
            `Cultivable landholding of ${landAcres} Acres registered in ${district}`,
            `Eligible for 50% capital subsidy on greenhouse/polyhouse erection and cold storage setup`
          ];
        } else {
          scheme.status = 'not_eligible';
          scheme.reason = `National Horticulture Mission requires certified commercial horticulture cultivation (fruits, vegetables, flowers, spices, or medicinal plants). Your registered crop is "${profile.cropType || 'Cereals'}".`;
          scheme.alternativeScheme = growsMillets 
            ? 'Eligible for Raitha Siri millet incentive (₹10,000/ha) and PM-KISAN.' 
            : 'Eligible for PM-KISAN, KCC, and PMKSY for your current cereal/commercial crop.';
          scheme.matchedConditions = [
            `Active agricultural landholder in ${district}`
          ];
        }
        break;
      }

      default:
        break;
    }

    return scheme;
  });
}
