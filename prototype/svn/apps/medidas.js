/* Superficie 1 · Registro de medidas correctivas. Modelo en modeling/desing-views/01-registro-medidas.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = 86400000;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(n) { return '<nwt-icon value="' + n + '"></nwt-icon>'; }
  function tiempo(iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function fmt(ms) { var d = new Date(ms); return d.getUTCDate() + ' ' + MES[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function digitos(s) { return String(s).replace(/\D/g, ''); }
  function iniciales(n) { return n.split(' ').map(function (w) { return w.charAt(0).toUpperCase(); }).join('. ') + '.'; }

  var CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

  var MOTIVOS_MENOR = [
    ['oficio', 'Responder un oficio sobre esta medida'],
    ['representante', 'Notificar al representante legal'],
    ['verificacion', 'Verificar identidad por solicitud de autoridad']
  ];
  var MOTIVOS_ARCHIVO = ['La autoridad no abrió procedimiento', 'La autoridad decidió no sancionar', 'Persona no identificada', 'Duplicado de otro reporte'];
  var DOCS = [['CC', 'Cédula de ciudadanía'], ['TI', 'Tarjeta de identidad'], ['CE', 'Cédula de extranjería'], ['PA', 'Pasaporte'], ['PPT', 'Permiso por Protección Temporal'], ['PEP', 'Permiso Especial de Permanencia'], ['RUMV', 'RUMV']];
  var C97 = [['1', 'Armas u objetos peligrosos'], ['2', 'Estupefacientes'], ['3', 'Violencia contra la fuerza pública'], ['4', 'Invadir el terreno de juego'], ['5', 'Desatender a la logística en ubicación y tránsito'], ['6', 'Ingresar o ingerir bebidas alcohólicas']];
  var C98 = [['a', 'Agresión física'], ['b', 'Agresión verbal'], ['c', 'Daño a infraestructura']];
  var AGR = [['o', 'Ser organizador o protagonista del evento'], ['d', 'Ser dirigente de un club profesional'], ['s', 'Actuar bajo efectos de sustancias']];
  var EVENTOS = ['Nacional vs. Medellín · 28 sep 2026 · Estadio Atanasio Girardot', 'Medellín vs. Millonarios · 3 ago 2026 · Estadio Atanasio Girardot', 'Envigado vs. Nacional · 14 sep 2026 · Estadio Polideportivo Sur'];
  var AUTORIDADES = ['Inspección de Policía 14 de Medellín', 'Inspección de Policía 5 de Medellín', 'Inspección de Policía 3 de Envigado'];
  var CIUDADES = ['Medellín, Antioquia', 'Bello, Antioquia', 'Envigado, Antioquia', 'Itagüí, Antioquia'];
  var PASOS = [['Persona', 'Identidad y ¿es menor?', 'Persona y consulta a la Registraduría'], ['Hechos', 'Evento y conductas', 'Hechos'], ['Sanción', 'Acto, ejecutoria y meses', 'Sanción'], ['Gestión', 'Radicados GESDOC', 'Gestión interna'], ['Revisión', 'Confirmar y radicar', 'Revisión y confirmación']];
  var ENTIDADES = ['Atlético Nacional', 'Independiente Medellín', 'Millonarios'];
  var ETAPAS = {
    enviado: { tag: 'Enviado · nuevo', label: 'Enviados', orden: 0 },
    recibido: { tag: 'Recibido', label: 'Recibidos', orden: 1 },
    tramite: { tag: 'En trámite', label: 'En trámite', orden: 2 },
    derivo: { tag: 'Derivó en medida', label: 'Derivó en medida', orden: 3 },
    archivado: { tag: 'Archivado', label: 'Archivados', orden: 3 }
  };

  // Sobrevive al remontaje del panel del demo (cambio de dispositivo).
  var dispGuardado = 'consola';

  window.PANTALLAS.medidas = function (raiz, ctx) {
    var D = ctx.D, V = D.ivc, HOY = tiempo(V.hoy);
    var disp, timerToast = null, zoom = 1;

    /* ---------- Cálculo de la vigencia: se calcula, no se digita ---------- */

    // Fin = día siguiente a la ejecutoria + meses - 1 día (Decreto 079, art. 6).
    function vigencia(ejecIso, meses) {
      var p = (ejecIso || '').split('-').map(function (n) { return parseInt(n, 10); });
      var valida = p.length === 3 && p.every(function (n) { return !isNaN(n); });
      var ejecT = valida ? Date.UTC(p[0], p[1] - 1, p[2]) : HOY;
      var desdeT = ejecT + DIA, dd = new Date(desdeT);
      var m = Math.max(1, parseInt(meses, 10) || 1);
      var finT = Date.UTC(dd.getUTCFullYear(), dd.getUTCMonth() + m, dd.getUTCDate()) - DIA;
      var vigente = finT >= HOY;
      return { ejecT: ejecT, desdeT: desdeT, finT: finT, meses: m, vigente: vigente, dias: Math.round((finT - HOY) / DIA), error: ejecT > HOY };
    }

    function edad(nac) {
      var n = tiempo(nac), a = new Date(n), h = new Date(HOY);
      var e = h.getUTCFullYear() - a.getUTCFullYear();
      if (h.getUTCMonth() < a.getUTCMonth() || (h.getUTCMonth() === a.getUTCMonth() && h.getUTCDate() < a.getUTCDate())) { e--; }
      return e;
    }

    function completar(m) {
      var o = Object.assign({ sexo: 'Hombre', ciudad: 'Medellín, Antioquia', competicion: 'Liga profesional de fútbol · 2026-I', residencia: 'Medellín, Antioquia', contacto: '300 •••• 812', multa: '$ 711.750',
        profesional: V.usuario.nombre, agravantes: [], rep: [], respuesta: '—', financiera: '—', juridica: '—', extra: [],
        descripcion: 'Hechos descritos en el informe de la autoridad de policía que emitió el acto.' }, m);
      var v = vigencia(o.ejecutoria, o.meses);
      o.v = v;
      o.estado = v.vigente ? 'vigente' : 'cumplida';
      o.porVencer = v.vigente && v.dias <= 30;
      o.edad = edad(o.nacimiento);
      return o;
    }

    var M = V.medidas.map(completar);
    var RP = V.reportes.map(function (r) { return Object.assign({}, r, { historial: r.historial.slice() }); });

    /* ---------- Estado de la pantalla ---------- */

    var st = {
      disp: dispGuardado, vista: 'base', origen: 'base', toast: null,
      base: { sel: 'MC-2025-0831', filtro: 'todas', q: '', orden: 'reciente', motivo: '', abiertos: {} },
      rad: nuevaRadicacion(),
      rep: { sel: 'R-2026-0412', filtro: 'todos', q: '', entidad: '', periodo: 'todo', archivando: false, motivo: '', nota: '' }
    };
    var scr = {};
    var scrollSel = true;

    function nuevaRadicacion() {
      return { paso: 1, max: 1, consultado: false, hecho: false, nueva: null, c97: {}, c98: { a: true }, agr: {},
        v: { tipo: 'CC', numero: '1.000.873.265', sexo: '', ciudad: CIUDADES[0], direccion: 'Calle 48 # 70-22', telefono: '3004418207', correo: '',
          repTipo: 'CC', repDoc: '', repNombre: '', parentesco: 'Madre', repTel: '', repCorreo: '',
          evento: EVENTOS[0], fechaHechos: '2026-09-28', descripcion: 'Agredió a un integrante de la logística en la Puerta 4 · Oriental cuando le negaron el ingreso.',
          autoridad: AUTORIDADES[0], acto: 'Resolución 0612 de 2026', ejecutoria: '2026-09-25', meses: 24, multa: '1.423.500',
          entrada: '2026-E-038921', respuesta: '', financiera: '', juridica: '', profesional: V.usuario.nombre + ' (usted)', observaciones: '', confirmo: false } };
    }

    /* ---------- Piezas comunes ---------- */

    function opciones(lista, val) {
      return lista.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
        return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>';
      }).join('');
    }
    function campo(etiqueta, control, cls) { return '<label class="pm-campo' + (cls ? ' ' + cls : '') + '"><span>' + etiqueta + '</span>' + control + '</label>'; }
    function entrada(s, k, val, extra) { return '<input data-s="' + s + '" data-k="' + k + '" value="' + esc(val) + '" ' + (extra || '') + '>'; }
    function lista(s, k, ops, val) { return '<select data-s="' + s + '" data-k="' + k + '">' + opciones(ops, val) + '</select>'; }
    function kv(k, v, ancho) { return '<div class="pm-kv' + (ancho ? ' pm-kv--2' : '') + '"><span class="pm-sub">' + esc(k) + '</span><span class="pm-kv__v">' + esc(v) + '</span></div>'; }
    function seccion(titulo, cuerpo) { return '<section class="pm-sec"><h3 class="pm-sec__h">' + esc(titulo) + '</h3>' + cuerpo + '</section>'; }
    function historial(items) {
      return '<ol class="pm-historia">' + items.map(function (h) {
        return '<li class="pm-hist"><span class="pm-pt pm-pt--' + h.punto + '"></span><span class="pm-hist__f">' + esc(h.fecha) + '</span>' +
          '<span class="pm-hist__t"><span>' + esc(h.texto) + '</span><span class="pm-sub">' + esc(h.quien) + '</span></span></li>';
      }).join('') + '</ol>';
    }
    function chip(acc, id, on, texto, punto, n) {
      return '<button type="button" class="pm-chip" aria-pressed="' + on + '" data-acc="' + acc + '" data-id="' + id + '">' + (punto ? '<span class="pm-pt pm-pt--' + punto + '"></span>' : '') + esc(texto) + '<span class="pm-chip__n">' + n + '</span></button>';
    }
    function tagMedida(m, largo) {
      return '<span class="pm-tag pm-tag--' + m.estado + (largo ? ' pm-tag--l' : '') + '">' + (m.estado === 'vigente' ? (largo ? 'Vigente · ' + m.v.dias + ' días' : 'Vigente') : 'Cumplida') + '</span>';
    }
    function tagReporte(e, largo) { return '<span class="pm-tag pm-tag--r-' + e + (largo ? ' pm-tag--l' : '') + '">' + esc(ETAPAS[e].tag) + '</span>'; }

    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    // Mindeporte + IVC a la derecha (DC-138, DC-319), igual que el portal de ivc-base.
    function usuario() {
      return '<span class="pm-usuario"><b class="pm-usuario__n">' + esc(V.usuario.nombre) + '</b><span class="pm-sub"> · ' + esc(V.usuario.cargo.split(' · ')[0]) + '</span></span>' + window.NAOWEE.entidades;
    }

    function barra() {
      var marca = '<span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span><span class="pm-barra__sep" aria-hidden="true"></span>';
      // Radicar es un flujo propio: sale de las pestañas y se vuelve a donde se vino (DC-134, DC-135).
      if (st.vista === 'radicar') {
        return '<header class="pm-barra pm-barra--flujo">' +
          '<button type="button" class="pm-volver" data-acc="volver">' + ico('arrow-left') + '<span>Volver a ' + (st.origen === 'reportes' ? 'reportes' : 'la base') + '</span></button>' +
          '<span class="pm-barra__sep" aria-hidden="true"></span><span class="pm-barra__ttl">Radicar medida</span>' + usuario() + '</header>';
      }
      return '<header class="pm-barra">' + marca + '<span class="pm-barra__ttl">Medidas correctivas</span>' + usuario() + '</header>';
    }

    // Las pestañas bajan y hacen de título de la vista (propuesta B, 29-sep): no hay h1 visible ni subtítulo.
    function titulos() {
      var nuevos = RP.filter(function (r) { return r.estado === 'enviado'; }).length;
      var tab = function (id, texto, extra) {
        return '<button type="button" class="pm-ttab" data-acc="vista" data-id="' + id + '"' + (st.vista === id ? ' aria-current="page"' : '') + '>' + texto + (extra || '') + '</button>';
      };
      return '<div class="pm-titulos"><h1 class="pm-vh">' + (st.vista === 'reportes' ? 'Reportes de entidades' : 'Base de medidas') + '</h1>' +
        '<nav class="pm-tabs" aria-label="Secciones del IVC">' + tab('base', 'Base de medidas') +
          tab('reportes', 'Reportes de entidades', nuevos ? '<span class="pm-nav__n" aria-label="' + nuevos + ' nuevos">' + nuevos + '</span>' : '') + '</nav>' +
        '<button type="button" class="pm-btn pm-btn--pri" data-acc="ir-radicar">' + ico('add') + 'Radicar medida</button></div>';
    }

    /* ---------- 1 · Base de medidas ---------- */

    function vistaMenor(m, b) {
      var abierto = !!b.abiertos[m.id];
      return Object.assign({}, m, { oculto: m.menor && !abierto, abierto: m.menor && abierto });
    }

    function coincide(m, q) {
      if (!q) { return true; }
      var d = digitos(q);
      // Un menor reservado solo aparece si se escribe su documento completo: buscar por nombre lo delataría.
      if (m.oculto) { return d.length >= 8 && digitos(m.doc) === d; }
      return m.nombre.toLowerCase().indexOf(q) >= 0 || (d.length >= 4 && digitos(m.doc).indexOf(d) >= 0);
    }

    var PRUEBA = {
      todas: function () { return true; },
      vigentes: function (m) { return m.estado === 'vigente'; },
      vencer: function (m) { return m.porVencer; },
      cumplidas: function (m) { return m.estado === 'cumplida'; },
      menores: function (m) { return m.menor; }
    };
    var FILTROS = [['todas', 'Todas'], ['vigentes', 'Vigentes'], ['vencer', 'Por vencer'], ['cumplidas', 'Cumplidas'], ['menores', 'Menores']];

    function ordenar(a) {
      var c = a.slice();
      if (st.base.orden === 'fin') {
        c.sort(function (x, y) {
          if (x.estado !== y.estado) { return x.estado === 'vigente' ? -1 : 1; }
          return x.estado === 'vigente' ? x.v.finT - y.v.finT : y.v.finT - x.v.finT;
        });
      } else {
        c.sort(function (x, y) { return tiempo(y.radicada) - tiempo(x.radicada); });
      }
      return c;
    }

    function panelMedida(m, b) {
      if (!m) {
        return '<aside class="pm-detalle pm-detalle--vacio" aria-label="Detalle de la medida"><p class="pm-sub">Elija una medida de la lista para ver su expediente.</p></aside>';
      }
      var oc = m.oculto, vig = m.estado === 'vigente';
      var nombre = m.menor ? (oc ? 'Menor de edad · ' + m.iniciales : m.nombre) : m.nombre;
      var docV = oc ? m.docMask : m.doc;
      var otras = M.map(function (x) { return vistaMenor(x, b); }).filter(function (x) { return x.persona === m.persona && x.id !== m.id; });
      var motivoTxt = (MOTIVOS_MENOR.filter(function (x) { return x[0] === b.abiertos[m.id]; })[0] || [])[1];
      var hist = historialDe(m).concat(m.abierto ? [{ fecha: '29 sep 2026', texto: 'Datos del menor abiertos · ' + (motivoTxt || 'motivo registrado').toLowerCase(), quien: V.usuario.nombre + ' (usted)', punto: 'azul' }] : []);
      var infractor = [
        ['Tipo y número', docV], ['Fecha de nacimiento', oc ? 'Reservado' : fmt(tiempo(m.nacimiento)) + ' · ' + m.edad + ' años'], ['Sexo', oc ? 'Reservado' : m.sexo],
        ['¿Es menor de edad?', m.menor ? 'Sí · calculado por la fecha de nacimiento' : 'No'], ['Residencia', oc ? 'Reservado' : m.residencia], ['Contacto', oc ? 'Reservado' : m.contacto]
      ];
      var rep = oc ? [['Nombre', 'Reservado'], ['Documento', 'Reservado'], ['Parentesco', 'Reservado'], ['Teléfono', 'Reservado']] : m.rep.map(function (r) { return [r.k, r.v]; });
      var rad = function (k, v) { return '<div class="pm-rad"><span class="pm-sub">' + k + '</span><span class="pm-rad__v' + (v === '—' ? ' pm-rad__v--vacio' : '') + '">' + esc(v) + '</span></div>'; };

      var reserva = oc ? '<section class="pm-reserva" aria-label="Reserva reforzada">' +
        '<div class="pm-reserva__t">' + ico('privacy') + '<span>Datos de menor de edad con reserva reforzada</span></div>' +
        '<p>Nombre, documento, contacto y representante legal quedan ocultos. Abrirlos exige un motivo y la apertura queda en la auditoría con su usuario y la hora.</p>' +
        '<label class="pm-campo">Motivo de la apertura<select data-s="b" data-k="motivo"><option value="">Seleccione un motivo</option>' + opciones(MOTIVOS_MENOR, b.motivo) + '</select></label>' +
        '<button type="button" class="pm-btn pm-btn--pri" data-acc="abrir-menor"' + (b.motivo ? '' : ' disabled') + '>Abrir datos del menor</button></section>' : '';
      var apertura = m.abierto ? '<div class="pm-aviso pm-aviso--azul" role="status">' + ico('visibility-on') + '<span>Apertura registrada en la auditoría · 29 sep 2026 · 10:14 · usted</span></div>' : '';

      return '<aside class="pm-detalle" aria-label="Detalle de la medida">' +
        '<div class="pm-detalle__cab">' +
          '<div class="pm-detalle__top">' + tagMedida(m, true) + '<span class="pm-sub pm-num">Medida ' + esc(m.id) + '</span>' +
            '<button type="button" class="pm-cerrar" data-acc="cerrar-detalle" aria-label="Cerrar detalle">' + ico('close') + '</button></div>' +
          '<h2 class="pm-detalle__h">' + esc(nombre) + '</h2>' +
          '<p class="pm-sub pm-num">' + esc(docV) + ' · ' + esc(m.conductas.join(' · ')) + '</p>' +
          '<div class="pm-caja pm-caja--' + m.estado + '">' +
            '<div class="pm-kv"><span class="pm-sub">Vigencia calculada</span><span class="pm-kv__v pm-num">' + fmt(m.v.desdeT) + ' – ' + fmt(m.v.finT) + '</span></div>' +
            '<div class="pm-kv"><span class="pm-sub">' + (vig ? 'Estado automático' : 'Cumplida el') + '</span><span class="pm-kv__v pm-caja__v">' + (vig ? 'Vigente · bloquea en todo el país' : fmt(m.v.finT + DIA) + ' · no bloquea') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="pm-detalle__cuerpo" data-sc="det">' + reserva + apertura +
          seccion('Infractor', '<div class="pm-kvs">' + infractor.map(function (x) { return kv(x[0], x[1]); }).join('') + '</div>') +
          (m.menor ? seccion('Representante legal', '<div class="pm-kvs">' + rep.map(function (x) { return kv(x[0], x[1]); }).join('') + '</div>') : '') +
          seccion('Hechos', '<div class="pm-kvs">' + kv('Evento', m.evento, true) + kv('Fecha de los hechos', fmt(tiempo(m.hechos))) + kv('Ciudad', m.ciudad) + kv('Competición', m.competicion, true) + '</div>' +
            '<div class="pm-grupo"><span class="pm-sub">Conductas</span><div class="pm-pills">' + m.conductas.map(function (c) { return '<span class="pm-pill pm-pill--rojo">' + esc(c) + '</span>'; }).join('') + '</div></div>' +
            '<div class="pm-grupo"><span class="pm-sub">Agravantes</span><div class="pm-pills">' + (m.agravantes.length ? m.agravantes : ['Ninguno']).map(function (c) { return '<span class="pm-pill">' + esc(c) + '</span>'; }).join('') + '</div></div>' +
            '<p class="pm-texto">' + esc(m.descripcion) + '</p>') +
          seccion('Sanción', '<div class="pm-kvs">' + kv('Acto administrativo', m.acto + ' · ' + m.autoridad, true) + kv('Constancia de ejecutoria', fmt(m.v.ejecT)) + kv('Tiempo de sanción', m.v.meses + ' meses') + kv('Valor de la multa', m.multa) + kv('Alcance', 'Nacional') + '</div>') +
          seccion('Radicados GESDOC', '<div class="pm-rads">' + rad('Entrada', m.entrada) + rad('Respuesta', m.respuesta) + rad('Financiera', m.financiera) + rad('Jurídica', m.juridica) + '</div>' +
            '<p class="pm-sub">Profesional responsable: <b class="pm-fuerte">' + esc(m.profesional) + '</b></p>') +
          seccion('Historial', historial(hist)) +
          (otras.length ? seccion('Otras medidas de esta persona', otras.map(function (o) {
            return '<button type="button" class="pm-otra" data-acc="m-sel" data-id="' + o.id + '">' + tagMedida(o) +
              '<span class="pm-otra__t"><b>' + esc(o.conductas.join(' · ')) + '</b><span class="pm-sub">' + (o.estado === 'vigente' ? 'Bloquea hasta el ' + fmt(o.v.finT) : 'Cumplida el ' + fmt(o.v.finT + DIA)) + ' · ' + o.id + '</span></span></button>';
          }).join('')) : '') +
        '</div>' +
        '<p class="pm-detalle__pie">El registro no se edita: cada cambio entra al historial con su soporte.</p>' +
      '</aside>';
    }

    function historialDe(m) {
      var base = [
        { fecha: fmt(tiempo(m.radicada)), texto: 'Radicada desde el oficio de entrada ' + m.entrada, quien: m.profesional, punto: 'azul' },
        { fecha: fmt(tiempo(m.radicada)), texto: 'Identidad verificada con la Registraduría (ANI)', quien: 'Sistema', punto: 'gris' }
      ].concat(m.extra);
      if (m.estado === 'cumplida') { base.push({ fecha: fmt(m.v.finT + DIA), texto: 'Cumplida al terminar la vigencia · la persona quedó habilitada', quien: 'Sistema', punto: 'verde' }); }
      return base;
    }

    function vistaBase() {
      var b = st.base, q = b.q.trim().toLowerCase();
      var todas = M.map(function (m) { return vistaMenor(m, b); });
      var buscadas = todas.filter(function (m) { return coincide(m, q); });
      var filas = ordenar(buscadas.filter(PRUEBA[b.filtro]));
      var sel = todas.filter(function (m) { return m.id === b.sel; })[0] || null;
      var chips = FILTROS.map(function (f) {
        return chip('m-filtro', f[0], b.filtro === f[0], f[1], null, buscadas.filter(PRUEBA[f[0]]).length);
      }).join('');
      var cuerpo = filas.length ? filas.map(function (m) {
        var nombre = m.menor && m.oculto ? 'Menor de edad · ' + m.iniciales : m.nombre;
        var dias = m.estado === 'vigente' ? (m.porVencer ? 'Por vencer · ' + m.v.dias + ' días' : m.v.dias + ' días restantes') : 'No bloquea';
        return '<button type="button" class="pm-fila" aria-pressed="' + (m.id === b.sel) + '" data-acc="m-sel" data-id="' + m.id + '">' +
          '<span class="pm-c pm-c--per"><span class="pm-c__linea"><b class="pm-nom">' + esc(nombre) + '</b>' + (m.menor && !m.oculto ? '<span class="pm-menor">' + ico('privacy') + 'Menor</span>' : '') + '</span><span class="pm-sub pm-num">' + esc(m.oculto ? m.docMask : m.doc) + '</span></span>' +
          '<span class="pm-c pm-c--est">' + tagMedida(m) + '<span class="pm-dias' + (m.porVencer ? ' pm-dias--alerta' : '') + '">' + dias + '</span></span>' +
          '<span class="pm-c pm-num"><span class="pm-fin">' + fmt(m.v.finT) + '</span><span class="pm-sub">' + (m.estado === 'vigente' ? 'Bloquea hasta ese día' : 'Cumplida el ' + fmt(m.v.finT + DIA)) + '</span></span>' +
          '<span class="pm-c pm-c--con"><span class="pm-cortar">' + esc(m.conductas.join(' · ')) + '</span><span class="pm-sub pm-cortar">' + esc(m.corta) + '</span></span>' +
          '<span class="pm-c pm-c--rad pm-num">' + esc(m.entrada) + '</span></button>';
      }).join('') : '<div class="pm-vacio"><b>Sin medidas para esta búsqueda</b><span class="pm-sub">Revise el número completo del documento. Si la persona no aparece, no tiene medidas en la base.</span></div>';

      // Búsqueda y filtros viven en la cabecera de la tabla; el orden, en su última columna (propuesta B).
      return '<div class="pm-cuerpo"><main class="pm-main">' + titulos() +
        '<section class="pm-tabla" aria-label="Medidas"><div class="pm-herr">' +
          '<label class="pm-campo pm-busq"><span class="pm-vh">Buscar por documento o nombre</span><span class="pm-q">' + ico('search') + '<input data-s="b" data-k="q" type="search" autocomplete="off" placeholder="Documento o nombre" value="' + esc(b.q) + '"></span></label>' +
          '<div class="pm-chips" role="group" aria-label="Filtrar por estado">' + chips + '</div></div>' +
          '<div class="pm-cols"><span>Persona</span><span>Estado</span><span>Fin de vigencia</span><span>Conducta</span>' +
            '<label class="pm-orden"><span class="pm-vh">Ordenar por</span><select data-s="b" data-k="orden">' + opciones([['reciente', 'Recientes'], ['fin', 'Vencen antes']], b.orden) + '</select>' + ico('chevron-down') + '</label></div>' +
          '<div class="pm-lista" data-sc="lista">' + cuerpo + '</div>' +
          '<div class="pm-pie"><span>Mostrando ' + filas.length + ' de ' + M.length + ' medidas</span><span class="pm-pie__pag">Página 1 de 1</span></div></section>' +
      '</main>' + panelMedida(sel, b) + '</div>';
    }

    /* ---------- 2 · Radicar medida ---------- */

    function personaDe(r) {
      var menor = r.v.tipo === 'TI';
      var p = menor
        ? { nombre: 'Valentina Ocampo Rueda', nacimiento: '2011-03-11', sexo: 'Mujer', menor: true }
        : { nombre: 'Santiago Herrera Quintero', nacimiento: '2001-03-14', sexo: 'Hombre', menor: false };
      p.edad = edad(p.nacimiento);
      p.docTxt = r.v.tipo + ' ' + r.v.numero;
      p.menorTxt = menor ? 'Sí · ' + p.edad + ' años' : 'No · ' + p.edad + ' años';
      return p;
    }
    function corta(autoridad) { return autoridad.replace(/Inspección de Policía (\d+).*/, 'Inspección $1'); }
    function seleccionadas(r) {
      var c = [];
      C97.forEach(function (x) { if (r.c97[x[0]]) { c.push({ art: 'Art. 97, ' + x[0] + ' · ' + x[1], base: x[1] + ' (art. 97, ' + x[0] + ')' }); } });
      C98.forEach(function (x) { if (r.c98[x[0]]) { c.push({ art: 'Art. 98, ' + x[0] + ' · ' + x[1], base: x[1] + ' (art. 98, ' + x[0] + ')' }); } });
      return c;
    }
    function agravantesDe(r) { return AGR.filter(function (x) { return r.agr[x[0]]; }).map(function (x) { return x[1]; }); }
    function radicadoEstado(r) {
      var e = r.v.entrada || '';
      var ok = /^\d{4}-E-\d{6}$/.test(e);
      var dup = M.filter(function (m) { return m.entrada === e; })[0];
      if (dup) { return { ok: false, tono: 'mal', msg: 'Este radicado ya está en la medida ' + dup.id + '. Revise el oficio.' }; }
      if (ok) { return { ok: true, tono: 'bien', msg: 'Radicado de entrada sin uso en otra medida.' }; }
      return { ok: false, tono: 'mal', msg: 'Formato esperado: 2026-E-000000.' };
    }

    function check(grupo, lista_, r, cols) {
      return '<div class="pm-checks pm-checks--' + cols + '">' + lista_.map(function (x) {
        var on = !!r[grupo][x[0]];
        return '<label class="pm-check' + (on ? ' pm-check--on' : '') + '"><input type="checkbox" data-s="r" data-g="' + grupo + '" data-k="' + x[0] + '"' + (on ? ' checked' : '') + '>' + (grupo === 'agr' ? '' : esc(x[0]) + ' · ') + esc(x[1]) + '</label>';
      }).join('') + '</div>';
    }

    function pasoPersona(r, p) {
      var v = r.v;
      var consulta = r.consultado
        ? '<section class="pm-panel"><div class="pm-ok">' + CHECK + 'Identidad verificada con la Registraduría (ANI) · 29 sep 2026 · 10:21</div>' +
            '<div class="pm-tres"><div class="pm-kv"><span class="pm-sub">Nombre completo</span><span class="pm-kv__v pm-kv__v--g">' + esc(p.nombre) + '</span></div>' + kv('Fecha de nacimiento', fmt(tiempo(p.nacimiento))) + kv('Edad', p.edad + ' años') + '</div>' +
            '<div class="pm-dos"><div class="pm-dato pm-dato--' + (p.menor ? 'azul' : 'gris') + '"><span class="pm-sub">¿Es menor de edad? · calculado</span><b>' + esc(p.menorTxt) + '</b></div>' +
              '<div class="pm-dato pm-dato--gris"><span class="pm-sub">Medidas en la base</span><b>Ninguna registrada</b></div></div></section>'
        : '<div class="pm-hueco">' + ico('info') + '<span>La consulta trae el nombre y la fecha de nacimiento, y con ella se sabe si es menor de edad. De eso depende qué más hay que pedir.</span></div>';
      var rep = r.consultado && p.menor
        ? '<section class="pm-panel pm-panel--azul"><div class="pm-panel__t">' + ico('privacy') + '<h3>Representante legal · obligatorio</h3></div>' +
            '<p class="pm-sub">Los datos del menor y de su representante quedan con reserva reforzada.</p>' +
            '<div class="pm-form3"><label class="pm-campo"><span>Tipo de documento</span>' + lista('r', 'repTipo', ['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte'], v.repTipo === 'CC' ? 'Cédula de ciudadanía' : v.repTipo) + '</label>' +
              campo('Número', entrada('r', 'repDoc', v.repDoc, 'type="text" inputmode="numeric"')) + campo('Nombre completo', entrada('r', 'repNombre', v.repNombre, 'type="text"'), 'pm-campo--ancho') +
              campo('Parentesco', lista('r', 'parentesco', ['Madre', 'Padre', 'Tutor legal'], v.parentesco)) + campo('Teléfono', entrada('r', 'repTel', v.repTel, 'type="tel"')) + campo('Correo', entrada('r', 'repCorreo', v.repCorreo, 'type="email"')) + '</div></section>'
        : '';
      var resto = r.consultado ? '<section class="pm-bloque"><h3 class="pm-h3">Residencia y contacto</h3><div class="pm-form3">' +
          campo('Sexo', lista('r', 'sexo', ['Hombre', 'Mujer', 'Intersexual', 'Prefiero no decirlo'], v.sexo || p.sexo)) + campo('Ciudad de residencia', lista('r', 'ciudad', CIUDADES, v.ciudad)) +
          campo('Dirección', entrada('r', 'direccion', v.direccion, 'type="text"')) + campo('Teléfono · máx. 10 dígitos', entrada('r', 'telefono', v.telefono, 'type="tel" maxlength="10"')) +
          campo('Correo electrónico', entrada('r', 'correo', v.correo, 'type="email"'), 'pm-campo--ancho') + '</div></section>' : '';
      return '<section class="pm-bloque"><h3 class="pm-h3">Documento del infractor</h3><div class="pm-doc">' +
          campo('Tipo de documento', '<select data-s="r" data-k="tipo">' + opciones(DOCS, v.tipo) + '</select>') +
          campo('Número', entrada('r', 'numero', v.numero, 'type="text" inputmode="numeric" autocomplete="off"')) +
          '<button type="button" class="pm-btn pm-btn--pri" data-acc="consultar">' + ico('search') + 'Consultar en la Registraduría</button></div></section>' + consulta + rep + resto;
    }

    function pasoHechos(r) {
      var v = r.v;
      return '<section class="pm-form2">' + campo('Evento deportivo', lista('r', 'evento', EVENTOS, v.evento), 'pm-campo--ancho') +
          campo('Fecha de los hechos', entrada('r', 'fechaHechos', v.fechaHechos, 'type="date"')) +
          '<div class="pm-dato pm-dato--gris"><span class="pm-sub">Competición · del evento</span><b>Liga profesional de fútbol · 2026-II</b></div>' +
          '<div class="pm-dato pm-dato--gris"><span class="pm-sub">Ciudad · del escenario</span><b>Medellín, Antioquia</b></div></section>' +
        '<fieldset class="pm-fs"><legend>Conductas · Ley 1453 de 2011, art. 97</legend>' + check('c97', C97, r, 2) + '</fieldset>' +
        '<fieldset class="pm-fs"><legend>Conductas · art. 98</legend>' + check('c98', C98, r, 3) + '</fieldset>' +
        '<fieldset class="pm-fs"><legend>Agravantes</legend>' + check('agr', AGR, r, 3) + '</fieldset>' +
        campo('Descripción breve de los hechos', '<textarea data-s="r" data-k="descripcion" rows="3">' + esc(v.descripcion) + '</textarea>');
    }

    function pasoSancion(r) {
      var v = r.v, g = vigencia(v.ejecutoria, v.meses);
      var estilo = g.error ? 'mal' : (g.vigente ? 'vigente' : 'cumplida');
      var explica = g.error ? 'La vigencia se calcula cuando la fecha de ejecutoria sea válida.' : g.vigente ? 'Quedará vigente ' + g.dias + ' días más. Al día siguiente del fin pasa sola a cumplida y la persona queda habilitada, sin trámite.' : 'Con esta ejecutoria y estos meses la vigencia ya terminó: se registra como cumplida y no bloquea.';
      return '<section class="pm-form2">' + campo('Autoridad que emite', lista('r', 'autoridad', AUTORIDADES, v.autoridad)) + campo('Acto administrativo o resolución', entrada('r', 'acto', v.acto, 'type="text"')) +
          campo('Fecha de constancia de ejecutoria', entrada('r', 'ejecutoria', v.ejecutoria, 'type="date"' + (g.error ? ' aria-invalid="true" aria-describedby="pm-err-ejec"' : ''))) +
          '<div class="pm-campo"><label for="pm-meses">Tiempo de sanción en meses</label><div class="pm-meses"><button type="button" class="pm-mas" data-acc="menos" aria-label="Restar un mes">−</button>' +
            '<input id="pm-meses" data-s="r" data-k="meses" type="number" min="1" value="' + esc(v.meses) + '"><button type="button" class="pm-mas" data-acc="mas" aria-label="Sumar un mes">+</button></div></div>' +
          campo('Valor de la multa en pesos', entrada('r', 'multa', v.multa, 'type="text" inputmode="numeric"')) + '</section>' +
        (g.error ? '<p class="pm-error" id="pm-err-ejec" role="alert">La fecha de ejecutoria no puede ser posterior a hoy.</p>' : '') +
        '<section class="pm-vig pm-vig--' + estilo + '" aria-label="Vigencia calculada"><div class="pm-vig__top"><span class="pm-vig__t">Se calcula, no se digita</span>' + vigTag(g, true) + '</div>' +
          '<div class="pm-tres pm-tres--fin"><div class="pm-kv"><span class="pm-sub">Ejecutoria</span><span class="pm-vig__v pm-num">' + (g.error ? 'Fecha inválida' : fmt(g.ejecT)) + '</span></div>' +
            '<div class="pm-kv"><span class="pm-sub">Rige desde · día siguiente</span><span class="pm-vig__v pm-num">' + (g.error ? '—' : fmt(g.desdeT)) + '</span></div>' +
            '<div class="pm-kv"><span class="pm-sub">Fin de vigencia · + ' + g.meses + ' meses</span><span class="pm-vig__fin pm-num">' + (g.error ? '—' : fmt(g.finT)) + '</span></div></div>' +
          '<p class="pm-vig__ex">' + esc(explica) + '</p></section>';
    }

    function vigTag(g, largo) {
      if (g.error) { return '<span class="pm-tag pm-tag--r-recibido' + (largo ? ' pm-tag--l' : '') + '">Sin calcular</span>'; }
      return '<span class="pm-tag pm-tag--sol pm-tag--sol-' + (g.vigente ? 'vigente' : 'cumplida') + (largo ? ' pm-tag--l' : '') + '">' + (g.vigente ? 'Vigente' : 'Cumplida') + '</span>';
    }

    function pasoGestion(r) {
      var v = r.v, e = radicadoEstado(r);
      return '<section class="pm-bloque"><h3 class="pm-h3">Radicados de GESDOC</h3><div class="pm-form2">' +
          campo('Radicado de entrada · obligatorio', entrada('r', 'entrada', v.entrada, 'type="text" autocomplete="off" aria-describedby="pm-rad-msg"' + (e.ok ? '' : ' aria-invalid="true"'))) +
          campo('Respuesta al radicado', entrada('r', 'respuesta', v.respuesta, 'type="text" placeholder="Opcional"')) +
          campo('Radicado de financiera', entrada('r', 'financiera', v.financiera, 'type="text" placeholder="Opcional"')) +
          campo('Radicado de jurídica', entrada('r', 'juridica', v.juridica, 'type="text" placeholder="Opcional"')) + '</div>' +
          '<p class="pm-msg pm-msg--' + e.tono + '" id="pm-rad-msg" aria-live="polite">' + (e.ok ? CHECK : ico('caution')) + '<span>' + esc(e.msg) + '</span></p></section>' +
        '<section class="pm-form2">' + campo('Profesional responsable', lista('r', 'profesional', [V.usuario.nombre + ' (usted)', 'Jaime Pardo Ruiz', 'Natalia Suárez Pineda'], v.profesional)) +
          campo('Observaciones', '<textarea data-s="r" data-k="observaciones" rows="3" placeholder="Opcional">' + esc(v.observaciones) + '</textarea>', 'pm-campo--ancho') + '</section>';
    }

    function pasoRevision(r, p) {
      var v = r.v, g = vigencia(v.ejecutoria, v.meses), sel = seleccionadas(r), agr = agravantesDe(r);
      var grupos = [
        ['Persona', 1, [['Nombre', p.nombre], ['Documento', p.docTxt], ['¿Es menor?', p.menorTxt]].concat(p.menor ? [['Representante legal', (v.repNombre || '—') + ' · CC ' + (v.repDoc || '—')]] : [])],
        ['Hechos', 2, [['Evento', v.evento.split(' · ').slice(0, 2).join(' · ')], ['Conductas', sel.map(function (c) { return c.art; }).join(' · ') || '—'], ['Agravantes', agr.join(' · ') || 'Ninguno']]],
        ['Sanción', 3, [['Acto', v.acto + ' · ' + corta(v.autoridad)], ['Ejecutoria', fmt(g.ejecT)], ['Meses y multa', g.meses + ' meses · $ ' + (v.multa || '0')]]],
        ['Gestión', 4, [['Radicado de entrada', v.entrada], ['Respuesta', v.respuesta || '—'], ['Profesional', v.profesional.replace(' (usted)', '')]]]
      ];
      return '<section class="pm-final pm-final--' + (g.vigente ? 'vigente' : 'cumplida') + '"><span class="pm-vig__t">Al radicar</span><b class="pm-final__f">' + (g.vigente ? 'Quedará vigente hasta el ' + fmt(g.finT) : 'Quedará registrada como cumplida') + '</b>' +
          '<span>' + (g.vigente ? 'Bloquea la compra, la asignación y el ingreso en todos los escenarios del país desde el ' + fmt(g.desdeT) + '.' : 'No bloquea: queda como antecedente en la base.') + '</span></section>' +
        grupos.map(function (x) {
          return '<section class="pm-resumen"><div class="pm-resumen__cab"><h3 class="pm-h3">' + x[0] + '</h3><button type="button" class="pm-link" data-acc="paso" data-n="' + x[1] + '">Cambiar<span class="pm-vh"> ' + x[0].toLowerCase() + '</span></button></div>' +
            '<div class="pm-tres">' + x[2].map(function (c) { return kv(c[0], c[1]); }).join('') + '</div></section>';
        }).join('') +
        '<label class="pm-confirma"><input type="checkbox" data-s="r" data-k="confirmo"' + (v.confirmo ? ' checked' : '') + '>Confirmo que los datos corresponden al acto administrativo y al oficio de entrada. Después de radicar, cada cambio queda en el historial con su soporte.</label>';
    }

    function puedeAvanzar(r, p) {
      var v = r.v, g = vigencia(v.ejecutoria, v.meses);
      var repOk = !p.menor || (v.repDoc && v.repNombre);
      var puede = { 1: r.consultado && repOk, 2: seleccionadas(r).length > 0, 3: !g.error && !!v.acto, 4: radicadoEstado(r).ok, 5: !!v.confirmo };
      var motivo = {
        1: !r.consultado ? 'Consulte primero en la Registraduría.' : (!repOk ? 'Falta el representante legal del menor.' : ''),
        2: puede[2] ? '' : 'Seleccione al menos una conducta.',
        3: g.error ? 'Corrija la fecha de ejecutoria.' : (v.acto ? '' : 'Falta el acto administrativo.'),
        4: puede[4] ? '' : 'Revise el radicado de entrada.',
        5: v.confirmo ? '' : 'Confirme para radicar.'
      };
      return { ok: puede[r.paso], msg: motivo[r.paso], todos: puede };
    }

    function vistaRadicar() {
      var r = st.rad, p = personaDe(r), v = r.v, g = vigencia(v.ejecutoria, v.meses), sel = seleccionadas(r);
      var pa = puedeAvanzar(r, p);
      var pasos = PASOS.map(function (x, i) {
        var n = i + 1, actual = n === r.paso, hecho = n < r.max || n < r.paso, bloqueado = n > r.max;
        return '<li><button type="button" class="pm-paso' + (hecho && !actual ? ' pm-paso--hecho' : '') + '" data-acc="paso" data-n="' + n + '"' + (actual ? ' aria-current="step"' : '') + (bloqueado ? ' disabled' : '') + '>' +
          '<span class="pm-paso__n">' + (hecho && !actual ? CHECK : n) + '</span><span class="pm-paso__t"><b>' + x[0] + '</b><span class="pm-sub">' + x[1] + '</span></span></button></li>';
      }).join('');
      var lado = '<aside class="pm-lado" aria-label="Resumen de la medida"><section class="pm-tarjeta"><h2 class="pm-sec__h">Así queda la medida</h2>' +
          '<div class="pm-kv"><span class="pm-sub">Infractor</span><span class="pm-kv__v pm-kv__v--g">' + esc(r.consultado ? p.nombre : 'Sin consultar') + '</span><span class="pm-sub">' + esc(p.docTxt + (r.consultado && p.menor ? ' · menor de edad' : '')) + '</span></div>' +
          '<div class="pm-kv"><span class="pm-sub">Conductas</span><span class="pm-kv__v">' + esc(sel.map(function (c) { return c.art; }).join(' · ') || 'Sin seleccionar') + '</span></div>' +
          '<div class="pm-kv"><span class="pm-sub">Sanción</span><span class="pm-kv__v">' + g.meses + ' meses · ' + (v.multa ? '$ ' + esc(v.multa) : 'sin multa') + '</span></div>' +
          '<div class="pm-caja pm-caja--' + (g.error ? 'gris' : g.vigente ? 'vigente' : 'cumplida') + '">' +
            '<div class="pm-kv"><span class="pm-sub">Vigencia calculada</span><span class="pm-kv__v pm-num">' + (g.error ? 'Sin calcular' : fmt(g.desdeT) + ' – ' + fmt(g.finT)) + '</span></div>' +
            '<div class="pm-kv"><span class="pm-sub">Estado</span>' + vigTag(g) + '</div></div>' +
          '<div class="pm-kv"><span class="pm-sub">Alcance</span><span class="pm-kv__v">Nacional · todos los escenarios con público</span></div></section>' +
        '<section class="pm-tarjeta pm-tarjeta--of"><h2 class="pm-sec__h">Oficio de entrada</h2><div class="pm-oficio"><span class="pm-oficio__i">' + ico('file') + '</span>' +
          '<span class="pm-kv"><b class="pm-num">' + esc(v.entrada) + '</b><span class="pm-sub">Recibido en GESDOC · 26 sep 2026</span></span></div></section></aside>';

      var principal;
      if (r.hecho) {
        var n = r.nueva;
        principal = '<div class="pm-exito"><span class="pm-exito__i">' + CHECK.replace('width="18" height="18"', 'width="36" height="36"') + '</span>' +
          '<div><h2 class="pm-exito__h" tabindex="-1" id="pm-exito">Medida ' + esc(n.id) + ' radicada</h2><p class="pm-exito__p">' + esc(n.nombre) + ' · ' + esc(n.doc) + '</p></div>' +
          '<div class="pm-dos pm-dos--exito"><div class="pm-dato pm-dato--' + (n.estado === 'vigente' ? 'rojo' : 'verde') + '"><span class="pm-sub">Estado</span><b>' + (n.estado === 'vigente' ? 'Vigente' : 'Cumplida') + ' hasta el ' + fmt(n.v.finT) + '</b></div>' +
            '<div class="pm-dato pm-dato--gris"><span class="pm-sub">Radicado de entrada</span><b class="pm-num">' + esc(n.entrada) + '</b></div></div>' +
          '<p class="pm-sub pm-exito__n">Desde ahora la comercializadora recibe un no al vender o asignar, y la puerta da rojo por medida. Las boletas que la persona ya tenga quedan anuladas o congeladas.</p>' +
          '<div class="pm-acciones"><button type="button" class="pm-btn pm-btn--pri" data-acc="ver-nueva">Ver en la base de medidas</button><button type="button" class="pm-btn" data-acc="reiniciar">Radicar otra medida</button></div></div>';
      } else {
        var cuerpo = [pasoPersona, pasoHechos, pasoSancion, pasoGestion, pasoRevision][r.paso - 1](r, p);
        principal = '<div class="pm-paso-cab"><h2 class="pm-h2">' + PASOS[r.paso - 1][2] + '</h2><span class="pm-sub pm-fuerte">Paso ' + r.paso + ' de 5</span></div>' +
          '<div class="pm-form" data-sc="form">' + cuerpo + '</div>' +
          '<div class="pm-pieform">' + (r.paso > 1 ? '<button type="button" class="pm-btn" data-acc="anterior">Anterior</button>' : '') + '<span class="pm-sub pm-pieform__msg" aria-live="polite">' + esc(pa.msg) + '</span>' +
            '<button type="button" class="pm-btn ' + (r.paso === 5 ? 'pm-btn--rojo' : 'pm-btn--pri') + ' pm-pieform__sig" data-acc="siguiente"' + (pa.ok ? '' : ' disabled') + '>' + (r.paso === 5 ? 'Radicar medida' : 'Continuar') + '</button></div>';
      }
      return '<div class="pm-cuerpo pm-cuerpo--radicar"><nav class="pm-pasos" aria-label="Pasos de la radicación"><div class="pm-pasos__cab">' +
          '<p class="pm-sub">A partir del oficio de entrada y del acto administrativo de la autoridad de policía.</p></div><ol class="pm-pasos__lista">' + pasos + '</ol></nav>' +
        '<main class="pm-radicar' + (r.hecho ? ' pm-radicar--exito' : '') + '">' + principal + '</main>' + lado + '</div>';
    }

    function radicar() {
      var r = st.rad, p = personaDe(r), v = r.v, g = vigencia(v.ejecutoria, v.meses), sel = seleccionadas(r);
      var acto = /(\d+) de (\d{4})/.exec(v.acto);
      var n = completar({
        id: 'MC-2026-0913', persona: 'p-nueva', nombre: p.nombre, iniciales: iniciales(p.nombre), doc: p.docTxt, docMask: v.tipo + ' •••• ' + digitos(v.numero).slice(-4), menor: p.menor,
        conductas: sel.map(function (c) { return c.base; }), agravantes: agravantesDe(r), evento: v.evento.split(' · ').filter(function (x, i) { return i !== 1; }).join(' · '), hechos: v.fechaHechos,
        ciudad: 'Medellín, Antioquia', competicion: 'Liga profesional de fútbol · 2026-II', acto: v.acto, autoridad: v.autoridad, corta: (acto ? 'Res. ' + acto[1] + '/' + acto[2] : v.acto) + ' · ' + corta(v.autoridad),
        ejecutoria: v.ejecutoria, meses: g.meses, multa: v.multa ? '$ ' + v.multa : 'Sin multa', nacimiento: p.nacimiento, sexo: v.sexo || p.sexo, residencia: v.ciudad, contacto: v.telefono ? v.telefono.slice(0, 3) + ' •••• ' + v.telefono.slice(-3) : '—',
        descripcion: v.descripcion, radicada: V.hoy, entrada: v.entrada, respuesta: v.respuesta || '—', financiera: v.financiera || '—', juridica: v.juridica || '—', profesional: v.profesional.replace(' (usted)', ''),
        rep: p.menor ? [{ k: 'Nombre', v: v.repNombre }, { k: 'Documento', v: v.repTipo === 'CC' ? 'CC ' + v.repDoc : v.repDoc }, { k: 'Parentesco', v: v.parentesco }, { k: 'Teléfono', v: v.repTel || '—' }] : []
      });
      r.nueva = n;
      M.push(n);
      r.hecho = true;
      scr.form = 0;
    }

    /* ---------- 3 · Reportes de entidades ---------- */

    function evidenciaDe(rp) {
      var e = rp.evid || {}, out = [{ nombre: 'Informe de logística', meta: 'PDF · 3 páginas' }];
      if (e.vid) { out.push({ nombre: 'Video de la cámara de la tribuna', meta: 'MP4 · 00:42' }); }
      if (e.fot) { out.push({ nombre: 'Fotografías', meta: e.fot + (e.fot === 1 ? ' imagen' : ' imágenes') }); }
      return out;
    }
    function medidaRef(id) { return M.filter(function (m) { return m.id === id; })[0]; }
    function anotar(rp, cambio, texto, punto) {
      Object.assign(rp, cambio);
      rp.historial.push({ fecha: '29 sep 2026', texto: texto, quien: V.usuario.nombre + ' (usted)', punto: punto });
    }

    function vistaReportes() {
      var s = st.rep, q = s.q.trim().toLowerCase();
      var limite = HOY - 90 * DIA, anio = Date.UTC(2026, 0, 1);
      var buscados = RP.filter(function (r) {
        var d = digitos(q);
        var okQ = !q || r.id.toLowerCase().indexOf(q) >= 0 || (d.length >= 4 && digitos(r.doc).indexOf(d) >= 0) || (digitos(r.id).indexOf(d) >= 0 && d.length >= 7);
        var t = tiempo(r.iso);
        return okQ && (!s.entidad || r.entidad === s.entidad) && (s.periodo === 'todo' || (s.periodo === '90' ? t >= limite : t >= anio));
      });
      var filas = buscados.filter(function (r) { return s.filtro === 'todos' || r.estado === s.filtro; });
      var r = RP.filter(function (x) { return x.id === s.sel; })[0] || null;
      var chips = [chip('r-filtro', 'todos', s.filtro === 'todos', 'Todos', 'negro', buscados.length)].concat(['enviado', 'recibido', 'tramite', 'derivo', 'archivado'].map(function (k) {
        return chip('r-filtro', k, s.filtro === k, ETAPAS[k].label, k, buscados.filter(function (x) { return x.estado === k; }).length);
      })).join('');
      var cuerpo = filas.length ? filas.map(function (x) {
        var ev = evidenciaDe(x);
        return '<button type="button" class="pm-fila pm-fila--rep" aria-pressed="' + (!!r && x.id === r.id) + '" data-acc="r-sel" data-id="' + x.id + '">' +
          '<span class="pm-c pm-num"><span class="' + (x.estado === 'enviado' ? 'pm-fuerte' : 'pm-med') + '">' + x.id + '</span><span class="pm-sub">' + x.fecha + '</span></span>' +
          '<span class="pm-c"><b class="pm-nom' + (x.estado === 'enviado' ? '' : ' pm-nom--med') + '">' + esc(x.nombre) + '</b><span class="pm-sub pm-num">' + esc(x.doc) + '</span></span>' +
          '<span class="pm-c pm-c--ent"><span class="pm-cortar">' + esc(x.entidad) + '</span><span class="pm-sub pm-cortar">' + esc(x.corto) + '</span></span>' +
          '<span class="pm-c pm-c--con"><span class="pm-cortar">' + esc(x.conductas.join(' · ')) + '</span><span class="pm-sub">' + ev.length + ' archivos de evidencia</span></span>' +
          '<span class="pm-c">' + tagReporte(x.estado) + '</span></button>';
      }).join('') : '<div class="pm-vacio"><b>Sin reportes con estos filtros</b><span class="pm-sub">Cambie el estado, la entidad o el periodo.</span></div>';

      // Mismo patrón que la base: herramientas en la cabecera de la tabla; los chips bajan a su propia línea.
      return '<div class="pm-cuerpo"><main class="pm-main">' + titulos() +
        '<section class="pm-tabla" aria-label="Reportes"><div class="pm-herr">' +
          '<label class="pm-campo pm-busq"><span class="pm-vh">Buscar por documento o número de reporte</span><span class="pm-q">' + ico('search') + '<input data-s="p" data-k="q" type="search" autocomplete="off" placeholder="Documento o n.º de reporte" value="' + esc(s.q) + '"></span></label>' +
          '<label class="pm-campo pm-filtro"><span class="pm-vh">Entidad</span><select data-s="p" data-k="entidad"><option value="">Todas las entidades</option>' + opciones(ENTIDADES, s.entidad) + '</select></label>' +
          '<label class="pm-campo pm-filtro"><span class="pm-vh">Periodo</span><select data-s="p" data-k="periodo">' + opciones([['todo', 'Todo el historial'], ['90', 'Últimos 90 días'], ['anio', 'Este año']], s.periodo) + '</select></label>' +
          '<div class="pm-chips pm-chips--fila" role="group" aria-label="Filtrar por estado">' + chips + '</div></div>' +
          '<div class="pm-cols pm-cols--rep" aria-hidden="true"><span>Reporte</span><span>Persona</span><span class="pm-c--ent">Entidad · evento</span><span class="pm-c--con">Conductas</span><span>Estado</span></div>' +
          '<div class="pm-lista" data-sc="lista">' + cuerpo + '</div>' +
          '<div class="pm-pie"><span>Mostrando ' + filas.length + ' de ' + RP.length + ' reportes</span></div></section>' +
      '</main>' + panelReporte(r, s) + '</div>';
    }

    function panelReporte(r, s) {
      if (!r) { return '<aside class="pm-detalle pm-detalle--vacio" aria-label="Detalle del reporte"><p class="pm-sub">Elija un reporte de la lista para ver su detalle.</p></aside>'; }
      var n = ETAPAS[r.estado].orden;
      var fin = r.estado === 'archivado' ? 'Archivado' : 'Derivó en medida';
      var pista = ['Enviado', 'Recibido', 'En trámite', fin].map(function (l, i) {
        var clase = i <= n ? (i === 3 ? (r.estado === 'derivo' ? 'rojo' : 'gris') : 'azul') : 'off';
        return '<li class="pm-pista__i' + (i === n ? ' pm-pista__i--ahora' : '') + '"' + (i === n ? ' aria-current="step"' : '') + '><span class="pm-pista__b pm-pista__b--' + clase + '"></span><span>' + l + '</span></li>';
      }).join('');
      var abierto = r.estado === 'recibido' || r.estado === 'tramite';
      var cands = (r.candidatas || []).map(medidaRef).filter(Boolean);
      var med = r.medida ? medidaRef(r.medida) : null;
      var arch = s.archivando && abierto;
      var enlazar = abierto && !arch ? seccion('Medidas de esta persona en la base', cands.map(function (m) {
        return '<div class="pm-cand"><span class="pm-cand__t"><b>' + m.id + ' · ' + esc(m.conductas.join(' · ')) + '</b><span class="pm-sub">' + esc(m.acto) + ' · hechos del ' + fmt(tiempo(m.hechos)) + ' · vigente hasta el ' + fmt(m.v.finT) + '</span></span>' +
          '<button type="button" class="pm-btn pm-btn--pri" data-acc="enlazar" data-id="' + m.id + '">Enlazar</button></div>';
      }).join('') + (cands.length ? '' : '<div class="pm-hueco pm-hueco--col"><span>No hay medidas de esta persona en la base. Si la autoridad emite el acto, radíquelo y enlácelo desde aquí.</span><button type="button" class="pm-link" data-acc="ir-radicar">Radicar medida</button></div>')) : '';
      var archivar = arch ? '<section class="pm-panel"><h3 class="pm-h3">Archivar con motivo</h3>' +
        '<label class="pm-campo">Motivo<select data-s="p" data-k="motivo"><option value="">Seleccione un motivo</option>' + opciones(MOTIVOS_ARCHIVO, s.motivo) + '</select></label>' +
        '<label class="pm-campo">Soporte u observación<textarea data-s="p" data-k="nota" rows="2" placeholder="Ej.: oficio de la inspección con su radicado">' + esc(s.nota) + '</textarea></label>' +
        '<div class="pm-acciones pm-acciones--par"><button type="button" class="pm-btn" data-acc="cancelar-archivo">Cancelar</button><button type="button" class="pm-btn pm-btn--pri" data-acc="archivar"' + (s.motivo ? '' : ' disabled') + '>Archivar reporte</button></div></section>' : '';
      return '<aside class="pm-detalle" aria-label="Detalle del reporte">' +
        '<div class="pm-detalle__cab"><div class="pm-detalle__top">' + tagReporte(r.estado, true) + '<span class="pm-sub pm-num">Reporte ' + r.id + '</span>' +
            '<button type="button" class="pm-cerrar" data-acc="cerrar-reporte" aria-label="Cerrar detalle">' + ico('close') + '</button></div>' +
          '<div><h2 class="pm-detalle__h">' + esc(r.nombre) + '</h2><p class="pm-sub pm-num">' + esc(r.doc) + ' · reportado por ' + esc(r.entidad) + '</p></div>' +
          '<ol class="pm-pista" aria-label="Estado del reporte">' + pista + '</ol></div>' +
        '<div class="pm-detalle__cuerpo" data-sc="det">' +
          '<div class="pm-aviso pm-aviso--gris">' + ico('info') + '<span>' + (r.estado === 'derivo' ? 'Lo que bloquea es la medida enlazada, no este reporte.' : 'Este reporte no bloquea compras, asignaciones ni ingresos por sí solo.') + '</span></div>' +
          seccion('Lo que reporta la entidad', '<div class="pm-kvs">' + kv('Evento', r.evento, true) + kv('Fecha de los hechos', r.hechos) + kv('Autoridad que recibió', r.autoridad) + '</div>' +
            '<div class="pm-pills">' + r.conductas.map(function (c) { return '<span class="pm-pill">' + esc(c) + '</span>'; }).join('') + '</div><p class="pm-texto">' + esc(r.descripcion) + '</p>') +
          seccion('Evidencia', evidenciaDe(r).map(function (e) {
            return '<button type="button" class="pm-evid" data-acc="evidencia" data-id="' + esc(e.nombre) + '"><span class="pm-evid__i">' + ico('file') + '</span><span class="pm-kv"><b>' + esc(e.nombre) + '</b><span class="pm-sub">' + esc(e.meta) + '</span></span><span class="pm-evid__a">Abrir</span></button>';
          }).join('')) +
          (r.estado === 'derivo' && med ? '<section class="pm-derivo"><span class="pm-sec__h pm-sec__h--rojo">Enlazado a la medida</span><b>' + med.id + ' · ' + esc(med.conductas.join(' · ')) + '</b><span>' + esc(med.acto) + ' · ' + (med.estado === 'vigente' ? 'vigente' : 'cumplida') + ' hasta el ' + fmt(med.v.finT) + '</span>' +
            '<button type="button" class="pm-btn pm-btn--rojo-o" data-acc="ver-medida" data-id="' + med.id + '">Ver la medida</button></section>' : '') +
          (r.estado === 'archivado' ? '<section class="pm-archivado"><span class="pm-sec__h">Archivado · motivo</span><b>' + esc(r.motivoArchivo) + '</b><span>' + esc(r.notaArchivo) + '</span></section>' : '') +
          enlazar + archivar + seccion('Historial', historial(r.historial)) +
        '</div>' +
        (abierto && !arch ? '<div class="pm-acciones pm-acciones--pie">' + (r.estado === 'recibido' ? '<button type="button" class="pm-btn pm-btn--pri" data-acc="a-tramite">Autoridad abrió procedimiento</button>' : '') +
          '<button type="button" class="pm-btn" data-acc="abrir-archivo">Archivar con motivo</button></div>' : '') +
      '</aside>';
    }

    /* ---------- Marco del demo ---------- */

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">Registro de medidas<span slot="subtitle">Profesional del IVC · Mindeporte</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }
    function tarjeta(titulo, cuerpo) { return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function guion() {
      var probar = [
        ['g-radicar', 'file', 'informative', 'Radicar una medida'],
        ['g-menor-ti', 'privacy', 'informative', 'Radicar con TI (menor)'],
        ['g-duplicado', 'caution', 'negative', 'Radicado duplicado'],
        ['g-futura', 'calendar', 'negative', 'Ejecutoria futura'],
        ['g-menor', 'privacy', 'informative', 'Ver un menor'],
        ['g-julian', 'search', 'negative', 'Buscar a Julián Posada'],
        ['g-reporte', 'notification', 'informative', 'Reporte nuevo de un club']
      ].map(function (p) { return '<nwt-detail-item actionable icon="' + p[1] + '" nwt-theme="' + p[2] + '" data-acc="' + p[0] + '">' + esc(p[3]) + '</nwt-detail-item>'; }).join('');
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
    function contenido() {
      return '<div class="pp-app pm-app">' + barra() + (st.vista === 'base' ? vistaBase() : st.vista === 'radicar' ? vistaRadicar() : vistaReportes()) + toast() + '</div>';
    }

    /* ---------- Pintado: conserva foco y scroll al repintar ---------- */

    function clave(el) {
      var d = el.dataset || {};
      if (d.k) { return 'k:' + d.s + ':' + (d.g || '') + ':' + d.k; }
      if (d.acc) { return 'a:' + d.acc + ':' + (d.id || d.n || ''); }
      return null;
    }

    function pintar() {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      disp.querySelectorAll('[data-sc]').forEach(function (el) { scr[el.dataset.sc] = el.scrollTop; });
      var pie = st.disp === 'consola' ? '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>' : '';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + st.disp + '"><div class="pp-pantalla">' + cromo() + contenido() + '</div></div>' + pie + '</div>';
      disp.querySelectorAll('[data-sc]').forEach(function (el) { el.scrollTop = scr[el.dataset.sc] || 0; });
      if (scrollSel) {
        scrollSel = false;
        var f = disp.querySelector('.pm-fila[aria-pressed="true"]');
        if (f) { f.scrollIntoView({ block: 'nearest' }); }
      }
      if (kf) {
        var els = disp.querySelectorAll('[data-k],[data-acc]');
        for (var i = 0; i < els.length; i++) {
          if (clave(els[i]) === kf && !els[i].disabled) {
            els[i].focus({ preventScroll: true });
            try { if (sel) { els[i].setSelectionRange(sel[0], sel[1]); } } catch (e) { /* tipo sin selección */ }
            break;
          }
        }
      }
      escalar();
    }

    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - 88) / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }

    function mostrarToast(t, m, th, i) {
      st.toast = { t: t, m: m, th: th || 'positive', i: i || 'positive' };
      pintar();
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; pintar(); }, 3200);
    }

    /* ---------- Acciones ---------- */

    function irVista(v) { if (v === 'radicar' && st.vista !== 'radicar') { st.origen = st.vista; } st.vista = v; scr.lista = 0; scr.det = 0; scr.form = 0; scrollSel = v !== 'radicar'; pintar(); }
    function reiniciarRad() { st.rad = nuevaRadicacion(); scr.form = 0; }
    function seleccionarMedida(id) { st.base.sel = id; st.base.motivo = ''; scr.det = 0; }

    function abrirReporte(id) {
      var s = st.rep, rp = RP.filter(function (x) { return x.id === id; })[0];
      s.sel = id; s.archivando = false; s.motivo = ''; s.nota = ''; scr.det = 0;
      // Abrir un reporte nuevo es recibirlo: queda en su historial.
      if (rp.estado === 'enviado') { anotar(rp, { estado: 'recibido' }, 'Recibido por el IVC al abrirlo', 'gris'); }
    }

    function irRad(paso) {
      var r = st.rad;
      if (paso > r.max || paso < 1) { return; }
      r.paso = paso; scr.form = 0;
    }

    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom]');
      if (!el) { return; }
      var d = el.dataset, b = st.base, r = st.rad, s = st.rep;
      if (d.zoom) {
        zoom = d.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15);
        escalar();
        return;
      }
      if (el.disabled) { return; }
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'vista': irVista(d.id); return;
        case 'ir-radicar': irVista('radicar'); return;
        case 'volver': irVista(st.origen); return;
        // Base
        case 'm-filtro': b.filtro = d.id; break;
        case 'm-sel': seleccionarMedida(d.id); break;
        case 'cerrar-detalle': b.sel = null; break;
        case 'abrir-menor':
          if (!b.motivo) { return; }
          b.abiertos[b.sel] = b.motivo; b.motivo = '';
          break;
        // Radicar
        case 'consultar': r.consultado = true; break;
        case 'paso': irRad(+d.n); break;
        case 'anterior': irRad(r.paso - 1); break;
        case 'siguiente':
          if (!puedeAvanzar(r, personaDe(r)).ok) { return; }
          if (r.paso === 5) { radicar(); pintar(); var h = disp.querySelector('#pm-exito'); if (h) { h.focus({ preventScroll: true }); } return; }
          r.paso += 1; r.max = Math.max(r.max, r.paso); scr.form = 0;
          break;
        case 'menos': r.v.meses = Math.max(1, (parseInt(r.v.meses, 10) || 1) - 1); break;
        case 'mas': r.v.meses = (parseInt(r.v.meses, 10) || 0) + 1; break;
        case 'reiniciar': reiniciarRad(); break;
        case 'ver-nueva': b.sel = r.nueva.id; b.filtro = 'todas'; b.q = ''; irVista('base'); return;
        // Reportes
        case 'r-filtro': s.filtro = d.id; break;
        case 'r-sel': abrirReporte(d.id); break;
        case 'cerrar-reporte': s.sel = null; s.archivando = false; s.motivo = ''; s.nota = ''; break;
        case 'evidencia': mostrarToast(d.id, 'En el prototipo la evidencia no se descarga.', 'informative', 'info'); return;
        case 'a-tramite': anotar(RP.filter(function (x) { return x.id === s.sel; })[0], { estado: 'tramite' }, 'La autoridad abrió procedimiento', 'amarillo'); break;
        case 'abrir-archivo': s.archivando = true; break;
        case 'cancelar-archivo': s.archivando = false; s.motivo = ''; s.nota = ''; break;
        case 'archivar':
          if (!s.motivo) { return; }
          var rp = RP.filter(function (x) { return x.id === s.sel; })[0];
          anotar(rp, { estado: 'archivado', motivoArchivo: s.motivo, notaArchivo: s.nota || 'Sin observación.' }, 'Archivado · ' + s.motivo.toLowerCase(), 'gris');
          s.archivando = false; s.motivo = ''; s.nota = '';
          mostrarToast('Reporte archivado', rp.id + ' · ' + rp.motivoArchivo, 'positive', 'positive');
          return;
        case 'enlazar':
          var rq = RP.filter(function (x) { return x.id === s.sel; })[0];
          anotar(rq, { estado: 'derivo', medida: d.id }, 'Enlazado a la medida ' + d.id, 'rojo');
          mostrarToast('Reporte enlazado', rq.id + ' quedó enlazado a la medida ' + d.id + '.', 'positive', 'positive');
          return;
        case 'ver-medida': seleccionarMedida(d.id); b.filtro = 'todas'; b.q = ''; irVista('base'); return;
        // Atajos del panel del demo
        case 'g-radicar': reiniciarRad(); irVista('radicar'); return;
        case 'g-menor-ti': reiniciarRad(); r = st.rad; r.v.tipo = 'TI'; r.v.numero = '1.021.998.406'; irVista('radicar'); return;
        case 'g-duplicado': prepararRad(4, function (x) { x.v.entrada = '2025-E-041872'; }); return;
        case 'g-futura': prepararRad(3, function (x) { x.v.ejecutoria = '2026-10-15'; }); return;
        case 'g-menor': b.q = ''; b.filtro = 'menores'; seleccionarMedida('MC-2026-0802'); irVista('base'); return;
        case 'g-julian': b.q = '71.894.447'; b.filtro = 'todas'; seleccionarMedida('MC-2025-0831'); irVista('base'); return;
        case 'g-reporte': st.rep = { sel: 'R-2026-0412', filtro: 'todos', q: '', entidad: '', periodo: 'todo', archivando: false, motivo: '', nota: '' }; irVista('reportes'); return;
      }
      pintar();
    }

    // Deja la radicación lista en un paso para probar un error sin recorrer los anteriores.
    function prepararRad(paso, ajuste) {
      reiniciarRad();
      var r = st.rad;
      r.consultado = true; r.c97 = { '4': true }; r.paso = paso; r.max = 5;
      ajuste(r);
      irVista('radicar');
    }

    function porCampo(el) {
      var d = el.dataset, val = el.type === 'checkbox' ? el.checked : el.value;
      if (d.s === 'b') { st.base[d.k] = val; if (d.k === 'q') { scr.lista = 0; } return true; }
      if (d.s === 'p') { st.rep[d.k] = val; if (d.k === 'q' || d.k === 'entidad' || d.k === 'periodo') { scr.lista = 0; } return true; }
      if (d.s !== 'r') { return false; }
      var r = st.rad;
      if (d.g) { r[d.g][d.k] = val; return true; }
      r.v[d.k] = val;
      if (d.k === 'tipo') { r.v.numero = val === 'TI' ? '1.021.998.406' : '1.000.873.265'; r.consultado = false; }
      if (d.k === 'numero') { r.consultado = false; }
      return true;
    }

    var TEXTO = /^(text|search|number|tel|email|)$/;
    function onInput(ev) {
      var el = ev.target;
      if (!el.dataset || !el.dataset.k) { return; }
      var texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (texto && porCampo(el)) { pintar(); }
    }
    // Selects, casillas y fechas confirman con `change`; el texto ya se atendió en `input`.
    function onCambio(ev) {
      var el = ev.target;
      if (!el.dataset || !el.dataset.k) { return; }
      if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type))) { return; }
      if (porCampo(el)) { pintar(); }
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' +
        '<div class="pp-zoom">' +
          '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
          '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
        '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('Registro de medidas');
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
      clearTimeout(timerToast);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('change', onCambio);
      raiz.removeEventListener('input', onInput);
      window.removeEventListener('resize', escalar);
    };
  };
})();
