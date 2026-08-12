/* ═══════════════════════════════════════════════════════════════
   TILT — 3D perspective tilt on hover for project cards
   Tracks cursor position relative to card and applies
   rotateX/rotateY transforms. Respects reduced motion.
   ═══════════════════════════════════════════════════════════════ */

class TiltCards {
  constructor(selector) {
    this.selector = selector || '.project-card';
    this.cards = [];
    this.active = true;

    // Skip on touch or reduced motion
    const isTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || isReduced) {
      this.active = false;
      return;
    }

    this._init();
  }

  _init() {
    this.cards = document.querySelectorAll(this.selector);

    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this._onMove(e, card));
      card.addEventListener('mouseleave', () => this._onLeave(card));
      card.addEventListener('mouseenter', () => this._onEnter(card));
    });
  }

  _onEnter(card) {
    card.style.transition = 'transform 0.1s ease-out';
  }

  _onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (max ±6 degrees)
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = ((centerY - y) / centerY) * 4;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    card.style.transition = 'transform 0.1s ease-out';

    // Move shine/highlight
    const shine = card.querySelector('.project-card__shine');
    if (shine) {
      shine.style.background = `radial-gradient(
        600px circle at ${x}px ${y}px,
        rgba(34, 211, 167, 0.06),
        transparent 40%
      )`;
    }
  }

  _onLeave(card) {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    const shine = card.querySelector('.project-card__shine');
    if (shine) {
      shine.style.background = 'transparent';
    }
  }

  /** Re-bind after DOM changes */
  refresh() {
    if (!this.active) return;
    this._init();
  }
}
