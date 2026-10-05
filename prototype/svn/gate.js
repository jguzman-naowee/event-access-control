/* Gate: "¿Quién puede entrar al evento hoy?", por rol o por aplicación. Mismo patrón que uaesp-rutas-alta. */
window.PANTALLAS = window.PANTALLAS || {};
window.PANTALLAS.gate = function (raiz, ctx) {
  var D = ctx.D;
  var modo = 'app';
  try { modo = sessionStorage.getItem('svn.gate') || 'app'; } catch (e) { /* sin almacenamiento */ }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rol(id) { return D.roles.filter(function (r) { return r.id === id; })[0]; }
  function iconoDisp(disp) {
    // Los embebibles viven en el canal de la comercializadora, que el hincha usa en el celular.
    if (/celular|móvil|canal/i.test(disp)) { return 'smartphone'; }
    if (disp.toLowerCase().includes('tablet')) { return 'tablet'; }
    return 'laptop';
  }
  function iconoRol(rolId) {
    var mapa = { operador: 'qr-code', policia: 'padlock-close', ivc: 'file', supervisor: 'view-grid', club: 'official-stores', mindeporte: 'official-stores', organizador: 'calendar', comercializadora: 'link', persona: 'user', soporte: 'helper' };
    return mapa[rolId] || 'user';
  }

  function cardRol(r, i) {
    return '<nwt-card clickable class="sv-card sv-revela" style="--sv-retraso:' + (120 + i * 50) + 'ms" data-rol="' + r.id + '" role="button" tabindex="0" aria-label="Entrar como ' + esc(r.rol) + '">' +
      '<nwt-avatar nwt-color="' + r.color + '" nwt-size="large">' + r.ini + '</nwt-avatar>' +
      '<span class="nwt-body-font-bold">' + esc(r.rol) + '</span>' +
      '<p class="nwt-smalltext-font-regular sv-card__desc">' + esc(r.desc) + '</p>' +
      '</nwt-card>';
  }

  function chipRol(r, i) {
    var icono = iconoRol(r.id);
    return '<div class="sv-chip sv-chip--badge sv-revela" style="--sv-retraso:' + (120 + i * 40) + 'ms" data-rol="' + r.id + '" role="button" tabindex="0">' +
      '<nwt-icon value="' + icono + '" style="flex:none;font-size:14px;--naotech-icon-dimension:14px"></nwt-icon>' +
      '<span>' + esc(r.rol) + '</span></div>';
  }

  // Numeración visible: el paso del flujo; los chips de abajo siguen después del último paso, en su orden.
  var chipsApp = D.apps.filter(function (a) { return !a.ruta; });
  var ultimoPaso = Math.max.apply(null, D.apps.map(function (a) { return a.paso || 0; }));
  function numGate(a) { return a.paso || ultimoPaso + chipsApp.indexOf(a) + 1; }

  function cardApp(a, i) {
    var quienes = a.roles.map(function (id) { return rol(id).rol; }).join(' · ');
    var diseno = a.enDiseno ? ' sv-card--diseno' : '';
    return '<nwt-card clickable class="sv-card sv-card--app' + diseno + ' sv-revela" style="--sv-retraso:' + (120 + i * 40) + 'ms" data-app="' + a.id + '" role="button" tabindex="0" aria-label="Abrir ' + esc(a.nombre) + '">' +
      '<span class="sv-card__num">' + numGate(a) + '</span>' +
      (a.enDiseno ? '<span class="sv-card__prox">En diseño</span>' : '') +
      '<nwt-icon class="sv-card__icono" value="' + a.icono + '"></nwt-icon>' +
      '<span class="nwt-body-font-bold">' + esc(a.nombre) + '</span>' +
      '<p class="nwt-smalltext-font-regular sv-card__desc">' + esc(a.disp) + '</p>' +
      '<p class="nwt-smalltext-font-regular sv-card__roles">' + esc(quienes) + '</p>' +
      '</nwt-card>';
  }

  function chipApp(a, i) {
    var icono = iconoDisp(a.disp);
    return '<div class="sv-chip sv-chip--badge sv-revela" style="--sv-retraso:' + (120 + i * 40) + 'ms" data-app="' + a.id + '" role="button" tabindex="0">' +
      '<span class="sv-chip__num">' + numGate(a) + '</span>' +
      '<nwt-icon value="' + icono + '" style="flex:none;font-size:14px;--naotech-icon-dimension:14px"></nwt-icon>' +
      '<span>' + esc(a.nombre) + '</span></div>';
  }

  function contenido() {
    if (modo === 'rol') {
      var rolesConRuta = D.roles.filter(function (r) { return r.ruta; });
      var rolesSinRuta = D.roles.filter(function (r) { return !r.ruta; });
      var html = '<div class="sv-gate__fila">' + rolesConRuta.map(cardRol).join('') + '</div>';
      if (rolesSinRuta.length > 0) {
        html += '<div class="sv-gate__proximamente">' +
          '<div class="sv-gate__fila sv-gate__fila--chips">' + rolesSinRuta.map(chipRol).join('') + '</div></div>';
      }
      return html;
    }
    var appsConRuta = D.apps.filter(function (a) { return a.ruta; }).sort(function (a, b) { return (a.paso || 99) - (b.paso || 99); });
    var appsSinRuta = D.apps.filter(function (a) { return !a.ruta; });
    var html = '<div class="sv-gate__fila sv-gate__fila--apps">' + appsConRuta.map(cardApp).join('') + '</div>';
    if (appsSinRuta.length > 0) {
      html += '<div class="sv-gate__proximamente">' +
        '<div class="sv-gate__fila sv-gate__fila--chips">' + appsSinRuta.map(chipApp).join('') + '</div></div>';
    }
    return html;
  }

  raiz.innerHTML =
    '<div class="sv-gate">' +
      '<div class="sv-gate__top">' +
        '<div class="sv-gate__tenant"><img class="sv-gate__escudo" src="assets/mindeporte.svg" alt="Logo del ' + esc(D.entidad.nombre) + '"></div>' +
        '<nwt-logo-naowee class="sv-gate__logo"></nwt-logo-naowee>' +
        '<div></div>' +
      '</div>' +
      '<div class="sv-gate__cab sv-revela">' +
        '<p class="sv-gate__eyebrow">' + esc(D.entidad.sistema) + '</p>' +
        '<h1 class="sv-gate__titulo">¿Quién puede entrar al evento hoy?</h1>' +
        '<nwt-tabs id="gate-modo" class="sv-gate__modo"></nwt-tabs>' +
      '</div>' +
      '<div class="sv-gate__cuerpo" id="gate-cuerpo">' + contenido() + '</div>' +
      '<div class="sv-gate__pie sv-revela" style="--sv-retraso:520ms">' +
        '<span class="nwt-smalltext-font-semibold">' + esc(D.entidad.nombre) + ' · ' + esc(D.entidad.sistema) + '</span>' +
        '<span class="nwt-smalltext-font-regular">Prototipo de demostración · datos ficticios · sesión ficticia</span>' +
      '</div>' +
    '</div>';

  var tabs = raiz.querySelector('#gate-modo');
  // Por aplicación va primero y abre por defecto (DC-141).
  tabs.items = [
    { id: 'app', label: 'Por aplicación', value: 'app' },
    { id: 'rol', label: 'Por rol', value: 'rol' }
  ];
  tabs.value = modo;

  function revelar() {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      raiz.querySelectorAll('.sv-revela').forEach(function (el) { el.classList.add('sv-revela--in'); });
    }); });
  }
  revelar();

  tabs.addEventListener('nwtChange', function (e) {
    modo = e.detail;
    try { sessionStorage.setItem('svn.gate', modo); } catch (err) { /* sin almacenamiento */ }
    raiz.querySelector('#gate-cuerpo').innerHTML = contenido();
    revelar();
  });

  // Zoom "a la Netflix": un clon de la card crece hasta cubrir la pantalla y ahí se navega.
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var enZoom = false;
  // `entrar` lo decide quien llama: por rol usa la ruta del rol; por aplicación, la de la app.
  function zoom(card, rotulo, conRuta, entrar) {
    if (reducido || !conRuta) { entrar(); return; }
    enZoom = true;
    var b = card.getBoundingClientRect();
    var clon = document.createElement('div');
    clon.className = 'sv-zoom';
    clon.style.cssText = 'left:' + b.left + 'px;top:' + b.top + 'px;width:' + b.width + 'px;height:' + b.height + 'px';
    clon.innerHTML = '<span class="sv-zoom__rotulo">' + esc(rotulo) + '</span>';
    document.body.appendChild(clon);
    void clon.offsetWidth;
    requestAnimationFrame(function () {
      clon.style.cssText = 'left:0;top:0;width:100vw;height:100vh;border-radius:0';
      clon.classList.add('sv-zoom--crece');
    });
    setTimeout(function () {
      entrar();
      requestAnimationFrame(function () { clon.classList.add('sv-zoom--fuera'); });
      setTimeout(function () { clon.remove(); }, 300);
    }, 900);
  }

  function elegir(ev) {
    var card = ev.target.closest('[data-rol],[data-app]');
    if (!card || enZoom) { return; }
    if (card.hasAttribute('data-app')) {
      var a = D.apps.filter(function (x) { return x.id === card.getAttribute('data-app'); })[0];
      zoom(card, rol(a.roles[0]).rol, !!a.ruta && !a.enDiseno, function () { ctx.entrarApp(a.id); });
      return;
    }
    var r = rol(card.getAttribute('data-rol'));
    zoom(card, r.rol, !!r.ruta, function () { ctx.entrar(r.id); });
  }
  function tecla(ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-rol],[data-app]')) { ev.preventDefault(); elegir(ev); }
  }
  raiz.addEventListener('click', elegir);
  raiz.addEventListener('keydown', tecla);
  return function () { raiz.removeEventListener('click', elegir); raiz.removeEventListener('keydown', tecla); };
};
