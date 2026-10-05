/* Splash de entrada al app y flash de captura, sobre la pantalla del equipo (DC-156). Lo comparten las cuatro vistas. */
(function () {
  'use strict';
  var activos = [];
  var quieto = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  // Cada render del equipo rehace el DOM: ver() vuelve a colgar lo que siga vivo, con la animación en su punto exacto.
  function iniciar(tipo, dur, nombre, marca) {
    var a = { tipo: tipo, ini: Date.now(), fin: Date.now() + dur, nombre: nombre, marca: marca };
    activos.push(a);
    setTimeout(function () { activos = activos.filter(function (x) { return x !== a; }); document.querySelectorAll('.pp-splash-' + tipo).forEach(function (n) { n.remove(); }); }, dur);
  }
  // marca opcional: 'grader' viste el splash con la identidad de la comercializadora (DC-216); sin ella, Naowee.
  var LOGO_GRADER = '<span class="pc-logo"><span class="pc-logo__m"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 16h16V2h-4v4H9v4H5v4H1z" fill="#FFCC1A"/></svg></span>graderío</span>';
  function app(nombre, marca) { iniciar('app', quieto() ? 900 : 1500, nombre, marca); }
  function flash() { if (!quieto()) { iniciar('flash', 420); } }

  // Barras de ancho irregular, fijas: se ven dos capas iguales y la de arriba se descubre de izquierda a derecha.
  var BARRAS = [3, 1, 2, 1, 4, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 1, 4, 2, 1, 3, 2, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 2, 1, 4];
  function codigo() {
    var x = 0, r = '';
    BARRAS.forEach(function (w, i) { if (i % 2 === 0) { r += '<rect x="' + x + '" y="0" width="' + w + '" height="40"/>'; } x += w; });
    var svg = function (c) { return '<svg class="' + c + '" viewBox="0 0 ' + x + ' 40" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">' + r + '</svg>'; };
    return '<span class="pp-splash__codigo">' + svg('pp-splash__base') + svg('pp-splash__lleno') + '</span>';
  }

  function ver(disp) {
    var pan = disp && disp.querySelector('.pp-pantalla');
    if (!pan) { return; }
    activos.forEach(function (a) {
      if (pan.querySelector('.pp-splash-' + a.tipo)) { return; }
      var d = document.createElement('div');
      d.className = 'pp-splash pp-splash-' + a.tipo + (a.marca === 'grader' ? ' pp-splash--grader' : '');
      d.style.animationDelay = '-' + (Date.now() - a.ini) + 'ms';
      d.setAttribute('aria-hidden', 'true');
      // Naowee queda pequeño abajo y el lugar grande es del Deporte arriba a 32 px e IVC junto al código (DC-348, DC-369).
      if (a.tipo === 'app') { d.innerHTML = (a.marca === 'grader' ? '<span class="pp-splash__logo">' + LOGO_GRADER + '</span>' : '<span style="position:absolute;top:32px;left:50%;transform:translateX(-50%);display:block">' + window.NAOWEE.mindeporteSolo(72) + '</span>' + window.NAOWEE.chipIvc(32)) + codigo() + '<span class="pp-splash__n">' + a.nombre + '</span>' + (a.marca === 'grader' ? '' : '<span class="pp-splash__naowee">' + window.NAOWEE.logo + '</span>'); }
      pan.appendChild(d);
    });
  }

  window.SPLASH = { app: app, flash: flash, ver: ver };
})();
