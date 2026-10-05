/* Superficie 6 · API y portal de integración. Modelo en modeling/desing-views/06-api-portal-integracion.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(n) { return '<nwt-icon value="' + n + '"></nwt-icon>'; }
  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

  var COM = 'Graderío';
  var BASE = { pruebas: 'https://api.pruebas.svn.example/v1', produccion: 'https://api.svn.example/v1' };
  var CODIGOS = [
    { c: 'LIMITE_VENTA_EXCEDIDO', n: 'Límite de venta excedido', cuando: 'Pide más de 5 boletas para el evento, sumando las de todas las comercializadoras.', pantalla: 'Sí se puede explicar: «Máximo 5 boletas por persona para este evento» y ofrecer cambiar la cantidad.' },
    { c: 'MEDIDA_RESTRICTIVA_VIGENTE', n: 'Medida restrictiva vigente', cuando: 'La persona tiene una medida correctiva vigente.', pantalla: 'Mensaje genérico: «No es posible continuar. Consulta tu estado en tu portal.» Nunca el motivo.' },
    { c: 'DOCUMENTO_NO_VALIDO', n: 'Documento no válido', cuando: 'El documento no existe en el ANI o está cancelado. Nombre por definir.', pantalla: 'Mensaje genérico. No digas que el documento está cancelado.' },
    { c: 'IDENTIDAD_NO_COINCIDE', n: 'Identidad no coincide', cuando: 'El nombre no corresponde al documento. Nombre por definir.', pantalla: 'Pide revisar los datos, hasta 3 intentos; después, mensaje genérico.' }
  ];
  var ERRORES = [
    ['401', 'LLAVE_INVALIDA', 'La llave no existe, está revocada o venció su período de gracia.'],
    ['403', 'COMERCIALIZADORA_NO_HABILITADA', 'No estás homologada, o estás suspendida, en este entorno.'],
    ['422', 'SOLICITUD_INVALIDA', 'Falta un campo o el formato no es el esperado. Se indica cuál.'],
    ['429', 'LIMITE_DE_SOLICITUDES', 'Superaste las solicitudes por minuto de tu llave. Espera y reintenta.'],
    ['503', 'SERVICIO_NO_DISPONIBLE', 'El servicio o una de sus dependencias no responde. Reintenta con espera.']
  ];
  var DOC_PERSONA = [['documento.tipo', 'texto', 'Sí', 'CC, TI, CE, PA, PPT, PEP o RUMV.'], ['documento.numero', 'texto', 'Sí', 'Solo dígitos, sin puntos.']];
  var PUNTOS = {
    compra1: { rot: '¿Puede comprar? · al identificarse', ruta: 'POST /v1/validaciones/compra' },
    compra2: { rot: '¿Puede comprar? · al pagar', ruta: 'POST /v1/validaciones/compra' },
    recibir: { rot: '¿Puede recibir esta boleta?', ruta: 'POST /v1/validaciones/recepcion' },
    transferir: { rot: '¿Puede transferir?', ruta: 'POST /v1/validaciones/transferencia' },
    boleta: { rot: 'Registrar boleta', ruta: 'POST /v1/boletas' },
    estado: { rot: 'Estado del escenario', ruta: 'GET /v1/escenarios/{id}/estado' }
  };
  var ENDPOINTS = [
    { id: 'compra', punto: 'Punto 1', titulo: '¿Puede comprar?', met: 'POST', ruta: '/validaciones/compra',
      cuando: 'Se llama dos veces en cada compra. Con fase "identificacion" cuando la persona se identifica (consulta 1) y con fase "pago" justo antes de cobrar (consulta 2): esta revalida con la reserva porque el estado pudo cambiar. Solo la segunda emite el token.',
      req: [['fase', 'texto', 'Sí', '"identificacion" o "pago".']].concat(DOC_PERSONA, [['nombre', 'texto', 'Sí', 'Como aparece en el documento. Se coteja con el ANI.'], ['evento_id', 'texto', 'Sí', 'El evento que se va a comprar.'], ['cantidad', 'entero', 'Sí', 'Boletas que pide, de 1 a 5.'], ['reserva_id', 'texto', 'Con "pago"', 'La reserva que se está pagando.']]),
      ejemplo: { fase: 'identificacion', documento: { tipo: 'CC', numero: '1037512884' }, nombre: 'Camilo Andrés Vélez Soto', evento_id: 'EV-2026-0412', cantidad: 2 },
      resp: [['Autorizado', 200, { resultado: 'autorizado', codigo: null, consulta_id: 'con_7f3a9c21' }], ['Autorizado al pagar', 200, { resultado: 'autorizado', codigo: null, token: 'tok_c91e04aa7b', consulta_id: 'con_7f3a9c58' }], ['Denegado · límite', 200, { resultado: 'denegado', codigo: 'LIMITE_VENTA_EXCEDIDO', consulta_id: 'con_7f3a9c33' }], ['Denegado · medida', 200, { resultado: 'denegado', codigo: 'MEDIDA_RESTRICTIVA_VIGENTE', consulta_id: 'con_7f3a9c40' }]] },
    { id: 'recepcion', punto: 'Punto 2', titulo: '¿Puede recibir esta boleta?', met: 'POST', ruta: '/validaciones/recepcion',
      cuando: 'Al asignar una boleta (invitación) y de nuevo cuando la persona invitada acepta, porque su estado pudo cambiar entre los dos momentos (consulta 3). La asignación es solo por documento.',
      req: [['fase', 'texto', 'Sí', '"invitacion" o "aceptacion".'], ['boleta_id', 'texto', 'Sí', 'La boleta que se asigna.'], ['invitado.documento.tipo', 'texto', 'Sí', 'Tipo del documento de quien recibe.'], ['invitado.documento.numero', 'texto', 'Sí', 'Solo dígitos.'], ['invitacion_id', 'texto', 'Con "aceptacion"', 'La invitación que se acepta.']],
      ejemplo: { fase: 'invitacion', boleta_id: 'BOL-884120', invitado: { documento: { tipo: 'CC', numero: '1020774310' } } },
      resp: [['Autorizado', 200, { resultado: 'autorizado', codigo: null, consulta_id: 'con_8a02b711' }], ['Denegado · límite', 200, { resultado: 'denegado', codigo: 'LIMITE_VENTA_EXCEDIDO', consulta_id: 'con_8a02b790' }], ['Denegado · medida', 200, { resultado: 'denegado', codigo: 'MEDIDA_RESTRICTIVA_VIGENTE', consulta_id: 'con_8a02b7c4' }]] },
    { id: 'transferencia', punto: 'Punto 3', titulo: '¿Puede transferir?', met: 'POST', ruta: '/validaciones/transferencia',
      cuando: 'Cuando una persona le pasa su boleta a otra. Se valida a quien entrega y a quien recibe. Todavía no tiene pantalla en la tienda del prototipo.',
      req: [['boleta_id', 'texto', 'Sí', 'La boleta que se transfiere.'], ['entrega.documento.tipo', 'texto', 'Sí', 'Quien entrega.'], ['entrega.documento.numero', 'texto', 'Sí', 'Solo dígitos.'], ['recibe.documento.tipo', 'texto', 'Sí', 'Quien recibe.'], ['recibe.documento.numero', 'texto', 'Sí', 'Solo dígitos.']],
      ejemplo: { boleta_id: 'BOL-884120', entrega: { documento: { tipo: 'CC', numero: '1037512884' } }, recibe: { documento: { tipo: 'CC', numero: '1020774310' } } },
      resp: [['Autorizado', 200, { resultado: 'autorizado', codigo: null, token: 'tok_5d20e1b9c3', consulta_id: 'con_9b11c0d2' }], ['Denegado · recibe', 200, { resultado: 'denegado', codigo: 'MEDIDA_RESTRICTIVA_VIGENTE', parte: 'recibe', consulta_id: 'con_9b11c0f6' }]] },
    { id: 'boleta', punto: 'Registro', titulo: 'Registrar la boleta', met: 'POST', ruta: '/boletas',
      cuando: 'Después de pagar, con el token de la segunda consulta. Deja la boleta nominalizada a nombre de quien compró.',
      req: [['token', 'texto', 'Sí', 'El que devolvió la consulta al pagar. Se usa una sola vez.'], ['evento_id', 'texto', 'Sí', 'Evento de la boleta.'], ['localidad_id', 'texto', 'Sí', 'Localidad o sector.'], ['titular.documento.tipo', 'texto', 'Sí', 'Quien compró.'], ['titular.documento.numero', 'texto', 'Sí', 'Solo dígitos.']],
      ejemplo: { token: 'tok_c91e04aa7b', evento_id: 'EV-2026-0412', localidad_id: 'ORI-BAJA', titular: { documento: { tipo: 'CC', numero: '1037512884' } } },
      resp: [['Registrada', 201, { boleta_id: 'BOL-884120', estado: 'registrada' }], ['Token vencido', 422, { error: { codigo: 'SOLICITUD_INVALIDA', campo: 'token' } }]] },
    { id: 'escenario', punto: 'Consulta', titulo: 'Estado del escenario', met: 'GET', ruta: '/escenarios/{id}/estado',
      cuando: 'Para mostrar en tu canal si las puertas ya abrieron. Es un dato público del evento: no trae información de personas.',
      req: [['id', 'ruta', 'Sí', 'El escenario, por ejemplo ATANASIO-GIRARDOT.']],
      ejemplo: null,
      resp: [['En vivo', 200, { escenario: 'ATANASIO-GIRARDOT', evento_id: 'EV-2026-0412', estado: 'puertas_abiertas', aforo: 38000, ingresos: 4812, actualizado: '2026-09-28T18:42:10-05:00' }]] }
  ];
  var DOCS_ITEMS = ENDPOINTS.map(function (e) { return [e.id, e.titulo, e.punto]; }).concat([['codigos', 'Códigos de motivo', 'Referencia'], ['limites', 'Autenticación y límites', 'Referencia']]);
  var CASOS = [
    { id: 'p1', t: 'Medida vigente', doc: 'CC 1000000001', esp: 'denegado · MEDIDA_RESTRICTIVA_VIGENTE', res: 'denegado', cod: 'MEDIDA_RESTRICTIVA_VIGENTE' },
    { id: 'p2', t: 'Medida cumplida', doc: 'CC 1000000002', esp: 'autorizado: ya cumplió, puede comprar', res: 'autorizado', cod: null },
    { id: 'p3', t: 'Nombre que no coincide', doc: 'CC 1000000003', esp: 'denegado · IDENTIDAD_NO_COINCIDE', res: 'denegado', cod: 'IDENTIDAD_NO_COINCIDE' },
    { id: 'p4', t: 'Más de 5 boletas', doc: 'CC 1000000004', esp: 'denegado · LIMITE_VENTA_EXCEDIDO', res: 'denegado', cod: 'LIMITE_VENTA_EXCEDIDO' }
  ];
  var ALFA = 'abcdefghjkmnpqrstuvwxyz23456789';

  window.PANTALLAS.integracion = function (raiz, ctx) {
    var disp, timerToast = null, zoom = 1, scr = {}, bloques = [];
    var sem = 7;
    function azar() { sem = (sem * 1103515245 + 12345) & 0x7fffffff; return sem / 0x7fffffff; }
    function cadena(n) { var s = ''; for (var i = 0; i < n; i++) { s += ALFA.charAt(Math.floor(azar() * ALFA.length)); } return s; }

    /* ---------- Estado ---------- */

    var st = {
      seccion: 'llaves', env: 'produccion', homol: 'homologada', toast: null, modal: null, modalFoco: false,
      llaves: {
        pruebas: { estado: 'activa', fin: 'a91f', creada: '3 ago 2026', uso: 'hace 4 min', gracia: '' },
        produccion: { estado: 'activa', fin: '7c2e', creada: '12 ago 2026', uso: 'hace 1 min', gracia: '' }
      },
      doc: { id: 'compra', resp: 0 },
      pruebas: { p1: 'paso', p2: 'paso', p3: 'paso', p4: 'paso', ultimo: null, solicitud: false },
      log: { filtro: 'todas', punto: 'todos', q: '', sel: null, extra: [] },
      servicio: 'normal'
    };

    /* ---------- Registro de llamadas (datos sembrados y las que se hacen acá) ---------- */

    // [punto, tipo doc, últimos 4, resultado, código, http, ms]
    var SEMILLA = [
      ['compra1', 'CC', '2884', 'autorizado', null, 200, 412], ['compra2', 'CC', '2884', 'autorizado', null, 200, 538], ['boleta', 'CC', '2884', 'autorizado', null, 201, 187],
      ['compra1', 'CC', '4447', 'denegado', 'MEDIDA_RESTRICTIVA_VIGENTE', 200, 377], ['compra1', 'CC', '9120', 'denegado', 'LIMITE_VENTA_EXCEDIDO', 200, 391], ['recibir', 'CC', '4310', 'autorizado', null, 200, 295],
      ['estado', '', '', 'autorizado', null, 200, 64], ['compra1', 'CC', '6672', 'denegado', 'IDENTIDAD_NO_COINCIDE', 200, 1108], ['compra1', 'CC', '6672', 'autorizado', null, 200, 436],
      ['compra2', 'CC', '6672', 'autorizado', null, 200, 502], ['boleta', 'CC', '6672', 'autorizado', null, 201, 203], ['transferir', 'CC', '5518', 'autorizado', null, 200, 341],
      ['compra1', 'TI', '9406', 'autorizado', null, 200, 421], ['recibir', 'CC', '2208', 'denegado', 'MEDIDA_RESTRICTIVA_VIGENTE', 200, 318], ['compra1', 'CE', '2279', 'denegado', 'DOCUMENTO_NO_VALIDO', 200, 884],
      ['compra1', 'CC', '7730', 'autorizado', null, 200, 405], ['compra2', 'CC', '7730', 'denegado', 'LIMITE_VENTA_EXCEDIDO', 200, 561], ['compra1', 'CC', '1180', 'autorizado', null, 200, 389],
      ['compra1', 'CC', '3305', 'error', 'SOLICITUD_INVALIDA', 422, 41], ['estado', '', '', 'autorizado', null, 200, 58], ['compra1', 'CC', '8812', 'autorizado', null, 200, 447],
      ['transferir', 'CC', '6045', 'denegado', 'MEDIDA_RESTRICTIVA_VIGENTE', 200, 352], ['compra1', 'CC', '2117', 'autorizado', null, 200, 398], ['boleta', 'CC', '2117', 'autorizado', null, 201, 176]
    ];
    var FILAS_BASE = SEMILLA.map(function (s, i) {
      var min = 4 + i * 3 + (i % 4), h = 10 * 60 + 14 - min;
      return { id: 'req_' + cadena(6), env: i % 5 === 4 ? 'pruebas' : 'produccion', ts: '29 sep ' + ('0' + Math.floor(h / 60)).slice(-2) + ':' + ('0' + (h % 60)).slice(-2) + ':' + ('0' + ((i * 17) % 60)).slice(-2), punto: s[0], tipo: s[1], fin: s[2], resultado: s[3], codigo: s[4], http: s[5], ms: s[6] };
    });

    function filasLog() {
      var base = st.log.extra.concat(FILAS_BASE).filter(function (f) { return f.env === st.env; });
      if (st.env === 'produccion' && st.homol !== 'homologada' && st.homol !== 'suspendida') { return []; }
      if (st.env === 'produccion' && st.homol === 'suspendida') {
        var err = [0, 1, 2].map(function (i) { return { id: 'req_e' + i + 'b4f', env: 'produccion', ts: '29 sep 09:5' + (6 - i) + ':12', punto: 'compra1', tipo: 'CC', fin: ['2884', '4310', '1180'][i], resultado: 'error', codigo: 'COMERCIALIZADORA_NO_HABILITADA', http: 403, ms: 22 }; });
        base = err.concat(base);
      }
      return base;
    }
    function docMask(f) { return f.tipo ? f.tipo + ' ••••' + f.fin : '—'; }
    function peticion(f) {
      var d = { tipo: f.tipo, numero: '••••••' + f.fin };
      if (f.punto === 'compra1' || f.punto === 'compra2') { return { fase: f.punto === 'compra1' ? 'identificacion' : 'pago', documento: d, nombre: '(no se conserva)', evento_id: 'EV-2026-0412', cantidad: 2 }; }
      if (f.punto === 'recibir') { return { fase: 'invitacion', boleta_id: 'BOL-884120', invitado: { documento: d } }; }
      if (f.punto === 'transferir') { return { boleta_id: 'BOL-884120', entrega: { documento: { tipo: 'CC', numero: '••••••2884' } }, recibe: { documento: d } }; }
      if (f.punto === 'boleta') { return { token: 'tok_••••••••', evento_id: 'EV-2026-0412', titular: { documento: d } }; }
      return { id: 'ATANASIO-GIRARDOT' };
    }
    function respuesta(f) {
      if (f.resultado === 'error') { return { error: { codigo: f.codigo, http: f.http } }; }
      if (f.punto === 'boleta') { return { boleta_id: 'BOL-884120', estado: 'registrada' }; }
      if (f.punto === 'estado') { return { estado: 'puertas_abiertas', aforo: 38000, ingresos: 4812 }; }
      var r = { resultado: f.resultado, codigo: f.codigo, consulta_id: 'con_' + f.id.slice(4) + 'a1' };
      if (f.resultado === 'autorizado' && (f.punto === 'compra2' || f.punto === 'transferir')) { r.token = 'tok_••••••••'; }
      return r;
    }

    /* ---------- Piezas comunes ---------- */

    function tag(cls, texto) { return '<span class="ig-tag ig-tag--' + cls + '">' + esc(texto) + '</span>'; }
    function tagHomol() { return tag('h-' + st.homol, { homologada: 'Homologada', enpruebas: 'En pruebas', suspendida: 'Suspendida', pendiente: 'Pendiente' }[st.homol]); }
    function aviso(tipo, titulo, texto, extra) {
      return '<div class="ig-aviso ig-aviso--' + tipo + '" role="note">' + ico(tipo === 'ok' ? 'positive' : tipo === 'alerta' ? 'caution' : tipo === 'error' ? 'negative' : 'info') + '<div><b>' + esc(titulo) + '</b>' + (texto ? '<p>' + esc(texto) + '</p>' : '') + (extra || '') + '</div></div>';
    }
    function codigo(texto, lenguaje) {
      bloques.push(texto);
      return '<div class="ig-code"><button type="button" class="ig-copiar" data-acc="copiar" data-id="' + (bloques.length - 1) + '">' + ico('copy') + '<span>Copiar</span></button><pre aria-label="' + esc(lenguaje || 'Ejemplo') + '">' + esc(texto) + '</pre></div>';
    }
    function json(o) { return JSON.stringify(o, null, 2); }
    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }
    function pasaron() { return CASOS.filter(function (c) { return st.pruebas[c.id] === 'paso'; }).length; }
    function llaveProd() {
      var k = st.llaves.produccion;
      if (st.homol === 'pendiente' || st.homol === 'enpruebas') { return Object.assign({}, k, { estado: 'sin' }); }
      return k;
    }

    /* ---------- Barra y navegación ---------- */

    function barra() {
      var envb = function (id, txt) { return '<button type="button" class="ig-env__b" data-acc="env" data-id="' + id + '" aria-pressed="' + (st.env === id) + '">' + txt + '</button>'; };
      return '<header class="ig-barra"><span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span><span class="ig-barra__sep" aria-hidden="true"></span>' +
        '<span class="ig-barra__ttl">Portal de integración</span>' +
        '<div class="ig-env" role="group" aria-label="Entorno"><span class="ig-env__l">Entorno</span>' + envb('pruebas', 'Pruebas') + envb('produccion', 'Producción') + '</div>' +
        '<span class="ig-usuario"><b>Equipo técnico</b><span class="ig-sub"> · ' + COM + '</span></span>' + tagHomol() + '<span class="ig-monograma" aria-hidden="true">GR</span>' + window.NAOWEE.entidades + '</header>';
    }
    function nav() {
      var items = [['llaves', 'Llaves y entornos', 'padlock-close'], ['docs', 'Documentación', 'file'], ['pruebas', 'Homologación', 'positive'], ['log', 'Registro de llamadas', 'history'], ['servicio', 'Estado del servicio', 'thunder']];
      return '<nav class="ig-nav" aria-label="Portal">' + items.map(function (i) {
        var punto = i[0] === 'servicio' && st.servicio !== 'normal' ? '<span class="ig-nav__punto" aria-label="con avisos"></span>' : '';
        return '<button type="button" class="ig-nav__i" data-acc="seccion" data-id="' + i[0] + '"' + (st.seccion === i[0] ? ' aria-current="page"' : '') + '>' + ico(i[2]) + '<span>' + i[1] + '</span>' + punto + '</button>';
      }).join('') + '<p class="ig-nav__pie">Tu equipo ve solo sus llaves, sus llamadas y los documentos que envió.</p></nav>';
    }

    /* ---------- 1 · Llaves y entornos ---------- */

    function avisoHomol() {
      if (st.homol === 'homologada') { return aviso('ok', 'Homologada por Mindeporte', 'Puedes consultar en producción con tu llave de producción.'); }
      if (st.homol === 'suspendida') { return aviso('error', 'Tu comercializadora está suspendida', 'Desde el 21 sep tus consultas en producción responden 403. Habla con Mindeporte para reactivarla.'); }
      return aviso('alerta', 'En pruebas: ' + pasaron() + ' de 4 casos aprobados', 'Tu llave de producción se entrega cuando Mindeporte te homologue.', '<button type="button" class="ig-link" data-acc="seccion" data-id="pruebas">Ir a las pruebas</button>');
    }

    function tarjetaEntorno(id) {
      var pr = id === 'pruebas', k = pr ? st.llaves.pruebas : llaveProd(), pref = pr ? 'svn_test_' : 'svn_live_';
      var estado = { activa: 'Activa', porRevelar: 'Por revelar', revocada: 'Revocada', sin: 'Sin emitir' }[k.estado];
      var cuerpo;
      if (k.estado === 'sin') {
        cuerpo = '<p class="ig-texto">Sin llave todavía. Se emite cuando Mindeporte te homologa y se muestra una sola vez aquí.</p>';
      } else if (k.estado === 'porRevelar') {
        cuerpo = '<p class="ig-texto">Mindeporte emitió tu llave. Se muestra <b>una sola vez</b>: ten a mano tu gestor de secretos.</p><button type="button" class="ig-btn ig-btn--pri" data-acc="revelar" data-id="' + id + '">' + ico('visibility-on') + 'Mostrar mi llave</button>';
      } else if (k.estado === 'revocada') {
        cuerpo = '<div class="ig-llave ig-llave--rev"><code>' + pref + '••••••••••••••••' + k.fin + '</code></div><p class="ig-texto">Revocada: tu sistema recibe 401 con esta llave.</p><button type="button" class="ig-btn ig-btn--pri" data-acc="rotar" data-id="' + id + '">' + ico('refresh') + 'Generar una llave nueva</button>';
      } else {
        cuerpo = '<div class="ig-llave"><code>' + pref + '••••••••••••••••' + k.fin + '</code></div>' +
          '<dl class="ig-dl"><div><dt>Creada</dt><dd>' + esc(k.creada) + '</dd></div><div><dt>Último uso</dt><dd>' + esc(k.uso) + '</dd></div></dl>' +
          (k.gracia ? '<p class="ig-texto ig-texto--aviso">La llave anterior (…' + esc(k.gracia) + ') sigue valiendo 24 horas.</p>' : '') +
          '<div class="ig-fila-btn"><button type="button" class="ig-btn" data-acc="rotar" data-id="' + id + '">' + ico('refresh') + 'Rotar</button><button type="button" class="ig-btn ig-btn--rojo-o" data-acc="pedir-revocar" data-id="' + id + '">Revocar</button></div>';
      }
      return '<section class="ig-card ig-card--env' + (st.env === id ? ' ig-card--actual' : '') + '"><div class="ig-card__cab"><h2 class="ig-h2">' + (pr ? 'Pruebas' : 'Producción') + '</h2>' + tag('k-' + k.estado, estado) + '</div>' +
        '<div class="ig-url"><span class="ig-sub">Dirección base</span><code>' + BASE[id] + '</code></div>' + cuerpo + '</section>';
    }

    function seccionLlaves() {
      return '<div class="ig-pag" data-sc="pag"><div class="ig-cab"><h1 class="ig-h1">Llaves y entornos</h1><p class="ig-sub">Cada entorno tiene su propia llave. Nunca la pongas en el celular ni en el navegador de la persona.</p></div>' + avisoHomol() +
        '<div class="ig-dos">' + tarjetaEntorno('pruebas') + tarjetaEntorno('produccion') + '</div>' +
        '<section class="ig-card"><h2 class="ig-h2">Cómo se usa</h2><p class="ig-texto">Envía la llave en el encabezado <code>Authorization</code> de cada solicitud, desde tu servidor.</p>' +
        codigo('Authorization: Bearer ' + (st.env === 'pruebas' ? 'svn_test_' : 'svn_live_') + '••••••••••••••••' + (st.env === 'pruebas' ? st.llaves.pruebas.fin : st.llaves.produccion.fin), 'Encabezado') + '</section></div>';
    }

    /* ---------- 2 · Documentación ---------- */

    function tablaReq(req) {
      return '<div class="ig-tabla ig-tabla--req"><div class="ig-fila-t ig-fila-t--cab" role="row"><span>Campo</span><span>Tipo</span><span>Obligatorio</span><span>Qué es</span></div>' + req.map(function (r) {
        return '<div class="ig-fila-t" role="row"><code>' + esc(r[0]) + '</code><span>' + esc(r[1]) + '</span><span>' + esc(r[2]) + '</span><span>' + esc(r[3]) + '</span></div>';
      }).join('') + '</div>';
    }

    function docEndpoint(e) {
      var base = BASE[st.env], k = st.env === 'pruebas' ? 'svn_test_' : 'svn_live_';
      var curl = e.met === 'POST'
        ? 'curl -X POST ' + base + e.ruta + ' \\\n  -H "Authorization: Bearer ' + k + '••••" \\\n  -H "Content-Type: application/json" \\\n  -d \'' + JSON.stringify(e.ejemplo, null, 2) + '\''
        : 'curl ' + base + e.ruta.replace('{id}', 'ATANASIO-GIRARDOT') + ' \\\n  -H "Authorization: Bearer ' + k + '••••"';
      var ri = Math.min(st.doc.resp, e.resp.length - 1), r = e.resp[ri];
      var tabs = e.resp.map(function (x, i) { return '<button type="button" class="ig-rtab" role="tab" aria-selected="' + (i === ri) + '" data-acc="resp" data-id="' + i + '">' + esc(x[0]) + '</button>'; }).join('');
      return '<div class="ig-cab"><p class="ig-eyebrow">' + esc(e.punto) + '</p><h1 class="ig-h1">' + esc(e.titulo) + '</h1><p class="ig-ruta"><b class="ig-met ig-met--' + e.met.toLowerCase() + '">' + e.met + '</b><code>' + esc(e.ruta) + '</code></p></div>' +
        '<p class="ig-texto">' + esc(e.cuando) + '</p>' +
        '<section class="ig-sec"><h2 class="ig-h3">Qué envías</h2>' + tablaReq(e.req) + '</section>' +
        '<section class="ig-sec"><h2 class="ig-h3">Ejemplo de solicitud</h2>' + codigo(curl, 'curl') + '</section>' +
        '<section class="ig-sec"><h2 class="ig-h3">Qué recibes</h2><div class="ig-rtabs" role="tablist" aria-label="Respuestas">' + tabs + '</div>' +
          '<p class="ig-sub">HTTP ' + r[1] + '</p>' + codigo(json(r[2]), 'Respuesta') +
          aviso('info', 'Solo códigos', 'La respuesta no trae motivo, expediente ni autoridad: ni siquiera un texto. No muestres el código a la persona.') + '</section>';
    }

    function docCodigos() {
      return '<div class="ig-cab"><p class="ig-eyebrow">Referencia</p><h1 class="ig-h1">Códigos de motivo</h1></div>' +
        '<p class="ig-texto">Cuando el resultado es <code>denegado</code>, <code>codigo</code> dice cuál regla cortó. Es el único dato que recibes: nunca el expediente ni el motivo legal.</p>' +
        '<div class="ig-tabla ig-tabla--cod"><div class="ig-fila-t ig-fila-t--cab" role="row"><span>Código</span><span>Cuándo</span><span>Qué mostrar a la persona</span></div>' + CODIGOS.map(function (c) {
          return '<div class="ig-fila-t" role="row"><span><code>' + c.c + '</code><span class="ig-sub">' + esc(c.n) + '</span></span><span>' + esc(c.cuando) + '</span><span>' + esc(c.pantalla) + '</span></div>';
        }).join('') + '</div>' +
        aviso('info', 'Pendiente de definir', 'Si te conviene distinguir DOCUMENTO_NO_VALIDO de IDENTIDAD_NO_COINCIDE para corregir errores de digitación, aunque dice algo más de la persona.');
    }

    function docLimites() {
      return '<div class="ig-cab"><p class="ig-eyebrow">Referencia</p><h1 class="ig-h1">Autenticación y límites</h1></div>' +
        '<section class="ig-sec"><h2 class="ig-h3">Autenticación</h2><p class="ig-texto">Cada solicitud lleva tu llave en <code>Authorization: Bearer</code>. La llave de pruebas solo funciona en el entorno de pruebas; la de producción, solo si estás homologada.</p></section>' +
        '<section class="ig-sec"><h2 class="ig-h3">Límites de uso</h2><dl class="ig-dl ig-dl--3"><div><dt>Solicitudes</dt><dd>60 por minuto por llave</dd></div><div><dt>Respuesta esperada</dt><dd>1,5 s completa</dd></div><div><dt>Tiempo de espera</dt><dd>Corta a los 5 s</dd></div></dl></section>' +
        '<section class="ig-sec"><h2 class="ig-h3">Errores</h2><div class="ig-tabla ig-tabla--err"><div class="ig-fila-t ig-fila-t--cab" role="row"><span>HTTP</span><span>Código</span><span>Qué pasó</span></div>' +
        ERRORES.map(function (x) { return '<div class="ig-fila-t" role="row"><b>' + x[0] + '</b><code>' + x[1] + '</code><span>' + esc(x[2]) + '</span></div>'; }).join('') + '</div></section>';
    }

    function seccionDocs() {
      var sel = st.doc.id;
      var lista = '<nav class="ig-docnav" aria-label="Documentación">' + DOCS_ITEMS.map(function (i) {
        return '<button type="button" class="ig-docnav__i" data-acc="doc" data-id="' + i[0] + '"' + (sel === i[0] ? ' aria-current="page"' : '') + '><span class="ig-sub">' + esc(i[2]) + '</span><span>' + esc(i[1]) + '</span></button>';
      }).join('') + '</nav>';
      var e = ENDPOINTS.filter(function (x) { return x.id === sel; })[0];
      var cuerpo = e ? docEndpoint(e) : sel === 'codigos' ? docCodigos() : docLimites();
      return '<div class="ig-doc">' + lista + '<div class="ig-pag ig-pag--doc" data-sc="pag">' + cuerpo + '</div></div>';
    }

    /* ---------- 3 · Pruebas de homologación ---------- */

    function seccionPruebas() {
      var n = pasaron();
      var cab = st.homol === 'homologada' ? aviso('ok', 'Homologada', 'Superaste las 4 pruebas y Mindeporte te homologó el 12 ago 2026. Puedes volver a correrlas cuando integres un cambio.')
        : st.homol === 'suspendida' ? aviso('error', 'Suspendida', 'Puedes seguir probando, pero las consultas en producción responden 403 hasta que Mindeporte te reactive.')
        : aviso('info', n + ' de 4 casos aprobados', n === 4 ? 'Ya puedes pedirle a Mindeporte que te homologue.' : 'Corre los casos contra el entorno de pruebas. Cada uno dice qué debe responder.');
      var filas = CASOS.map(function (c) {
        var e = st.pruebas[c.id], u = st.pruebas.ultimo && st.pruebas.ultimo.id === c.id ? st.pruebas.ultimo : null;
        return '<div class="ig-fila-t ig-fila-t--caso" role="row"><span><b>' + esc(c.t) + '</b><span class="ig-sub">' + esc(c.doc) + '</span></span><span>Debe responder<br><code>' + esc(c.esp) + '</code></span>' +
          '<span>' + (e === 'paso' ? tag('ok', 'Pasó') : tag('sin', 'Sin correr')) + (u ? '<span class="ig-sub">Recibió ' + esc(u.res) + (u.cod ? ' · ' + esc(u.cod) : '') + '</span>' : '') + '</span>' +
          '<button type="button" class="ig-btn ig-btn--chico" data-acc="correr" data-id="' + c.id + '">' + ico('play') + 'Ejecutar</button></div>';
      }).join('');
      var pie = st.homol === 'enpruebas'
        ? (st.pruebas.solicitud ? '<p class="ig-texto ig-ok">' + CHECK + ' Solicitud enviada a Mindeporte el 29 sep. Te avisará cuando la revise.</p>'
          : '<button type="button" class="ig-btn ig-btn--pri" data-acc="solicitar"' + (n === 4 ? '' : ' disabled') + '>Solicitar la homologación</button>' + (n === 4 ? '' : '<span class="ig-sub ig-falta">Faltan ' + (4 - n) + ' caso' + (4 - n === 1 ? '' : 's') + ' por aprobar.</span>'))
        : '';
      return '<div class="ig-pag" data-sc="pag"><div class="ig-cab"><h1 class="ig-h1">Pruebas de homologación</h1><p class="ig-sub">Documentos de prueba del entorno de pruebas. Cada corrida queda en el registro de llamadas.</p></div>' + cab +
        '<div class="ig-tabla ig-tabla--casos"><div class="ig-fila-t ig-fila-t--cab" role="row"><span>Caso</span><span>Resultado esperado</span><span>Última corrida</span><span></span></div>' + filas + '</div>' +
        '<div class="ig-fila-btn"><button type="button" class="ig-btn" data-acc="correr-todo">' + ico('play-filled') + 'Ejecutar los 4 casos</button>' + pie + '</div></div>';
    }

    /* ---------- 4 · Registro de llamadas ---------- */

    function seccionLog() {
      var L = st.log, todas = filasLog(), q = L.q.trim().toLowerCase();
      var vis = todas.filter(function (f) {
        if (L.filtro === 'autorizado' && f.resultado !== 'autorizado') { return false; }
        if (L.filtro === 'denegado' && f.resultado !== 'denegado') { return false; }
        if (L.filtro === 'error' && f.resultado !== 'error') { return false; }
        if (L.punto !== 'todos' && f.punto !== L.punto) { return false; }
        return !q || f.id.indexOf(q) >= 0 || (f.fin && f.fin.indexOf(q.replace(/\D/g, '') || '§') >= 0);
      });
      var cnt = function (r) { return r === 'todas' ? todas.length : todas.filter(function (f) { return f.resultado === r; }).length; };
      var chips = [['todas', 'Todas'], ['autorizado', 'Autorizadas'], ['denegado', 'Denegadas'], ['error', 'Con error']].map(function (c) {
        return '<button type="button" class="ig-chip" aria-pressed="' + (L.filtro === c[0]) + '" data-acc="l-filtro" data-id="' + c[0] + '">' + c[1] + '<span class="ig-chip__n">' + cnt(c[0]) + '</span></button>';
      }).join('');
      var ops = '<option value="todos">Todos los puntos</option>' + Object.keys(PUNTOS).map(function (k) { return '<option value="' + k + '"' + (L.punto === k ? ' selected' : '') + '>' + esc(PUNTOS[k].rot) + '</option>'; }).join('');
      var filas = vis.length ? vis.map(function (f) {
        var cls = f.resultado === 'autorizado' ? 'ok' : f.resultado === 'denegado' ? 'no' : 'err';
        return '<button type="button" class="ig-fila ig-fila--log" aria-pressed="' + (L.sel === f.id) + '" data-acc="l-sel" data-id="' + f.id + '">' +
          '<span class="ig-c"><b class="ig-num">' + esc(f.ts.slice(7)) + '</b><span class="ig-sub">' + esc(f.ts.slice(0, 6)) + '</span></span>' +
          '<span class="ig-c"><span>' + esc(PUNTOS[f.punto].rot) + '</span></span>' +
          '<span class="ig-c ig-num">' + esc(docMask(f)) + '</span>' +
          '<span class="ig-c">' + tag(cls, f.resultado === 'autorizado' ? 'Autorizado' : f.resultado === 'denegado' ? 'Denegado' : 'Error') + (f.codigo ? '<span class="ig-sub ig-cod">' + esc(f.codigo) + '</span>' : '') + '</span>' +
          '<span class="ig-c ig-num">' + f.http + '<span class="ig-sub">' + f.ms + ' ms</span></span></button>';
      }).join('') : '<div class="ig-vacio"><b>' + (todas.length ? 'Ninguna llamada con este filtro' : st.env === 'produccion' ? 'Sin llamadas en producción' : 'Sin llamadas en pruebas') + '</b><span>' + (todas.length ? 'Prueba con otro filtro.' : st.env === 'produccion' ? 'Tu llave de producción se entrega al homologarte.' : 'Ejecuta un caso de prueba y aparece acá.') + '</span></div>';
      var sel = todas.filter(function (f) { return f.id === L.sel; })[0];
      var det = sel ? detalleLog(sel) : '<aside class="ig-detalle ig-detalle--vacio"><p class="ig-sub">Elige una llamada para ver lo que enviaste y lo que recibiste.</p></aside>';
      return '<div class="ig-log"><div class="ig-log__main"><div class="ig-cab ig-cab--fila"><h1 class="ig-h1">Registro de llamadas</h1>' + tag('env', st.env === 'pruebas' ? 'Pruebas' : 'Producción') + '</div>' +
        '<div class="ig-tabla ig-tabla--log"><div class="ig-herr"><label class="ig-busq"><span class="ig-vh">Buscar</span>' + ico('search') + '<input data-s="l" data-k="q" value="' + esc(L.q) + '" placeholder="Radicado o últimos 4 del documento" autocomplete="off"></label>' +
        '<label class="ig-punto"><span class="ig-vh">Punto de validación</span><select data-s="l" data-k="punto">' + ops + '</select></label><div class="ig-chips">' + chips + '</div></div>' +
        '<div class="ig-cols ig-cols--log"><span>Hora</span><span>Punto de validación</span><span>Documento</span><span>Resultado y código</span><span>HTTP</span></div>' +
        '<div class="ig-lista" data-sc="lista">' + filas + '</div><div class="ig-pie">' + vis.length + ' de ' + todas.length + ' llamadas de tu comercializadora</div></div></div>' + det + '</div>';
    }

    function detalleLog(f) {
      var cls = f.resultado === 'autorizado' ? 'ok' : f.resultado === 'denegado' ? 'no' : 'err';
      return '<aside class="ig-detalle" aria-label="Detalle de la llamada"><div class="ig-detalle__cab"><div class="ig-detalle__top"><span class="ig-sub">' + esc(f.id) + '</span>' + tag(cls, f.resultado === 'autorizado' ? 'Autorizado' : f.resultado === 'denegado' ? 'Denegado' : 'Error') +
        '<button type="button" class="ig-cerrar" data-acc="l-cerrar" aria-label="Cerrar el detalle">' + ico('close') + '</button></div><h2 class="ig-h2">' + esc(PUNTOS[f.punto].rot) + '</h2><p class="ig-sub">' + esc(f.ts) + ' · ' + esc(f.env === 'pruebas' ? 'Pruebas' : 'Producción') + '</p></div>' +
        '<div class="ig-detalle__cuerpo" data-sc="det"><section class="ig-sec"><h3 class="ig-h3">Lo que enviaste</h3><p class="ig-sub">' + esc(PUNTOS[f.punto].ruta) + '</p>' + codigo(json(peticion(f)), 'Solicitud') + '</section>' +
        '<section class="ig-sec"><h3 class="ig-h3">Lo que recibiste · HTTP ' + f.http + ' · ' + f.ms + ' ms</h3>' + codigo(json(respuesta(f)), 'Respuesta') + '</section></div>' +
        '<div class="ig-detalle__pie">Aquí no hay hechos ni expedientes: solo el código que recibió tu sistema. Los documentos van enmascarados.</div></aside>';
    }

    /* ---------- 5 · Estado del servicio ---------- */

    function barras(deg) {
      var s = '';
      for (var i = 0; i < 30; i++) { s += '<i class="' + (deg && i >= 28 ? 'ig-bar--deg' : i === 11 && !deg ? 'ig-bar--nota' : '') + '"></i>'; }
      return s;
    }
    function seccionServicio() {
      var deg = st.servicio === 'ani';
      var comps = [
        ['Validación de compra', 'Puntos 1 · compra y pago', '99,98 %', 'normal', 412, false],
        ['Validación de recepción y transferencia', 'Puntos 2 y 3', '99,97 %', 'normal', 336, false],
        ['Verificación de identidad', 'Cotejo del documento y el nombre (ANI)', deg ? '99,71 %' : '99,95 %', deg ? 'degradado' : 'normal', deg ? 4180 : 380, deg],
        ['Registro de boletas', 'Boletas nominalizadas', '99,99 %', 'normal', 190, false],
        ['Estado del escenario', 'Consulta de puertas y aforo', '100 %', 'normal', 64, false]
      ];
      var banner = deg
        ? aviso('alerta', 'Verificación de identidad degradada desde las 10:02', 'Las consultas pueden tardar hasta 4 s y algunas responden 503.', '<ul class="ig-lista-av"><li>Reintenta con espera creciente: 1 s, 2 s, 4 s.</li><li>Si no hay respuesta, no confirmes la venta ni cobres. Qué hacer en este caso está por definir con Mindeporte.</li></ul>')
        : aviso('ok', 'Todos los sistemas operan con normalidad', 'Última verificación hace 1 minuto.');
      var filas = comps.map(function (c) {
        return '<div class="ig-fila-t ig-fila-t--serv" role="row"><span><b>' + esc(c[0]) + '</b><span class="ig-sub">' + esc(c[1]) + '</span></span>' + tag(c[3] === 'normal' ? 'ok' : 'deg', c[3] === 'normal' ? 'Operativo' : 'Degradado') +
          '<span class="ig-barras" role="img" aria-label="Disponibilidad de los últimos 30 días: ' + c[2] + '">' + barras(c[5]) + '</span><span class="ig-num"><b>' + c[2] + '</b><span class="ig-sub">30 días</span></span><span class="ig-num"><b>' + c[4] + ' ms</b><span class="ig-sub">p95</span></span></div>';
      }).join('');
      return '<div class="ig-pag" data-sc="pag"><div class="ig-cab"><h1 class="ig-h1">Estado del servicio</h1><p class="ig-sub">Lo que opera Mindeporte para tus consultas. Sin datos de personas.</p></div>' + banner +
        '<div class="ig-tabla ig-tabla--serv"><div class="ig-fila-t ig-fila-t--cab" role="row"><span>Componente</span><span>Estado</span><span>Últimos 30 días</span><span>Disponibilidad</span><span>Respuesta</span></div>' + filas + '</div>' +
        '<section class="ig-card"><h2 class="ig-h2">Historial y mantenimientos</h2><ul class="ig-incs">' +
          '<li><span class="ig-pt ig-pt--prox"></span><span><b>Sáb 3 oct · 02:00 a 03:00</b><span class="ig-sub">Mantenimiento programado. No se espera impacto en las consultas.</span></span></li>' +
          '<li><span class="ig-pt ig-pt--ok"></span><span><b>9 sep · 14:20 a 14:52</b><span class="ig-sub">Verificación de identidad más lenta. Resuelto.</span></span></li>' +
          '<li><span class="ig-pt ig-pt--ok"></span><span><b>21 ago · 19:05 a 19:12</b><span class="ig-sub">Validación de compra con errores 503 intermitentes. Resuelto.</span></span></li></ul></section></div>';
    }

    /* ---------- Modal de llave ---------- */

    function modal() {
      var m = st.modal;
      if (!m) { return ''; }
      if (m.tipo === 'revocar') {
        return '<div class="ig-fondo"><div class="ig-modal" role="dialog" aria-modal="true" aria-labelledby="ig-mt"><h2 class="ig-h2" id="ig-mt">¿Revocar la llave de ' + (m.env === 'pruebas' ? 'pruebas' : 'producción') + '?</h2>' +
          '<p class="ig-texto">Tu sistema deja de consultar con ella de inmediato y recibirá 401. Puedes generar otra después.</p>' +
          '<div class="ig-fila-btn ig-fila-btn--fin"><button type="button" class="ig-btn" data-acc="m-cancelar" data-foco>Cancelar</button><button type="button" class="ig-btn ig-btn--rojo" data-acc="m-revocar">Revocar llave</button></div></div></div>';
      }
      return '<div class="ig-fondo"><div class="ig-modal ig-modal--llave" role="dialog" aria-modal="true" aria-labelledby="ig-mt"><h2 class="ig-h2" id="ig-mt">Tu llave de ' + (m.env === 'pruebas' ? 'pruebas' : 'producción') + (m.tipo === 'rotar' ? ' nueva' : '') + '</h2>' +
        aviso('alerta', 'Es la única vez que la verás', 'Guárdala en tu gestor de secretos. Si la pierdes, tendrás que rotarla.') +
        '<div class="ig-llave ig-llave--grande"><code>' + esc(m.valor) + '</code><button type="button" class="ig-btn" data-acc="m-copiar" data-foco>' + ico('copy') + 'Copiar</button></div>' +
        (m.tipo === 'rotar' && m.gracia ? '<p class="ig-texto">La llave anterior (…' + esc(m.gracia) + ') sigue valiendo 24 horas para que migres sin cortes.</p>' : '') +
        '<label class="ig-check"><input type="checkbox" data-s="m" data-k="guardada"' + (m.guardada ? ' checked' : '') + '><span>Ya la guardé en un lugar seguro</span></label>' +
        '<div class="ig-fila-btn ig-fila-btn--fin"><button type="button" class="ig-btn ig-btn--pri" data-acc="m-listo"' + (m.guardada ? '' : ' disabled') + '>Listo, ocultar la llave</button></div></div></div>';
    }

    /* ---------- Panel del demo ---------- */

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">API y portal de integración<span slot="subtitle">Equipo técnico de la comercializadora</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }
    function tarjeta(titulo, cuerpo) { return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function guion() {
      var item = function (p) { return '<nwt-detail-item actionable icon="' + p[1] + '" nwt-theme="' + p[2] + '" data-acc="' + p[0] + '">' + esc(p[3]) + '</nwt-detail-item>'; };
      var probar = [
        ['g-primera', 'visibility-on', 'informative', 'Primera entrega de la llave'],
        ['g-rotar', 'refresh', 'informative', 'Rotar la llave de pruebas'],
        ['g-correr', 'play', 'informative', 'Correr los casos de prueba'],
        ['g-denegada', 'caution', 'negative', 'Ver una llamada denegada'],
        ['g-codigos', 'file', 'informative', 'Ver los códigos de motivo'],
        ['g-degradado', 'thunder', 'negative', 'Servicio degradado']
      ].map(item).join('');
      var homol = [['g-homologada', 'positive', 'informative', 'Homologada'], ['g-enpruebas', 'refresh', 'informative', 'En pruebas (sin producción)'], ['g-suspendida', 'padlock-close', 'negative', 'Suspendida']].map(item).join('');
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Estado de ' + COM, '<div class="pp-panel__lista">' + homol + '</div>') +
        tarjeta('Probar', '<div class="pp-panel__lista">' + probar + '</div>') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p>' +
      '</aside>';
    }

    /* ---------- Pintado ---------- */

    function contenido() {
      bloques = [];
      var cuerpo = { llaves: seccionLlaves, docs: seccionDocs, pruebas: seccionPruebas, log: seccionLog, servicio: seccionServicio }[st.seccion]();
      return '<div class="pp-app ig-app">' + barra() + '<div class="ig-cuerpo">' + nav() + '<main class="ig-main">' + cuerpo + '</main></div>' + modal() + toast() + '</div>';
    }

    function clave(el) {
      var d = el.dataset || {};
      if (d.k) { return 'k:' + d.s + ':' + d.k; }
      if (d.acc) { return 'a:' + d.acc + ':' + (d.id || ''); }
      return null;
    }

    function pintar() {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      disp.querySelectorAll('[data-sc]').forEach(function (el) { scr[el.dataset.sc] = el.scrollTop; });
      var pie = '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--consola"><div class="pp-pantalla">' + contenido() + '</div></div>' + pie + '</div>';
      disp.querySelectorAll('[data-sc]').forEach(function (el) { el.scrollTop = scr[el.dataset.sc] || 0; });
      if (st.modalFoco) {
        st.modalFoco = false;
        var f = disp.querySelector('.ig-modal [data-foco]'); if (f) { f.focus({ preventScroll: true }); }
      } else if (kf) {
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
    function refrescarPanel() {
      var viejo = raiz.querySelector('.pp-panel'), abierto = viejo && viejo.classList.contains('pp-panel--abierto');
      var n = document.createElement('div'); n.innerHTML = guion();
      var nuevo = n.firstChild;
      if (abierto) { nuevo.classList.add('pp-panel--abierto'); nuevo.querySelector('.pp-panel__toggle').setAttribute('aria-expanded', 'true'); }
      viejo.replaceWith(nuevo);
    }

    /* ---------- Acciones ---------- */

    function hora() { var d = new Date(); return '29 sep ' + ('0' + 10).slice(-2) + ':' + ('0' + (15 + (st.log.extra.length % 40))).slice(-2) + ':' + ('0' + ((st.log.extra.length * 7) % 60)).slice(-2) + (d ? '' : ''); }

    // Corre un caso contra el sandbox: la respuesta sale del caso (la cumplida autoriza) y la llamada queda en el registro.
    function correrCaso(c) {
      st.pruebas[c.id] = 'paso';
      st.pruebas.ultimo = { id: c.id, res: c.res, cod: c.cod };
      st.log.extra.unshift({ id: 'req_' + cadena(6), env: 'pruebas', ts: hora(), punto: 'compra1', tipo: 'CC', fin: c.doc.slice(-4), resultado: c.res, codigo: c.cod, http: 200, ms: 180 + Math.floor(azar() * 160) });
    }

    function nuevaLlave(env, tipo) {
      var k = st.llaves[env], valor = (env === 'pruebas' ? 'svn_test_' : 'svn_live_') + cadena(32);
      st.modal = { tipo: tipo, env: env, valor: valor, guardada: false, gracia: tipo === 'rotar' && k.estado === 'activa' ? k.fin : '' };
      st.modalFoco = true;
    }

    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom]');
      if (!el) { return; }
      var d = el.dataset;
      if (d.zoom) { zoom = d.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      if (el.disabled) { return; }
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'seccion': st.seccion = d.id; st.toast = null; scr = {}; break;
        case 'env': st.env = d.id; st.log.sel = null; scr = {}; break;
        case 'doc': st.doc.id = d.id; st.doc.resp = 0; scr.pag = 0; break;
        case 'resp': st.doc.resp = +d.id; break;
        case 'copiar':
          try { navigator.clipboard.writeText(bloques[+d.id]); } catch (e) { /* sin portapapeles */ }
          mostrarToast('Copiado', 'El ejemplo quedó en tu portapapeles.', 'informative', 'info'); return;
        // Llaves
        case 'revelar': nuevaLlave(d.id, 'revelar'); break;
        case 'rotar': nuevaLlave(d.id, 'rotar'); break;
        case 'pedir-revocar': st.modal = { tipo: 'revocar', env: d.id }; st.modalFoco = true; break;
        case 'm-cancelar': st.modal = null; break;
        case 'm-copiar':
          try { navigator.clipboard.writeText(st.modal.valor); } catch (e) { /* sin portapapeles */ }
          mostrarToast('Llave copiada', 'Guárdala ahora: no se vuelve a mostrar.', 'informative', 'info'); return;
        case 'm-listo':
          if (!st.modal.guardada) { return; }
          var m = st.modal, k = st.llaves[m.env];
          k.estado = 'activa'; k.fin = m.valor.slice(-4); k.creada = '29 sep 2026'; k.uso = 'sin uso'; k.gracia = m.gracia;
          st.modal = null;
          mostrarToast('Llave guardada', 'Ahora aparece enmascarada: termina en ' + k.fin + '.', 'positive', 'positive'); return;
        case 'm-revocar':
          st.llaves[st.modal.env].estado = 'revocada'; st.llaves[st.modal.env].gracia = ''; st.modal = null;
          mostrarToast('Llave revocada', 'Tu sistema recibirá 401 con ella.', 'negative', 'caution'); return;
        // Pruebas
        case 'correr': correrCaso(CASOS.filter(function (c) { return c.id === d.id; })[0]); st.log.sel = null; break;
        case 'correr-todo': CASOS.forEach(correrCaso); st.log.sel = null; mostrarToast('Los 4 casos pasaron', 'Quedaron en tu registro de llamadas de pruebas.', 'positive', 'positive'); return;
        case 'solicitar': if (pasaron() < 4) { return; } st.pruebas.solicitud = true; mostrarToast('Solicitud enviada', 'Mindeporte revisará tus pruebas.', 'positive', 'positive'); return;
        // Registro
        case 'l-filtro': st.log.filtro = d.id; scr.lista = 0; break;
        case 'l-sel': st.log.sel = d.id; scr.det = 0; break;
        case 'l-cerrar': st.log.sel = null; break;
        default: if (!atajo(d.acc)) { return; } return;
      }
      pintar();
    }

    function atajo(a) {
      switch (a) {
        case 'g-homologada': st.homol = 'homologada'; st.pruebas = { p1: 'paso', p2: 'paso', p3: 'paso', p4: 'paso', ultimo: null, solicitud: false }; st.seccion = 'llaves'; break;
        case 'g-enpruebas': st.homol = 'enpruebas'; st.pruebas = { p1: 'paso', p2: 'paso', p3: 'sin', p4: 'sin', ultimo: null, solicitud: false }; st.seccion = 'pruebas'; st.env = 'pruebas'; break;
        case 'g-suspendida': st.homol = 'suspendida'; st.env = 'produccion'; st.seccion = 'llaves'; break;
        case 'g-primera': st.homol = 'homologada'; st.llaves.produccion.estado = 'porRevelar'; st.env = 'produccion'; st.seccion = 'llaves'; break;
        case 'g-rotar': st.env = 'pruebas'; st.seccion = 'llaves'; nuevaLlave('pruebas', 'rotar'); break;
        case 'g-correr': st.env = 'pruebas'; st.seccion = 'pruebas'; if (st.homol !== 'enpruebas') { st.homol = st.homol === 'suspendida' ? 'suspendida' : 'enpruebas'; } st.pruebas = { p1: 'sin', p2: 'sin', p3: 'sin', p4: 'sin', ultimo: null, solicitud: false }; break;
        case 'g-denegada': st.env = 'produccion'; if (st.homol !== 'homologada') { st.homol = 'homologada'; } st.seccion = 'log'; st.log.filtro = 'denegado'; st.log.punto = 'todos'; st.log.q = ''; st.log.sel = FILAS_BASE.filter(function (f) { return f.env === 'produccion' && f.resultado === 'denegado'; })[0].id; break;
        case 'g-codigos': st.seccion = 'docs'; st.doc.id = 'codigos'; break;
        case 'g-degradado': st.servicio = st.servicio === 'ani' ? 'normal' : 'ani'; st.seccion = 'servicio'; break;
        default: return false;
      }
      st.toast = null; scr = {}; refrescarPanel(); pintar();
      return true;
    }

    var TEXTO = /^(text|search|number|tel|email|)$/;
    function porCampo(el) {
      var d = el.dataset, val = el.type === 'checkbox' ? el.checked : el.value;
      if (d.s === 'l') { st.log[d.k] = val; scr.lista = 0; return true; }
      if (d.s === 'm' && st.modal) { st.modal[d.k] = val; return true; }
      return false;
    }
    function onInput(ev) {
      var el = ev.target;
      if (!el.dataset || !el.dataset.k) { return; }
      if (el.tagName === 'INPUT' && TEXTO.test(el.type) && porCampo(el)) { pintar(); }
    }
    function onCambio(ev) {
      var el = ev.target;
      if (!el.dataset || !el.dataset.k) { return; }
      if (el.tagName === 'INPUT' && TEXTO.test(el.type)) { return; }
      if (porCampo(el)) { pintar(); }
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' +
        '<div class="pp-zoom">' +
          '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
          '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
        '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('Portal de integración');
    disp = raiz.querySelector('#dispositivo');

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
