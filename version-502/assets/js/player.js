(function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var overlay = player.querySelector('.player-overlay');
  var button = player.querySelector('.player-action');
  var status = player.querySelector('.player-status');
  var source = video ? video.getAttribute('data-src') : '';
  var initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function nativeHlsSupported() {
    if (!video) {
      return false;
    }
    return Boolean(
      video.canPlayType('application/vnd.apple.mpegurl') ||
      video.canPlayType('application/x-mpegURL')
    );
  }

  function initializePlayer() {
    if (!video || !source) {
      setStatus('播放源未就绪');
      return;
    }

    if (initialized) {
      playVideo();
      return;
    }

    initialized = true;
    setStatus('正在加载播放源');

    if (nativeHlsSupported()) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放加载失败，请刷新页面后重试');
        }
      });
      window.currentHlsPlayer = hls;
      return;
    }

    setStatus('当前浏览器不支持 m3u8 播放');
  }

  function playVideo() {
    if (!video) {
      return;
    }

    var promise = video.play();
    if (promise && typeof promise.then === 'function') {
      promise.then(function () {
        hideOverlay();
        setStatus('');
      }).catch(function () {
        setStatus('点击播放按钮开始观看');
      });
    } else {
      hideOverlay();
      setStatus('');
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  if (button) {
    button.addEventListener('click', initializePlayer);
  }

  if (overlay) {
    overlay.addEventListener('click', initializePlayer);
  }

  if (video) {
    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
  }
})();
