// ─── TrustChain Multilingual System ───
export type LangCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'gu' | 'zh' | 'de';

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English',  native: 'English' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi',  native: 'मराठी' },
  { code: 'ta', label: 'Tamil',    native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',   native: 'తెలుగు' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'zh', label: 'Chinese',  native: '中文' },
  { code: 'de', label: 'German',   native: 'Deutsch' },
];

type TranslationKeys = {
  // Landing
  liveRealTime: string;
  tagline: string;
  tagline2: string;
  ngoDashboard: string;
  ngoDesc: string;
  donorPortal: string;
  donorDesc: string;
  adminConsole: string;
  adminDesc: string;
  openPortal: string;
  syncFooter: string;
  // Nav
  browseDrives: string;
  rankings: string;
  myProfile: string;
  dashboard: string;
  newDrive: string;
  submitProof: string;
  approvalQueue: string;
  auditTrail: string;
  live: string;
  // Donor
  activeCampaigns: string;
  drivesOpen: string;
  donorRankings: string;
  rankingsDesc: string;
  allStates: string;
  allCities: string;
  rank: string;
  donor: string;
  location: string;
  totalImpact: string;
  verifiedDonor: string;
  silverImpact: string;
  myGlobalRank: string;
  lifetimeImpact: string;
  drivesFunded: string;
  memberSince: string;
  recentDonations: string;
  fundMilestone: string;
  funding: string;
  required: string;
  yourName: string;
  amount: string;
  confirmDonation: string;
  cancel: string;
  thanksDonation: string;
  verified: string;
  fund: string;
  beneficiaries: string;
  milestones: string;
  amountRaised: string;
  goal: string;
  completion: string;
  problemStatement: string;
  milestonesTransparency: string;
  proofVerified: string;
  // NGO
  totalRaised: string;
  fundsCredited: string;
  pendingApprovals: string;
  activeDrives: string;
  myDonationDrives: string;
  // Admin
  releaseAmount: string;
  submittedProof: string;
  verificationAction: string;
  reviewProof: string;
  releaseFunds: string;
  rejectSubmission: string;
  fundsApproved: string;
  rejected: string;
  fundsCreditedNgo: string;
  milestoneRejected: string;
  globalLedger: string;
  ledgerDesc: string;
  totalFundsReleased: string;
  timestamp: string;
  action: string;
  detailsContext: string;
  fundImpact: string;
  fundReleased: string;
  noAuditRecords: string;
  // Tax / Profile
  taxSavingTitle: string;
  taxSavingDesc: string;
  totalEligible: string;
  estimatedDeduction: string;
  eligibleDonations: string;
  downloadAllReceipts: string;
  downloadFYReport: string;
  downloadPdf: string;
  donationCertificates: string;
  language: string;
  // Ratings & Reviews
  rateNgo: string;
  starRating: string;
  writeReview: string;
  submitReview: string;
  reviews: string;
  noReviews: string;
  averageRating: string;
  // WhatsApp
  connectWhatsApp: string;
  whatsappMessage: string;
  // Admin Limits
  setDriveLimit: string;
  maxLimit: string;
  saveLimit: string;
  limitUpdated: string;
  ngoManagement: string;
};

