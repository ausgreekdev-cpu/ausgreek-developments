// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  // close on link click
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }));
}

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) navbar.style.boxShadow = '0 4px 24px rgba(15,23,42,0.08)';
  else navbar.style.boxShadow = 'none';
});

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Portfolio filter
const portfolioFilter = document.getElementById('portfolioFilter');
if (portfolioFilter) {
  const cards = document.querySelectorAll('.portfolio-card');
  portfolioFilter.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      portfolioFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const cat = c.dataset.category || '';
        c.classList.toggle('hidden', f !== 'all' && cat !== f);
      });
    });
  });
}

// Blog search + tag filter
const blogSearch = document.getElementById('blogSearch');
const blogTags = document.querySelectorAll('.blog-tag');
if (blogSearch || blogTags.length) {
  const cards = document.querySelectorAll('.blog-card');
  function applyBlogFilter() {
    const q = (blogSearch ? blogSearch.value : '').toLowerCase().trim();
    const activeTag = document.querySelector('.blog-tag.active');
    const tag = activeTag ? activeTag.dataset.tag : 'all';
    cards.forEach(c => {
      const text = (c.textContent || '').toLowerCase();
      const ctag = c.dataset.tag || '';
      const matchQ = !q || text.includes(q);
      const matchT = tag === 'all' || ctag === tag;
      c.classList.toggle('hidden', !(matchQ && matchT));
    });
  }
  if (blogSearch) blogSearch.addEventListener('input', applyBlogFilter);
  blogTags.forEach(t => t.addEventListener('click', () => {
    blogTags.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    applyBlogFilter();
  }));
}

// Reading progress
const rp = document.getElementById('readingProgress');
if (rp) {
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const total = (h.scrollHeight - h.clientHeight) || 1;
    rp.style.width = Math.min(100, (scrolled / total) * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress);
  updateProgress();
}

// Syntax highlighting (lightweight)
function highlightCode() {
  document.querySelectorAll('pre code, .code-block').forEach(el => {
    if (el.dataset.highlighted) return;
    let html = el.innerHTML
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    // comments
    html = html.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="token comment">$1</span>');
    // strings
    html = html.replace(/(&quot;[^&]*?&quot;|'[^']*?'|`[^`]*?`)/g, '<span class="token string">$1</span>');
    // keywords
    html = html.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|await|async|new|this|true|false|null|undefined)\b/g, '<span class="token keyword">$1</span>');
    // numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token number">$1</span>');
    el.innerHTML = html;
    el.dataset.highlighted = '1';
  });
}
highlightCode();

// Testimonial carousel
const track = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
const dotsWrap = document.getElementById('carouselDots');
if (track) {
  const slides = track.querySelectorAll('.testimonial-slide');
  let idx = 0;
  const perView = window.innerWidth >= 981 ? 3 : 1;
  const maxIdx = Math.max(0, slides.length - perView);
  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === idx ? ' active' : '');
      d.addEventListener('click', () => { idx = i; update(); });
      dotsWrap.appendChild(d);
    }
  }
  function update() {
    const pct = (100 / perView) * idx;
    track.style.transform = 'translateX(-' + pct + '%)';
    if (dotsWrap) dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  if (prevBtn) prevBtn.addEventListener('click', () => { idx = Math.max(0, idx - 1); update(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { idx = Math.min(maxIdx, idx + 1); update(); });
  // keyboard nav
  if (track) track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { idx = Math.max(0, idx - 1); update(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { idx = Math.min(maxIdx, idx + 1); update(); e.preventDefault(); }
  });
  if (track) track.setAttribute('tabindex', '0');
  renderDots();
  update();
  // auto-advance
  setInterval(() => { idx = idx >= maxIdx ? 0 : idx + 1; update(); }, 5000);
}

// Contact form handling - works locally and on Netlify via fetch
const form = document.querySelector('.contact-form');
const statusEl = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusEl) {
      statusEl.textContent = 'Sending...';
      statusEl.className = 'form-status';
    }
    const formData = new FormData(form);
    // Local demo - no network
    const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
    if (isLocal) {
      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = '✓ Thanks! Your message has been received (demo mode). On the live site this will be delivered via Netlify Forms.';
          statusEl.className = 'form-status success';
        }
        form.reset();
      }, 600);
      return;
    }
    try {
      // 1) Server-side handling: spam/rate-limit/email notify/auto-responder
      const jsonFields = {};
      for (const [k, v] of formData.entries()) { if (typeof v === 'string') jsonFields[k] = v; }
      const fnRes = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonFields)
      });
      if (!fnRes.ok) {
        const err = await fnRes.json().catch(() => ({}));
        throw new Error(err.error || 'Function error');
      }
      // 2) Forward to Netlify Forms for dashboard capture (attachment included)
      if (!form.querySelector('#attachment')?.files.length) formData.delete('attachment');
      const res = await fetch('/', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        if (statusEl) {
          statusEl.textContent = '✓ Thanks! Your message has been sent. We’ll be in touch within 24 hours.';
          statusEl.className = 'form-status success';
        }
        form.reset();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = '✗ Something went wrong. Please try again or email us directly at ausgreekdev@gmail.com';
        statusEl.className = 'form-status error';
      }
    }
  });
}

