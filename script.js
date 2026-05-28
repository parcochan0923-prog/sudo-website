// ===== Shared Navbar & Footer =====
const NAV_ITEMS = [
  { href: 'index.html', en: 'Home', zh: '首頁' },
  { href: 'services.html', en: 'Solutions', zh: '方案' },
  { href: 'demo.html', en: 'Live Demo', zh: '功能示範' },
  { href: 'about.html', en: 'About', zh: '關於我們' },
  { href: 'contact.html', en: 'Contact', zh: '聯絡我們' },
];

function injectNavbar() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const navItemsHTML = NAV_ITEMS.map(item => {
    const isActive = item.href === page ? ' class="active"' : '';
    return `<a href="${item.href}"${isActive} data-en="${item.en}" data-zh="${item.zh}">${item.zh}</a>`;
  }).join('');

  const mobileItemsHTML = NAV_ITEMS.map(item => {
    return `<a href="${item.href}" data-en="${item.en}" data-zh="${item.zh}">${item.zh}</a>`;
  }).join('');

  const navbarHTML = `
  <nav class="navbar" id="navbar">
    <div class="container">
      <a href="index.html" class="nav-logo"><img src="Minow.ai_logo.png" alt="Minow.ai" height="60"></a>
      <div class="nav-links">
        ${navItemsHTML}
      </div>
      <div class="nav-right">
        <button class="lang-toggle" id="langToggle">中文</button>
        <a href="booking.html" class="btn-cta" data-en="30 mins free consultation" data-zh="30分鐘免費諮詢">30分鐘免費諮詢</a>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    ${mobileItemsHTML}
    <a href="booking.html" class="btn-cta" style="text-align:center;" data-en="30 mins free consultation" data-zh="30分鐘免費諮詢">30分鐘免費諮詢</a>
  </div>`;

  // Replace existing navbar + mobile menu
  const oldNav = document.querySelector('.navbar');
  const oldMobile = document.querySelector('.mobile-menu');
  const temp = document.createElement('div');
  temp.innerHTML = navbarHTML;
  if (oldNav) oldNav.replaceWith(temp.querySelector('.navbar'));
  if (oldMobile) oldMobile.replaceWith(temp.querySelector('.mobile-menu'));
}

function injectFooter() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const footerHTML = `
  <footer class="footer">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div style="font-size:0.85rem;">© 2026 Minow.ai. All rights reserved. · <span data-en="Based in Hong Kong" data-zh="立足香港">立足香港</span></div>
      <div style="display:flex;gap:20px;font-size:0.8rem;">
        <a href="privacy.html" style="color:var(--accent);" data-en="Privacy Policy" data-zh="私隱政策">私隱政策</a>
        <a href="terms.html" style="color:var(--accent);" data-en="Terms" data-zh="使用條款">使用條款</a>
        <a href="demo.html" style="color:var(--accent);" data-en="Live Demo" data-zh="功能示範">功能示範</a>
      </div>
    </div>
  </footer>`;

  const oldFooter = document.querySelector('.footer');
  const temp = document.createElement('div');
  temp.innerHTML = footerHTML;
  if (oldFooter) oldFooter.replaceWith(temp.querySelector('.footer'));
}

function injectWhatsApp() {
  if (document.querySelector('.wa-float')) return;
  const wa = document.createElement('a');
  wa.href = 'https://wa.me/85259134629';
  wa.target = '_blank';
  wa.className = 'wa-float';
  wa.innerHTML = '<span class="wa-tooltip">WhatsApp 搵我哋</span><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>';
  document.body.appendChild(wa);
}

// Inject shared components on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  injectNavbar();
  injectFooter();
  injectWhatsApp();
});

// ===== Page Transition =====
document.body.classList.add('page-enter');
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.remove('page-enter');
    document.body.classList.add('page-loaded');
  });
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
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
  },
  'title-contact': {
    en: '<span class="contact-title-number">30</span> mins free consultation',
    zh: '<span class="contact-title-number">30</span>分鐘免費諮詢'
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
  if (document.getElementById('heroLine1')) runTyping();
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('minow-lang') || 'zh';
  setLang(saved);

  const toggle = document.getElementById('langToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'zh' : 'en';
      setLang(newLang);
      localStorage.setItem('minow-lang', newLang);
    });
  }
});

// ===== Hero Animation: Minow fade in → split → type slogan =====
let typingTimeouts = [];
let heroTimeouts = [];
let animationRan = false;

function typeText(element, text, speed = 60) {
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

function resetHeroLines() {
  const l1 = document.getElementById('heroLine1');
  const l2 = document.getElementById('heroLine2');
  if (l1) { l1.textContent = ''; l1.style.cssText = ''; l1.classList.remove('gradient'); }
  if (l2) { l2.textContent = ''; l2.style.cssText = ''; l2.classList.remove('gradient'); }
}

function runHeroAnimation() {
  if (animationRan) return;
  animationRan = true;

  const line1 = document.getElementById('heroLine1');
  const line2 = document.getElementById('heroLine2');
  if (!line1 || !line2) return;
  const heroIsMobile = window.matchMedia('(max-width: 640px)').matches;

  resetHeroLines();

  // Phase 1: Fade in "Minow" (0.3s - 1.1s)
  line1.textContent = 'Minow';
  line1.style.opacity = '0';
  line1.style.transition = 'opacity 0.8s ease, color 0.5s ease';
  line1.style.display = 'inline-block';
  line1.style.letterSpacing = '0';
  line1.style.fontSize = heroIsMobile ? 'clamp(2.35rem, 10.8vw, 2.85rem)' : 'clamp(4rem, 7vw, 5.9rem)';
  line1.style.fontWeight = '800';
  line1.style.lineHeight = heroIsMobile ? '1.05' : '1.08';
  line1.style.whiteSpace = heroIsMobile ? 'normal' : 'nowrap';
  line1.style.color = 'var(--text-white)';

  heroTimeouts.push(setTimeout(() => {
    line1.style.opacity = '1';
  }, 300));

  // Phase 2: "Minow" turns blue (1.8s)
  heroTimeouts.push(setTimeout(() => {
    line1.style.letterSpacing = 'normal';
    line1.style.color = 'var(--accent)';
  }, 1800));

  // Phase 3: "Min" types out "imize your work " (2.8s)
  heroTimeouts.push(setTimeout(() => {
    const lang = currentLang || 'en';


      const rest = heroIsMobile ? 'imize your ' : 'imize your work ';
      const mobileSecondLine = 'work\u00a0';
      const isMobile = heroIsMobile;
      let i = 0;

      line1.innerHTML = '<span style="color:var(--accent)">Min</span>';

      function typeNext() {
        if (i < rest.length) {
          const span = document.createElement('span');
          span.textContent = rest[i];
          span.style.color = 'var(--text-white)';
          line1.appendChild(span);
          i++;
          heroTimeouts.push(setTimeout(typeNext, 55));
        } else if (isMobile) {
          const br = document.createElement('br');
          line1.appendChild(br);
          let j = 0;
          function typeSecondLine() {
            if (j < mobileSecondLine.length) {
              const span = document.createElement('span');
              span.textContent = mobileSecondLine[j];
              span.style.color = 'var(--text-white)';
              line1.appendChild(span);
              j++;
              heroTimeouts.push(setTimeout(typeSecondLine, 55));
            } else {
              const now = document.createElement('span');
              now.textContent = 'now.';
              now.classList.add('gradient');
              line1.appendChild(now);
              line2.textContent = '';
            }
          }
          typeSecondLine();
        } else {
          line2.style.cssText = '';
          line2.classList.add('gradient');
          line2.textContent = 'now.';
        }
      }
      typeNext();
   
  }, 2800));
}

if (document.getElementById('heroLine1')) setTimeout(runHeroAnimation, 500);

// Re-run on language change
function runTyping() {
  animationRan = false;
  heroTimeouts.forEach(t => clearTimeout(t));
  heroTimeouts = [];
  typingTimeouts.forEach(t => clearTimeout(t));
  typingTimeouts = [];
  resetHeroLines();
  runHeroAnimation();
}
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
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  lastScroll = window.scrollY;
}, { passive: true });

// ===== Scroll Animations (enhanced) =====
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

function initScrollAnimations() {
  document.querySelectorAll('.fade-up, .scale-in, .slide-left, .slide-right').forEach(el => {
    scrollObserver.observe(el);
  });
}
initScrollAnimations();

// ===== Counter Animation =====
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    const target = counter.getAttribute('data-count');
    const suffix = counter.getAttribute('data-suffix') || '';
    const prefix = counter.getAttribute('data-prefix') || '';
    const isNumber = !isNaN(parseInt(target));

    if (!isNumber) {
      counter.textContent = target;
      counter.dataset.animated = 'true';
      return;
    }

    const end = parseInt(target);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      counter.textContent = prefix + current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = prefix + target + suffix;
        counter.dataset.animated = 'true';
      }
    }
    requestAnimationFrame(update);
  });
}

// Observe stats section for counter animation
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) counterObserver.observe(statsSection);
});

// ===== Smooth Parallax on Hero Decorative Elements =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const particles = document.querySelectorAll('.particle');
  particles.forEach((p, i) => {
    const speed = 0.03 + (i * 0.01);
    p.style.transform = `translateY(${scrolled * speed}px)`;
  });
  const heroLines = document.querySelectorAll('.hero-line');
  heroLines.forEach((l, i) => {
    const speed = 0.05 + (i * 0.02);
    l.style.transform = `translateY(${scrolled * speed}px)`;
  });
}, { passive: true });

// ===== Contact Form =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'en' ? 'Sending...' : '發送中...';
    btn.disabled = true;

    try {
      const formData = new FormData(form);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const data = await res.json();

      if (data.success) {
        form.style.display = 'none';
        const successEl = document.getElementById('formSuccess');
        successEl.classList.add('active');
        if (data.note) {
          console.log('Server note:', data.note);
        }
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (err) {
      console.error('Form submission error:', err);
      alert('Network error. Please try again.');
      btn.textContent = originalText;
      btn.disabled = false;
    }
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

// ===== Mouse follow glow on cards =====
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.service-card, .process-step').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});
