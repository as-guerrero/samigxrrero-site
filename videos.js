/* video cards: loop a short muted clip while on screen, tap to play the full video */
(function () {
  var cards = document.querySelectorAll('.vid[data-id]');
  if (!cards.length) return;
  var ready = new Promise(function (r) { window.onYouTubeIframeAPIReady = r; });
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  cards.forEach(function (card) {
    var id = card.dataset.id, frame = card.querySelector('.frame');
    var preview = null, timer = null, full = false, want = false;

    function start() {
      want = true;
      if (full || calm) return;
      // already made: just rewind to the clip and keep looping
      if (preview) {
        if (preview.seekTo) { preview.seekTo(+card.dataset.start || 0, true); preview.playVideo(); }
        return;
      }
      ready.then(function () {
        if (full || preview) return;
        var host = document.createElement('div');
        host.className = 'loop';
        frame.appendChild(host);
        preview = new YT.Player(host, {
          videoId: id,
          playerVars: { autoplay: 1, mute: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0, iv_load_policy: 3, fs: 0, modestbranding: 1 },
          events: {
            onReady: function (e) {
              var p = e.target, s = +card.dataset.start || 0, end = +card.dataset.end || s + 6;
              p.mute(); p.seekTo(s, true);
              if (want) p.playVideo(); else p.pauseVideo();
              timer = setInterval(function () {
                if (!want) return;
                var t = p.getCurrentTime();
                if (t >= end || t < s - 1) p.seekTo(s, true);
              }, 150);
            },
            onStateChange: function (e) {
              if (e.data === 1) card.classList.add('looping');
              // if the clip ever stops (ended or paused by the browser) while on screen, start it again
              if ((e.data === 0 || e.data === 2) && want) { e.target.seekTo(+card.dataset.start || 0, true); e.target.playVideo(); }
            }
          }
        });
      });
    }
    function stop() {
      want = false;
      if (full || !preview || !preview.pauseVideo) return;
      preview.pauseVideo();
    }
    function play() {
      full = true;
      clearInterval(timer);
      if (preview) { preview.destroy(); preview = null; }
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&playsinline=1&enablejsapi=1" title="' + card.querySelector('.vid-meta span').textContent +
        '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      card.classList.add('playing');
    }

    // loop the chosen clip on its own whenever the video is on screen, like the homepage;
    // stop it once it scrolls away so the page stays light on phones
    if ('IntersectionObserver' in window) {
      var seen = false, covered = false;
      var sync = function () { if (seen && !covered) start(); else stop(); };
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen = en.isIntersecting; sync(); });
      }, { rootMargin: '200px 0px', threshold: 0 }).observe(card);
      // on the homepage only the video showing between the arrows plays; the hidden ones rest
      var layer = card.closest('.slide');
      if (layer) layer.addEventListener('covered', function (e) {
        covered = e.detail; sync();
        // a full video playing with sound pauses when you arrow away from it
        var f = covered && full && frame.querySelector('iframe');
        if (f) f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });
    } else {
      start();
    }
    card.querySelector('.play').addEventListener('click', play);
  });
})();
