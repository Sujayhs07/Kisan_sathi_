export const schemesData = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    title: 'PM-KISAN Samman Nidhi',
    shortDesc: 'Income support of ₹6,000 per year to eligible farmer families.',
    fullDesc: 'Direct income support of ₹6,000 per year provided in three equal installments of ₹2,000 every 4 months to landholding farmer families.',
    category: 'Income Support',
    status: 'eligible', // 'eligible' (Potential match) | 'upcoming' (More info needed) | 'not_eligible' (Does not match)
    matchLabel: 'Potential match',
    benefit: '₹6,00,0 per year (₹2,000 every 4 months)',
    benefitDetails: {
      type: 'Direct Benefit Transfer (DBT)',
      amount: '₹6,000 / year (₹2,000 × 3 installments)',
      limits: 'Maximum 1 benefit per farmer family (husband, wife, minor children)',
      disbursement: 'Directly into Aadhaar-seeded bank account'
    },
    whoCanApply: [
      'All landholding farmer families with cultivable land in their names',
      'Small and marginal landholders owning up to 2 Hectares (approx 5.0 Acres) prioritized',
      'Excludes institutional landholders, serving/retired government officials, and income-tax payers'
    ],
    locationCoverage: 'All rural and semi-urban agricultural districts across Karnataka and India',
    whySuggested: 'You indicated cultivable land ownership and are seeking income support.',
    whatNeedsChecking: [
      'Family member exclusion check (no other family member claiming PM-Kisan)',
      'Bhoomi RTC land ownership linkage with Aadhaar e-KYC',
      'Active NPCI bank account seeding for Direct Benefit Transfer'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Must have active mobile linked for OTP' },
      { name: 'Pahani / Bhoomi RTC Land Record', docKey: 'land_record', required: true, note: 'Latest RTC with survey number' },
      { name: 'Bank Account Passbook', docKey: 'bank_account', required: true, note: 'NPCI/DBT enabled account' },
      { name: 'FRUITS Farmer Registration Number (FID)', docKey: 'fruits_id', required: false, note: 'Auto-links with Karnataka DBT' }
    ],
    whenToApply: {
      status: 'Open Year-Round',
      deadline: 'Continuous open enrollment on pmkisan.gov.in',
      verified: true
    },
    howToApply: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or your nearest Grama One / CSC center.',
      'Click on "Farmer Corner" and select "New Farmer Registration".',
      'Enter your Aadhaar number, select State (Karnataka) and District.',
      'Verify details via OTP sent to your Aadhaar-linked mobile number.',
      'Provide Bhoomi RTC survey numbers, bank account details, and submit.'
    ],
    helpAndSupport: {
      tollFree: '155261 / 011-24300606',
      helpline: '1800-180-1551 (Kisan Call Centre)',
      office: 'Nearest Raitha Samparka Kendra (RSK) or Grama One Center',
      department: 'Department of Agriculture, Govt. of Karnataka & MoA&FW, GoI'
    },
    sourceAndFreshness: {
      officialUrl: 'https://pmkisan.gov.in',
      sourceName: 'Ministry of Agriculture & Farmers Welfare, GoI',
      lastVerified: 'November 2026'
    },
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
    ]
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    title: 'Kisan Credit Card (KCC)',
    shortDesc: 'Affordable crop loans and working capital credit at 4% subsidized interest.',
    fullDesc: 'Comprehensive credit card for crop cultivation, post-harvest expenses, and farm maintenance at an effective subsidized interest rate of 4% per annum upon prompt repayment.',
    category: 'Credit & Loan',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: 'Credit limit up to ₹3,00,000 at 4% interest rate (with prompt repayment)',
    benefitDetails: {
      type: 'Subsidized Short-Term Institutional Credit',
      amount: 'Up to ₹3,00,000 for crops; up to ₹2,00,000 for animal husbandry/dairy',
      limits: 'Collateral-free loan up to ₹1,60,000 (relaxed to ₹2,00,000 in RBI guidelines)',
      disbursement: 'KCC RuPay Debit Card or bank account credit'
    },
    whoCanApply: [
      'Owner cultivators, tenant farmers, oral lessees, and sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers',
      'Farmers engaged in crop production, horticulture, dairy, poultry, or fisheries'
    ],
    locationCoverage: 'All rural, semi-urban, and commercial bank branches across Karnataka',
    whySuggested: 'You cultivate crops and are looking for crop loan or agricultural credit.',
    whatNeedsChecking: [
      'Active Kisan Credit Card check (to avoid duplicate credit limits)',
      'Verification of current crop declaration against Pahani/Bele Darshak survey',
      'Bank branch KYC and satisfactory credit history (CIBIL check)'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card or Voter ID', docKey: 'aadhaar', required: true, note: 'Identity and address proof' },
      { name: 'Pahani / RTC Land Record or Lease Agreement', docKey: 'land_record', required: true, note: 'Proof of land under cultivation' },
      { name: 'Bank Account Details', docKey: 'bank_account', required: true, note: 'Account in issuing branch' },
      { name: 'Crop Sowing Declaration', docKey: 'crop_survey', required: true, note: 'Self-declaration of current/proposed crops' }
    ],
    whenToApply: {
      status: 'Open Year-Round',
      deadline: 'Available across all seasons prior to sowing/cultivation',
      verified: true
    },
    howToApply: [
      'Download the simplified 1-page KCC application form from your bank or myscheme.gov.in.',
      'Enter your land survey numbers, cultivated area, and planned crops.',
      'Attach copies of Aadhaar, RTC Pahani, and 2 passport photos.',
      'Submit to your nearest Nationalized Bank, Regional Rural Bank (Karnataka Gramin Bank), or Primary Agricultural Credit Society (PACS).'
    ],
    helpAndSupport: {
      tollFree: '1800-180-1551',
      helpline: 'State Level Bankers Committee (SLBC) Karnataka: 080-22955840',
      office: 'Nearest Lead Bank Office or Commercial / Gramin Bank Branch',
      department: 'Department of Financial Services & NABARD'
    },
    sourceAndFreshness: {
      officialUrl: 'https://myscheme.gov.in/schemes/kcc',
      sourceName: 'NABARD & Reserve Bank of India',
      lastVerified: 'November 2026'
    },
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
    ]
  },
  {
    id: 'pm-krishi-sinchayee',
    name: 'PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    title: 'PM Krishi Sinchayee Yojana (PMKSY)',
    shortDesc: 'Up to 90% subsidy for installing modern drip and sprinkler irrigation systems.',
    fullDesc: 'Micro-irrigation subsidy program promoting water-use efficiency through precision drip and sprinkler systems, with enhanced subsidies for small, marginal, and SC/ST farmers in Karnataka.',
    category: 'Irrigation',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: 'Up to 90% subsidy for SC/ST farmers; up to 75%-90% for Small & Marginal farmers',
    benefitDetails: {
      type: 'Capital Equipment Subsidy',
      amount: 'Up to 90% of equipment cost for small & marginal farmers in Karnataka',
      limits: 'Maximum coverage up to 5 Hectares (approx 12.5 Acres) per farmer beneficiary',
      disbursement: 'Direct benefit transfer or direct payment to approved empaneled manufacturer'
    },
    whoCanApply: [
      'Farmers possessing cultivable land with an assured water source (borewell, open well, canal, or farm pond)',
      'Owner cultivators or long-term leaseholders with registered agreement',
      'Farmers who have not availed micro-irrigation subsidy for the same survey number in the last 5 years'
    ],
    locationCoverage: 'All districts in Karnataka, with priority for water-stressed, drought-prone taluks',
    whySuggested: 'You have farm land and selected interest in drip or sprinkler micro-irrigation.',
    whatNeedsChecking: [
      'Physical verification of active water source on the survey plot',
      'Pre-installation site inspection and GPS coordinate mapping',
      'Verification of 5-year cooling period from previous irrigation subsidy'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity verification' },
      { name: 'Bhoomi RTC / Pahani', docKey: 'land_record', required: true, note: 'Current year land record' },
      { name: 'Water Source Certificate / Electricity Bill', docKey: 'crop_survey', required: true, note: 'Proof of borewell or open well' },
      { name: 'Caste Certificate (for SC/ST higher subsidy)', docKey: 'caste_cert', required: false, note: 'Enables 90% subsidy benefit' }
    ],
    whenToApply: {
      status: 'Open for Current Kharif/Rabi',
      deadline: 'Quarterly allocation batches through Department of Agriculture portal',
      verified: true
    },
    howToApply: [
      'Apply online on the Karnataka Agriculture portal (k-kisan.karnataka.gov.in) or visit your Taluk Assistant Director of Agriculture (ADA) office.',
      'Select your preferred government-empaneled drip/sprinkler manufacturer.',
      'Agriculture department engineer conducts pre-installation field survey.',
      'Pay beneficiary farmer share; equipment is installed and geo-tagged for subsidy release.'
    ],
    helpAndSupport: {
      tollFree: '1800-425-3553',
      helpline: 'Directorate of Agriculture Karnataka: 080-22212804',
      office: 'Taluk Raitha Samparka Kendra (RSK) / Assistant Director of Agriculture',
      department: 'Department of Agriculture, Government of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://pmksy.gov.in',
      sourceName: 'Department of Agriculture & Farmers Welfare, GoI & GoK',
      lastVerified: 'November 2026'
    },
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
    ]
  },
  {
    id: 'raitha-siri',
    name: 'Raitha Siri Scheme (Karnataka)',
    title: 'Raitha Siri Scheme (Karnataka)',
    shortDesc: 'Cash incentive of ₹10,000 per hectare for growing nutritious dryland millets.',
    fullDesc: 'State initiative to encourage sustainable cultivation of minor and major dryland millets (Ragi, Jowar, Bajra, Foxtail) with direct financial assistance of ₹10,000 per hectare.',
    category: 'Income Support',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: '₹10,000 per hectare (maximum 2 hectares = ₹20,000 direct cash assistance)',
    benefitDetails: {
      type: 'Crop-Specific Cash Incentive (DBT)',
      amount: '₹10,000 per hectare',
      limits: 'Maximum 2 hectares (5.0 Acres) per registered farmer',
      disbursement: 'Direct benefit transfer into Aadhaar-linked bank account'
    },
    whoCanApply: [
      'Farmers resident in Karnataka cultivating recognized millets (Ragi, Jowar, Bajra, Navane, Same, Haraka, Baragu, Korale)',
      'Cultivation must be recorded in the official Bele Darshak (Farmer Crop Survey)',
      'Registered on the Karnataka FRUITS portal with active FID'
    ],
    locationCoverage: 'All districts and dryland rainfed areas across Karnataka',
    whySuggested: 'You cultivate millets/food grains or selected interest in millet cultivation support.',
    whatNeedsChecking: [
      'Crop survey confirmation in Bele Darshak application for the current season',
      'FRUITS Farmer ID (FID) registration with validated RTC survey numbers',
      'Aadhaar bank account seeding for direct payment processing'
    ],
    requiredDocuments: [
      { name: 'FRUITS Farmer ID (FID)', docKey: 'fruits_id', required: true, note: 'Mandatory for all Karnataka DBT schemes' },
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity verification' },
      { name: 'Pahani / RTC Land Record', docKey: 'land_record', required: true, note: 'Shows ownership or cultivation' },
      { name: 'Bele Darshak Crop Survey Entry', docKey: 'crop_survey', required: true, note: 'Self-survey or supervisor survey entry' }
    ],
    whenToApply: {
      status: 'Open During Crop Survey Window',
      deadline: 'Kharif crop survey window: August - November',
      verified: true
    },
    howToApply: [
      'Ensure your crop survey is recorded using the Bele Darshak Mobile App or via the Village Crop Surveyor.',
      'Verify that your FRUITS ID (fruits.karnataka.gov.in) is active and mapped to your bank account.',
      'The Department of Agriculture validates crop survey entries and releases incentive directly to your bank account via DBT.'
    ],
    helpAndSupport: {
      tollFree: '080-22370281',
      helpline: 'Kisan Call Centre: 1800-180-1551',
      office: 'Local Raitha Samparka Kendra (RSK) Agricultural Officer',
      department: 'Department of Agriculture, Government of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://fruits.karnataka.gov.in',
      sourceName: 'Department of Agriculture, Government of Karnataka',
      lastVerified: 'November 2026'
    },
    matchedConditions: [
      'Farmer registered on FRUITS portal (FID verified)',
      'Crop survey recorded millet cultivation in current season',
      'Resident of Karnataka with active farming'
    ],
    documents: [
      { name: 'FRUITS Farmer ID (FID)', status: 'Ready' },
      { name: 'Aadhaar Card', status: 'Ready' },
      { name: 'Pahani / RTC', status: 'Ready' }
    ]
  },
  {
    id: 'pm-fasal-bima',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY / Samrakshane)',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    shortDesc: 'Comprehensive crop insurance against weather hazards, drought, and yield loss.',
    fullDesc: 'Low-premium crop insurance for food grains, oilseeds, and commercial crops with minimal farmer premium (1.5% to 2% for food crops, 5% for commercial/horticulture).',
    category: 'Crop Insurance',
    status: 'upcoming',
    matchLabel: 'More information needed',
    badge: 'Window Verified',
    expectedDate: 'Active Season Window',
    benefit: 'Full yield loss indemnity payout based on crop cutting experiments & weather triggers',
    benefitDetails: {
      type: 'Crop Loss Risk Insurance',
      amount: 'Sum insured based on Scale of Finance (₹25,000 to ₹65,000 per acre)',
      limits: 'Premium subsidized by Govt: Farmer pays only 1.5% - 2.0% for food grains',
      disbursement: 'Direct settlement into bank account through Samrakshane portal'
    },
    whoCanApply: [
      'All farmers cultivating notified crops in notified insurance units/hoblis',
      'Both loanee farmers (via KCC) and non-loanee farmers (via CSC/Samrakshane portal)',
      'Tenant farmers and sharecroppers cultivating notified crops'
    ],
    locationCoverage: 'All notified hoblis and taluks across Karnataka',
    whySuggested: 'You indicated interest in crop insurance to safeguard against climate risks.',
    whatNeedsChecking: [
      'Check if your specific hobli/village has notified your crop for the current season',
      'Verification of sowing date and crop cutting experiment threshold',
      'Timely enrollment before the seasonal cutoff deadline'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity verification' },
      { name: 'Pahani / RTC Land Record', docKey: 'land_record', required: true, note: 'With survey and hissa number' },
      { name: 'Bank Passbook Copy', docKey: 'bank_account', required: true, note: 'Account where claim will be deposited' },
      { name: 'Sowing Certificate / Bele Darshak Entry', docKey: 'crop_survey', required: true, note: 'Self or village accountant declaration' }
    ],
    whenToApply: {
      status: 'Seasonal Cutoff Window',
      deadline: 'Kharif cutoff: July 31; Rabi cutoff: November 30 / December 15',
      verified: true
    },
    howToApply: [
      'Visit the Karnataka Samrakshane portal (samrakshane.karnataka.gov.in) or nearest CSC / Grama One center.',
      'Enter your FRUITS ID or Aadhaar number and select your district, taluk, hobli, and village.',
      'Select the notified crop and cultivated acreage from your RTC.',
      'Pay the subsidized farmer premium (1.5% - 2%) and obtain your insurance policy receipt.'
    ],
    helpAndSupport: {
      tollFree: '1800-180-1551',
      helpline: 'Samrakshane Portal Karnataka Helpline: 080-22370281',
      office: 'Local Bank Branch / Raitha Samparka Kendra / Grama One',
      department: 'Department of Agriculture, GoK & Insurance Companies'
    },
    sourceAndFreshness: {
      officialUrl: 'https://samrakshane.karnataka.gov.in',
      sourceName: 'Samrakshane Portal, Government of Karnataka',
      lastVerified: 'November 2026'
    },
    reminderOn: false,
    matchedConditions: [
      'Farmer has insurable interest in notified crops',
      'Land records verifiable on Bhoomi'
    ]
  },
  {
    id: 'rkvy',
    name: 'Rashtriya Krishi Vikas Yojana (RKVY - Farm Mechanization)',
    title: 'Rashtriya Krishi Vikas Yojana',
    shortDesc: 'Subsidies on agricultural machinery, power tillers, tractors, and solar pumps.',
    fullDesc: 'Comprehensive scheme supporting farm mechanization, post-harvest equipment, power tillers, sprayers, and value addition infrastructure to reduce cultivation labor costs.',
    category: 'Infrastructure',
    status: 'upcoming',
    matchLabel: 'More information needed',
    badge: 'Batch Allocation',
    expectedDate: 'Annual Allocation Window',
    benefit: '40% to 50% capital subsidy on approved farm implements and tractors',
    benefitDetails: {
      type: 'Machinery Purchase Subsidy',
      amount: '50% subsidy up to ₹1,00,000 for SC/ST/Women/Small farmers; 40% for General',
      limits: 'One major agricultural machine per beneficiary farmer once in 3 years',
      disbursement: 'Subsidy deduction at source or credited upon physical verification'
    },
    whoCanApply: [
      'Individual farmers possessing cultivable agricultural land registered in Bhoomi',
      'Registered Farmer Producer Organizations (FPOs) and Self Help Groups (SHGs)',
      'Special reservations and higher subsidy rates for SC/ST, women, and marginal farmers'
    ],
    locationCoverage: 'All taluks and agricultural subdivisions across Karnataka',
    whySuggested: 'You expressed interest in farm machinery purchase or farm infrastructure.',
    whatNeedsChecking: [
      'Current taluk budget target and lottery/selection quota availability',
      'Cooling-off period verification (no machinery subsidy availed in last 3 years)',
      'Approval of chosen equipment model from empaneled manufacturers list'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity and residence proof' },
      { name: 'Pahani / RTC Record', docKey: 'land_record', required: true, note: 'Ownership verification' },
      { name: 'Bank Passbook', docKey: 'bank_account', required: true, note: 'Active bank account' },
      { name: 'Category Certificate (if SC/ST/OBC)', docKey: 'caste_cert', required: false, note: 'Enables 50% subsidy bracket' }
    ],
    whenToApply: {
      status: 'Seasonal Application Calling',
      deadline: 'Called annually by Department of Agriculture through K-Kisan portal',
      verified: true
    },
    howToApply: [
      'Register application on K-Kisan portal (k-kisan.karnataka.gov.in) when applications are announced.',
      'Select required machinery (e.g. power tiller, tractor implement, power sprayer).',
      'Submit quotation from approved dealer to Taluk Assistant Director of Agriculture.',
      'Upon selection and work order issuance, purchase machine and get it physically inspected for subsidy release.'
    ],
    helpAndSupport: {
      tollFree: '1800-425-3553',
      helpline: 'State Agricultural Mechanization Cell: 080-22212804',
      office: 'Assistant Director of Agriculture (ADA) Office at Taluk Headquarters',
      department: 'Department of Agriculture, Government of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://rkvy.nic.in',
      sourceName: 'Department of Agriculture, Government of Karnataka',
      lastVerified: 'November 2026'
    },
    reminderOn: false,
    matchedConditions: [
      'Registered farmer with valid RTC and Aadhaar',
      'No previous machinery subsidy availed in last 3 years'
    ]
  },
  {
    id: 'ganga-kalyana',
    name: 'Ganga Kalyana Scheme (Karnataka)',
    title: 'Ganga Kalyana Scheme',
    shortDesc: 'Free individual/community borewells with pumps and electrification for SC/ST/OBC.',
    fullDesc: 'Karnataka state welfare scheme providing complete free borewell drilling, pump installation, energization, and pipeline distribution for small and marginal farmers belonging to SC, ST, and backward classes.',
    category: 'Irrigation',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: 'Complete borewell setup, pump set, and power energization worth up to ₹4,00,000 at zero cost',
    benefitDetails: {
      type: '100% Free Irrigation Infrastructure Grant',
      amount: 'Up to ₹4,00,000 for individual borewells in specific taluks; ₹6,00,000 for community group wells',
      limits: 'One borewell grant per family; must possess contiguous cultivable land',
      disbursement: 'Government corporation directly drills, equips, and commissions the borewell'
    },
    whoCanApply: [
      'Small and marginal farmers belonging to SC, ST, or Backward Classes (Category 1, 2A, 2B)',
      'Annual family income must be within notified ceiling (typically below ₹2,00,000 in rural areas)',
      'Landholding of 1.0 to 5.0 Acres (individual) or group of 8 to 15 Acres with adjacent farmers'
    ],
    locationCoverage: 'All rural districts across Karnataka, administered via specialized State Development Corporations',
    whySuggested: 'You indicated need for borewell/water access and belong to an eligible social category.',
    whatNeedsChecking: [
      'Annual family income certificate verification by Revenue Department (Tahsildar)',
      'Valid RD-number caste and income certificate issued by Nadakacheri',
      'Groundwater clearance check by Department of Mines & Geology for safe drilling zone'
    ],
    requiredDocuments: [
      { name: 'Caste Certificate (with RD Number)', docKey: 'caste_cert', required: true, note: 'SC / ST / Category 1 / 2A / 2B' },
      { name: 'Income Certificate (with RD Number)', docKey: 'income_cert', required: true, note: 'Issued by Tahsildar within rural limit' },
      { name: 'Bhoomi RTC / Pahani', docKey: 'land_record', required: true, note: 'Showing ownership of land' },
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity verification' },
      { name: 'Small/Marginal Farmer Certificate', docKey: 'land_record', required: true, note: 'Issued by Revenue Inspector' }
    ],
    whenToApply: {
      status: 'Annual Notification Window',
      deadline: 'Announced annually on Seva Sindhu / Corporation portals (August - October)',
      verified: true
    },
    howToApply: [
      'Apply online on the Karnataka Seva Sindhu portal (sevasindhu.karnataka.gov.in) under the relevant corporation (Ambedkar / Valmiki / D. Devaraj Urs).',
      'Enter RD numbers of Caste and Income certificates for automated instant verification.',
      'Upload Bhoomi RTC land record and bank passbook.',
      'Taluk-level committee headed by local MLA shortlists and inspects eligible beneficiaries.'
    ],
    helpAndSupport: {
      tollFree: '080-22221357',
      helpline: 'Seva Sindhu Helpdesk: 080-22230282',
      office: 'District Manager Office: Dr. B.R. Ambedkar / Valmiki / D. Devaraj Urs Development Corporation',
      department: 'Social Welfare & Backward Classes Welfare Dept, Govt. of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://sevasindhu.karnataka.gov.in',
      sourceName: 'Social Welfare Department, Government of Karnataka',
      lastVerified: 'November 2026'
    },
    matchedConditions: [
      'Belongs to reserved social category (SC/ST/OBC)',
      'Possesses cultivable dryland in Karnataka',
      'Requires borewell or groundwater irrigation facility'
    ]
  },
  {
    id: 'custom-hiring',
    name: 'Custom Hiring Centre (CHC) Scheme',
    title: 'Custom Hiring Centre Sub-Mission',
    shortDesc: 'Affordable machinery rental services for farmers or up to ₹10 Lakhs subsidy to establish a rental centre.',
    fullDesc: 'Dual-benefit mechanization program: Farmers can rent heavy equipment (tractors, harvesters, rotavators) at 50% subsidized hourly rates, while farmer groups/entrepreneurs receive up to ₹10 Lakhs subsidy to establish a hiring centre.',
    category: 'Infrastructure',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: 'Subsidized tractor/machinery rental at Raitha Samparka Kendras OR up to ₹10 Lakhs grant for establishing CHC',
    benefitDetails: {
      type: 'Subsidized Service Rental / Capital Establishment Grant',
      amount: '50% subsidized hourly rental rates for farmers; up to ₹10 Lakhs (40-50%) for establishing center',
      limits: 'Subsidized hiring available per seasonal demand; centers established by FPOs/PACs/Entrepreneurs',
      disbursement: 'Direct service discount at RSK or direct subsidy transfer to center bank account'
    },
    whoCanApply: [
      'For Machinery Rental: ALL farmers (small, marginal, large, and tenant farmers) are eligible to rent machinery',
      'For Establishing a CHC: Farmer Producer Organizations (FPOs), PACS, registered farmer groups, and rural youth entrepreneurs',
      'Must be located in agricultural command area with verified demand'
    ],
    locationCoverage: 'Operates through Raitha Samparka Kendras (RSK) in every hobli of Karnataka',
    whySuggested: 'You indicated a need for machinery rental or establishing farm mechanization services.',
    whatNeedsChecking: [
      'Rental intent: Check machinery availability at your local hobli Raitha Samparka Kendra',
      'Establishment intent: Requires formal project report, FPO/group registration, and bank tie-up'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity verification' },
      { name: 'Bhoomi RTC / Pahani', docKey: 'land_record', required: true, note: 'Proof of land being cultivated' },
      { name: 'FRUITS Farmer ID (FID)', docKey: 'fruits_id', required: false, note: 'Enables instant booking discount' }
    ],
    whenToApply: {
      status: 'Open Year-Round for Rental',
      deadline: 'Rental booking open before and during peak tilling and harvesting seasons',
      verified: true
    },
    howToApply: [
      'To rent machinery: Visit your local Raitha Samparka Kendra (RSK) or book via the K-Kisan CHC mobile app.',
      'Specify the required equipment (e.g. tractor with cultivator, power tiller, combine harvester) and booking dates.',
      'Pay the subsidized hourly rate; machinery is dispatched with trained operator to your field.'
    ],
    helpAndSupport: {
      tollFree: '1800-425-3553',
      helpline: 'Karnataka Farm Mechanization Directorate: 080-22212804',
      office: 'Local Hobli Raitha Samparka Kendra (RSK) Agricultural Officer',
      department: 'Department of Agriculture, Government of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://agrimachinery.nic.in',
      sourceName: 'Sub-Mission on Agricultural Mechanization (SMAM) & GoK',
      lastVerified: 'November 2026'
    },
    matchedConditions: [
      'Cultivates agricultural land in Karnataka',
      'Requires farm mechanization support or rental access'
    ]
  },
  {
    id: 'national-horticulture',
    name: 'National Horticulture Mission (NHM - Karnataka)',
    title: 'National Horticulture Mission (NHM)',
    shortDesc: '50% subsidy for polyhouses, shade nets, high-density fruit orchards, and packhouses.',
    fullDesc: 'Comprehensive mission providing 50% capital subsidies for establishing commercial polyhouses, shade net structures, high-density orchards (mango, pomegranate, banana), and post-harvest cold storage.',
    category: 'Infrastructure',
    status: 'eligible',
    matchLabel: 'Potential match',
    benefit: '50% subsidy on greenhouse/polyhouse construction (approx ₹5.0 Lakhs - ₹15.0 Lakhs subsidy)',
    benefitDetails: {
      type: 'Protected Cultivation & Infrastructure Capital Subsidy',
      amount: '50% of cost norm for greenhouse, shade nets, and orchard planting material',
      limits: 'Covered up to 4,000 sq. meters per farmer beneficiary',
      disbursement: 'Released directly upon completion and GPS physical audit'
    },
    whoCanApply: [
      'Farmers owning agricultural land with clear title and perennial water source',
      'Engaged in or transitioning into commercial fruits, vegetables, flowers, or medicinal plantation crops',
      'Individual farmers, cooperatives, and registered FPOs'
    ],
    locationCoverage: 'All notified horticulture districts across Karnataka',
    whySuggested: 'You cultivate horticulture crops or selected interest in greenhouse/polyhouse support.',
    whatNeedsChecking: [
      'Soil and water quality test report suitable for protected horticulture',
      'Pre-sanction approval from District Horticulture Society prior to construction',
      'Detailed project estimate prepared by empaneled structural engineer'
    ],
    requiredDocuments: [
      { name: 'Aadhaar Card', docKey: 'aadhaar', required: true, note: 'Identity proof' },
      { name: 'Pahani / RTC Record', docKey: 'land_record', required: true, note: 'Showing clear land title' },
      { name: 'Water & Soil Test Report', docKey: 'crop_survey', required: true, note: 'From government horticulture laboratory' },
      { name: 'Detailed Project Report (DPR)', docKey: 'crop_survey', required: false, note: 'For commercial polyhouses > 1000 sqm' }
    ],
    whenToApply: {
      status: 'Open on Horticulture Portal',
      deadline: 'Applications accepted on K-Horticulture portal prior to seasonal planting',
      verified: true
    },
    howToApply: [
      'Visit the Karnataka Horticulture portal or your District Senior Assistant Director of Horticulture (SADH) office.',
      'Submit online application with survey number, proposed crop, and structure layout.',
      'Horticulture department issues administrative approval.',
      'Construct structure through approved agency and submit completion report for subsidy inspection.'
    ],
    helpAndSupport: {
      tollFree: '1800-425-3553',
      helpline: 'Directorate of Horticulture Karnataka (Lalbagh): 080-26571925',
      office: 'Senior Assistant Director of Horticulture (SADH) at Taluk Office',
      department: 'Department of Horticulture, Government of Karnataka'
    },
    sourceAndFreshness: {
      officialUrl: 'https://horticulturedir.karnataka.gov.in',
      sourceName: 'Department of Horticulture, Government of Karnataka',
      lastVerified: 'November 2026'
    },
    matchedConditions: [
      'Owns cultivable land in Karnataka',
      'Interested in high-value horticulture or protected cultivation'
    ]
  }
];

export const userProfileData = {
  name: 'Farmer',
  mobile: '',
  dob: null,
  age: null,
  gender: null,
  category: 'General',
  district: 'Bengaluru Rural',
  taluk: 'Hoskote',
  state: 'Karnataka',
  landHolding: '2.0',
  landType: 'Marginal (< 2.5 Acres)',
  cropType: 'Ragi & Vegetables',
  irrigation: 'Rainfed & Borewell',
  fruitsId: null,
  fruitsRegistered: false,
  aadhaarStatus: 'Available'
};
