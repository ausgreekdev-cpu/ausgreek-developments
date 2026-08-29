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
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form handling
const form = document.querySelector('.contact-form');
const statusEl = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', async (e) => {
    // If running locally without Netlify, show demo success
    const isNetlify = form.hasAttribute('data-netlify');
    // Let Netlify handle if deployed, but also provide UX feedback
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      e.preventDefault();
      if (statusEl) {
        statusEl.textContent = '✓ Thanks! Your message has been received (demo). On Netlify this will email you.';
        statusEl.className = 'form-status success';
      }
      form.reset();
      return;
    }
    // On Netlify, allow default POST but show pending state
    if (statusEl) {
      statusEl.textContent = 'Sending...';
      statusEl.className = 'form-status';
    }
  });
}

// Smooth scroll for browsers that need polyfill already handled via CSS
