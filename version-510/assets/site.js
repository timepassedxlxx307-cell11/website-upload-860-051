(function () {
  function rootPrefix() {
    var depth = Number(document.body.getAttribute('data-depth') || '0');
    if (!depth) {
      return './';
    }
    return '../'.repeat(depth);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!cards.length || (!input && !yearSelect && !typeSelect)) {
      return;
    }
    function apply() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var yearMatch = !year || card.getAttribute('data-year') === year;
        var typeMatch = !type || card.getAttribute('data-type') === type;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = yearMatch && typeMatch && keywordMatch ? '' : 'none';
      });
    }
    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initGlobalSearch() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    var data = window.movieSearchIndex || [];
    if (!blocks.length || !data.length) {
      return;
    }
    blocks.forEach(function (block) {
      var form = block.querySelector('form');
      var input = block.querySelector('[data-search-input]');
      var results = block.querySelector('[data-search-results]');
      if (!form || !input || !results) {
        return;
      }
      function render() {
        var keyword = normalize(input.value);
        results.innerHTML = '';
        if (!keyword) {
          return;
        }
        var root = rootPrefix();
        var matches = data.filter(function (item) {
          var text = normalize([
            item.title,
            item.year,
            item.type,
            item.region,
            item.genre,
            (item.tags || []).join(' '),
            item.summary
          ].join(' '));
          return text.indexOf(keyword) !== -1;
        }).slice(0, 12);
        if (!matches.length) {
          results.innerHTML = '<p class="search-empty">暂无匹配影片</p>';
          return;
        }
        results.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + root + item.url + '">' +
            '<img src="' + root + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
            '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
            '</a>';
        }).join('');
      }
      input.addEventListener('input', render);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initLocalFilter();
    initGlobalSearch();
  });
})();
