/* ==========================================================================
   TERRABYTE (टेराबाइट) — MULTILINGUAL i18n SYSTEM
   Compliant with Guidelines for Indian Government Websites (GIGW 3.0)
   Supporting 22 Eighth Schedule Constitutional Languages + English
   ========================================================================== */

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', native: 'सिन्धी' },
  { code: 'doi', name: 'Dogri', native: 'डोगरी' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', name: 'Kashmiri', native: 'कश्मीरी' }
];

let currentLang = 'en';

const TRANSLATIONS = {
  en: {
    // Top Bar & Masthead
    gov_in: "Government of India",
    ministry: "Ministry of Rural Development",
    dept: "Department of Land Resources",
    portal_brand: "TerraByte",
    portal_tag: "National Land Acquisition & Management System",
    satyam: "Satyameva Jayate",
    
    // Quick Utility Buttons
    a11y_btn: "♿ Accessibility",
    screen_reader_btn: "🔊 Screen Reader",
    sitemap_btn: "🗺️ Sitemap",
    contact_btn: "📞 Contact / Help",
    skip_content: "Skip to Main Content",
    contrast_btn: "◐ Contrast",

    // Navbar
    nav_home: "HOME",
    nav_about: "ABOUT US",
    nav_acquisition: "LAND ACQUISITION",
    nav_management: "LAND MANAGEMENT",
    nav_projects: "PROJECTS",
    nav_gis: "GIS MAP",
    nav_documents: "DOCUMENTS",
    nav_guidelines: "GUIDELINES & ACTS",
    nav_contact_us: "CONTACT US",
    nav_login: "LOGIN / SSO",
    nav_logout: "SIGN OUT",
    back_to_home: "← Back to Portal Home",
    home_crumb: "Home",
    sso_crumb: "Central Single Sign-On (JanParichay SSO)",

    // Sidebar Groups
    group_pinned: "Frequently Used",
    group_overview: "Overview",
    group_records: "Land Records",
    group_acquisition: "Acquisition",
    group_projects: "Projects",
    group_oversight: "Oversight & Admin",
    group_system: "System",
    sidebar_search_placeholder: "Search navigation...",
    no_nav_matches: "No matching menu items found",

    // Sidebar Nav Items
    item_dashboard: "Dashboard",
    item_my_land: "My Land (Khatedar)",
    item_my_agreements: "My E-Agreements",
    item_map: "GIS Land Map",
    item_parcels: "Land Parcels",
    item_cases: "Acquisition Cases",
    item_documents: "Document Verification",
    item_agreements: "E-Agreements",
    item_approvals: "Approvals & NOC",
    item_compensation: "Compensation & DBT",
    item_projects: "Infrastructure Projects",
    item_monitoring: "Progress Monitoring",
    item_decision_support: "Decision Support",
    item_alerts: "Compliance Alerts",
    item_audit: "Audit Trail",
    item_ai: "AI Legal Assistant",
    item_users: "User & Role Management",
    item_reset_data: "Reset Demo Data",

    // Roles
    role_ADMIN: "District Nodal Administrator",
    role_LAND_OFFICER: "Land Acquisition Officer (LAO)",
    role_PROJECT_AUTHORITY: "Project Authority (NHAI/Railways)",
    role_LAND_OWNER: "Registered Citizen / Landowner (Khatedar)",

    // Workflow Stages
    wf_IDENTIFIED: "Identified",
    wf_VERIFICATION: "Verification",
    wf_NOTICE_ISSUED: "Section 11(1) Notice Issued",
    wf_OBJECTION_REVIEW: "Section 15 Objection Review",
    wf_APPROVAL: "Competent Sanction Approved",
    wf_COMPENSATION_ASSESSED: "Compensation Award Assessed",
    wf_PAYMENT_PENDING: "PFMS DBT Disbursal Pending",
    wf_PAYMENT_COMPLETED: "Payment Completed via PFMS",
    wf_LAND_ACQUIRED: "Land Acquired & Vested",
    wf_PROJECT_UTILIZATION: "Handed Over for Construction",

    // Route Titles [Crumb, Main Title]
    title_dashboard: ["Overview", "Executive Land Acquisition & DBT Dashboard"],
    title_my_land: ["Citizen Portal", "My Registered Land Holdings & Khasra"],
    title_map: ["Geospatial Information System", "Cadastral Land Parcel GIS Map"],
    title_parcels: ["Revenue Records", "National Land Parcel Registry (Khasra/RoR)"],
    title_parcel_detail: ["Revenue Records", "Cadastral Parcel Dossier"],
    title_cases: ["Acquisition Proceedings", "Statutory Land Acquisition Cases (RFCTLARR 2013)"],
    title_case_detail: ["Acquisition Proceedings", "Statutory Case Proceeding Details"],
    title_documents: ["Verification Queue", "Land Title Verification & Discrepancy Checks"],
    title_e_agreements: ["Digital Governance", "Digital E-Agreements & E-Stamp Deeds"],
    title_approvals: ["Statutory Clearances", "Competent Authority Sanctions & NOC"],
    title_compensation: ["DBT Compensation", "Direct Benefit Transfer (PFMS) & Award Determination"],
    title_projects: ["National Infrastructure", "PM GatiShakti Priority Infrastructure Corridors"],
    title_project_detail: ["National Infrastructure", "Infrastructure Project Alignment Dossier"],
    title_monitoring: ["Physical Progress", "Acquisition Milestone & Handover Monitoring"],
    title_decision_support: ["Decision Support", "Geospatial Alignment & Parcel Feasibility DSS"],
    title_alerts: ["Vigilance", "Statutory Delays, Notice Expirations & Alerts"],
    title_audit: ["Audit Trail", "Cryptographic Immutable Activity Audit Trail"],
    title_ai: ["Digital India AI", "TerraByte AI Assistant & Legal Enquiry"],
    title_users: ["Security Administration", "Portal Users, Roles & Jurisdiction Directory"],

    // Common UI Text
    common_search: "Search",
    common_filter: "Filter",
    common_export: "Export CSV",
    common_print: "Print / PDF",
    common_close: "Close",
    common_submit: "Submit",
    common_reset: "Reset",
    common_status: "Status",
    common_actions: "Actions",
    common_view: "View",
    common_loading: "Loading IST...",
    lang_switched: "Language switched to English"
  },

  hi: {
    // Top Bar & Masthead
    gov_in: "भारत सरकार",
    ministry: "ग्रामीण विकास मंत्रालय",
    dept: "भूमि संसाधन विभाग",
    portal_brand: "टेराबाइट",
    portal_tag: "राष्ट्रीय भूमि अधिग्रहण एवं प्रबंधन पोर्टल",
    satyam: "सत्यमेव जयते",

    // Quick Utility Buttons
    a11y_btn: "♿ सुगम्यता",
    screen_reader_btn: "🔊 स्क्रीन रीडर",
    sitemap_btn: "🗺️ साइटमैप",
    contact_btn: "📞 संपर्क / सहायता",
    skip_content: "मुख्य सामग्री पर जाएं",
    contrast_btn: "◐ उच्च कंट्रास्ट",

    // Navbar
    nav_home: "मुख्य पृष्ठ",
    nav_about: "हमारे बारे में",
    nav_acquisition: "भूमि अधिग्रहण",
    nav_management: "भूमि प्रबंधन",
    nav_projects: "परियोजनाएं",
    nav_gis: "भू-स्थानिक नक्शा",
    nav_documents: "दस्तावेज़",
    nav_guidelines: "दिशानिर्देश व अधिनियम",
    nav_contact_us: "संपर्क करें",
    nav_login: "प्रवेश / एसएसओ",
    nav_logout: "लॉगआउट",
    back_to_home: "← मुख्य पृष्ठ पर वापस जाएं",
    home_crumb: "मुख्य पृष्ठ",
    sso_crumb: "केंद्रीय एकल प्रवेश द्वार (जनपरिचय एसएसओ)",

    // Sidebar Groups
    group_pinned: "त्वरित सेवाएं",
    group_overview: "राष्ट्रीय अवलोकन",
    group_records: "भू-अभिलेख",
    group_acquisition: "अधिग्रहण कार्य",
    group_projects: "अवसंरचना परियोजनाएं",
    group_oversight: "सतर्कता व प्रशासन",
    group_system: "व्यवस्था",
    sidebar_search_placeholder: "मेन्यू खोजें...",
    no_nav_matches: "कोई मेन्यू विकल्प नहीं मिला",

    // Sidebar Nav Items
    item_dashboard: "डैशबोर्ड",
    item_my_land: "मेरी भूमि (खातेदार)",
    item_my_agreements: "मेरे ई-समझौते",
    item_map: "भू-स्थानिक नक्शा",
    item_parcels: "खसरा / भूखंड",
    item_cases: "अधिग्रहण प्रकरण",
    item_documents: "दस्तावेज़ सत्यापन",
    item_agreements: "ई-समझौता",
    item_approvals: "अनुमोदन व अनापत्ति",
    item_compensation: "प्रतिकर एवं डीबीटी",
    item_projects: "परियोजनाएं",
    item_monitoring: "प्रगति निगरानी",
    item_decision_support: "निर्णय सहायता",
    item_alerts: "सतर्कता सूचनाएं",
    item_audit: "ऑडिट ट्रेल",
    item_ai: "एआई सहायक",
    item_users: "प्रयोक्ता प्रबंधन",
    item_reset_data: "डाटा पुनर्स्थापित करें",

    // Roles
    role_ADMIN: "ज़िला नोडल अधिकारी (प्रशासक)",
    role_LAND_OFFICER: "भू-अधिग्रहण अधिकारी (एलएओ)",
    role_PROJECT_AUTHORITY: "परियोजना प्राधिकारी (एनएचएआई/रेलवे)",
    role_LAND_OWNER: "नागरिक / पंजीकृत खातेदार",

    // Workflow Stages
    wf_IDENTIFIED: "चिह्नित",
    wf_VERIFICATION: "सत्यापन",
    wf_NOTICE_ISSUED: "धारा 11(1) सूचना जारी",
    wf_OBJECTION_REVIEW: "धारा 15 आपत्ति समीक्षा",
    wf_APPROVAL: "सक्षम अनुमोदन प्राप्त",
    wf_COMPENSATION_ASSESSED: "प्रतिकर निर्धारण पूर्ण",
    wf_PAYMENT_PENDING: "डीबीटी भुगतान प्रक्रियाधीन",
    wf_PAYMENT_COMPLETED: "डीबीटी भुगतान संपन्न",
    wf_LAND_ACQUIRED: "भूमि अधिग्रहीत व निहित",
    wf_PROJECT_UTILIZATION: "निर्माण हेतु हस्तांतरित",

    // Route Titles [Crumb, Main Title]
    title_dashboard: ["राष्ट्रीय अवलोकन", "केंद्रीय भूमि अधिग्रहण एवं डीबीटी डैशबोर्ड"],
    title_my_land: ["नागरिक सेवा", "मेरी पंजीकृत भूमि व खसरा होल्डिंग्स"],
    title_map: ["भू-स्थानिक सूचना प्रणाली (जीआईएस)", "कैडस्ट्रल भूखंड जीआईएस नक्शा"],
    title_parcels: ["राजस्व अभिलेख", "राष्ट्रीय खसरा व भूखंड निर्देशिका"],
    title_parcel_detail: ["राजस्व अभिलेख", "भूखंड विवरण एवं कैडस्ट्रल दस्तावेज़"],
    title_cases: ["अधिग्रहण कार्यवाही", "सांविधिक भूमि अधिग्रहण प्रकरण (आरएफसीटीएलएआरआर २०१३)"],
    title_case_detail: ["अधिग्रहण कार्यवाही", "प्रकरण कार्यवाही का विस्तृत विवरण"],
    title_documents: ["दस्तावेज़ सत्यापन", "भू-स्वामित्व सत्यापन व विसंगति जांच"],
    title_e_agreements: ["ई-अभिशासन", "डिजिटल भू-अधिग्रहण ई-समझौता व ई-स्टाम्प विलेख"],
    title_approvals: ["सांविधिक अनुमोदन", "सक्षम प्राधिकारी अनापत्ति (एनओसी) व स्वीकृतियां"],
    title_compensation: ["प्रतिकर वितरण", "प्रत्यक्ष लाभ अंतरण (पीएफएमएस) व एवार्ड निर्धारण"],
    title_projects: ["राष्ट्रीय अवसंरचना", "पीएम गतिशक्ति राष्ट्रीय अवसंरचना गलियारे"],
    title_project_detail: ["राष्ट्रीय अवसंरचना", "अवसंरचना परियोजना संरेखण विवरण"],
    title_monitoring: ["भौतिक प्रगति", "अधिग्रहण मील के पत्थर व हैंडओवर निगरानी"],
    title_decision_support: ["निर्णय सहायता", "भू-संरेखण व भूखंड उपयुक्तता निर्णय सहायता प्रणाली"],
    title_alerts: ["सतर्कता व निगरानी", "सांविधिक विलंब, सूचना समय-सीमा व सतर्कता अलर्ट"],
    title_audit: ["लेखा परीक्षा", "अपरिवर्तनीय डिजिटल ऑडिट लॉग व अभिलेख"],
    title_ai: ["डिजिटल इंडिया एआई", "टेराबाइट विधिक एआई सहायक व नागरिक पूछताछ"],
    title_users: ["सुरक्षा प्रशासन", "प्रयोक्ता, भूमिकाएं व क्षेत्राधिकार निर्देशिका"],

    // Common UI Text
    common_search: "खोजें",
    common_filter: "फ़िल्टर",
    common_export: "सीएसवी निर्यात",
    common_print: "प्रिंट / पीडीएफ",
    common_close: "बंद करें",
    common_submit: "प्रेषित करें",
    common_reset: "रीसेट",
    common_status: "स्थिति",
    common_actions: "कार्यवाही",
    common_view: "देखें",
    common_loading: "समय लोड हो रहा है...",
    lang_switched: "भाषा बदली गई: हिन्दी"
  }
};

