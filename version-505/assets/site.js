(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    selectAll('[data-filter-area]').forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var year = area.querySelector('[data-year-filter]');
      var type = area.querySelector('[data-type-filter]');
      var cards = selectAll('[data-movie-card]', area.parentNode || document);
      if (!cards.length) {
        cards = selectAll('[data-movie-card]');
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type')
          ].join(' ').toLowerCase();
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            ok = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
        });
      }

      [input, year, type].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });
    });
  }

  function loadScript(src, done) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener('load', done);
      done();
      return;
    }
    var script = document.createElement('script');
    script.src = src;
    script.onload = done;
    document.head.appendChild(script);
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-play-button]');
    var config = document.getElementById('video-config');
    if (!video || !config) {
      return;
    }
    var mediaUrl = '';
    try {
      mediaUrl = JSON.parse(config.textContent).url || '';
    } catch (error) {
      mediaUrl = '';
    }
    if (!mediaUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attachAndPlay() {
      if (attached) {
        video.play().catch(function () {});
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hlsInstance) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      }
    }

    function start() {
      if (button) {
        button.classList.add('hidden');
      }
      if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
        attachAndPlay();
      } else {
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js', attachAndPlay);
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function () {
      button.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupBackTop();
  });
})();
