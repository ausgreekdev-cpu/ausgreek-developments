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
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', () => {
      portfolioFilter.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
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
  blogTags.forEach(t => {
    t.setAttribute('aria-pressed', t.classList.contains('active') ? 'true' : 'false');
    t.addEventListener('click', () => {
      blogTags.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      t.classList.add('active');
      t.setAttribute('aria-pressed', 'true');
      applyBlogFilter();
    });
  });
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
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>'); }
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
        const sb2 = form.querySelector('button[type="submit"]');
        if (sb2) { sb2.classList.remove('loading'); const sp2 = sb2.querySelector('.spinner'); if (sp2) sp2.remove(); }
        form.reset();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      const sb = form.querySelector('button[type="submit"]');
      if (sb) { sb.classList.remove('loading'); const sp = sb.querySelector('.spinner'); if (sp) sp.remove(); }
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
if (savedTheme === 'dark') rootEl.setAttribute('data-theme', 'dark');
else if (savedTheme === 'light') rootEl.removeAttribute('data-theme');
else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) rootEl.setAttribute('data-theme', 'dark');
// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) rootEl.setAttribute('data-theme', 'dark'); else rootEl.removeAttribute('data-theme');
    }
  });
}
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
    if (estSubmit) { estSubmit.classList.add('loading'); estSubmit.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>'); }
    try {
      const res = await fetch('/.netlify/functions/quote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type: estType.value, scope: estPages.options[estPages.selectedIndex].text, estimate: estResult.textContent })
      });
      if (!res.ok) throw new Error('Failed');
      if (estStatus) estStatus.textContent = '✓ Saved! We’ll be in touch.';
    } catch (e) { if (estStatus) estStatus.textContent = '✗ Could not save. Email us instead.'; }
    if (estSubmit) { estSubmit.classList.remove('loading'); const sp = estSubmit.querySelector('.spinner'); if (sp) sp.remove(); }
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

// Chat widget (lazy-load provider if configured)
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatWidget = document.getElementById('chatWidget');
if (chatToggle && chatPanel) {
  chatToggle.addEventListener('click', () => {
    const src = chatWidget ? chatWidget.getAttribute('data-chat-src') : '';
    if (src && !chatWidget.dataset.loaded) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
      chatWidget.dataset.loaded = '1';
    }
    chatPanel.classList.toggle('show');
  });
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

// Stripe deposit (lazy)
const payDeposit = document.getElementById('payDeposit');
if (payDeposit) {
  payDeposit.addEventListener('click', async () => {
    payDeposit.classList.add('loading');
    payDeposit.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
    try {
      const res = await fetch('/.netlify/functions/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: 'Ausgreek Developments — Project Deposit', amount: 195000 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert('Stripe not configured yet. Email us to arrange payment.');
    } finally {
      payDeposit.classList.remove('loading');
      const sp = payDeposit.querySelector('.spinner'); if (sp) sp.remove();
    }
  });
}

// Scroll-triggered reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// Parallax hero
const heroOrbs = document.querySelectorAll('.hero-orb');
if (heroOrbs.length) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroOrbs.forEach((orb, i) => { orb.style.transform = 'translateY(' + (y * (i === 0 ? 0.3 : 0.15)) + 'px)'; });
  }, { passive: true });
}

// Magnetic buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// Custom cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);
document.addEventListener('mousemove', (e) => { cursor.style.left = (e.clientX - 10) + 'px'; cursor.style.top = (e.clientY - 10) + 'px'; });
document.querySelectorAll('a, button, .btn').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Particle trail
const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
document.addEventListener('mousemove', (e) => {
  for (let i = 0; i < 2; i++) {
    particles.push({ x: e.clientX, y: e.clientY, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 1, size: Math.random()*3+1 });
  }
});
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.02; p.size *= 0.98;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(37,99,235,' + p.life + ')';
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Live status page
const statusPage = document.getElementById('statusPage');
if (statusPage) {
  fetch('/.netlify/functions/health').then(r => r.json()).then(d => {
    statusPage.innerHTML = '<div class="status-card"><span class="status-dot green"></span><div class="info"><div class="name">API</div><div class="detail">' + d.status + ' — ' + new Date(d.time).toLocaleTimeString() + '</div></div></div>' +
      '<div class="status-card"><span class="status-dot green"></span><div class="info"><div class="name">Functions</div><div class="detail">' + (d.functions||[]).length + ' deployed</div></div></div>' +
      '<div class="status-card"><span class="status-dot green"></span><div class="info"><div class="name">Version</div><div class="detail">' + d.version + '</div></div></div>' +
      '<div class="status-card"><span class="status-dot green"></span><div class="info"><div class="name">Site</div><div class="detail">ausgreek-developments.netlify.app</div></div></div>';
  }).catch(() => {
    statusPage.innerHTML = '<div class="status-card"><span class="status-dot red"></span><div class="info"><div class="name">API</div><div class="detail">Unreachable</div></div></div>';
  });
}

