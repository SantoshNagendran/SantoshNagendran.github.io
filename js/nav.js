/* ═══════════════════════════════════════════════════════════════
   NAV — Scroll-aware navigation
   Shrinks on scroll, hides on scroll-down, shows on scroll-up.
   Highlights active section. Handles mobile menu toggle.
   ═══════════════════════════════════════════════════════════════ */

class Navigation {
  constructor() {
    this.nav        = document.getElementById('nav');
    this.hamburger  = document.getElementById('navHamburger');
    this.mobileMenu = document.getElementById('mobileMenu');
    this.navLinks   = document.querySelectorAll('.nav__link');
    this.menuLinks  = document.querySelectorAll('.mobile-menu__link');

    if (!this.nav) return;

    this.lastScroll     = 0;
    this.scrollThreshold = 80;
    this.ticking         = false;
    this.isMenuOpen      = false;

    this._init();
  }

  _init() {
    window.addEventListener('scroll', () => this._requestTick(), { passive: true });

    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this._toggleMenu());
    }

    // Close mobile menu on link click
    this.menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this._onLinkClick(e);
        if (this.isMenuOpen) this._toggleMenu();
      });
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this._onLinkClick(e));
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) this._toggleMenu();
    });

    this._observeSections();
  }

  /* ── Scroll handling ───────────────────────────────────── */

  _requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => this._onScroll());
      this.ticking = true;
    }
  }

  _onScroll() {
    this.ticking = false;
    const y = window.scrollY;

    // Scrolled state (glass background)
    this.nav.classList.toggle('nav--scrolled', y > 50);

    // Hide on scroll down, show on scroll up
    if (y > this.scrollThreshold) {
      if (y > this.lastScroll + 5) {
        this.nav.classList.add('nav--hidden');
      } else if (y < this.lastScroll - 5) {
        this.nav.classList.remove('nav--hidden');
      }
    } else {
      this.nav.classList.remove('nav--hidden');
    }

    this.lastScroll = y;
  }

  /* ── Mobile menu ───────────────────────────────────────── */

  _toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.hamburger.classList.toggle('is-active', this.isMenuOpen);
    this.mobileMenu.classList.toggle('is-open', this.isMenuOpen);
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';

    // Update ARIA
    this.hamburger.setAttribute('aria-expanded', this.isMenuOpen);
  }

  /* ── Smooth scroll to section ──────────────────────────── */

  _onLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height-sm')) || 56;

    const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;

    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ── Active section tracking ───────────────────────────── */

  _observeSections() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.navLinks.forEach(link => {
              const href = link.getAttribute('href').replace('#', '');
              link.classList.toggle('nav__link--active', href === id);
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '-15% 0px -65% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }
}