// Calendly: load the third-party widget only when the visitor asks for it,
// so it never counts against first-load performance
const calendlyEmbed = document.getElementById('calendlyEmbed');
if (calendlyEmbed) {
  document.getElementById('calendlyLoad')?.addEventListener('click', () => {
    const url = calendlyEmbed.getAttribute('data-url');
    calendlyEmbed.innerHTML = '<div class="calendly-inline-widget" data-url="' + url + '" style="min-width:280px;height:540px"></div>';
    if (!document.querySelector('script[src*="assets.calendly.com"]')) {
      const s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, { once: true });
}

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const rootEl = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) rootEl.setAttribute('data-theme', savedTheme);
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) rootEl.setAttribute('data-theme', 'dark');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (next === 'light') rootEl.removeAttribute('data-theme'); else rootEl.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', next === 'light' ? 'light' : 'dark');
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
  themeToggle.textContent = rootEl.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
}

// Back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Offline indicator
const offlineBanner = document.getElementById('offlineBanner');
function updateOnline() {
  if (offlineBanner) offlineBanner.classList.toggle('show', !navigator.onLine);
}
window.addEventListener('online', updateOnline);
window.addEventListener('offline', updateOnline);
updateOnline();

// Quote estimator
const estType = document.getElementById('estType');
const estPages = document.getElementById('estPages');
const estResult = document.getElementById('estResult');
function updateEstimate() {
  if (!estType || !estPages || !estResult) return;
  const base = parseFloat(estType.value) || 0;
  const mult = parseFloat(estPages.value) || 1;
  const low = Math.round(base * mult);
  const high = Math.round(base * mult * 1.4);
  estResult.textContent = 'Estimated: from $' + low.toLocaleString() + ' – $' + high.toLocaleString();
}
if (estType) { estType.addEventListener('change', updateEstimate); estPages.addEventListener('change', updateEstimate); updateEstimate(); }
const estSubmit = document.getElementById('estSubmit');
if (estSubmit) {
  estSubmit.addEventListener('click', async () => {
    const estStatus = document.getElementById('estStatus');
    const name = (document.getElementById('estName').value || '').trim();
    const email = (document.getElementById('estEmail').value || '').trim();
    if (!email) { if (estStatus) estStatus.textContent = 'Please enter your email.'; return; }
    if (estStatus) estStatus.textContent = 'Saving...';
    try {
      const res = await fetch('/.netlify/functions/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type: estType.value, scope: estPages.options[estPages.selectedIndex].text, estimate: estResult.textContent })
      });
      if (!res.ok) throw new Error('Failed');
      if (estStatus) estStatus.textContent = '✓ Saved! We’ll be in touch.';
    } catch (e) { if (estStatus) estStatus.textContent = '✗ Could not save. Email us instead.'; }
  });
}

