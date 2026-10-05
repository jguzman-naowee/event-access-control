/* Superficie 4 · Backoffice de eventos. Modelo en modeling/desing-views/04-backoffice-eventos.md.
   Contrato: BACKOFFICE.registrar(id, { label, orden, render(ctx) -> html, accion?: {label, acc, icono?, disabled?} | fn(ctx), onClick?(el, ev, ctx),
   onInput?(ev, ctx), onChange?(ev, ctx), alMontar?(ctx), contexto?: false }). Los handlers repintan al volver, salvo que devuelvan false. */
window.BACKOFFICE = window.BACKOFFICE || { vistas: {} };
window.BACKOFFICE.vistas = window.BACKOFFICE.vistas || {};
// registrar(id, def): ids fijos escenario, evento, config, cupos, listo. Acciones con prefijo: esc-, evp-, cfg-, cup-, listo-.
window.BACKOFFICE.registrar = function (id, def) { this.vistas[id] = def; };

window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var ESTADOS = { borrador: 'Borrador', publicado: 'Publicado', curso: 'En curso', cerrado: 'Cerrado' };
  // Pestañas conocidas: existen aunque la vista aún no se haya registrado.
  var CONOCIDAS = { escenario: ['Escenario', 1], evento: ['Evento y partidos', 2], config: ['Configuración', 3], cupos: ['Cupos', 4], listo: ['Listo para abrir', 5] };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(n) { return '<nwt-icon value="' + n + '"></nwt-icon>'; }
  function fecha(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? (+p[2]) + ' ' + MES[+p[1] - 1] + ' ' + p[0] : 'Sin fecha'; }
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  var TIPOS = [['deportivo', 'Deportivo'], ['cultural', 'Cultural / concierto'], ['otro', 'Otro']];
  // Sin `tipo` el evento es deportivo: el caso del SVN.
  function tipoDe(e) { return e.tipo || 'deportivo'; }
  function tipoTxt(e) { return TIPOS.filter(function (t) { return t[0] === tipoDe(e); })[0][1]; }
  function copiar(o) { return JSON.parse(JSON.stringify(o)); }

  // Sobrevive al remontaje del panel del demo (cambio de dispositivo).
  var dispGuardado = 'consola';

  window.PANTALLAS.backoffice = function (raiz, app) {
    var D = app.D, B = D.backoffice;
    var disp, zoom = 1, timerToast = null, montada = null, scr = {};
    var st = { disp: dispGuardado, vista: 'escenario', evento: 'e1', eventos: copiar(B.eventos), menu: false, toast: null };

    function evActual() { return st.eventos.filter(function (e) { return e.id === st.evento; })[0] || st.eventos[0]; }

    var ctx = {
      D: D, st: st, raiz: null, esc: esc, ico: ico, fecha: fecha, estados: ESTADOS, ev: evActual,
      repintar: function () { pintar(); },
      toast: function (titulo, mensaje, tema) { mostrarToast(titulo, mensaje, tema); },
      ir: function (id) { irVista(id); }
    };

    /* ---------- Registro de vistas ---------- */

    function listaVistas() {
      var reg = window.BACKOFFICE.vistas, ids = Object.keys(CONOCIDAS);
      Object.keys(reg).forEach(function (id) { if (ids.indexOf(id) < 0) { ids.push(id); } });
      return ids.map(function (id) {
        var d = reg[id], c = CONOCIDAS[id] || [id, 99];
        return { id: id, def: d || null, label: (d && d.label) || c[0], orden: d && d.orden != null ? d.orden : c[1] };
      }).sort(function (a, b) { return a.orden - b.orden; });
    }
    function activa() { return listaVistas().filter(function (v) { return v.id === st.vista; })[0]; }

    /* ---------- Marco ---------- */

    function tema(e) { return 'pb-badge--' + e; }

    function barra() {
      return '<header class="pb-barra"><span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span><span class="pb-barra__sep" aria-hidden="true"></span>' +
        '<span class="pb-barra__ttl">Backoffice de eventos</span>' +
        '<span class="pb-usuario"><b>' + esc(B.usuario.nombre) + '</b><span class="pb-sub"> · ' + esc(B.usuario.cargo) + '</span></span>' + window.NAOWEE.entidades + '</header>';
    }

    function titulos(v) {
      var tabs = listaVistas().map(function (t) {
        return '<button type="button" class="pb-ttab" data-acc="pb-tab" data-id="' + t.id + '"' + (t.id === st.vista ? ' aria-current="page"' : '') + '>' + esc(t.label) + '</button>';
      }).join('');
      var a = v.def && v.def.accion;
      if (typeof a === 'function') { a = a(ctx); }
      var btn = a ? '<button type="button" class="pb-btn pb-btn--pri" data-acc="' + esc(a.acc) + '"' + (a.disabled ? ' disabled' : '') + '>' + (a.icono ? ico(a.icono) : '') + esc(a.label) + '</button>' : '';
      return '<div class="pb-titulos"><h1 class="pb-vh">' + esc(v.label) + '</h1><nav class="pb-tabs" aria-label="Secciones del backoffice">' + tabs + '</nav>' + btn + '</div>';
    }

    // Contexto del evento en una línea de texto, sin barra: la usan las vistas que trabajan sobre un evento.
    function contexto() {
      var e = evActual();
      var menu = st.menu ? '<div class="pb-menu" role="listbox" aria-label="Eventos">' + st.eventos.map(function (x) {
        return '<button type="button" class="pb-menu__op" role="option" aria-selected="' + (x.id === st.evento) + '" data-acc="pb-evento" data-id="' + x.id + '">' + esc(x.nombre) +
          '<span>' + fecha(x.fecha) + ' · ' + esc(x.escenario) + ' · ' + ESTADOS[x.estado] + '</span></button>';
      }).join('') + '</div>' : '';
      var d = '<span class="pb-ctx__d" aria-hidden="true">·</span>';
      return '<div class="pb-ctx"><b>' + esc(e.nombre) + '</b><span class="pb-badge ' + tema(e.estado) + '">' + ESTADOS[e.estado] + '</span>' +
        '<span>' + esc(e.escenario) + '</span>' + d + '<span>' + fecha(e.fecha) + '</span>' + d + '<span>Aforo ' + esc(e.aforo) + '</span>' +
        '<button type="button" class="pb-btn pb-btn--enlace" data-acc="pb-cambiar" aria-haspopup="listbox" aria-expanded="' + st.menu + '">Cambiar de evento</button>' + menu + '</div>';
    }

    function preparacion(v) {
      return '<div class="pb-vacio">' + ico('settings') + '<b>En preparación</b><span>' + esc(v.label) + ' se está armando y aparece en esta pestaña.</span></div>';
    }

    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    function contenido() {
      var v = activa(), html = '', conCtx = true;
      if (v.def) {
        try { html = v.def.render(ctx); } catch (err) { html = '<div class="pb-vacio">' + ico('caution') + '<b>No se pudo pintar la vista</b><span>' + esc(err.message) + '</span></div>'; if (window.console) { console.warn('backoffice:', v.id, err); } }
        conCtx = v.def.contexto !== false;
      } else { html = preparacion(v); }
      return '<div class="pp-app pb-app">' + barra() + '<main class="pb-main">' + titulos(v) + (conCtx && v.def ? contexto() : '') +
        '<div class="pb-vista" data-sc="v-' + v.id + '" role="region" aria-label="' + esc(v.label) + '">' + html + '</div></main>' + toast() + '</div>';
    }

    /* ---------- Marco del demo ---------- */

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">Backoffice de eventos<span slot="subtitle">Organizador · Liga profesional</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }
    function tarjeta(titulo, cuerpo) { return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function guion() {
      var item = function (acc, icono, th, texto) { return '<nwt-detail-item actionable icon="' + icono + '" nwt-theme="' + th + '" data-acc="' + acc + '">' + esc(texto) + '</nwt-detail-item>'; };
      var probar = [
        item('g-libre', 'view-grid', 'informative', 'Sector de aforo libre'),
        item('g-sinred', 'caution', 'negative', 'Dispositivo sin conexión'),
        item('g-sinvis', 'calendar', 'informative', 'Evento sin hinchada visitante'),
        item('g-sinhora', 'caution', 'negative', 'Borrador sin hora de inicio'),
        item('g-curso', 'padlock-close', 'informative', 'Evento en curso (solo lectura)'),
        item('g-config', 'settings', 'informative', 'Ir a Configuración del evento'),
        item('g-cupos', 'settings', 'informative', 'Ir a Cupos'),
        item('g-listo', 'history', 'informative', 'Ir a Listo para abrir')
      ].join('');
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Dispositivo', '<nwt-tabs id="tabs-disp" full-width></nwt-tabs>') +
        tarjeta('Probar', '<div class="pp-panel__lista">' + probar + '</div>') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p>' +
      '</aside>';
    }
    function cromo() {
      if (st.disp !== 'tablet') { return ''; }
      return '<div class="pp-estado" aria-hidden="true"><span>10:14</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>';
    }

    /* ---------- Pintado: conserva foco y scroll al repintar ---------- */

    function clave(el) {
      var d = el.dataset || {};
      if (d.k) { return 'k:' + (d.s || '') + ':' + d.k + ':' + (d.id || d.n || ''); }
      if (d.acc) { return 'a:' + d.acc + ':' + (d.id || d.n || ''); }
      return el.id ? 'i:' + el.id : null;
    }

    function pintar() {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      disp.querySelectorAll('[data-sc]').forEach(function (el) { scr[el.dataset.sc] = el.scrollTop; });
      var pie = st.disp === 'consola' ? '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>' : '';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + st.disp + '"><div class="pp-pantalla">' + cromo() + contenido() + '</div></div>' + pie + '</div>';
      disp.querySelectorAll('[data-sc]').forEach(function (el) { el.scrollTop = scr[el.dataset.sc] || 0; });
      if (kf) {
        var els = disp.querySelectorAll('[data-k],[data-acc],[id]');
        for (var i = 0; i < els.length; i++) {
          if (clave(els[i]) === kf && !els[i].disabled) {
            els[i].focus({ preventScroll: true });
            try { if (sel) { els[i].setSelectionRange(sel[0], sel[1]); } } catch (e) { /* tipo sin selección */ }
            break;
          }
        }
      }
      escalar();
      if (montada !== st.vista) {
        montada = st.vista;
        var v = activa();
        if (v && v.def && v.def.alMontar) { v.def.alMontar(ctx); }
      }
    }

    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - 88) / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }

    function mostrarToast(t, m, th) {
      var informativo = th === 'informative';
      st.toast = { t: t, m: m || '', th: th || 'positive', i: informativo ? 'info' : th === 'negative' ? 'caution' : 'positive' };
      pintar();
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; pintar(); }, 3200);
    }

    function irVista(id) { st.vista = id; st.menu = false; pintar(); }

    /* ---------- Eventos del DOM: se delegan a la vista activa ---------- */

    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom]');
      if (!el) { if (st.menu) { st.menu = false; pintar(); } return; }
      var d = el.dataset;
      if (d.zoom) {
        zoom = d.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15);
        escalar();
        return;
      }
      if (el.disabled) { return; }
      switch (d.acc) {
        case 'salir': app.salir(); return;
        case 'cerrar-toast': st.toast = null; pintar(); return;
        case 'pb-tab': irVista(d.id); return;
        case 'pb-cambiar': st.menu = !st.menu; pintar(); return;
        case 'pb-evento': st.evento = d.id; st.menu = false; pintar(); return;
      }
      if (d.acc.indexOf('g-') === 0) { atajo(d.acc); return; }
      var wasMenu = st.menu;
      st.menu = false;
      var v = activa();
      if (v && v.def && v.def.onClick && v.def.onClick(el, ev, ctx) === false && !wasMenu) { return; }
      pintar();
    }

    var TEXTO = /^(text|search|number|tel|email|)$/;
    function delegar(ev, nombre) {
      var el = ev.target;
      if (!el.closest || !el.closest('.pb-vista')) { return; }
      var v = activa();
      if (!v || !v.def || !v.def[nombre]) { return; }
      if (v.def[nombre](ev, ctx) !== false) { pintar(); }
    }
    // El texto avisa en `input`; selects, casillas, fechas y horas confirman con `change`.
    function onInput(ev) {
      var el = ev.target, texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (texto) { delegar(ev, 'onInput'); }
    }
    function onCambio(ev) {
      var el = ev.target, texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (!texto) { delegar(ev, 'onChange'); }
    }
    function onTecla(ev) { if (ev.key === 'Escape' && st.menu) { st.menu = false; pintar(); } }

    /* ---------- Atajos del panel del demo ---------- */

    function atajo(a) {
      var e, ec;
      switch (a) {
        case 'g-libre': ec = escenarioEst(); ec.sel = 'norte'; ec.filtro = 'sector'; irVista('escenario'); return;
        case 'g-sinred': ec = escenarioEst(); ec.sel = 'sur'; ec.filtro = 'sector'; irVista('escenario'); return;
        case 'g-sinvis': st.evento = 'e4'; evpEst().filtro = null; evpEst().q = ''; irVista('evento'); return;
        case 'g-sinhora':
          st.evento = 'e4'; e = evActual(); e.estado = 'borrador'; e.partidos[0].hora = '';
          evpEst().filtro = null; evpEst().q = ''; irVista('evento'); return;
        case 'g-curso': st.evento = 'e2'; evpEst().filtro = null; evpEst().q = ''; irVista('evento'); return;
        case 'g-config': st.evento = 'e1'; irVista('config'); return;
        case 'g-cupos': st.evento = 'e1'; irVista('cupos'); return;
        case 'g-listo': st.evento = 'e1'; irVista('listo'); return;
      }
    }
    // Estado por vista (creado bajo demanda, para que los atajos lo dejen listo).
    function escenarioEst() { return st.esc || (st.esc = iniciarEsc(B)); }
    function evpEst() { return st.evp || (st.evp = { filtro: null, q: '' }); }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' +
        '<div class="pp-zoom">' +
          '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
          '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
        '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('Backoffice de eventos');
    disp = raiz.querySelector('#dispositivo');
    ctx.raiz = disp;

    var tabs = raiz.querySelector('#tabs-disp');
    tabs.items = [{ id: 'consola', label: 'Escritorio', value: 'consola' }, { id: 'tablet', label: 'Tablet', value: 'tablet' }];
    tabs.value = st.disp;
    tabs.addEventListener('nwtChange', function (e) { st.disp = dispGuardado = e.detail; pintar(); });

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('change', onCambio);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('keydown', onTecla);
    window.addEventListener('resize', escalar);
    pintar();
    requestAnimationFrame(escalar);

    return function () {
      clearTimeout(timerToast);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('change', onCambio);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('keydown', onTecla);
      window.removeEventListener('resize', escalar);
    };
  };

  /* =====================================================================
     Vista 1 · Escenario (esc-)
     ===================================================================== */

  function iniciarEsc(B) {
    var s = { sel: 'occ', filtro: 'sector', sec: {}, disp: copiar(B.escenario.dispositivos) };
    B.escenario.sectores.forEach(function (x) { s.sec[x.id] = { nombre: x.nombre, tipo: x.tipo, aforo: x.aforo }; });
    return s;
  }

  var MAPA = {
    norte: { x: 112, y: 22, w: 296, h: 80, tx: 260, ty: 68, giro: 0 },
    sur: { x: 112, y: 462, w: 296, h: 80, tx: 260, ty: 508, giro: 0 },
    occ: { x: 22, y: 112, w: 80, h: 340, tx: 62, ty: 287, giro: -90 },
    ori: { x: 418, y: 112, w: 80, h: 340, tx: 458, ty: 287, giro: 90 }
  };
  var PUERTA_XY = { 1: [190, 22], 2: [330, 22], 3: [22, 190], 8: [22, 374], 4: [498, 190], 5: [498, 374], 6: [190, 542], 7: [330, 542] };
  var ESTADO_DISP = {
    linea: ['ok', 'En línea'], sinred: ['error', 'Sin conexión'], paquete: ['alerta', 'Sin paquete'], libre: ['neutro', 'Sin asignar']
  };
  var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  var CAMPO_PUESTOS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 11h18v5H3z"/><path d="M6 16v4M18 16v4"/></svg>';

  function vistaEscenario(c) {
    var B = c.D.backoffice, E = B.escenario, st = c.st, esc = c.esc;
    var s = st.esc || (st.esc = iniciarEsc(B));
    var sec = s.sec, sel = s.sel, num = sec[sel].tipo === 'num';
    var ids = B.escenario.sectores.map(function (x) { return x.id; });
    var total = ids.reduce(function (a, id) { return a + (Number(sec[id].aforo) || 0); }, 0);
    var nombre = function (id) { return sec[id].nombre || 'Sin nombre'; };
    var sectorDe = function (n) { return (E.puertas.filter(function (p) { return p.n === n; })[0] || {}).sector; };
    var puertaTxt = function (n) { return n ? 'Puerta ' + n + ' · ' + nombre(sectorDe(n)) : 'Sin puerta'; };
    var doorsSel = E.puertas.filter(function (p) { return p.sector === sel; });

    // Mapa: el sector elegido se marca con trazo azul grueso; libre va punteado y numerado en azul suave.
    var rects = ids.map(function (id) {
      var m = MAPA[id], on = id === sel, n = sec[id].tipo === 'num';
      var fill = n ? 'color-mix(in srgb, var(--naotech-color-blue-900) 10%, var(--naotech-app-background))' : 'var(--naotech-app-color-100)';
      var stroke = on ? 'var(--naotech-color-blue-900)' : n ? 'var(--naotech-color-blue-600)' : 'var(--naotech-app-color-600)';
      var rot = m.giro ? ' transform="rotate(' + m.giro + ' ' + m.tx + ' 282)"' : '';
      return '<g data-acc="esc-sector" data-id="' + id + '"><rect x="' + m.x + '" y="' + m.y + '" width="' + m.w + '" height="' + m.h + '" rx="14" style="fill:' + fill + ';stroke:' + stroke + ';stroke-width:' + (on ? 4 : 1.5) + ';stroke-dasharray:' + (n ? 'none' : '6 5') + '"/>' +
        '<text x="' + m.tx + '" y="' + m.ty + '" text-anchor="middle"' + rot + ' style="font-size:15px;font-weight:700;fill:var(--naotech-app-color-900)">' + esc(nombre(id)) + '</text></g>';
    }).join('');
    var campo = 'style="fill:none;stroke:var(--naotech-color-green-300);stroke-width:1.5"';
    var puertasMapa = E.puertas.map(function (p) {
      var xy = PUERTA_XY[p.n], on = p.sector === sel;
      return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="15" style="fill:' + (on ? 'var(--naotech-color-blue-900)' : 'var(--naotech-app-color-900)') + ';stroke:var(--naotech-app-background);stroke-width:3"/>' +
        '<text x="' + xy[0] + '" y="' + (xy[1] + 5) + '" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--naotech-color-white-alpha-100)">' + p.n + '</text>';
    }).join('');
    var mapa = '<section class="pb-card pb-mapa" aria-label="Mapa del escenario"><div class="pb-card__cab" style="padding:0"><h2 class="pb-h2">Mapa del escenario</h2><span class="pb-sub" style="margin-left:auto;font-size:12px">Esquemático, sin escala</span></div>' +
      '<svg viewBox="0 0 520 564" aria-hidden="true"><rect x="122" y="112" width="276" height="340" rx="6" style="fill:var(--naotech-color-green-050);stroke:var(--naotech-color-green-300);stroke-width:1.5"/>' +
      '<line x1="122" y1="282" x2="398" y2="282" ' + campo + '/><circle cx="260" cy="282" r="38" ' + campo + '/><rect x="200" y="112" width="120" height="44" ' + campo + '/><rect x="200" y="408" width="120" height="44" ' + campo + '/>' +
      rects + puertasMapa + '</svg>' +
      '<div class="pb-leyenda"><span><i class="pb-muestra"></i>Numerado (fila y silla)</span><span><i class="pb-muestra pb-muestra--libre"></i>Aforo libre</span><span><b class="pb-puerta-n pb-puerta-n--s">1</b>Puerta</span></div></section>';

    var sectores = '<div class="pb-sectores" role="group" aria-label="Elegir sector">' + ids.map(function (id) {
      return '<button type="button" class="pb-sector" aria-pressed="' + (id === sel) + '" data-acc="esc-sector" data-id="' + id + '">' + esc(nombre(id)) +
        '<span>' + (sec[id].tipo === 'num' ? 'Numerado' : 'Aforo libre') + ' · ' + miles(Number(sec[id].aforo) || 0) + '</span></button>';
    }).join('') + '</div>';

    var vacio = !sec[sel].nombre.trim();
    var form = '<div class="pb-esc-form">' +
      '<label class="pb-campo">Nombre del sector<input type="text" data-s="esc" data-k="nombre" value="' + esc(sec[sel].nombre) + '"' + (vacio ? ' aria-invalid="true" aria-describedby="esc-err"' : '') + '></label>' +
      '<div class="pb-campo"><span id="esc-tipo-l">Tipo de puesto</span><div class="pb-segmento" role="group" aria-labelledby="esc-tipo-l">' +
        '<button type="button" class="pb-seg" aria-pressed="' + num + '" data-acc="esc-tipo" data-id="num">Numerado</button>' +
        '<button type="button" class="pb-seg" aria-pressed="' + !num + '" data-acc="esc-tipo" data-id="libre">Aforo libre</button></div></div>' +
      '<label class="pb-campo pb-campo--num">Aforo del sector<input type="number" min="0" step="100" data-s="esc" data-k="aforo" value="' + esc(sec[sel].aforo) + '"></label></div>' +
      (vacio ? '<p class="pb-error" id="esc-err">' + c.ico('caution') + 'El sector necesita un nombre.</p>' : '');

    var filas = B.escenario.sectores.filter(function (x) { return x.id === sel; })[0].filas || 'Filas por definir';
    var puestos = '<div class="pb-puestos">' + CAMPO_PUESTOS + (num
      ? '<span><b>Puestos numerados:</b> ' + esc(filas) + ' · ' + miles(Number(sec[sel].aforo) || 0) + ' sillas. Cada boleta lleva fila y silla.</span>'
      : '<span><b>Aforo libre:</b> ' + miles(Number(sec[sel].aforo) || 0) + ' cupos sin silla. La boleta lleva el sector, no la fila.</span>') +
      '<button type="button" class="pb-btn" data-acc="esc-puestos">' + (num ? 'Editar filas y sillas' : 'Editar cupo') + '</button></div>';

    var puertas = '<div class="pb-sec"><div class="pb-puertas-cab"><h3 class="pb-h3">Puertas de ' + esc(nombre(sel)) + '</h3><span class="pb-sub" style="font-size:12px">Cada puerta pertenece a un solo sector</span>' +
      '<button type="button" class="pb-btn pb-btn--enlace" data-acc="esc-puerta-nueva">' + c.ico('add') + 'Agregar puerta</button></div>' +
      doorsSel.map(function (p) {
        var ds = s.disp.filter(function (d) { return d.puerta === p.n; });
        return '<div class="pb-puerta"><b class="pb-puerta-n">' + p.n + '</b><span>Puerta ' + p.n + '<span class="pb-sub">Solo sector ' + esc(nombre(sel)) + '</span></span>' +
          '<span>' + (ds.length ? ds.length + (ds.length === 1 ? ' dispositivo · ' : ' dispositivos · ') + ds.map(function (d) { return d.id; }).join(', ') : 'Sin dispositivo asignado') + '</span>' +
          '<button type="button" class="pb-btn" data-acc="esc-puerta-editar" data-id="' + p.n + '">Editar<span class="pb-vh"> puerta ' + p.n + '</span></button></div>';
      }).join('') + '</div>';

    var sectorCard = '<section class="pb-card" aria-label="Sector"><div class="pb-card__cuerpo" style="padding-top:20px">' + sectores + form + puestos + puertas + '</div></section>';

    // Dispositivos: la búsqueda y los filtros van dentro de la tabla.
    var nSec = s.disp.filter(function (d) { return sectorDe(d.puerta) === sel; }).length;
    var chip = function (id, texto, n) { return '<button type="button" class="pb-chip" aria-pressed="' + (s.filtro === id) + '" data-acc="esc-filtro" data-id="' + id + '">' + esc(texto) + '<span class="pb-chip__n">' + n + '</span></button>'; };
    var lista = s.disp.filter(function (d) { return s.filtro === 'todos' || sectorDe(d.puerta) === sel; });
    var filasD = lista.map(function (d) {
      var e = ESTADO_DISP[d.estado];
      return '<div class="pb-fila"><b class="pb-num">' + d.id + '</b><span>' + esc(d.tipo) + '</span><span class="pb-cortar"' + (d.puerta ? '' : ' style="color:var(--naotech-app-color-700)"') + '>' + esc(puertaTxt(d.puerta)) + '</span>' +
        '<span><span class="pb-badge pb-badge--' + e[0] + '">' + e[1] + '</span></span><span class="pb-sub pb-num" style="font-size:13px">Hoy ' + d.senal + '</span></div>';
    }).join('');
    var dispCard = '<section class="pb-tabla" aria-label="Dispositivos" style="--pb-cols:100px minmax(0,1.2fr) minmax(0,1fr) 128px 84px"><div class="pb-herr"><h2 class="pb-h2">Dispositivos</h2>' +
      '<div class="pb-chips" role="group" aria-label="Filtrar dispositivos">' + chip('sector', 'De ' + nombre(sel), nSec) + chip('todos', 'Todos', s.disp.length) + '</div>' +
      '<button type="button" class="pb-btn" data-acc="esc-disp-nuevo">' + c.ico('smartphone') + 'Registrar dispositivo</button></div>' +
      '<div class="pb-cols"><span>Código</span><span>Tipo</span><span>Puerta</span><span>Estado</span><span>Señal</span></div>' + (filasD || '<div class="pb-fila pb-sub">Este sector no tiene dispositivos.</div>') + '</section>';

    var nPuertas = E.puertas.length, sep = '<span class="pb-ctx__d" aria-hidden="true">·</span>';
    var ctxLinea = '<div class="pb-ctx"><b>' + esc(E.nombre) + '</b><span>' + esc(E.ciudad) + '</span>' + sep + '<span>Aforo ' + miles(total) + '</span>' + sep +
      '<span>' + ids.length + ' sectores · ' + nPuertas + ' puertas · ' + s.disp.length + ' dispositivos</span><span class="pb-sub" style="margin-left:auto">Última modificación: ' + esc(E.modificado) + '</span></div>';

    return ctxLinea + '<div class="pb-esc">' + mapa + '<div style="display:flex;flex-direction:column;gap:16px;min-width:0">' + sectorCard + dispCard + '</div></div>';
  }

  window.BACKOFFICE.registrar('escenario', {
    label: 'Escenario', orden: 1, contexto: false,
    accion: { label: 'Agregar sector', acc: 'esc-sector-nuevo', icono: 'add' },
    render: vistaEscenario,
    onClick: function (el, ev, c) {
      var d = el.dataset, s = c.st.esc, info = 'En el prototipo este formulario no se abre.';
      switch (d.acc) {
        case 'esc-sector': s.sel = d.id; return;
        case 'esc-tipo': s.sec[s.sel].tipo = d.id; return;
        case 'esc-filtro': s.filtro = d.id; return;
        case 'esc-sector-nuevo': c.toast('Agregar sector', 'El mapa del prototipo tiene sus 4 sectores fijos. ' + info, 'informative'); return false;
        case 'esc-disp-nuevo': c.toast('Registrar dispositivo', info, 'informative'); return false;
        case 'esc-puerta-nueva': c.toast('Agregar puerta', info, 'informative'); return false;
        case 'esc-puerta-editar': c.toast('Editar puerta ' + d.id, info, 'informative'); return false;
        case 'esc-puestos': c.toast(s.sec[s.sel].tipo === 'num' ? 'Editar filas y sillas' : 'Editar cupo', info, 'informative'); return false;
      }
      return false;
    },
    onInput: function (ev, c) {
      var d = ev.target.dataset, s = c.st.esc;
      if (d.s !== 'esc') { return false; }
      if (d.k === 'nombre') { s.sec[s.sel].nombre = ev.target.value; }
      if (d.k === 'aforo') { s.sec[s.sel].aforo = ev.target.value === '' ? '' : Math.max(0, Number(ev.target.value) || 0); }
    }
  });

  /* =====================================================================
     Vista 2 · Evento y partidos (evp-)
     ===================================================================== */

  var ORDEN = ['borrador', 'publicado', 'curso', 'cerrado'];
  var PIES = {
    borrador: function () { return 'Un borrador no es visible para las comercializadoras.'; },
    publicado: function (e) { return e.pub || 'Publicado'; },
    curso: function (e) { return 'Puertas abiertas desde las ' + e.apertura + '.'; },
    cerrado: function () { return 'Evento cerrado. Queda la auditoría.'; }
  };

  function vistaEvento(c) {
    var st = c.st, esc = c.esc, B = c.D.backoffice, es = st.evp || (st.evp = { filtro: null, q: '' });
    var evs = st.eventos, e = c.ev(), bloq = e.estado === 'curso' || e.estado === 'cerrado';
    var faltaHora = e.partidos.some(function (p) { return !p.hora; });
    var q = es.q.trim().toLowerCase();

    var chip = function (id, texto, n) { return '<button type="button" class="pb-chip" aria-pressed="' + (es.filtro === id) + '" data-acc="evp-filtro" data-id="' + (id || 'todos') + '">' + esc(texto) + '<span class="pb-chip__n">' + n + '</span></button>'; };
    var chips = chip(null, 'Todos', evs.length) + ORDEN.map(function (k) { return chip(k, c.estados[k], evs.filter(function (x) { return x.estado === k; }).length); }).join('');
    var visibles = evs.filter(function (x) {
      if (es.filtro && x.estado !== es.filtro) { return false; }
      if (!q) { return true; }
      var txt = (x.nombre + ' ' + x.escenario + ' ' + x.ciudad + ' ' + x.partidos.map(function (p) { return p.local + ' ' + p.visita; }).join(' ')).toLowerCase();
      return txt.indexOf(q) >= 0;
    });
    var tarjetas = visibles.map(function (x) {
      var f = String(x.fecha).split('-'), hora = (x.partidos[0] || {}).hora || 'Sin hora';
      return '<button type="button" class="pb-ev" aria-pressed="' + (x.id === e.id) + '" data-acc="evp-sel" data-id="' + x.id + '">' +
        '<span class="pb-ev__fecha"><span>' + (MES[+f[1] - 1] || '') + '</span><b>' + (f[2] || '–') + '</b></span>' +
        '<span class="pb-ev__txt"><span class="pb-ev__nom">' + esc(x.nombre) + '</span><span class="pb-sub pb-cortar">' + esc(x.escenario) + ', ' + esc(x.ciudad) + ' · ' + esc(hora) + '</span><span class="pb-sub" style="font-size:12px">' + esc(x.competencia) + ' · ' + tipoTxt(x) + '</span></span>' +
        '<span class="pb-ev__der"><span class="pb-badge pb-badge--' + x.estado + '">' + c.estados[x.estado] + '</span>' +
        (tipoDe(x) === 'deportivo' && x.partidos.some(function (p) { return p.sinVis; }) ? '<span class="pb-etiqueta">Sin hinchada visitante</span>' : '') + '</span></button>';
    }).join('') || '<div class="pb-vacio" style="min-height:160px"><b>Ningún evento coincide</b><span>Cambie la búsqueda o el filtro.</span></div>';

    var lista = '<section class="pb-tabla pb-evp__lista" aria-label="Eventos"><div class="pb-herr"><div class="pb-q pb-evp__buscar">' + c.ico('search') +
      '<input type="search" class="pb-input" data-s="evp" data-k="q" aria-label="Buscar evento" placeholder="Buscar por equipo o escenario" value="' + esc(es.q) + '"></div>' +
      '<div class="pb-chips" role="group" aria-label="Filtrar por estado" style="margin:0">' + chips + '</div></div><div class="pb-evp__scroll" data-sc="evp-lista">' + tarjetas + '</div></section>';

    // Detalle
    var idx = ORDEN.indexOf(e.estado);
    var pasos = ORDEN.map(function (k, j) {
      return '<li class="pb-paso' + (j < idx ? ' pb-paso--hecho' : j === idx ? ' pb-paso--actual' : '') + '"' + (j === idx ? ' aria-current="step"' : '') + '><span>' + (j < idx ? CHECK : '') + c.estados[k] + '</span></li>';
    }).join('');
    var dis = bloq ? ' disabled' : '';
    var opts = function (lista, val) { return lista.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); };
    var datos = '<section class="pb-sec"><h3 class="pb-h3">Datos del evento</h3><div class="pb-form2">' +
      '<label class="pb-campo">Tipo de evento<select data-s="evp" data-k="tipo"' + dis + '>' + TIPOS.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === tipoDe(e) ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="pb-campo">Competencia<select data-s="evp" data-k="competencia"' + dis + '>' + opts(B.competencias, e.competencia) + '</select></label>' +
      '<label class="pb-campo">Nombre del evento<input type="text" data-s="evp" data-k="nombre" value="' + esc(e.nombre) + '"' + dis + '></label>' +
      '<label class="pb-campo">Escenario<select data-s="evp" data-k="escenario"' + dis + '>' + opts(B.escenarios.map(function (x) { return x.nombre; }), e.escenario) + '</select></label>' +
      '<div class="pb-form2__par"><label class="pb-campo">Fecha<input type="date" data-s="evp" data-k="fecha" value="' + esc(e.fecha) + '"' + dis + '></label>' +
      '<label class="pb-campo">Apertura de puertas<input type="time" data-s="evp" data-k="apertura" value="' + esc(e.apertura) + '"' + dis + '></label></div></div>' +
      '<p class="pb-sub" style="font-size:13px">Aforo del escenario: ' + esc(e.aforo) + '. Sectores, puertas y cupos se ajustan en Configuración y Cupos.</p></section>';

    var dep = tipoDe(e) === 'deportivo';
    var partidos = '<section class="pb-sec"><div class="pb-puertas-cab"><h3 class="pb-h3">Partidos del evento · ' + e.partidos.length + '</h3>' +
      '<button type="button" class="pb-btn pb-btn--enlace" data-acc="evp-partido-nuevo"' + dis + '>' + c.ico('add') + 'Agregar partido</button></div>' +
      '<div class="pb-partidos-cab"><span>Local</span><span></span><span>Visitante</span><span>Inicio</span>' + (dep ? '<span>Hinchada visitante</span>' : '') + '</div>' +
      e.partidos.map(function (p, k) {
        return '<div class="pb-partido"><input type="text" class="pb-input" aria-label="Equipo local" data-s="evp" data-k="local" data-n="' + k + '" value="' + esc(p.local) + '"' + dis + '>' +
          '<span class="pb-partido__vs">vs.</span><input type="text" class="pb-input" aria-label="Equipo visitante" data-s="evp" data-k="visita" data-n="' + k + '" value="' + esc(p.visita) + '"' + dis + '>' +
          '<input type="time" class="pb-input" aria-label="Hora de inicio" data-s="evp" data-k="hora" data-n="' + k + '" value="' + esc(p.hora) + '"' + dis + (p.hora ? '' : ' aria-invalid="true"') + '>' +
          (dep ? '<button type="button" role="switch" class="pb-partido__vis pbe-sw" aria-checked="' + !!p.sinVis + '" data-acc="evp-sinvis" data-n="' + k + '"' + dis + '><span class="pbe-sw__t2">Sin hinchada visitante</span><span class="pbe-sw__pista"><span class="pbe-sw__bola"></span></span></button>' : '') + '</div>';
      }).join('') +
      (faltaHora && !bloq ? '<p class="pb-error">' + c.ico('caution') + 'Cada partido necesita su hora de inicio para publicar el evento.</p>' : '') + '</section>';

    var aviso = bloq ? '<div class="pb-aviso">' + c.ico('padlock-close') + '<span>' + (e.estado === 'curso' ? 'Evento en curso: la programación ya no se puede cambiar.' : 'Evento cerrado: solo lectura.') + '</span></div>' : '';

    var accion = '';
    if (e.estado === 'borrador') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-publicar"' + (faltaHora ? ' disabled' : '') + '>Publicar evento</button>'; }
    if (e.estado === 'publicado') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-config">Configurar el evento' + c.ico('arrow-right') + '</button>'; }
    if (e.estado === 'curso') { accion = '<button type="button" class="pb-btn pb-btn--pri" data-acc="evp-puertas">Ver estado de las puertas</button>'; }
    if (e.estado === 'cerrado') { accion = '<button type="button" class="pb-btn" data-acc="evp-auditoria">Ver auditoría del evento</button>'; }
    var guardar = bloq ? '' : '<button type="button" class="pb-btn" data-acc="evp-guardar">Guardar cambios</button>';

    var det = '<section class="pb-card pb-evp__det" aria-label="Detalle del evento"><div class="pb-evp__cab"><div class="pb-evp__top"><span class="pb-badge pb-badge--l pb-badge--' + e.estado + '">' + c.estados[e.estado] + '</span>' +
      '<span class="pb-sub pb-num">Evento ' + esc(e.codigo) + '</span></div><h2 class="pb-evp__nombre">' + esc(e.nombre || 'Evento sin nombre') + '</h2><ol class="pb-pasos" aria-label="Estado del evento">' + pasos + '</ol></div>' +
      '<div class="pb-evp__cuerpo" data-sc="evp-det">' + aviso + datos + partidos + '</div>' +
      '<div class="pb-evp__pie"><span>' + esc(PIES[e.estado](e)) + '</span>' + guardar + accion + '</div></section>';

    return '<div class="pb-evp pb-llena">' + lista + det + '</div>';
  }

  function siguienteCodigo(evs) {
    var mayor = evs.reduce(function (m, x) { return Math.max(m, parseInt(String(x.codigo).split('-')[2], 10) || 0); }, 0);
    return 'EV-2026-' + ('0000' + (mayor + 1)).slice(-4);
  }

  window.BACKOFFICE.registrar('evento', {
    label: 'Evento y partidos', orden: 2, contexto: false,
    accion: { label: 'Crear evento', acc: 'evp-crear', icono: 'add' },
    render: vistaEvento,
    onClick: function (el, ev, c) {
      var d = el.dataset, st = c.st, es = st.evp, e = c.ev(), B = c.D.backoffice;
      switch (d.acc) {
        case 'evp-filtro': es.filtro = d.id === 'todos' ? null : d.id; return;
        case 'evp-sel': st.evento = d.id; return;
        case 'evp-crear':
          var nuevo = { id: 'n' + st.eventos.length, codigo: siguienteCodigo(st.eventos), nombre: 'Evento nuevo', tipo: 'deportivo', competencia: B.competencias[0], escenario: B.escenarios[0].nombre, ciudad: B.escenarios[0].ciudad,
            fecha: '2026-10-10', apertura: '', estado: 'borrador', aforo: B.escenarios[0].aforo, pub: '', partidos: [{ local: '', visita: '', hora: '', sinVis: false }] };
          st.eventos.unshift(nuevo); st.evento = nuevo.id; es.filtro = null; es.q = '';
          c.toast('Borrador creado', 'Complete los datos y la hora de cada partido para publicarlo.', 'informative');
          return false;
        case 'evp-sinvis': e.partidos[+d.n].sinVis = !e.partidos[+d.n].sinVis; if (st.cfg) { st.cfg.sucio = true; } return;
        case 'evp-partido-nuevo': e.partidos.push({ local: '', visita: '', hora: '', sinVis: false }); return;
        case 'evp-guardar': c.toast('Cambios guardados', e.nombre + ' quedó actualizado.'); return false;
        case 'evp-publicar':
          if (e.partidos.some(function (p) { return !p.hora; })) { return; }
          e.estado = 'publicado'; e.pub = 'Publicado el ' + c.fecha(B.hoy);
          c.toast('Evento publicado', 'Las comercializadoras homologadas ya lo ven.');
          return false;
        case 'evp-config': c.ir('config'); return false;
        case 'evp-puertas': c.ir('listo'); return false;
        case 'evp-auditoria': c.toast('Auditoría del evento', 'Es otra aplicación: se abre desde el gate, Por aplicación.', 'informative'); return false;
      }
      return false;
    },
    onInput: function (ev, c) {
      var t = ev.target, d = t.dataset, e = c.ev();
      if (d.s !== 'evp') { return false; }
      if (d.k === 'q') { c.st.evp.q = t.value; return; }
      if (d.k === 'nombre') { e.nombre = t.value; }
      if (d.k === 'local' || d.k === 'visita') { e.partidos[+d.n][d.k] = t.value; }
    },
    onChange: function (ev, c) {
      var t = ev.target, d = t.dataset, e = c.ev(), B = c.D.backoffice;
      if (d.s !== 'evp') { return false; }
      if (d.k === 'hora') { e.partidos[+d.n].hora = t.value; }
      if (d.k === 'tipo') { e.tipo = t.value; }
      if (d.k === 'competencia' || d.k === 'fecha' || d.k === 'apertura') { e[d.k] = t.value; }
      if (d.k === 'escenario') {
        var x = B.escenarios.filter(function (s) { return s.nombre === t.value; })[0];
        e.escenario = t.value; if (x) { e.ciudad = x.ciudad; e.aforo = x.aforo; }
      }
    }
  });
})();
