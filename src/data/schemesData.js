export const schemesData = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    title: 'PM-KISAN Samman Nidhi',
    shortDesc: 'Income support of ₹6,000 per year to eligible farmer families.',
    fullDesc: 'Income support of ₹6,000 per year to eligible farmer families (₹2,000 every 4 months).',
    category: 'Income Support',
    status: 'eligible', // 'eligible' | 'upcoming' | 'not_eligible'
    benefit: '₹6,000 per year (₹2,000 every 4 months)',
    targetGroup: 'Small and marginal farmers',
    applicationMode: 'Online (Official Portal)',
    officialUrl: 'https://pmkisan.gov.in',
    matchedConditions: [
      'Land holding under 2 Hectares (5 Acres)',
      'Active land ownership in Bhoomi Karnataka',
      'Aadhaar seeded bank account with DBT enabled'
    ],
    documents: [
      { name: 'Aadhaar Card', status: 'Ready' },
      { name: 'Pahani / RTC Land Record', status: 'Ready' },
      { name: 'Bank Passbook (NPCI Active)', status: 'Ready' },
      { name: 'Mobile Number linked to Aadhaar', status: 'Ready' }
    ],
    howToApply: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit nearest Grama One / CSC center.',
      'Click on "Farmer Corner" and select "New Farmer Registration".',
      'Enter Aadhaar number, state (Karnataka), and district.',
      'Verify details with OTP sent to Aadhaar-linked mobile.',
      'Upload Bhoomi RTC land record and submit application.'
    ]
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    title: 'Kisan Credit Card (KCC)',
    shortDesc: 'Easy and affordable credit for farming and allied activities.',
    fullDesc: 'Short term loans for crops and farming at a highly concessional interest rate of 4% with prompt repayment.',
    category: 'Credit & Loan',
    status: 'eligible',
    benefit: 'Credit limit up to ₹3,00,000 at 4% subsidized interest rate',
    targetGroup: 'All farmers, owner cultivators & tenant farmers',
    applicationMode: 'Bank Branch / Online Portal',
    officialUrl: 'https://myscheme.gov.in/schemes/kcc',
    matchedConditions: [
      'Engaged in active cultivation of crops',
      'Clear title deed / land record available',
      'Eligible credit score and KYC verification'
    ],
    documents: [
      { name: 'Aadhaar Card', status: 'Ready' },
      { name: 'Pahani / RTC Record', status: 'Ready' },
      { name: '2 Passport size photographs', status: 'Ready' },
      { name: 'Crop declaration certificate', status: 'Ready' }
    ],
    howToApply: [
      'Download the 1-page KCC application form from your bank or PM-Kisan portal.',
      'Fill in land survey number, crop sown, and loan limit required.',
      'Attach copy of Aadhaar and current season Pahani / RTC.',
      'Submit to nearest nationalized bank or cooperative bank branch.'
    ]
  },
  {
    id: 'pm-krishi-sinchayee',
    name: 'PM Krishi Sinchayee Yojana (PMKSY)',
    title: 'PM Krishi Sinchayee Yojana (PMKSY)',
    shortDesc: 'Micro-irrigation subsidy for drip and sprinkler units.',
    fullDesc: 'Financial assistance of up to 90% subsidy for installing modern drip and sprinkler irrigation systems.',
    category: 'Irrigation',
    status: 'eligible',
    benefit: 'Up to 90% subsidy for small/marginal farmers',
    targetGroup: 'Small and marginal farmers with irrigation source',
    applicationMode: 'Online (K-Kisan Karnataka)',
    officialUrl: 'https://pmksy.gov.in',
    matchedConditions: [
      'Available borewell/open well on agricultural land',
      'Cultivable land registered under applicant name',
      'Has not availed micro-irrigation subsidy in last 5 years'
    ],
    documents: [
      { name: 'Aadhaar Card', status: 'Ready' },
      { name: 'RTC / Pahani', status: 'Ready' },
      { name: 'Borewell / Water source certificate', status: 'Ready' },
      { name: 'Bank Passbook', status: 'Ready' }
    ],
    howToApply: [
      'Apply online on K-Kisan or visit your Taluk Assistant Director of Agriculture (ADA) office.',
      'Submit farm inspection request for micro-irrigation installation.',
      'Select approved vendor from government empaneled list.',
      'Subsidy is released directly to dealer / farmer account upon geo-tagging.'
    ]
  },
  {
    id: 'raitha-siri',
    name: 'Raitha Siri Scheme (Karnataka)',
    title: 'Raitha Siri Scheme (Karnataka)',
    shortDesc: 'Financial incentive of ₹10,000 per hectare for millet growers.',
    fullDesc: 'Direct benefit transfer of ₹10,000 per hectare to encourage cultivation of dryland millets like Ragi, Jowar, and Bajra.',
    category: 'Income Support',
    status: 'eligible',
    benefit: '₹10,000 per hectare (max 2 hectares = ₹20,000)',
    targetGroup: 'Dryland farmers cultivating recognized millets',
    applicationMode: 'Raitha Samparka Kendra / FRUITS Portal',
    officialUrl: 'https://fruits.karnataka.gov.in',
    matchedConditions: [
      'Farmer registered on FRUITS portal (FID verified)',
      'Crop survey recorded millet cultivation in current Kharif',
      'Resident of Karnataka with active farming'
    ],
    documents: [
      { name: 'FRUITS Farmer ID (FID)', status: 'Ready' },
      { name: 'Aadhaar Card', status: 'Ready' },
      { name: 'Pahani / RTC', status: 'Ready' }
    ],
    howToApply: [
      'Ensure your crop is recorded as Millet in Karnataka Bele Darshak / Crop Survey.',
      'Verify FRUITS ID is linked to your bank account.',
      'Incentive is disbursed automatically via DBT after crop survey verification.'
    ]
  },
  {
    id: 'pm-fasal-bima',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    shortDesc: 'Crop insurance against natural disasters.',
    fullDesc: 'Comprehensive risk insurance coverage from pre-sowing to post-harvest against weather extremities.',
    category: 'Crop Insurance',
    status: 'upcoming',
    badge: 'Opens Soon',
    expectedDate: 'Nov 2026',
    benefit: 'Full insurance payout based on yield loss assessment',
    targetGroup: 'Farmers cultivating notified food and commercial crops',
    applicationMode: 'Samrakshane Portal (Karnataka)',
    officialUrl: 'https://pmfby.gov.in',
    reminderOn: true,
    matchedConditions: [
      'Farmer has insurable interest in notified crops',
      'Land records verifiable on Bhoomi'
    ]
  },
  {
    id: 'rkvy',
    name: 'Rashtriya Krishi Vikas Yojana',
    title: 'Rashtriya Krishi Vikas Yojana',
    shortDesc: 'Support for farm mechanization and infrastructure.',
    fullDesc: 'Subsidies on farm power machinery, power tillers, tractors, and solar pumps for agricultural activities.',
    category: 'Infrastructure',
    status: 'upcoming',
    badge: 'Not Open',
    expectedDate: 'Dec 2026',
    benefit: '50% subsidy on farm implements and equipment',
    targetGroup: 'Individual farmers and registered FPOs',
    applicationMode: 'RSK / Agriculture Department',
    officialUrl: 'https://rkvy.nic.in',
    reminderOn: true,
    matchedConditions: [
      'Registered farmer with valid RTC and Aadhaar',
      'No previous machinery subsidy availed in last 3 years'
    ]
  },
  {
    id: 'ganga-kalyana',
    name: 'Ganga Kalyana Scheme',
    title: 'Ganga Kalyana Scheme',
    shortDesc: 'Free individual/community borewells for small & marginal farmers.',
    fullDesc: 'State scheme providing free borewell drilling, casing, pump installation, and electrification.',
    category: 'Irrigation',
    status: 'not_eligible',
    benefit: 'Free complete borewell setup worth up to ₹4,00,000',
    targetGroup: 'SC / ST and Backward Classes (Category 1, 2A, 2B) small farmers',
    reason: 'Reserved for SC/ST and Category 1/2A/2B with annual family income below ₹50,000. Your profile is General category.',
    alternativeScheme: 'Eligible for PM Krishi Sinchayee Yojana (PMKSY) offering up to 90% drip/sprinkler subsidy.'
  },
  {
    id: 'custom-hiring',
    name: 'Custom Hiring Center Sub-Mission',
    title: 'Custom Hiring Center Sub-Mission',
    shortDesc: 'Heavy agricultural machinery hubs subsidy.',
    fullDesc: 'Grant support for purchasing heavy commercial machinery suites for custom hiring service centers.',
    category: 'Infrastructure',
    status: 'not_eligible',
    benefit: 'Up to ₹10 Lakhs subsidy for center establishment',
    targetGroup: 'Entrepreneurs, FPOs, and farmers with minimum 10 acres land',
    reason: 'Requires minimum 10 acres continuous landholding or registered FPO status.',
    alternativeScheme: 'You can rent implements from your nearest Raitha Samparka Kendra at 50% subsidized hourly rates.'
  },
  {
    id: 'national-horticulture',
    name: 'National Horticulture Mission (NHM)',
    title: 'National Horticulture Mission (NHM)',
    shortDesc: 'Protected greenhouse and polyhouse cultivation subsidy.',
    fullDesc: 'Financial support for establishing high-tech green houses, poly houses, and cold chain storage for fruits and vegetables.',
    category: 'Infrastructure',
    status: 'not_eligible',
    benefit: '50% capital subsidy on greenhouse construction',
    targetGroup: 'Farmers committed to commercial horticulture production',
    reason: 'Primary crop registered is Cereals/Grains rather than certified commercial horticulture.',
    alternativeScheme: 'Eligible for PM-KISAN, KCC, and PMKSY for your current cereal crops.'
  }
];

export const userProfileData = {
  name: 'Sujay H S',
  mobile: '+91 98765 43210',
  dob: '25 Aug 2004',
  age: 25,
  gender: 'Male',
  category: 'General',
  district: 'Bengaluru Rural',
  taluk: 'Hoskote',
  state: 'Karnataka',
  landHolding: '2.0 Acres',
  landType: 'Marginal (< 2.5 Acres)',
  cropType: 'Ragi & Vegetables',
  irrigation: 'Rainfed & Borewell',
  fruitsId: 'FID-KA-2024-88392',
  aadhaarStatus: 'Linked & Active'
};
