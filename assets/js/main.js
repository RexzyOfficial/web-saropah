document.addEventListener('DOMContentLoaded', () => {

  /* ── Auto-fill copyright year ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ────────────────────────────────────────────
     NAVIGATION
  ──────────────────────────────────────────── */
  const header        = document.getElementById('site-header') || document.querySelector('header');
  const mobileToggle  = document.querySelector('.mobile-toggle');
  const navMenu       = document.querySelector('.nav-menu');
  const menuDropdown  = document.querySelector('.menu-dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');

  // Mobile hamburger → X toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      // Force span color to black when menu is open (white bg)
      mobileToggle.querySelectorAll('span').forEach(s => {
        s.style.background = isOpen ? '#111' : '';
      });
    });
  }

  // Mobile: main Menu dropdown
  if (dropdownToggle && menuDropdown) {
    dropdownToggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const isOpen = menuDropdown.classList.toggle('active');
        dropdownToggle.setAttribute('aria-expanded', String(isOpen));
      } else {
        e.preventDefault();
      }
    });
  }

  // Mobile: sub-category menus
  document.querySelectorAll('.category-link').forEach(link => {
    const subMenu = link.nextElementSibling;
    if (!subMenu || !subMenu.classList.contains('subcategory-menu')) return;
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle('active');
      }
    });
  });

  // Close mobile menu on nav link click
  document.querySelectorAll('.nav-menu a:not(.dropdown-toggle):not(.category-link)').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        mobileToggle && mobileToggle.classList.remove('active');
        mobileToggle && mobileToggle.querySelectorAll('span').forEach(s => s.style.background = '');
        navMenu && navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Close desktop dropdown on outside click
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 768 && menuDropdown) {
      if (!menuDropdown.contains(e.target)) menuDropdown.classList.remove('active');
    }
  });

  /* ────────────────────────────────────────────
     SCROLL: header glass + hide/show
  ──────────────────────────────────────────── */
  let lastScroll = 0;

  function handleScroll() {
    if (!header) return;
    const y = window.pageYOffset;
    if (y > 60) header.classList.add('scrolled');
    else         header.classList.remove('scrolled');

    if (!navMenu || !navMenu.classList.contains('active')) {
      header.style.transform = (y > lastScroll && y > 120) ? 'translateY(-100%)' : 'translateY(0)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ────────────────────────────────────────────
     FADE-IN OBSERVER
  ──────────────────────────────────────────── */
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ────────────────────────────────────────────
     FAQ ACCORDION
  ──────────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ────────────────────────────────────────────
     LIGHTBOX (Gallery)
  ──────────────────────────────────────────── */
  const galleryImages = document.querySelectorAll('.vibes-big img, .vibes-small img, .gallery-grid img');
  if (galleryImages.length > 0) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Tutup">&times;</button><img class="lightbox-img" src="" alt="">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn    = lightbox.querySelector('.lightbox-close');

    galleryImages.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.setAttribute('tabindex', '0');
      const open = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    });

    const close = () => { lightbox.classList.remove('active'); document.body.style.overflow = ''; };
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) close(); });
  }

});

/* ────────────────────────────────────────────
   ORDER NOW → SHOPEE FOOD
   Desktop: goes to /order.html — a page explaining that Shopee
   Food only works from a phone, with a QR code to scan and a
   fallback link to the plain Shopee web page.
   Mobile (Android/iOS): intercepted here and sent straight to
   the Shopee universal link instead (same tab, no popup window),
   skipping the interstitial, which opens the Shopee app directly
   if it's installed. Uses event delegation on `document` so it
   also works on Order buttons that menu-renderer.js injects later.
──────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-order-link]');
  if (!link) return;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) return; // desktop: let the normal href handle it

  e.preventDefault();
  window.location.href =
    'https://shopee.co.id/universal-link/now-food/shop/21718202?deep_and_deferred=1&shareChannel=copy_link';
});
