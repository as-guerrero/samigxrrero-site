/* shared: tap toggles for phones + the "commissions and collabs" popup */
(function () {
  // tap to switch (about photo, homepage mirror). Mouse hover is handled in CSS.
  document.querySelectorAll('[data-tap]').forEach(function (el) {
    el.addEventListener('click', function () { el.classList.toggle('is-on'); });
  });

  // back to top: appears after scrolling about two screens down
  var top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.textContent = '↑ back to top';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);
  var onScroll = function () { top.classList.toggle('show', window.scrollY > innerHeight * 2); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // commissions popup
  var IG = 'https://ig.me/m/samigxrrero', MAIL = 'samigxrrero@outlook.com';
  var PACKAGES = {
    "photo": [
      [
        "basic",
        "portrait session",
        "1 hour, 1 location, 20 photos (10 edited + 10 raw), 5 vertical crops for stories, delivered as RAW and JPG",
        "$200"
      ],
      [
        "standard",
        "artist / press shoot",
        "3 hours, up to 3 looks, 25 edited photos plus every other photo from the shoot as raws, 5 detailed retouches, social crops, black and white versions of your top 10, a short behind-the-scenes clip, delivered as RAW and JPG",
        "$450"
      ],
      [
        "premium",
        "campaign shoot",
        "half day, moodboard and creative direction, 75 edited photos plus every other photo from the shoot as raws, 10 detailed retouches, use in ads and merch, 5 short motion clips from the same set, delivered as RAW and JPG",
        "from $1,000"
      ]
    ],
    "video": [
      [
        "basic",
        "video edit",
        "up to 3 minutes, cut, color and sound, vertical version, a 15-second and a 30-second teaser, 2 rounds of changes",
        "from $100"
      ],
      [
        "standard",
        "music video",
        "concept, 1 shoot day, edit and color grade, vertical cut, 3 teaser clips, 10 stills taken from the footage",
        "from $1,000"
      ],
      [
        "premium",
        "short film",
        "treatment, multi-day shoot, edit, color, sound design and mix, trailer, poster made from a frame of the film, subtitle file",
        "from $3,000"
      ]
    ],
    "music": [
      [
        "basic",
        "mastering",
        "streaming-ready master plus an instrumental master, 2 rounds of changes",
        "$70 / song"
      ],
      [
        "standard",
        "mix + master",
        "mix and master, instrumental, acapella and clean versions, stems, 2 rounds of changes",
        "$200 / song"
      ],
      [
        "premium",
        "release pack",
        "for a single, EP or album: mixes and masters of every version, cover art with a Spotify Canvas loop, a 15-second visualizer and 3 snippets for social",
        "from $500"
      ]
    ],
    "design": [
      [
        "basic",
        "flyer",
        "a version for posts, a version for stories, and a high-resolution version for print, 2 rounds of changes, ready in about 2 days",
        "$70"
      ],
      [
        "standard",
        "album art",
        "3000 × 3000 cover, social versions, Spotify Canvas loop, mockups (vinyl and phone), 2 rounds of changes",
        "$70 single · $150 EP / album"
      ],
      [
        "premium",
        "logo + branding",
        "3 concepts, full logo, icon and black-and-white versions, profile picture and banner for social, 3-page brand guide",
        "$350"
      ]
    ]
  };
  var EXTRA = {
    "music": "also available: sound design and music editing for film, from $150",
    "design": "also available: UI design for websites and apps, from $1,200"
  };
  var TERMS = {
    "photo": "50% deposit to book · extra shoot time $75 an hour · photos delivered in 5 days · rush +25%",
    "video": "50% deposit to book · extra shoot time $75 an hour · edits and music videos delivered in 1 week · short films take 1 to 3 months depending on length · rush +25%",
    "music": "50% deposit to book · extra rounds of changes are paid · delivered in 5 days, release packs in 1 week · rush +25%",
    "design": "50% deposit to book · extra rounds of changes are paid · flyers in about 2 days, everything else in 2 weeks · rush +25%"
  };

  var links = document.querySelectorAll('.site-footer a[href="contact.html"], [data-hire]');
  if (!links.length || !window.HTMLDialogElement) return;

  var d = document.createElement('dialog');
  d.className = 'where hire';
  d.setAttribute('aria-labelledby', 'hire-title');
  d.innerHTML =
    '<div class="hire-step" data-step="pick">' +
      '<p class="hire-q" id="hire-title">what can i help you with?</p>' +
      '<p class="fdn-line hire-sub">pick a service to see the packages</p>' +
      '<div class="hire-picks">' +
        Object.keys(PACKAGES).map(function (k) { return '<button class="btn" type="button" data-kind="' + k + '">' + k + '</button>'; }).join('') +
      '</div>' +
    '</div>' +
    '<div class="hire-step" data-step="detail" hidden>' +
      '<p class="label hire-kind"></p>' +
      '<ul class="hire-packages"></ul>' +
      '<p class="hire-extra"></p>' +
      '<p class="hire-terms"></p>' +
      '<p class="fdn-line">book now</p>' +
      '<div class="where-links">' +
        '<a class="btn hire-mail" href="#">email</a>' +
        '<a class="btn" href="' + IG + '" target="_blank" rel="noopener">instagram dm</a>' +
      '</div>' +
      '<p class="hire-budget">questions about your project, or working with a budget? email or dm me before booking and we’ll figure out what you need.</p>' +
      '<button class="close hire-back" type="button">← back</button>' +
    '</div>' +
    '<form method="dialog"><button class="close" type="submit">close</button></form>';
  document.body.appendChild(d);

  var pick = d.querySelector('[data-step="pick"]'), detail = d.querySelector('[data-step="detail"]');
  function showPick() { detail.hidden = true; pick.hidden = false; }
  function showDetail(kind) {
    d.querySelector('.hire-kind').textContent = kind;
    d.querySelector('.hire-packages').innerHTML = PACKAGES[kind].map(function (p) {
      return '<li><span class="hire-tier">' + p[0] + '</span><span class="hire-name">' + p[1] + '</span><span class="hire-what">' + p[2] + '</span><span class="hire-price">' + p[3] + '</span></li>';
    }).join('');
    d.querySelector('.hire-extra').textContent = EXTRA[kind] || '';
    d.querySelector('.hire-extra').hidden = !EXTRA[kind];
    d.querySelector('.hire-terms').textContent = TERMS[kind];
    d.querySelector('.hire-mail').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(kind + ' commission');
    pick.hidden = true; detail.hidden = false;
  }

  d.querySelectorAll('[data-kind]').forEach(function (b) {
    b.addEventListener('click', function () { showDetail(b.dataset.kind); });
  });
  d.querySelector('.hire-back').addEventListener('click', showPick);
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  d.addEventListener('close', showPick);
  links.forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); d.showModal(); });
  });
})();