const translations: Record<LangCode, TranslationKeys> = {
  en: {
    liveRealTime: 'Live Real-Time Platform',
    tagline: 'Transparent donation platform with milestone-based fund release.',
    tagline2: 'Every rupee is tracked. Every milestone is verified.',
    ngoDashboard: 'NGO Dashboard',
    ngoDesc: 'Create donation drives, add milestones, upload proof, and manage your impact.',
    donorPortal: 'Donor Portal',
    donorDesc: 'Browse drives, fund milestones, and see verified proof of every rupee spent.',
    adminConsole: 'Admin Console',
    adminDesc: 'Verify NGO proof, approve funds, and maintain full governance of the platform.',
    openPortal: 'Open Portal →',
    syncFooter: 'All dashboards sync in real time via Supabase Realtime',
    browseDrives: 'Browse Drives',
    rankings: 'Rankings',
    myProfile: 'My Profile',
    dashboard: 'Dashboard',
    newDrive: 'New Drive',
    submitProof: 'Submit Proof',
    approvalQueue: 'Approval Queue',
    auditTrail: 'Audit Trail',
    live: 'Live',
    activeCampaigns: 'Active Campaigns',
    drivesOpen: 'drives open',
    donorRankings: 'Donor Rankings',
    rankingsDesc: 'See how donors are making an impact across India.',
    allStates: 'All States',
    allCities: 'All Cities',
    rank: 'Rank',
    donor: 'Donor',
    location: 'Location',
    totalImpact: 'Total Impact',
    verifiedDonor: '✓ Verified Donor',
    silverImpact: 'Silver Impact',
    myGlobalRank: 'My Global Rank',
    lifetimeImpact: 'Lifetime Impact',
    drivesFunded: 'Drives Funded',
    memberSince: 'Member Since',
    recentDonations: 'Recent Donations',
    fundMilestone: 'Fund Milestone',
    funding: 'You are funding',
    required: 'Required',
    yourName: 'Your Name',
    amount: 'Amount (₹)',
    confirmDonation: 'Confirm Donation',
    cancel: 'Cancel',
    thanksDonation: 'Thanks for your donation 💖',
    verified: '✓ Verified',
    fund: 'Fund',
    beneficiaries: 'beneficiaries',
    milestones: 'milestones',
    amountRaised: 'Amount Raised',
    goal: 'Goal',
    completion: 'Completion',
    problemStatement: 'PROBLEM STATEMENT',
    milestonesTransparency: 'Milestones & Transparency',
    proofVerified: '✅ Proof verified by Admin — funds released to NGO',
    totalRaised: 'Total Raised',
    fundsCredited: 'Funds Credited',
    pendingApprovals: 'Pending Approvals',
    activeDrives: 'Active Drives',
    myDonationDrives: 'My Donation Drives',
    releaseAmount: 'Amount to Release',
    submittedProof: 'Submitted Proof',
    verificationAction: 'Verification Action',
    reviewProof: 'Review all proof carefully before approving fund release.',
    releaseFunds: 'Release Funds 💸',
    rejectSubmission: '✕ Reject Submission',
    fundsApproved: 'FUNDS APPROVED',
    rejected: 'REJECTED',
    fundsCreditedNgo: 'Funds have been credited to the NGO.',
    milestoneRejected: 'Milestone has been rejected.',
    globalLedger: 'Global Governance Ledger',
    ledgerDesc: 'Immutable record of all fund releases and governance actions.',
    totalFundsReleased: 'Total Funds Released',
    timestamp: 'Timestamp',
    action: 'Action',
    detailsContext: 'Details & Proof Context',
    fundImpact: 'Fund Impact',
    fundReleased: 'FUND RELEASED',
    noAuditRecords: 'No audit records found in the governance ledger.',
    taxSavingTitle: 'Tax Saving & Donation Certificates',
    taxSavingDesc: 'Download 80G tax receipts for your donations.',
    totalEligible: 'Total Eligible Donations (FY)',
    estimatedDeduction: 'Estimated Tax Deduction',
    eligibleDonations: '80G Eligible Donations',
    downloadAllReceipts: 'Download All Receipts',
    downloadFYReport: 'Download FY Tax Report',
    downloadPdf: 'Download PDF',
    donationCertificates: 'Donation Certificates',
    language: 'Language',
    rateNgo: 'Rate NGO',
    starRating: 'Star Rating',
    writeReview: 'Write a Review',
    submitReview: 'Submit Review',
    reviews: 'Reviews',
    noReviews: 'No reviews yet.',
    averageRating: 'Average Rating',
    connectWhatsApp: 'Connect on WhatsApp',
    whatsappMessage: 'Hello! I am interested in supporting your NGO on TrustChain.',
    setDriveLimit: 'Set Drive Limit',
    maxLimit: 'Max Donation Limit (₹)',
    saveLimit: 'Save Limit',
    limitUpdated: 'Limit updated successfully!',
    ngoManagement: 'NGO Management',
  },
  hi: {
    liveRealTime: 'लाइव रीयल-टाइम प्लेटफ़ॉर्म',
    tagline: 'माइलस्टोन-आधारित फंड रिलीज़ के साथ पारदर्शी दान प्लेटफ़ॉर्म।',
    tagline2: 'हर रुपए को ट्रैक किया जाता है। हर माइलस्टोन सत्यापित है।',
    ngoDashboard: 'एनजीओ डैशबोर्ड',
    ngoDesc: 'दान अभियान बनाएं, माइलस्टोन जोड़ें, प्रमाण अपलोड करें।',
    donorPortal: 'दाता पोर्टल',
    donorDesc: 'अभियान ब्राउज़ करें, माइलस्टोन फंड करें, सत्यापित प्रमाण देखें।',
    adminConsole: 'एडमिन कंसोल',
    adminDesc: 'एनजीओ प्रमाण सत्यापित करें, फंड स्वीकृत करें।',
    openPortal: 'पोर्टल खोलें →',
    syncFooter: 'सभी डैशबोर्ड रीयल-टाइम में सिंक होते हैं',
    browseDrives: 'अभियान देखें',
    rankings: 'रैंकिंग',
    myProfile: 'मेरी प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    newDrive: 'नया अभियान',
    submitProof: 'प्रमाण जमा करें',
    approvalQueue: 'अनुमोदन कतार',
    auditTrail: 'ऑडिट ट्रेल',
    live: 'लाइव',
    activeCampaigns: 'सक्रिय अभियान',
    drivesOpen: 'अभियान खुले हैं',
    donorRankings: 'दाता रैंकिंग',
    rankingsDesc: 'देखें कि दाता कैसे प्रभाव डाल रहे हैं।',
    allStates: 'सभी राज्य',
    allCities: 'सभी शहर',
    rank: 'रैंक',
    donor: 'दाता',
    location: 'स्थान',
    totalImpact: 'कुल प्रभाव',
    verifiedDonor: '✓ सत्यापित दाता',
    silverImpact: 'सिल्वर प्रभाव',
    myGlobalRank: 'मेरी वैश्विक रैंक',
    lifetimeImpact: 'जीवनकाल प्रभाव',
    drivesFunded: 'फंड किए अभियान',
    memberSince: 'सदस्य तब से',
    recentDonations: 'हालिया दान',
    fundMilestone: 'माइलस्टोन फंड करें',
    funding: 'आप फंड कर रहे हैं',
    required: 'आवश्यक',
    yourName: 'आपका नाम',
    amount: 'राशि (₹)',
    confirmDonation: 'दान की पुष्टि करें',
    cancel: 'रद्द करें',
    thanksDonation: 'आपके दान के लिए धन्यवाद 💖',
    verified: '✓ सत्यापित',
    fund: 'फंड करें',
    beneficiaries: 'लाभार्थी',
    milestones: 'माइलस्टोन',
    amountRaised: 'जुटाई गई राशि',
    goal: 'लक्ष्य',
    completion: 'पूर्णता',
    problemStatement: 'समस्या विवरण',
    milestonesTransparency: 'माइलस्टोन और पारदर्शिता',
    proofVerified: '✅ प्रमाण सत्यापित — फंड एनजीओ को जारी',
    totalRaised: 'कुल जुटाया',
    fundsCredited: 'फंड जमा',
    pendingApprovals: 'लंबित अनुमोदन',
    activeDrives: 'सक्रिय अभियान',
    myDonationDrives: 'मेरे दान अभियान',
    releaseAmount: 'जारी करने की राशि',
    submittedProof: 'जमा किए गए प्रमाण',
    verificationAction: 'सत्यापन कार्रवाई',
    reviewProof: 'फंड स्वीकृत करने से पहले सभी प्रमाण ध्यान से देखें।',
    releaseFunds: 'फंड जारी करें 💸',
    rejectSubmission: '✕ अस्वीकार करें',
    fundsApproved: 'फंड स्वीकृत',
    rejected: 'अस्वीकृत',
    fundsCreditedNgo: 'फंड एनजीओ को जमा कर दिए गए हैं।',
    milestoneRejected: 'माइलस्टोन अस्वीकृत किया गया है।',
    globalLedger: 'वैश्विक शासन बहीखाता',
    ledgerDesc: 'सभी फंड रिलीज़ और शासन कार्यों का अपरिवर्तनीय रिकॉर्ड।',
    totalFundsReleased: 'कुल जारी फंड',
    timestamp: 'समय',
    action: 'कार्रवाई',
    detailsContext: 'विवरण और संदर्भ',
    fundImpact: 'फंड प्रभाव',
    fundReleased: 'फंड जारी',
    noAuditRecords: 'शासन बहीखाते में कोई रिकॉर्ड नहीं मिला।',
    taxSavingTitle: 'कर बचत और दान प्रमाणपत्र',
    taxSavingDesc: 'अपने दान के लिए 80G कर रसीदें डाउनलोड करें।',
    totalEligible: 'कुल पात्र दान (वित्तीय वर्ष)',
    estimatedDeduction: 'अनुमानित कर कटौती',
    eligibleDonations: '80G पात्र दान',
    downloadAllReceipts: 'सभी रसीदें डाउनलोड करें',
    downloadFYReport: 'वित्तीय वर्ष कर रिपोर्ट डाउनलोड करें',
    downloadPdf: 'PDF डाउनलोड करें',
    donationCertificates: 'दान प्रमाणपत्र',
    language: 'भाषा',
    rateNgo: 'एनजीओ को रेट करें',
    starRating: 'स्टार रेटिंग',
    writeReview: 'एक समीक्षा लिखें',
    submitReview: 'समीक्षा जमा करें',
    reviews: 'समीक्षाएं',
    noReviews: 'अभी तक कोई समीक्षा नहीं।',
    averageRating: 'औसत रेटिंग',
    connectWhatsApp: 'व्हाट्सएप पर कनेक्ट करें',
    whatsappMessage: 'नमस्ते! मुझे ट्रस्टचैन पर आपके एनजीओ का समर्थन करने में रुचि है।',
    setDriveLimit: 'ड्राइव सीमा निर्धारित करें',
    maxLimit: 'अधिकतम दान सीमा (₹)',
    saveLimit: 'सीमा सहेजें',
    limitUpdated: 'सीमा सफलतापूर्वक अपडेट की गई!',
    ngoManagement: 'एनजीओ प्रबंधन',
  },
  mr: {
    liveRealTime: 'लाइव्ह रिअल-टाइम प्लॅटफॉर्म', tagline: 'माइलस्टोन-आधारित फंड रिलीझसह पारदर्शक दान प्लॅटफॉर्म.', tagline2: 'प्रत्येक रुपयाचा मागोवा घेतला जातो.', ngoDashboard: 'एनजीओ डॅशबोर्ड', ngoDesc: 'दान मोहिमा तयार करा, माइलस्टोन जोडा, पुरावे अपलोड करा.', donorPortal: 'दाता पोर्टल', donorDesc: 'मोहिमा ब्राउझ करा, माइलस्टोन फंड करा.', adminConsole: 'अॅडमिन कन्सोल', adminDesc: 'एनजीओ पुरावे सत्यापित करा, फंड मंजूर करा.', openPortal: 'पोर्टल उघडा →', syncFooter: 'सर्व डॅशबोर्ड रिअल-टाइममध्ये सिंक होतात', browseDrives: 'मोहिमा पहा', rankings: 'रँकिंग', myProfile: 'माझे प्रोफाइल', dashboard: 'डॅशबोर्ड', newDrive: 'नवीन मोहीम', submitProof: 'पुरावे सादर करा', approvalQueue: 'मंजुरी रांग', auditTrail: 'ऑडिट ट्रेल', live: 'लाइव्ह', activeCampaigns: 'सक्रिय मोहिमा', drivesOpen: 'मोहिमा सुरू', donorRankings: 'दाता रँकिंग', rankingsDesc: 'दाते कसे प्रभाव टाकत आहेत ते पहा.', allStates: 'सर्व राज्ये', allCities: 'सर्व शहरे', rank: 'रँक', donor: 'दाता', location: 'स्थान', totalImpact: 'एकूण प्रभाव', verifiedDonor: '✓ सत्यापित दाता', silverImpact: 'सिल्व्हर प्रभाव', myGlobalRank: 'माझा जागतिक रँक', lifetimeImpact: 'आजीवन प्रभाव', drivesFunded: 'फंड केलेल्या मोहिमा', memberSince: 'सदस्य तेव्हापासून', recentDonations: 'अलीकडील दान', fundMilestone: 'माइलस्टोन फंड करा', funding: 'तुम्ही फंड करत आहात', required: 'आवश्यक', yourName: 'तुमचे नाव', amount: 'रक्कम (₹)', confirmDonation: 'दानाची पुष्टी करा', cancel: 'रद्द करा', thanksDonation: 'दानाबद्दल धन्यवाद 💖', verified: '✓ सत्यापित', fund: 'फंड करा', beneficiaries: 'लाभार्थी', milestones: 'माइलस्टोन', amountRaised: 'जमा झालेली रक्कम', goal: 'लक्ष्य', completion: 'पूर्णता', problemStatement: 'समस्या विवरण', milestonesTransparency: 'माइलस्टोन आणि पारदर्शकता', proofVerified: '✅ पुरावे सत्यापित — फंड एनजीओला जारी', totalRaised: 'एकूण जमा', fundsCredited: 'फंड जमा', pendingApprovals: 'मंजुरी बाकी', activeDrives: 'सक्रिय मोहिमा', myDonationDrives: 'माझ्या दान मोहिमा', releaseAmount: 'जारी करायची रक्कम', submittedProof: 'सादर केलेले पुरावे', verificationAction: 'सत्यापन कृती', reviewProof: 'फंड मंजूर करण्यापूर्वी सर्व पुरावे काळजीपूर्वक पहा.', releaseFunds: 'फंड जारी करा 💸', rejectSubmission: '✕ नाकारणे', fundsApproved: 'फंड मंजूर', rejected: 'नाकारले', fundsCreditedNgo: 'फंड एनजीओला जमा झाले.', milestoneRejected: 'माइलस्टोन नाकारले गेले.', globalLedger: 'जागतिक शासन खातेवही', ledgerDesc: 'सर्व फंड रिलीझचे अपरिवर्तनीय रेकॉर्ड.', totalFundsReleased: 'एकूण जारी फंड', timestamp: 'वेळ', action: 'कृती', detailsContext: 'तपशील', fundImpact: 'फंड प्रभाव', fundReleased: 'फंड जारी', noAuditRecords: 'खातेवहीमध्ये कोणतेही रेकॉर्ड नाहीत.', taxSavingTitle: 'कर बचत आणि दान प्रमाणपत्रे', taxSavingDesc: 'तुमच्या दानासाठी 80G कर पावत्या डाउनलोड करा.', totalEligible: 'एकूण पात्र दान (आर्थिक वर्ष)', estimatedDeduction: 'अंदाजे कर कपात', eligibleDonations: '80G पात्र दान', downloadAllReceipts: 'सर्व पावत्या डाउनलोड करा', downloadFYReport: 'आर्थिक वर्ष कर अहवाल डाउनलोड करा', downloadPdf: 'PDF डाउनलोड करा', donationCertificates: 'दान प्रमाणपत्रे', language: 'भाषा',
  },
  ta: {
    liveRealTime: 'நேரடி நிகழ்நேர தளம்', tagline: 'மைல்கல் அடிப்படையிலான நிதி வெளியீட்டுடன் வெளிப்படையான நன்கொடை தளம்.', tagline2: 'ஒவ்வொரு ரூபாயும் கண்காணிக்கப்படுகிறது.', ngoDashboard: 'NGO டாஷ்போர்டு', ngoDesc: 'நன்கொடை இயக்கங்களை உருவாக்கவும், ஆதாரங்களை பதிவேற்றவும்.', donorPortal: 'நன்கொடையாளர் போர்டல்', donorDesc: 'இயக்கங்களை உலாவுங்கள், மைல்கற்களை நிதியளிக்கவும்.', adminConsole: 'நிர்வாக கன்சோல்', adminDesc: 'NGO ஆதாரங்களைச் சரிபார்க்கவும், நிதியை அனுமதிக்கவும்.', openPortal: 'போர்டல் திறக்க →', syncFooter: 'அனைத்து டாஷ்போர்டுகளும் நிகழ்நேரத்தில் ஒத்திசைக்கப்படுகின்றன', browseDrives: 'இயக்கங்கள்', rankings: 'தரவரிசை', myProfile: 'என் சுயவிவரம்', dashboard: 'டாஷ்போர்டு', newDrive: 'புதிய இயக்கம்', submitProof: 'ஆதாரம் சமர்ப்பிக்க', approvalQueue: 'ஒப்புதல் வரிசை', auditTrail: 'தணிக்கை தடம்', live: 'நேரடி', activeCampaigns: 'செயலில் உள்ள பிரச்சாரங்கள்', drivesOpen: 'இயக்கங்கள் திறந்துள்ளன', donorRankings: 'நன்கொடையாளர் தரவரிசை', rankingsDesc: 'நன்கொடையாளர்கள் எவ்வாறு தாக்கத்தை ஏற்படுத்துகிறார்கள் என்பதைப் பாருங்கள்.', allStates: 'அனைத்து மாநிலங்கள்', allCities: 'அனைத்து நகரங்கள்', rank: 'தரம்', donor: 'நன்கொடையாளர்', location: 'இடம்', totalImpact: 'மொத்த தாக்கம்', verifiedDonor: '✓ சரிபார்க்கப்பட்ட நன்கொடையாளர்', silverImpact: 'வெள்ளி தாக்கம்', myGlobalRank: 'என் உலக தரம்', lifetimeImpact: 'வாழ்நாள் தாக்கம்', drivesFunded: 'நிதியளிக்கப்பட்ட இயக்கங்கள்', memberSince: 'உறுப்பினர்', recentDonations: 'சமீபத்திய நன்கொடைகள்', fundMilestone: 'மைல்கல் நிதி', funding: 'நீங்கள் நிதியளிக்கிறீர்கள்', required: 'தேவை', yourName: 'உங்கள் பெயர்', amount: 'தொகை (₹)', confirmDonation: 'நன்கொடையை உறுதிப்படுத்தவும்', cancel: 'ரத்து', thanksDonation: 'உங்கள் நன்கொடைக்கு நன்றி 💖', verified: '✓ சரிபார்க்கப்பட்டது', fund: 'நிதி', beneficiaries: 'பயனாளிகள்', milestones: 'மைல்கற்கள்', amountRaised: 'திரட்டிய தொகை', goal: 'இலக்கு', completion: 'நிறைவு', problemStatement: 'சிக்கல் அறிக்கை', milestonesTransparency: 'மைல்கற்கள் & வெளிப்படைத்தன்மை', proofVerified: '✅ ஆதாரம் சரிபார்க்கப்பட்டது — நிதி NGOக்கு வெளியிடப்பட்டது', totalRaised: 'மொத்தம் திரட்டியது', fundsCredited: 'நிதி வரவு', pendingApprovals: 'நிலுவையில் உள்ள ஒப்புதல்கள்', activeDrives: 'செயலில் உள்ள இயக்கங்கள்', myDonationDrives: 'என் நன்கொடை இயக்கங்கள்', releaseAmount: 'வெளியிடும் தொகை', submittedProof: 'சமர்ப்பிக்கப்பட்ட ஆதாரம்', verificationAction: 'சரிபார்ப்பு நடவடிக்கை', reviewProof: 'நிதி ஒப்புதலுக்கு முன் அனைத்து ஆதாரங்களையும் கவனமாக மதிப்பாய்வு செய்யுங்கள்.', releaseFunds: 'நிதி வெளியிடு 💸', rejectSubmission: '✕ நிராகரி', fundsApproved: 'நிதி ஒப்புதல்', rejected: 'நிராகரிக்கப்பட்டது', fundsCreditedNgo: 'நிதி NGOக்கு வரவு வைக்கப்பட்டது.', milestoneRejected: 'மைல்கல் நிராகரிக்கப்பட்டது.', globalLedger: 'உலகளாவிய ஆளுகை பேரேடு', ledgerDesc: 'அனைத்து நிதி வெளியீடுகளின் மாறாத பதிவு.', totalFundsReleased: 'மொத்தம் வெளியிடப்பட்ட நிதி', timestamp: 'நேரம்', action: 'நடவடிக்கை', detailsContext: 'விவரங்கள்', fundImpact: 'நிதி தாக்கம்', fundReleased: 'நிதி வெளியிடப்பட்டது', noAuditRecords: 'பேரேட்டில் எந்த பதிவுகளும் இல்லை.', taxSavingTitle: 'வரி சேமிப்பு & நன்கொடை சான்றிதழ்கள்', taxSavingDesc: 'உங்கள் நன்கொடைகளுக்கான 80G வரி ரசீதுகளைப் பதிவிறக்கவும்.', totalEligible: 'மொத்த தகுதியான நன்கொடைகள் (நிதியாண்டு)', estimatedDeduction: 'மதிப்பிடப்பட்ட வரி கழிவு', eligibleDonations: '80G தகுதியான நன்கொடைகள்', downloadAllReceipts: 'அனைத்து ரசீதுகளையும் பதிவிறக்கவும்', downloadFYReport: 'நிதியாண்டு வரி அறிக்கையை பதிவிறக்கவும்', downloadPdf: 'PDF பதிவிறக்கவும்', donationCertificates: 'நன்கொடை சான்றிதழ்கள்', language: 'மொழி',
  },
  te: {
    liveRealTime: 'లైవ్ రియల్-టైమ్ ప్లాట్‌ఫారమ్', tagline: 'మైల్‌స్టోన్ ఆధారిత ఫండ్ విడుదలతో పారదర్శక దాన ప్లాట్‌ఫారమ్.', tagline2: 'ప్రతి రూపాయి ట్రాక్ చేయబడుతుంది.', ngoDashboard: 'NGO డ్యాష్‌బోర్డ్', ngoDesc: 'దాన డ్రైవ్‌లను సృష్టించండి, ఆధారాలను అప్‌లోడ్ చేయండి.', donorPortal: 'దాత పోర్టల్', donorDesc: 'డ్రైవ్‌లను బ్రౌజ్ చేయండి, మైల్‌స్టోన్‌లకు ఫండ్ ఇవ్వండి.', adminConsole: 'అడ్మిన్ కన్సోల్', adminDesc: 'NGO ఆధారాలను ధృవీకరించండి, ఫండ్‌లను ఆమోదించండి.', openPortal: 'పోర్టల్ తెరవండి →', syncFooter: 'అన్ని డ్యాష్‌బోర్డ్‌లు రియల్-టైమ్‌లో సింక్ అవుతాయి', browseDrives: 'డ్రైవ్‌లు చూడండి', rankings: 'ర్యాంకింగ్‌లు', myProfile: 'నా ప్రొఫైల్', dashboard: 'డ్యాష్‌బోర్డ్', newDrive: 'కొత్త డ్రైవ్', submitProof: 'ఆధారం సమర్పించండి', approvalQueue: 'ఆమోద క్యూ', auditTrail: 'ఆడిట్ ట్రైల్', live: 'లైవ్', activeCampaigns: 'యాక్టివ్ ప్రచారాలు', drivesOpen: 'డ్రైవ్‌లు ఓపెన్', donorRankings: 'దాత ర్యాంకింగ్‌లు', rankingsDesc: 'దాతలు ఎలా ప్రభావం చూపుతున్నారో చూడండి.', allStates: 'అన్ని రాష్ట్రాలు', allCities: 'అన్ని నగరాలు', rank: 'ర్యాంక్', donor: 'దాత', location: 'ప్రదేశం', totalImpact: 'మొత్తం ప్రభావం', verifiedDonor: '✓ ధృవీకరించబడిన దాత', silverImpact: 'సిల్వర్ ప్రభావం', myGlobalRank: 'నా గ్లోబల్ ర్యాంక్', lifetimeImpact: 'జీవితకాల ప్రభావం', drivesFunded: 'ఫండ్ చేసిన డ్రైవ్‌లు', memberSince: 'సభ్యుడు', recentDonations: 'ఇటీవలి దానాలు', fundMilestone: 'మైల్‌స్టోన్ ఫండ్', funding: 'మీరు ఫండ్ చేస్తున్నారు', required: 'అవసరం', yourName: 'మీ పేరు', amount: 'మొత్తం (₹)', confirmDonation: 'దానాన్ని నిర్ధారించండి', cancel: 'రద్దు', thanksDonation: 'మీ దానానికి ధన్యవాదాలు 💖', verified: '✓ ధృవీకరించబడింది', fund: 'ఫండ్', beneficiaries: 'లబ్ధిదారులు', milestones: 'మైల్‌స్టోన్‌లు', amountRaised: 'సేకరించిన మొత్తం', goal: 'లక్ష్యం', completion: 'పూర్తి', problemStatement: 'సమస్య వివరణ', milestonesTransparency: 'మైల్‌స్టోన్‌లు & పారదర్శకత', proofVerified: '✅ ఆధారం ధృవీకరించబడింది — ఫండ్ NGOకి విడుదల', totalRaised: 'మొత్తం సేకరణ', fundsCredited: 'ఫండ్ జమ', pendingApprovals: 'పెండింగ్ ఆమోదాలు', activeDrives: 'యాక్టివ్ డ్రైవ్‌లు', myDonationDrives: 'నా దాన డ్రైవ్‌లు', releaseAmount: 'విడుదల మొత్తం', submittedProof: 'సమర్పించిన ఆధారం', verificationAction: 'ధృవీకరణ చర్య', reviewProof: 'ఫండ్ ఆమోదానికి ముందు అన్ని ఆధారాలను జాగ్రత్తగా సమీక్షించండి.', releaseFunds: 'ఫండ్ విడుదల 💸', rejectSubmission: '✕ తిరస్కరించు', fundsApproved: 'ఫండ్ ఆమోదించబడింది', rejected: 'తిరస్కరించబడింది', fundsCreditedNgo: 'ఫండ్ NGOకి జమ అయింది.', milestoneRejected: 'మైల్‌స్టోన్ తిరస్కరించబడింది.', globalLedger: 'గ్లోబల్ గవర్నెన్స్ లెడ్జర్', ledgerDesc: 'అన్ని ఫండ్ విడుదలల మార్పులేని రికార్డు.', totalFundsReleased: 'మొత్తం విడుదల ఫండ్', timestamp: 'సమయం', action: 'చర్య', detailsContext: 'వివరాలు', fundImpact: 'ఫండ్ ప్రభావం', fundReleased: 'ఫండ్ విడుదల', noAuditRecords: 'లెడ్జర్‌లో ఎలాంటి రికార్డులు లేవు.', taxSavingTitle: 'పన్ను ఆదా & దాన సర్టిఫికెట్లు', taxSavingDesc: 'మీ దానాల కోసం 80G పన్ను రసీదులను డౌన్‌లోడ్ చేయండి.', totalEligible: 'మొత్తం అర్హత దానాలు', estimatedDeduction: 'అంచనా పన్ను మినహాయింపు', eligibleDonations: '80G అర్హత దానాలు', downloadAllReceipts: 'అన్ని రసీదులు డౌన్‌లోడ్', downloadFYReport: 'ఆర్థిక సంవత్సర పన్ను నివేదిక', downloadPdf: 'PDF డౌన్‌లోడ్', donationCertificates: 'దాన సర్టిఫికెట్లు', language: 'భాష',
  },
  gu: {
    liveRealTime: 'લાઇવ રીઅલ-ટાઇમ પ્લેટફોર્મ', tagline: 'માઇલસ્ટોન-આધારિત ફંડ રિલીઝ સાથે પારદર્શક દાન પ્લેટફોર્મ.', tagline2: 'દરેક રૂપિયાને ટ્રેક કરવામાં આવે છે.', ngoDashboard: 'NGO ડેશબોર્ડ', ngoDesc: 'દાન ડ્રાઇવ બનાવો, પુરાવા અપલોડ કરો.', donorPortal: 'દાતા પોર્ટલ', donorDesc: 'ડ્રાઇવ બ્રાઉઝ કરો, માઇલસ્ટોન ફંડ કરો.', adminConsole: 'એડમિન કન્સોલ', adminDesc: 'NGO પુરાવા ચકાસો, ફંડ મંજૂર કરો.', openPortal: 'પોર્ટલ ખોલો →', syncFooter: 'બધા ડેશબોર્ડ રીઅલ-ટાઇમમાં સિંક થાય છે', browseDrives: 'ડ્રાઇવ જુઓ', rankings: 'રેન્કિંગ', myProfile: 'મારી પ્રોફાઇલ', dashboard: 'ડેશબોર્ડ', newDrive: 'નવી ડ્રાઇવ', submitProof: 'પુરાવો સબમિટ કરો', approvalQueue: 'મંજૂરી કતાર', auditTrail: 'ઓડિટ ટ્રેલ', live: 'લાઇવ', activeCampaigns: 'સક્રિય ઝુંબેશ', drivesOpen: 'ડ્રાઇવ ખુલ્લી', donorRankings: 'દાતા રેન્કિંગ', rankingsDesc: 'દાતાઓ કેવી અસર કરી રહ્યા છે તે જુઓ.', allStates: 'બધા રાજ્યો', allCities: 'બધા શહેરો', rank: 'રેન્ક', donor: 'દાતા', location: 'સ્થાન', totalImpact: 'કુલ અસર', verifiedDonor: '✓ ચકાસાયેલ દાતા', silverImpact: 'સિલ્વર અસર', myGlobalRank: 'મારી વૈશ્વિક રેન્ક', lifetimeImpact: 'જીવનભરની અસર', drivesFunded: 'ફંડ કરેલી ડ્રાઇવ', memberSince: 'સભ્ય', recentDonations: 'તાજેતરના દાન', fundMilestone: 'માઇલસ્ટોન ફંડ કરો', funding: 'તમે ફંડ કરી રહ્યા છો', required: 'જરૂરી', yourName: 'તમારું નામ', amount: 'રકમ (₹)', confirmDonation: 'દાનની પુષ્ટિ કરો', cancel: 'રદ કરો', thanksDonation: 'તમારા દાન માટે આભાર 💖', verified: '✓ ચકાસાયેલ', fund: 'ફંડ', beneficiaries: 'લાભાર્થીઓ', milestones: 'માઇલસ્ટોન', amountRaised: 'એકત્ર રકમ', goal: 'લક્ષ્ય', completion: 'પૂર્ણતા', problemStatement: 'સમસ્યા વિધાન', milestonesTransparency: 'માઇલસ્ટોન અને પારદર્શિતા', proofVerified: '✅ પુરાવા ચકાસાયા — ફંડ NGOને જારી', totalRaised: 'કુલ એકત્ર', fundsCredited: 'ફંડ જમા', pendingApprovals: 'બાકી મંજૂરીઓ', activeDrives: 'સક્રિય ડ્રાઇવ', myDonationDrives: 'મારી દાન ડ્રાઇવ', releaseAmount: 'જારી કરવાની રકમ', submittedProof: 'સબમિટ કરેલ પુરાવો', verificationAction: 'ચકાસણી ક્રિયા', reviewProof: 'ફંડ મંજૂર કરતા પહેલા બધા પુરાવા કાળજીપૂર્વક તપાસો.', releaseFunds: 'ફંડ જારી કરો 💸', rejectSubmission: '✕ નકારો', fundsApproved: 'ફંડ મંજૂર', rejected: 'નકારાયેલ', fundsCreditedNgo: 'ફંડ NGOને જમા.', milestoneRejected: 'માઇલસ્ટોન નકારાયો.', globalLedger: 'વૈશ્વિક શાસન ખાતાવહી', ledgerDesc: 'બધા ફંડ રિલીઝનો અપરિવર્તનીય રેકોર્ડ.', totalFundsReleased: 'કુલ જારી ફંડ', timestamp: 'સમય', action: 'ક્રિયા', detailsContext: 'વિગતો', fundImpact: 'ફંડ અસર', fundReleased: 'ફંડ જારી', noAuditRecords: 'ખાતાવહીમાં કોઈ રેકોર્ડ નથી.', taxSavingTitle: 'ટેક્સ બચત અને દાન પ્રમાણપત્રો', taxSavingDesc: 'તમારા દાન માટે 80G ટેક્સ રસીદ ડાઉનલોડ કરો.', totalEligible: 'કુલ પાત્ર દાન', estimatedDeduction: 'અંદાજિત ટેક્સ કપાત', eligibleDonations: '80G પાત્ર દાન', downloadAllReceipts: 'બધી રસીદ ડાઉનલોડ', downloadFYReport: 'નાણાકીય વર્ષ ટેક્સ રિપોર્ટ', downloadPdf: 'PDF ડાઉનલોડ', donationCertificates: 'દાન પ્રમાણપત્રો', language: 'ભાષા',
  },
  zh: {
    liveRealTime: '实时平台', tagline: '基于里程碑的资金发放透明捐赠平台。', tagline2: '每一分钱都被追踪。每个里程碑都经过验证。', ngoDashboard: 'NGO仪表板', ngoDesc: '创建捐赠活动，添加里程碑，上传证明。', donorPortal: '捐赠者门户', donorDesc: '浏览活动，资助里程碑，查看验证证明。', adminConsole: '管理控制台', adminDesc: '验证NGO证明，批准资金。', openPortal: '打开门户 →', syncFooter: '所有仪表板实时同步', browseDrives: '浏览活动', rankings: '排名', myProfile: '我的资料', dashboard: '仪表板', newDrive: '新活动', submitProof: '提交证明', approvalQueue: '审批队列', auditTrail: '审计追踪', live: '在线', activeCampaigns: '活跃活动', drivesOpen: '个活动开放', donorRankings: '捐赠者排名', rankingsDesc: '查看捐赠者如何产生影响。', allStates: '所有州', allCities: '所有城市', rank: '排名', donor: '捐赠者', location: '位置', totalImpact: '总影响', verifiedDonor: '✓ 已验证捐赠者', silverImpact: '银级影响', myGlobalRank: '我的全球排名', lifetimeImpact: '终身影响', drivesFunded: '资助的活动', memberSince: '会员自', recentDonations: '最近捐赠', fundMilestone: '资助里程碑', funding: '您正在资助', required: '需要', yourName: '您的姓名', amount: '金额 (₹)', confirmDonation: '确认捐赠', cancel: '取消', thanksDonation: '感谢您的捐赠 💖', verified: '✓ 已验证', fund: '资助', beneficiaries: '受益人', milestones: '里程碑', amountRaised: '已筹集金额', goal: '目标', completion: '完成度', problemStatement: '问题陈述', milestonesTransparency: '里程碑与透明度', proofVerified: '✅ 证明已验证 — 资金已发放给NGO', totalRaised: '总筹集', fundsCredited: '资金到账', pendingApprovals: '待审批', activeDrives: '活跃活动', myDonationDrives: '我的捐赠活动', releaseAmount: '发放金额', submittedProof: '已提交证明', verificationAction: '验证操作', reviewProof: '批准资金发放前请仔细审查所有证明。', releaseFunds: '发放资金 💸', rejectSubmission: '✕ 拒绝提交', fundsApproved: '资金已批准', rejected: '已拒绝', fundsCreditedNgo: '资金已转入NGO账户。', milestoneRejected: '里程碑已被拒绝。', globalLedger: '全球治理账本', ledgerDesc: '所有资金发放的不可变记录。', totalFundsReleased: '总发放资金', timestamp: '时间戳', action: '操作', detailsContext: '详情与背景', fundImpact: '资金影响', fundReleased: '资金已发放', noAuditRecords: '治理账本中没有记录。', taxSavingTitle: '节税与捐赠证书', taxSavingDesc: '下载您的捐赠80G税务收据。', totalEligible: '总合格捐赠', estimatedDeduction: '预估税扣', eligibleDonations: '80G合格捐赠', downloadAllReceipts: '下载所有收据', downloadFYReport: '下载财年税务报告', downloadPdf: '下载PDF', donationCertificates: '捐赠证书', language: '语言',
  },
  de: {
    liveRealTime: 'Live-Echtzeit-Plattform', tagline: 'Transparente Spendenplattform mit meilensteinbasierter Mittelfreigabe.', tagline2: 'Jede Rupie wird verfolgt. Jeder Meilenstein wird verifiziert.', ngoDashboard: 'NGO-Dashboard', ngoDesc: 'Spendenaktionen erstellen, Meilensteine hinzufügen, Nachweise hochladen.', donorPortal: 'Spenderportal', donorDesc: 'Aktionen durchsuchen, Meilensteine finanzieren, verifizierte Nachweise sehen.', adminConsole: 'Admin-Konsole', adminDesc: 'NGO-Nachweise überprüfen, Mittel genehmigen.', openPortal: 'Portal öffnen →', syncFooter: 'Alle Dashboards synchronisieren sich in Echtzeit', browseDrives: 'Aktionen ansehen', rankings: 'Ranglisten', myProfile: 'Mein Profil', dashboard: 'Dashboard', newDrive: 'Neue Aktion', submitProof: 'Nachweis einreichen', approvalQueue: 'Genehmigungswarteschlange', auditTrail: 'Prüfpfad', live: 'Live', activeCampaigns: 'Aktive Kampagnen', drivesOpen: 'Aktionen offen', donorRankings: 'Spenderrangliste', rankingsDesc: 'Sehen Sie, welche Wirkung Spender erzielen.', allStates: 'Alle Bundesländer', allCities: 'Alle Städte', rank: 'Rang', donor: 'Spender', location: 'Standort', totalImpact: 'Gesamtwirkung', verifiedDonor: '✓ Verifizierter Spender', silverImpact: 'Silber-Wirkung', myGlobalRank: 'Mein globaler Rang', lifetimeImpact: 'Lebenslange Wirkung', drivesFunded: 'Finanzierte Aktionen', memberSince: 'Mitglied seit', recentDonations: 'Letzte Spenden', fundMilestone: 'Meilenstein finanzieren', funding: 'Sie finanzieren', required: 'Benötigt', yourName: 'Ihr Name', amount: 'Betrag (₹)', confirmDonation: 'Spende bestätigen', cancel: 'Abbrechen', thanksDonation: 'Danke für Ihre Spende 💖', verified: '✓ Verifiziert', fund: 'Finanzieren', beneficiaries: 'Begünstigte', milestones: 'Meilensteine', amountRaised: 'Gesammelter Betrag', goal: 'Ziel', completion: 'Abschluss', problemStatement: 'PROBLEMSTELLUNG', milestonesTransparency: 'Meilensteine & Transparenz', proofVerified: '✅ Nachweis verifiziert — Mittel an NGO freigegeben', totalRaised: 'Gesamt gesammelt', fundsCredited: 'Gutgeschriebene Mittel', pendingApprovals: 'Ausstehende Genehmigungen', activeDrives: 'Aktive Aktionen', myDonationDrives: 'Meine Spendenaktionen', releaseAmount: 'Freizugebender Betrag', submittedProof: 'Eingereichter Nachweis', verificationAction: 'Verifizierungsaktion', reviewProof: 'Überprüfen Sie alle Nachweise sorgfältig vor der Mittelfreigabe.', releaseFunds: 'Mittel freigeben 💸', rejectSubmission: '✕ Einreichung ablehnen', fundsApproved: 'MITTEL GENEHMIGT', rejected: 'ABGELEHNT', fundsCreditedNgo: 'Mittel wurden der NGO gutgeschrieben.', milestoneRejected: 'Meilenstein wurde abgelehnt.', globalLedger: 'Globales Governance-Hauptbuch', ledgerDesc: 'Unveränderlicher Nachweis aller Mittelfreigaben.', totalFundsReleased: 'Gesamt freigegebene Mittel', timestamp: 'Zeitstempel', action: 'Aktion', detailsContext: 'Details & Kontext', fundImpact: 'Mittelwirkung', fundReleased: 'MITTEL FREIGEGEBEN', noAuditRecords: 'Keine Prüfeinträge im Governance-Hauptbuch.', taxSavingTitle: 'Steuersparen & Spendenbescheinigungen', taxSavingDesc: 'Laden Sie 80G-Steuerquittungen für Ihre Spenden herunter.', totalEligible: 'Gesamt berechtigte Spenden', estimatedDeduction: 'Geschätzter Steuerabzug', eligibleDonations: '80G berechtigte Spenden', downloadAllReceipts: 'Alle Quittungen herunterladen', downloadFYReport: 'GJ-Steuerbericht herunterladen', downloadPdf: 'PDF herunterladen', donationCertificates: 'Spendenbescheinigungen', language: 'Sprache',
  },
};

export function t(lang: LangCode, key: keyof TranslationKeys): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
