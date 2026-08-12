/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS — GSAP + ScrollTrigger orchestration
   Hero entrance timeline, scroll-driven section reveals,
   staggered children, and text splitting.
   ═══════════════════════════════════════════════════════════════ */

class Animations {
  constructor() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Animations] GSAP not loaded — falling back');
      this._fallback();
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 1 });

    this._init();
  }

  _init() {
    this._splitHeroText();

    if (this.reducedMotion) {
      this._initReduced();
    } else {
      this._heroTimeline();
      this._sectionReveals();
      this._staggerGroups();
    }
  }

  /* ── Fallback (no GSAP) ────────────────────────────────── */

  _fallback() {
    const els = [
      '.hero__status', '.hero__tagline', '.hero__meta', '.hero__scroll',
      '.reveal-up', '.reveal-fade', '.reveal-left', '.reveal-right', '.reveal-scale'
    ];
    els.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    document.querySelectorAll('.hero__name-line .char').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.stagger-children > *').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── Reduced motion ────────────────────────────────────── */

  _initReduced() {
    gsap.set([
      '.hero__status', '.hero__tagline', '.hero__meta', '.hero__scroll'
    ], { opacity: 1, y: 0 });
    gsap.set('.hero__name-line .char', { opacity: 1, y: 0 });

    // Simple section visibility
    document.querySelectorAll('.section').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        onEnter: () => section.classList.add('is-visible'),
        once: true
      });
    });

    // Make all reveal elements visible
    gsap.set('.reveal-up, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale', {
      opacity: 1, x: 0, y: 0, scale: 1
    });
    gsap.set('.stagger-children > *', { opacity: 1, y: 0 });
  }

  /* ── Text splitting ────────────────────────────────────── */

  _splitHeroText() {
    document.querySelectorAll('.hero__name-line').forEach(line => {
      const text = line.textContent.trim();
      line.textContent = '';
      line.setAttribute('aria-label', text);

      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.setAttribute('aria-hidden', 'true');
        line.appendChild(span);
      });
    });
  }

  /* ── Hero entrance ─────────────────────────────────────── */

  _heroTimeline() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Status badge
    tl.to('.hero__status', {
      opacity: 1,
      duration: 0.8,
    }, 0.6);

    // First name — staggered character reveal
    tl.to('.hero__name-line:first-child .char', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.035,
      ease: 'power4.out'
    }, 0.8);

    // Last name
    tl.to('.hero__name-line:last-child .char', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.035,
      ease: 'power4.out'
    }, 1.0);

    // Tagline
    tl.to('.hero__tagline', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 1.5);

    // Meta
    tl.to('.hero__meta', {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 1.7);

    // Scroll indicator
    tl.to('.hero__scroll', {
      opacity: 1,
      duration: 1,
    }, 2.2);

    return tl;
  }

  /* ── Section scroll reveals ────────────────────────────── */

  _sectionReveals() {
    // Section headers
    document.querySelectorAll('.section').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        onEnter: () => {
          section.classList.add('is-visible');

          const index = section.querySelector('.section__index');
          const title = section.querySelector('.section__title');

          if (index) {
            gsap.fromTo(index,
              { opacity: 0, x: -20 },
              { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
            );
          }
          if (title) {
            gsap.fromTo(title,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
            );
          }
        },
        once: true
      });
    });

    // Generic reveal-up elements
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Reveal-fade
    document.querySelectorAll('.reveal-fade').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Reveal-left / right
    document.querySelectorAll('.reveal-left').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    document.querySelectorAll('.reveal-right').forEach(el => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  }

  /* ── Stagger groups ────────────────────────────────────── */

  _staggerGroups() {
    document.querySelectorAll('.stagger-children').forEach(container => {
      const children = container.children;
      if (!children.length) return;

      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /* ── Public: refresh ScrollTrigger after DOM changes ──── */

  refresh() {
    ScrollTrigger.refresh();
  }
}
