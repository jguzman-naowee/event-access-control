/* Superficie 2 · Entidades y comercializadoras. Modelo en modeling/desing-views/02-entidades-comercializadoras.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(n) { return '<nwt-icon value="' + n + '"></nwt-icon>'; }
  function digitos(s) { return String(s).replace(/\D/g, ''); }
  var CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  var EQUIS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

  var CLUB = 'Atlético Nacional';
  var USUARIO_MD = { nombre: 'Natalia Rojas Cuesta', cargo: 'Mindeporte · Dirección de Fomento' };
  var USUARIO_CL = { nombre: 'Andrea Posada Ruiz', cargo: 'Jefe de logística' };
  var CASOS_PRUEBA = ['Medida vigente: se deniega', 'Medida cumplida: se autoriza', 'Nombre que no coincide: se deniega', 'Más de 5 boletas: se deniega'];
  var CERT = {
    pendiente: { tag: 'Pendiente', orden: 0 },
    enpruebas: { tag: 'En pruebas', orden: 1 },
    homologada: { tag: 'Homologada', orden: 2 },
    suspendida: { tag: 'Suspendida', orden: 3 },
    revocada: { tag: 'Revocada', orden: 4 }
  };
  var REP = { pendiente: 'Sin reportar', revision: 'En revisión', aprobado: 'Aprobado' };
  var ETAPA = { enviado: 'Enviado', recibido: 'Recibido', tramite: 'En trámite', derivo: 'Derivó en medida', archivado: 'Archivado' };
  var ETAPA_SIGUE = {
    enviado: 'Tu reporte llegó a la bandeja del IVC y a la autoridad de policía. Falta que el IVC lo reciba.',
    recibido: 'El IVC ya lo recibió. Espera la decisión de la autoridad de policía: este reporte no bloquea a la persona por sí solo.',
    tramite: 'La autoridad abrió un procedimiento. Si termina en sanción, el IVC radica la medida.',
    derivo: 'Terminó en una medida correctiva. El detalle de la medida es reservado: lo ven la autoridad y el IVC.',
    archivado: 'El caso se archivó. No hay medida sobre esta persona por este reporte.'
  };
  var C97 = [['1', 'Armas u objetos peligrosos'], ['2', 'Estupefacientes'], ['3', 'Violencia contra la fuerza pública'], ['4', 'Invadir el terreno de juego'], ['5', 'Desatender a la logística en ubicación y tránsito'], ['6', 'Ingresar o ingerir bebidas alcohólicas']];
  var C98 = [['a', 'Agresión física'], ['b', 'Agresión verbal'], ['c', 'Daño a infraestructura']];
  var DOCS = [['CC', 'Cédula de ciudadanía'], ['TI', 'Tarjeta de identidad'], ['CE', 'Cédula de extranjería'], ['PA', 'Pasaporte'], ['PPT', 'Permiso por Protección Temporal']];
  var NOMBRES = ['Camilo Andrés Vélez Soto', 'Laura Marcela Ocampo Ríos', 'Sebastián Henao Gil', 'Daniela Cardona Mejía', 'Esteban Tobón Arias', 'Mariana Zapata Cano', 'Felipe Restrepo Toro', 'Valeria Monsalve Pino', 'Santiago Duque Marín', 'Juliana Barrientos Soto'];
  // Eventos del club en su estadio; `corto` coincide con el de la bandeja del IVC.
  var EVENTOS = [
    { corto: 'Nacional vs. Medellín · 28 sep', largo: 'Nacional vs. Medellín · 28 sep 2026 · Estadio Atanasio Girardot', fecha: '28 sep 2026', estado: 'finalizado', asist: '34.870', avisos: 41, rojos: 4, bloq: 12, autoridad: 'Inspección de Policía 14 de Medellín' },
    { corto: 'Nacional vs. Junior · 20 sep', largo: 'Nacional vs. Junior · 20 sep 2026 · Estadio Atanasio Girardot', fecha: '20 sep 2026', estado: 'finalizado', asist: '31.204', avisos: 27, rojos: 2, bloq: 7, autoridad: 'Inspección de Policía 14 de Medellín' },
    { corto: 'Nacional vs. Pereira · 10 ago', largo: 'Nacional vs. Pereira · 10 ago 2026 · Estadio Atanasio Girardot', fecha: '10 ago 2026', estado: 'finalizado', asist: '28.915', avisos: 19, rojos: 3, bloq: 5, autoridad: 'Inspección de Policía 14 de Medellín' },
    { corto: 'Nacional vs. Once Caldas · 4 oct', largo: 'Nacional vs. Once Caldas · 4 oct 2026 · Estadio Atanasio Girardot', fecha: '4 oct 2026', estado: 'proximo', asist: '22.480', asistEtq: 'boletas emitidas', avisos: null, rojos: null, bloq: 3, autoridad: 'Inspección de Policía 14 de Medellín' }
  ];

  window.PANTALLAS.entidades = function (raiz, ctx) {
    var D = ctx.D, disp, timerToast = null, zoom = 1;
    var scr = {};

    /* ---------- Datos de la demo (en memoria) ---------- */

    var C = [
      { id: 'grader', nombre: 'Graderío', estado: 'homologada', pruebas: [1, 1, 1, 1], aprobo: 'Natalia Rojas Cuesta · 12 ago 2026', llave: 'emitida', llaveFecha: '12 ago 2026',
        historial: [{ f: '3 ago 2026', t: 'Inició pruebas', q: 'Natalia Rojas Cuesta' }, { f: '12 ago 2026', t: 'Homologada: 4 de 4 casos aprobados', q: 'Natalia Rojas Cuesta' }, { f: '12 ago 2026', t: 'Llave emitida', q: 'Natalia Rojas Cuesta' }] },
      { id: 'tupalco', nombre: 'TuPalco', estado: 'homologada', pruebas: [1, 1, 1, 1], aprobo: 'Natalia Rojas Cuesta · 20 ago 2026', llave: 'sin', llaveFecha: '',
        historial: [{ f: '9 ago 2026', t: 'Inició pruebas', q: 'Natalia Rojas Cuesta' }, { f: '20 ago 2026', t: 'Homologada: 4 de 4 casos aprobados', q: 'Natalia Rojas Cuesta' }] },
      { id: 'boletea', nombre: 'Boletea', estado: 'enpruebas', pruebas: [1, 1, 1, 0], aprobo: '', llave: 'sin', llaveFecha: '',
        historial: [{ f: '15 sep 2026', t: 'Inició pruebas', q: 'Natalia Rojas Cuesta' }, { f: '25 sep 2026', t: 'Corrida de pruebas: 3 de 4 casos', q: 'Portal de integración' }] },
      { id: 'entradaya', nombre: 'EntradaYa', estado: 'pendiente', pruebas: [0, 0, 0, 0], aprobo: '', llave: 'sin', llaveFecha: '',
        historial: [{ f: '22 sep 2026', t: 'Solicitó la homologación', q: 'EntradaYa' }] },
      { id: 'andina', nombre: 'Ticketera Andina', estado: 'suspendida', pruebas: [1, 1, 1, 1], aprobo: 'Natalia Rojas Cuesta · 14 feb 2026', llave: 'emitida', llaveFecha: '14 feb 2026', motivo: 'Incumplió el tiempo de respuesta en tres eventos',
        historial: [{ f: '14 feb 2026', t: 'Homologada: 4 de 4 casos aprobados', q: 'Natalia Rojas Cuesta' }, { f: '21 sep 2026', t: 'Suspendida · incumplió el tiempo de respuesta en tres eventos', q: 'Natalia Rojas Cuesta' }] }
    ];
    var R = [
      { id: 'g1', sem: '2026-II', club: CLUB, estadio: 'Estadio Atanasio Girardot', c: null, estado: 'pendiente', envio: '', aprobo: '' },
      { id: 'g2', sem: '2026-II', club: 'Independiente Medellín', estadio: 'Estadio Atanasio Girardot', c: 'tupalco', estado: 'aprobado', envio: '4 sep', aprobo: 'Natalia Rojas Cuesta · 8 sep 2026' },
      { id: 'g3', sem: '2026-II', club: 'Millonarios', estadio: 'Estadio El Campín', c: null, estado: 'pendiente', envio: '', aprobo: '', atrasado: 14 },
      { id: 'g4', sem: '2026-II', club: 'Junior', estadio: 'Estadio Metropolitano', c: 'grader', estado: 'revision', envio: '12 sep', aprobo: '' },
      { id: 'g5', sem: '2026-II', club: 'Junior', estadio: 'Estadio Metropolitano', c: 'boletea', estado: 'revision', envio: '12 sep', aprobo: '' },
      { id: 'g6', sem: '2026-II', club: 'Santa Fe', estadio: 'Estadio El Campín', c: 'andina', estado: 'revision', envio: '10 sep', aprobo: '' },
      { id: 'g7', sem: '2026-II', club: 'América de Cali', estadio: 'Estadio Pascual Guerrero', c: 'entradaya', estado: 'revision', envio: '16 sep', aprobo: '' },
      { id: 'h1', sem: '2026-I', club: CLUB, estadio: 'Estadio Atanasio Girardot', c: 'grader', estado: 'aprobado', envio: '6 feb', aprobo: 'Natalia Rojas Cuesta · 14 feb 2026' },
      { id: 'h2', sem: '2026-I', club: 'Independiente Medellín', estadio: 'Estadio Atanasio Girardot', c: 'andina', estado: 'aprobado', envio: '8 feb', aprobo: 'Natalia Rojas Cuesta · 14 feb 2026' },
      { id: 'h3', sem: '2026-I', club: 'Millonarios', estadio: 'Estadio El Campín', c: 'grader', estado: 'aprobado', envio: '9 feb', aprobo: 'Natalia Rojas Cuesta · 14 feb 2026' }
    ];
    var RP = D.ivc.reportes.filter(function (r) { return r.entidad === CLUB; }).map(function (r) {
      return { id: r.id, estado: r.estado, nombre: r.nombre, doc: r.doc, corto: r.corto, hechos: r.hechos, autoridad: r.autoridad, conductas: r.conductas, evid: r.evid || {}, descripcion: r.descripcion, motivoArchivo: r.motivoArchivo || '', fecha: r.fecha,
        historial: r.historial.map(function (h) {
          // Sin el nombre del funcionario del IVC ni el radicado de la medida: la entidad solo sabe el estado.
          var t = /medida MC-/.test(h.texto) ? 'Derivó en una medida' : h.texto.replace(/ · oficio .*/, '');
          return { f: h.fecha, t: t, q: /entidad/.test(h.texto) ? 'Tu entidad' : 'IVC' };
        }) };
    });

    function comerc(id) { return C.filter(function (c) { return c.id === id; })[0] || null; }
    function fila(id) { return R.filter(function (r) { return r.id === id; })[0]; }
    function nClubes(c) { var n = R.filter(function (r) { return r.c === c.id && r.sem === '2026-II'; }).length; return n + (n === 1 ? ' club' : ' clubes') + ' este semestre'; }
    function pasadas(c) { return c.pruebas.filter(Boolean).length; }
    function activa(c) { return !!c && c.estado === 'homologada'; }
    function miFila() { return R.filter(function (r) { return r.sem === '2026-II' && r.club === CLUB; })[0]; }

    /* ---------- Estado de la pantalla ---------- */

    var cara0 = ctx.rol === 'mindeporte' ? 'mindeporte' : 'club';
    var st = {
      cara: cara0, vista: cara0 === 'club' ? 'reporte' : 'semestrales', toast: null,
      club: { comerc: 'grader', nota: '', sel: 'R-2026-0431', filtro: 'todos', rep: nuevoReporte(), ultimo: null },
      md: { sem: '2026-II', filtro: 'todos', sel: 'g4', selC: 'grader', accion: '', motivo: '', nota: '' }
    };

    function nuevoReporte() {
      return { tipo: 'CC', numero: '1.037.512.884', ani: null, evento: EVENTOS[0].corto, conductas: {}, descripcion: '', evid: [] };
    }

    /* ---------- Piezas comunes ---------- */

    function opciones(lista, val) {
      return lista.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
        return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>';
      }).join('');
    }
    function campo(etiqueta, control, cls) { return '<label class="en-campo' + (cls ? ' ' + cls : '') + '"><span>' + etiqueta + '</span>' + control + '</label>'; }
    function lista(s, k, ops, val, extra) { return '<select data-s="' + s + '" data-k="' + k + '" ' + (extra || '') + '>' + opciones(ops, val) + '</select>'; }
    function entrada(s, k, val, extra) { return '<input data-s="' + s + '" data-k="' + k + '" value="' + esc(val) + '" ' + (extra || '') + '>'; }
    function tag(cls, texto) { return '<span class="en-tag en-tag--' + cls + '">' + esc(texto) + '</span>'; }
    function tagCert(e) { return tag('c-' + e, CERT[e].tag); }
    function tagRep(e) { return tag('r-' + e, REP[e]); }
    function tagEtapa(e) { return tag('e-' + e, ETAPA[e]); }
    function chip(acc, id, on, texto, n) {
      return '<button type="button" class="en-chip" aria-pressed="' + on + '" data-acc="' + acc + '" data-id="' + id + '">' + esc(texto) + '<span class="en-chip__n">' + n + '</span></button>';
    }
    function kv(k, v) { return '<div class="en-kv"><span class="en-sub">' + esc(k) + '</span><span class="en-kv__v">' + v + '</span></div>'; }
    function seccion(titulo, cuerpo) { return '<section class="en-sec"><h3 class="en-sec__h">' + esc(titulo) + '</h3>' + cuerpo + '</section>'; }
    function aviso(tipo, titulo, texto) {
      return '<div class="en-aviso en-aviso--' + tipo + '" role="note">' + ico(tipo === 'ok' ? 'positive' : tipo === 'alerta' ? 'caution' : 'info') + '<div><b>' + esc(titulo) + '</b>' + (texto ? '<p>' + esc(texto) + '</p>' : '') + '</div></div>';
    }
    function historia(items) {
      return '<ol class="en-historia">' + items.map(function (h) {
        return '<li class="en-hist"><span class="en-pt"></span><span class="en-hist__f">' + esc(h.f) + '</span><span class="en-hist__t"><span>' + esc(h.t) + '</span><span class="en-sub">' + esc(h.q) + '</span></span></li>';
      }).join('') + '</ol>';
    }
    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    /* ---------- Barra y pestañas ---------- */

    function barra() {
      var u = st.cara === 'club' ? USUARIO_CL : USUARIO_MD;
      var ent = st.cara === 'club' ? '<span class="en-monograma" aria-label="' + esc(CLUB) + '">AN</span>' : '';
      return '<header class="en-barra"><span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span><span class="en-barra__sep" aria-hidden="true"></span>' +
        '<span class="en-barra__ttl">Entidades y comercializadoras</span>' +
        '<span class="en-usuario"><b>' + esc(u.nombre) + '</b><span class="en-sub"> · ' + esc(st.cara === 'club' ? CLUB + ' · ' + u.cargo : u.cargo) + '</span></span>' + ent + window.NAOWEE.entidades + '</header>';
    }

    function titulos() {
      var tab = function (id, texto, n) {
        return '<button type="button" class="en-ttab" data-acc="vista" data-id="' + id + '"' + (st.vista === id ? ' aria-current="page"' : '') + '>' + texto + (n ? '<span class="en-nav__n" aria-label="' + n + ' pendientes">' + n + '</span>' : '') + '</button>';
      };
      var tabs, accion = '';
      if (st.cara === 'club') {
        tabs = tab('reporte', 'Reporte semestral') + tab('incidentes', 'Reportes de incidentes') + tab('eventos', 'Mis eventos');
        accion = '<button type="button" class="en-btn en-btn--pri" data-acc="ir-reportar">' + ico('add') + 'Reportar incidente</button>';
      } else {
        var revision = R.filter(function (r) { return r.estado === 'revision'; }).length;
        tabs = tab('semestrales', 'Reportes semestrales', revision) + tab('certificacion', 'Certificación de comercializadoras');
      }
      var h1 = { reporte: 'Reporte semestral', incidentes: 'Reportes de incidentes', eventos: 'Mis eventos', semestrales: 'Reportes semestrales', certificacion: 'Certificación de comercializadoras' }[st.vista];
      return '<div class="en-titulos"><h1 class="en-vh">' + h1 + '</h1><nav class="en-tabs" aria-label="Secciones">' + tabs + '</nav>' + accion + '</div>';
    }

    /* ---------- Club · Reporte semestral ---------- */

    // La respuesta a "¿mi comercializadora puede vender este semestre?", calculada de la fila y la certificación.
    function respuestaClub(f) {
      var c = comerc(f.c);
      if (!c) { return { t: 'neutro', titulo: 'Aún no has reportado tu comercializadora', txt: 'Mindeporte aprueba el reporte semestral una vez lo envías. Sin comercializadora homologada no se vende en tu estadio.' }; }
      if (f.estado === 'aprobado' && activa(c)) { return { t: 'ok', titulo: 'Sí: ' + c.nombre + ' puede vender en tu estadio este semestre', txt: 'Reporte aprobado y certificación activa.' }; }
      if (f.estado === 'aprobado') { return { t: 'alerta', titulo: 'Por ahora no: ' + c.nombre + ' está ' + CERT[c.estado].tag.toLowerCase(), txt: 'Tu reporte está aprobado, pero la certificación de interoperabilidad no está activa. Mindeporte te avisará cuando cambie.' }; }
      if (activa(c)) { return { t: 'info', titulo: 'En revisión: ' + c.nombre + ' está homologada', txt: 'Falta que Mindeporte apruebe tu reporte.' }; }
      var causa = c.estado === 'enpruebas' ? 'está en pruebas (' + pasadas(c) + ' de 4 casos)' : c.estado === 'pendiente' ? 'aún no inicia pruebas' : 'está ' + CERT[c.estado].tag.toLowerCase();
      return { t: 'alerta', titulo: 'Todavía no: ' + c.nombre + ' ' + causa, txt: 'Mindeporte no puede aprobar tu reporte hasta que su certificación esté activa. Puedes cambiar de comercializadora.' };
    }

    function vistaReporte() {
      var f = miFila(), c = comerc(f.c), r = respuestaClub(f), k = st.club;
      var pasos = [['Enviado', f.envio ? f.envio + ' sep' : '', f.estado !== 'pendiente'], ['En revisión', 'Mindeporte', f.estado === 'revision' || f.estado === 'aprobado'], ['Aprobado', f.estado === 'aprobado' ? f.aprobo.split(' · ')[1] : '', f.estado === 'aprobado']];
      var cuerpo;
      if (f.estado === 'pendiente') {
        var sel = comerc(k.comerc);
        var ops = C.filter(function (x) { return x.estado !== 'revocada'; }).map(function (x) { return [x.id, x.nombre + ' · ' + CERT[x.estado].tag]; });
        cuerpo = '<section class="en-card"><h2 class="en-h2">Reporta tu comercializadora</h2>' +
          '<div class="en-form">' +
            campo('Semestre', '<select disabled><option>2026-II</option></select>') +
            campo('Estadio', '<select disabled><option>Estadio Atanasio Girardot</option></select>') +
            campo('Comercializadora que vende en tu estadio', lista('f', 'comerc', ops, k.comerc), 'en-campo--ancho') +
            campo('Nota para Mindeporte (opcional)', '<textarea data-s="f" data-k="nota" rows="2" placeholder="Por ejemplo: también vende la taquilla del estadio">' + esc(k.nota) + '</textarea>', 'en-campo--ancho') +
          '</div>' +
          (!activa(sel) ? aviso('alerta', sel.nombre + ' no tiene la certificación activa', 'Puedes enviar el reporte, pero Mindeporte solo lo aprueba cuando esté homologada.') : aviso('ok', sel.nombre + ' está homologada', 'Mindeporte revisará tu reporte.')) +
          '<div class="en-acciones"><button type="button" class="en-btn en-btn--pri" data-acc="enviar-reporte">Enviar reporte</button></div></section>';
      } else {
        cuerpo = '<section class="en-card"><h2 class="en-h2">Tu reporte</h2>' +
          '<div class="en-kvs">' + kv('Semestre', '2026-II') + kv('Estadio', esc(f.estadio)) + kv('Comercializadora', esc(c.nombre)) + kv('Certificación', tagCert(c.estado)) + '</div>' +
          '<ol class="en-pasos">' + pasos.map(function (p) { return '<li class="en-paso' + (p[2] ? ' en-paso--hecho' : '') + '"><span class="en-paso__pt">' + (p[2] ? CHECK : '') + '</span><span><b>' + p[0] + '</b><span class="en-sub">' + esc(p[1]) + '</span></span></li>'; }).join('') + '</ol>' +
          (f.estado === 'revision' ? '<div class="en-acciones"><button type="button" class="en-btn" data-acc="retirar-reporte">Retirar y corregir</button></div>' : '') + '</section>';
      }
      var previos = R.filter(function (x) { return x.club === CLUB && x.sem !== '2026-II'; });
      var anteriores = '<section class="en-card"><h2 class="en-h2">Semestres anteriores</h2><div class="en-lista-simple">' + previos.map(function (x) {
        return '<div class="en-simple"><span class="en-fuerte">' + x.sem + '</span><span>' + esc(comerc(x.c).nombre) + '</span>' + tagRep(x.estado) + '<span class="en-sub">' + esc(x.aprobo) + '</span></div>';
      }).join('') + '</div></section>';
      return '<div class="en-cuerpo en-cuerpo--solo"><div class="en-main en-main--centro" data-sc="main">' +
        '<div><h2 class="en-h1">Reporte semestral 2026-II</h2><p class="en-sub">' + esc(CLUB) + ' · Estadio Atanasio Girardot</p></div>' +
        '<div class="en-resp en-resp--' + r.t + '"><span class="en-resp__ico">' + ico(r.t === 'ok' ? 'positive' : r.t === 'alerta' ? 'caution' : 'info') + '</span><div><p class="en-resp__t">' + esc(r.titulo) + '</p><p>' + esc(r.txt) + '</p></div></div>' +
        cuerpo + anteriores + '</div></div>';
    }

    /* ---------- Club · Reportes de incidentes ---------- */

    function conteoEtapa(e) { return e === 'todos' ? RP.length : RP.filter(function (r) { return r.estado === e; }).length; }

    function vistaIncidentes() {
      var k = st.club, vis = RP.filter(function (r) { return k.filtro === 'todos' || r.estado === k.filtro; });
      var chips = [['todos', 'Todos'], ['enviado', 'Enviados'], ['recibido', 'Recibidos'], ['tramite', 'En trámite'], ['derivo', 'Derivó en medida'], ['archivado', 'Archivados']]
        .map(function (c) { return chip('i-filtro', c[0], k.filtro === c[0], c[1], conteoEtapa(c[0])); }).join('');
      var filas = vis.length ? vis.map(function (r) {
        return '<button type="button" class="en-fila en-fila--inc" aria-pressed="' + (k.sel === r.id) + '" data-acc="i-sel" data-id="' + r.id + '">' +
          '<span class="en-c"><span class="en-fuerte">' + r.id + '</span><span class="en-sub">' + esc(r.fecha) + '</span></span>' +
          '<span class="en-c"><span class="en-cortar">' + esc(r.nombre) + '</span><span class="en-sub">' + esc(r.doc) + '</span></span>' +
          '<span class="en-c"><span class="en-cortar">' + esc(r.corto) + '</span><span class="en-sub en-cortar">' + esc(r.conductas[0]) + (r.conductas.length > 1 ? ' +' + (r.conductas.length - 1) : '') + '</span></span>' +
          '<span class="en-c">' + tagEtapa(r.estado) + '</span></button>';
      }).join('') : '<div class="en-vacio"><b>Sin reportes en este estado</b><span>Prueba con otro filtro.</span></div>';
      var tabla = '<div class="en-tabla"><div class="en-cols en-cols--inc"><span>Radicado</span><span>Persona</span><span>Evento y conducta</span><span>Estado</span></div>' +
        '<div class="en-lista" data-sc="lista">' + filas + '</div><div class="en-pie">' + vis.length + ' de ' + RP.length + ' reportes de ' + esc(CLUB) + '</div></div>';
      var sel = RP.filter(function (r) { return r.id === k.sel; })[0];
      return '<div class="en-cuerpo"><div class="en-main">' + '<div class="en-chips">' + chips + '</div>' + tabla + '</div>' + (sel ? detalleIncidente(sel) : detalleVacio('Elige un reporte para ver su seguimiento.')) + '</div>';
    }

    function detalleVacio(t) { return '<aside class="en-detalle en-detalle--vacio"><p class="en-sub">' + esc(t) + '</p></aside>'; }

    function detalleIncidente(r) {
      var ev = [];
      if (r.evid.fot) { ev.push(r.evid.fot + (r.evid.fot === 1 ? ' foto' : ' fotos')); }
      if (r.evid.vid) { ev.push('1 video'); }
      return '<aside class="en-detalle" aria-label="Seguimiento del reporte"><div class="en-detalle__cab"><div class="en-detalle__top"><span class="en-sub">' + r.id + '</span>' + tagEtapa(r.estado) +
        '<button type="button" class="en-cerrar" data-acc="i-cerrar" aria-label="Cerrar el detalle">' + ico('close') + '</button></div><h2 class="en-h2">' + esc(r.nombre) + '</h2><p class="en-sub">' + esc(r.doc) + '</p></div>' +
        '<div class="en-detalle__cuerpo" data-sc="det">' +
          '<div class="en-caja"><p class="en-fuerte">¿Qué sigue?</p><p>' + esc(ETAPA_SIGUE[r.estado]) + (r.estado === 'archivado' && r.motivoArchivo ? ' Motivo: ' + esc(r.motivoArchivo.toLowerCase()) + '.' : '') + '</p></div>' +
          seccion('Seguimiento', historia(r.historial)) +
          seccion('Lo que reportaste', '<div class="en-kvs">' + kv('Evento', esc(r.corto)) + kv('Hechos', esc(r.hechos)) + kv('Conductas', esc(r.conductas.join(' · '))) + kv('Evidencia', esc(ev.join(' y ') || 'Sin evidencia')) + '</div><p class="en-texto">' + esc(r.descripcion) + '</p>') +
          seccion('Quién lo recibió', '<p class="en-texto">' + esc(r.autoridad) + ' y el IVC.</p>') +
        '</div><div class="en-detalle__pie">Solo ves el estado de tus reportes. El expediente y las medidas son reservados.</div></aside>';
    }

    /* ---------- Club · Reportar incidente ---------- */

    // Verificación contra el ANI simulada: un número que termina en 0000 no existe; una TI es de un menor.
    function consultarAni(x) {
      var d = digitos(x.numero);
      if (d.length < 5) { return { ok: false, msg: 'Escribe el número completo del documento.' }; }
      if (/0000$/.test(d)) { return { ok: false, msg: 'El ANI no encontró este documento. Revisa el número o el tipo.' }; }
      var nombre = NOMBRES[+d.slice(-1)];
      if (x.tipo === 'TI') { return { ok: true, menor: true, nombre: nombre, iniciales: nombre.split(' ').map(function (w) { return w.charAt(0); }).join('. ') + '.' }; }
      return { ok: true, nombre: nombre };
    }
    function faltaReporte(x) {
      var f = [];
      if (!x.ani || !x.ani.ok) { f.push('verificar a la persona con el ANI'); }
      if (!Object.keys(x.conductas).some(function (k) { return x.conductas[k]; })) { f.push('elegir al menos una conducta'); }
      if (x.descripcion.trim().length < 20) { f.push('describir lo ocurrido (mínimo 20 letras)'); }
      return f;
    }
    function eventoPor(corto) { return EVENTOS.filter(function (e) { return e.corto === corto; })[0]; }

    function vistaReportar() {
      var x = st.club.rep, ev = eventoPor(x.evento), falta = faltaReporte(x), a = x.ani;
      var anires = !a ? '<p class="en-sub">Verifica el documento antes de continuar.</p>'
        : !a.ok ? aviso('alerta', 'No se pudo verificar', a.msg)
        : a.menor ? aviso('info', 'Persona menor de edad', 'Sus datos quedan reservados: el reporte se envía con sus iniciales (' + a.iniciales + ') y llega igual a la autoridad y al IVC.')
        : aviso('ok', 'Verificada con el ANI', a.nombre + ' · ' + x.tipo + ' ' + x.numero);
      var conductas = function (titulo, arr, pref) {
        return '<fieldset class="en-conductas"><legend>' + titulo + '</legend>' + arr.map(function (c) {
          var clave = pref + c[0];
          return '<label class="en-check"><input type="checkbox" data-s="x" data-k="c:' + clave + '"' + (x.conductas[clave] ? ' checked' : '') + '><span>' + esc(c[1]) + '</span></label>';
        }).join('') + '</fieldset>';
      };
      var evid = x.evid.length ? '<ul class="en-evids">' + x.evid.map(function (e, i) { return '<li><span>' + ico(e.v ? 'play' : 'camera') + esc(e.n) + '</span><button type="button" class="en-link" data-acc="quitar-evid" data-id="' + i + '">Quitar</button></li>'; }).join('') + '</ul>' : '';
      return '<div class="en-cuerpo en-cuerpo--solo"><div class="en-main en-main--centro" data-sc="main">' +
        '<div class="en-fila-t"><button type="button" class="en-volver" data-acc="vista" data-id="incidentes">' + ico('arrow-left') + '<span>Volver a mis reportes</span></button><h2 class="en-h1">Reportar un incidente</h2></div>' +
        aviso('info', 'Este reporte no bloquea a la persona', 'Llega a la autoridad de policía y a la bandeja del IVC. La decisión sobre la persona es de la autoridad.') +
        '<section class="en-card"><h2 class="en-h2">1 · Persona</h2><div class="en-form en-form--ani">' +
          campo('Tipo de documento', lista('x', 'tipo', DOCS, x.tipo)) +
          campo('Número', entrada('x', 'numero', x.numero, 'inputmode="numeric" autocomplete="off"')) +
          '<button type="button" class="en-btn" data-acc="ani">' + ico('search') + 'Verificar con el ANI</button></div>' + anires + '</section>' +
        '<section class="en-card"><h2 class="en-h2">2 · Evento y conductas</h2><div class="en-form">' +
          campo('Evento', lista('x', 'evento', EVENTOS.filter(function (e) { return e.estado === 'finalizado'; }).map(function (e) { return [e.corto, e.largo]; }), x.evento), 'en-campo--ancho') + '</div>' +
          '<p class="en-sub">Fecha de los hechos: ' + esc(ev.fecha) + '</p>' +
          '<div class="en-conductas-fila">' + conductas('Artículo 97 · conductas contrarias', C97, '97-') + conductas('Artículo 98 · agresiones y daños', C98, '98-') + '</div></section>' +
        '<section class="en-card"><h2 class="en-h2">3 · Descripción y evidencia</h2>' +
          campo('Qué pasó', '<textarea data-s="x" data-k="descripcion" rows="3" placeholder="Describe lo que vio tu logística: dónde, cuándo y qué hizo la persona.">' + esc(x.descripcion) + '</textarea>', 'en-campo--ancho') +
          '<div class="en-fila-btn"><button type="button" class="en-btn" data-acc="adj-foto">' + ico('camera') + 'Adjuntar foto</button><button type="button" class="en-btn" data-acc="adj-video">' + ico('play') + 'Adjuntar video</button></div>' + evid + '</section>' +
        '<section class="en-card en-card--envio"><p class="en-texto"><b>Llegará a:</b> ' + esc(ev.autoridad) + ' y al IVC.</p>' +
          '<div class="en-acciones">' + (falta.length ? '<p class="en-sub en-falta">Falta: ' + esc(falta.join(', ')) + '.</p>' : '') +
          '<button type="button" class="en-btn en-btn--pri" data-acc="enviar-incidente"' + (falta.length ? ' disabled' : '') + '>Enviar reporte</button></div></section>' +
        '</div></div>';
    }

    function vistaEnviado() {
      var u = st.club.ultimo;
      return '<div class="en-cuerpo en-cuerpo--solo"><div class="en-main en-main--centro">' +
        '<section class="en-card en-exito" tabindex="-1" id="en-exito"><span class="en-exito__ico">' + CHECK + '</span><h2 class="en-h1">Reporte enviado</h2>' +
        '<p class="en-texto">Radicado <b>' + esc(u.id) + '</b> · ' + tagEtapa('enviado') + '</p>' +
        '<ul class="en-llega"><li>' + CHECK + '<span>Llegó a ' + esc(u.autoridad) + '</span></li><li>' + CHECK + '<span>Llegó a la bandeja del IVC</span></li></ul>' +
        '<p class="en-sub">El reporte no bloquea a la persona por sí solo. Sigue su estado en «Reportes de incidentes».</p>' +
        '<div class="en-acciones"><button type="button" class="en-btn" data-acc="otro-reporte">Reportar otro</button><button type="button" class="en-btn en-btn--pri" data-acc="ver-incidentes">Ver mis reportes</button></div></section></div></div>';
    }

    /* ---------- Club · Mis eventos ---------- */

    function vistaEventos() {
      var filas = EVENTOS.map(function (e) {
        var n = RP.filter(function (r) { return r.corto === e.corto; }).length;
        var vivo = e.estado === 'proximo';
        return '<div class="en-fila en-fila--ev" role="row"><span class="en-c"><span class="en-fuerte en-cortar">' + esc(e.corto.split(' · ')[0]) + '</span><span class="en-sub">Estadio Atanasio Girardot</span></span>' +
          '<span class="en-c"><span>' + esc(e.fecha) + '</span>' + tag(vivo ? 'prox' : 'fin', vivo ? 'Próximo' : 'Finalizado') + '</span>' +
          '<span class="en-c en-num"><b>' + e.asist + '</b><span class="en-sub">' + (e.asistEtq || 'asistentes') + '</span></span>' +
          '<span class="en-c en-num">' + (e.avisos == null ? '<span class="en-sub">—</span>' : '<b>' + e.avisos + '</b>') + '</span>' +
          '<span class="en-c en-num">' + (e.rojos == null ? '<span class="en-sub">—</span>' : '<b>' + e.rojos + '</b>') + '</span>' +
          '<span class="en-c en-num"><b>' + e.bloq + '</b></span>' +
          '<span class="en-c en-num"><b>' + n + '</b></span>' +
          '<span class="en-c">' + (vivo ? '' : '<button type="button" class="en-btn en-btn--chico" data-acc="reportar-de" data-id="' + esc(e.corto) + '">Reportar</button>') + '</span></div>';
      }).join('');
      return '<div class="en-cuerpo en-cuerpo--solo"><div class="en-main" data-sc="main"><div class="en-tabla"><div class="en-cols en-cols--ev"><span>Partido</span><span>Fecha</span><span>Ingreso</span><span>Avisos</span><span>Remitidos a la Policía</span><span>Ventas bloqueadas</span><span>Reportes</span><span></span></div>' +
        '<div class="en-lista">' + filas + '</div><div class="en-pie">Cifras agregadas de tus eventos. El detalle por transacción vive en la Auditoría, que Mindeporte y la Policía consultan.</div></div></div></div>';
    }

    /* ---------- Mindeporte · Reportes semestrales ---------- */

    // Por qué un reporte todavía no se puede aprobar (null si se puede).
    function bloqueoAprobar(f) {
      if (f.estado === 'aprobado') { return 'Ya está aprobado.'; }
      if (f.estado === 'pendiente') { return 'El club aún no envió su reporte.'; }
      var c = comerc(f.c);
      if (activa(c)) { return null; }
      if (c.estado === 'enpruebas') { return c.nombre + ' está en pruebas: ' + pasadas(c) + ' de 4 casos aprobados.'; }
      if (c.estado === 'pendiente') { return c.nombre + ' aún no inicia pruebas de interoperabilidad.'; }
      return c.nombre + ' está ' + CERT[c.estado].tag.toLowerCase() + '.';
    }

    function filasSem() { return R.filter(function (r) { return r.sem === st.md.sem; }); }
    function conteoRep(e) {
      var l = filasSem();
      return e === 'todos' ? l.length : e === 'atrasado' ? l.filter(function (r) { return r.atrasado; }).length : l.filter(function (r) { return r.estado === e; }).length;
    }

    function vistaSemestrales() {
      var m = st.md, vis = filasSem().filter(function (r) { return m.filtro === 'todos' || (m.filtro === 'atrasado' ? r.atrasado : r.estado === m.filtro); });
      var atr = conteoRep('atrasado');
      var chips = [['todos', 'Todos'], ['revision', 'En revisión'], ['aprobado', 'Aprobados'], ['pendiente', 'Sin reportar'], ['atrasado', 'Atrasados']]
        .map(function (c) { return chip('s-filtro', c[0], m.filtro === c[0], c[1], conteoRep(c[0])); }).join('');
      var filas = vis.length ? vis.map(function (r) {
        var c = comerc(r.c);
        return '<button type="button" class="en-fila en-fila--sem" aria-pressed="' + (m.sel === r.id) + '" data-acc="s-sel" data-id="' + r.id + '">' +
          '<span class="en-c"><span class="en-fuerte en-cortar">' + esc(r.club) + '</span><span class="en-sub en-cortar">' + esc(r.estadio) + '</span></span>' +
          '<span class="en-c">' + (c ? '<span>' + esc(c.nombre) + '</span>' : '<span class="en-sub">Sin comercializadora</span>') + '</span>' +
          '<span class="en-c">' + (c ? tagCert(c.estado) : '<span class="en-sub">—</span>') + '</span>' +
          '<span class="en-c">' + tagRep(r.estado) + (r.atrasado ? '<span class="en-atraso">Atrasado ' + r.atrasado + ' días</span>' : r.envio ? '<span class="en-sub">Envió ' + esc(r.envio) + '</span>' : '') + '</span></button>';
      }).join('') : '<div class="en-vacio"><b>Nada en este filtro</b><span>Prueba con otro.</span></div>';
      var tabla = '<div class="en-tabla"><div class="en-herr"><label class="en-sem"><span>Semestre</span>' + lista('m', 'sem', ['2026-II', '2026-I'], m.sem) + '</label><div class="en-chips en-chips--fila">' + chips + '</div></div>' +
        '<div class="en-cols en-cols--sem"><span>Club y estadio</span><span>Comercializadora</span><span>Certificación</span><span>Reporte</span></div>' +
        '<div class="en-lista" data-sc="lista">' + filas + '</div><div class="en-pie">' + vis.length + ' de ' + filasSem().length + ' registros · un registro por club, estadio, semestre y comercializadora</div></div>';
      var sel = fila(m.sel);
      return '<div class="en-cuerpo"><div class="en-main">' +
        (m.sem === '2026-II' && atr ? aviso('alerta', atr === 1 ? '1 club sin reportar y atrasado' : atr + ' clubes sin reportar y atrasados', 'El plazo del semestre 2026-II venció el 15 de septiembre.') : '') +
        tabla + '</div>' + (sel && sel.sem === m.sem ? detalleSem(sel) : detalleVacio('Elige un registro para revisarlo.')) + '</div>';
    }

    function detalleSem(f) {
      var c = comerc(f.c), motivo = bloqueoAprobar(f), ok = !motivo;
      var revis = '<ul class="en-revis">' +
        '<li class="' + (f.estado !== 'pendiente' ? 'ok' : 'no') + '">' + (f.estado !== 'pendiente' ? CHECK : EQUIS) + '<span>Reporte del club recibido</span></li>' +
        '<li class="' + (activa(c) ? 'ok' : 'no') + '">' + (activa(c) ? CHECK : EQUIS) + '<span>Comercializadora con certificación activa</span></li></ul>';
      var pie = f.estado === 'aprobado'
        ? '<p class="en-texto"><b>Aprobado</b> · ' + esc(f.aprobo) + '</p>'
        : '<button type="button" class="en-btn en-btn--pri" data-acc="aprobar"' + (ok ? '' : ' disabled') + '>Aprobar reporte</button>' + (motivo ? '<p class="en-sub en-falta">' + esc(motivo) + '</p>' : '<p class="en-sub">Al aprobar, el club ve que su comercializadora puede vender este semestre.</p>');
      return '<aside class="en-detalle" aria-label="Reporte semestral"><div class="en-detalle__cab"><div class="en-detalle__top"><span class="en-sub">' + f.sem + '</span>' + tagRep(f.estado) +
        '<button type="button" class="en-cerrar" data-acc="s-cerrar" aria-label="Cerrar el detalle">' + ico('close') + '</button></div><h2 class="en-h2">' + esc(f.club) + '</h2><p class="en-sub">' + esc(f.estadio) + '</p></div>' +
        '<div class="en-detalle__cuerpo" data-sc="det">' +
          seccion('Qué se revisa antes de aprobar', revis) +
          (c ? seccion('Comercializadora', '<div class="en-caja"><div class="en-kvs">' + kv('Nombre', esc(c.nombre)) + kv('Certificación', tagCert(c.estado)) + kv('Pruebas', pasadas(c) + ' de 4 casos') + kv('Llave', c.llave === 'emitida' ? 'Emitida' : 'Sin emitir') + '</div></div>' +
            '<button type="button" class="en-link" data-acc="ver-cert" data-id="' + c.id + '">Ver su certificación</button>') : '') +
          (f.atrasado ? aviso('alerta', 'Atrasado ' + f.atrasado + ' días', 'El club no ha cargado su comercializadora para este semestre.') : '') +
          (f.envio ? seccion('Reporte', '<div class="en-kvs">' + kv('Enviado', esc(f.envio)) + kv('Estado', REP[f.estado]) + '</div>') : '') +
        '</div><div class="en-detalle__pie en-detalle__pie--acc">' + pie + '</div></aside>';
    }

    /* ---------- Mindeporte · Certificación ---------- */

    function vistaCertificacion() {
      var m = st.md;
      var filas = C.map(function (c) {
        return '<button type="button" class="en-fila en-fila--cert" aria-pressed="' + (m.selC === c.id) + '" data-acc="c-sel" data-id="' + c.id + '">' +
          '<span class="en-c"><span class="en-fuerte">' + esc(c.nombre) + '</span><span class="en-sub">' + nClubes(c) + '</span></span>' +
          '<span class="en-c">' + tagCert(c.estado) + '</span>' +
          '<span class="en-c"><span class="en-num"><b>' + pasadas(c) + '</b> de 4</span><span class="en-sub">casos aprobados</span></span>' +
          '<span class="en-c"><span class="en-cortar">' + esc(c.aprobo || '—') + '</span></span>' +
          '<span class="en-c"><span>' + (c.llave === 'emitida' ? 'Emitida' : c.estado === 'revocada' ? 'Revocada' : 'Sin emitir') + '</span></span></button>';
      }).join('');
      var tabla = '<div class="en-tabla"><div class="en-cols en-cols--cert"><span>Comercializadora</span><span>Estado</span><span>Pruebas</span><span>Aprobó y cuándo</span><span>Llave</span></div>' +
        '<div class="en-lista" data-sc="lista">' + filas + '</div><div class="en-pie">La certificación es de la comercializadora; el reporte semestral lo aprueba cada club-estadio.</div></div>';
      var c = comerc(m.selC);
      return '<div class="en-cuerpo"><div class="en-main">' + tabla + '</div>' + (c ? detalleCert(c) : detalleVacio('Elige una comercializadora.')) + '</div>';
    }

    function detalleCert(c) {
      var m = st.md, e = c.estado;
      var pruebas = '<ul class="en-pruebas">' + CASOS_PRUEBA.map(function (t, i) {
        var hecho = c.pruebas[i];
        return '<li class="' + (hecho ? 'ok' : 'no') + '">' + (hecho ? CHECK : '<span class="en-guion">–</span>') + '<span>' + esc(t) + '</span></li>';
      }).join('') + '</ul>';
      var clubes = R.filter(function (r) { return r.c === c.id && r.sem === '2026-II'; });
      var botones = '', nota = '';
      if (m.accion) {
        var rev = m.accion === 'revocar';
        botones = '<div class="en-form en-form--una">' + campo(rev ? 'Motivo de la revocación' : 'Motivo de la suspensión',
          lista('m', 'motivo', [['', 'Elige un motivo'], 'Incumplió el tiempo de respuesta', 'Entregó datos de la consulta a terceros', 'Vendió sin consultar al SVN', 'Solicitud de la comercializadora'], m.motivo)) +
          campo('Observación (opcional)', '<textarea data-s="m" data-k="nota" rows="2">' + esc(m.nota) + '</textarea>') + '</div>' +
          '<div class="en-fila-btn"><button type="button" class="en-btn" data-acc="c-cancelar">Cancelar</button><button type="button" class="en-btn ' + (rev ? 'en-btn--rojo' : 'en-btn--pri') + '" data-acc="c-confirmar"' + (m.motivo ? '' : ' disabled') + '>' + (rev ? 'Revocar definitivamente' : 'Suspender') + '</button></div>' +
          (rev ? '<p class="en-sub">La revocación no se deshace: tendría que iniciar la homologación desde cero.</p>' : '<p class="en-sub">Mientras esté suspendida no consulta el SVN y no se aprueban reportes con ella.</p>');
      } else if (e === 'pendiente') {
        botones = '<button type="button" class="en-btn en-btn--pri" data-acc="c-iniciar">Iniciar pruebas</button><p class="en-sub">Le abre el ambiente de pruebas en su portal de integración.</p>';
      } else if (e === 'enpruebas') {
        var listo = pasadas(c) === 4;
        botones = '<button type="button" class="en-btn en-btn--pri" data-acc="c-homologar"' + (listo ? '' : ' disabled') + '>Homologar</button>' +
          (listo ? '<p class="en-sub">Las 4 pruebas pasaron. Al homologar se puede emitir la llave de producción.</p>' : '<p class="en-sub en-falta">Faltan ' + (4 - pasadas(c)) + ' caso' + (4 - pasadas(c) === 1 ? '' : 's') + ' por aprobar. La comercializadora los corre en su portal.</p>');
      } else if (e === 'homologada') {
        botones = (c.llave === 'sin' ? '<button type="button" class="en-btn en-btn--pri" data-acc="c-llave">Emitir llave</button>' : '<p class="en-texto en-ok">' + CHECK + ' Llave emitida el ' + esc(c.llaveFecha) + '</p>') +
          '<div class="en-fila-btn"><button type="button" class="en-btn" data-acc="c-suspender">Suspender</button><button type="button" class="en-btn en-btn--rojo-o" data-acc="c-revocar">Revocar</button></div>' +
          '<p class="en-sub">La llave no se muestra acá: la comercializadora la recibe una sola vez en su portal de integración.</p>';
      } else if (e === 'suspendida') {
        botones = '<button type="button" class="en-btn en-btn--pri" data-acc="c-reactivar">Reactivar</button><button type="button" class="en-btn en-btn--rojo-o" data-acc="c-revocar">Revocar</button>';
      } else {
        botones = '<p class="en-texto">Revocada. Para volver a vender tendría que pedir la homologación otra vez.</p>';
      }
      return '<aside class="en-detalle" aria-label="Certificación"><div class="en-detalle__cab"><div class="en-detalle__top"><span class="en-sub">Certificación de interoperabilidad</span>' + tagCert(e) +
        '<button type="button" class="en-cerrar" data-acc="c-cerrar" aria-label="Cerrar el detalle">' + ico('close') + '</button></div><h2 class="en-h2">' + esc(c.nombre) + '</h2>' +
        (c.motivo && e === 'suspendida' ? '<p class="en-sub">Motivo: ' + esc(c.motivo.toLowerCase()) + '</p>' : '') + '</div>' +
        '<div class="en-detalle__cuerpo" data-sc="det">' +
          seccion('Resultado de las pruebas · ' + pasadas(c) + ' de 4', pruebas) +
          seccion('Aprobación', '<div class="en-kvs">' + kv('Aprobó', esc(c.aprobo ? c.aprobo.split(' · ')[0] : '—')) + kv('Cuándo', esc(c.aprobo ? c.aprobo.split(' · ')[1] : '—')) + '</div>') +
          seccion('Clubes que la usan en 2026-II', clubes.length ? '<div class="en-pills">' + clubes.map(function (r) { return '<span class="en-pill">' + esc(r.club) + '</span>'; }).join('') + '</div>' : '<p class="en-sub">Ninguno todavía.</p>') +
          seccion('Historial', historia(c.historial.slice().reverse())) +
          '<p class="en-nota">Por definir con Mindeporte: qué pasa con las ventas en curso si la comercializadora se suspende o el semestre vence sin renovar.</p>' +
        '</div><div class="en-detalle__pie en-detalle__pie--acc">' + botones + '</div></aside>';
    }

    /* ---------- Panel del demo ---------- */

    function toolbar() {
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">Entidades y comercializadoras<span slot="subtitle">Club o entidad · Mindeporte</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }
    function tarjeta(titulo, cuerpo) { return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function guion() {
      var club = [
        ['g-enviar', 'file', 'informative', 'Enviar el reporte con Graderío'],
        ['g-enviar-pruebas', 'caution', 'negative', 'Reportar con Boletea (en pruebas)'],
        ['g-incidente', 'notification', 'informative', 'Reportar un incidente'],
        ['g-menor', 'privacy', 'informative', 'Reportar a un menor (TI)'],
        ['g-ani', 'search', 'negative', 'Documento que el ANI no halla'],
        ['g-derivo', 'history', 'informative', 'Seguir un reporte que derivó']
      ];
      var md = [
        ['g-aprobar', 'positive', 'informative', 'Aprobar con certificación activa'],
        ['g-bloqueado', 'caution', 'negative', 'Aprobar con pruebas pendientes'],
        ['g-atrasado', 'calendar', 'negative', 'Ver el club atrasado'],
        ['g-corrida', 'refresh', 'informative', 'Boletea termina sus pruebas'],
        ['g-llave', 'padlock-open', 'informative', 'Emitir la llave de TuPalco'],
        ['g-suspender', 'padlock-close', 'negative', 'Suspender a Graderío'],
        ['g-revocar', 'delete', 'negative', 'Revocar a EntradaYa']
      ];
      var items = (st.cara === 'club' ? club : md).map(function (p) { return '<nwt-detail-item actionable icon="' + p[1] + '" nwt-theme="' + p[2] + '" data-acc="' + p[0] + '">' + esc(p[3]) + '</nwt-detail-item>'; }).join('');
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Ver como', '<nwt-tabs id="tabs-cara" full-width></nwt-tabs>') +
        tarjeta('Probar', '<div class="pp-panel__lista">' + items + '</div>') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p>' +
      '</aside>';
    }
    function montarPanel() {
      var p = raiz.querySelector('.pp-panel');
      if (!p) { return; }
      var tabs = raiz.querySelector('#tabs-cara');
      tabs.items = [{ id: 'club', label: 'Club', value: 'club' }, { id: 'mindeporte', label: 'Mindeporte', value: 'mindeporte' }];
      tabs.value = st.cara;
      tabs.addEventListener('nwtChange', function (e) { cambiarCara(e.detail); });
    }
    function cambiarCara(c) {
      if (c === st.cara) { return; }
      st.cara = c; st.vista = c === 'club' ? 'reporte' : 'semestrales';
      scr = {}; refrescarPanel(); pintar();
    }
    function refrescarPanel() {
      var viejo = raiz.querySelector('.pp-panel'), abierto = viejo && viejo.classList.contains('pp-panel--abierto');
      var n = document.createElement('div');
      n.innerHTML = guion();
      var nuevo = n.firstChild;
      if (abierto) { nuevo.classList.add('pp-panel--abierto'); nuevo.querySelector('.pp-panel__toggle').setAttribute('aria-expanded', 'true'); }
      viejo.replaceWith(nuevo);
      montarPanel();
    }

    /* ---------- Pintado: conserva foco y scroll ---------- */

    function contenido() {
      var v = st.vista, cuerpo =
        v === 'reporte' ? vistaReporte() : v === 'incidentes' ? vistaIncidentes() : v === 'eventos' ? vistaEventos() : v === 'reportar' ? vistaReportar() : v === 'enviado' ? vistaEnviado() :
        v === 'semestrales' ? vistaSemestrales() : vistaCertificacion();
      var conTitulos = v !== 'reportar' && v !== 'enviado';
      return '<div class="pp-app en-app">' + barra() + (conTitulos ? titulos() : '') + cuerpo + toast() + '</div>';
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

    function hoyTxt() { return '29 sep 2026'; }
    function anotarC(c, texto) { c.historial.push({ f: hoyTxt(), t: texto, q: USUARIO_MD.nombre }); }
    function ir(v) { st.vista = v; st.toast = null; scr = {}; pintar(); }

    function enviarReporteSemestral() {
      var f = miFila(), c = comerc(st.club.comerc);
      f.c = c.id; f.estado = 'revision'; f.envio = '29 sep';
      mostrarToast('Reporte enviado', 'Mindeporte lo revisará con ' + c.nombre + '.', 'positive', 'positive');
    }

    function enviarIncidente() {
      var x = st.club.rep, ev = eventoPor(x.evento), a = x.ani;
      var n = 32 + RP.filter(function (r) { return /^R-2026-04(3[2-9]|[4-9])/.test(r.id); }).length;
      var conductas = [];
      C97.forEach(function (c) { if (x.conductas['97-' + c[0]]) { conductas.push(c[1] + ' (art. 97, ' + c[0] + ')'); } });
      C98.forEach(function (c) { if (x.conductas['98-' + c[0]]) { conductas.push(c[1] + ' (art. 98, ' + c[0] + ')'); } });
      var r = { id: 'R-2026-04' + n, estado: 'enviado', nombre: a.menor ? a.iniciales : a.nombre, doc: a.menor ? x.tipo + ' ••••' + digitos(x.numero).slice(-4) : x.tipo + ' ' + x.numero, corto: ev.corto, hechos: ev.fecha, autoridad: ev.autoridad,
        conductas: conductas, evid: { fot: x.evid.filter(function (e) { return !e.v; }).length, vid: x.evid.some(function (e) { return e.v; }) }, descripcion: x.descripcion.trim(), motivoArchivo: '', fecha: '29 sep · 10:14',
        historial: [{ f: '29 sep 2026', t: 'Enviado por tu entidad', q: 'Tu entidad' }] };
      RP.unshift(r);
      st.club.ultimo = r; st.club.sel = r.id; st.club.filtro = 'todos';
      st.club.rep = nuevoReporte();
      st.vista = 'enviado'; scr = {}; pintar();
      var h = disp.querySelector('#en-exito'); if (h) { h.focus({ preventScroll: true }); }
    }

    function aprobarSemestral(f) {
      if (bloqueoAprobar(f)) { return; }
      f.estado = 'aprobado'; f.aprobo = USUARIO_MD.nombre + ' · ' + hoyTxt();
      mostrarToast('Reporte aprobado', f.club + ' · ' + comerc(f.c).nombre, 'positive', 'positive');
    }

    function confirmarAccion(c) {
      var m = st.md; if (!m.motivo) { return; }
      var rev = m.accion === 'revocar';
      c.estado = rev ? 'revocada' : 'suspendida'; c.motivo = m.motivo;
      if (rev) { c.llave = 'revocada'; }
      anotarC(c, (rev ? 'Revocada · ' : 'Suspendida · ') + m.motivo.toLowerCase());
      m.accion = ''; m.motivo = ''; m.nota = '';
      mostrarToast(rev ? 'Comercializadora revocada' : 'Comercializadora suspendida', c.nombre + ' dejó de consultar el SVN.', rev ? 'negative' : 'informative', rev ? 'caution' : 'info');
    }

    function onClick(ev) {
      var el = ev.target.closest('[data-acc],[data-zoom]');
      if (!el) { return; }
      var d = el.dataset, k = st.club, m = st.md;
      if (d.zoom) { zoom = d.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      if (el.disabled) { return; }
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'vista': ir(d.id); return;
        // Club
        case 'ir-reportar': ir('reportar'); return;
        case 'enviar-reporte': enviarReporteSemestral(); return;
        case 'retirar-reporte': var f0 = miFila(); f0.estado = 'pendiente'; f0.envio = ''; k.comerc = f0.c || k.comerc; f0.c = null; break;
        case 'i-filtro': k.filtro = d.id; break;
        case 'i-sel': k.sel = d.id; scr.det = 0; break;
        case 'i-cerrar': k.sel = null; break;
        case 'ani': k.rep.ani = consultarAni(k.rep); break;
        case 'adj-foto': k.rep.evid.push({ n: 'foto-' + (k.rep.evid.length + 1) + '.jpg (simulada)' }); break;
        case 'adj-video': k.rep.evid.push({ n: 'video-' + (k.rep.evid.length + 1) + '.mp4 (simulado)', v: true }); break;
        case 'quitar-evid': k.rep.evid.splice(+d.id, 1); break;
        case 'enviar-incidente': if (faltaReporte(k.rep).length) { return; } enviarIncidente(); return;
        case 'otro-reporte': k.rep = nuevoReporte(); ir('reportar'); return;
        case 'ver-incidentes': k.filtro = 'todos'; ir('incidentes'); return;
        case 'reportar-de': k.rep = nuevoReporte(); k.rep.evento = d.id; ir('reportar'); return;
        // Mindeporte
        case 's-filtro': m.filtro = d.id; break;
        case 's-sel': m.sel = d.id; scr.det = 0; break;
        case 's-cerrar': m.sel = null; break;
        case 'aprobar': aprobarSemestral(fila(m.sel)); return;
        case 'ver-cert': m.selC = d.id; m.accion = ''; ir('certificacion'); return;
        case 'c-sel': m.selC = d.id; m.accion = ''; m.motivo = ''; scr.det = 0; break;
        case 'c-cerrar': m.selC = null; break;
        case 'c-iniciar': var ci = comerc(m.selC); ci.estado = 'enpruebas'; anotarC(ci, 'Inició pruebas'); mostrarToast('Pruebas iniciadas', ci.nombre + ' ya tiene su ambiente de pruebas.', 'positive', 'positive'); return;
        case 'c-homologar':
          var ch = comerc(m.selC);
          if (pasadas(ch) < 4) { return; }
          ch.estado = 'homologada'; ch.aprobo = USUARIO_MD.nombre + ' · ' + hoyTxt(); anotarC(ch, 'Homologada: 4 de 4 casos aprobados');
          mostrarToast('Comercializadora homologada', ch.nombre + ' ya puede recibir su llave de producción.', 'positive', 'positive'); return;
        case 'c-llave':
          var cl = comerc(m.selC); cl.llave = 'emitida'; cl.llaveFecha = hoyTxt(); anotarC(cl, 'Llave emitida');
          mostrarToast('Llave emitida', cl.nombre + ' la recibirá una sola vez en su portal de integración.', 'positive', 'positive'); return;
        case 'c-suspender': m.accion = 'suspender'; m.motivo = ''; break;
        case 'c-revocar': m.accion = 'revocar'; m.motivo = ''; break;
        case 'c-cancelar': m.accion = ''; m.motivo = ''; m.nota = ''; break;
        case 'c-confirmar': confirmarAccion(comerc(m.selC)); return;
        case 'c-reactivar': var cr = comerc(m.selC); cr.estado = 'homologada'; anotarC(cr, 'Reactivada'); mostrarToast('Comercializadora reactivada', cr.nombre + ' vuelve a consultar el SVN.', 'positive', 'positive'); return;
        default: if (!atajo(d.acc)) { return; } return;
      }
      pintar();
    }

    // Atajos del panel: dejan la pantalla en el caso, sin recorrer el flujo.
    function atajo(a) {
      var k = st.club, m = st.md;
      switch (a) {
        case 'g-enviar': st.cara = 'club'; var f1 = miFila(); f1.estado = 'pendiente'; f1.c = null; f1.envio = ''; k.comerc = 'grader'; st.vista = 'reporte'; break;
        case 'g-enviar-pruebas': st.cara = 'club'; var f2 = miFila(); f2.estado = 'pendiente'; f2.c = null; f2.envio = ''; k.comerc = 'boletea'; st.vista = 'reporte'; break;
        case 'g-incidente': st.cara = 'club'; k.rep = nuevoReporte(); st.vista = 'reportar'; break;
        case 'g-menor': st.cara = 'club'; k.rep = nuevoReporte(); k.rep.tipo = 'TI'; k.rep.numero = '1.021.998.406'; st.vista = 'reportar'; break;
        case 'g-ani': st.cara = 'club'; k.rep = nuevoReporte(); k.rep.numero = '1.000.000.000'; k.rep.ani = consultarAni(k.rep); st.vista = 'reportar'; break;
        case 'g-derivo': st.cara = 'club'; k.filtro = 'todos'; k.sel = 'R-2025-0288'; st.vista = 'incidentes'; break;
        case 'g-aprobar': st.cara = 'mindeporte'; m.sem = '2026-II'; m.filtro = 'todos'; m.sel = 'g4'; st.vista = 'semestrales'; break;
        case 'g-bloqueado': st.cara = 'mindeporte'; m.sem = '2026-II'; m.filtro = 'todos'; m.sel = 'g5'; st.vista = 'semestrales'; break;
        case 'g-atrasado': st.cara = 'mindeporte'; m.sem = '2026-II'; m.filtro = 'atrasado'; m.sel = 'g3'; st.vista = 'semestrales'; break;
        case 'g-corrida': st.cara = 'mindeporte'; var b = comerc('boletea'); if (b.estado === 'enpruebas') { b.pruebas = [1, 1, 1, 1]; anotarC(b, 'Corrida de pruebas: 4 de 4 casos'); } m.selC = 'boletea'; m.accion = ''; st.vista = 'certificacion'; break;
        case 'g-llave': st.cara = 'mindeporte'; m.selC = 'tupalco'; m.accion = ''; st.vista = 'certificacion'; break;
        case 'g-suspender': st.cara = 'mindeporte'; m.selC = 'grader'; m.accion = 'suspender'; m.motivo = ''; st.vista = 'certificacion'; break;
        case 'g-revocar': st.cara = 'mindeporte'; m.selC = 'entradaya'; m.accion = 'revocar'; m.motivo = ''; st.vista = 'certificacion'; break;
        default: return false;
      }
      st.toast = null; scr = {}; refrescarPanel(); pintar();
      return true;
    }

    function porCampo(el) {
      var d = el.dataset, val = el.type === 'checkbox' ? el.checked : el.value;
      if (d.s === 'f') { st.club[d.k] = val; return true; }
      if (d.s === 'm') {
        st.md[d.k] = val;
        if (d.k === 'sem') { st.md.sel = null; st.md.filtro = 'todos'; scr.lista = 0; }
        return true;
      }
      if (d.s !== 'x') { return false; }
      var x = st.club.rep;
      if (d.k.indexOf('c:') === 0) { x.conductas[d.k.slice(2)] = val; return true; }
      x[d.k] = val;
      if (d.k === 'tipo') { x.numero = val === 'TI' ? '1.021.998.406' : '1.037.512.884'; x.ani = null; }
      if (d.k === 'numero') { x.ani = null; }
      return true;
    }

    var TEXTO = /^(text|search|number|tel|email|)$/;
    function onInput(ev) {
      var el = ev.target;
      if (!el.dataset || !el.dataset.k) { return; }
      var texto = el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTO.test(el.type));
      if (texto && porCampo(el)) { pintar(); }
    }
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
    SPLASH.app('Entidades y comercializadoras');
    disp = raiz.querySelector('#dispositivo');
    montarPanel();

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
