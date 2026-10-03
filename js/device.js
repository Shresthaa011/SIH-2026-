/* ==========================================================================
   GeoSetu-India (जिओसेतु-इंडिया) — DEVICE DETECTION & DYNAMIC LAYOUT SWITCHER
   Device-based layout switching supporting Desktop, Tablet, and Mobile
   Compliant with GIGW 3.0 & WCAG 2.1 Level AA Accessibility Standards
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'terrabyte_device_override';
  const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const TABLET_UA_REGEX = /iPad|Android(?!.*Mobile)|Tablet|Silk/i;

  const listeners = [];
  let currentMode = null;
  let resizeTimer = null;

  function detectDeviceType() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const isMobileUA = MOBILE_UA_REGEX.test(ua);
    const isTabletUA = TABLET_UA_REGEX.test(ua);
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 1200;
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    // Check manual override first (persisted in localStorage or sessionStorage)
    try {
      const override = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (override === 'desktop' || override === 'mobile') {
        return {
          mode: override,
          isOverride: true,
          width: width,
          isMobileUA: isMobileUA,
          isTabletUA: isTabletUA,
          hasTouch: hasTouch
        };
      }
    } catch (e) {}

    // Rule 1: Desktop (> 1024px and NOT a mobile/tablet UA)
    if (width > 1024 && !isMobileUA && !isTabletUA) {
      return {
        mode: 'desktop',
        isOverride: false,
        width: width,
        isMobileUA: isMobileUA,
        isTabletUA: isTabletUA,
        hasTouch: hasTouch
      };
    }

    // Rule 2: Mobile (<= 768px or mobile phone user agent)
    if (width <= 768 || isMobileUA) {
      return {
        mode: 'mobile',
        isOverride: false,
        width: width,
        isMobileUA: isMobileUA,
        isTabletUA: isTabletUA,
        hasTouch: hasTouch
      };
    }

    // Rule 3: Tablet Fallback (769px to 1024px or tablet UA) -> Defaults to 'mobile' layout
    return {
      mode: 'mobile',
      isTabletFallback: true,
      isOverride: false,
      width: width,
      isMobileUA: isMobileUA,
      isTabletUA: isTabletUA,
      hasTouch: hasTouch
    };
  }

  function applyDeviceMode(newMode, notify) {
    const prevMode = currentMode;
    currentMode = newMode;

    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-device', newMode);
    if (body) {
      body.classList.remove('mode-desktop', 'mode-mobile');
      body.classList.add(`mode-${newMode}`);
      body.setAttribute('data-layout', newMode);
    }

    // Update switcher buttons if present in DOM
    const toggleBtns = document.querySelectorAll('.btn-device-toggle');
    toggleBtns.forEach(btn => {
      btn.textContent = newMode === 'mobile' ? '🖥️ Desktop Site' : '📱 Mobile View';
    });

    if (notify && prevMode !== newMode) {
      listeners.forEach(fn => {
        try {
          fn(newMode, prevMode);
        } catch (err) {
          console.error('[DeviceManager] Error in listener callback:', err);
        }
      });
    }
  }

  function evaluateAndApply(notify) {
    const info = detectDeviceType();
    applyDeviceMode(info.mode, notify);
    return info;
  }

  // Initial detection execution
  const initialInfo = evaluateAndApply(false);

  // Resize and Orientation Listener with Debounce
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      evaluateAndApply(true);
    }, 150);
  }

  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize, { passive: true });

  document.addEventListener('DOMContentLoaded', () => {
    applyDeviceMode(currentMode, false);
  });

  // Public Device API
  window.Device = {
    getMode: function () {
      return currentMode || detectDeviceType().mode;
    },
    isMobile: function () {
      return this.getMode() === 'mobile';
    },
    isDesktop: function () {
      return this.getMode() === 'desktop';
    },
    isTablet: function () {
      const info = detectDeviceType();
      return info.isTabletUA || (info.width > 768 && info.width <= 1024);
    },
    getInfo: function () {
      return detectDeviceType();
    },
    setOverride: function (mode) {
      try {
        if (mode === 'desktop' || mode === 'mobile') {
          localStorage.setItem(STORAGE_KEY, mode);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {}
      evaluateAndApply(true);
    },
    toggleMode: function () {
      const next = this.isMobile() ? 'desktop' : 'mobile';
      this.setOverride(next);
      if (typeof toast === 'function') {
        toast(next === 'desktop' ? '🖥️ Desktop layout enabled' : '📱 Mobile layout enabled');
      }
    },
    clearOverride: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      evaluateAndApply(true);
    },
    addListener: function (callback) {
      if (typeof callback === 'function' && !listeners.includes(callback)) {
        listeners.push(callback);
      }
    },
    removeListener: function (callback) {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  };

})(window);
