/* ═══════════════════════════════════════════════════════════════
   APP.JS — Modern Anime.js + Lenis smooth scroll orchestration
   Provides high-end editorial transitions, staggered typography,
   and scroll-driven reveals without standard template feel.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let lenis, particleNetwork;

  function init() {
    initSmoothScroll();
    initParticleCanvas();
    splitHeroText();
    splitSlideHeadings();
    splitAboutWords();
    initPreloader();
    initScrollReveals();
    initCertSlider();
    initSecretEasterEggs();
    
    // Secret route clue & command for developers
    window.perth = function() {
      console.log('✈ Connecting to Western Australia node...');
      window.location.href = 'perth.html';
    };
    console.log('%c[SYS] Hint: Type "perth" anywhere or run perth() in console.', 'color: #FF7700; font-family: "IBM Plex Mono", monospace; font-size: 11px; background: #0F1218; padding: 4px 8px; border: 1px solid #1E222D; border-radius: 4px;');
  }

  /* ── 1. Smooth Scroll (Lenis) ───────────────────────────── */

  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 2
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync scroll progress bar with Lenis
    var progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
      lenis.on('scroll', function (e) {
        var scrollTop = e.scroll;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.height = progress + '%';
      });
    }

    // Anchor link handling
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -60 });
        }
      });
    });
  }

  /* ── 2. Particle Network ───────────────────────────────── */

  function initParticleCanvas() {
    if (typeof ParticleNetwork !== 'undefined') {
      particleNetwork = new ParticleNetwork('heroCanvas');
    }
  }

  /* ── 3. Text Splitting Helpers ─────────────────────────── */

  function splitHeroText() {
    var heroLines = document.querySelectorAll('[data-reveal="hero"]');
    heroLines.forEach(function (line) {
      var text = line.textContent.trim();
      line.innerHTML = '';
      for (var i = 0; i < text.length; i++) {
        var charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        line.appendChild(charSpan);
      }
    });
  }

  function splitSlideHeadings() {
    var headings = document.querySelectorAll('[data-reveal="slide"]');
    headings.forEach(function (heading) {
      var content = heading.innerHTML;
      heading.innerHTML = '<span class="inner">' + content + '</span>';
    });
  }

  function splitAboutWords() {
    var aboutText = document.querySelector('[data-word-reveal]');
    if (!aboutText) return;
    var words = aboutText.textContent.trim().split(/\s+/);
    aboutText.innerHTML = words.map(function (word) {
      return '<span class="word">' + word + '</span>';
    }).join(' ');
  }

  /* ── 4. Tech Preloader & Hero Entrance (Anime.js) ──────── */

  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var bar = document.getElementById('preloaderBar');
    var percent = document.getElementById('preloaderPercent');
    var cmd = document.getElementById('preloaderCmd');
    var status = document.getElementById('preloaderStatus');

    if (!preloader || typeof anime === 'undefined') {
      if (preloader) preloader.style.display = 'none';
      initHeroAnimations();
      return;
    }

    var progressObj = { value: 0 };
    var commands = [
      'INITIALIZING CORE SYSTEMS...',
      'ESTABLISHING TELEMETRY PIPELINE...',
      'STARTING DAEMON & MESH TOPOLOGY...',
      'SYSTEM READY.'
    ];

    var preloaderTL = anime.timeline({
      easing: 'easeInOutQuad',
      complete: function() {
        anime({
          targets: preloader,
          opacity: [1, 0],
          duration: 450,
          easing: 'easeOutQuad',
          complete: function() {
            preloader.style.display = 'none';
            initHeroAnimations();
          }
        });
      }
    });

    // Animate progress percentage and progress bar
    preloaderTL.add({
      targets: progressObj,
      value: 100,
      round: 1,
      duration: 1400,
      easing: 'cubicBezier(0.25, 1, 0.5, 1)',
      update: function() {
        var val = progressObj.value;
        var formatted = String(Math.floor(val)).padStart(3, '0') + '%';
        if (percent) percent.textContent = formatted;
        if (bar) bar.style.width = val + '%';

        if (cmd) {
          if (val < 30) cmd.textContent = commands[0];
          else if (val < 65) cmd.textContent = commands[1];
          else if (val < 90) cmd.textContent = commands[2];
          else cmd.textContent = commands[3];
        }

        if (status) {
          if (val < 60) status.textContent = 'NODE // CONNECTING';
          else if (val < 95) status.textContent = 'TOPOLOGY // ACTIVE';
          else status.textContent = 'STATUS // 200 OK';
        }
      }
    });
  }

  function initHeroAnimations() {
    if (typeof anime === 'undefined') return;

    var tl = anime.timeline({
      easing: 'cubicBezier(0.16, 1, 0.3, 1)'
    });

    // Character entrance stagger
    tl.add({
      targets: '.hero__line .char',
      translateY: ['110%', '0%'],
      opacity: [0, 1],
      duration: 1100,
      delay: anime.stagger(35, { start: 100 })
    })
    // Tagline & meta reveal
    .add({
      targets: '.hero__bottom[data-reveal="fade"]',
      translateY: [25, 0],
      opacity: [0, 1],
      duration: 900
    }, '-=500')
    // Scroll indicator reveal
    .add({
      targets: '.hero__scroll[data-reveal="fade"]',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 800
    }, '-=600');
  }

  /* ── 5. Scroll-Triggered Reveals ───────────────────────── */

  function initScrollReveals() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything if no IntersectionObserver
      document.querySelectorAll('.word').forEach(function(w){ w.classList.add('is-visible'); });
      document.querySelectorAll('[data-reveal], [data-animate]').forEach(function(el){ el.style.opacity = 1; });
      return;
    }

    // A. Slide headings reveal
    var slideHeadings = document.querySelectorAll('[data-reveal="slide"]');
    var headingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var inner = entry.target.querySelector('.inner');
          if (inner && typeof anime !== 'undefined') {
            anime({
              targets: inner,
              translateY: ['110%', '0%'],
              duration: 1000,
              easing: 'cubicBezier(0.16, 1, 0.3, 1)'
            });
          } else if (inner) {
            inner.style.transform = 'translateY(0)';
          }
          headingObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    slideHeadings.forEach(function (el) { headingObserver.observe(el); });

    // B. About section word reveal
    var aboutText = document.querySelector('[data-word-reveal]');
    if (aboutText) {
      var words = aboutText.querySelectorAll('.word');
      var aboutObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (typeof anime !== 'undefined') {
              anime({
                targets: words,
                opacity: [0.12, 1],
                color: ['#64748B', '#E2E8F0'],
                delay: anime.stagger(25),
                duration: 600,
                easing: 'easeOutQuad'
              });
            } else {
              words.forEach(function(w){ w.classList.add('is-visible'); });
            }
            aboutObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      aboutObserver.observe(aboutText);
    }

    // C. Projects reveal
    var projects = document.querySelectorAll('[data-animate="project"]');
    var projectObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (typeof anime !== 'undefined') {
            var tl = anime.timeline({ easing: 'cubicBezier(0.16, 1, 0.3, 1)' });

            var label = el.querySelector('.project__label');
            var desc = el.querySelector('.project__desc');
            var tags = el.querySelector('.project__tags');
            var links = el.querySelector('.project__links');
            var visual = el.querySelector('.project__visual');

            tl.add({
              targets: [label, desc, tags, links],
              opacity: [0, 1],
              translateY: [25, 0],
              delay: anime.stagger(100),
              duration: 800
            })
            .add({
              targets: visual,
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 900
            }, '-=600');
          } else {
            el.querySelectorAll('.project__label, .project__desc, .project__tags, .project__links, .project__visual').forEach(function(child){
              child.style.opacity = 1;
              child.style.transform = 'none';
            });
          }
          projectObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    projects.forEach(function (p) { projectObserver.observe(p); });

    // D. Stagger grids (Skills & Achievements)
    var staggers = document.querySelectorAll('[data-animate="stagger"]');
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var children = entry.target.children;
          if (typeof anime !== 'undefined') {
            anime({
              targets: children,
              opacity: [0, 1],
              translateY: [25, 0],
              delay: anime.stagger(120),
              duration: 800,
              easing: 'cubicBezier(0.16, 1, 0.3, 1)'
            });
          } else {
            Array.from(children).forEach(function(c){
              c.style.opacity = 1;
              c.style.transform = 'none';
            });
          }
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    staggers.forEach(function (s) { staggerObserver.observe(s); });

    // E. Contact section reveal
    var contactSection = document.querySelector('.contact');
    if (contactSection) {
      var contactObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var sub = contactSection.querySelector('.contact__sub');
            var links = contactSection.querySelector('.contact__links');
            if (typeof anime !== 'undefined') {
              anime({
                targets: [sub, links],
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(150, { start: 400 }),
                duration: 800,
                easing: 'cubicBezier(0.16, 1, 0.3, 1)'
              });
            } else {
              if (sub) { sub.style.opacity = 1; sub.style.transform = 'none'; }
              if (links) { links.style.opacity = 1; links.style.transform = 'none'; }
            }
            contactObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      contactObserver.observe(contactSection);
    }
  }

  /* ── 6. Certificate Slider Component ───────────────────── */

  function initCertSlider() {
    var track = document.getElementById('certTrack');
    var prevBtn = document.getElementById('certPrev');
    var nextBtn = document.getElementById('certNext');
    var counter = document.getElementById('certCounter');
    var viewport = document.getElementById('certViewport');

    if (!track || !prevBtn || !nextBtn || !counter) return;

    var cards = track.children;
    var total = cards.length;
    var currentIndex = 0;

    function getVisibleCount() {
      var w = window.innerWidth;
      if (w < 600) return 1;
      if (w < 900) return 2;
      return 3;
    }

    function getMaxIndex() {
      var visible = getVisibleCount();
      return Math.max(0, total - visible);
    }

    function updateSlider() {
      var maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) currentIndex = maxIdx;
      if (currentIndex < 0) currentIndex = 0;

      if (cards.length > 0) {
        var cardWidth = cards[0].getBoundingClientRect().width;
        var gap = 24; // var(--s-lg)
        var offset = currentIndex * (cardWidth + gap);
        track.style.transform = 'translateX(-' + offset + 'px)';
      }

      // Update counter (1-indexed display)
      var currentDisplay = String(currentIndex + 1).padStart(2, '0');
      var totalDisplay = String(total).padStart(2, '0');
      counter.textContent = currentDisplay + ' / ' + totalDisplay;

      // Update button states
      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      nextBtn.style.opacity = currentIndex >= maxIdx ? '0.4' : '1';
      nextBtn.style.pointerEvents = currentIndex >= maxIdx ? 'none' : 'auto';
    }

    prevBtn.addEventListener('click', function () {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });

    nextBtn.addEventListener('click', function () {
      if (currentIndex < getMaxIndex()) {
        currentIndex++;
        updateSlider();
      }
    });

    // Touch / Drag Swiping
    var startX = 0;
    var currentX = 0;
    var isDragging = false;

    if (viewport) {
      viewport.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });

      viewport.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', function () {
        if (!isDragging) return;
        var diffX = startX - currentX;
        if (Math.abs(diffX) > 40) {
          if (diffX > 0 && currentIndex < getMaxIndex()) {
            currentIndex++;
          } else if (diffX < 0 && currentIndex > 0) {
            currentIndex--;
          }
          updateSlider();
        }
        isDragging = false;
      });
    }

    window.addEventListener('resize', function () {
      updateSlider();
    });

    updateSlider();
  }

  /* ── 7. Secret Easter Egg Entry Modes ──────────────────── */

  function initSecretEasterEggs() {
    // A. Keyboard sequence listener ("perth")
    var targetSequence = 'perth';
    var typed = '';
    var timer;

    window.addEventListener('keydown', function (e) {
      // Ignore if user is inside an input/textarea if any
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      typed += e.key.toLowerCase();
      clearTimeout(timer);
      timer = setTimeout(function () { typed = ''; }, 2500);

      if (typed.endsWith(targetSequence)) {
        triggerPortal();
      }
    });

    // B. Triple click on logo
    var logo = document.querySelector('.header__logo');
    if (logo) {
      var clickCount = 0;
      var clickTimer;
      logo.addEventListener('click', function (e) {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(function () { clickCount = 0; }, 600);

        if (clickCount >= 3) {
          e.preventDefault();
          triggerPortal();
        }
      });
    }

    function triggerPortal() {
      // High-tech transition toast
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#08090D;border:1px solid #FF7700;color:#FF7700;padding:12px 20px;border-radius:6px;font-family:"IBM Plex Mono",monospace;font-size:12px;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,0.8);letter-spacing:0.05em;animation:fadeIn 0.3s ease;';
      toast.innerHTML = '✈ Connecting to Perth, WA node...';
      document.body.appendChild(toast);

      setTimeout(function () {
        window.location.href = 'perth.html';
      }, 700);
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
