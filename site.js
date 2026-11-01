/* shared: smooth scroll, stacking scroll, tap toggles, homepage background clip, back to top */
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    var last = [];
    var sink = function () {
      ticking = false;
      stacks.forEach(function (el, i) {
        var next = el.nextElementSibling, p = 0;
        if (next) {
          var r = next.getBoundingClientRect(), stop = next.hasAttribute('data-stack') ? tops[i + 1] : 0;
          p = Math.max(0, Math.min(1, 1 - (r.top - stop) / Math.max(1, innerHeight - stop)));
        }
        p = Math.round(p * 50) / 50;
        if (p === last[i]) return;
        // tell the videos inside when this layer is fully covered, so they can rest
        if ((p >= 1) !== (last[i] >= 1)) el.dispatchEvent(new CustomEvent('covered', { detail: p >= 1 }));
        last[i] = p;
        if (calm) return;
        // only transform here (cheap for the browser); the dimming is a plain overlay
        el.style.transform = p ? 'scale(' + (1 - 0.05 * p).toFixed(3) + ')' : '';
        el.style.setProperty('--dim', (0.6 * p).toFixed(2));
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
    // rest the clip while the worlds cover it
    var intro = bg.closest('[data-stack]');
    if (intro) intro.addEventListener('covered', function (e) { if (e.detail) bg.pause(); else play(); });
  }

  // back to top: appears after scrolling about two screens down
  var top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.textContent = '↑ back to top';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);
  var onScroll = function () { top.classList.toggle('show', window.scrollY > innerHeight * 2); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
