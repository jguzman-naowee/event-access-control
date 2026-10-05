/* Superficie 3 · Auditoría: el registro inmutable del evento. Modelo en modeling/desing-views/03-monitor-pmu.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Los términos dicen lo que pasó en la puerta, no el color; el color queda en el punto y el tag. Orden: de lo que entra a lo que no, y lo que no es lectura.
  var TIPOS = [
    { id: 'verde', label: 'Entró', tag: 'Entró' },
    { id: 'amarillo', label: 'Entró con aviso', tag: 'Entró con aviso' },
    { id: 'operativo', label: 'No entró · boleta', tag: 'No entró · boleta' },
    { id: 'medida', label: 'No entró · medida', tag: 'No entró · medida' },
    { id: 'policia', label: 'Acción policial', tag: 'Acción policial' },
    { id: 'consulta', label: 'Consulta de perfil', tag: 'Consulta de perfil' },
    { id: 'venta', label: 'Venta', tag: 'Venta' }
  ];
  var TIPO = {};
  TIPOS.forEach(function (t) { TIPO[t.id] = t; });

  // Quién es "usted" según la sesión; el nombre de Mindeporte es ficticio como todo lo demás.
  var USTED = { policia: 'Pt. R. Gómez', mindeporte: 'C. Vargas' };
  var ROTULO = { policia: 'Policía Nacional', mindeporte: 'Mindeporte' };

  // Sobrevive al remontaje que hace el cambio de sesión del panel del demo.
  var dispGuardado = 'consola';

  window.PANTALLAS.auditoria = function (raiz, ctx) {
    var D = ctx.D, A = D.policia.auditoria, E = D.evento;
    var app = D.apps.filter(function (a) { return a.id === 'auditoria'; })[0];
    var rolId = app.roles.indexOf(ctx.rol) >= 0 ? ctx.rol : app.roles[0];
    var n = A.registros.length;
    var R = A.registros.map(function (r, i) {
      return Object.assign({ id: 'A-0928-' + String(A.total - i).padStart(5, '0') }, r);
    });
    // Primero se elige el evento; los registros detallados del demo son de Nacional vs. Medellín.
    var st = { vista: 'eventos', efiltro: 'todos', ebusca: '', disp: dispGuardado, tipo: null, puerta: '', origen: '', doc: '', sel: R[1].id, toast: null };
    var disp, timerToast = null, timerExport = null, zoom = 1;
    var timerReloj = setInterval(function () { var t = disp && disp.querySelector('.pa-hero__tiempos'); if (t) { t.innerHTML = tiempos(); } }, 15000);

    /* ---------- Filtros ---------- */

    function digitos(s) { return String(s).replace(/\D/g, ''); }
    // El documento se busca completo: el registro guarda los últimos 4 y nadie busca por fragmentos.
    function coincideDoc(r) {
      var d = digitos(st.doc);
      return d.length < 5 || digitos(r.doc) === d.slice(-4);
    }
    function base() {
      return R.filter(function (r) {
        return (!st.puerta || r.puerta === st.puerta) && (!st.origen || r.origen === st.origen) && coincideDoc(r);
      });
    }
    function visibles() { return base().filter(function (r) { return !st.tipo || r.tipo === st.tipo; }); }
    function elegido() { return R.filter(function (r) { return r.id === st.sel; })[0] || R[0]; }

    /* ---------- Piezas ---------- */

    function tag(tipo) { return '<span class="pa-tag pa-tag--' + tipo + '">' + esc(TIPO[tipo].tag) + '</span>'; }

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">Auditoría<span slot="subtitle">' + esc(ROTULO[rolId]) + ' · ' + esc(E.partido) + '</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }

    function tarjeta(titulo, cuerpo) {
      return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>';
    }

    function guion() {
      var probar = [
        ['r-medida', 'negative', 'Historia de CC •••• 4471'],
        ['r-cerrada', 'positive', 'Alerta cerrada · CC •••• 7730'],
        ['r-venta', 'informative', 'Solo ventas del evento']
      ].map(function (p) { return '<nwt-detail-item actionable icon="history" nwt-theme="' + p[1] + '" data-acc="' + p[0] + '">' + esc(p[2]) + '</nwt-detail-item>'; }).join('');
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Dispositivo', '<nwt-tabs id="tabs-disp" full-width></nwt-tabs>') +
        tarjeta('Probar', '<div class="pp-panel__lista">' + probar + '</div>') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p>' +
      '</aside>';
    }

    function barra() {
      var derecha = rolId === 'policia'
        ? '<span class="pa-barra__rol">Policía Nacional</span><img class="pp-policia__escudo" src="assets/escudos/policia.png" alt="">'
        : '<span class="pa-barra__rol">Ministerio del Deporte</span>';
      return '<header class="pa-barra">' +
        window.NAOWEE.entidades +
        '<div class="pa-barra__der">' + derecha + '<span class="pp-conexion">En línea</span></div>' +
      '</header>';
    }

    function opcion(v, texto, actual) { return '<option value="' + esc(v) + '"' + (v === actual ? ' selected' : '') + '>' + esc(texto) + '</option>'; }
    function unicos(campo) { return R.map(function (r) { return r[campo]; }).filter(function (v, i, a) { return v !== '—' && a.indexOf(v) === i; }).sort(); }

    function filtros() {
      var puertas = D.policia.tablero.puertas.map(function (p) { return p.nombre; });
      var docMal = digitos(st.doc).length > 0 && digitos(st.doc).length < 5;
      return '<section class="pa-filtros" aria-label="Filtros">' +
        '<label class="pa-campo">Puerta<select data-f="puerta">' + opcion('', 'Todas', st.puerta) + puertas.map(function (p) { return opcion(p, p, st.puerta); }).join('') + '</select></label>' +
        '<label class="pa-campo">Origen<select data-f="origen">' + opcion('', 'Todos', st.origen) + unicos('origen').map(function (o) { return opcion(o, o, st.origen); }).join('') + '</select></label>' +
        '<label class="pa-campo">Documento<input data-f="doc" type="text" inputmode="numeric" autocomplete="off" placeholder="Número completo" value="' + esc(st.doc) + '"' + (docMal ? ' aria-invalid="true" aria-describedby="pa-doc-ayuda"' : '') + '>' +
          (docMal ? '<span class="pa-campo__ayuda" id="pa-doc-ayuda">Escriba el número completo</span>' : '') + '</label>' +
      '</section>';
    }

    function chips() {
      var b = base();
      var todos = [{ id: '', label: 'Todos', n: b.length }].concat(TIPOS.map(function (t) {
        return { id: t.id, label: t.label, n: b.filter(function (r) { return r.tipo === t.id; }).length };
      }));
      return '<div class="pa-chips" role="group" aria-label="Filtrar por resultado">' + todos.map(function (c) {
        var on = (st.tipo || '') === c.id;
        return '<button type="button" class="pa-chip" aria-pressed="' + on + '" data-acc="tipo" data-id="' + c.id + '"><span class="pa-punto pa-punto--' + (c.id || 'todos') + '"></span>' + esc(c.label) + ' · ' + c.n + '</button>';
      }).join('') + '</div>';
    }

    function tabla() {
      var filas = visibles();
      var cuerpo = filas.length ? filas.map(function (r) {
        var sel = r.id === st.sel;
        return '<button type="button" class="pa-fila" aria-pressed="' + sel + '" data-acc="fila" data-id="' + r.id + '">' +
          '<span class="pa-fila__hora">' + esc(r.hora) + '</span>' +
          '<span>' + tag(r.tipo) + '</span>' +
          '<span>' + esc(r.puerta) + '</span>' +
          '<span class="pa-num">' + esc(r.doc) + '</span>' +
          '<span class="pa-fila__origen">' + esc(r.origen) + '</span>' +
          '<span class="pa-fila__detalle"><span>' + esc(r.detalle) + '</span><span class="pa-sub">' + esc(r.quien) + '</span></span>' +
        '</button>';
      }).join('') : '<p class="pa-vacio">Ningún registro con estos filtros.</p>';
      var paginas = Math.ceil(A.total / A.porPagina);
      return '<section class="pa-registros" aria-label="Registros">' +
        '<div class="pa-cols" aria-hidden="true"><span>Hora</span><span>Resultado</span><span>Puerta</span><span>Documento</span><span class="pa-fila__origen">Origen</span><span>Detalle · quién</span></div>' +
        '<div class="pa-lista">' + cuerpo + '</div>' +
        '<div class="pa-pie"><span>Mostrando ' + filas.length + ' de ' + A.total.toLocaleString('es-CO') + ' registros del evento</span>' +
          '<span class="pa-pie__pag">Página 1 de ' + paginas + '</span>' +
          '<button type="button" class="pa-pag" aria-label="Página anterior" disabled><nwt-icon value="chevron-left"></nwt-icon></button>' +
          '<button type="button" class="pa-pag" aria-label="Página siguiente" data-acc="pagina"><nwt-icon value="chevron-right"></nwt-icon></button>' +
        '</div>' +
      '</section>';
    }

    function panel() {
      var d = elegido();
      var historia = R.filter(function (r) { return r.doc === d.doc; }).slice().reverse().map(function (r) {
        var yo = r.id === d.id;
        return '<li class="pa-hist' + (yo ? ' pa-hist--sel' : '') + '"' + (yo ? ' aria-current="true"' : '') + '><span class="pa-punto pa-punto--' + r.tipo + '"></span>' +
          '<span class="pa-hist__hora">' + esc(r.hora) + '</span>' +
          '<span class="pa-hist__txt"><span class="pa-hist__det">' + esc(r.detalle) + '</span><span class="pa-sub">' + esc(r.origen) + ' · ' + esc(r.quien) + '</span></span></li>';
      }).join('');
      // Abrir el perfil es consultar datos protegidos: esas consultas y la de ahora quedan en el registro.
      var consultas = R.filter(function (r) { return r.tipo === 'consulta' && r.doc === d.doc && r.id !== d.id; }).map(function (r) {
        return { quien: r.quien + ' · abrió el perfil', cuando: r.hora };
      }).reverse().concat([{ quien: USTED[rolId] + ' (usted) · este detalle', cuando: 'ahora' }]);
      // La foto es la del documento de esa persona: se toma de su lectura en puerta; las consultas y ventas heredan la suya.
      var FOTO = { verde: 'verde', amarillo: 'amarillo', operativo: 'rojo', medida: 'rojo' };
      var lecturas = R.filter(function (r) { return r.doc === d.doc && FOTO[r.tipo]; });
      var propia = lecturas.filter(function (r) { return FOTO[r.tipo] === 'rojo'; })[0] || lecturas[0];
      var foto = propia ? FOTO[propia.tipo] : '';
      // El tag ya dice qué pasó: el título deja solo lo que el tag no dice (DC-126).
      var partes = d.detalle.split(' · '), titulo = partes.length > 1 && TIPO[d.tipo].tag.indexOf(partes[0]) === 0 ? partes.slice(1).join(' · ') : d.detalle;
      titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
      var dato = function (l, v) { return '<div class="pa-dato"><span class="pa-sub">' + l + '</span><span class="pa-dato__v">' + esc(v) + '</span></div>'; };
      return '<aside class="pa-detalle" aria-label="Detalle del registro" aria-live="polite">' +
        '<div class="pa-detalle__cab">' +
          '<div class="pa-detalle__top">' + tag(d.tipo) + '<span class="pa-detalle__id">Registro ' + esc(d.id) + '</span></div>' +
          '<div class="pa-persona">' +
            (foto ? '<img class="pa-persona__foto" src="assets/fotos/' + foto + '.jpg" alt="Foto del documento">' : '') +
            '<div class="pa-persona__txt"><h2 class="pa-detalle__h">' + esc(titulo) + '</h2><p class="pa-sub pa-num">' + esc(d.doc) + '</p></div></div>' +
          '<div class="pa-datos">' + dato('Fecha y hora', A.fecha + ' · ' + d.hora) + dato('Puerta', d.puerta) + dato('Origen', d.origen) + dato('Quién', d.quien) + '</div>' +
        '</div>' +
        '<div class="pa-detalle__cuerpo">' +
          '<section class="pa-sec"><h3 class="pa-sec__h">Historia de ' + esc(d.doc) + ' en el evento</h3><ol class="pa-historia">' + historia + '</ol></section>' +
          '<section class="pa-sec"><h3 class="pa-sec__h">Quién consultó este registro</h3><ul class="pa-consultas">' + consultas.map(function (q) {
            return '<li><span>' + esc(q.quien) + '</span><span class="pa-sub pa-num">' + esc(q.cuando) + '</span></li>';
          }).join('') + '</ul></section>' +
        '</div>' +
        '<p class="pa-detalle__pie">Registro inmutable. Esta consulta también queda registrada, con su usuario y la hora.</p>' +
      '</aside>';
    }

    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    function appEventos() {
      var T = D.policia.tablero.alertas;
      var cuenta = function (e) { return T.filter(function (a) { return a.estado === e; }).length; };
      return '<div class="pp-app pa-app">' + barra() + window.EVENTOS.lista({
        eventos: D.policia.eventos, filtro: st.efiltro, busca: st.ebusca, acc: 'a-abrir', accFiltro: 'a-filtro',
        titulo: 'Auditoría', sub: 'Elija el evento: cada venta, ingreso, alerta y consulta queda registrada y no se edita ni se borra.',
        accion: function () { return 'Ver auditoría'; },
        estados: function (e) { return e.tablero ? { nueva: cuenta('nueva'), atencion: cuenta('atencion'), cerrada: cuenta('cerrada') } : e.estados; }
      }) + toast() + '</div>';
    }

    // Reloj del demo: parte de las 18:44 y avanza en tiempo real; el partido empieza a las 19:00 y el operativo abrió a las 17:00.
    var t0 = Date.now();
    function minutos() { return 18 * 60 + 44 + Math.floor((Date.now() - t0) / 60000); }
    function duracion(m) { return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
    function tiempos() {
      var m = minutos(), ini = 19 * 60, fin = ini + 105;
      // Pitazo a las 19:00 y unos 105 min de partido con descanso; el operativo ya no se cuenta aquí (DC-125).
      var est = m < ini ? 'Faltan ' + duracion(ini - m) : m < fin ? "En curso · min " + Math.min(m - ini, 90) + "'" : 'Finalizado hace ' + duracion(m - fin);
      return '<span data-rel="partido"><span>Evento</span><b>' + est + '</b></span>';
    }

    // Cabecera y filtros en una sola pieza, con la foto del escenario del evento (DC-111).
    function hero() {
      var ev = D.policia.eventos.filter(function (x) { return x.tablero; })[0];
      var exp = st.exportando;
      var EXPORTAR = '<button type="button" class="pa-exportar" data-acc="exportar" aria-label="' + (exp ? 'Preparando el CSV' : 'Exportar CSV') + '"' + (exp ? ' disabled aria-busy="true"' : '') + '><nwt-icon value="' + (exp ? 'refresh' : 'download') + '"></nwt-icon>CSV</button>';
      return '<section class="pa-hero" aria-label="Evento">' +
        '<div class="pa-hero__cuerpo">' +
          '<div class="pa-cab"><div class="pa-cab__top"><button type="button" class="pp-t__volver" data-acc="a-eventos"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Eventos</button>' +
            EXPORTAR + '</div>' +
            '<div>' + window.EVENTOS.equipos(E.partido, { tag: 'h1', clase: 'pa-titulo' }) +
            '<p class="pa-sub pa-cab__sub">' + esc(ev.escenario) + ' · ' + esc(ev.ciudad) + ' · ' + esc(A.fecha) + ' · ' + esc(ev.hora) + '</p></div></div>' +
          filtros() +
        '</div>' +
        '<div class="pa-hero__foto"><img src="assets/estadios/' + ev.foto + '.jpg" alt="' + esc(ev.escenario) + '">' +
          '<span class="pa-hero__chip"><span class="pp-e__punto"></span>En vivo</span>' +
          '<div class="pa-hero__tiempos">' + tiempos() + '</div></div>' +
      '</section>';
    }

    function appAuditoria() {
      if (st.vista === 'eventos') { return appEventos(); }
      return '<div class="pp-app pa-app">' + barra() +
        '<div class="pa-cuerpo"><main class="pa-main">' +
          hero() + '<div id="pa-resultados" class="pa-resultados">' + chips() + tabla() + '</div>' +
        '</main><div id="pa-panel" class="pa-panel-col">' + panel() + '</div></div>' + toast() + '</div>';
    }

    // Barra de estado del SO solo en tablet, igual que la puerta; el escritorio es un monitor.
    function cromo() {
      if (st.disp !== 'tablet') { return ''; }
      return '<div class="pp-estado" aria-hidden="true"><span>18:44</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>';
    }

    /* ---------- Pintado y escala ---------- */

    function pintar() {
      var pie = st.disp === 'consola' ? '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>' : '';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + st.disp + '"><div class="pp-pantalla">' + cromo() + appAuditoria() + '</div></div>' + pie + '</div>';
      escalar();
    }
    // Repinta solo lo que cambia, para no perder el foco del campo de documento al escribir.
    function pintarResultados() {
      var r = disp.querySelector('#pa-resultados');
      var lista = r && r.querySelector('.pa-lista');
      var scroll = lista ? lista.scrollTop : 0;
      if (r) { r.innerHTML = chips() + tabla(); r.querySelector('.pa-lista').scrollTop = scroll; }
      pintarPanel();
    }
    function pintarPanel() { var p = disp.querySelector('#pa-panel'); if (p) { p.innerHTML = panel(); } }

    function escalar() {
      SPLASH.ver(disp);
      var esc_ = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!esc_ || !m) { return; }
      var k = Math.min((esc_.clientWidth - 48) / m.offsetWidth, (esc_.clientHeight - 88) / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }

    /* ---------- Acciones ---------- */

    function mostrarToast(t, m, th, i) {
      st.toast = { t: t, m: m, th: th || 'positive', i: i || 'positive' };
      pintar();
      if (st.vista === 'eventos' && st.ebusca) { window.EVENTOS.filtrar(disp, st.ebusca); }
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; pintar(); }, 3200);
    }

    // Simulado a propósito (DC-109): no baja ningún archivo; en el producto la exportación la arma el servidor.
    function exportar() {
      if (st.exportando) { return; }
      var n_ = visibles().length;
      st.exportando = true; pintar();
      timerExport = setTimeout(function () {
        st.exportando = false;
        mostrarToast('CSV exportado', n_ + ' registros · la exportación también queda en la auditoría');
      }, 1200);
    }

    function elegir(tipo, id) { st.vista = 'registros'; st.tipo = tipo; st.puerta = ''; st.origen = ''; st.doc = ''; if (id) { st.sel = id; } pintar(); }
    function porDetalle(doc, detalle) { return R.filter(function (r) { return r.doc === doc && r.detalle.indexOf(detalle) === 0; })[0].id; }

    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom]');
      if (!el) { return; }
      if (el.dataset.zoom) {
        zoom = el.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15);
        escalar();
        return;
      }
      switch (el.dataset.acc) {
        case 'salir': ctx.salir(); break;
        case 'a-eventos': st.vista = 'eventos'; pintar(); break;
        case 'a-filtro': st.efiltro = el.dataset.id; pintar(); window.EVENTOS.filtrar(disp, st.ebusca); break;
        case 'a-abrir':
          var ev = D.policia.eventos.filter(function (x) { return x.id === el.dataset.id; })[0];
          if (ev.tablero) { st.vista = 'registros'; pintar(); break; }
          mostrarToast(ev.partido, 'En el demo, los registros detallados están armados para Nacional vs. Medellín.', 'informative', 'info');
          break;
        case 'tipo': st.tipo = el.dataset.id || null; pintarResultados(); break;
        case 'fila':
          st.sel = el.dataset.id;
          disp.querySelectorAll('.pa-fila').forEach(function (f) { f.setAttribute('aria-pressed', String(f.dataset.id === st.sel)); });
          pintarPanel();
          break;
        case 'exportar': exportar(); break;
        case 'pagina': mostrarToast('Solo la página 1', 'El prototipo trae los registros más recientes del evento.', 'informative', 'info'); break;
        case 'cerrar-toast': st.toast = null; pintar(); break;
        case 'r-medida': elegir(null, porDetalle('CC •••• 4471', 'No entró')); break;
        case 'r-cerrada': elegir('policia', porDetalle('CC •••• 7730', 'Alerta cerrada')); break;
        case 'r-venta': elegir('venta', porDetalle('CC •••• 4471', 'Venta bloqueada')); break;
      }
    }

    function onCambio(ev) {
      var f = ev.target.dataset && ev.target.dataset.f;
      if (f === 'puerta' || f === 'origen') { st[f] = ev.target.value; pintarResultados(); }
    }
    function onInput(ev) {
      if (ev.target.classList.contains('pp-e__busca')) { st.ebusca = ev.target.value; window.EVENTOS.filtrar(disp, st.ebusca); return; }
      if (!ev.target.dataset || ev.target.dataset.f !== 'doc') { return; }
      st.doc = ev.target.value;
      var campo = ev.target.closest('.pa-campo'), mal = digitos(st.doc).length > 0 && digitos(st.doc).length < 5;
      var ayuda = campo.querySelector('.pa-campo__ayuda');
      if (mal && !ayuda) { campo.insertAdjacentHTML('beforeend', '<span class="pa-campo__ayuda" id="pa-doc-ayuda">Escriba el número completo</span>'); }
      if (!mal && ayuda) { ayuda.remove(); }
      ev.target.toggleAttribute('aria-invalid', mal);
      pintarResultados();
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' +
        '<div class="pp-zoom">' +
          '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
          '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
        '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('Auditoría');
    disp = raiz.querySelector('#dispositivo');

    var tabs = raiz.querySelector('#tabs-disp');
    tabs.items = [{ id: 'consola', label: 'Escritorio', value: 'consola' }, { id: 'tablet', label: 'Tablet', value: 'tablet' }];
    tabs.value = st.disp;
    tabs.addEventListener('nwtChange', function (e) { st.disp = dispGuardado = e.detail; pintar(); });

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('change', onCambio);
    raiz.addEventListener('input', onInput);
    window.addEventListener('resize', escalar);
    pintar();
    requestAnimationFrame(escalar);

    return function () {
      clearTimeout(timerToast); clearTimeout(timerExport); clearInterval(timerReloj);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('change', onCambio);
      raiz.removeEventListener('input', onInput);
      window.removeEventListener('resize', escalar);
    };
  };
})();
