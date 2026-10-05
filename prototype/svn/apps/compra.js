/* Contrato con B: COMPRA.registrar(id, { render(ctx) -> html, onClick?(el, ev, ctx), onInput?(ev, ctx), alMontar?(ctx) }); ids 'asignar' y 'aceptar'.
 * ctx = { D, st, repintar, toast, esc, ir, consultar(n, alTerminar, extra?), raiz }; ayudas: COMPRA.marco/resultado/ico/qr/dinero. Acciones data-acc: cmp- (A), asg-/ace- (B).
 * Orden: evento, identificar, pago, asignar, (aceptar), listo. Detalle del estado y de las consultas en README.md. */
window.PANTALLAS = window.PANTALLAS || {};
window.COMPRA = window.COMPRA || {};
window.COMPRA.pantallas = window.COMPRA.pantallas || {};
window.COMPRA.registrar = window.COMPRA.registrar || function (id, def) { window.COMPRA.pantallas[id] = def; };

(function () {
  var COMPRA = window.COMPRA;
  // Equipo y velocidad sobreviven al remontaje; la velocidad es propia y no toca la global de la puerta.
  var M = { disp: 'celular', rol: 'compra', vel: 'slow', st: null };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dinero(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function iniciales(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x.charAt(0).toUpperCase(); }).join(''); }
  function primerNombre(n) { return String(n || '').split(/\s+/)[0] || ''; }
  function digitos(doc) { return String(doc || '').replace(/\D/g, ''); }
  function enmascarar(doc) { var d = digitos(doc); return d ? String(doc).split(' ')[0] + ' •••• ' + d.slice(-4) : String(doc || ''); }

  /* ---------- Iconos de trazo ---------- */
  var ICO = {
    atras: '<path d="M15 5l-7 7 7 7"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    cuenta: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    lugar: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', escudo: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
    alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>', triangulo: '<path d="M12 4 3 20h18z"/><path d="M12 10v5M12 17.5h.01"/>',
    menos: '<path d="M6 12h12"/>', mas: '<path d="M12 6v12M6 12h12"/>', puerta: '<path d="M3 21h18M5 21V4a1 1 0 0 1 1-1h8v18M14 5h4v16"/><path d="M11 12h.01"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>', banco: '<path d="M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    girar: '<path d="M12 3a9 9 0 1 0 9 9"/>'
  };
  function ico(n, t, extra) {
    return '<svg width="' + (t || 20) + '" height="' + (t || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (n === 'menos' || n === 'mas' || n === 'girar' ? 2.4 : 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + ICO[n] + '</svg>';
  }

  /* ---------- Datos ficticios ---------- */
  var LOCS = [
    { id: 'occ', nombre: 'Occidental', n: 'Occidental', d: 'Numerada · vista central', p: 180000, fila: 'C', puerta: 'Puerta 1 · Occidental' },
    { id: 'ori', nombre: 'Oriental', n: 'Oriental', d: 'Numerada', p: 120000, fila: 'E', puerta: 'Puerta 4 · Oriental' },
    { id: 'norte', nombre: 'Norte', n: 'Norte', d: 'General · sin silla asignada', p: 50000, puerta: 'Puerta 6 · Norte' },
    { id: 'sur', nombre: 'Sur · visitante', n: 'Sur · visitante', d: 'Tribuna de la hinchada visitante', p: 50000, puerta: 'Puerta 8 · Sur' }
  ];
  var CARGO = 7500, MAX = 5;
  var P = {
    laura: { nombre: 'Laura Restrepo Gil', tipo: 'CC', num: '1.036.482.117' },
    santiago: { nombre: 'Santiago Mejía Correa', tipo: 'CC', num: '1.037.664.905' },
    julian: { nombre: 'Julián Andrés Posada', tipo: 'CC', num: '71.894.4471' },
    mariana: { nombre: 'Mariana Cárdenas Ríos', tipo: 'CC', num: '1.152.708.339' },
    paula: { nombre: 'Paula Andrea Henao Restrepo', tipo: 'CC', num: '1.040.221.908' },
    rosa: { nombre: 'Rosa Elena Cortés Vega', tipo: 'CC', num: '43.118.920' },
    kevin: { nombre: 'Kevin Andrés Zapata Ruiz', tipo: 'CC', num: '1.001.245.786' },
    daniela: { nombre: 'Daniela Gómez Arias', tipo: 'CC', num: '1.017.889.214' },
    cristian: { nombre: 'Cristian Muñoz Henao', tipo: 'CC', num: '1.128.403.552' },
    tomas: { nombre: 'Tomás Ríos Betancur', tipo: 'CC', num: '1.035.667.120' }
  };
  function conDoc(p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = p[k]; }); o.doc = p.tipo + ' ' + p.num; o.ref = p.ref || o.doc; return o; }
  Object.keys(P).forEach(function (k) { P[k] = conDoc(P[k]); });

  // Los 11 casos de C1-Casos. `c` = consulta que corta; `paso` = dónde corta; `ve` = qué ve la persona.
  var CASOS = [
    { id: 'feliz', corto: 'Compra sin problemas', punto: 'verde', c: 0, paso: 'No corta', persona: P.laura, invitado: P.santiago, ve: 'En Pago, «Pagando como Laura Restrepo Gil» y sin volver a pedir el documento. Luego sus boletas con QR.' },
    { id: 'medida-id', corto: 'Bloqueo por medida', punto: 'rojo', c: 1, paso: 'Medidas · DB', codigo: 'Medida restrictiva vigente', persona: P.julian, invitado: P.santiago, ve: 'Resultado de la validación, sin motivo, con enlace a su portal. No llega al pago.' },
    { id: 'limite-id', corto: 'Límite al identificarse', punto: 'rojo', c: 1, paso: 'Límite', codigo: 'Límite de venta excedido', persona: P.mariana, previas: 4, loc: 'ori', invitado: P.santiago, ve: 'La regla de 5 por persona y «Cambiar la cantidad». Con 1 boleta sí pasa.' },
    { id: 'limite-carrera', corto: 'Límite al pagar', punto: 'rojo', c: 2, paso: 'Límite', codigo: 'Límite de venta excedido', persona: P.mariana, carrera: 4, loc: 'ori', invitado: P.santiago, ve: 'Pasa la consulta 1; al pagar, la misma regla y «no se hizo ningún cobro». Reserva liberada.' },
    { id: 'identidad', corto: 'Nombre no coincide', punto: 'rojo', c: 1, paso: 'Registraduría', codigo: 'Identidad no coincide', persona: P.paula, invitado: P.santiago, ve: 'Revisar los datos: 3 intentos y luego el Resultado genérico. Corrigiendo los datos sí pasa.' },
    { id: 'doc-invalido', corto: 'Cédula no válida', punto: 'rojo', c: 1, paso: 'Registraduría', codigo: 'Documento no válido', persona: P.rosa, invitado: P.santiago, ve: 'Resultado de la validación, sin motivo. No llega al pago.' },
    { id: 'cambio-medida', corto: 'Medida durante el pago', punto: 'rojo', c: 2, paso: 'Medidas · DB', codigo: 'Medida restrictiva vigente', persona: P.kevin, invitado: P.santiago, ve: 'Pasa la consulta 1; al pagar, resultado sin motivo, «no se cobró» y «reserva liberada».' },
    { id: 'acomp-medida', corto: 'Acompañante con medida', punto: 'rojo', c: 3, paso: 'Medidas · DB', persona: P.laura, invitado: P.julian, ve: 'Laura: «No es posible asignar esta boleta a esta persona», sin motivo. 1 válida y 1 sin titular.' },
    { id: 'acomp-boleta', corto: 'Acompañante con boleta', punto: 'rojo', c: 3, paso: 'Una por evento', persona: P.laura, invitado: P.daniela, ve: 'Igual que el anterior (código propuesto).' },
    { id: 'acomp-afinidad', corto: 'Acompañante sin afinidad', punto: 'rojo', c: 3, paso: 'Afinidad y sector', sinVisitante: true, persona: P.laura, invitado: P.cristian, ve: 'Igual que el anterior. El partido va sin hinchada visitante y Sur queda cerrada.' },
    { id: 'afinidad-no-concluyente', corto: 'Afinidad dudosa: pasa', punto: 'verde', c: 0, paso: 'Deja pasar', noConcluyente: true, persona: P.laura, invitado: P.tomas, ve: 'Aceptar boleta, como en el camino feliz. El motivo queda en la auditoría.' }
  ];
  // Vista «Quien recibe la boleta» (DC-234): arranca en la invitación, en el celular del invitado. `c: 3` = corta al aceptar.
  var RECIBE = [
    { id: 'rec-pendiente', corto: 'Invitación por aceptar', punto: 'verde', c: 0, paso: 'Invitación pendiente', recibe: 'pendiente', persona: P.laura, invitado: P.santiago, ve: 'Ve quién lo invita y la boleta. Puede Aceptar (se revalida) o Rechazar.' },
    { id: 'rec-rechazada', corto: 'Invitación rechazada', punto: 'verde', c: 0, paso: 'Rechazada', recibe: 'rechazada', persona: P.laura, invitado: P.santiago, ve: 'Ve «Rechazaste la boleta»; Laura puede asignarla a otra persona. Puede volver a la invitación.' },
    { id: 'rec-noposible', corto: 'Aceptación bloqueada', punto: 'rojo', c: 3, paso: 'Medidas · SVN', recibe: 'pendiente', aceptaFalla: true, persona: P.laura, invitado: P.julian, ve: 'Al aceptar se revalida y sale «No es posible aceptar esta boleta», sin motivo.' }
  ];
  CASOS.forEach(function (c, i) { c.n = i + 1; });
  RECIBE.forEach(function (c, i) { c.n = i + 1; });
  var INICIO = { 'medida-id': 'identificar', 'limite-id': 'identificar', identidad: 'identificar', 'doc-invalido': 'identificar', 'limite-carrera': 'pago', 'cambio-medida': 'pago',
    'acomp-medida': 'listo', 'acomp-boleta': 'listo', 'acomp-afinidad': 'listo', 'afinidad-no-concluyente': 'listo' };
  function casosDe(rol) { return rol === 'recibe' ? RECIBE : CASOS; }
  function casoPorId(id) { return RECIBE.concat(CASOS).filter(function (c) { return c.id === id; })[0] || CASOS[0]; }

  function loc(x) { var id = x && x.id ? x.id : x; return LOCS.filter(function (l) { return l.id === id; })[0] || LOCS[1]; }
  function total(st) { return st.cantidad * (loc(st.localidad).p + CARGO); }
  function token(seed) { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', s = Number(seed) || 7, r = ''; for (var i = 0; i < 8; i++) { s = (s * 16807) % 2147483647; r += a.charAt(s % a.length); if (i === 3) { r += ' · '; } } return r; }

  function nuevoEstado(caso) {
    var st = {
      pantalla: 'evento', caso: caso, casoId: caso.id,
      persona: null, localidad: loc(caso.loc || 'ori'), cantidad: 2, medio: 'tarjeta',
      form: { tipo: caso.persona.tipo, doc: caso.persona.num, nombre: caso.persona.nombre },
      id: { estado: 'espera', restantes: 3, error: false }, consultando: 0, bloqueo: null,
      reservaFin: 0, pagado: false,
      boletas: [], segunda: { estado: 'sinTitular', a: null }
    };
    // DC-243: cada caso abre donde importa, sin repetir los pasos de compra que no le aportan.
    var ini = caso.recibe ? null : INICIO[caso.id];
    if (ini) {
      st.pantalla = ini;
      if (ini !== 'identificar') { st.persona = caso.persona; }
      if (ini === 'listo') { st.pagado = true; crearBoletas(st); }
    }
    if (caso.recibe) {
      var i = caso.invitado, a = { tipo: i.tipo, valor: i.num, nombre: i.nombre, doc: i.doc, ref: i.ref };
      st.persona = caso.persona; st.pagado = true; st.pantalla = 'aceptar';
      crearBoletas(st);
      st.segunda = caso.recibe === 'rechazada' ? { estado: 'sinTitular', a: null, rechazada: a } : { estado: 'invitada', a: a, rechazada: null };
    }
    return st;
  }

  /* ---------- Definiciones de las consultas (a la app se presentan como consulta a DB) ---------- */
  function paso(n, logo, texto, baja, sube, ms) { return { n: n, logo: logo, texto: texto, baja: baja, sube: sube, r: 'ok', ms: ms }; }
  function falla(p, texto, sube) { p.texto = texto; p.sube = sube; p.r = 'falla'; }
  function boletas(n) { return n + (n === 1 ? ' boleta' : ' boletas'); }

  function def1(st, extra) {
    var c = st.caso, tf = extra.svn ? c.persona : { doc: st.form.tipo + ' ' + st.form.doc };
    var previas = c.previas || 0;
    var p = [
      paso('Graderío', 'GR', 'Envía documento, nombre, evento y cantidad', tf.doc + ' · ' + boletas(st.cantidad), 'Recibida', 120),
      paso('Registraduría', 'ANI', 'Documento vigente · nombre coincide', 'Documento · Nombre', 'Vigente ✓', 320),
      paso('Medidas', 'DB', 'Sin medida correctiva vigente', 'Documento', 'Sin medida ✓', 210),
      paso('Límite', 'DB', previas + ' de 5 para este evento · pide ' + st.cantidad, 'Evento · Cantidad', 'Dentro del límite ✓', 140),
      paso('Decisión · DB', 'DB', 'Autorizado · queda en la auditoría', null, 'Autorizado', 60)
    ];
    var def = { consulta: 'Consulta 1 de 3 · ¿Puede comprar?', tag: 'Autorizado', pasos: p, codigo: 'Autorizado' };
    var corta = function (i, texto, sube, tag, cod) { falla(p[i], texto, sube); def.tag = 'Denegado · ' + tag; def.codigo = cod || tag; };
    if (c.id === 'medida-id') { corta(2, 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente'); }
    else if (c.id === 'doc-invalido') { corta(1, 'Cédula cancelada en el ANI', 'No válido ✕', 'Documento no válido'); }
    else if (c.id === 'identidad' && !extra.svn && !extra.corregido) { corta(1, 'El nombre no corresponde al documento', 'No coincide ✕', 'Identidad no coincide'); }
    else if (c.id === 'limite-id') {
      p[3].texto = 'Ya tiene ' + previas + ' boletas para este evento en otra comercializadora · pide ' + st.cantidad;
      if (previas + st.cantidad > MAX) { corta(3, p[3].texto, 'Supera 5 ✕', 'Límite de venta excedido'); }
      else { p[3].texto = previas + ' de 5 en otra comercializadora · pide ' + st.cantidad; }
    }
    return def;
  }

  function def2(st) {
    var c = st.caso, primero = primerNombre(st.persona && st.persona.nombre);
    var p = [
      paso('Graderío', 'GR', 'Envía la orden antes de cobrar', 'Orden · ' + boletas(st.cantidad), 'Recibida', 110),
      paso('Medidas', 'DB', 'Sigue sin medida vigente', 'Documento', 'Sin medida ✓', 200),
      paso('Límite', 'DB', 'Sigue en ' + ((c.previas || 0) + st.cantidad) + ' de 5 · sin compras nuevas', 'Evento · Cantidad', 'Dentro del límite ✓', 130),
      paso('Token', 'DB', 'Autoriza la orden · token de la boleta de ' + primero, null, 'Token ✓', 90)
    ];
    var def = { consulta: 'Consulta 2 de 3 · revalida al pagar', tag: 'Autorizado · token emitido', pasos: p, codigo: 'Autorizado' };
    if (c.id === 'cambio-medida') { falla(p[1], 'Se registró una medida durante la reserva', 'Medida vigente ✕'); def.tag = 'Denegado · Medida restrictiva vigente'; def.codigo = 'Medida restrictiva vigente'; }
    if (c.id === 'limite-carrera') { falla(p[2], 'Compró ' + c.carrera + ' en otra comercializadora durante la reserva · ahora serían ' + (c.carrera + st.cantidad), 'Supera 5 ✕'); def.tag = 'Denegado · Límite de venta excedido'; def.codigo = 'Límite de venta excedido'; }
    return def;
  }

  // Consulta 3: al asignar (A4/B4) o al aceptar (A5). `extra.fase` = 'asignar' | 'aceptar'; `extra.quien` = lo que baja.
  function def3(st, extra) {
    var c = st.caso, inv = c.invitado, aceptar = extra.fase === 'aceptar';
    var pca = st.pca, tecleado = pca && pca.tipo ? pca.tipo + ' ' + pca.doc : null;
    var p = [
      paso('Graderío', 'GR', aceptar ? 'Envía la aceptación de ' + primerNombre(inv.nombre) : 'Envía la invitación de ' + primerNombre(st.persona && st.persona.nombre), aceptar ? 'Aceptación' : (extra.quien || tecleado || inv.ref), 'Recibida', 110),
      paso('Registraduría', 'ANI', 'Documento vigente · identidad verificada', 'Documento', 'Vigente ✓', 260),
      paso('Medidas', 'DB', 'Sin medida correctiva vigente', 'Documento', 'Sin medida ✓', 190),
      paso('Una por evento', 'DB', 'No tiene otra boleta para este evento', 'Evento', 'Sin otra boleta ✓', 120),
      paso('Afinidad y sector', 'DB', loc(st.localidad).n + ' habilitada para esta persona', 'Sector · Partido', 'Cumple ✓', 150),
      paso('Decisión · DB', 'DB', aceptar ? 'Autorizado · boleta asignada con su token' : 'Autorizado · invitación enviada', null, 'Autorizado', 50)
    ];
    var def = { consulta: aceptar ? 'Consulta 3 de 3 · revalida al aceptar' : 'Consulta 3 de 3 · ¿Puede recibir?', tag: aceptar ? 'Autorizado · token emitido' : 'Autorizado', pasos: p, codigo: 'Autorizado' };
    if (c.noConcluyente) { p[4].texto = 'Afinidad no concluyente · deja pasar y queda en la auditoría'; p[4].sube = 'No concluyente ✓'; }
    var corta = function (i, texto, sube, tag) { falla(p[i], texto, sube); def.tag = 'Denegado · ' + tag; def.codigo = tag; };
    if (aceptar && c.aceptaFalla) { corta(2, 'Se registró una medida durante la invitación', 'Medida vigente ✕', 'Medida restrictiva vigente'); }
    if (!aceptar) {
      if (c.id === 'acomp-medida') { corta(2, 'Tiene una medida correctiva vigente', 'Medida vigente ✕', 'Medida restrictiva vigente'); }
      if (c.id === 'acomp-boleta') { corta(3, 'Ya tiene una boleta para este evento', 'Ya tiene boleta ✕', 'Ya tiene boleta (propuesto)'); }
      if (c.id === 'acomp-afinidad') { corta(4, 'Sin hinchada visitante · afín a Medellín (91 %)', 'No cumple ✕', 'Regla del partido (propuesto)'); }
    }
    return def;
  }

  /* ---------- Marco de Graderío (celular y escritorio) ---------- */
  var LOGO = '<span class="pc-logo"><span class="pc-logo__m"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M1 16h16V2h-4v4H9v4H5v4H1z" fill="#FFCC1A"/></svg></span><span class="pc-logo__t">graderío<small>Comercializadora de entradas</small></span></span>';
  /* o = { paso, atras: 'data-acc' | null, cuerpo, pie? } */
  function marco(o) {
    var pie = o.pie ? o.pie : '';
    return '<div class="pc-screen">' +
      '<header class="pc-top"><div class="pc-top__izq">' + (o.atras ? '<button type="button" class="pc-ib" aria-label="Volver" data-acc="' + o.atras + '">' + ico('atras', 22) + '</button>' : '') + LOGO + '</div></header>' +
      '<main class="pc-body">' + o.cuerpo + '</main>' + (pie ? '<footer class="pc-foot">' + pie + '</footer>' : '') + '</div>';
  }

  // «Resultado de la validación»: nunca dice el motivo. o = { titulo, texto, acciones:[{acc, texto, icono?, clase?}] }
  function botonesRes(acciones) {
    return (acciones || []).map(function (a) { return '<button type="button" class="pc-s-btn ' + (a.clase || 'pc-s-btn--pri') + '" data-acc="' + a.acc + '">' + (a.icono ? ico(a.icono, 18) : '') + '<span>' + esc(a.texto) + '</span></button>'; }).join('');
  }
  // Con `enPie`, los botones no van en la pieza: quien la usa los pone en el pie fijo con botonesRes.
  function resultado(o) {
    var acc = o.enPie ? '' : botonesRes(o.acciones);
    return '<div class="pc-s-pieza pc-s-pieza--res" role="alert"><div class="pc-s-res"><span class="pc-s-res__ic">' + ico('alerta', 28) + '</span><h2 class="pc-s-h">' + esc(o.titulo) + '</h2><p class="pc-s-p">' + esc(o.texto) + '</p></div>' +
      '<div class="pc-s-res__acc">' + acc + '<div class="pc-s-sello"><img src="assets/mindeporte.svg" alt="Ministerio del Deporte"><i></i><span>Validado</span></div></div></div>';
  }

  // QR de referencia (no es un código real): módulos seudoaleatorios con los tres cuadros de posición.
  function qr(seed) {
    var n = 25, s = Number(seed) || 1, d = '', x, y;
    var r = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
    var zona = function (a, b) { return (a < 8 && b < 8) || (a >= n - 8 && b < 8) || (a < 8 && b >= n - 8); };
    for (y = 0; y < n; y++) { for (x = 0; x < n; x++) { if (!zona(x, y) && r() < 0.5) { d += 'M' + x + ' ' + y + 'h1v1h-1z'; } } }
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(function (f) { d += 'M' + f[0] + ' ' + f[1] + 'h7v7h-7z' + 'M' + (f[0] + 1) + ' ' + (f[1] + 1) + 'v5h5v-5z' + 'M' + (f[0] + 2) + ' ' + (f[1] + 2) + 'h3v3h-3z'; });
    return '<svg class="pc-qr__img" viewBox="-1 -1 27 27" role="img" aria-label="Código QR de la boleta"><path d="' + d + '" fill="#0B1640" fill-rule="evenodd"/></svg>';
  }

  Object.assign(COMPRA, { marco: marco, resultado: resultado, ico: ico, qr: qr, dinero: dinero, iniciales: iniciales, primerNombre: primerNombre, enmascarar: enmascarar, token: token, casos: CASOS, localidad: loc });

  /* ---------- Piezas comunes de las pantallas ---------- */
  function tarjetaPersona(p, sello, cambiar) {
    return '<section class="pc-card pc-pagando" aria-label="Pagando como"><div class="pc-pagando__cab"><span class="pc-pagando__t">PAGANDO COMO</span>' +
      (cambiar ? '<button type="button" class="pc-enlace" aria-label="No soy yo, cambiar de persona" data-acc="cmp-cambiar">No soy yo</button>' : '') + '</div>' +
      '<div class="pc-titular"><span class="pc-avatar">' + esc(iniciales(p.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(p.nombre) + '</b><span>' + esc(p.doc) + '</span></span></div>' +
      '<div class="pc-verificada">' + ico('escudo', 18) + 'Identidad verificada</div>' +
      '</section>';
  }
  function botonCarga(texto) { return '<button type="button" class="pc-btn pc-btn--carga" aria-disabled="true">' + ico('girar', 20, ' class="pc-gira"') + '<span>' + esc(texto) + '</span></button>'; }
  function boton(acc, texto, icono, clase) { return '<button type="button" class="pc-btn' + (clase ? ' ' + clase : '') + '" data-acc="' + acc + '">' + (icono === 'candado' ? ico('candado', 18) : '') + '<span>' + esc(texto) + '</span>' + (icono === 'flecha' ? ico('flecha', 20) : '') + '</button>'; }
  function estadoOk(t, d) { return '<div class="pc-ok" role="status">' + ico('check', 22) + '<div><b>' + esc(t) + '</b>' + (d ? '<span>' + esc(d) + '</span>' : '') + '</div></div>'; }
  function aviso(t, d) { return '<div class="pc-aviso">' + ico('triangulo', 22) + '<div><b>' + esc(t) + '</b><span>' + esc(d) + '</span></div></div>'; }

  /* ---------- Pantalla 1 · Evento y boletas ---------- */
  function totalTexto(st) { return st.cantidad + ' × ' + loc(st.localidad).n; }
  COMPRA.registrar('evento', {
    render: function (cx) {
      var st = cx.st, c = st.caso;
      var locs = LOCS.map(function (l) {
        var off = c.sinVisitante && l.id === 'sur', sel = l.id === st.localidad.id;
        return '<button type="button" class="pc-opt' + (sel ? ' pc-opt--sel' : '') + (off ? ' pc-opt--off' : '') + '" role="radio" aria-checked="' + sel + '"' + (off ? ' aria-disabled="true"' : '') + ' data-acc="cmp-loc" data-v="' + l.id + '">' +
          '<span class="pc-opt__radio"></span><span class="pc-opt__txt"><b>' + l.n + '</b><span>' + (off ? 'Cerrada · partido sin hinchada visitante' : l.d) + '</span></span><span class="pc-opt__p">' + dinero(l.p) + '</span></button>';
      }).join('');
      var cuerpo =
        '<section class="pc-evento"><img src="assets/estadios/atanasio.jpg" alt="Estadio Atanasio Girardot" class="pc-evento__img"><div class="pc-evento__t">' +
          '<span class="pc-evento__liga">LIGA · FECHA 12</span><h1 class="pc-h1" tabindex="-1">Nacional vs. Medellín</h1>' +
          '<div class="pc-evento__meta"><span>' + ico('cal', 16) + 'Lun 28/ Sep/26 · 7:00 p. m.</span><span>' + ico('lugar', 16) + 'Atanasio Girardot, Medellín</span></div></div></section>' +
        '<section class="pc-seccion"><h2 class="pc-h2">Elige tu localidad</h2><div class="pc-opts" role="radiogroup" aria-label="Localidad">' + locs + '</div></section>' +
        '<section class="pc-cant"><div class="pc-cant__t"><h2 class="pc-h2">Cantidad</h2><span class="pc-sub">Máximo 5 por persona</span></div>' +
          '<div class="pc-stepper"><button type="button" class="pc-step" aria-label="Quitar una boleta" data-acc="cmp-menos"' + (st.cantidad <= 1 ? ' disabled' : '') + '>' + ico('menos', 20) + '</button>' +
          '<span class="pc-step__n" data-cant aria-live="polite">' + st.cantidad + '</span>' +
          '<button type="button" class="pc-step" aria-label="Agregar una boleta" data-acc="cmp-mas"' + (st.cantidad >= MAX ? ' disabled' : '') + '>' + ico('mas', 20) + '</button></div></section>';
      var pie = '<div class="pc-total"><span class="pc-total__t"><span data-resumen>' + totalTexto(st) + '</span></span><b data-total>' + dinero(total(st)) + '</b></div>' + boton('cmp-continuar', 'Continuar', 'flecha');
      return marco({ paso: 'evento', atras: null, cuerpo: cuerpo, pie: pie });
    },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc;
      if (a === 'cmp-continuar') { cx.ir('identificar'); return; }
      if (a === 'cmp-loc') {
        if (el.getAttribute('aria-disabled') === 'true') { cx.toast('Localidad cerrada', 'Este partido va sin hinchada visitante.'); return; }
        st.localidad = loc(el.dataset.v);
        cx.raiz.querySelectorAll('[data-acc="cmp-loc"]').forEach(function (b) { var s = b === el; b.classList.toggle('pc-opt--sel', s); b.setAttribute('aria-checked', String(s)); });
      } else { st.cantidad = Math.max(1, Math.min(MAX, st.cantidad + (a === 'cmp-mas' ? 1 : -1))); }
      // Solo cambian el número, los topes y el total: la foto no se vuelve a pintar.
      var r = cx.raiz;
      r.querySelector('[data-cant]').textContent = st.cantidad;
      r.querySelector('[data-acc="cmp-menos"]').disabled = st.cantidad <= 1;
      r.querySelector('[data-acc="cmp-mas"]').disabled = st.cantidad >= MAX;
      r.querySelector('[data-resumen]').textContent = totalTexto(st);
      r.querySelector('[data-total]').textContent = dinero(total(st));
    }
  });

  /* ---------- Pantalla 2 · Identificarse (consulta 1) ---------- */
  // Acciones de los bloqueos: van en el pie fijo del equipo, siempre abajo (DC-223).
  var ACC_PORTAL = { acc: 'cmp-portal', texto: 'Consultar mi estado', icono: 'externo' };
  var BTN_VOLVER = '<button type="button" class="pc-btn pc-btn--sec" data-acc="cmp-evento">Volver al evento</button>';
  function bloqueoIdentificar(cx) {
    var st = cx.st, b = st.bloqueo, p = st.form;
    var quien = { nombre: p.nombre || 'Sin nombre', doc: p.tipo + ' ' + p.doc };
    if (b.codigo === 'Límite de venta excedido') {
      return marco({ paso: 'identificar', atras: 'cmp-evento', fondo: true, cuerpo:
        '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
        '<div class="pc-cab"><h1 class="pc-h1" tabindex="-1">Superas el límite de boletas para este evento</h1><p class="pc-sub">' + esc(quien.nombre) + ' · ' + esc(quien.doc) + '</p></div>' +
        aviso('Máximo 5 boletas por persona', 'El límite suma las boletas que tengas para este evento en cualquier comercializadora (Decreto 1622 de 2022).') +
        '<p class="pc-sub pc-centro">No reservamos boletas ni hicimos ningún cobro.</p>',
      pie: '<button type="button" class="pc-btn" data-acc="cmp-evento">Cambiar la cantidad</button>' +
        botonesRes([{ acc: 'cmp-portal', texto: 'Ver mis boletas en mi portal', icono: 'externo', clase: 'pc-s-btn--grande' }]) });
    }
    var acciones = [ACC_PORTAL];
    return marco({ paso: 'identificar', atras: 'cmp-evento', fondo: true, cuerpo:
      '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
      '<div class="pc-card pc-persona"><span class="pc-avatar">' + esc(iniciales(quien.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(quien.nombre) + '</b><span>' + esc(quien.doc) + '</span></span></div>' +
      resultado({ titulo: 'No es posible continuar', texto: 'Consulta tu estado en tu portal de estado.', acciones: acciones, enPie: true }) +
      '<p class="pc-sub pc-centro">No reservamos boletas ni hicimos ningún cobro.</p>',
      pie: botonesRes(acciones) + BTN_VOLVER });
  }

  COMPRA.registrar('identificar', {
    render: function (cx) {
      var st = cx.st, f = st.form, i = st.id;
      if (st.bloqueo) { return bloqueoIdentificar(cx); }
      var tipos = ['CC', 'CE', 'TI', 'Pasaporte', 'PPT', 'PEP'].map(function (t) { return '<option' + (t === f.tipo ? ' selected' : '') + '>' + t + '</option>'; }).join('');
      var err = i.error
        ? '<p class="pc-error" id="err-id" role="alert">' + ico('info', 16) + '<span>El nombre y el documento no coinciden con los de la Registraduría. Revisa el número y escribe tu nombre como aparece en tu documento.</span></p>' +
          '<p class="pc-nota">' + ico('info', 16) + '<span>Te quedan ' + i.restantes + (i.restantes === 1 ? ' intento' : ' intentos') + '.</span></p>'
        : (i.vacio ? '<p class="pc-error" id="err-id" role="alert">' + ico('info', 16) + '<span>Escribe tu documento y tu nombre.</span></p>' : '');
      var mal = i.error || i.vacio ? ' pc-input--error" aria-invalid="true" aria-describedby="err-id' : '';
      var cuerpo = '<h2 class="pc-h1 pc-tit">Tus datos</h2>' +
        '<h1 class="pc-sr" tabindex="-1">¿A nombre de quién va la compra?</h1>' +
        '<div class="pc-fila"><label class="pc-campo">Tipo<select class="pc-input pc-input--sel" data-campo="tipo">' + tipos + '</select></label>' +
        '<label class="pc-campo">Número de documento<input class="pc-input' + mal + '" inputmode="numeric" data-campo="doc" value="' + esc(f.doc) + '" autocomplete="off"></label></div>' +
        '<label class="pc-campo">Nombre completo, como en tu documento<input class="pc-input' + mal + '" data-campo="nombre" value="' + esc(f.nombre) + '" autocomplete="off"></label>' + err;
      var pie = st.consultando === 1 ? botonCarga('Validando…') : boton('cmp-id-continuar', i.error ? 'Intentar de nuevo' : 'Continuar');
      return marco({ paso: 'identificar', atras: 'cmp-evento', cuerpo: cuerpo, pie: pie });
    },
    // Con el resultado a la vista, baja hasta el aviso para que se lea sin buscarlo.
    alMontar: function (cx) { var b = cx.raiz.querySelector('.pc-body'); if (b && cx.st.id.error) { b.scrollTop = b.scrollHeight; } },
    onInput: function (ev, cx) {
      var t = ev.target, k = t.dataset && t.dataset.campo;
      if (k) { cx.st.form[k] = t.value; }
    },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc;
      if (st.consultando) { return; }
      if (a !== 'cmp-id-continuar') { return; }
      var c = st.caso, f = st.form;
      if (!f.doc.trim() || !f.nombre.trim()) { st.id.vacio = true; cx.repintar(); return; }
      st.id.vacio = false;
      // Corrigió los datos si cambió algo frente a lo que trajo el caso: así «Intentar de nuevo» tiene sentido.
      var corregido = f.doc !== c.persona.num || f.nombre !== c.persona.nombre || f.tipo !== c.persona.tipo;
      st.consultando = 1;
      cx.raiz.querySelector('.pc-foot .pc-btn, .pc-foot--suelto .pc-btn').outerHTML = botonCarga('Validando…');
      cx.consultar(1, function (r) {
        st.consultando = 0;
        if (r.ok) {
          st.persona = { nombre: f.nombre.trim(), tipo: f.tipo, num: f.doc.trim(), doc: f.tipo + ' ' + f.doc.trim() };
          st.id.estado = 'ok'; st.id.error = false;
          // Sin pantalla de éxito: la persona pasa sola a Pago (DC-228); la espera deja leer la franja.
          setTimeout(function () { if (st.pantalla === 'identificar' && st.id.estado === 'ok' && !st.bloqueo) { cx.ir('pago'); } }, 400);
          return;
        } else if (r.codigo === 'Identidad no coincide') {
          st.id.restantes = Math.max(0, st.id.restantes - 1);
          st.id.error = true;
          if (st.id.restantes === 0) { st.bloqueo = { n: 1, codigo: 'Identidad no coincide', corte: r.corte }; }
        } else { st.bloqueo = { n: 1, codigo: r.codigo, corte: r.corte }; }
        cx.repintar();
      }, { corregido: corregido, reintentable: true });
    }
  });

  /* ---------- Pantalla 3 · Pago (consulta 2) ---------- */
  var MEDIOS = [
    { id: 'tarjeta', n: 'Tarjeta de crédito o débito', d: 'Terminada en 4821 · vence 08/29', c: 'Tarjeta', cd: 'Crédito o débito', i: 'tarjeta' },
    { id: 'pse', n: 'Transferencia bancaria', d: 'Desde tu banco, por PSE', c: 'Transferencia', cd: 'Desde tu banco (PSE)', i: 'banco' }
  ];
  function relojTexto(st) {
    var s = st.reservaFin ? Math.max(0, Math.round((st.reservaFin - Date.now()) / 1000)) : 0;
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function chipReloj(st, largo) {
    return '<span class="pc-timer" role="timer" aria-label="Tiempo de la reserva">' + ico('reloj', 18) + '<span>' + (largo ? 'Tu reserva vence en ' : 'Reserva ') + '<span data-reloj>' + relojTexto(st) + '</span></span></span>';
  }
  function bloqueoPago(cx) {
    var st = cx.st, p = st.persona, b = st.bloqueo, l = loc(st.localidad);
    var medida = b.codigo === 'Medida restrictiva vigente';
    var causa = medida ? 'p. ej. le radicaron una medida mientras pagaba' : 'p. ej. compró en otra comercializadora mientras pagaba';
    var cuerpo =
      '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Pago</h1><span class="pc-estado pc-estado--vacio pc-estado--g">' + ico('reloj', 16) + 'Reserva liberada</span></div>' +
      tarjetaPersona(p, true, false) +
      '<p class="pc-nota pc-nota--equipo">' + ico('info', 16) + '<span><b>Nota del equipo, la persona no la ve.</b> Pasó la consulta 1 al identificarse. Este bloqueo ocurre igual porque su estado cambió durante la reserva (' + causa + ').</span></p>' +
      (medida
        ? resultado({ titulo: 'No es posible continuar', texto: 'Consulta tu estado en tu portal de estado.', acciones: [ACC_PORTAL], enPie: true })
        : '<div class="pc-cab"><h2 class="pc-h1 pc-h1--m">Superas el límite de boletas para este evento</h2>' + aviso('Máximo 5 boletas por persona', 'Mientras pagabas se registró otra compra tuya para este evento en otra comercializadora.') + '</div>') +
      '<section class="pc-card"><p class="pc-nota pc-nota--tinta">' + ico('info', 16) + '<span>No hicimos ningún cobro a tu tarjeta terminada en 4821.</span></p>' +
      '<p class="pc-nota pc-nota--tinta">' + ico('info', 16) + '<span>Liberamos las ' + st.cantidad + ' boletas de ' + l.n + ' que tenías reservadas.</span></p></section>';
    var acciones = medida ? [ACC_PORTAL] : [{ acc: 'cmp-portal', texto: 'Ver mis boletas en mi portal', icono: 'externo', clase: 'pc-s-btn--grande' }];
    return marco({ paso: 'pago', atras: null, fondo: true, cuerpo: cuerpo, pie: botonesRes(acciones) + BTN_VOLVER });
  }

  function pagoPie(st) {
    if (st.pagado) { return boton('cmp-ver-boletas', 'Ver mis boletas', 'flecha'); }
    if (st.consultando === 2) { return botonCarga('Confirmando…'); }
    return boton('cmp-pagar', 'Pagar ' + dinero(total(st)), 'candado');
  }
  function pagoAviso(st) {
    return st.pagado ? estadoOk('Pago aprobado') : '';
  }
  function medioCelular(st) {
    var mm = MEDIOS.map(function (m) {
      var s = m.id === st.medio;
      return '<button type="button" class="pc-opt' + (s ? ' pc-opt--sel' : '') + '" role="radio" aria-checked="' + s + '" data-acc="cmp-medio" data-v="' + m.id + '"><span class="pc-opt__radio"></span><span class="pc-opt__txt"><b>' + m.n + '</b><span>' + m.d + '</span></span></button>';
    }).join('');
    return '<section class="pc-seccion"><h2 class="pc-h2">Medio de pago</h2><div class="pc-opts" role="radiogroup" aria-label="Medio de pago">' + mm + '</div>' +
      '</section>';
  }
  COMPRA.registrar('pago', {
    render: function (cx) {
      var st = cx.st, l = loc(st.localidad);
      if (st.bloqueo) { return bloqueoPago(cx); }
      if (!st.reservaFin) { st.reservaFin = Date.now() + 582000; }
      var lineas = '<div class="pc-lin"><span>' + st.cantidad + ' × ' + l.n + '</span><b>' + dinero(st.cantidad * l.p) + '</b></div>' +
        '<div class="pc-lin"><span>Cargo por servicio</span><b>' + dinero(st.cantidad * CARGO) + '</b></div><hr class="pc-sep"><div class="pc-total"><span class="pc-total__b">Total</span><b>' + dinero(total(st)) + '</b></div>';
      var cuerpo = '<div class="pc-fila-t"><h1 class="pc-h1 pc-tit" tabindex="-1">Pago</h1>' + chipReloj(st) + '</div>' + tarjetaPersona(st.persona, true, true) +
        '<section class="pc-card">' + lineas + '</section>' + medioCelular(st) + pagoAviso(st);
      return marco({ paso: 'pago', atras: 'cmp-atras', cuerpo: cuerpo, pie: pagoPie(st) });
    },
    alMontar: function (cx) { var b = cx.raiz.querySelector('.pc-body'); if (b && cx.st.pagado) { b.scrollTop = b.scrollHeight; } },
    onClick: function (el, ev, cx) {
      var st = cx.st, a = el.dataset.acc, r = cx.raiz;
      if (a === 'cmp-cambiar') { st.persona = null; st.id = { estado: 'espera', restantes: 3, error: false }; st.form = { tipo: 'CC', doc: '', nombre: '' }; st.reservaFin = 0; cx.ir('identificar'); return; }
      if (a === 'cmp-medio') {
        st.medio = el.dataset.v;
        r.querySelectorAll('[data-acc="cmp-medio"]').forEach(function (b) { var s = b === el; b.classList.toggle('pc-opt--sel', s); b.setAttribute('aria-checked', String(s)); });
        return;
      }
      if (a === 'cmp-ver-boletas') { cx.ir('listo'); return; }
      if (a !== 'cmp-pagar' || st.consultando) { return; }
      st.consultando = 2;
      var zonaPie = r.querySelector('[data-pie]') || r.querySelector('.pc-foot');
      zonaPie.innerHTML = pagoPie(st);
      cx.consultar(2, function (res) {
        st.consultando = 0;
        if (res.ok) { crearBoletas(st); st.pagado = true; cx.repintar(); cx.aprobar(); return; }
        st.bloqueo = { n: 2, codigo: res.codigo, corte: res.corte }; st.reservaFin = 0;
        cx.repintar();
      });
    }
  });

  // Emite la boleta de quien compra; las demás quedan sin titular hasta asignarlas (consulta 3).
  function crearBoletas(st) {
    var l = loc(st.localidad), seed = digitos(st.persona.doc).slice(-4);
    st.boletas = [];
    for (var i = 0; i < st.cantidad; i++) {
      st.boletas.push({ n: i + 1, localidad: l.n, fila: l.fila || '', silla: l.fila ? String(18 + i) : '', puesto: l.fila ? 'Fila ' + l.fila + ' · Silla ' + (18 + i) : 'General', puerta: l.puerta,
        titular: i === 0 ? st.persona : null, token: i === 0 ? '7F3K · 29QD' : null, seed: i === 0 ? seed : null });
    }
  }

  // `segunda.a` viene de B como {por, tipo, valor, nombre}; se traduce al titular de la boleta.
  function titularDe(a) {
    var hit = Object.keys(P).map(function (k) { return P[k]; }).filter(function (q) { return q.nombre === a.nombre || q.doc === (a.tipo + ' ' + a.valor); })[0];
    return { nombre: a.nombre || (hit && hit.nombre) || a.valor, doc: hit ? hit.doc : ((a.tipo || 'CC') + ' ' + a.valor) };
  }

  /* ---------- Pantalla final · Mis boletas (id interno: listo) ---------- */
  // La boleta en juego (st.asigIdx) vive en st.segunda; las demás se guardan en su boleta (b.sg).
  function sgDe(st, i) {
    if (i === (st.asigIdx || 1)) { return st.segunda; }
    return (st.boletas[i] && st.boletas[i].sg) || { estado: 'sinTitular', a: null };
  }
  COMPRA.sgDe = sgDe;
  COMPRA.registrar('listo', {
    render: function (cx) {
      var st = cx.st;
      if (!st.boletas.length) { crearBoletas(st); }
      // Cada boleta con su propia asignación: la que está en juego vive en st.segunda (ver sgDe).
      st.boletas.forEach(function (b, i) {
        var s = sgDe(st, i);
        if (i > 0 && s.estado === 'asignada' && s.a) { b.titular = titularDe(s.a); b.token = s.a.token || (i === 1 ? 'M8TZ · 61WA' : token(digitos(b.titular.doc))); b.seed = digitos(b.titular.doc).slice(-4) || '4905'; }
      });
      var cards = st.boletas.map(function (b, i) {
        var sg = sgDe(st, i);
        var est = b.titular ? ['Asignada', 'claro'] : (sg.estado === 'invitada') ? ['Invitada', 'pend'] : ['Sin titular', 'vacio'];
        var cab = '<div class="pc-boleta__cab"><b>' + b.localidad + ' · ' + b.puesto.replace(' · ', ' · ') + '</b><span class="pc-estado pc-estado--' + est[1] + '">' + (b.titular ? ico('check', 14) : '') + est[0] + '</span></div>';
        var cuerpo;
        if (b.titular) {
          cuerpo = '<div class="pc-qr">' + qr(b.seed) + '<div class="pc-qr__d"><div class="pc-titular"><span class="pc-avatar">' + esc(iniciales(b.titular.nombre)) + '</span><span class="pc-titular__t"><b>' + esc(b.titular.nombre) + '</b><span>' + esc(enmascarar(b.titular.doc)) + '</span></span></div>' +
            '<span class="pc-puerta">' + ico('puerta', 16) + b.puerta + '</span><span class="pc-token">Token · ' + esc(b.token) + '</span></div></div>';
        } else {
          var quien = sg.estado === 'invitada' && sg.a ? 'Esperando a ' + esc(sg.a.nombre || sg.a.valor || 'la persona invitada') + '. El QR sale cuando acepte.' : 'El QR y el token salen cuando la boleta tenga titular.';
          cuerpo = '<div class="pc-qr"><span class="pc-qr__vacio">' + ico('info', 28) + '</span><div class="pc-qr__d"><div class="pc-titular"><span class="pc-avatar pc-avatar--vacio">?</span><span class="pc-titular__t"><b>Sin titular</b><span>' + quien + '</span></span></div>' +
            '<span class="pc-puerta">' + ico('puerta', 16) + b.puerta + '</span></div></div>';
        }
        var acc = '';
        if (!b.titular && sg.estado !== 'invitada') {
          var otra = sg.estado === 'denegada' || !!sg.rechazada;
          var av = function (ic, t) { return '<div class="pc-aviso">' + ico(ic, 22) + '<div><b>' + t + '</b></div></div>'; };
          var nota = (sg.estado === 'denegada' ? av('triangulo', 'No es posible asignar esta boleta a esta persona')
            : sg.rechazada ? av('triangulo', esc(sg.rechazada.nombre || 'La persona') + ' rechazó la boleta') : '') + av('reloj', 'Asignar antes de 28/Sep 6:00pm');
          acc = nota + '<button type="button" class="pc-btn" data-acc="lst-asignar" data-i="' + i + '">' + (otra ? 'Asignar a otra persona' : 'Asignar esta boleta') + '</button>';
        }
        return '<article class="pc-boleta">' + cab + '<div class="pc-boleta__cuerpo">' + cuerpo + (acc ? '<div class="pc-boleta__acc">' + acc + '</div>' : '') + '</div></article>';
      }).join('');
      var todas = st.boletas.every(function (b) { return b.titular; });
      var acepto = st.boletas.filter(function (b, i) { var s = sgDe(st, i); return i > 0 && s.estado === 'asignada' && s.a && s.a.nombre; })[0];
      var cabOk = todas
        ? estadoOk('Listo. ' + (st.boletas.length === 1 ? 'Tu boleta tiene titular.' : 'Tus ' + st.boletas.length + ' boletas tienen titular.'), acepto ? primerNombre(acepto.titular.nombre) + ' aceptó la suya el sáb 26 sep.' : '')
        : '';
      var cuerpo = '<h1 class="pc-h1 pc-tit" tabindex="-1">Tus boletas</h1>' + cabOk +
        '<div class="pc-listas">' + cards + '</div>';
      return marco({ paso: 'listo', atras: null, cuerpo: cuerpo });
    },
    onClick: function (el, ev, cx) {
      var a = el.dataset.acc, i = Number(el.dataset.i);
      if (a === 'lst-asignar' && COMPRA.abrirAsignar) { COMPRA.abrirAsignar(cx.st, i, true); cx.ir('asignar'); }
    }
  });

  /* ---------- Montaje: marco del demo, panel de casos, equipo y capa ---------- */
  window.PANTALLAS.compra = function (raiz, ctxApp) {
    var caso0 = casosDe(M.rol)[0];
    var st = M.st = nuevoEstado(caso0);
    var disp, zoom = 1, capa = null, gen = 0, timerToast = null, timerReloj = null, timerAprob = null, aprob = null;

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar"><div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">Vender la boleta<span slot="subtitle">Paso 2 del flujo · Graderío (comercializadora ficticia)</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Volver al inicio</nwt-button></nwt-toolbar>';
    }
    // Mismo semáforo y marcado que la lista de /puerta, para que los dos paneles se lean igual.
    var ASPECTO = { verde: ['positive', 'positive'], amarillo: ['warning', 'attention'], rojo: ['negative', 'negative'] };
    function itemCaso(c) {
      var a = ASPECTO[c.punto] || ASPECTO.verde;
      return '<nwt-detail-item actionable icon="' + a[1] + '" nwt-theme="' + a[0] + '" data-caso="' + c.id + '"><span class="pp-caso__punto pp-caso__punto--' + c.punto + '" aria-hidden="true"></span>' + esc(c.corto) + '</nwt-detail-item>';
    }
    function pintarCasos() {
      var t = raiz.querySelector('#pc-casos-tit'), l = raiz.querySelector('#pc-casos');
      if (t) { t.textContent = M.rol === 'recibe' ? 'Casos de quien recibe' : 'Casos de compra'; }
      if (l) { l.innerHTML = casosDe(M.rol).map(itemCaso).join(''); }
    }
    function guion() {
      return '<aside class="pp-panel" aria-label="Controles del demo">' +
        '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">Ver como</span><nwt-tabs id="tabs-disp" full-width></nwt-tabs></nwt-card>' +
        '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold" id="pc-casos-tit"></span><div class="pp-panel__lista" id="pc-casos">' + casosDe(M.rol).map(itemCaso).join('') + '</div></nwt-card>' +
        '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">Este caso</span><div id="pc-caso-info" class="pc-caso-info"></div></nwt-card>' +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p></aside>';
    }
    function velocidadControl() {
      return '<div class="pp-velocidad"><div class="pp-velocidad__g" role="group" aria-label="Velocidad de validación" id="velocidad-ctrl">' +
        '<button type="button" class="pp-velocidad__b" data-vel="slow" aria-pressed="' + (M.vel === 'slow') + '">Slow motion</button>' +
        '<button type="button" class="pp-velocidad__b" data-vel="normal" aria-pressed="' + (M.vel === 'normal') + '">Tiempo real</button></div></div>';
    }
    function infoCaso() {
      var c = st.caso, corta = c.recibe ? (c.c ? 'Corta al aceptar · ' + c.paso : c.paso) : c.c ? 'Corta en la consulta ' + c.c + ' · ' + c.paso : 'No corta: las 3 en verde' + (c.noConcluyente ? ' (afinidad no concluyente)' : '');
      var quien = c.recibe ? c.invitado.nombre + ' · ' + c.invitado.doc + '. Lo invita: ' + c.persona.nombre
        : c.persona.nombre + ' · ' + c.persona.doc + (c.c === 3 || c.noConcluyente ? '. Invitado: ' + c.invitado.nombre + ' · ' + c.invitado.doc : '');
      var el = raiz.querySelector('#pc-caso-info');
      if (el) { el.innerHTML = '<p class="pc-caso-info__t">' + esc(corta) + '</p><p>' + esc(quien) + '</p><p>' + esc(c.ve) + '</p>' + (c.c === 3 && !c.recibe ? '<p class="pc-caso-info__n">Esta consulta ocurre al asignar la segunda boleta.</p>' : ''); }
      raiz.querySelectorAll('#pc-casos nwt-detail-item').forEach(function (n) { n.classList.toggle('pc-caso--activo', n.dataset.caso === c.id); });
    }

    function estadoBarra() {
      return M.disp === 'celular' ? '<div class="pp-estado" aria-hidden="true"><span>18:44</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>' : '';
    }

    /* ---------- Contexto que ve cada pantalla (también las de B) ---------- */
    var cx = {
      D: null, st: st,
      repintar: function () { pintarPantalla(false); },
      toast: toast, esc: esc, ir: ir, consultar: consultar, reiniciar: reiniciar, aprobar: aprobar, raiz: null
    };

    function pantallaActual() { return COMPRA.pantallas[st.pantalla]; }

    // `conservarCapa`: tras la consulta 3 la franja termina sola su espera de 2 s (no se corta al cambiar de pantalla).
    function ir(id, conservarCapa) {
      cancelarAprob();
      if (!COMPRA.pantallas[id]) { id = 'listo'; }
      st.pantalla = id;
      if (!conservarCapa) { gen++; if (capa) { capa.detener(); } }
      pintarPantalla(true);
    }

    function pintarPantalla(cambio) {
      var pan = pantallaActual();
      var vista = disp.querySelector('.pc-app');
      if (!vista) { pintarDispositivo(); return; }
      var previo = vista.querySelector('.pc-body');
      var sc = previo && !cambio ? previo.scrollTop : 0;
      vista.innerHTML = pan ? pan.render(cx) : '';
      cx.raiz = vista;
      var b = vista.querySelector('.pc-body');
      if (b) { b.scrollTop = sc; }
      if (cambio) { var h = vista.querySelector('h1'); if (h) { h.focus({ preventScroll: true }); } }
      if (pan && pan.alMontar) { pan.alMontar(cx); }
    }

    function pintarDispositivo() {
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + M.disp + '"><div class="pp-pantalla">' + estadoBarra() + '<div class="pc-app pc-app--' + M.disp + '"></div></div></div></div>';
      pintarPantalla(false);
      montarAprob();
      escalar();
    }

    // El equipo llena el alto libre: bajo los controles y, con la franja abierta, sobre la franja pegada al fondo.
    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var abierta = e.classList.contains('pp-escena--capa'), capaEl = e.querySelector('.pp-c');
      var FONDO = 20, SEP = 16, TOPE = 64;
      var franja = abierta && capaEl ? capaEl.offsetHeight + FONDO + SEP : FONDO;
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - TOPE - franja) / m.offsetHeight);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }

    function toast(t, m) {
      var app = disp.querySelector('.pc-app');
      if (!app) { return; }
      var viejo = app.querySelector(':scope > .pp-toast');
      if (viejo) { viejo.remove(); }
      app.insertAdjacentHTML('beforeend', '<nwt-toast class="pp-toast" visible icon="info" nwt-theme="informative" heading="' + esc(t) + '" message="' + esc(m) + '" data-acc="cerrar-toast"></nwt-toast>');
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { var n = disp.querySelector('.pp-toast'); if (n) { n.remove(); } }, 3200);
    }

    /* ---------- Consultas ---------- */
    // Elige la definición según el caso y la fase; las consultas 1 y 2 que fallan detienen el flujo con el Resultado.
    function consultar(n, alTerminar, extra) {
      extra = extra || {};
      var miGen = ++gen;
      if (n === 3 && !extra.fase) { extra.fase = st.pantalla === 'aceptar' ? 'aceptar' : 'asignar'; }
      var def = n === 1 ? def1(st, extra) : n === 2 ? def2(st) : def3(st, extra);
      capa.correrDef(def, { velocidad: M.vel, alCambiar: escalar }, function (r) {
        if (miGen !== gen) { return; }
        if (!r.ok && n < 3 && !extra.reintentable) { st.bloqueo = { n: n, codigo: r.codigo, corte: r.corte }; cx.repintar(); }
        if (alTerminar) { alTerminar(r); }
      });
    }

    /* ---------- Compra aprobada: overlay de todo el equipo, 2 s, y pasa solo ---------- */
    // Cuelga de .pp-pantalla (no de .pc-app) para cubrir también la barra de estado; se rehace si cambia el equipo.
    function montarAprob() {
      var pan = disp && disp.querySelector('.pp-pantalla'), app = disp && disp.querySelector('.pc-app');
      if (!aprob || !pan) { return; }
      var v = pan.querySelector('.pc-aprob'); if (v) { v.remove(); }
      pan.insertAdjacentHTML('beforeend', '<div class="pc-aprob pc-aprob--' + M.disp + '" role="status" style="--pc-t:-' + (Date.now() - aprob.ini) + 'ms">' +
        '<svg class="pc-aprob__ic" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" pathLength="1"/><path d="M28 50l14 14 27-30" pathLength="1"/></svg>' +
        '<p class="pc-aprob__t">Compra aprobada</p><p class="pc-aprob__r">' + esc(boletas(st.cantidad) + ' · Nacional vs. Medellín · ' + dinero(total(st))) + '</p></div>');
      if (app) { app.setAttribute('inert', ''); }
      if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); }
    }
    function cancelarAprob() {
      clearTimeout(timerAprob); timerAprob = null; aprob = null;
      if (!disp) { return; }
      var v = disp.querySelector('.pc-aprob'), app = disp.querySelector('.pc-app');
      if (v) { v.remove(); }
      if (app) { app.removeAttribute('inert'); }
    }
    function aprobar() {
      cancelarAprob();
      aprob = { ini: Date.now() };
      montarAprob();
      timerAprob = setTimeout(function () { ir('listo'); }, 2000);
    }

    /* ---------- Reinicios ---------- */
    function reiniciar(id) {
      cancelarAprob();
      gen++; if (capa) { capa.detener(); }
      var c = casoPorId(id), nuevo = nuevoEstado(c);
      Object.keys(st).forEach(function (k) { delete st[k]; });
      Object.assign(st, nuevo);
      infoCaso();
      pintarPantalla(true);
    }
    // «Volver al evento»: conserva el caso y la persona identificada; suelta la reserva y el bloqueo.
    function alEvento() {
      cancelarAprob();
      gen++; if (capa) { capa.detener(); }
      st.bloqueo = null; st.reservaFin = 0; st.consultando = 0; st.pagado = false; st.boletas = [];
      st.segunda = { estado: 'sinTitular', a: null }; st.asigIdx = 1; st.pca = null;
      st.id = { estado: 'espera', restantes: 3, error: false };
      st.pantalla = 'evento';
      pintarPantalla(true);
    }

    /* ---------- Eventos ---------- */
    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom],[data-caso],[data-vel]');
      if (!el) { return; }
      if (el.dataset.zoom) { zoom = el.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      if (el.dataset.caso) { reiniciar(el.dataset.caso); return; }
      if (el.dataset.vel) {
        M.vel = el.dataset.vel;
        raiz.querySelectorAll('[data-vel]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === el)); });
        return;
      }
      var a = el.dataset.acc;
      if (a === 'salir') { ctxApp.salir(); return; }
      if (a === 'cerrar-toast') { el.remove(); return; }
      if (!disp.contains(el)) { return; }
      if (a === 'cmp-evento') { alEvento(); return; }
      if (a === 'cmp-atras') { ir(st.pantalla === 'pago' ? 'identificar' : 'evento'); return; }
      if (a === 'cmp-portal') { toast('Portal de la persona', 'Aún fuera del flujo de la demo. Ya está modelado en modeling/desing-views.'); return; }
      var pan = pantallaActual();
      if (pan && pan.onClick) { pan.onClick(el, ev, cx); }
    }
    function onInput(ev) {
      if (!disp.contains(ev.target)) { return; }
      var pan = pantallaActual();
      if (pan && pan.onInput) { pan.onInput(ev, cx); }
    }

    cx.D = ctxApp.D;

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' + velocidadControl() +
        '<div class="pp-zoom"><nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button></div></div>' +
        '<div class="pp-dispositivo" id="dispositivo"></div>' + window.CAPA.htmlDef() + '</div></main></div></div>';
    SPLASH.app('Vender la boleta', 'grader');
    disp = raiz.querySelector('#dispositivo');
    capa = window.CAPA.crear(raiz.querySelector('.pp-escena'));

    var tabs = raiz.querySelector('#tabs-disp');
    tabs.items = [{ id: 'compra', label: 'Quien compra', value: 'compra' }, { id: 'recibe', label: 'Quien recibe', value: 'recibe' }];
    tabs.value = M.rol;
    // Cambia la lista de casos y arranca en el primero de esa vista.
    tabs.addEventListener('nwtChange', function (e) { M.rol = e.detail; pintarCasos(); reiniciar(casosDe(M.rol)[0].id); });

    // El reloj de la reserva solo cambia el texto; al vencer, la compra vuelve al evento.
    timerReloj = setInterval(function () {
      if (!st.reservaFin) { return; }
      disp.querySelectorAll('[data-reloj]').forEach(function (n) { n.textContent = relojTexto(st); });
      if (Date.now() >= st.reservaFin && st.pantalla === 'pago' && !st.pagado && !st.bloqueo && !st.consultando) {
        alEvento(); toast('La reserva venció', 'Las boletas volvieron a la venta. Elige de nuevo.');
      }
    }, 1000);

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('input', onInput);
    window.addEventListener('resize', escalar);
    pintarCasos();
    infoCaso();
    pintarDispositivo();
    requestAnimationFrame(escalar);

    return function () {
      gen++; if (capa) { capa.detener(); }
      clearTimeout(timerToast); clearInterval(timerReloj); clearTimeout(timerAprob);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('input', onInput);
      window.removeEventListener('resize', escalar);
    };
  };
})();
