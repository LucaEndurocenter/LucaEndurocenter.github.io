// ============ SCROLL REVEAL ============
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ============ HEADER SCROLL ============
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
}, { passive: true });

// ============ MOBILE MENU ============
const hamburger = document.querySelector('.hamburger');
const mobileOverlay = document.querySelector('.mobile-overlay');
const mobileClose = document.querySelector('.mobile-close');

if (hamburger && mobileOverlay) {
  hamburger.addEventListener('click', () => {
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  mobileClose.addEventListener('click', () => {
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  mobileOverlay.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) {
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ============ ACCORDION ============
document.querySelectorAll('.accordion-item').forEach(item => {
  const header = item.querySelector('.accordion-header');
  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close siblings
    item.parentElement.querySelectorAll('.accordion-item').forEach(sib => {
      sib.classList.remove('open');
    });
    // Toggle current
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = header.offsetHeight + 10;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// ============ DOCTOR FILTER ============
const filterBtns = document.querySelectorAll('.filter-btn');
const doctorCards = document.querySelectorAll('.doctor-card[data-specialty]');
const searchInput = document.querySelector('.search-input');

function filterDoctors() {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const query = searchInput?.value.toLowerCase() || '';

  doctorCards.forEach(card => {
    const specialty = card.dataset.specialty;
    const name = card.querySelector('.doctor-card-name')?.textContent.toLowerCase() || '';
    const matchesFilter = activeFilter === 'all' || specialty === activeFilter;
    const matchesSearch = name.includes(query);
    card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterDoctors();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', filterDoctors);
}

// ============ DIRECTION FILTER ============
const dirCatBtns = document.querySelectorAll('.direction-cat-btn');
const dirItems = document.querySelectorAll('.direction-item');

dirCatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    dirCatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    dirItems.forEach(item => {
      item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
  });
});

// ============ DIRECTION TOGGLE DETAIL ============
document.querySelectorAll('.direction-item').forEach(item => {
  item.addEventListener('click', () => {
    const detail = item.querySelector('.direction-detail');
    if (detail) {
      detail.classList.toggle('show');
    }
  });
});

// ============ COUNTER ANIMATION ============
const counters = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.counter);
      const duration = 1500;
      const start = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// ============ ACTIVE NAV LINK ============
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});
