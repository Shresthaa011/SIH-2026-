/* ==========================================================================
   TERRABYTE (टेराबाइट) — MOBILE LAYOUT COMPONENT & INTERFACE ENGINE
   Mobile-first navigation shell with slide-out drawer, bottom quick nav,
   larger tap targets (48px+), and stacked responsive content density
   ========================================================================== */

(function (window) {
  'use strict';

  let drawerOpen = false;

  function renderMobileShell() {
    // Avoid double insertion
    if (document.getElementById('mobile-shell-root')) return;

    const root = document.createElement('div');
    root.id = 'mobile-shell-root';
    root.className = 'mobile-shell-container';

    root.innerHTML = `
      <!-- Mobile Top Navigation Bar -->
      <header class="mobile-topbar" role="banner">
        <button class="mobile-drawer-toggle" id="mobile-drawer-btn" aria-label="Open Navigation Menu" onclick="MobileLayout.toggleDrawer()">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>

        <div class="mobile-brand" onclick="MobileLayout.handleBrandClick()" role="button" tabindex="0">
          <div class="mobile-brand-emblem">TB</div>
          <div class="mobile-brand-text">
            <span class="mobile-brand-title">TerraByte</span>
            <span class="mobile-brand-sub" id="mobile-route-badge">Govt. of India</span>
          </div>
        </div>

        <div class="mobile-topbar-actions">
          <!-- Quick Font Scaling -->
          <div class="mobile-font-group">
            <button class="mobile-font-btn font-btn" onclick="setFontSize(-1)" title="Small Text">A-</button>
            <button class="mobile-font-btn font-btn" onclick="setFontSize(0)" title="Normal Text">A</button>
            <button class="mobile-font-btn font-btn" onclick="setFontSize(1)" title="Large Text">A+</button>
          </div>

          <!-- Language Selector -->
          <div class="mobile-lang-wrap" title="Select Language">
            <select id="mobile-lang-select" class="mobile-lang-select" onchange="setLanguage(this.value)" aria-label="Language Selector">
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
              <option value="gu">ગુજરાતી</option>
              <option value="ur">اردو</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="or">ଓଡ଼ିଆ</option>
              <option value="ml">മലയാളം</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="as">অসমীয়া</option>
              <option value="mai">मैथिली</option>
              <option value="sa">संस्कृतम्</option>
              <option value="kok">कोंकणी</option>
              <option value="sd">सिन्धी</option>
              <option value="doi">डोगरी</option>
              <option value="mni">মৈতৈलोन्</option>
              <option value="ne">नेपाली</option>
              <option value="brx">बड़ो</option>
              <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ</option>
              <option value="ks">कश्मीरी</option>
            </select>
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer Overlay & Panel -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay" onclick="MobileLayout.closeDrawer()"></div>
      <aside class="mobile-drawer" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        <div class="mobile-drawer-header">
          <div class="mobile-drawer-user-card" id="mobile-drawer-user">
            <!-- Populated dynamically based on CURRENT_USER -->
          </div>
          <button class="mobile-drawer-close" aria-label="Close Navigation Menu" onclick="MobileLayout.closeDrawer()">✕</button>
        </div>

        <!-- Mobile Drawer Search -->
        <div class="mobile-drawer-search-box">
          <span class="mobile-search-icon">🔍</span>
          <input 
            type="text" 
            id="mobile-drawer-search" 
            class="mobile-drawer-search-input" 
            placeholder="Search modules..." 
            oninput="MobileLayout.filterNav(this.value)"
            aria-label="Filter modules"
          />
        </div>

        <!-- Mobile Drawer Menu List -->
        <div class="mobile-drawer-body" id="mobile-drawer-nav">
          <!-- Populated dynamically by MobileLayout.renderNav() -->
        </div>

        <!-- Mobile Drawer Footer Actions -->
        <div class="mobile-drawer-footer">
          <button class="btn btn-secondary btn-device-toggle" onclick="Device.toggleMode()" style="width:100%;margin-bottom:8px;">
            🖥️ Desktop Site
          </button>
          <div class="mobile-drawer-subinfo">
            TerraByte Mobile v2.1 • GIGW 3.0 Aligned
          </div>
        </div>
      </aside>

      <!-- Mobile Bottom Navigation Bar (Thumb Friendly) -->
      <nav class="mobile-bottom-nav" id="mobile-bottom-nav" aria-label="Bottom Quick Navigation">
        <button class="bottom-nav-item active" data-tab="home" onclick="MobileLayout.handleBottomNav('home')">
          <span class="bottom-nav-ico">⌂</span>
          <span class="bottom-nav-lbl" id="lbl-bnav-home">Home</span>
        </button>
        <button class="bottom-nav-item" data-tab="cases" onclick="MobileLayout.handleBottomNav('cases')">
          <span class="bottom-nav-ico">◧</span>
          <span class="bottom-nav-lbl" id="lbl-bnav-cases">Cases</span>
        </button>
        <button class="bottom-nav-item" data-tab="map" onclick="MobileLayout.handleBottomNav('map')">
          <span class="bottom-nav-ico">⚑</span>
          <span class="bottom-nav-lbl" id="lbl-bnav-map">GIS Map</span>
        </button>
        <button class="bottom-nav-item" data-tab="alerts" onclick="MobileLayout.handleBottomNav('alerts')">
          <span class="bottom-nav-ico">✦</span>
          <span class="bottom-nav-lbl" id="lbl-bnav-ai">AI Assist</span>
        </button>
        <button class="bottom-nav-item" data-tab="menu" onclick="MobileLayout.toggleDrawer()">
          <span class="bottom-nav-ico">☰</span>
          <span class="bottom-nav-lbl" id="lbl-bnav-menu">Menu</span>
        </button>
      </nav>
    `;

    document.body.prepend(root);
    syncMobileLanguageSelect();
    updateUserCard();
    renderNav();
  }

  function syncMobileLanguageSelect() {
    const sel = document.getElementById('mobile-lang-select');
    if (sel && typeof currentLang !== 'undefined') {
      sel.value = currentLang;
    }
  }

  function updateUserCard() {
    const card = document.getElementById('mobile-drawer-user');
    if (!card) return;

    if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
      const roleLabel = (typeof getRoleLabel === 'function') ? getRoleLabel(CURRENT_USER.role) : CURRENT_USER.role;
      card.innerHTML = `
        <div class="mobile-user-avatar">${CURRENT_USER.name.charAt(0)}</div>
        <div class="mobile-user-meta">
          <div class="mobile-user-name">${CURRENT_USER.name}</div>
          <div class="mobile-user-role">${roleLabel}</div>
          <div class="mobile-user-circle">Bhopal Circle, MP</div>
        </div>
      `;
    } else {
      const loginText = (typeof t === 'function') ? t('nav_login', 'LOGIN / SSO') : 'LOGIN / SSO';
      card.innerHTML = `
        <div class="mobile-user-avatar">🏛️</div>
        <div class="mobile-user-meta">
          <div class="mobile-user-name">Government of India</div>
          <div class="mobile-user-role">Department of Land Resources</div>
          <button class="btn btn-sm btn-saffron" onclick="MobileLayout.closeDrawer(); showLoginPage();" style="margin-top:6px;width:100%;">
            🔑 ${loginText}
          </button>
        </div>
      `;
    }
  }

  function renderNav(query) {
    const navContainer = document.getElementById('mobile-drawer-nav');
    if (!navContainer) return;

    query = (query || '').toLowerCase().trim();
    let html = '';

    // If logged in: render module navigation
    if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER && typeof NAV_ITEMS !== 'undefined') {
      // Pinned / Frequently Used Section
      const role = CURRENT_USER.role;
      const pinnedKeys = (typeof ROLE_PINNED_ROUTES !== 'undefined' && ROLE_PINNED_ROUTES[role]) || ['dashboard', 'cases', 'map', 'ai'];
      const allItems = NAV_ITEMS.flatMap(g => g.items);
      const pinnedItems = pinnedKeys.map(k => allItems.find(i => i.key === k)).filter(Boolean).filter(i => typeof canSee === 'function' ? canSee(i.roles) : true);

      if (pinnedItems.length > 0 && !query) {
        const pinnedTitle = (typeof t === 'function') ? t('group_pinned', 'Frequently Used') : 'Frequently Used';
        html += `
          <div class="mobile-drawer-section">
            <div class="mobile-drawer-section-title">★ ${pinnedTitle}</div>
            <div class="mobile-quick-grid">
              ${pinnedItems.map(p => {
                const label = (typeof getItemLabel === 'function') ? getItemLabel(p) : (p.labelEn || p.key);
                const isActive = (typeof CURRENT_ROUTE !== 'undefined' && CURRENT_ROUTE.name === p.key);
                return `
                  <button class="mobile-quick-btn ${isActive ? 'active' : ''}" onclick="MobileLayout.navTo('${p.key}')">
                    <span class="mobile-quick-ico">${p.ico}</span>
                    <span class="mobile-quick-txt">${label}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Grouped Sections
      NAV_ITEMS.forEach(g => {
        const visible = g.items.filter(i => typeof canSee === 'function' ? canSee(i.roles) : true);
        if (!visible.length) return;

        const filtered = visible.filter(i => {
          if (!query) return true;
          const label = (typeof getItemLabel === 'function') ? getItemLabel(i) : (i.labelEn || '');
          return label.toLowerCase().includes(query) || i.key.toLowerCase().includes(query);
        });

        if (!filtered.length) return;

        const groupTitle = (typeof getGroupLabel === 'function') ? getGroupLabel(g) : (g.groupFallback || g.id);
        html += `
          <div class="mobile-nav-group">
            <div class="mobile-nav-group-header">
              <span>${groupTitle}</span>
              <span class="mobile-nav-badge">${filtered.length}</span>
            </div>
            <div class="mobile-nav-group-items">
              ${filtered.map(i => {
                const label = (typeof getItemLabel === 'function') ? getItemLabel(i) : (i.labelEn || i.key);
                const isActive = (typeof CURRENT_ROUTE !== 'undefined' && CURRENT_ROUTE.name === i.key);
                return `
                  <button class="mobile-nav-item ${isActive ? 'active' : ''}" onclick="MobileLayout.navTo('${i.key}')">
                    <span class="mobile-nav-ico">${i.ico}</span>
                    <span class="mobile-nav-txt">${label}</span>
                    <span class="mobile-nav-arrow">›</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });

      // System Actions
      const resetLabel = (typeof t === 'function') ? t('item_reset_data', 'Reset Demo Data') : 'Reset Demo Data';
      const logoutLabel = (typeof t === 'function') ? t('nav_logout', 'Sign Out') : 'Sign Out';
      html += `
        <div class="mobile-nav-group">
          <div class="mobile-nav-group-header"><span>System & Session</span></div>
          <button class="mobile-nav-item" onclick="MobileLayout.handleResetDB()">
            <span class="mobile-nav-ico">↺</span>
            <span class="mobile-nav-txt">${resetLabel}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
          <button class="mobile-nav-item text-danger" onclick="MobileLayout.closeDrawer(); logout();">
            <span class="mobile-nav-ico">🚪</span>
            <span class="mobile-nav-txt">${logoutLabel}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
        </div>
      `;

    } else {
      // Public Home Screen Navigation
      const navHome = (typeof t === 'function') ? t('nav_home', 'HOME') : 'HOME';
      const navAbout = (typeof t === 'function') ? t('nav_about', 'ABOUT US') : 'ABOUT US';
      const navAcq = (typeof t === 'function') ? t('nav_acquisition', 'LAND ACQUISITION') : 'LAND ACQUISITION';
      const navLogin = (typeof t === 'function') ? t('nav_login', 'LOGIN / SSO') : 'LOGIN / SSO';
      const navHelp = (typeof t === 'function') ? t('contact_btn', 'Helpdesk') : 'Helpdesk';

      html += `
        <div class="mobile-nav-group">
          <div class="mobile-nav-group-header"><span>Portal Navigation</span></div>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); showHomeScreen(); switchPublicTab('overview');">
            <span class="mobile-nav-ico">⌂</span>
            <span class="mobile-nav-txt">${navHome}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); showHomeScreen(); switchPublicTab('inquiry');">
            <span class="mobile-nav-ico">🔍</span>
            <span class="mobile-nav-txt">Citizen Inquiry & Objections</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); showHomeScreen(); switchPublicTab('overview');">
            <span class="mobile-nav-ico">ℹ️</span>
            <span class="mobile-nav-txt">${navAbout}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); showHomeScreen(); switchPublicTab('overview');">
            <span class="mobile-nav-ico">📜</span>
            <span class="mobile-nav-txt">${navAcq} (RFCTLARR 2013)</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); openContactModal();">
            <span class="mobile-nav-ico">📞</span>
            <span class="mobile-nav-txt">${navHelp}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
        </div>

        <div class="mobile-nav-group">
          <div class="mobile-nav-group-header"><span>Official Access</span></div>
          <button class="mobile-nav-item" onclick="MobileLayout.closeDrawer(); showLoginPage();">
            <span class="mobile-nav-ico">🔑</span>
            <span class="mobile-nav-txt">${navLogin}</span>
            <span class="mobile-nav-arrow">›</span>
          </button>
        </div>
      `;
    }

    navContainer.innerHTML = html;
  }

  function openDrawer() {
    drawerOpen = true;
    const overlay = document.getElementById('mobile-drawer-overlay');
    const drawer = document.getElementById('mobile-drawer');
    const toggle = document.getElementById('mobile-drawer-btn');
    if (overlay) overlay.classList.add('open');
    if (drawer) drawer.classList.add('open');
    if (toggle) toggle.classList.add('active');
    document.body.classList.add('drawer-locked');
    updateUserCard();
    renderNav();
  }

  function closeDrawer() {
    drawerOpen = false;
    const overlay = document.getElementById('mobile-drawer-overlay');
    const drawer = document.getElementById('mobile-drawer');
    const toggle = document.getElementById('mobile-drawer-btn');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    if (toggle) toggle.classList.remove('active');
    document.body.classList.remove('drawer-locked');
  }

  function toggleDrawer() {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  }

  function navTo(routeKey) {
    closeDrawer();
    if (typeof navigate === 'function') {
      navigate(routeKey);
    }
    updateRouteBadge(routeKey);
    updateBottomNavState(routeKey);
  }

  function updateRouteBadge(routeKey) {
    const badge = document.getElementById('mobile-route-badge');
    if (!badge) return;
    const titles = (typeof getRouteTitle === 'function') ? getRouteTitle(routeKey) : null;
    if (titles && titles[0]) {
      badge.textContent = titles[0];
    } else {
      badge.textContent = 'TerraByte Portal';
    }
  }

  function updateBottomNavState(routeKey) {
    document.querySelectorAll('.bottom-nav-item').forEach(b => {
      b.classList.remove('active');
    });

    if (!routeKey || routeKey === 'dashboard') {
      document.querySelector('.bottom-nav-item[data-tab="home"]')?.classList.add('active');
    } else if (routeKey === 'cases' || routeKey === 'parcels' || routeKey === 'my-land') {
      document.querySelector('.bottom-nav-item[data-tab="cases"]')?.classList.add('active');
    } else if (routeKey === 'map') {
      document.querySelector('.bottom-nav-item[data-tab="map"]')?.classList.add('active');
    } else if (routeKey === 'ai' || routeKey === 'alerts') {
      document.querySelector('.bottom-nav-item[data-tab="alerts"]')?.classList.add('active');
    }
  }

  function handleBottomNav(tab) {
    if (tab === 'home') {
      if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
        navTo(CURRENT_USER.role === 'LAND_OWNER' ? 'my-land' : 'dashboard');
      } else {
        showHomeScreen();
        switchPublicTab('overview');
      }
    } else if (tab === 'cases') {
      if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
        navTo(CURRENT_USER.role === 'LAND_OWNER' ? 'my-land' : 'cases');
      } else {
        showHomeScreen();
        switchPublicTab('inquiry');
      }
    } else if (tab === 'map') {
      if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
        navTo('map');
      } else {
        showHomeScreen();
        switchPublicTab('overview');
        const mapSec = document.getElementById('map-preview');
        if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'alerts') {
      if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
        navTo('ai');
      } else {
        openContactModal();
      }
    } else if (tab === 'menu') {
      toggleDrawer();
    }
  }

  function handleBrandClick() {
    if (typeof CURRENT_USER !== 'undefined' && CURRENT_USER) {
      navTo('dashboard');
    } else {
      showHomeScreen();
    }
  }

  function handleResetDB() {
    closeDrawer();
    const promptText = (typeof currentLang !== 'undefined' && currentLang === 'hi')
      ? 'पुष्टि करें: क्या आप सभी डेमो भू-अभिलेखों को मूल स्थिति में पुनर्स्थापित करना चाहते हैं?'
      : 'Confirm: Do you want to reset all demo land acquisition records to original state?';
    if (confirm(promptText)) {
      resetDB();
      const toastMsg = (typeof currentLang !== 'undefined' && currentLang === 'hi')
        ? 'केंद्रीय डाटाबेस पुनर्स्थापित किया गया।'
        : 'Central demo database restored.';
      toast(toastMsg);
      if (typeof CURRENT_ROUTE !== 'undefined' && CURRENT_ROUTE) {
        navigate(CURRENT_ROUTE.name, CURRENT_ROUTE.param);
      }
    }
  }

  function filterNav(val) {
    renderNav(val);
  }

  // Sync Mobile Shell with Device Mode
  function syncLayoutState(mode) {
    renderMobileShell();
    syncMobileLanguageSelect();
    updateUserCard();
    renderNav();

    if (mode === 'desktop') {
      closeDrawer();
    } else if (typeof CURRENT_ROUTE !== 'undefined' && CURRENT_ROUTE) {
      updateRouteBadge(CURRENT_ROUTE.name);
      updateBottomNavState(CURRENT_ROUTE.name);
    }
  }

  // Register device switch listener
  if (window.Device && typeof window.Device.addListener === 'function') {
    window.Device.addListener((newMode) => {
      syncLayoutState(newMode);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderMobileShell();
    if (window.Device) {
      syncLayoutState(window.Device.getMode());
    }
  });

  // Public MobileLayout API
  window.MobileLayout = {
    render: renderMobileShell,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toggleDrawer: toggleDrawer,
    navTo: navTo,
    filterNav: filterNav,
    handleBottomNav: handleBottomNav,
    handleBrandClick: handleBrandClick,
    handleResetDB: handleResetDB,
    updateUserCard: updateUserCard,
    sync: syncLayoutState
  };

})(window);
