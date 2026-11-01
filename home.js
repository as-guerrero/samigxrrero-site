/* homepage: arrows (or a swipe, or the arrow keys) switch between the three videos */
(function () {
  var stage = document.querySelector('.stage');
  if (!stage) return;
  var slides = [].slice.call(stage.querySelectorAll('.slide'));
  var sets = [].slice.call(document.querySelectorAll('.goods-set'));
  var cur = 0;

  function show(n, dir) {
    n = (n + slides.length) % slides.length;
    if (n === cur) return;
    stage.dataset.dir = dir;
    slides.forEach(function (s, i) {
      var on = i === n;
      s.classList.toggle('is-active', on);
      s.classList.toggle('was-active', i === cur);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      s.dispatchEvent(new CustomEvent('covered', { detail: !on }));
    });
    sets.forEach(function (g, i) { g.hidden = i !== n; g.classList.toggle('is-active', i === n); });
    cur = n;
  }

  // only the first video plays to start with
  slides.forEach(function (s, i) { s.dispatchEvent(new CustomEvent('covered', { detail: i !== 0 })); });

  stage.querySelector('.prev').addEventListener('click', function () { show(cur - 1, 'back'); });
  stage.querySelector('.next').addEventListener('click', function () { show(cur + 1, 'fwd'); });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') show(cur - 1, 'back');
    if (e.key === 'ArrowRight') show(cur + 1, 'fwd');
  });

  // swipe left or right on phones
  var x0 = null, y0 = 0;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 'fwd' : 'back');
  }, { passive: true });
})();
