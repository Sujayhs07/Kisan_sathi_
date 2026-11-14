import { schemesData } from '../data/schemesData.js';

/**
 * Deterministic Rules Evaluator for Farmer Schemes
 * Evaluates farmer profile against real Central and Karnataka State scheme criteria.
 * 
 * Supports the 4-stage Common Farmer Profile flow:
 * - Basic Details
 * - Farm Details
 * - Support Needed & Document Readiness
 * - Scheme-Specific Follow-Up Questions
 */
export function evaluateFarmerProfile(profile = {}) {
  // 1. Normalize profile values
  const state = (profile.state || 'Karnataka').trim();
  const isKarnataka = state.toLowerCase() === 'karnataka';
  const district = profile.district || 'Dharwad';
  const taluk = profile.taluk || '';
  const village = profile.village || '';
  
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
  const isMinority = String(profile.isMinority || '').toLowerCase() === 'yes';

  // Crop normalization
  const cropsArray = Array.isArray(profile.cropsGrown) ? profile.cropsGrown : [profile.cropType || 'Ragi & Millets'];
  const cropTypeRaw = cropsArray.join(' ').toLowerCase();
  const growsMillets = cropTypeRaw.includes('ragi') || cropTypeRaw.includes('millet') || cropTypeRaw.includes('jowar') || cropTypeRaw.includes('bajra') || cropTypeRaw.includes('minor millet');
  const growsHorticulture = cropTypeRaw.includes('horticulture') || cropTypeRaw.includes('fruit') || cropTypeRaw.includes('vegetable') || cropTypeRaw.includes('flower') || cropTypeRaw.includes('greenhouse');
  const growsPaddy = cropTypeRaw.includes('paddy') || cropTypeRaw.includes('rice');
  const growsCommercial = cropTypeRaw.includes('sugarcane') || cropTypeRaw.includes('cotton') || cropTypeRaw.includes('commercial');

  // Irrigation normalization
  const irrigationRaw = String(profile.irrigationSource || profile.irrigationType || 'Borewell').toLowerCase();
  const hasWaterSource = irrigationRaw.includes('borewell') || irrigationRaw.includes('canal') || irrigationRaw.includes('well') || irrigationRaw.includes('pond');
  const isPureRainfed = irrigationRaw.includes('rain only') || irrigationRaw.includes('dryland');

  // Support needs array
  const supportList = Array.isArray(profile.supportNeeded) ? profile.supportNeeded : ['income_support'];
  const wantsIncome = supportList.includes('income_support') || supportList.includes('not_sure');
  const wantsCredit = supportList.includes('crop_loan') || supportList.includes('not_sure');
  const wantsIrrigation = supportList.includes('drip_sprinkler') || supportList.includes('not_sure');
  const wantsBorewell = supportList.includes('borewell') || supportList.includes('not_sure');
  const wantsMachineryPurchase = supportList.includes('machinery_purchase') || supportList.includes('not_sure');
  const wantsMachineryRental = supportList.includes('machinery_rental') || supportList.includes('not_sure');
  const wantsMilletSupport = supportList.includes('millet_cultivation') || supportList.includes('not_sure');
  const wantsInsurance = supportList.includes('crop_insurance') || supportList.includes('not_sure');
  const wantsHorticulture = supportList.includes('horticulture') || supportList.includes('not_sure');
  const wantsFarmInfra = supportList.includes('farm_infra') || supportList.includes('not_sure');

  // Follow-ups
  const followUps = profile.followUps || {};
  const docReadiness = profile.docReadiness || {};

  // Registrations & KYC readiness
  const aadhaarLinked = docReadiness.aadhaar === 'available' || profile.aadhaarLinked !== false;
  const rawFruits = profile.fruitsId ? String(profile.fruitsId).trim() : '';
  const fruitsRegistered = Boolean((rawFruits && !rawFruits.startsWith('KA-FRUITS-') && !rawFruits.startsWith('FID-KA-')) || profile.fruitsRegistered === true || docReadiness.fruits_id === 'available');

  // 2. Evaluate all base schemes with personalized rules
  return schemesData.map(baseScheme => {
    const scheme = { ...baseScheme };
    const missingDocs = [];

    // Helper to check doc readiness
    if (Array.isArray(scheme.requiredDocuments)) {
      scheme.requiredDocuments.forEach(doc => {
        const userDocStatus = docReadiness[doc.docKey];
        if (doc.required && (userDocStatus === 'not_available' || userDocStatus === 'not_sure')) {
          missingDocs.push({
            name: doc.name,
            docKey: doc.docKey,
            status: userDocStatus || 'not_available',
            note: doc.note
          });
        }
      });
    }
    scheme.unverifiedDocuments = missingDocs;

    switch (scheme.id) {
      // ----------------------------------------------------
      // 1. PM-KISAN Samman Nidhi
      // ----------------------------------------------------
      case 'pm-kisan': {
        if (landAcres > 5.0) {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `PM-KISAN prioritizes small and marginal landholders owning up to 2 Hectares (5.0 Acres). Your reported landholding is ${landAcres} Acres.`;
          scheme.alternativeScheme = 'You can apply for the Kisan Credit Card (KCC) or PM Fasal Bima Yojana, which have no upper landholding limits.';
          scheme.whySuggested = 'Income support requested, but land holding exceeds the 5.0 Acres ceiling for small/marginal criteria.';
          scheme.matchedConditions = [
            `Cultivable land ownership registered in ${district}`,
            `Aadhaar linked bank account with DBT ${aadhaarLinked ? 'active' : 'enabled'}`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.whySuggested = `You cultivate ${landAcres} Acres of agricultural land in ${district} and indicated a need for income support.`;
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
        scheme.matchLabel = 'Potential match';
        scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
        scheme.reason = null;
        scheme.alternativeScheme = null;
        scheme.whySuggested = `You actively cultivate crops in ${district} and are eligible for subsidized 4% production credit.`;
        scheme.matchedConditions = [
          `Active cultivation of ${cropsArray.join(', ')} in ${district}`,
          `Cultivable landholding of ${landAcres} Acres verified`,
          `Eligible for concessional crop credit up to ₹3,00,000 at 4% subsidized interest rate`
        ];
        break;
      }

      // ----------------------------------------------------
      // 3. PM Krishi Sinchayee Yojana (PMKSY - Drip/Sprinkler)
      // ----------------------------------------------------
      case 'pm-krishi-sinchayee': {
        if (isPureRainfed && !hasWaterSource && followUps.irrigationWaterAvailable === 'No') {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `PMKSY micro-irrigation requires an existing water source (borewell, open well, or canal). Your irrigation source is recorded as "${profile.irrigationSource || 'Rain only'}".`;
          scheme.alternativeScheme = isKarnataka && (isSC || isST || isOBC)
            ? 'Apply for the Ganga Kalyana Scheme first to receive a 100% free borewell and pump set!'
            : 'Consider farm pond rain-water harvesting subsidy under Krishi Bhagya.';
          scheme.whySuggested = 'Micro-irrigation interest selected, but requires a functional water source on site.';
          scheme.matchedConditions = [
            `Cultivable land registered in ${district}`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          const subsidyRate = landAcres <= 5.0 ? '90%' : '45% to 55%';
          scheme.whySuggested = `You cultivate land with a water source in ${district} and qualify for up to ${subsidyRate} micro-irrigation subsidy.`;
          scheme.matchedConditions = [
            `Verified irrigation water source (${profile.irrigationSource || 'Borewell / Source'}) on farmland`,
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
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `Raitha Siri is exclusively for Karnataka resident farmers. Your state is "${state}".`;
          scheme.alternativeScheme = 'Eligible for Central PM-KISAN Samman Nidhi and KCC.';
          scheme.matchedConditions = [];
        } else if (!growsMillets && !wantsMilletSupport) {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `Raitha Siri direct incentive of ₹10,000/ha is exclusively for farmers cultivating millets (Ragi, Jowar, Bajra, Navane, Same). Your selected crops are "${cropsArray.join(', ')}".`;
          scheme.alternativeScheme = growsHorticulture 
            ? 'Eligible for National Horticulture Mission and PMKSY.' 
            : 'Eligible for PM-KISAN, KCC, and PM Fasal Bima for your current crops.';
          scheme.whySuggested = 'Requires recognized dryland millet cultivation in Bele Darshak crop survey.';
          scheme.matchedConditions = [
            `Resident of Karnataka (${district}) with active farming`,
            `Farmer registered on Karnataka FRUITS portal (FID)`
          ];
        } else {
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.whySuggested = `You cultivate millets (${cropsArray.join(', ')}) in ${district}, Karnataka and qualify for ₹10,000/ha direct DBT.`;
          scheme.matchedConditions = [
            `Cultivating recognized dryland millets (${cropsArray.join(', ')})`,
            `Resident farmer of Karnataka with verified Bhoomi land records in ${district}`,
            fruitsRegistered
              ? `FRUITS ID (${profile.fruitsId || 'Linked'}) verified for direct ₹10,000/ha DBT incentive`
              : `FRUITS ID pending linkage (link authentic FID from fruits.karnataka.gov.in to receive direct ₹10,000/ha DBT)`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 5. Pradhan Mantri Fasal Bima Yojana (Crop Insurance)
      // ----------------------------------------------------
      case 'pm-fasal-bima': {
        scheme.status = 'upcoming';
        scheme.matchLabel = 'More information needed';
        scheme.matchLabelKn = 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ';
        scheme.badge = 'Seasonal Window';
        scheme.whySuggested = `You indicated interest in crop insurance for ${cropsArray.join(', ')} to protect against yield loss.`;
        scheme.matchedConditions = [
          `Insurable crop interest registered for ${cropsArray.join(', ')} in ${district}`,
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
        scheme.matchLabel = 'More information needed';
        scheme.matchLabelKn = 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ';
        scheme.badge = 'Batch Allocation';
        scheme.whySuggested = 'You expressed interest in farm machinery purchase subsidy or farm infrastructure.';
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
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `Ganga Kalyana is exclusively for Karnataka resident farmers.`;
          scheme.alternativeScheme = 'Apply for PM Krishi Sinchayee Yojana (PMKSY) micro-irrigation subsidy.';
          scheme.matchedConditions = [];
        } else if (isGeneral && !isMinority) {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `Ganga Kalyana Scheme provides free borewells and pump sets exclusively to SC, ST, and Backward Classes (Category 1, 2A, 2B) and Religious Minorities. Your profile is General category.`;
          scheme.alternativeScheme = 'Eligible for PM Krishi Sinchayee Yojana (PMKSY) offering up to 90% micro-irrigation subsidy for all communities.';
          scheme.whySuggested = 'Borewell support requested, but scheme requires SC/ST/OBC/Minority category certification.';
          scheme.matchedConditions = [
            `Small and marginal landholding criteria met (${landAcres} Acres)`
          ];
        } else if (landAcres > 5.0) {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `Ganga Kalyana is reserved for small & marginal farmers holding up to 5.0 Acres. Your reported landholding is ${landAcres} Acres.`;
          scheme.alternativeScheme = 'Eligible for Custom Hiring Centers and Krishi Yanthradhare machinery schemes.';
          scheme.matchedConditions = [
            `Eligible social category (${categoryDisplay}) under Karnataka Welfare Corporation guidelines`
          ];
        } else {
          // Qualified SC/ST/OBC/Minority small farmer in Karnataka!
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.whySuggested = `You belong to an eligible social category (${categoryDisplay}) in ${district} with dryland holding of ${landAcres} Acres.`;
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
      // 8. Custom Hiring Center (CHC) Scheme (Rental vs Establishment)
      // ----------------------------------------------------
      case 'custom-hiring': {
        const wantsToEstablish = followUps.machineryPreference === 'establish_chc' || profile.applicantType === 'FPO';
        
        if (wantsToEstablish) {
          if (landAcres >= 10.0 || profile.applicantType === 'FPO') {
            scheme.status = 'eligible';
            scheme.matchLabel = 'Potential match';
            scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
            scheme.reason = null;
            scheme.alternativeScheme = null;
            scheme.whySuggested = `You are an FPO/group or hold ${landAcres} Acres in ${district}, qualifying to establish a Custom Hiring Centre with up to ₹10 Lakhs subsidy.`;
            scheme.matchedConditions = [
              `Meets threshold for custom hiring center establishment (10+ Acres or FPO applicant)`,
              `Clear agricultural title in ${district} with operational access`,
              `Eligible for capital subsidy grant of up to ₹10 Lakhs for modern machinery bank`
            ];
          } else {
            scheme.status = 'not_eligible';
            scheme.matchLabel = 'Does not match published conditions';
            scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
            scheme.reason = `Establishing a Custom Hiring Centre requires a minimum of 10.0 continuous acres or registered Farmer Producer Organization (FPO) status. Your land holding is ${landAcres} Acres.`;
            scheme.alternativeScheme = 'You can rent implements from your nearest Raitha Samparka Kendra at 50% subsidized hourly rates.';
            scheme.whySuggested = 'Machinery center establishment requested, but requires 10+ acres or FPO registration.';
            scheme.matchedConditions = [
              `Active farmer in ${district}`
            ];
          }
        } else {
          // Machinery Rental: Open to ALL farmers with zero land threshold!
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.whySuggested = `You cultivate land in ${district} and can rent tractors, tillers, and harvesters from your hobli Raitha Samparka Kendra at 50% subsidized rates.`;
          scheme.matchedConditions = [
            `Cultivating land in ${district}, Karnataka`,
            `Eligible for 50% subsidized hourly equipment rental (no minimum land threshold for rental)`,
            `Access to hobli-level Raitha Samparka Kendra machinery hub`
          ];
        }
        break;
      }

      // ----------------------------------------------------
      // 9. National Horticulture Mission (NHM)
      // ----------------------------------------------------
      case 'national-horticulture': {
        if (growsHorticulture || wantsHorticulture) {
          scheme.status = 'eligible';
          scheme.matchLabel = 'Potential match';
          scheme.matchLabelKn = 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ';
          scheme.reason = null;
          scheme.alternativeScheme = null;
          scheme.whySuggested = `You indicated commercial horticulture cultivation or interest in greenhouse/polyhouse structures in ${district}.`;
          scheme.matchedConditions = [
            `Interest/cultivation of horticulture crops or protected cultivation`,
            `Cultivable landholding of ${landAcres} Acres registered in ${district}`,
            `Eligible for 50% capital subsidy on greenhouse/polyhouse erection and cold storage setup`
          ];
        } else {
          scheme.status = 'not_eligible';
          scheme.matchLabel = 'Does not match published conditions';
          scheme.matchLabelKn = 'ಷರತ್ತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ';
          scheme.reason = `National Horticulture Mission requires commercial horticulture cultivation (fruits, vegetables, flowers, or greenhouse crops). Your registered crops are "${cropsArray.join(', ')}".`;
          scheme.alternativeScheme = growsMillets 
            ? 'Eligible for Raitha Siri millet incentive (₹10,000/ha) and PM-KISAN.' 
            : 'Eligible for PM-KISAN, KCC, and PMKSY for your current cereal/commercial crop.';
          scheme.whySuggested = 'Requires commercial fruits, vegetables, flowers, or greenhouse cultivation.';
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
