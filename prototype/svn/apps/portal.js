/* Superficie 8 · Portal de la persona. Modelo en modeling/desing-views/08-portal-persona.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = 86400000;
  var DOCS = ['CC', 'TI', 'CE', 'PA', 'PPT', 'PEP', 'RUMV'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tiempo(iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function fmt(ms) { var d = new Date(ms); return d.getUTCDate() + ' ' + MES[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  var ICO = {
    atras: '<path d="M15 5l-7 7 7 7"/>', salir: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>', alerta: '<path d="M12 4 3 20h18z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', estado: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    boleta: '<path d="M4 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v1.5A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5V16a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6.5A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5z"/><path d="M14 5v14" stroke-dasharray="2 3"/>',
    vinculo: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    tel: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    lugar: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', camara: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    mas: '<path d="M6 9l6 6 6-6"/>', cerrar: '<path d="M6 6l12 12M18 6 6 18"/>', candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
  };
  function ico(n, t) { return '<svg width="' + (t || 22) + '" height="' + (t || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[n] + '</svg>'; }

  /* ---------- Datos ficticios: cada persona ve solo lo suyo ---------- */

  var PERS = {
    '1036482117': { tipo: 'CC', num: '1.036.482.117', nombre: 'Andrés Felipe Restrepo Gil', medidas: [], foto: true,
      boletas: [
        { id: 'b1', evento: 'Nacional vs. Medellín', fecha: '28 sep 2026 · 19:00', lugar: 'Estadio Atanasio Girardot', sitio: 'Oriental Baja · Fila E · Silla 18', estado: 'usada', nota: 'Entró el 28 sep por la Puerta 4' },
        { id: 'b2', evento: 'América vs. Once Caldas', fecha: '3 oct 2026 · 16:00', lugar: 'Estadio Olímpico Pascual Guerrero', sitio: 'Occidental · Fila C · Silla 9', estado: 'asignada', nota: 'A tu nombre' },
        { id: 'b3', evento: 'Real Cartagena vs. Unión Magdalena', fecha: '3 oct 2026 · 18:30', lugar: 'Estadio Jaime Morón', sitio: 'Oriental · General', estado: 'invitada', nota: 'Te invitó Santiago M. · CC •••• 4905' },
        { id: 'b4', evento: 'Millonarios vs. América', fecha: '29 sep 2026 · 20:00', lugar: 'Estadio El Campín', sitio: 'Norte · General', estado: 'transferida', nota: 'La pasaste a Santiago M. · CC •••• 4905 el 27 sep' }
      ],
      vinculos: [{ id: 'v1', nombre: 'Graderío', desde: '12 ago 2026', dato: 'Documento y resultado de la validación' }, { id: 'v2', nombre: 'Taquilla oficial · Atanasio Girardot', desde: '2 mar 2026', dato: 'Documento y resultado de la validación' }] },
    '71894447': { tipo: 'CC', num: '71.894.447', nombre: 'Julián Andrés Posada', persona: 'p1', medidas: [], boletas: [],
      vinculos: [{ id: 'v1', nombre: 'Graderío', desde: '9 sep 2026', dato: 'Documento y resultado de la validación' }] },
    '4518227': { tipo: 'CE', num: '4.518.227', nombre: 'Daniela Restrepo Gil', persona: 'p6', boletas: [], vinculos: [] },
    '1152708339': { tipo: 'CC', num: '1.152.708.339', nombre: 'Mariana Cárdenas Ríos', persona: 'p0', boletas: [
      { id: 'b1', evento: 'Millonarios vs. América', fecha: '29 sep 2026 · 20:00', lugar: 'Estadio El Campín', sitio: 'Occidental · Fila D · Silla 4', estado: 'asignada', nota: 'A tu nombre' }], vinculos: [{ id: 'v1', nombre: 'Graderío', desde: '21 sep 2026', dato: 'Documento y resultado de la validación' }] },
    '43512876': { tipo: 'CC', num: '43.512.876', nombre: 'Gloria Patricia Hoyos Marín', persona: 'p0', boletas: [], vinculos: [] },
    // El menor no entra solo: lo consulta su representante legal.
    '1021774331': { tipo: 'TI', num: '1.021.774.331', nombre: 'Samuel David Rendón Hoyos', persona: 'p3', menor: true, rep: '43512876', boletas: [],
      vinculos: [{ id: 'v1', nombre: 'Graderío', desde: '14 sep 2026', dato: 'Documento del menor y resultado de la validación', porRep: true }] }
  };

  var CASOS = [
    { id: 'sin', n: 1, corto: 'Persona sin medidas', punto: 'verde', form: { tipo: 'CC', num: '1.036.482.117', nombre: 'Andrés Felipe Restrepo Gil' },
      ve: 'Andrés Felipe Restrepo Gil: Sin medidas vigentes, cuatro boletas en distintos estados y dos vínculos con foto de referencia.' },
    { id: 'vigente', n: 2, corto: 'Con medida vigente', punto: 'rojo', form: { tipo: 'CC', num: '71.894.447', nombre: 'Julián Andrés Posada' },
      ve: 'Julián Andrés Posada: la medida con autoridad, acto, desde y hasta, y los días que faltan. Una medida cumplida aparte.' },
    { id: 'vencer', n: 3, corto: 'Medida por vencer', punto: 'amarillo', form: { tipo: 'CE', num: '4.518.227', nombre: 'Daniela Restrepo Gil' },
      ve: 'Vence en 6 días. Con «Adelantar el reloj» el estado pasa solo a Sin medidas vigentes, sin trámite.' },
    { id: 'menor', n: 4, corto: 'Menor · representante legal', punto: 'rojo', form: { tipo: 'CC', num: '43.512.876', nombre: 'Gloria Patricia Hoyos Marín', menor: true, docMenor: '1.021.774.331' },
      ve: 'Entra la madre y ve solo el estado de su hijo, con un aviso de que consulta como representante.' },
    { id: 'compra', n: 5, corto: 'Desde un bloqueo de la compra', punto: 'rojo', directo: true, desde: { donde: 'Graderío', evento: 'Nacional vs. Medellín · 28 sep' }, form: { tipo: 'CC', num: '71.894.447', nombre: 'Julián Andrés Posada' },
      ve: 'Llega del enlace «consulta tu estado en el portal» de la compra rechazada; ya viene identificado.' },
    { id: 'reg', n: 6, corto: 'Documento no vigente', punto: 'amarillo', form: { tipo: 'CC', num: '1.000.000.017', nombre: 'Camilo Torres Díaz' },
      ve: 'El no no es una medida: el documento no aparece vigente en la Registraduría. Dice qué hacer.' },
    { id: 'nombre', n: 7, corto: 'El nombre no coincide', punto: 'amarillo', form: { tipo: 'CC', num: '1.152.708.339', nombre: 'Mariana Ríos' },
      ve: 'Corrigiendo el nombre a «Mariana Cárdenas Ríos» la verificación pasa.' }
  ];
  function casoPorId(id) { return CASOS.filter(function (c) { return c.id === id; })[0] || CASOS[0]; }

  // Sobrevive al remontaje: el caso elegido.
  var guardado = { caso: 'sin' };

  window.PANTALLAS.portal = function (raiz, ctx) {
    var D = ctx.D, V = D.ivc, HOY0 = tiempo(V.hoy);
    var disp, zoom = 1, timerToast = null, timerVerif = null, scr = 0;
    var st = nuevo(casoPorId(guardado.caso));

    function nuevo(c) {
      var s = { caso: c.id, pantalla: 'id', form: Object.assign({ menor: false, docMenor: '' }, c.form), error: null, verif: false, desde: c.desde || null,
        sujeto: null, rep: null, off: 0, abierto: {}, boletas: [], vinculos: [], consent: true, toast: null, otros: null };
      if (c.directo) { entrar(s, PERS[digitos(c.form.num)], null); }
      return s;
    }
    function hoy() { return HOY0 + st.off * DIA; }

    function entrar(s, sujeto, rep) {
      s.sujeto = sujeto; s.rep = rep; s.pantalla = 'estado'; s.error = null; s.verif = false;
      s.boletas = (sujeto.boletas || []).map(function (b) { return Object.assign({}, b); });
      s.vinculos = (sujeto.vinculos || []).map(function (v) { return Object.assign({}, v); });
      s.consent = !!sujeto.foto;
    }

    /* ---------- Medidas: el fin y el estado se calculan igual que en el registro ---------- */

    function vigencia(m, h) {
      var ejec = tiempo(m.ejecutoria), desde = ejec + DIA, dd = new Date(desde);
      var fin = Date.UTC(dd.getUTCFullYear(), dd.getUTCMonth() + m.meses, dd.getUTCDate()) - DIA;
      return { desde: desde, fin: fin, vigente: fin >= h, dias: Math.round((fin - h) / DIA), total: Math.round((fin - desde) / DIA) + 1 };
    }
    function medidasDe(p) {
      if (!p || !p.persona) { return []; }
      return V.medidas.filter(function (m) { return m.persona === p.persona; }).map(function (m) { return Object.assign({ v: vigencia(m, hoy()) }, m); });
    }

    /* ---------- Piezas ---------- */

    function kv(k, v) { return '<div class="pt-kv"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>'; }
    // Formato único de tarjeta: ícono en círculo, línea de contexto, título grande y texto de apoyo.
    function bloque(o) {
      var h = o.h || 2, g = o.el === 'button' ? 'span' : 'h' + h, t = '<' + g + ' class="pt-estado__t' + (h === 1 ? ' pt-h1' : '') + '"' + (o.id ? ' id="' + o.id + '"' : '') + (h === 1 ? ' tabindex="-1"' : '') + '>' + o.t + '</' + g + '>';
      return '<' + (o.el || 'section') + ' class="pt-estado pt-estado--' + o.tono + '"' + (o.attrs || '') + '><div class="pt-estado__ic">' + ico(o.ic, 28) + '</div>' +
        (o.etq ? '<p class="pt-etq">' + o.etq + '</p>' : '') + t + (o.d ? '<p class="pt-estado__d">' + o.d + '</p>' : '') + (o.extra || '') + '</' + (o.el || 'section') + '>';
    }
    function aviso(tono, icono, titulo, cuerpo) {
      return bloque({ el: 'div', attrs: ' role="status"', tono: tono, ic: icono, t: esc(titulo), d: cuerpo ? esc(cuerpo) : '' });
    }
    function tag(tono, texto) { return '<span class="pt-tag pt-tag--' + tono + '">' + esc(texto) + '</span>'; }
    function boton(acc, texto, tipo) {
      return '<button type="button" class="pt-btn pt-btn--' + (tipo || 'pri') + '" data-acc="' + acc + '">' + texto + '</button>';
    }

    /* ---------- Pantallas ---------- */

    function pIdentificar() {
      var f = st.form, e = st.error;
      var msg = {
        reg: ['Tu documento no aparece vigente en la Registraduría', 'El no no viene de una medida correctiva. Revisa que el número esté bien escrito. Si lo está, acércate a la Registraduría para actualizar tu documento y vuelve a intentarlo.'],
        nombre: ['El nombre no coincide con el de tu documento', 'Escríbelo igual que en tu cédula, con los dos apellidos y las tildes. Si sigue sin coincidir, pide a la Registraduría corregir tu registro.'],
        rep: ['No encontramos esa representación', 'Revisa el documento del menor. Solo el representante legal registrado puede consultar por él.']
      }[e];
      var alerta = e ? bloque({ el: 'div', attrs: ' role="alert"', tono: 'rojo', ic: 'alerta', t: msg[0], d: msg[1], extra: '<button type="button" class="pt-enlace" data-acc="otros">Ver otros motivos de un no</button>' }) : '';
      var campo = function (et, ctl) { return '<label class="pt-campo"><span>' + et + '</span>' + ctl + '</label>'; };
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Consulta tu estado</h1>' +
        '<p class="pt-p">Identifícate para ver solo lo tuyo: tu estado, tus boletas y los permisos que diste.</p>' +
        '<form class="pt-form" data-form novalidate>' +
          '<label class="pt-check"><input type="checkbox" data-k="menor"' + (f.menor ? ' checked' : '') + '><span>Consulto por un menor de edad que represento</span></label>' +
          '<div class="pt-fila">' + campo(f.menor ? 'Tu documento' : 'Tipo', '<select data-k="tipo">' + DOCS.map(function (d) { return '<option' + (d === f.tipo ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>') +
            campo('Número', '<input data-k="num" inputmode="numeric" autocomplete="off" value="' + esc(f.num) + '">') + '</div>' +
          campo(f.menor ? 'Tu nombre completo' : 'Nombre completo, como en tu documento', '<input data-k="nombre" autocomplete="off" value="' + esc(f.nombre) + '">') +
          (f.menor ? campo('Documento del menor (TI)', '<input data-k="docMenor" inputmode="numeric" autocomplete="off" value="' + esc(f.docMenor) + '">') : '') +
          alerta +
          '<button type="submit" class="pt-btn pt-btn--pri" data-acc="verificar"' + (st.verif ? ' disabled' : '') + '>' + (st.verif ? '<span class="pt-giro" aria-hidden="true"></span>Verificando con la Registraduría' : 'Verificar mi identidad') + '</button>' +
        '</form>' +
        '<p class="pt-nota">' + ico('candado', 18) + '<span>Verificamos con la Registraduría Nacional. Esta consulta queda registrada en la auditoría.</span></p></div>';
    }

    function bannerEntrada() {
      var s = st;
      if (s.desde) {
        return aviso('azul', 'info', 'Llegaste desde tu compra en ' + s.desde.donde, s.desde.donde + ' solo supo que la compra no era posible. El motivo lo ves solo tú, aquí.');
      }
      if (s.rep) { return aviso('azul', 'info', 'Consultas como representante legal', 'Estás viendo el estado de ' + s.sujeto.nombre + ', a quien representas. Tu consulta queda auditada.'); }
      return '';
    }

    function pEstado() {
      var p = st.sujeto, ms = medidasDe(p), h = hoy();
      var vig = ms.filter(function (m) { return m.v.vigente; });
      var cum = ms.filter(function (m) { return !m.v.vigente; });
      var m = vig[0];
      var quien = p.menor ? p.nombre : p.nombre.split(' ')[0];
      var cab, medida = '';
      if (m) {
        var porVencer = m.v.dias <= 30;
        var tono = porVencer ? 'ambar' : 'rojo';
        var avance = Math.max(0, Math.min(100, Math.round((m.v.total - m.v.dias) / m.v.total * 100)));
        cab = bloque({ tono: tono, ic: porVencer ? 'reloj' : 'alerta', etq: (p.menor ? 'Estado de ' + esc(quien) : 'Tu estado') + ' al ' + fmt(h), h: 1, id: 'pt-h1',
          t: porVencer ? 'Tu medida vence pronto' : (p.menor ? 'Tiene' : 'Tienes') + ' una medida vigente',
          d: '<b class="pt-num">' + m.v.dias + (m.v.dias === 1 ? ' día' : ' días') + '</b> restantes' + (porVencer ? ': cuando termine, vuelves a Sin medidas vigentes sin hacer ningún trámite.' : '.') });
        medida = bloque({ tono: tono, ic: 'alerta', etq: 'Vigente', t: esc(m.conductas.join(' · ')), attrs: ' aria-label="La medida"', extra:
          '<dl class="pt-kvs">' + kv('Autoridad que la emitió', m.autoridad) + kv('Acto administrativo', m.acto) + kv('Desde', fmt(m.v.desde)) + kv('Hasta', fmt(m.v.fin)) + '</dl>' +
          '<div class="pt-prog" role="progressbar" aria-label="Avance de la medida" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + avance + '"><i style="width:' + avance + '%"></i></div>' +
          '<p class="pt-sub">Han pasado ' + avance + ' % del tiempo. Mientras esté vigente no se pueden comprar boletas ni entrar a eventos deportivos en el país.</p>' +
          '<button type="button" class="pt-mas" data-acc="hechos" aria-expanded="' + !!st.abierto.hechos + '">Ver los hechos' + ico('mas', 20) + '</button>' +
          (st.abierto.hechos ? '<dl class="pt-kvs pt-kvs--hechos">' + kv('Evento', m.evento) + kv('Fecha de los hechos', fmt(tiempo(m.hechos))) + kv('Qué pasó', m.descripcion || 'Hechos descritos en el informe de la autoridad.') + '</dl>' : '') }) +
          boton('controvertir', 'Cómo controvertirla', 'sec');
      } else {
        cab = bloque({ tono: 'verde', ic: 'check', etq: (p.menor ? 'Estado de ' + esc(quien) : 'Tu estado') + ' al ' + fmt(h), h: 1, id: 'pt-h1', t: 'Sin medidas vigentes',
          d: cum.length && st.off > 0 ? 'La medida se cumplió y tu estado cambió solo, sin trámite.' : 'No hay ninguna medida correctiva que te impida comprar boletas o entrar a un evento.' });
      }
      var cumplidas = cum.length ? bloque({ tono: 'gris', ic: 'check', t: 'Medidas cumplidas', attrs: ' aria-label="Medidas cumplidas"', extra: cum.map(function (c) {
        return '<div class="pt-fila-c"><b>' + esc(c.conductas.join(' · ')) + '</b><span class="pt-sub">' + esc(c.acto) + ' · ' + esc(c.autoridad) + '</span><span class="pt-sub">Cumplida el ' + fmt(c.v.fin + DIA) + '</span></div>';
      }).join('') + '<p class="pt-sub">Una medida cumplida ya no bloquea nada.</p>' }) : '';
      var ayuda = bloque({ el: 'button', attrs: ' type="button" data-acc="otros"', tono: 'azul', ic: 'info', t: '¿Te dijeron que no y no tienes una medida?' });
      return '<div class="pt-body" data-sc="cuerpo">' + bannerEntrada() + cab + medida + cumplidas + ayuda +
        '<p class="pt-nota">' + ico('candado', 18) + '<span>Esta consulta quedó registrada en la auditoría, como cualquier otra.</span></p></div>';
    }

    function pControvertir() {
      var m = medidasDe(st.sujeto).filter(function (x) { return x.v.vigente; })[0];
      var aut = m ? m.autoridad : 'la autoridad de policía que la emitió';
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Cómo controvertirla</h1>' + tag('azul', 'Exploratorio') +
        '<p class="pt-p">Este portal solo muestra lo que la autoridad registró: no puede modificar ni levantar una medida. Quien puede revisarla es la autoridad que la emitió.</p>' +
        bloque({ tono: 'gris', ic: 'lugar', t: 'A quién acudir', extra: '<dl class="pt-kvs">' + kv('Autoridad competente', aut) + kv('Acto que debes citar', m ? m.acto : '—') +
          kv('Dirección', 'Carrera 52 # 71-33, Medellín') + kv('Horario', 'Lunes a viernes · 8:00 a 16:00') + kv('Teléfono', '(604) 555 0114') + '</dl>' +
          '<ol class="pt-pasos"><li>Reúne tu documento y el acto administrativo.</li><li>Presenta tu solicitud por escrito ante la autoridad.</li><li>Si la autoridad la modifica, el registro se actualiza solo y aquí verás el cambio.</li></ol>' }) +
        aviso('azul', 'info', 'Aún sin confirmar', 'Los documentos no definen si la apelación la recibe el IVC o la autoridad de policía. Datos de contacto ficticios.') +
        '<a class="pt-btn pt-btn--sec" href="tel:+576045550114">' + ico('tel', 20) + 'Llamar a la autoridad</a></div>';
    }

    function pOtros() {
      var items = [
        ['reg', 'Tu documento no aparece vigente en la Registraduría', 'La Registraduría no lo reconoce como vigente. Revisa el número y, si es correcto, acércate a una sede para actualizarlo. No tiene que ver con medidas correctivas.'],
        ['nombre', 'El nombre no coincide', 'El nombre que diste no es igual al de tu documento. Escríbelo con los dos apellidos y las tildes; si el registro tiene un error, la Registraduría debe corregirlo.'],
        ['limite', 'Llegaste al límite de boletas del partido', 'Cada documento puede tener un número máximo de boletas por partido. No es una medida: se libera si transfieres o anulas una boleta.']
      ];
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Otros motivos de un no</h1>' +
        '<p class="pt-p">Un no no siempre es una medida correctiva. Estos son los otros casos y qué hacer en cada uno.</p>' +
        items.map(function (i) {
          var ab = !!(st.otros === i[0]);
          return bloque({ tono: 'ambar', ic: 'info', t: '<button type="button" class="pt-mas" data-acc="otro" data-id="' + i[0] + '" aria-expanded="' + ab + '"><span>' + esc(i[1]) + '</span>' + ico('mas', 20) + '</button>', d: ab ? esc(i[2]) : '' });
        }).join('') + '</div>';
    }

    var ESTADO_B = { usada: ['gris', 'Usada'], asignada: ['verde', 'A tu nombre'], invitada: ['azul', 'Invitación pendiente'], transferida: ['gris', 'Transferida'] };
    function pBoletas() {
      var p = st.sujeto, bs = st.boletas, vig = medidasDe(p).some(function (m) { return m.v.vigente; });
      var cuerpo = bs.length ? bs.map(function (b) {
        var e = ESTADO_B[b.estado];
        return bloque({ el: 'article', tono: e[0], ic: 'boleta', etq: e[1], t: esc(b.evento), d: '<span class="pt-sub">' + ico('cal', 16) + esc(b.fecha) + '</span><span class="pt-sub">' + ico('lugar', 16) + esc(b.lugar) + ' · ' + esc(b.sitio) + '</span><b class="pt-bl">' + esc(b.nota) + '</b>' });
      }).join('') : bloque({ tono: 'gris', ic: 'boleta', t: vig ? 'Sin boletas por ahora' : 'No tienes boletas ni invitaciones',
        d: vig ? 'Con una medida vigente no se pueden comprar ni recibir boletas.' : 'Cuando compres o alguien te invite, aparecerán aquí.' });
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Mis boletas e invitaciones</h1>' + (st.rep ? aviso('azul', 'info', 'Boletas de ' + p.nombre, 'Ves solo las que están a su nombre.') : '') + cuerpo + '</div>';
    }

    function pVinculos() {
      var vs = st.vinculos, p = st.sujeto;
      var lista = vs.length ? vs.map(function (v) {
        return bloque({ el: 'article', tono: 'verde', ic: 'vinculo', etq: 'Vinculada', t: esc(v.nombre), d: 'Desde ' + esc(v.desde) + '. Comparte: ' + esc(v.dato.toLowerCase()) + '.' + (v.porRep ? ' La vinculó su representante legal.' : '') });
      }).join('') : bloque({ tono: 'gris', ic: 'vinculo', t: 'Sin comercializadoras vinculadas', d: 'Cuando compres en una, podrás verla aquí.' });
      var bio = p.foto
        ? bloque({ tono: 'gris', ic: 'camara', t: 'Foto de referencia', d: 'Se usa para comprobar que eres tú al entrar. Solo con tu permiso.',
          extra: '<label class="pt-check pt-check--sw"><input type="checkbox" role="switch" data-acc="consent"' + (st.consent ? ' checked' : '') + '><span>' + (st.consent ? 'Autorizo usar mi foto de referencia' : 'No autorizo usar mi foto: entro con documento') + '</span></label>' })
        : bloque({ tono: 'gris', ic: 'camara', t: 'Foto de referencia', d: 'No tienes foto de referencia. Si te la piden, se toma en tu primer ingreso y antes pide tu permiso.' });
      return '<div class="pt-body" data-sc="cuerpo"><h1 class="pt-h1" tabindex="-1">Consentimientos y vínculos</h1><h2 class="pt-h2 pt-h2--s">Comercializadoras</h2>' + lista + bio + '</div>';
    }

    /* ---------- Marco ---------- */

    function top() {
      var atras = st.pantalla === 'controvertir' || (st.pantalla === 'otros');
      var atrasBtn = atras ? '<button type="button" class="pt-ib" data-acc="atras" aria-label="Volver">' + ico('atras', 24) + '</button>' : '';
      var salirBtn = st.sujeto ? '<button type="button" class="pt-ib pt-ib--salir" data-acc="salir-portal" aria-label="Salir del portal">' + ico('salir', 22) + '</button>' : '';
      var centro = atras ? '<span class="pt-top__t">Portal de la persona</span>' :
        '<img class="pt-top__logo" src="assets/mindeporte.svg" alt="Ministerio del Deporte"><span class="pt-top__t">Portal de la persona</span>';
      return '<header class="pt-top">' + atrasBtn + '<div class="pt-top__centro">' + centro + '</div>' + salirBtn + '</header>';
    }
    function nav() {
      if (!st.sujeto || st.pantalla === 'id') { return ''; }
      var cur = (st.pantalla === 'controvertir' || st.pantalla === 'otros') ? 'estado' : st.pantalla;
      var it = function (id, ic, t) { return '<button type="button" class="pt-tab" data-acc="tab" data-id="' + id + '"' + (cur === id ? ' aria-current="page"' : '') + '>' + ico(ic, 24) + '<span>' + t + '</span></button>'; };
      return '<nav class="pt-nav" aria-label="Secciones">' + it('estado', 'estado', 'Mi estado') + it('boletas', 'boleta', 'Boletas') + it('vinculos', 'vinculo', 'Vínculos') + '</nav>';
    }
    function toastHtml() {
      return st.toast ? '<nwt-toast class="pp-toast pt-toast" visible icon="' + st.toast.i + '" nwt-theme="' + st.toast.th + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }
    function contenido() {
      var cuerpo = { id: pIdentificar, estado: pEstado, controvertir: pControvertir, otros: pOtros, boletas: pBoletas, vinculos: pVinculos }[st.pantalla]();
      return '<div class="pt-app">' + top() + cuerpo + nav() + toastHtml() + '</div>';
    }

    /* ---------- Panel del demo y equipo ---------- */

    function tarjeta(titulo, cuerpo, id) { return '<nwt-card class="pp-panel__card"' + (id ? ' id="' + id + '"' : '') + ' nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>'; }
    function itemCaso(c) {
      var mapa = { verde: ['positive', 'positive'], rojo: ['negative', 'negative'], amarillo: ['caution', 'warning'] }[c.punto];
      return '<nwt-detail-item actionable class="pt-caso" icon="' + mapa[0] + '" nwt-theme="' + mapa[1] + '" data-caso="' + c.id + '">' + c.n + ' · ' + esc(c.corto) + '</nwt-detail-item>';
    }
    function guion() {
      return '<aside class="pp-panel" aria-label="Controles del demo"><button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Probar', '<div class="pp-panel__lista">' + CASOS.map(itemCaso).join('') + '</div>') +
        tarjeta('Este caso', '<div id="pt-info" class="pt-info"></div>') +
        tarjeta('Condiciones', '<div class="pp-panel__lista" id="pt-reloj"></div>', 'pt-cond') +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p></aside>';
    }
    function pintarPanel() {
      var c = casoPorId(guardado.caso);
      var i = raiz.querySelector('#pt-info'); if (i) { i.innerHTML = '<p>' + esc(c.ve) + '</p>'; }
      raiz.querySelectorAll('.pt-caso').forEach(function (n) { n.classList.toggle('pt-caso--activo', n.dataset.caso === c.id); });
      var r = raiz.querySelector('#pt-reloj');
      if (r) {
        var m = st.sujeto && medidasDe(st.sujeto).filter(function (x) { return x.v.vigente; })[0];
        var pasa = st.off > 0 && !m;
        r.innerHTML = m || pasa ? '<nwt-detail-item actionable icon="calendar" nwt-theme="informative" data-acc="reloj">' + (pasa ? 'Volver a hoy · 29 sep 2026' : 'Adelantar el reloj hasta que venza') + '</nwt-detail-item>' : '';
        // Sin interruptores ni reloj, la tarjeta quedaría vacía.
        var cd = raiz.querySelector('#pt-cond'); if (cd) { cd.style.display = r.innerHTML ? '' : 'none'; }
      }
    }
    function estadoBarra() { return '<div class="pp-estado" aria-hidden="true"><span>10:14</span><span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>'; }

    function clave(el) { var d = el.dataset || {}; return d.k ? 'k:' + d.k : d.acc ? 'a:' + d.acc + ':' + (d.id || '') : null; }
    function pintar(cambio) {
      var activo = document.activeElement, kf = activo && disp.contains(activo) ? clave(activo) : null, sel = null;
      try { if (kf && activo.selectionStart != null) { sel = [activo.selectionStart, activo.selectionEnd]; } } catch (e) { /* tipo sin selección */ }
      var c = disp.querySelector('[data-sc]'); if (c && !cambio) { scr = c.scrollTop; }
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--celular"><div class="pp-pantalla">' + estadoBarra() + contenido() + '</div></div></div>';
      c = disp.querySelector('[data-sc]'); if (c) { c.scrollTop = cambio ? 0 : scr; }
      if (cambio) { var h = disp.querySelector('h1'); if (h) { h.focus({ preventScroll: true }); } }
      else if (kf) {
        var els = disp.querySelectorAll('[data-k],[data-acc]');
        for (var i = 0; i < els.length; i++) {
          if (clave(els[i]) === kf && !els[i].disabled) { els[i].focus({ preventScroll: true }); try { if (sel) { els[i].setSelectionRange(sel[0], sel[1]); } } catch (e) { /* sin selección */ } break; }
        }
      }
      pintarPanel();
      escalar();
    }
    function escalar() {
      SPLASH.ver(disp);
      var e = raiz.querySelector('.pp-escena'), m = disp && disp.firstElementChild;
      if (!e || !m) { return; }
      var k = Math.min((e.clientWidth - 48) / m.offsetWidth, (e.clientHeight - 88) / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
    }
    function avisar(t, m, th, i) {
      st.toast = { t: t, m: m, th: th || 'positive', i: i || 'positive' };
      pintar(false);
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; var n = disp.querySelector('.pt-toast'); if (n) { n.remove(); } }, 3200);
    }

    /* ---------- Acciones ---------- */

    function verificar() {
      var f = st.form, d = digitos(f.num), p = PERS[d];
      st.error = null; st.verif = true; pintar(false);
      clearTimeout(timerVerif);
      timerVerif = setTimeout(function () {
        st.verif = false;
        if (!p || p.tipo !== f.tipo) { st.error = 'reg'; }
        else if (norm(f.nombre) !== norm(p.nombre)) { st.error = 'nombre'; }
        else if (f.menor) {
          var m = PERS[digitos(f.docMenor)];
          if (!m || !m.menor || m.rep !== d) { st.error = 'rep'; } else { entrar(st, m, p); }
        } else { entrar(st, p, null); }
        pintar(!!st.sujeto);
      }, 1000);
    }

    function elegirCaso(id) {
      clearTimeout(timerVerif);
      guardado.caso = id;
      st = nuevo(casoPorId(id));
      pintar(true);
    }

    function onClick(ev) {
      // El check del menor queda marcado: un clic en la etiqueta solo lo marca; desmarcar es solo clic directo en el check (DC-378).
      var lab = ev.target.closest('label.pt-check'), chk = lab && lab.querySelector('input[data-k="menor"]');
      if (chk && ev.target !== chk) { ev.preventDefault(); if (!chk.checked) { chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true })); } return; }
      var cas = ev.target.closest('[data-caso]');
      if (cas) { elegirCaso(cas.dataset.caso); return; }
      var z = ev.target.closest('[data-zoom]');
      if (z) { zoom = z.dataset.zoom === 'in' ? Math.min(2, zoom + 0.15) : Math.max(0.5, zoom - 0.15); escalar(); return; }
      var el = ev.target.closest('[data-acc]');
      if (!el || el.disabled || el.type === 'checkbox') { return; }
      var d = el.dataset;
      switch (d.acc) {
        case 'salir': ctx.salir(); return;
        case 'cerrar-toast': st.toast = null; break;
        case 'verificar': ev.preventDefault(); verificar(); return;
        case 'tab': st.pantalla = d.id; pintar(true); return;
        case 'atras': st.pantalla = st.sujeto ? 'estado' : 'id'; pintar(true); return;
        case 'controvertir': st.pantalla = 'controvertir'; pintar(true); return;
        case 'otros': st.pantalla = 'otros'; st.otros = st.error || st.otros; pintar(true); return;
        case 'otro': st.otros = st.otros === d.id ? null : d.id; break;
        case 'hechos': st.abierto.hechos = !st.abierto.hechos; break;
        case 'salir-portal': var formPrevio = st.form; st = nuevo(casoPorId(guardado.caso)); st.form = formPrevio; st.sujeto = null; st.pantalla = 'id'; st.desde = null; pintar(true); return;
        case 'reloj': st.off = st.off > 0 ? 0 : (function () { var m = medidasDe(st.sujeto).filter(function (x) { return x.v.vigente; })[0]; return m ? m.v.dias + 1 : 0; })(); pintar(false); return;
      }
      pintar(false);
    }
    function onSubmit(ev) { if (ev.target.matches('[data-form]')) { ev.preventDefault(); verificar(); } }
    function onInput(ev) {
      var el = ev.target;
      if (el.dataset && el.dataset.k && el.type !== 'checkbox' && el.tagName !== 'SELECT') { st.form[el.dataset.k] = el.value; }
    }
    function onCambio(ev) {
      var el = ev.target, d = el.dataset || {};
      if (d.acc === 'consent') { st.consent = el.checked; pintar(false); avisar(el.checked ? 'Permiso dado' : 'Permiso retirado', el.checked ? 'Se usará tu foto de referencia en tus ingresos.' : 'Entrarás con tu documento.', 'informative', 'info'); return; }
      if (!d.k) { return; }
      st.form[d.k] = el.type === 'checkbox' ? el.checked : el.value;
      st.error = null;
      if (d.k === 'menor') {
        st.form.num = el.checked ? '43.512.876' : '1.036.482.117'; st.form.nombre = el.checked ? 'Gloria Patricia Hoyos Marín' : 'Andrés Felipe Restrepo Gil'; st.form.tipo = 'CC'; st.form.docMenor = el.checked ? '1.021.774.331' : '';
      }
      pintar(false);
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo"><nwt-toolbar class="pp-toolbar"><div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
      '<nwt-title class="pp-toolbar__titulo">Portal de la persona<span slot="subtitle">Superficie 8 · Web móvil · Persona y representante legal</span></nwt-title>' +
      '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button></nwt-toolbar>' +
      '<div class="pp-demo__cuerpo">' + guion() + '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles"><div class="pp-zoom">' +
        '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
      '</div></div><div class="pp-dispositivo" id="dispositivo"></div></div></main></div></div>';
    SPLASH.app('Portal de la persona');
    disp = raiz.querySelector('#dispositivo');

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('submit', onSubmit);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('change', onCambio);
    window.addEventListener('resize', escalar);
    pintar(true);
    requestAnimationFrame(escalar);

    return function () {
      clearTimeout(timerToast); clearTimeout(timerVerif);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('submit', onSubmit);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('change', onCambio);
      window.removeEventListener('resize', escalar);
    };
  };
})();