// Multi-step contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const steps = contactForm.querySelectorAll('.form-step');
  const dots = contactForm.querySelectorAll('.form-step-dot');
  let current = 1;
  function showStep(n) {
    current = n;
    steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === n));
    dots.forEach(d => {
      const sn = parseInt(d.dataset.step);
      d.classList.toggle('active', sn === n);
      d.classList.toggle('done', sn < n);
    });
  }
  contactForm.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => {
    // basic validation of current step
    const step = contactForm.querySelector('.form-step.active');
    const inputs = step.querySelectorAll('input[required],textarea[required]');
    let ok = true;
    inputs.forEach(i => { if (!i.value.trim()) { i.reportValidity(); ok = false; } });
    if (ok && current < steps.length) showStep(current + 1);
  }));
  contactForm.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => {
    if (current > 1) showStep(current - 1);
  }));
}

// Hero typing effect
const heroTyped = document.getElementById('heroTyped');
if (heroTyped) {
  const phrases = ['Websites that load in under 1s.', 'Portals that replace spreadsheets.', 'Apps your team will love.'];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      heroTyped.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 1400); return; }
    } else {
      heroTyped.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 40 : 70);
  }
  tick();
}

// Cookie consent banner
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');
if (cookieBanner && !localStorage.getItem('cookieChoice')) {
  cookieBanner.classList.add('show');
}
if (cookieAccept) cookieAccept.addEventListener('click', () => { localStorage.setItem('cookieChoice','accepted'); cookieBanner.classList.remove('show'); });
if (cookieDecline) cookieDecline.addEventListener('click', () => { localStorage.setItem('cookieChoice','declined'); cookieBanner.classList.remove('show'); });

// Chat widget
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
if (chatToggle && chatPanel) {
  chatToggle.addEventListener('click', () => chatPanel.classList.toggle('show'));
}

// Sticky CTA show/hide on scroll
const stickyCta = document.getElementById('stickyCta');
if (stickyCta) {
  window.addEventListener('scroll', () => {
    stickyCta.style.transform = window.scrollY > 300 ? 'translateY(0)' : 'translateY(120%)';
  });
  stickyCta.style.transition = 'transform .25s';
  stickyCta.style.transform = 'translateY(120%)';
}

// Scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const total = (h.scrollHeight - h.clientHeight) || 1;
    scrollProgress.style.width = Math.min(100, (h.scrollTop / total) * 100) + '%';
  });
}

// Blur-up lazy images
document.querySelectorAll('img[data-src]').forEach(img => {
  const src = img.dataset.src;
  const l = new Image();
  l.onload = () => { img.src = src; img.classList.add('loaded'); img.classList.remove('lazy'); };
  l.src = src;
  img.classList.add('lazy');
});

// Button ripple
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

// i18n scaffold
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
if (langBtn && langMenu) {
  langBtn.addEventListener('click', () => langMenu.classList.toggle('show'));
  document.addEventListener('click', e => { if (!e.target.closest('.lang-switch')) langMenu.classList.remove('show'); });
  langMenu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const lang = b.dataset.lang;
    localStorage.setItem('lang', lang);
    langBtn.textContent = lang.toUpperCase();
    langMenu.classList.remove('show');
    // placeholder: real translation wiring would go here
  }));
  const saved = localStorage.getItem('lang') || 'en';
  langBtn.textContent = saved.toUpperCase();
}

// Newsletter signup
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('newsletterEmail').value || '').trim();
    const status = document.getElementById('newsletterStatus');
    if (status) status.textContent = 'Subscribing...';
    try {
      const res = await fetch('/.netlify/functions/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('fail');
      if (status) status.textContent = '✓ Subscribed!';
      newsletterForm.reset();
    } catch (e) { if (status) status.textContent = '✗ Could not subscribe.'; }
  });
}

// PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
// Smooth scroll for browsers that need polyfill already handled via CSS
