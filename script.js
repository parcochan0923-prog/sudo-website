// ===== Page Transition =====
document.body.classList.add('page-enter');
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.remove('page-enter');
    document.body.classList.add('page-loaded');
  });
});

// Intercept navigation for smooth transitions
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  // Only intercept local page links (not #anchors, not external)
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
  e.preventDefault();
  document.body.classList.add('page-exit');
  setTimeout(() => { window.location.href = href; }, 250);
});

// ===== Language Toggle =====
let currentLang = 'en';

const htmlTranslations = {
  'title-services': {
    en: 'Solutions that <span class="muted">actually work</span>',
    zh: '真正<span class="muted">有效</span>的解決方案'
  },
  'title-process': {
    en: 'Simple process, <span class="muted">real results</span>',
    zh: '簡單流程，<span class="muted">真實效果</span>'
  },
  'title-about': {
    en: 'Built in Hong Kong, <br><span class="muted">for Hong Kong</span>',
    zh: '立足香港，<br><span class="muted">服務香港</span>'
  }
};

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    if (!htmlTranslations[el.id]) {
      el.textContent = el.getAttribute(`data-${lang}`);
    }
  });
  Object.keys(htmlTranslations).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = htmlTranslations[id][lang];
  });
  document.querySelectorAll('[data-ph-en]').forEach(el => {
    el.placeholder = el.getAttribute(`data-ph-${lang}`);
  });
  const toggle = document.getElementById('langToggle');
  if (toggle) {
    toggle.textContent = lang === 'en' ? '中文' : 'EN';
    toggle.classList.toggle('active', lang === 'zh');
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  // Re-run typing if on home page
  if (document.getElementById('heroLine1')) runTyping();
}

// Restore language preference
const savedLang = localStorage.getItem('sudo-lang') || 'en';
if (savedLang !== 'en') {
  // Will apply after DOM ready
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('sudo-lang') || 'en';
  if (saved !== 'en') setLang(saved);
  
  const toggle = document.getElementById('langToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'zh' : 'en';
      setLang(newLang);
      localStorage.setItem('sudo-lang', newLang);
    });
  }
});

// ===== Hero Typing Animation =====
const heroTexts = {
  en: { line1: 'Dream Big,', line2: 'Start Small.' },
  zh: { line1: '夢想遠大，', line2: '從小事做起。' }
};

let typingTimeouts = [];
let cursorInterval;

function typeText(element, text, speed = 70) {
  return new Promise(resolve => {
    element.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
        const t = setTimeout(type, speed);
        typingTimeouts.push(t);
      } else { resolve(); }
    }
    type();
  });
}

function showCursor(element) {
  element.style.borderRight = '3px solid var(--accent)';
  element.style.paddingRight = '4px';
  clearInterval(cursorInterval);
  cursorInterval = setInterval(() => {
    element.style.borderColor = element.style.borderColor === 'transparent' ? 'var(--accent)' : 'transparent';
  }, 500);
}

function stopCursor() {
  clearInterval(cursorInterval);
  const l1 = document.getElementById('heroLine1');
  const l2 = document.getElementById('heroLine2');
  if (l1) { l1.style.borderRight = 'none'; l1.style.paddingRight = '0'; }
  if (l2) { l2.style.borderRight = 'none'; l2.style.paddingRight = '0'; }
}

async function runTyping() {
  const line1 = document.getElementById('heroLine1');
  const line2 = document.getElementById('heroLine2');
  if (!line1 || !line2) return;
  const texts = heroTexts[currentLang];
  typingTimeouts.forEach(t => clearTimeout(t));
  typingTimeouts = [];
  stopCursor();
  line1.textContent = '';
  line2.textContent = '';
  showCursor(line1);
  await typeText(line1, texts.line1, 70);
  showCursor(line2);
  await typeText(line2, texts.line2, 70);
  stopCursor();
}

if (document.getElementById('heroLine1')) setTimeout(runTyping, 500);

// ===== Mobile Menu =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
});

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.style.padding = window.scrollY > 50 ? '12px 0' : '20px 0';
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== Contact Form =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = currentLang === 'en' ? 'Sending...' : '發送中...';
    btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      document.getElementById('formSuccess').classList.add('active');
    }, 800);
  });
});

// ===== Smooth scroll for anchor links =====
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
});
