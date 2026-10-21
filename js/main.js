/* ============================================================
   Andrés Cifuentes — CV Web
   Idioma, menú, GitHub, barras, carrusel de certificados, reveal
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Año dinámico ---- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---- Toggle de idioma ES <-> EN ---- */
  var langBtn = document.getElementById('langToggle');
  var lang = 'es';
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = (lang === 'es') ? 'en' : 'es';
      document.documentElement.lang = lang;
      langBtn.setAttribute('aria-pressed', String(lang === 'en'));

      document.querySelectorAll('[data-en]').forEach(function (node) {
        if (lang === 'en') {
          if (!node.dataset.esOriginal) node.dataset.esOriginal = node.innerHTML;
          node.innerHTML = node.dataset.en;
        } else if (node.dataset.esOriginal) {
          node.innerHTML = node.dataset.esOriginal;
        }
      });

      var titleTag = document.querySelector('title');
      if (titleTag && titleTag.dataset.en) {
        if (lang === 'en') {
          if (!titleTag.dataset.esOriginal) titleTag.dataset.esOriginal = titleTag.textContent;
          titleTag.textContent = titleTag.dataset.en;
        } else if (titleTag.dataset.esOriginal) {
          titleTag.textContent = titleTag.dataset.esOriginal;
        }
      }
    });
  }

  /* ---- Botones GitHub ---- */
  document.querySelectorAll('.github-btn').forEach(function (btn) {
    var repo = (btn.getAttribute('data-repo') || '').trim();
    if (repo && repo !== '#' && repo !== '##') {
      btn.setAttribute('href', repo);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');
      btn.classList.remove('no-repo');
    } else {
      btn.removeAttribute('href');
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('no-repo');
      btn.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });

  /* ---- Menú hamburguesa ---- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var opened = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!opened));
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 760) {
          navToggle.setAttribute('aria-expanded', 'false');
          mainNav.classList.remove('open');
        }
      });
    });
  }

  /* ---- Barras de habilidad ---- */
  var skills = document.querySelectorAll('.skill');
  skills.forEach(function (s) {
    var pct = parseInt(s.getAttribute('data-percent'), 10) || 0;
    var label = s.querySelector('.skill-pct');
    if (label) label.textContent = pct + '%';
  });
  function fill(el) {
    var pct = parseInt(el.getAttribute('data-percent'), 10) || 0;
    var bar = el.querySelector('.bar i');
    if (bar) bar.style.width = pct + '%';
  }

  /* ---- Carrusel de certificados (crossfade + alto adaptable a la imagen) ---- */
  document.querySelectorAll('.cert-carousel').forEach(function (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll('.cert-slide'));
    if (!slides.length) return;
    var stage = car.querySelector('.cert-stage');
    var dotsWrap = car.querySelector('.cert-dots');
    var idx = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
    if (idx < 0) idx = 0;

    // Límites de alto para que ninguna imagen desborde ni se vea minúscula
    var MIN_H = 260, MAX_H = 620, PAD = 44; // PAD = padding vertical del slide (22px*2)

    // Calcula el alto que debe tener el contenedor para la imagen activa
    function heightFor(i) {
      var img = slides[i].querySelector('img');
      if (!img || slides[i].classList.contains('no-img') || !img.naturalWidth) return 420;
      var avail = (stage.clientWidth || car.clientWidth || 840) - PAD;
      var h = avail * (img.naturalHeight / img.naturalWidth) + PAD;
      return Math.max(MIN_H, Math.min(MAX_H, Math.round(h)));
    }
    function applyHeight() {
      if (stage) stage.style.height = heightFor(idx) + 'px';
    }
    // Recalcular cuando cada imagen termina de cargar (o al redimensionar)
    slides.forEach(function (s, i) {
      var img = s.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', function () { if (i === idx) applyHeight(); });
      }
    });
    var rz;
    window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(applyHeight, 150);
    });

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Certificado ' + (i + 1));
      b.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      applyHeight();
    }
    function go(i, manual) {
      idx = (i + slides.length) % slides.length;
      render();
      if (manual) restart();
    }

    var prev = car.querySelector('.cert-nav.prev');
    var next = car.querySelector('.cert-nav.next');
    if (prev) prev.addEventListener('click', function () { go(idx - 1, true); });
    if (next) next.addEventListener('click', function () { go(idx + 1, true); });
    render();

    var delay = parseInt(car.getAttribute('data-autoplay'), 10) || 4500;
    var timer = null;
    function start() { if (reduce || slides.length < 2) return; timer = setInterval(function () { go(idx + 1, false); }, delay); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    start();
  });

  /* ---- Reveal on scroll + activar barras ---- */
  var revealTargets = document.querySelectorAll(
    '.hero-copy, .hero-media, .about-left, .about-right, .card, .role, .exp-item, .skills-block, .languages, .cert-carousel, .contact-inner'
  );

  if (reduce || !('IntersectionObserver' in window)) {
    skills.forEach(fill);
    revealTargets.forEach(function (t) { t.classList.add('in'); });
  } else {
    revealTargets.forEach(function (t) { t.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        if (entry.target.classList.contains('skills-block')) {
          entry.target.querySelectorAll('.skill').forEach(fill);
        }
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (t) { io.observe(t); });
  }
})();
