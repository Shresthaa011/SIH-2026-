/* --------------------------------------------------------------------------
   TERRABYTE (टेराबाइट) — AUTHENTICATION, ACCESSIBILITY & GIGW SYSTEM
   -------------------------------------------------------------------------- */

let CURRENT_USER = null;
const SESSION_KEY = 'terrabyte_session_v1';
let CURRENT_CAPTCHA = '';

/* Captcha Generator */
function generateCaptcha() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let str = '';
  for (let i = 0; i < 5; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  CURRENT_CAPTCHA = str;
  const disp = document.getElementById('captcha-display');
  if (disp) disp.textContent = str;
}

/* Font Sizing Controls (GIGW Compliant A- A A+) */
let currentFontSizeLevel = 'base';
function setFontSize(level) {
  let scale = 'base';
  let pxSize = '14px';

  if (level === -1 || level === 'sm' || level === 'small') {
    scale = 'sm';
    pxSize = '12px';
  } else if (level === 1 || level === 'lg' || level === 'large') {
    scale = 'lg';
    pxSize = '17px';
  } else if (level === 2 || level === 'xl') {
    scale = 'xl';
    pxSize = '20px';
  } else {
    scale = 'base';
    pxSize = '14px';
  }

  currentFontSizeLevel = scale;
  const root = document.documentElement;
  root.style.fontSize = pxSize;
  root.style.setProperty('--font-base-size', pxSize);

  root.classList.remove('text-scale-sm', 'text-scale-base', 'text-scale-lg', 'text-scale-xl');
  root.classList.add(`text-scale-${scale}`);

  // Highlight buttons with both .font-sizer-btn and .font-btn
  document.querySelectorAll('.font-sizer-btn, .font-btn').forEach(b => {
    b.classList.remove('active');
    const bScale = b.getAttribute('data-scale');
    const text = b.textContent.trim();
    if (bScale === scale || 
        (scale === 'sm' && (bScale === '-1' || text.startsWith('A-'))) ||
        (scale === 'base' && (bScale === '0' || text === 'A' || text.startsWith('A ('))) ||
        (scale === 'lg' && (bScale === '1' || text.startsWith('A+')))) {
      b.classList.add('active');
    }
  });

  try {
    localStorage.setItem('terrabyte_font_scale', scale);
  } catch (e) {}
}

// Restore saved font scale immediately
try {
  const savedScale = localStorage.getItem('terrabyte_font_scale');
  if (savedScale) {
    setFontSize(savedScale);
  }
} catch (e) {}

/* Language Switcher (Delegated to GIGW i18n system) */
function toggleLanguage() {
  if (typeof setLanguage === 'function') {
    const nextLang = (typeof currentLang !== 'undefined' && currentLang === 'hi') ? 'en' : 'hi';
    setLanguage(nextLang);
  }
}

/* Live Indian Standard Time (IST) Clock */
function updateLiveClock() {
  const now = new Date();
  const dateOpts = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  };
  const timeOpts = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  };

  const datePart = now.toLocaleDateString('en-IN', dateOpts);
  const timePart = now.toLocaleTimeString('en-IN', timeOpts);
  const text = `${datePart}, ${timePart} IST`;

  const clockEl = document.getElementById('ist-clock');
  if (clockEl) clockEl.textContent = text;
  
  const bandClock = document.getElementById('band-ist-clock');
  if (bandClock) bandClock.textContent = `IST: ${text}`;
}
setInterval(updateLiveClock, 1000);

/* High Contrast Mode Toggle */
function toggleContrastMode(mode) {
  const root = document.documentElement;
  if (mode === 'high-contrast') {
    root.classList.add('high-contrast');
    toast('उच्च कंट्रास्ट मोड सक्रिय (High Contrast Active)');
  } else if (mode === 'normal') {
    root.classList.remove('high-contrast');
    toast('सामान्य दृश्य मोड सक्रिय (Normal Mode Active)');
  } else {
    const isHigh = root.classList.toggle('high-contrast');
    toast(isHigh ? 'उच्च कंट्रास्ट मोड सक्रिय (High Contrast Active)' : 'सामान्य दृश्य मोड सक्रिय (Normal Mode Active)');
  }
}

