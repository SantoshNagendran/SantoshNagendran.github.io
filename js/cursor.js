/* ═══════════════════════════════════════════════════════════════
   CURSOR — Custom cursor with magnetic pull on interactive elements
   Dot follows mouse tightly, ring trails with eased delay.
   Hidden on touch devices and when reduced motion is preferred.
   ═══════════════════════════════════════════════════════════════ */

class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    this.dot    = document.querySelector('.cursor__dot');
    this.ring   = document.querySelector('.cursor__ring');

    if (!this.cursor || !this.dot || !this.ring) return;

    // Skip on touch / reduced motion
    const isTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || isReduced) {
      this.cursor.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }

    this.pos     = { x: -100, y: -100 };
    this.dotPos  = { x: -100, y: -100 };
    this.ringPos = { x: -100, y: -100 };
    this.visible  = false;
    this.hovering = false;

    this._init();
  }

  _init() {
    document.addEventListener('mousemove', (e) => this._onMove(e));
    document.addEventListener('mouseenter', () => this._show());
    document.addEventListener('mouseleave', () => this._hide());

    this._setupHoverTargets();
    this._render();
  }

  _onMove(e) {
    this.pos.x = e.clientX;
    this.pos.y = e.clientY;
    if (!this.visible) this._show();
  }

  _show() {
    this.visible = true;
    this.cursor.style.opacity = '1';
  }

  _hide() {
    this.visible = false;
    this.cursor.style.opacity = '0';
  }

  _setupHoverTargets() {
    // Delegate hover detection — works for dynamically added elements too
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        this.hovering = true;
        this.cursor.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor]');
      if (target) {
        // Only remove if we're actually leaving the element
        const related = e.relatedTarget;
        if (!target.contains(related)) {
          this.hovering = false;
          this.cursor.classList.remove('is-hovering');
        }
      }
    });

    // Magnetic pull for [data-cursor="magnetic"] elements
    document.addEventListener('mousemove', (e) => {
      const magnetic = e.target.closest('[data-cursor="magnetic"]');
      if (magnetic) this._applyMagnetic(e, magnetic);
    });

    document.addEventListener('mouseout', (e) => {
      const magnetic = e.target.closest('[data-cursor="magnetic"]');
      if (magnetic) {
        const related = e.relatedTarget;
        if (!magnetic.contains(related)) {
          this._resetMagnetic(magnetic);
        }
      }
    });
  }

  _applyMagnetic(e, el) {
    const rect    = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top  + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    el.style.transform  = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    el.style.transition = 'transform 0.15s ease-out';
  }

  _resetMagnetic(el) {
    el.style.transform  = '';
    el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  }

  _render() {
    // Dot — fast follow
    this.dotPos.x += (this.pos.x - this.dotPos.x) * 0.5;
    this.dotPos.y += (this.pos.y - this.dotPos.y) * 0.5;

    // Ring — eased trail
    this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.12;
    this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.12;

    this.dot.style.transform  = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0)`;
    this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;

    requestAnimationFrame(() => this._render());
  }

  /** Re-scan hover targets (call after DOM updates) */
  refresh() {
    // Event delegation handles this automatically
  }
}
