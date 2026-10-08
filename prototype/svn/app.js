/* Arranque: sesión ficticia por rol, router por hash y avisos de "próximamente". */
(function () {
  var D = window.SVN_DATOS;
  var raiz = document.getElementById('app');
  var limpiar = null;

  var RUTAS = {
    '#/': { pantalla: 'gate', tema: 'light' },
    '#/puerta': { pantalla: 'puerta', tema: 'light', rol: 'operador' },
    '#/policia': { pantalla: 'policia', tema: 'light', rol: 'policia' },
    '#/auditoria': { pantalla: 'auditoria', tema: 'light', rol: 'policia' },
    '#/backoffice': { pantalla: 'backoffice', tema: 'light', rol: 'organizador' },
    '#/compra': { pantalla: 'compra', tema: 'light', rol: 'persona' },
    '#/portal': { pantalla: 'portal', tema: 'light', rol: 'persona' },
    '#/soporte': { pantalla: 'soporte', tema: 'light', rol: 'soporte' },
    '#/entidades': { pantalla: 'entidades', tema: 'light', rol: 'club' },
    '#/integracion': { pantalla: 'integracion', tema: 'light', rol: 'comercializadora' }
  };

  function guardar(rol) {
    try { rol ? sessionStorage.setItem('svn.rol', rol) : sessionStorage.removeItem('svn.rol'); } catch (e) { /* almacenamiento bloqueado */ }
  }

  function leer() {
    try { return sessionStorage.getItem('svn.rol'); } catch (e) { return null; }
  }

  // Una ruta sin # sale del SVN hacia otra página del sitio (el demo del IVC en ivc/).
  function ir(hash) {
    if (hash.charAt(0) !== '#') { location.href = hash; } else if (location.hash === hash) { pintar(); } else { location.hash = hash; }
  }

  function aviso(titulo, mensaje) {
    var t = document.getElementById('aviso');
    t.heading = titulo;
    t.message = mensaje;
    t.visible = true;
    clearTimeout(aviso._t);
    aviso._t = setTimeout(function () { t.visible = false; }, 3200);
  }

  function pintar() {
    var ruta = RUTAS[location.hash || '#/'] || RUTAS['#/'];
    if (limpiar) { limpiar(); limpiar = null; }
    document.getElementById('aviso').visible = false;
    document.body.setAttribute('app-theme', ruta.tema);
    raiz.innerHTML = '';
    var ctx = { D: D, rol: leer() || ruta.rol, ir: ir, aviso: aviso, entrar: entrar, entrarApp: entrarApp, salir: salir };
    limpiar = window.PANTALLAS[ruta.pantalla](raiz, ctx) || null;
    window.scrollTo(0, 0);
  }

  // Sin número del modelo: dice el paso del flujo, o que aún no entra al flujo de la demo.
  function pronto(app) {
    aviso(app.nombre + ' · Disponible próximamente', (app.paso ? 'Paso ' + app.paso + ' del flujo' + (app.enDiseno ? ', en diseño' : '') : 'Aún fuera del flujo de la demo') + '. Ya está modelada en modeling/desing-views.');
    return false;
  }

  function entrar(rolId) {
    var r = D.roles.filter(function (x) { return x.id === rolId; })[0];
    if (!r) { return; }
    if (!r.ruta) { return pronto(D.apps.filter(function (a) { return a.id === r.app; })[0]); }
    guardar(r.id);
    ir(r.ruta);
    return true;
  }

  // Una app con varios roles entra por su propia ruta, con la sesión del rol pedido o de roles[0].
  function entrarApp(appId, rolId) {
    var app = D.apps.filter(function (a) { return a.id === appId; })[0];
    if (!app) { return false; }
    if (!app.ruta || app.enDiseno) { return pronto(app); }
    guardar(rolId || app.roles[0]);
    ir(app.ruta);
    return true;
  }

  function salir() { guardar(null); ir('#/'); }

  document.getElementById('aviso').addEventListener('nwtClose', function (e) { e.target.visible = false; });
  // Panel del demo desplegable en pantallas chicas; elegir un caso lo vuelve a cerrar.
  document.addEventListener('click', function (e) {
    var panel = e.target.closest && e.target.closest('.pp-panel');
    if (!panel) { return; }
    var abrir = e.target.closest('.pp-panel__toggle');
    if (abrir) { panel.classList.toggle('pp-panel--abierto'); abrir.setAttribute('aria-expanded', String(panel.classList.contains('pp-panel--abierto'))); }
    else if (e.target.closest('[data-caso],[data-acc]')) { panel.classList.remove('pp-panel--abierto'); panel.querySelector('.pp-panel__toggle').setAttribute('aria-expanded', 'false'); }
  });
  // Las apps pintan «N · caso» como texto plano; el número se resalta aquí para todas.
  function resaltarNumeros(nodo) {
    nodo.querySelectorAll('.pp-panel__lista > nwt-detail-item .nwt-detail-item__label').forEach(function (it) {
      var t = it.firstChild, m;
      while (t && t.nodeType === 3 && !t.nodeValue) { t = t.nextSibling; }
      m = t && t.nodeType === 3 && /^(\d+) · /.exec(t.nodeValue);
      if (!m) { return; }
      var n = document.createElement('span');
      n.className = 'pp-caso__n';
      n.textContent = m[1];
      t.nodeValue = t.nodeValue.slice(m[1].length);
      it.insertBefore(n, t);
    });
  }
  new MutationObserver(function () { resaltarNumeros(raiz); }).observe(raiz, { childList: true, subtree: true });
  window.addEventListener('hashchange', pintar);
  pintar();
})();
