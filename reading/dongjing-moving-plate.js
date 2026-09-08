(() => {
  const plate = document.querySelector('[data-dj-room-film]');
  if (!plate) return;

  const video = plate.querySelector('video');
  if (!video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;

  const setReady = () => plate.classList.add('is-video-ready');
  const setFallback = () => plate.classList.remove('is-video-ready');

  const syncPlayback = () => {
    if (reduceMotion.matches || document.hidden || !inView) {
      video.pause();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(setFallback);
    }
  };

  if (video.readyState >= 2) setReady();
  video.addEventListener('loadeddata', setReady, { once: true });
  video.addEventListener('canplay', setReady, { once: true });
  video.addEventListener('error', setFallback);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      syncPlayback();
    }, { threshold: 0.08 });
    observer.observe(plate);
  }

  document.addEventListener('visibilitychange', syncPlayback);

  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', syncPlayback);
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(syncPlayback);
  }

  syncPlayback();
})();
