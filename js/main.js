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
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
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
        statusEl.textContent = '✗ Something went wrong. Please try again or email us directly at hello@ausgreek.dev';
        statusEl.className = 'form-status error';
      }
    }
  });
}

// Smooth scroll for browsers that need polyfill already handled via CSS
