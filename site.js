/* shared: tap toggles, homepage background clip, back to top */
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);
  var onScroll = function () { top.classList.toggle('show', window.scrollY > innerHeight * 2); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
