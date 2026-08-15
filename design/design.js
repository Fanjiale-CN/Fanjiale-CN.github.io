/* Design page: copy-hex swatches and the <260ms motion demo.
   Motion rules: opacity + transform only, <= 260ms, reduced-motion silent. */
(function () {
  'use strict';

  /* ---------- Swatch copy ---------- */
  var toast = null;
  function showToast(hex) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'design-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = 'Copied ' + hex;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1400);
  }

  document.querySelectorAll('.design-swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      var hex = sw.getAttribute('data-hex');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(function () { showToast(hex); });
      } else {
        showToast(hex);
      }
    });
  });

  /* ---------- Motion demo (dot press) ---------- */
  var demo = document.querySelector('.design-motion-demo');
  if (demo) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    demo.addEventListener('click', function () {
      if (reduced) return;
      if (demo.classList.contains('is-flying')) return;
      demo.classList.add('is-flying');
      setTimeout(function () {
        demo.classList.remove('is-flying');
      }, 900);
    });
  }
})();