// Populate stub fallback entries for all other 21 Eighth Schedule languages
[
  'bn','mr','te','ta','gu','ur','kn','or','ml','pa',
  'as','mai','sa','kok','sd','doi','mni','ne','brx','sat','ks'
].forEach(code => {
  const langObj = LANGUAGES.find(l => l.code === code);
  const langName = langObj ? langObj.name : code;
  const langNative = langObj ? langObj.native : code;
  TRANSLATIONS[code] = {
    gov_in: `${langNative} | Govt. of India`,
    ministry: "Ministry of Rural Development",
    dept: "Department of Land Resources",
    portal_brand: "TerraByte",
    portal_tag: "National Land Acquisition & Management System",
    lang_switched: `Language selected: ${langNative} (${langName})`
  };
});

/* ---------------- TRANSLATION LOOKUP ---------------- */
function t(key, fallback) {
  if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) {
    return TRANSLATIONS[currentLang][key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  return fallback !== undefined ? fallback : key;
}

function getRoleLabel(role) {
  return t(`role_${role}`, ROLES[role]?.label || role);
}

function getWorkflowLabel(state) {
  return t(`wf_${state}`, WORKFLOW_LABELS[state] || state);
}

function getRouteTitle(routeKey) {
  const def = TITLES[routeKey] || ['TerraByte', 'Portal'];
  const trans = t(`title_${routeKey}`);
  return Array.isArray(trans) ? trans : def;
}

/* ---------------- LANGUAGE SWITCHING ---------------- */
function setLanguage(langCode) {
  if (!LANGUAGES.some(l => l.code === langCode)) {
    langCode = 'en';
  }
  currentLang = langCode;
  try {
    localStorage.setItem('terrabyte_lang', langCode);
  } catch (e) {
    console.warn('LocalStorage error saving language:', e);
  }

  // Update HTML tag
  document.documentElement.lang = langCode;
  const langObj = LANGUAGES.find(l => l.code === langCode);
  if (langObj && langObj.dir === 'rtl') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  // Update select elements if present
  const sel = document.getElementById('lang-select');
  if (sel && sel.value !== langCode) {
    sel.value = langCode;
  }
  const mobileSel = document.getElementById('mobile-lang-select');
  if (mobileSel && mobileSel.value !== langCode) {
    mobileSel.value = langCode;
  }

  // Translate all DOM elements tagged with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    const val = t(k);
    if (val) el.textContent = val;
  });

  // Re-render role pill & user title if logged in
  if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
    const rolePill = document.getElementById('role-pill');
    if (rolePill) rolePill.textContent = getRoleLabel(CURRENT_USER.role);
    
    // Re-render sidebar with single-language labels
    if (typeof renderSidebar === 'function') {
      renderSidebar();
    }

    // Re-render active view route with updated language
    if (typeof CURRENT_ROUTE !== 'undefined' && CURRENT_ROUTE && typeof navigate === 'function') {
      navigate(CURRENT_ROUTE.name, CURRENT_ROUTE.param);
    }
  }

  const toastMsg = t('lang_switched', `Language switched: ${langObj ? langObj.name : langCode}`);
  if (typeof toast === 'function') {
    toast(toastMsg);
  }
}

// Backwards-compatible toggle function
function toggleLanguage() {
  const nextLang = currentLang === 'hi' ? 'en' : 'hi';
  setLanguage(nextLang);
}

// Initialize saved language immediately on script load
try {
  const saved = localStorage.getItem('terrabyte_lang');
  if (saved && LANGUAGES.some(l => l.code === saved)) {
    currentLang = saved;
    document.documentElement.lang = saved;
  }
} catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('lang-select');
  if (sel) {
    sel.value = currentLang;
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    const val = t(k);
    if (val) el.textContent = val;
  });
});
