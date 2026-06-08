(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('.site-search');
    var list = scope.querySelector('.searchable-list');
    var cards = list ? Array.prototype.slice.call(list.children) : [];
    var empty = scope.querySelector('[data-empty-state]');
    var activeChip = scope.querySelector('.filter-chip.active');
    var keyword = normalize(input ? input.value : '');
    var filter = activeChip ? activeChip.getAttribute('data-filter') : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search') || card.textContent);
      var cardType = normalize(card.getAttribute('data-type'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var filterText = normalize(filter);
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesFilter = filter === 'all' || haystack.indexOf(filterText) !== -1 || cardType === filterText || cardRegion === filterText || cardYear === filterText;
      var matches = matchesKeyword && matchesFilter;

      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  document.querySelectorAll('main').forEach(function (scope) {
    var input = scope.querySelector('.site-search');
    var clear = scope.querySelector('[data-clear-search]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('.filter-chip'));

    if (input) {
      input.addEventListener('input', function () {
        applyFilters(scope);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        applyFilters(scope);
        input.focus();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        applyFilters(scope);
      });
    });

    if (input || chips.length) {
      applyFilters(scope);
    }
  });
})();