/* Reduced Motion Mode Toggle */
function toggleReducedMotion() {
  const isReduced = document.documentElement.classList.toggle('reduced-motion');
  toast(isReduced ? 'Reduced Motion: चालू (ON)' : 'Reduced Motion: बंद (OFF)');
}

/* ============ HERO IMAGE CAROUSEL LOGIC ============ */
let currentSlide = 0;
let carouselTimer = null;

function getTotalSlides() {
  const track = document.getElementById('carousel-track');
  if (track) {
    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length > 0) return slides.length;
  }
  return 6;
}

function showSlide(idx) {
  const total = getTotalSlides();
  currentSlide = (idx + total) % total;
  const track = document.getElementById('carousel-track');
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
    dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
  });
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

function initCarousel() {
  showSlide(0);
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 5000);

  const wrap = document.getElementById('hero-carousel');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    wrap.addEventListener('mouseleave', () => {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(nextSlide, 5000);
    });
  }
}

/* ============ PUBLIC TABS SWITCHER & CARD ANIMATIONS ============ */
function triggerDashboardAnimations() {
  const grid = document.querySelector('.metric-grid');
  if (grid) {
    grid.classList.remove('animate-dash-cards');
    void grid.offsetWidth; // Force DOM reflow to restart CSS keyframe animations
    grid.classList.add('animate-dash-cards');
  }
}

function switchPublicTab(tabId) {
  document.querySelectorAll('.gov-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.public-tab-panel').forEach(p => p.style.display = 'none');
  
  const activeBtn = document.getElementById('tab-btn-' + tabId);
  const activePanel = document.getElementById('panel-' + tabId);
  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) {
    activePanel.style.display = 'block';
    if (tabId === 'overview') {
      triggerDashboardAnimations();
    }
  }
}

/* ============ ABOUT US READ MORE TOGGLE ============ */
function toggleAboutReadMore() {
  const more = document.getElementById('about-more-content');
  const btn = document.getElementById('btn-about-toggle');
  if (more && btn) {
    const isHidden = more.style.display === 'none' || !more.style.display;
    more.style.display = isHidden ? 'block' : 'none';
    btn.innerHTML = isHidden ? 'विस्तृत विवरण छिपाएं / Read Less ▲' : 'विस्तृत विवरण देखें / Read More ▼';
  }
}

/* ============ CITIZEN INQUIRY FORM ============ */
function handleInquirySubmit(e) {
  e.preventDefault();
  const surveyNo = document.getElementById('inq-survey').value.trim();
  const khasra = document.getElementById('inq-khasra').value.trim();
  const state = document.getElementById('inq-state').value;
  const name = document.getElementById('inq-name').value.trim();
  const mobile = document.getElementById('inq-mobile').value.trim();
  const declaration = document.getElementById('statutory-declaration').checked;

  if (!declaration) {
    alert('Please verify the statutory declaration checkbox under Section 84 of RFCTLARR Act 2013.');
    return;
  }

  const trackingId = 'TB-INQ-' + Math.floor(100000 + Math.random() * 900000);
  
  openModal(`
    <div class="modal-header">
      <div class="modal-title">✓ नागरिक पूछताछ पंजीकृत / Inquiry Submitted</div>
      <button class="modal-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body" style="text-align:center;padding:24px;">
      <div style="width:48px;height:48px;background:#d1fae5;color:#065f46;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 12px;">✓</div>
      <h3 style="color:var(--gov-navy);margin-bottom:6px;">Inquiry Registered Successfully</h3>
      <p style="font-size:12px;color:var(--gov-text-muted);margin-bottom:14px;">Your land inquiry has been logged in the National Land Acquisition Portal.</p>
      
      <div style="background:#f8fafc;border:1px dashed var(--gov-border);padding:12px;border-radius:4px;margin-bottom:16px;text-align:left;">
        <div class="kv"><span>Tracking Reference ID:</span><span style="font-family:var(--font-mono);color:var(--gov-blue);">${trackingId}</span></div>
        <div class="kv"><span>Khatedar Name:</span><span>${name}</span></div>
        <div class="kv"><span>Survey & Khasra No.:</span><span>${surveyNo} (Khasra ${khasra})</span></div>
        <div class="kv"><span>State & Jurisdiction:</span><span>${state}</span></div>
        <div class="kv"><span>Aadhaar Mobile:</span><span>+91-XXXXXX${mobile.slice(-4)}</span></div>
        <div class="kv"><span>Action Office:</span><span>CALA / Revenue Sub-Division</span></div>
      </div>

      <p style="font-size:11px;color:#64748b;">SMS confirmation with tracking link dispatched to your registered mobile number.</p>
      <button class="btn btn-navy" style="width:100%;margin-top:14px;" onclick="closeModal()">Close / बंद करें</button>
    </div>
  `);

  e.target.reset();
}

