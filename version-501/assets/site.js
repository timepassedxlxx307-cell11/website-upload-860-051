function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}
function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const panel = document.getElementById('mobilePanel');
  if (!button || !panel) {
    return;
  }
  button.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
}
function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }
  const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === index);
    });
  };
  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5600);
  };
  prev?.addEventListener('click', () => {
    show(index - 1);
    start();
  });
  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.carouselDot));
      start();
    });
  });
  show(0);
  start();
}
function normalize(value) {
  return String(value || '').trim().toLowerCase();
}
function initFilters() {
  const scope = document.querySelector('[data-filter-scope]');
  if (!scope) {
    return;
  }
  const keyword = scope.querySelector('#movieSearch');
  const region = scope.querySelector('#regionFilter');
  const type = scope.querySelector('#typeFilter');
  const year = scope.querySelector('#yearFilter');
  const cards = Array.from(scope.querySelectorAll('.movie-card'));
  const empty = scope.querySelector('.empty-state');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (keyword && query) {
    keyword.value = query;
  }
  const apply = () => {
    const q = normalize(keyword?.value);
    const r = normalize(region?.value);
    const t = normalize(type?.value);
    const y = normalize(year?.value);
    let visible = 0;
    cards.forEach((card) => {
      const haystack = normalize(`${card.dataset.title} ${card.dataset.tags} ${card.textContent}`);
      const ok = (!q || haystack.includes(q))
        && (!r || normalize(card.dataset.region) === r)
        && (!t || normalize(card.dataset.type) === t)
        && (!y || normalize(card.dataset.year) === y);
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  };
  [keyword, region, type, year].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });
  apply();
}
function initMoviePlayer(videoId, overlayId, source) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video || !overlay || !source) {
    return;
  }
  let hls = null;
  let loaded = false;
  const reveal = () => overlay.classList.add('is-hidden');
  const restore = () => {
    if (video.paused) {
      overlay.classList.remove('is-hidden');
    }
  };
  const begin = () => {
    reveal();
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!loaded) {
        video.src = source;
        loaded = true;
      }
      video.play().catch(restore);
      return;
    }
    const Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
      if (!hls) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(restore);
        });
      } else {
        video.play().catch(restore);
      }
      return;
    }
    if (!loaded) {
      video.src = source;
      loaded = true;
    }
    video.play().catch(restore);
  };
  overlay.addEventListener('click', begin);
  video.addEventListener('click', () => {
    if (video.paused) {
      begin();
    }
  });
  video.addEventListener('play', reveal);
  video.addEventListener('pause', restore);
  video.addEventListener('ended', restore);
}
window.initMoviePlayer = initMoviePlayer;
onReady(() => {
  initMenu();
  initCarousel();
  initFilters();
});
