// shop items, in order. img: cover image, or leave out for an empty frame until the art is ready.
var SHOP = [
  { kind: 'zine', name: 'in awe, of all.', price: '$15', img: 'img/zines/in-awe-of-all.webp' },
  { kind: 'zine', name: 'two.', price: '$15', img: 'img/zines/two.webp' },
  { kind: 'zine', name: 'sudo ./survive.sh', price: '$15', img: 'img/zines/sudo-survive.webp' },
  { kind: 'poster', name: 'poster one', price: '$25' },
  { kind: 'poster', name: 'poster two', price: '$25' },
  { kind: 'poster', name: 'poster three', price: '$25' },
  { kind: 'cd', name: 'cd one', price: '$12' },
  { kind: 'cd', name: 'cd two', price: '$12' }
];

(function () {
  var piece = document.querySelector('.piece'), count = document.querySelector('.piece-count'), i = 0;
  if (!piece) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function art(it) {
    if (it.img) return '<div class="item-art art-' + it.kind + '"><img src="' + esc(it.img) + '" alt="' + esc(it.name) + ' cover"></div>';
    if (it.kind === 'cd') return '<div class="item-art art-cd stand"><i class="disc"></i></div>';
    return '<div class="item-art art-poster stand"><span>poster art</span></div>';
  }
  function show(n) {
    i = (n + SHOP.length) % SHOP.length;
    var it = SHOP[i];
    var mail = 'mailto:hello@samigxrrero.com?subject=' + encodeURIComponent('Order: ' + it.name);
    piece.innerHTML = art(it) + '<div class="item-line"><span>' + esc(it.name) + '</span><span class="price">' + esc(it.price) + '</span></div><a class="btn" href="' + mail + '">order</a>';
    count.textContent = (i + 1) + ' / ' + SHOP.length;
    document.querySelectorAll('.kinds button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === it.kind); });
  }
  document.querySelector('.one .prev').addEventListener('click', function () { show(i - 1); });
  document.querySelector('.one .next').addEventListener('click', function () { show(i + 1); });
  document.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  var x0 = null;
  piece.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  piece.addEventListener('touchend', function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) show(d < 0 ? i + 1 : i - 1); x0 = null; });
  document.querySelectorAll('.kinds button').forEach(function (b) {
    b.addEventListener('click', function () { var j = SHOP.findIndex(function (t) { return t.kind === b.dataset.k; }); if (j >= 0) show(j); });
  });
  show(0);
})();