/* ============ GOV ACCESSIBILITY MODALS ============ */
function openAccessibilityModal() {
  openModal(`
    <div class="modal-header">
      <div class="modal-title">♿ Accessibility Options & Compliance (GIGW 3.0)</div>
      <button class="modal-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="background:#f8fafc;border:1px solid var(--gov-border);padding:14px;border-radius:4px;margin-bottom:16px;">
        <h4 style="color:var(--gov-navy);margin-bottom:8px;font-size:13px;">Visual & Display Adjustments</h4>
        
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--gov-border);">
          <div>
            <div style="font-weight:700;">Text Scaling:</div>
            <div style="font-size:11px;color:var(--gov-text-muted);">Adjust font size proportionally across portal.</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-secondary font-btn" data-scale="sm" onclick="setFontSize(-1)">A- (Small)</button>
            <button class="btn btn-sm btn-secondary font-btn" data-scale="base" onclick="setFontSize(0)">A (Normal)</button>
            <button class="btn btn-sm btn-secondary font-btn" data-scale="lg" onclick="setFontSize(1)">A+ (Large)</button>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--gov-border);">
          <div>
            <div style="font-weight:700;">High Contrast Mode:</div>
            <div style="font-size:11px;color:var(--gov-text-muted);">Optimal contrast view for low-vision citizens.</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-secondary" onclick="toggleContrastMode('normal')">Normal</button>
            <button class="btn btn-sm btn-saffron" onclick="toggleContrastMode('high-contrast')">High Contrast</button>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;">Reduced Motion Mode:</div>
            <div style="font-size:11px;color:var(--gov-text-muted);">Disable transitions and animations across ticker and carousel.</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="toggleReducedMotion()">Toggle Motion</button>
        </div>
      </div>

      <h4 style="color:var(--gov-navy);margin-bottom:6px;font-size:13px;">GIGW 3.0 & WCAG 2.1 Level AA Statement</h4>
      <p style="font-size:11.5px;color:var(--gov-text-muted);line-height:1.5;margin-bottom:8px;">
        TERRABYTE adheres to the <strong>Guidelines for Indian Government Websites (GIGW 3.0)</strong> and aligns with the <strong>W3C Web Content Accessibility Guidelines (WCAG 2.1 Level AA)</strong>.
      </p>
      <ul style="font-size:11px;color:var(--gov-text-muted);padding-left:18px;margin:0 0 10px;line-height:1.5;">
        <li>100% full keyboard operability (Tab, Shift+Tab, Enter, Escape, Space).</li>
        <li>High-contrast text inputs ensuring black-on-white text readability.</li>
        <li>Bilingual support in Hindi (Devanagari) & English.</li>
        <li>ARIA landmark structure for standard screen readers.</li>
      </ul>
    </div>
    <div class="modal-footer">
      <button class="btn btn-navy btn-sm" onclick="closeModal()">Close / बंद करें</button>
    </div>
  `);
}

