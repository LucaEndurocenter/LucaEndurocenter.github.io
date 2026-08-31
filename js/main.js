/**
 * Урологический Центр — Основной JavaScript
 * Анимации как на arhimed.clinic
 */

document.addEventListener('DOMContentLoaded', function() {

  // ====== HEADER HAS-HERO CLASS ======
  const hasHero = document.querySelector('.hero, .page-hero, .specialist-hero');
  if (hasHero) {
    document.body.classList.add('has-hero');
  }

  // ====== HEADER SCROLL EFFECT ======
  const header = document.querySelector('.header');
  let lastScroll = 0;

  function handleScroll() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ====== MOBILE MENU ======
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');

  if (menuToggle && mobileMenu) {
    function openMenu() {
      menuToggle.classList.add('active');
      mobileMenu.classList.add('open');
      if (mobileOverlay) mobileOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      if (mobileOverlay) mobileOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', function() {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMenu);
    }

    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    // Сворачивание/разворачивание подменю «О центре»
    mobileMenu.querySelectorAll('.mobile-submenu-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var submenu = btn.closest('.mobile-nav-parent').nextElementSibling;
        var isOpen = submenu.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }

  // ====== SCROLL REVEAL (Intersection Observer) ======
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children';
  const revealElements = document.querySelectorAll(revealSelectors);
  // Карточки внутри .stagger-children наблюдаем по отдельности: на мобильных
  // IntersectionObserver может «залипнуть» на очень высокой сетке-родителе
  const staggerChildren = document.querySelectorAll('.stagger-children .reveal-child');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      revealObserver.observe(el);
    });

    const childObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const parent = entry.target.closest('.stagger-children');
          if (parent) parent.classList.add('visible');
          childObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -40px 0px'
    });

    staggerChildren.forEach(function(el) {
      childObserver.observe(el);
    });

    // Страховка: если наблюдатель так и не сработал — показать всё через 2.5с
    setTimeout(function() {
      staggerChildren.forEach(function(el) {
        const rect = el.getBoundingClientRect();
        if (!el.classList.contains('visible') && rect.top < window.innerHeight * 2) {
          el.classList.add('visible');
          const parent = el.closest('.stagger-children');
          if (parent) parent.classList.add('visible');
        }
      });
    }, 2500);

    // Абсолютная страховка: через 4с принудительно показать ВСЕ reveal-элементы
    // (защита от «пустых» секций при любом сбое IntersectionObserver)
    setTimeout(function() {
      revealElements.forEach(function(el) {
        el.classList.add('visible');
      });
      staggerChildren.forEach(function(el) {
        el.classList.add('visible');
      });
    }, 4000);
  } else {
    revealElements.forEach(function(el) {
      el.classList.add('visible');
    });
    staggerChildren.forEach(function(el) {
      el.classList.add('visible');
    });
  }

  // ====== ANIMATED COUNTERS ======
  const counters = document.querySelectorAll('.counter');

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const duration = 2500;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            const current = Math.floor(easeProgress * target);
            counter.textContent = current.toLocaleString('ru-RU');

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target.toLocaleString('ru-RU');
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

  // ====== PARALLAX HERO EFFECT ======
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          const scrollY = window.pageYOffset;
          if (scrollY < window.innerHeight) {
            heroBg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px) scale(1.05)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ====== FAQ ACCORDION ======
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        const isOpen = item.classList.contains('open');

        faqItems.forEach(function(otherItem) {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
          }
        });

        item.classList.toggle('open');
      });
    }
  });

  // ====== SUB-DIRECTIONS ACCORDION ======
  const subDirItems = document.querySelectorAll('.sub-dir-item');

  subDirItems.forEach(function(item) {
    const header = item.querySelector('.sub-dir-header');
    if (header) {
      header.addEventListener('click', function() {
        const isOpen = item.classList.contains('open');

        const parent = item.closest('.sub-directions');
        if (parent) {
          parent.querySelectorAll('.sub-dir-item').forEach(function(otherItem) {
            if (otherItem !== item) {
              otherItem.classList.remove('open');
            }
          });
        }

        item.classList.toggle('open');
      });
    }
  });

  // ====== CLINIC GALLERY TABS ======
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const galleryPanels = document.querySelectorAll('.gallery-panel');

  galleryTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      const targetId = tab.getAttribute('data-tab');

      galleryTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');

      galleryPanels.forEach(function(panel) {
        panel.classList.remove('active');
      });

      const targetPanel = document.getElementById('tab-' + targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // ====== REVIEWS: SHOW ALL (mobile expand) ======
  const reviewsShowAll = document.querySelector('.reviews-show-all');
  if (reviewsShowAll) {
    reviewsShowAll.addEventListener('click', function() {
      const list = document.querySelector('.index-reviews .reviews-list');
      if (!list) return;
      const expanded = list.classList.toggle('expanded');
      this.classList.toggle('open', expanded);
      this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      const label = expanded ? 'Свернуть' : 'Читать все отзывы';
      const svg = this.querySelector('svg');
      this.textContent = label + ' ';
      if (svg) this.appendChild(svg);
    });
  }

  // ====== SMOOTH SCROLL FOR ANCHOR LINKS ======
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ====== ACTIVE NAV LINK ======
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a, .mobile-menu a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ====== CARD HOVER TILT EFFECT ======
  const tiltCards = document.querySelectorAll('.direction-card, .doctor-card, .program-card');

  tiltCards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  // ====== SCROLL PROGRESS INDICATOR ======
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg, #2B7FD1, #4A9FE7);z-index:10000;transition:width 0.1s ease;width:0%;';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  // ====== GALLERY LIGHTBOX ======
  const galleryImages = document.querySelectorAll('.gallery-item img, .gallery-showcase img, .gallery-page-grid img, .dm-media img, .dm-photo img, .content-photo img');
  
  if (galleryImages.length > 0) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<div class="lightbox-overlay"></div><div class="lightbox-content"><img src="" alt=""><button class="lightbox-close">&times;</button></div>';
    document.body.appendChild(lightbox);

    // Lightbox styles
    const lightboxStyle = document.createElement('style');
    lightboxStyle.textContent = '.lightbox{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;}.lightbox.active{display:flex;}.lightbox-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.85);cursor:pointer;}.lightbox-content{position:relative;z-index:1;max-width:90vw;max-height:90vh;}.lightbox-content img{max-width:100%;max-height:85vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);}.lightbox-close{position:absolute;top:-40px;right:0;width:36px;height:36px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:50%;color:#fff;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.3s ease;}.lightbox-close:hover{background:rgba(255,255,255,0.3);}';
    document.head.appendChild(lightboxStyle);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    galleryImages.forEach(function(img) {
      img.style.cursor = 'pointer';
      img.parentElement.addEventListener('click', function(e) {
        if (e.target === img) {
          lightboxImg.src = img.src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    lightboxOverlay.addEventListener('click', closeLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

});


// ============================================
// DOCTORS FILTER & SEARCH (перенесено со второстепенного сайта)
// ============================================
const filterBtns = document.querySelectorAll('.filter-btn');
const filterableCards = document.querySelectorAll('.doctor-card[data-specialty]');
const searchInput = document.querySelector('.search-input');
const noResults = document.querySelector('.no-results');

function filterDoctors() {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const query = searchInput?.value.toLowerCase().trim() || '';
  let anyVisible = false;

  filterableCards.forEach(card => {
    const specialty = card.dataset.specialty;
    const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
    const matchesFilter = activeFilter === 'all' || specialty === activeFilter;
    const matchesSearch = name.includes(query);
    const visible = matchesFilter && matchesSearch;
    card.style.display = visible ? '' : 'none';
    if (visible) anyVisible = true;
  });

  // скрываем секции, в которых не осталось видимых карточек
  document.querySelectorAll('.leading-doctors, .all-doctors').forEach(section => {
    const visibleCards = Array.from(section.querySelectorAll('.doctor-card[data-specialty]'))
      .filter(c => c.style.display !== 'none');
    section.style.display = visibleCards.length ? '' : 'none';
  });

  if (noResults) {
    noResults.classList.toggle('visible', !anyVisible);
  }
}

if (filterBtns.length && filterableCards.length) {
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
}
