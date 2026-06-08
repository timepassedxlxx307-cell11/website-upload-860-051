(function () {
    function setupPlayer(root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play]');
        var url = video ? video.getAttribute('data-video') : '';
        var hls = null;
        var ready = false;

        if (!video || !button || !url) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            ready = true;
        }

        function play() {
            attach();
            video.controls = true;
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