function openScreenReaderModal() {
  openModal(`
    <div class="modal-header">
      <div class="modal-title">🔊 Screen Reader Access & Navigation Guide</div>
      <button class="modal-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p style="font-size:12px;color:var(--gov-text-muted);margin-bottom:14px;">
        TERRABYTE supports leading screen readers in compliance with GIGW 3.0 standards:
      </p>
      
      <table style="margin-bottom:14px;">
        <thead>
          <tr>
            <th>Screen Reader</th>
            <th>Platform</th>
            <th>Quick Access Key</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>NVDA</strong> (NonVisual Desktop Access)</td>
            <td>Windows (Free)</td>
            <td><code style="font-family:var(--font-mono);color:var(--gov-blue);">NVDA + Space / NVDA + F7</code></td>
          </tr>
          <tr>
            <td><strong>JAWS</strong> (Job Access With Speech)</td>
            <td>Windows</td>
            <td><code style="font-family:var(--font-mono);color:var(--gov-blue);">Insert + F7 (Links list)</code></td>
          </tr>
          <tr>
            <td><strong>VoiceOver</strong></td>
            <td>macOS / iOS</td>
            <td><code style="font-family:var(--font-mono);color:var(--gov-blue);">VO + U (Web Rotor)</code></td>
          </tr>
          <tr>
            <td><strong>TalkBack</strong></td>
            <td>Android</td>
            <td><code style="font-family:var(--font-mono);color:var(--gov-blue);">Linear Swipe Gesture</code></td>
          </tr>
        </tbody>
      </table>

      <div style="background:#f8fafc;border:1px solid var(--gov-border);padding:10px 14px;border-radius:4px;font-size:11px;color:var(--gov-text-muted);">
        <strong>Accessibility Shortcuts:</strong> Press <kbd>Tab</kbd> to focus on "Skip to Main Content". Use standard heading jumps (<kbd>H</kbd>) to navigate between national sections.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-navy btn-sm" onclick="closeModal()">Understood / ठीक है</button>
    </div>
  `);
}

function openContactModal() {
  openModal(`
    <div class="modal-header">
      <div class="modal-title">📞 Contact Us & National Helpdesk Directory</div>
      <button class="modal-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="background:#eaf3fa;border:1px solid rgba(20,93,160,0.2);padding:14px;border-radius:4px;margin-bottom:16px;">
        <div style="font-weight:700;color:var(--gov-navy);font-size:12px;margin-bottom:4px;">National Land Acquisition Helpline (Toll-Free):</div>
        <div style="font-size:20px;font-weight:900;color:var(--gov-blue);font-family:var(--font-mono);">1800-11-2016</div>
        <div style="font-size:11px;color:var(--gov-text-muted);margin-top:2px;">Monday to Saturday (09:30 AM to 06:00 PM IST)</div>
      </div>

      <div class="kv"><span>Demonstration Email:</span><span style="font-family:var(--font-mono);">support-terrabyte@gov-demo.in</span></div>
      <div class="kv"><span>Headquarters:</span><span>NBO Building, Nirman Bhawan, New Delhi - 110011</span></div>
      <div class="kv"><span>Department:</span><span>Department of Land Resources (DoLR), MoRD, GoI</span></div>

      <div style="margin-top:14px;padding:10px 12px;background:#f8fafc;border-left:3px solid var(--gov-saffron);font-size:11px;color:var(--gov-text-muted);">
        <strong>State Grievance Notice:</strong> Statutory objection petitions under Section 15 must be lodged directly with the Competent Authority Land Acquisition (CALA) of your district.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-navy btn-sm" onclick="closeModal()">Close / बंद करें</button>
    </div>
  `);
}

