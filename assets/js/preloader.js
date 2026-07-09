/**
 * Preloader — shown once on first load of index.html.
 * Waits for the page to finish loading, but is clamped between
 * MIN_MS (so it never feels like a flicker) and MAX_MS (so a slow
 * connection never leaves the visitor staring at it too long).
 */
(function () {
  const MIN_MS = 800;
  const MAX_MS = 2500;

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const startTime = Date.now();
  let released = false;

  function release() {
    if (released) return;
    released = true;

    document.body.classList.remove('is-loading');
    preloader.classList.add('is-hidden');

    // Remove from DOM after the fade-out transition finishes.
    preloader.addEventListener('transitionend', function handler(e) {
      if (e.target === preloader) {
        preloader.remove();
        preloader.removeEventListener('transitionend', handler);
      }
    });
    // Fallback in case transitionend doesn't fire (e.g. reduced motion).
    setTimeout(() => preloader.remove(), 700);
  }

  function releaseWithMinimumDelay() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_MS - elapsed);
    setTimeout(release, remaining);
  }

  // Whichever comes first: the page finishing its load, or the hard cap.
  window.addEventListener('load', releaseWithMinimumDelay, { once: true });
  setTimeout(release, MAX_MS);
})();
