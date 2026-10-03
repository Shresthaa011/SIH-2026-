const NAV_ITEMS = [
  {
    id: 'overview',
    groupKey: 'group_overview',
    groupFallback: 'Overview',
    items: [
      { key: 'dashboard', i18nKey: 'item_dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', ico: '▣', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'my-land', i18nKey: 'item_my_land', labelEn: 'My Land (Khatedar)', labelHi: 'मेरी भूमि (खातेदार)', ico: '⌂', roles: ['LAND_OWNER'] },
      { key: 'e-agreements', i18nKey: 'item_my_agreements', labelEn: 'My E-Agreements', labelHi: 'मेरे ई-समझौते', ico: '✍', roles: ['LAND_OWNER'] },
    ]
  },
  {
    id: 'records',
    groupKey: 'group_records',
    groupFallback: 'Land Records',
    items: [
      { key: 'field-survey', i18nKey: 'item_field_survey', labelEn: 'Field Survey & Inspection', labelHi: 'क्षेत्रीय जीपीएस एवं फोटो सत्यापन', ico: '📍', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER'] },
      { key: 'map', i18nKey: 'item_map', labelEn: 'GIS Land Map', labelHi: 'भू-स्थानिक नक्शा', ico: '⚑', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'parcels', i18nKey: 'item_parcels', labelEn: 'Land Parcels', labelHi: 'खसरा / भूखंड', ico: '▦', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
    ]
  },
  {
    id: 'acquisition',
    groupKey: 'group_acquisition',
    groupFallback: 'Acquisition',
    items: [
      { key: 'cases', i18nKey: 'item_cases', labelEn: 'Acquisition Cases', labelHi: 'अधिग्रहण प्रकरण', ico: '◧', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'documents', i18nKey: 'item_documents', labelEn: 'Document Verification', labelHi: 'दस्तावेज़ सत्यापन', ico: '▤', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER'] },
      { key: 'e-agreements', i18nKey: 'item_agreements', labelEn: 'E-Agreements', labelHi: 'ई-समझौता', ico: '✍', roles: ['ADMIN', 'LAND_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'approvals', i18nKey: 'item_approvals', labelEn: 'Approvals & NOC', labelHi: 'अनुमोदन व अनापत्ति', ico: '✓', roles: ['ADMIN', 'PROJECT_AUTHORITY'] },
      { key: 'compensation', i18nKey: 'item_compensation', labelEn: 'Compensation & DBT', labelHi: 'प्रतिकर एवं डीबीटी', ico: '₹', roles: ['ADMIN', 'LAND_OFFICER', 'PROJECT_AUTHORITY'] },
    ]
  },
  {
    id: 'projects',
    groupKey: 'group_projects',
    groupFallback: 'Projects',
    items: [
      { key: 'projects', i18nKey: 'item_projects', labelEn: 'Infrastructure Projects', labelHi: 'अवसंरचना परियोजनाएं', ico: '◆', roles: ['ADMIN', 'PROJECT_AUTHORITY'] },
      { key: 'monitoring', i18nKey: 'item_monitoring', labelEn: 'Progress Monitoring', labelHi: 'प्रगति निगरानी', ico: '◔', roles: ['ADMIN', 'PROJECT_AUTHORITY'] },
      { key: 'decision-support', i18nKey: 'item_decision_support', labelEn: 'Decision Support', labelHi: 'निर्णय सहायता', ico: '⚖', roles: ['ADMIN', 'PROJECT_AUTHORITY'] },
    ]
  },
  {
    id: 'oversight',
    groupKey: 'group_oversight',
    groupFallback: 'Oversight & Admin',
    items: [
      { key: 'alerts', i18nKey: 'item_alerts', labelEn: 'Compliance Alerts', labelHi: 'सतर्कता सूचनाएं', ico: '!', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'audit', i18nKey: 'item_audit', labelEn: 'Audit Trail', labelHi: 'ऑडिट ट्रेल', ico: '≡', roles: ['ADMIN'] },
      { key: 'ai', i18nKey: 'item_ai', labelEn: 'AI Legal Assistant', labelHi: 'एआई सहायक', ico: '✦', roles: ['ADMIN', 'LAND_OFFICER', 'FIELD_OFFICER', 'PROJECT_AUTHORITY'] },
      { key: 'users', i18nKey: 'item_users', labelEn: 'User Roles & Access', labelHi: 'प्रयोक्ता प्रबंधन', ico: '☰', roles: ['ADMIN'] },
    ]
  },
];

function canSee(itemRoles) {
  if (!CURRENT_USER || !CURRENT_USER.role) return false;
  return itemRoles.includes(CURRENT_USER.role);
}

// Role-tailored pinned shortcuts
const ROLE_PINNED_ROUTES = {
  ADMIN: ['dashboard', 'cases', 'map', 'ai'],
  LAND_OFFICER: ['dashboard', 'cases', 'parcels', 'documents'],
  FIELD_OFFICER: ['field-survey', 'parcels', 'documents', 'map'],
  PROJECT_AUTHORITY: ['dashboard', 'projects', 'cases', 'map'],
  LAND_OWNER: ['my-land', 'e-agreements']
};

// Collapsible group state tracking
let sidebarExpandedGroups = new Set();
let sidebarSearchQuery = '';

function initSidebarGroupStates() {
  if (sidebarExpandedGroups.size > 0) return;
  const role = CURRENT_USER?.role || 'ADMIN';
  sidebarExpandedGroups.add('overview');
  if (role === 'PROJECT_AUTHORITY') {
    sidebarExpandedGroups.add('projects');
  } else if (role === 'LAND_OFFICER' || role === 'ADMIN') {
    sidebarExpandedGroups.add('acquisition');
  }
}

function toggleNavGroup(groupId) {
  if (sidebarExpandedGroups.has(groupId)) {
    sidebarExpandedGroups.delete(groupId);
  } else {
    sidebarExpandedGroups.add(groupId);
  }
  const groupEl = document.querySelector(`.nav-group[data-group-id="${groupId}"]`);
  if (groupEl) {
    groupEl.classList.toggle('collapsed', !sidebarExpandedGroups.has(groupId));
  }
}

function filterSidebarNav(query) {
  sidebarSearchQuery = (query || '').trim().toLowerCase();
  const searchInput = document.getElementById('sidebar-search');
  if (searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const noResultsEl = document.getElementById('sidebar-no-results');
  let totalVisible = 0;

  NAV_ITEMS.forEach(g => {
    const groupEl = document.querySelector(`.nav-group[data-group-id="${g.id}"]`);
    if (!groupEl) return;
    
    let groupMatches = 0;
    const items = groupEl.querySelectorAll('.nav-item');
    items.forEach(item => {
      const routeKey = item.dataset.route || '';
      const label = item.textContent.toLowerCase();
      const match = !sidebarSearchQuery || 
                    label.includes(sidebarSearchQuery) || 
                    routeKey.toLowerCase().includes(sidebarSearchQuery);
      item.style.display = match ? 'flex' : 'none';
      if (match) groupMatches++;
    });

    if (sidebarSearchQuery) {
      if (groupMatches > 0) {
        groupEl.style.display = 'block';
        groupEl.classList.remove('collapsed');
      } else {
        groupEl.style.display = 'none';
      }
    } else {
      groupEl.style.display = 'block';
      groupEl.classList.toggle('collapsed', !sidebarExpandedGroups.has(g.id));
    }
    totalVisible += groupMatches;
  });

  if (noResultsEl) {
    noResultsEl.style.display = (sidebarSearchQuery && totalVisible === 0) ? 'block' : 'none';
  }
}

function getItemLabel(item) {
  if (typeof t === 'function') {
    const def = (typeof currentLang !== 'undefined' && currentLang === 'hi') ? item.labelHi : item.labelEn;
    return t(item.i18nKey, def);
  }
  return (typeof currentLang !== 'undefined' && currentLang === 'hi') ? item.labelHi : item.labelEn;
}

function getGroupLabel(g) {
  if (typeof t === 'function') {
    return t(g.groupKey, g.groupFallback);
  }
  return g.groupFallback;
}

function renderSidebar(){
  const el = document.getElementById('sidebar');
  if (!el) return;

  initSidebarGroupStates();

  const portalBrand = (typeof t === 'function') ? t('portal_brand', 'GeoSetu-India') : 'GeoSetu-India';
  const portalSub = (typeof currentLang !== 'undefined' && currentLang === 'hi') 
    ? 'भारत सरकार केंद्रीय पोर्टल • भोपाल वृत्त' 
    : 'GoI Central Portal &bull; Bhopal Circle';

  let html = `
    <div class="sidebar-header">
      <div class="sidebar-emblem">GS</div>
      <div>
        <div class="sidebar-title">${portalBrand}</div>
        <div class="sidebar-sub">${portalSub}</div>
      </div>
    </div>

    <!-- Sidebar Search Box -->
    <div class="sidebar-search-box">
      <span class="sidebar-search-icon" aria-hidden="true">🔍</span>
      <input 
        type="text" 
        id="sidebar-search" 
        class="sidebar-search-input" 
        placeholder="${(typeof t === 'function') ? t('sidebar_search_placeholder', 'Search navigation...') : 'Search navigation...'}"
        value="${sidebarSearchQuery}"
        oninput="filterSidebarNav(this.value)"
        aria-label="Filter navigation items"
      />
    </div>
  `;

  // Frequently Used / Pinned Mini-Section
  const role = CURRENT_USER?.role || 'ADMIN';
  const pinnedKeys = ROLE_PINNED_ROUTES[role] || ['dashboard', 'cases'];
  const allItems = NAV_ITEMS.flatMap(g => g.items);
  const pinnedItems = pinnedKeys.map(k => allItems.find(i => i.key === k)).filter(Boolean).filter(i => canSee(i.roles));

  if (pinnedItems.length > 0 && !sidebarSearchQuery) {
    const pinnedTitle = (typeof t === 'function') ? t('group_pinned', 'Frequently Used') : 'Frequently Used';
    html += `
      <div class="sidebar-pinned">
        <div class="sidebar-pinned-title">
          <span>★</span> ${pinnedTitle}
        </div>
        <div class="sidebar-pinned-chips">
          ${pinnedItems.map(p => `
            <div class="sidebar-pinned-item ${CURRENT_ROUTE.name === p.key ? 'active' : ''}" data-route="${p.key}">
              <span>${p.ico}</span>
              <span>${getItemLabel(p)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // No search results placeholder
  const noMatchesText = (typeof t === 'function') ? t('no_nav_matches', 'No matching menu items found') : 'No matching menu items found';
  html += `<div id="sidebar-no-results" class="sidebar-no-results" style="display:none;">${noMatchesText}</div>`;

  // Collapsible Groups
  NAV_ITEMS.forEach(g => {
    const visible = g.items.filter(i => canSee(i.roles));
    if (!visible.length) return;

    const isCollapsed = !sidebarExpandedGroups.has(g.id);
    html += `
      <div class="nav-group ${isCollapsed ? 'collapsed' : ''}" data-group-id="${g.id}">
        <div class="nav-group-header" onclick="toggleNavGroup('${g.id}')" title="Toggle section">
          <div class="nav-group-title">
            <span>${getGroupLabel(g)}</span>
          </div>
          <div class="nav-group-meta">
            <span class="nav-group-count">${visible.length}</span>
            <span class="nav-group-chevron">▼</span>
          </div>
        </div>
        <div class="nav-group-items">
          ${visible.map(i => `
            <div class="nav-item ${CURRENT_ROUTE.name === i.key ? 'active' : ''}" data-route="${i.key}">
              <span class="nav-ico">${i.ico}</span>
              <span>${getItemLabel(i)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  // System Group
  const systemLabel = (typeof t === 'function') ? t('group_system', 'System') : 'System';
  const resetDataLabel = (typeof t === 'function') ? t('item_reset_data', 'Reset Demo Data') : 'Reset Demo Data';
  html += `
    <div class="nav-group">
      <div class="nav-label">${systemLabel}</div>
      <div class="nav-item" data-action="reset-data">
        <span class="nav-ico">↺</span>
        <span>${resetDataLabel}</span>
      </div>
    </div>
  `;

  el.innerHTML = html;

  // Bind clicks
  el.querySelectorAll('[data-route]').forEach(n => {
    n.addEventListener('click', () => navigate(n.dataset.route));
  });

  const resetBtn = el.querySelector('[data-action="reset-data"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmPrompt = (typeof currentLang !== 'undefined' && currentLang === 'hi')
        ? 'पुष्टि करें: क्या आप सभी डेमो भू-अभिलेखों को मूल स्थिति में पुनर्स्थापित करना चाहते हैं?'
        : 'Confirm: Do you want to reset all demo land acquisition records to original state?';
      if (confirm(confirmPrompt)) {
        resetDB();
        const toastMsg = (typeof currentLang !== 'undefined' && currentLang === 'hi')
          ? 'केंद्रीय डाटाबेस पुनर्स्थापित किया गया।'
          : 'Central demo database restored.';
        toast(toastMsg);
        navigate(CURRENT_ROUTE.name, CURRENT_ROUTE.param);
      }
    });
  }

  // Re-apply search filter if one was active
  if (sidebarSearchQuery) {
    filterSidebarNav(sidebarSearchQuery);
  }
}

/* ---------------- ROUTER ---------------- */
let CURRENT_ROUTE = {name:'dashboard', param:null};
const TITLES = {
  'dashboard':['Overview','Central Monitoring & DBT Dashboard'],
  'my-land':['Citizen Portal','My Registered Land Holdings & Khasra'],
  'field-survey':['Field Inspection Terminal','GPS & Geotagged Parcel Ground Verification (Patwari / Surveyor)'],
  'map':['GIS System','GIS Cadastral Land Parcel Map'],
  'parcels':['Revenue Records','Land Parcels Directory (Khasra/RoR)'],
  'parcel-detail':['Revenue Records','Cadastral Parcel Dossier'],
  'cases':['Acquisition Proceedings','Statutory Acquisition Cases (RFCTLARR 2013)'],
  'case-detail':['Acquisition Proceedings','Case Proceeding Dossier'],
  'documents':['Verification Queue','Document Verification & Discrepancy Checks'],
  'e-agreements':['Digital Governance','Digital Land Acquisition E-Agreements'],
  'approvals':['Statutory Clearances','Competent Authority Sanctions & NOC'],
  'compensation':['DBT Disbursal','Compensation Award Determination & DBT'],
  'projects':['National Infrastructure','National Infrastructure Priority Corridors'],
  'project-detail':['National Infrastructure','Project Alignment Dossier'],
  'monitoring':['Physical Progress','Acquisition Milestone & Handover Monitoring'],
  'decision-support':['Decision Support','Geospatial Alignment & Parcel Feasibility DSS'],
  'alerts':['Statutory Vigilance','Compliance Alerts & Statutory Delays'],
  'audit':['Audit Trail','Immutable Cryptographic Audit Trail'],
  'ai':['Digital India AI','GeoSetu-India AI Assistant & Legal Enquiry'],
  'users':['Administration','Portal User Roles & Jurisdiction Directory']
};

function navigate(name, param){
  CURRENT_ROUTE = {name, param};
  document.querySelectorAll('.nav-item, .sidebar-pinned-item').forEach(n => {
    n.classList.toggle('active', n.dataset.route === name);
  });

  const tInfo = (typeof getRouteTitle === 'function') ? getRouteTitle(name) : (TITLES[name] || ['GeoSetu-India','Portal']); 
  const crumbEl = document.getElementById('topbar-crumb');
  const titleEl = document.getElementById('topbar-title');
  if (crumbEl) crumbEl.textContent = tInfo[0];
  if (titleEl) titleEl.innerHTML = tInfo[1];

  const c = document.getElementById('content');
  if (c) {
    c.innerHTML = '';
    const renderer = ROUTES[name];
    if (renderer) {
      renderer(c, param);
    } else {
      const notFoundText = (typeof currentLang !== 'undefined' && currentLang === 'hi')
        ? 'अभिलेख उपलब्ध नहीं है'
        : 'Record Not Found';
      c.innerHTML = `<div class="empty">${notFoundText}</div>`;
    }
  }
  
  if (window.MobileLayout && typeof window.MobileLayout.sync === 'function') {
    window.MobileLayout.sync(window.Device ? window.Device.getMode() : 'desktop');
  }

  window.scrollTo(0,0);
}
const ROUTES = {};

/* ---------------- SHARED RENDER HELPERS ---------------- */
function ownerName(id){ const o=DB.owners.find(x=>x.id===id); return o? o.name : '—'; }
function projectName(id){ const p=DB.projects.find(x=>x.id===id); return p? p.name : '—'; }
function parcelById(id){ return DB.parcels.find(x=>x.id===id); }
function caseById(id){ return DB.cases.find(x=>x.id===id); }
function projectById(id){ return DB.projects.find(x=>x.id===id); }
function docsForCase(id){ return DB.documents.filter(d=>d.caseId===id); }
function compForCase(id){ return DB.compensation.find(c=>c.caseId===id); }
function approvalsForCase(id){ return DB.approvals.filter(a=>a.caseId===id); }

function statCard(label, value, sub, cls, stripeClass){
  return `
    <div class="card stat-card ${stripeClass||'stripe-navy'} ${cls||''}">
      <div class="stat-num">${value}</div>
      <div class="stat-label">${label}</div>
      ${sub?`<div class="stat-sub">${sub}</div>`:''}
    </div>
  `;
}
function docStatusBadge(s){ return `<span class="${statusBadgeClass(s)}">${s}</span>`; }
function parcelStatusBadge(s){ return `<span class="${statusBadgeClass(s)}">${s}</span>`; }
function workflowBadge(s){ return `<span class="${statusBadgeClass(s)}">${(typeof getWorkflowLabel === 'function') ? getWorkflowLabel(s) : WORKFLOW_LABELS[s]}</span>`; }

function renderStepper(currentState){
  const idx = WORKFLOW_STATES.indexOf(currentState);
  const legalNote = WORKFLOW_RFCTLARR_NOTES[currentState] || 'RFCTLARR Act 2013 Statutory Legal Compliance Pipeline';
  return `
    <div class="stepper-wrap">
      <div class="stepper">
        ${WORKFLOW_STATES.map((s,i)=>{
          const cls = i<idx?'done': (i===idx?'current':'');
          const label = (typeof getWorkflowLabel === 'function') ? getWorkflowLabel(s) : WORKFLOW_LABELS[s];
          const sec = (typeof WORKFLOW_SECTIONS !== 'undefined') ? WORKFLOW_SECTIONS[s] : '';
          const note = (typeof WORKFLOW_RFCTLARR_NOTES !== 'undefined') ? WORKFLOW_RFCTLARR_NOTES[s] : '';
          return `
            <div class="step ${cls}" title="${escapeHtml(note)}">
              <span class="dot"></span>
              <span class="step-label">
                ${label}
                ${sec ? `<span class="sec-badge">${sec}</span>` : ''}
              </span>
            </div>
            ${i < WORKFLOW_STATES.length - 1 ? '<div class="step-connector"></div>' : ''}
          `;
        }).join('')}
      </div>

      <!-- Statutory RFCTLARR Act 2013 legal reference banner -->
      <div class="stepper-legal-banner">
        <span class="legal-badge">⚖️ RFCTLARR ACT 2013 STATUTORY REFERENCE</span>
        <span class="legal-note-text">${legalNote}</span>
      </div>
    </div>
  `;
}

function openModal(innerHtml){
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-bg" id="modal-bg"><div class="modal">${innerHtml}</div></div>`;
  root.querySelector('#modal-bg').addEventListener('click', (e)=>{ if(e.target.id==='modal-bg') closeModal(); });
}
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }