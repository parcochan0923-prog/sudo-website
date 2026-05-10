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

  resetHeroLines();

  // Phase 1: Fade in "Minow" (0.3s - 1.1s)
  line1.innerHTML = '<span style="display:inline-block">Min</span><span style="display:inline-block">ow</span>';
  line1.style.opacity = '0';
  line1.style.transition = 'opacity 0.8s ease';
  line1.style.display = 'inline-block';
  line1.style.letterSpacing = '-1.5px';
  line1.style.fontSize = 'clamp(2.8rem, 6vw, 4.5rem)';
  line1.style.fontWeight = '800';

  heroTimeouts.push(setTimeout(() => {
    line1.style.opacity = '1';
  }, 300));

  // Phase 2: Split into "Min" (black) + "now" (blue), extra "n" appears (1.8s)
  heroTimeouts.push(setTimeout(() => {
    line1.style.letterSpacing = 'normal';
    line1.innerHTML = '<span class="hero-part-min" style="display:inline-block;color:var(--text-dark);transition:all 0.5s cubic-bezier(0.4,0,0.2,1)">Min</span><span class="hero-part-n" style="display:inline-block;opacity:0;color:var(--accent);transition:all 0.4s ease">n</span><span class="hero-part-ow" style="display:inline-block;color:var(--text-dark);transition:all 0.3s ease 0.1s">ow</span>';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // "n" fades in
        const n = line1.querySelector('.hero-part-n');
        if (n) { n.style.opacity = '1'; }

        // "ow" turns blue
        const ow = line1.querySelector('.hero-part-ow');
        if (ow) { ow.style.color = 'var(--accent)'; }
      });
    });
  }, 1800));

  // Phase 3: "Min" types out "imize your work " and connects to "now" (2.8s)
  heroTimeouts.push(setTimeout(() => {
    const lang = currentLang || 'en';

    if (lang === 'en') {
      const rest = 'imize your work ';
      let i = 0;
      const nPart = line1.querySelector('.hero-part-n');

      function typeNext() {
        if (i < rest.length) {
          const span = document.createElement('span');
          span.textContent = rest[i];
          span.style.color = 'var(--text-dark)';
          line1.insertBefore(span, nPart);
          i++;
          heroTimeouts.push(setTimeout(typeNext, 55));
        } else {
          line1.style.cssText = '';
          line2.style.cssText = '';
          line2.classList.add('gradient');
          line1.textContent = 'Minimize your work ';
          line2.textContent = 'now.';
        }
      }
      typeNext();
    } else {
      // Chinese: same English slogan with typing animation
      line1.style.cssText = '';
      line2.style.cssText = '';
      line2.classList.add('gradient');
      typeText(line1, 'Minimize your work ', 55).then(() => {
        return typeText(line2, 'now.', 55);
      });
    }
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