function openSitemapModal() {
  const sections = [
    { title: "1. Home & Institutional Identity", links: ["Portal Overview", "National Land Acquisition Indicators", "Gazette Ticker", "Latest Updates"] },
    { title: "2. About Us", links: ["About DoLR", "TerraByte Mission & Vision", "Organizational Hierarchy", "RFCTLARR Act Framework"] },
    { title: "3. Land Acquisition", links: ["Section 4 Preliminary Notifications", "Section 11 Declaration Registry", "Social Impact Assessment (SIA)", "Joint Measurement Surveys"] },
    { title: "4. Land Management", links: ["Khasra & Survey Cadastral Mapping", "Record of Rights (RoR) Integration", "Land Parcel Titling", "Disputed Land Registry"] },
    { title: "5. Projects", links: ["Highways & Expressways (NHAI)", "Dedicated Freight Corridors (DFCCIL)", "High Speed Rail (Bullet Train)", "PM GatiShakti Multi-modal"] },
    { title: "6. GIS Map", links: ["Cadastral Geo-reference Overlay", "Satellite Imagery Viewer", "Linear Corridor Buffers", "Dispute Layers"] },
    { title: "7. E-Agreements", links: ["Draft Deed Preparation", "Citizen Aadhaar e-Sign", "Officer Class-3 DSC Approval", "₹100 E-Stamp Paper Preview"] },
    { title: "8. Compensation & DBT", links: ["Statutory Compensation Calculator", "PFMS Direct Benefit Transfer", "100% Solatium Verification", "Bank Mandate Tracking"] },
    { title: "9. Guidelines & Acts", links: ["RFCTLARR Act 2013 (Full Text)", "State Amendments & Rules", "Rehabilitation & Resettlement (R&R) Norms", "LARRA Tribunal Orders"] },
    { title: "10. Documents & Gazette", links: ["Official Central Gazettes", "State Gazette Bulletins", "Standard Operating Procedures (SOP)", "Objection Forms (Form 3A)"] },
    { title: "11. Grievance Redressal", links: ["File Citizen Land Objection", "Track Grievance Status", "Appeals to LARRA Tribunal", "Toll-Free Helpline"] },
    { title: "12. Single Sign-On (SSO)", links: ["Admin Portal Login", "Land Officer (LAO) Access", "Project Authority (NHAI)", "Citizen / Khatedar Self-Service"] }
  ];

  openModal(`
    <div class="modal-header">
      <div class="modal-title">🗺️ TERRABYTE National Portal Sitemap</div>
      <button class="modal-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body" style="max-height:65vh;overflow-y:auto;">
      <p style="font-size:12px;color:var(--gov-text-muted);margin-bottom:14px;">
        Hierarchical directory of all statutory modules, cadastral registries, and digital services hosted on the TerraByte portal.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;">
        ${sections.map(s => `
          <div style="background:#f8fafc;border:1px solid var(--gov-border);padding:10px 12px;border-radius:4px;">
            <div style="font-size:11.5px;font-weight:700;color:var(--gov-navy);border-bottom:1px solid var(--gov-border);padding-bottom:4px;margin-bottom:6px;">${s.title}</div>
            <ul style="list-style:none;padding:0;margin:0;font-size:10.5px;color:var(--gov-text-muted);line-height:1.6;">
              ${s.links.map(l => `<li>• ${l}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-navy btn-sm" onclick="closeModal()">Close / बंद करें</button>
    </div>
  `);
}

/* ============ TICKER CONTROLS ============ */
let tickerPaused = false;
function toggleTicker() {
  const marquee = document.getElementById('ticker-marquee');
  const btn = document.getElementById('btn-ticker-pause');
  if (marquee && btn) {
    tickerPaused = !tickerPaused;
    marquee.style.animationPlayState = tickerPaused ? 'paused' : 'running';
    btn.innerHTML = tickerPaused ? '▶' : '⏸';
    btn.title = tickerPaused ? 'Play Ticker' : 'Pause Ticker';
  }
}

/* ============ JANPARICHAY SSO AUTHENTICATION ============ */
function renderLogin() {
  generateCaptcha();
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabRegister = document.getElementById('tab-btn-register');
  const formSignIn = document.getElementById('signin-form');
  const formRegister = document.getElementById('register-form');
  const authErr = document.getElementById('auth-error-msg');
  const idInput = document.getElementById('login-identifier');
  const pwInput = document.getElementById('login-password');
  const capInput = document.getElementById('login-captcha');
  const togglePw = document.getElementById('toggle-password');
  const reloadCap = document.getElementById('captcha-reload-btn');

  function showErr(msg) {
    if (authErr) {
      authErr.textContent = msg;
      authErr.style.display = 'block';
    }
  }
  function clearErr() {
    if (authErr) authErr.style.display = 'none';
  }

  if (reloadCap) reloadCap.onclick = generateCaptcha;

  if (tabSignIn && tabRegister) {
    tabSignIn.onclick = () => {
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
      clearErr();
    };
    tabRegister.onclick = () => {
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      if (formSignIn) formSignIn.style.display = 'none';
      if (formRegister) formRegister.style.display = 'block';
      clearErr();
    };
  }

  if (togglePw && pwInput) {
    togglePw.onclick = () => {
      const isPw = pwInput.getAttribute('type') === 'password';
      pwInput.setAttribute('type', isPw ? 'text' : 'password');
      togglePw.textContent = isPw ? '🔒' : '👁';
    };
  }

  document.querySelectorAll('.cred-chip').forEach(chip => {
    chip.onclick = () => {
      if (idInput && pwInput) {
        idInput.value = chip.dataset.user;
        pwInput.value = chip.dataset.pass;
        if (capInput) capInput.value = CURRENT_CAPTCHA;
        clearErr();
        idInput.focus();
        toast(`ऑटो-फिल: ${chip.dataset.user} चयनित`);
      }
    };
  });

  const helpBtn = document.getElementById('btn-forgot-pw');
  if (helpBtn) {
    helpBtn.onclick = () => {
      openModal(`
        <div class="modal-header">
          <div class="modal-title">Official Demo Credentials Directory</div>
          <button class="modal-close-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <p style="font-size:12px;color:var(--gov-text-muted);margin-bottom:12px;">Use any registered official or citizen credential to inspect role-specific permissions:</p>
          <div class="kv"><span>Nodal Administrator:</span><span>admin / password123</span></div>
          <div class="kv"><span>Land Officer (LAO):</span><span>officer / password123</span></div>
          <div class="kv"><span>Project Authority (NHAI):</span><span>authority / password123</span></div>
          <div class="kv"><span>Citizen / Landowner:</span><span>citizen / password123</span></div>
          <p style="font-size:11px;color:var(--gov-text-muted);margin-top:14px;">In production, identity tokens authenticate via MeriPehchan / JanParichay National SSO.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-navy btn-sm" onclick="closeModal()">Close / बंद करें</button>
        </div>
      `);
    };
  }

  if (formSignIn) {
    formSignIn.onsubmit = (e) => {
      e.preventDefault();
      clearErr();
      const identifier = idInput.value.trim().toLowerCase();
      const password = pwInput.value;
      const enteredCap = capInput ? capInput.value.trim().toUpperCase() : '';

      if (!identifier || !password) {
        showErr('Please enter both official username/email and password.');
        return;
      }

      if (enteredCap !== CURRENT_CAPTCHA) {
        showErr('Invalid Security Captcha code. Please enter the characters displayed.');
        generateCaptcha();
        if (capInput) capInput.value = '';
        return;
      }

      const matchedUser = DB.users.find(u =>
        (u.username && u.username.toLowerCase() === identifier) ||
        (u.email && u.email.toLowerCase() === identifier) ||
        (u.id && u.id.toLowerCase() === identifier)
      );

      if (!matchedUser) {
        showErr('Account not registered in National Directory. Please verify credentials.');
        generateCaptcha();
        return;
      }

      if (matchedUser.password !== password) {
        showErr('Incorrect security password. Default password for prototype is password123.');
        generateCaptcha();
        return;
      }

      toast(`प्रवेश सफल / Signed in as ${matchedUser.name} (${ROLES[matchedUser.role].label})`);
      login(matchedUser);
    };
  }

  if (formRegister) {
    formRegister.onsubmit = (e) => {
      e.preventDefault();
      clearErr();
      const name = document.getElementById('reg-name').value.trim();
      const username = document.getElementById('reg-username').value.trim().toLowerCase();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const role = document.getElementById('reg-role').value;
      const password = document.getElementById('reg-password').value;

      if (!name || !username || !email || !password) {
        showErr('Please complete all mandatory registration fields.');
        return;
      }

      if (password.length < 6) {
        showErr('Password must have at least 6 characters.');
        return;
      }

      if (DB.users.some(u => u.username && u.username.toLowerCase() === username)) {
        showErr('This username is already allocated in the National Database.');
        return;
      }

      const roleTitles = {
        'ADMIN': 'District Nodal Administrator',
        'LAND_OFFICER': 'Gazetted Land Acquisition Officer',
        'PROJECT_AUTHORITY': 'Competent Project Authority',
        'LAND_OWNER': 'Registered Khatedar / Citizen'
      };

      const newUser = {
        id: 'U-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
        name: name,
        role: role,
        title: roleTitles[role] || 'User',
        username: username,
        email: email,
        password: password
      };

      DB.users.push(newUser);
      addAudit('User registered on Portal', 'user', newUser.id, `${name} registered as ${ROLES[role].label}`);
      saveDB();
      toast(`Registration Successful! Welcome, ${name}.`);
      login(newUser);
    };
  }
}

/* ============ SCREEN NAVIGATION (HOME vs DEDICATED LOGIN vs APP) ============ */
function showHomeScreen() {
  const home = document.getElementById('home-screen');
  const login = document.getElementById('login-screen');
  const app = document.getElementById('app-screen');
  if (home) home.style.display = 'block';
  if (login) login.style.display = 'none';
  if (app) app.style.display = 'none';

  const navHome = document.getElementById('nav-btn-home');
  const navLogin = document.getElementById('nav-btn-login');
  if (navHome) navHome.classList.add('active');
  if (navLogin && !CURRENT_USER) {
    navLogin.classList.remove('active');
    navLogin.innerHTML = '🔑 LOGIN / REGISTER';
  }

  if (window.location.hash === '#login') {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoginPage() {
  const home = document.getElementById('home-screen');
  const login = document.getElementById('login-screen');
  const app = document.getElementById('app-screen');
  if (home) home.style.display = 'none';
  if (login) login.style.display = 'block';
  if (app) app.style.display = 'none';

  const navHome = document.getElementById('nav-btn-home');
  const navLogin = document.getElementById('nav-btn-login');
  if (navHome) navHome.classList.remove('active');
  if (navLogin) navLogin.classList.add('active');

  generateCaptcha();
  if (window.location.hash !== '#login') {
    window.location.hash = 'login';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    const idInput = document.getElementById('login-identifier');
    if (idInput) idInput.focus();
  }, 100);
}

window.addEventListener('hashchange', () => {
  if (CURRENT_USER) return;
  if (window.location.hash === '#login') {
    showLoginPage();
  } else if (!window.location.hash || window.location.hash === '#') {
    showHomeScreen();
  }
});

function login(user) {
  CURRENT_USER = user;
  sessionStorage.setItem(SESSION_KEY, user.id);
  addAudit('Official signed in', 'user', user.id, `${user.title} signed into portal.`);
  saveDB();
  const home = document.getElementById('home-screen');
  const login = document.getElementById('login-screen');
  const app = document.getElementById('app-screen');
  if (home) home.style.display = 'none';
  if (login) login.style.display = 'none';
  if (app) app.style.display = 'flex';
  
  const rolePill = document.getElementById('role-pill');
  if (rolePill) rolePill.textContent = (typeof getRoleLabel === 'function') ? getRoleLabel(user.role) : ROLES[user.role].label;
  
  const userName = document.getElementById('user-name');
  if (userName) userName.textContent = user.name;
  
  const navLoginBtn = document.getElementById('nav-btn-login');
  if (navLoginBtn) {
    navLoginBtn.innerHTML = '🚪 LOGOUT';
    navLoginBtn.classList.remove('active');
  }
  const navHome = document.getElementById('nav-btn-home');
  if (navHome) navHome.classList.remove('active');

  renderSidebar();
  navigate(defaultRouteFor(user.role));
}

function logout() {
  if (CURRENT_USER) {
    addAudit('Official signed out', 'user', CURRENT_USER.id, '');
    saveDB();
  }
  CURRENT_USER = null;
  sessionStorage.removeItem(SESSION_KEY);
  const app = document.getElementById('app-screen');
  if (app) app.style.display = 'none';
  
  const navLoginBtn = document.getElementById('nav-btn-login');
  if (navLoginBtn) {
    navLoginBtn.innerHTML = '🔑 LOGIN / REGISTER';
    navLoginBtn.classList.remove('active');
  }

  showHomeScreen();
  renderLogin();
  initCarousel();
  toast('सफलतापूर्वक लॉगआउट किया गया / Successfully signed out');
}

function defaultRouteFor(role) {
  return role === 'LAND_OWNER' ? 'my-land' : 'dashboard';
}