// Interactive pricing calculator
const calcSliders = document.querySelectorAll('.calc-slider');
if (calcSliders.length) {
  function updateCalc() {
    const pages = parseInt(document.getElementById('calcPages').value) || 5;
    const features = parseInt(document.getElementById('calcFeatures').value) || 3;
    const integrations = parseInt(document.getElementById('calcIntegrations').value) || 1;
    const base = 3500;
    const est = Math.round(base + (pages * 200) + (features * 800) + (integrations * 1500));
    const low = Math.round(est * 0.85);
    const high = Math.round(est * 1.3);
    const result = document.getElementById('calcResult');
    if (result) result.innerHTML = 'Estimated: $' + low.toLocaleString() + ' – $' + high.toLocaleString() + '<small>Indicative — final quote after discovery</small>';
    document.getElementById('calcPagesVal').textContent = pages;
    document.getElementById('calcFeaturesVal').textContent = features;
    document.getElementById('calcIntegrationsVal').textContent = integrations;
  }
  calcSliders.forEach(s => s.addEventListener('input', updateCalc));
  updateCalc();
}

// Morphing shape divider
const morphPath = document.getElementById('morphPath');
if (morphPath) {
  const shapes = [
    'M0,30 C360,60 720,0 1080,30 C1260,45 1350,15 1440,30 L1440,60 L0,60 Z',
    'M0,40 C360,10 720,50 1080,20 C1260,35 1350,50 1440,25 L1440,60 L0,60 Z',
    'M0,20 C360,50 720,10 1080,40 C1260,25 1350,45 1440,35 L1440,60 L0,60 Z',
  ];
  let mi = 0;
  setInterval(() => {
    mi = (mi + 1) % shapes.length;
    morphPath.setAttribute('d', shapes[mi]);
  }, 3000);
}

// Real-time visitor counter
const visitorCounter = document.getElementById('visitorCounter');
if (visitorCounter) {
  function updateVisitors() {
    fetch('/.netlify/functions/analytics').then(r => r.json()).then(d => {
      visitorCounter.querySelector('.count').textContent = (d.count || 0) + 1;
    }).catch(() => {});
  }
  updateVisitors();
  setInterval(updateVisitors, 30000);
}

// Performance dashboard animated counters
const perfNums = document.querySelectorAll('.perf-item .num[data-target]');
if (perfNums.length) {
  const perfObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.ceil(target / 30);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + (el.dataset.suffix || '');
          if (current >= target) clearInterval(timer);
        }, 30);
        perfObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  perfNums.forEach(el => perfObserver.observe(el));
}

// Code playground live preview (CodeMirror)
const codeEditor = document.getElementById('codeEditor');
const codePreview = document.getElementById('codePreview');
if (codeEditor && codePreview) {
  let editor = codeEditor;
  if (window.CodeMirror) {
    editor = CodeMirror.fromTextArea(codeEditor, {
      mode: 'htmlmixed',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
    });
  }
  function updatePreview() {
    const code = (window.CodeMirror && editor.getValue) ? editor.getValue() : codeEditor.value;
    const doc = codePreview.contentDocument || codePreview.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
  }
  if (window.CodeMirror && editor.on) {
    editor.on('change', updatePreview);
  } else {
    codeEditor.addEventListener('input', updatePreview);
  }
  updatePreview();
}

// Open source showcase (GitHub API)
const ghRepos = document.getElementById('githubRepos');
if (ghRepos) {
  fetch('https://api.github.com/users/ausgreekdev-cpu/repos?sort=updated&per_page=6')
    .then(r => r.json())
    .then(repos => {
      if (!Array.isArray(repos) || repos.length === 0) {
        ghRepos.innerHTML = '<div style="text-align:center;padding:24px;color:var(--slate-400)">No public repos found.</div>';
        return;
      }
      ghRepos.innerHTML = repos.map(r =>
        '<a href="' + r.html_url + '" target="_blank" rel="noopener noreferrer" style="display:block;background:#fff;border:1px solid var(--slate-200);border-radius:12px;padding:16px;text-decoration:none;color:inherit;transition:transform .2s" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">' +
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">' +
        '<strong style="font-size:14px;color:var(--navy)">' + r.name + '</strong>' +
        '<span style="font-size:11px;color:var(--slate-400)">⭐ ' + r.stargazers_count + '</span>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--slate-600);margin-bottom:8px;line-height:1.5">' + (r.description || 'No description') + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        (r.language ? '<span style="font-size:10px;font-weight:600;background:var(--slate-100);padding:3px 8px;border-radius:999px;color:var(--slate-600)">' + r.language + '</span>' : '') +
        '<span style="font-size:10px;font-weight:600;background:var(--slate-100);padding:3px 8px;border-radius:999px;color:var(--slate-600)">Forks: ' + r.forks_count + '</span>' +
        '</div></a>'
      ).join('');
    })
    .catch(() => {
      ghRepos.innerHTML = '<div style="text-align:center;padding:24px;color:var(--slate-400)">Could not load repos. <a href="https://github.com/ausgreekdev-cpu" style="color:var(--blue)">View on GitHub →</a></div>';
    });
}

// PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
// Smooth scroll for browsers that need polyfill already handled via CSS
