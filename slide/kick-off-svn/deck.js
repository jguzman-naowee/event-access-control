(function () {
  var slides = [].slice.call(document.querySelectorAll('.dk-slide'));
  var stage = document.querySelector('.dk-stage');
  var counter = document.querySelector('[data-counter]');
  var prev = document.querySelector('[data-prev]');
  var next = document.querySelector('[data-next]');
  var i = 0;

  // Numeral de sección y pie de página: salen del contenido, no se escriben a mano en cada slide.
  slides.forEach(function (s, k) {
    var eb = s.querySelector('.dk-eyebrow');
    var m = eb && eb.textContent.match(/^\s*(\d{2})(?:\.\d+)?\s*·/);
    if (m) s.setAttribute('data-num', m[1]);
    [].forEach.call(s.querySelectorAll('.dk-table tr'), function (tr, n) { tr.style.setProperty('--dk-i', n); });
    if (k === 0) return;
    var f = document.createElement('footer');
    f.className = 'dk-foot';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = '<span class="dk-foot__brand">Sistema de Validación Nacional · Kick-off</span>' +
      '<span class="dk-foot__page"><b>' + String(k + 1).padStart(2, '0') + '</b> / ' + String(slides.length).padStart(2, '0') + '</span>';
    s.appendChild(f);
  });

  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  // El icon-button del SDK marca el estado en la raíz <span> y en el <button>.
  function habilitar(btn, on) {
    btn.disabled = !on;
    btn.parentNode.classList.toggle('nwt-icon-button--disabled', !on);
  }

  function ir(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.hidden = k !== i; });
    counter.textContent = (i + 1) + ' / ' + slides.length;
    habilitar(prev, i > 0);
    habilitar(next, i < slides.length - 1);
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }

  prev.addEventListener('click', function () { ir(i - 1); });
  next.addEventListener('click', function () { ir(i + 1); });
  document.querySelector('[data-fullscreen]').addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.target.closest('button'))) { ir(i + 1); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { ir(i - 1); e.preventDefault(); }
    else if (k === 'Home') ir(0);
    else if (k === 'End') ir(slides.length - 1);
  });

  window.addEventListener('resize', fit);
  fit();
  ir((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
