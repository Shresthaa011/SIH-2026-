/* ==================== INIT ==================== */
document.addEventListener('DOMContentLoaded', () => {
  loadDB();
  updateLiveClock();

  // Contrast toggle in app band
  const contrastBtn = document.getElementById('band-theme-toggle');
  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => toggleContrastMode());
  }

  // Logout button in app band
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Citizen Inquiry Form submission
  const inqForm = document.getElementById('citizen-inquiry-form');
  if (inqForm) {
    inqForm.addEventListener('submit', handleInquirySubmit);
  }

  // Check saved session
  const savedUid = sessionStorage.getItem(SESSION_KEY);
  if (savedUid) {
    const u = DB.users.find(x => x.id === savedUid);
    if (u) {
      CURRENT_USER = u;
      const home = document.getElementById('home-screen');
      const login = document.getElementById('login-screen');
      const app = document.getElementById('app-screen');
      if (home) home.style.display = 'none';
      if (login) login.style.display = 'none';
      if (app) app.style.display = 'flex';
      
      const rolePill = document.getElementById('role-pill');
      if (rolePill) rolePill.textContent = (typeof getRoleLabel === 'function') ? getRoleLabel(u.role) : ROLES[u.role].label;
      
      const userName = document.getElementById('user-name');
      if (userName) userName.textContent = u.name;

      const navLoginBtn = document.getElementById('nav-btn-login');
      if (navLoginBtn) {
        navLoginBtn.innerHTML = '🚪 LOGOUT';
        navLoginBtn.classList.remove('active');
      }
      const navHome = document.getElementById('nav-btn-home');
      if (navHome) navHome.classList.remove('active');
      
      renderSidebar();
      navigate(defaultRouteFor(u.role));
      return;
    }
  }

  // Handle URL hash: #login opens login page, otherwise home page
  if (window.location.hash === '#login') {
    showLoginPage();
  } else {
    showHomeScreen();
  }

  // Render Login & Hero Carousel
  renderLogin();
  initCarousel();
});