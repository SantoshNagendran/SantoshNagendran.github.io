/* ═══════════════════════════════════════════════════════════════
   PARTICLES — Interactive network topology canvas
   Nodes drift and connect with proximity lines.
   Mouse interaction pushes nearby particles outward.
   ═══════════════════════════════════════════════════════════════ */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 180 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationId = null;
    this.isVisible = true;
    this.width = 0;
    this.height = 0;

    this.config = {
      particleCount: this._getCount(),
      connectionDistance: 100,
      particleSpeed: 0.8,
      mouseInfluence: 0.06,
      colors: {
        particle: { r: 34, g: 211, b: 167 },  // accent green
        connection: { r: 56, g: 189, b: 248 },  // accent cyan
      }
    };

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._init();
  }

  /* ── Private ────────────────────────────────────────────── */

  _getCount() {
    const w = window.innerWidth;
    if (w < 768) return 0;   // skip on mobile entirely
    if (w < 1200) return 40;
    return 70;
  }

  _init() {
    this._resize();
    this._createParticles();
    this._bindEvents();

    if (this.config.particleCount === 0) return;

    if (this.reducedMotion) {
      this._drawStatic();
    } else {
      this._animate();
    }
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        radius: Math.random() * 1.5 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.2,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.config.particleCount = this._getCount();
        this._resize();
        this._createParticles();

        if (this.config.particleCount === 0 && this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
          this.ctx.clearRect(0, 0, this.width, this.height);
        } else if (this.config.particleCount > 0 && !this.animationId && !this.reducedMotion) {
          this._animate();
        }
      }, 250);
    });

    // Pause when not visible
    const observer = new IntersectionObserver(
      (entries) => { this.isVisible = entries[0].isIntersecting; },
      { threshold: 0.05 }
    );
    observer.observe(this.canvas);
  }

  /* ── Drawing ────────────────────────────────────────────── */

  _drawStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this._drawConnections();
    this._drawNodes();
  }

  _drawConnections() {
    const { connection } = this.config.colors;
    const maxDist = this.config.connectionDistance;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${connection.r},${connection.g},${connection.b},${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }
  }

  _drawNodes(time) {
    const { particle } = this.config.colors;

    this.particles.forEach(p => {
      const opacity = time
        ? p.baseOpacity + Math.sin(time + p.pulseOffset) * 0.1
        : p.baseOpacity;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${particle.r},${particle.g},${particle.b},${opacity})`;
      this.ctx.fill();
    });
  }

  _updateParticles() {
    const { mouseInfluence, particleSpeed } = this.config;

    this.particles.forEach(p => {
      // Mouse repulsion
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius && dist > 0) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.vx += (dx / dist) * force * mouseInfluence;
          p.vy += (dy / dist) * force * mouseInfluence;
        }
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Damping
      p.vx *= 0.992;
      p.vy *= 0.992;

      // Keep minimum drift
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < particleSpeed * 0.1) {
        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;
      }

      // Wrap edges
      if (p.x < -20) p.x = this.width + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.y > this.height + 20) p.y = -20;
    });
  }

  _animate() {
    const time = performance.now() * 0.001;

    if (this.isVisible) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this._updateParticles();
      this._drawConnections();
      this._drawNodes(time);
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /* ── Public ─────────────────────────────────────────────── */

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}


/* Hello mr.hacker man! what are you looking for? */