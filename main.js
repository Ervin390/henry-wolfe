/* ===========================================
   HENRY WOLFE — AUTHOR SITE
   main.js — v3
   =========================================== */

const FOG_DURATION = 9000; // ms — ultra-slow meditative duration with initial density phase

// --- Forced Scroll to Top on Load/Refresh ---
window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// --- Sticky Header on Scroll ---
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// --- Determine if we're on the home page ---
const isHomePage = (() => {
  const path = window.location.pathname;
  return path.endsWith('index.html') || path.endsWith('/') || path === '';
})();

// --- Fade-in on Scroll ---
function initFadeIn() {
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

  fadeEls.forEach(el => observer.observe(el));
}

// --- Fog Cleanup + Fade-in Init ---
// Fade-in starts immediately — fog overlays on top while content loads underneath
initFadeIn();

if (isHomePage) {
  // Remove fog after animation completes
  setTimeout(() => {
    const fog = document.getElementById('fog-overlay');
    if (fog) {
      fog.addEventListener('animationend', () => fog.remove(), { once: true });
      setTimeout(() => fog.remove(), 1200);
    }
  }, FOG_DURATION);
} else {
  const fog = document.getElementById('fog-overlay');
  if (fog) fog.remove();
}

// --- Burger Menu ---
const burgerBtn = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');

function openMobileMenu() {
  burgerBtn.classList.add('open');
  mobileMenu.classList.add('active');
  mobileOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  burgerBtn.classList.remove('open');
  mobileMenu.classList.remove('active');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('active');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

if (mobileOverlay) {
  mobileOverlay.addEventListener('click', closeMobileMenu);
}

// Close mobile menu when a link is clicked
if (mobileMenu) {
  mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// --- Newsletter Form — Google Sheets via Apps Script ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwc3VwZPoutSfCyWVGQHvD5nac2kX8m5t1DIC7-8II52QZ38jUAB-u-z6UzJ6B3fsQi/exec';

const form = document.getElementById('subscribe-form');
const successMsg = document.getElementById('subscribe-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email-input');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput?.focus();
      return;
    }

    const btn = document.getElementById('subscribe-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Subscribing…';
    }

    try {
      // GET request with email as URL param — most reliable pattern for Apps Script (no CORS preflight)
      await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        mode: 'no-cors'
      });

      // no-cors returns opaque response — treat completed fetch as success
      form.hidden = true;
      if (successMsg) successMsg.hidden = false;
    } catch (err) {
      console.error('[subscribe] error:', err);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Try Again';
      }
      let errEl = document.getElementById('subscribe-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.id = 'subscribe-error';
        errEl.style.cssText = 'color:#c0392b;margin-top:0.5rem;font-size:0.9rem;';
        form.appendChild(errEl);
      }
      errEl.textContent = 'Something went wrong. Please try again.';
    }
  });
}
