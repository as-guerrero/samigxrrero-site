/* shared: smooth scroll, stacking scroll, tap toggles, homepage background clip, back to top */
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // smooth, weighted scrolling with a mouse or trackpad (phones keep their own native scroll)
  var lenis = null;
  if (window.Lenis && !calm && matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    document.documentElement.classList.add('lenis');
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    // links to a spot on this page (like "worlds") glide there too
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#"]');
      if (!a || a.pathname !== location.pathname || a.host !== location.host) return;
      var el = a.hash && document.querySelector(a.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -(parseFloat(getComputedStyle(el).scrollMarginTop) || 0) });
      history.replaceState(null, '', a.hash);
    });
  }

  // stacking: each [data-stack] block sticks, and the next one slides up and lands on top of it,
  // while the covered one sinks back a little
  var stacks = [].slice.call(document.querySelectorAll('[data-stack]'));
  if (stacks.length) {
    var header = document.querySelector('.site-header');
    var tops = [];
    var place = function () {
      var hh = header ? header.offsetHeight : 0;
      tops = stacks.map(function (el) {
        // a block taller than the screen scrolls to its bottom edge before it sticks
        var t = Math.min(hh, innerHeight - el.offsetHeight);
        el.style.top = t + 'px';
        return t;
      });
      sink();
    };
    var ticking = false;
    var sink = function () {
      ticking = false;
      if (calm) return;
      stacks.forEach(function (el, i) {
        var next = el.nextElementSibling, p = 0;
        if (next) {
          var r = next.getBoundingClientRect(), stop = next.hasAttribute('data-stack') ? tops[i + 1] : 0;
          p = Math.max(0, Math.min(1, 1 - (r.top - stop) / Math.max(1, innerHeight - stop)));
        }
        el.style.transform = p ? 'scale(' + (1 - 0.06 * p).toFixed(4) + ')' : '';
        el.style.opacity = p ? (1 - 0.6 * p).toFixed(3) : '';
      });
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sink); } }, { passive: true });
    addEventListener('resize', place);
    addEventListener('load', place);
    place();
  }

  // things ease up into place the first time they come on screen
  var risers = document.querySelectorAll('.rise');
  if (risers.length && 'IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    risers.forEach(function (el) { el.classList.add('pre'); io.observe(el); });
  }

  // tap to switch (about photo). Mouse hover is handled in CSS.
  document.querySelectorAll('[data-tap]').forEach(function (el) {
    el.addEventListener('click', function () { el.classList.toggle('is-on'); });
  });

  // homepage background clip: phones only autoplay a muted, inline video, so set both
  // as live properties and start it ourselves. If the phone still blocks autoplay
  // (iPhone Low Power Mode), start it on the first tap. The poster shows until then.
  var bg = document.querySelector('.home-bg video');
  if (bg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bg.muted = true; bg.defaultMuted = true; bg.playsInline = true;
    var play = function () { var p = bg.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    bg.addEventListener('canplay', play, { once: true });
    var kick = function () {
      play();
      document.removeEventListener('touchstart', kick);
      document.removeEventListener('click', kick);
    };
    document.addEventListener('touchstart', kick, { passive: true });
    document.addEventListener('click', kick);
  }

  // back to top: appears after scrolling about two screens down
  var top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.textContent = '↑ back to top';
  top.addEventListener('click', function () { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);
  var onScroll = function () { top.classList.toggle('show', window.scrollY > innerHeight * 2); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
