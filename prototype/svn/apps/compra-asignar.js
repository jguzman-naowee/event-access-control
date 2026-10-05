/* Paso 2 · Vender la boleta: 'asignar' (consulta 3, compradora) y 'aceptar' (celular del acompañante), con la asignación denegada.
 * Se registra en COMPRA (base de compra.js); si aún no existe la crea, así el orden de carga no importa. */
(function () {
  var C = window.COMPRA = window.COMPRA || {};
  C.pantallas = C.pantallas || {};
  C.registrar = C.registrar || function (id, def) { C.pantallas[id] = def; };

  var LIMITE = 'lun 28 sep, 6:00 p. m.';
  var EVENTO = 'Nacional vs. Medellín', CUANDO = 'lun 28 sep, 7:00 p. m.';

  var IC = {
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    enviar: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    aviso: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    deshacer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    escudo: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    girar: '<path d="M12 3a9 9 0 1 0 9 9"/>',
    atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>'
  };
  function svg(k, t, w, cls) {
    return '<svg width="' + (t || 20) + '" height="' + (t || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + IC[k] + '</svg>';
  }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function ini(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase(); }
  function primero(n) { return String(n || '').split(/\s+/)[0] || ''; }
  function enm(doc) { return C.enmascarar ? C.enmascarar(doc) : 'CC •••• ' + digitos(doc).slice(-4); }

  // Solo lo que no cabe en st.segunda: el formulario, el error y si hay una consulta en curso.
  function mio(st) {
    if (!st.segunda) { st.segunda = { estado: 'sinTitular', a: null }; }
    if (!st.pca) {
      var inv = st.caso && st.caso.invitado;
      st.pca = { tipo: (inv && inv.tipo) || 'CC', doc: inv ? inv.num : '', error: '', run: false, tk: 0, noPosible: false };
    }
    return st.pca;
  }
  function yo(st) { return st.persona || (st.caso && st.caso.persona) || { nombre: 'Andrés Felipe Restrepo Gil', doc: 'CC 1.036.482.117' }; }

  // Segunda boleta: del st si ya existe; si no, un valor coherente con la localidad.
  function segunda(st) {
    var idx = st.asigIdx || 1, b = (st.boletas || [])[idx], b1 = (st.boletas || [])[0], l = C.localidad ? C.localidad(st.localidad) : { n: 'Oriental', fila: 'E', puerta: 'Puerta 4 · Oriental' };
    var pu = function (x, silla) {
      var m = x && /Fila (\S+) · Silla (\d+)/.exec(x.puesto || '');
      return { fila: m ? m[1] : (x ? '' : l.fila || ''), silla: m ? m[2] : (x ? '' : silla), texto: x ? x.puesto : (l.fila ? 'Fila ' + l.fila + ' · Silla ' + silla : 'General') };
    };
    return { loc: (b && b.localidad) || l.n, puerta: (b && b.puerta) || l.puerta, b1: pu(b1, '18'), b2: pu(b, String(18 + idx)) };
  }
  function grid(p, puerta) {
    var pn = (puerta.match(/\d+/) || [''])[0];
    if (!p.fila) { return '<div class="pca-grid pca-grid--uno"><div><span>Puesto</span><b>General</b></div><div><span>Puerta</span><b>' + pn + '</b></div></div>'; }
    return '<div class="pca-grid"><div><span>Fila</span><b>' + p.fila + '</b></div><div><span>Silla</span><b>' + p.silla + '</b></div><div><span>Puerta</span><b>' + pn + '</b></div></div>';
  }

  // Quién es la persona escrita: alguien del panel de casos, o si no, el invitado del caso elegido.
  function resolver(st, valor) {
    var d = digitos(valor), casos = C.casos || [], hallado = null;
    casos.forEach(function (c) {
      [c.invitado, c.persona].forEach(function (p) {
        if (!p || hallado || p === (st.caso && st.caso.persona)) { return; }
        if (digitos(p.num) === d) { hallado = p; }
      });
    });
    return hallado || (st.caso && st.caso.invitado) || { nombre: valor, doc: valor, ref: valor };
  }
  function textoA(a) { return a.tipo + ' ' + a.valor; }

  function btn(acc, txt, o) {
    o = o || {};
    return '<button type="button" class="pca-btn' + (o.cls ? ' ' + o.cls : '') + '" data-acc="' + acc + '"' + (o.foco ? ' data-foco="' + o.foco + '"' : '') + '>' +
      (o.izq ? svg(o.izq, 18, 2.2) : '') + '<span>' + txt + '</span>' + (o.der ? svg(o.der, 20, 2.2) : '') + '</button>';
  }
  function sello(lineas) {
    var t = lineas ? lineas.map(function (l) { return '<span>' + l + '</span>'; }).join('') : '<span>Validado</span>';
    return '<div class="pca-sello"><img src="assets/mindeporte.svg" alt="Ministerio del Deporte"><i></i>' + (lineas ? '<span class="pca-sello__l">' + t + '</span>' : t) + '</div>';
  }
  function pieValidando() {
    return '<button type="button" class="pca-btn pca-btn--carga" aria-disabled="true">' + svg('girar', 20, 2.4, 'pca-gira') + '<span>Validando…</span></button>';
  }
  function pie(html) { return '<div class="pca-pie" data-pca="pie" aria-live="polite">' + html + '</div>'; }
  function parcial(ctx, sel, html) { var n = ctx.raiz.querySelector(sel); if (n) { n.innerHTML = html; } }
  function foco(ctx, k) { var n = ctx.raiz.querySelector('[data-foco="' + k + '"]'); if (n) { n.focus(); } }

  /* ---------- Asignar (vista inmersiva de UNA boleta) ---------- */
  function formHtml(st, ctx) {
    var m = mio(st), e = ctx.esc, cls = 'pca-input' + (m.error ? ' pca-input--error' : '');
    var inv = m.error ? ' aria-invalid="true" aria-describedby="pca-err"' : '';
    var err = m.error ? '<p class="pca-error" id="pca-err" role="alert">' + svg('aviso', 16) + '<span>' + e(m.error) + '</span></p>' : '';
    var campo = '<div class="pca-fila"><label class="pca-campo">Tipo<select class="pca-input pca-input--sel" data-cmp="tipo">' +
      ['CC', 'CE', 'TI', 'Pasaporte'].map(function (t) { return '<option' + (t === m.tipo ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
      '</select></label><label class="pca-campo">Número de documento<input class="' + cls + '" data-cmp="doc" data-foco="cmp" inputmode="numeric" autocomplete="off" value="' + e(m.doc) + '"' + inv + '></label></div>';
    return campo + err;
  }

  // Sin cabecera de Graderío ni resumen de las otras boletas: solo el contexto de la que se asigna.
  function renderAsignar(ctx) {
    var st = ctx.st, m = mio(st), e = ctx.esc, sg = segunda(st), idx = st.asigIdx || 1;
    var puesto = sg.b2.fila ? 'Fila ' + sg.b2.fila + ' · Silla ' + sg.b2.silla : 'General';
    return '<div class="pc-screen pca-imm">' +
      '<header class="pca-imm__top"><button type="button" class="pca-imm__volver" data-acc="asg-volver" aria-label="Volver a Tus boletas">' + svg('atras', 22, 2.2) + '<span>Volver</span></button>' +
      '<div class="pca-imm__ctx"><span>BOLETA ' + (idx + 1) + ' DE ' + st.boletas.length + '</span><b>' + e(sg.loc + ' · ' + puesto) + '</b></div></header>' +
      '<main class="pc-body pca-imm__main"><h1 class="pca-imm__h" tabindex="-1">¿Quién entra con esta boleta?</h1>' +
      '<div class="pca-form" data-pca="form">' + formHtml(st, ctx) + '</div>' +
      '</main>' +
      '<footer class="pc-foot pca-imm__pie">' + pie(m.run ? pieValidando() : btn('asg-enviar', 'Enviar invitación', { izq: 'enviar' })) + '</footer></div>';
  }

  // Abre la asignación de la boleta `i`: guarda la que estaba en juego y arma el formulario limpio.
  function abrirAsignar(st, i, nueva) {
    var cur = st.asigIdx || 1, inv = st.caso && st.caso.invitado;
    var prev = st.segunda, pristino = !prev.a && !prev.rechazada && prev.estado === 'sinTitular';
    if (i !== cur) {
      if (st.boletas[cur]) { st.boletas[cur].sg = st.segunda; }
      st.segunda = st.boletas[i].sg || { estado: 'sinTitular', a: null };
      st.asigIdx = i; pristino = i === 1 && !st.boletas[i].sg;
    }
    if (nueva) { st.segunda = { estado: 'sinTitular', a: null, rechazada: null }; }
    st.pca = null;
    var m = mio(st);
    if (!(pristino && i === 1 && inv)) { m.doc = ''; }
  }
  C.abrirAsignar = abrirAsignar;

  function validar(m, comprador) {
    var d = m.tipo === 'Pasaporte' ? m.doc.trim() : digitos(m.doc);
    if (!d) { return 'Escribe el número de documento.'; }
    if (d.length < 5) { return 'El número de documento parece incompleto.'; }
    if (digitos(d) === digitos(comprador.num || comprador.doc)) { return 'Ese es tu documento. Escribe el de otra persona.'; }
    return '';
  }

  function enviar(ctx) {
    var st = ctx.st, m = mio(st);
    if (m.run) { return; }
    m.error = validar(m, yo(st));
    if (m.error) {
      parcial(ctx, '[data-pca="form"]', formHtml(st, ctx)); foco(ctx, 'cmp');
      var er = ctx.raiz.querySelector('#pca-err'); if (er) { er.scrollIntoView({ block: 'center' }); }
      return;
    }
    var a = { tipo: m.tipo, valor: m.doc.trim() };
    var id = resolver(st, a.valor);
    a.nombre = id.nombre; a.doc = id.doc; a.ref = id.ref || a.valor;
    m.run = true; var tk = ++m.tk;
    parcial(ctx, '[data-pca="pie"]', pieValidando());
    ctx.raiz.querySelectorAll('.pca-form input,.pca-form select,.pca-form button').forEach(function (n) { n.disabled = true; });
    ctx.consultar(3, function (r) {
      if (m.tk !== tk || st.pca !== m) { return; }
      m.run = false;
      st.segunda = { estado: (r && r.ok) ? 'invitada' : 'denegada', a: a, rechazada: null };
      ctx.ir('listo', true);
      if (r && r.ok) { ctx.toast('Invitación enviada', 'Tiene hasta el ' + LIMITE + ' para aceptarla.'); }
    }, { fase: 'asignar', quien: textoA(a) });
  }

  C.registrar('asignar', {
    render: renderAsignar,
    onInput: function (ev, ctx) {
      var t = ev.target, m = mio(ctx.st), k = t.dataset && t.dataset.cmp;
      if (!k) { return; }
      m[k] = t.value;
      if (m.error && k !== 'tipo') { // Al corregir se limpia el aviso sin repintar el campo, para no perder el foco.
        m.error = '';
        var er = ctx.raiz.querySelector('#pca-err'); if (er) { er.remove(); }
        t.classList.remove('pca-input--error'); t.removeAttribute('aria-invalid'); t.removeAttribute('aria-describedby');
      }
    },
    onClick: function (el, ev, ctx) {
      var acc = el.dataset.acc, st = ctx.st, m = mio(st);
      if (acc === 'asg-enviar') { enviar(ctx);
      } else if (acc === 'asg-volver') { ctx.ir('listo'); }
    }
  });

  /* ---------- Aceptar (celular del acompañante) ---------- */
  // Si se llega sin invitación (por ejemplo directo desde el panel), se usa el invitado del caso.
  function invitadoDe(st) {
    var s = st.segunda, inv = st.caso && st.caso.invitado;
    if (s && s.a) { return s.a; }
    return { tipo: inv ? inv.tipo : 'CC', valor: inv ? inv.num : '', nombre: inv && inv.nombre, doc: inv && inv.doc, ref: inv && inv.ref };
  }

  function renderAceptar(ctx) {
    var st = ctx.st, m = mio(st), e = ctx.esc, s = st.segunda, sg = segunda(st), p = yo(st), a = invitadoDe(st), ella = primero(p.nombre);
    var vista = m.run ? 'validando' : s.estado === 'asignada' ? 'aceptada' : m.noPosible ? 'noposible' : s.rechazada ? 'rechazada' : 'pendiente';
    var tit = { pendiente: ella + ' te asignó una boleta', validando: ella + ' te asignó una boleta', aceptada: 'Tu boleta', rechazada: 'Invitación rechazada', noposible: 'Invitación de boleta' }[vista];
    var cab = '<div class="pca-tit"><span class="pca-mini">INVITACIÓN DE ' + e(p.nombre.toUpperCase()) + '</span><h1 class="pc-h1 pca-h1" tabindex="-1">' + e(tit) + '</h1></div>';
    var cabPieza = '<div class="pca-cab"><span class="pca-marca">' + svg('escudo', 20) + '</span><span class="pca-cab__t"><b>Aceptar boleta</b><span>Boleta nominativa</span></span></div>';
    var dato = function (k, v) { return '<div class="pca-dato"><span>' + k + '</span><b>' + e(v) + '</b></div>'; };
    var btnS = function (acc, txt, o) { o = o || {}; return '<button type="button" class="pca-sbtn' + (o.cls ? ' ' + o.cls : '') + '" data-acc="' + acc + '" data-foco="ppal">' + (o.izq ? svg(o.izq, 18) : '') + '<span>' + txt + '</span></button>'; };
    var pieza, selloH = sello();

    if (vista === 'pendiente') {
      pieza = '<section class="pca-pieza" aria-label="Aceptar boleta">' + cabPieza +
        '<div class="pca-datos">' + dato('Evento', EVENTO) + dato('Fecha', 'Lun 28 sep · 7:00 p. m.') + dato('Localidad', sg.loc) + dato('Puesto', sg.b2.texto) +
        dato('Te invita', p.nombre) + dato('A nombre de', a.nombre) + '</div>' +
        '<div class="pca-vence">' + svg('reloj', 18) + '<span>Acepta antes del ' + LIMITE + '</span></div>' +
        '<div class="pca-acc"><button type="button" class="pca-sbtn" data-acc="ace-rechazar">Rechazar</button><button type="button" class="pca-sbtn pca-sbtn--pri" data-acc="ace-aceptar" data-foco="ppal">Aceptar</button></div></section>';
    } else if (vista === 'validando') {
      pieza = '<section class="pca-pieza pca-pieza--res" role="status"><div class="pca-res"><span class="pca-res__ic">' + svg('girar', 20, 2.4, 'pca-gira') + '</span><h2 class="pca-h">Validando tu boleta</h2></div></section>';
    } else if (vista === 'aceptada') {
      pieza = '<section class="pca-pieza pca-pieza--res" role="status"><div class="pca-res"><span class="pca-res__ic pca-res__ic--ok">' + svg('ok', 28, 2.4) + '</span><h2 class="pca-h">Boleta aceptada</h2><p class="pca-p">Ya está a tu nombre. Entras por la ' + e(sg.puerta) + ' con tu documento.</p></div>' +
        btnS('ace-listo', 'Ver cómo le queda a ' + e(ella), { cls: 'pca-sbtn--pri' }) + '</section>';
    } else if (vista === 'rechazada') {
      pieza = '<section class="pca-pieza pca-pieza--res" role="status"><div class="pca-res"><span class="pca-res__ic">' + svg('x', 26, 2.4) + '</span><h2 class="pca-h">Rechazaste la boleta</h2><p class="pca-p">' + e(ella) + ' puede asignarla a otra persona antes del ' + LIMITE + '</p></div>' +
        btnS('ace-deshacer', 'Volver a la invitación', { izq: 'deshacer' }) + '<button type="button" class="pca-sbtn" data-acc="ace-vista-titular">Ver la vista de ' + e(ella) + '</button></section>';
    } else {
      pieza = '<section class="pca-pieza pca-pieza--res" role="alert"><div class="pca-res"><span class="pca-res__ic pca-res__ic--s2">' + svg('aviso', 26) + '</span><h2 class="pca-h">No es posible aceptar esta boleta</h2><p class="pca-p">Por privacidad no mostramos el motivo. Puedes consultar tu estado en tu portal de estado.</p></div>' +
        btnS('ace-deshacer', 'Volver a la invitación') + '</section>';
      selloH = sello(['Validado por IVC', 'Revisar en Mindeporte']);
    }
    // El sello va fuera de la tarjeta, fijo abajo (DC-245).
    return C.marco({ paso: 'aceptar', atras: null, cuerpo: cab + pieza, pie: selloH });
  }

  function aceptar(ctx) {
    var st = ctx.st, m = mio(st), a = invitadoDe(st);
    if (m.run) { return; }
    m.run = true; m.noPosible = false; var tk = ++m.tk;
    ctx.repintar();
    ctx.consultar(3, function (r) {
      if (m.tk !== tk || st.pca !== m) { return; }
      m.run = false;
      if (r && r.ok) { st.segunda = { estado: 'asignada', a: a, rechazada: null }; } else { m.noPosible = true; }
      ctx.repintar();
      foco(ctx, 'ppal');
    }, { fase: 'aceptar' });
  }

  C.registrar('aceptar', {
    render: renderAceptar,
    onClick: function (el, ev, ctx) {
      var acc = el.dataset.acc, st = ctx.st, m = mio(st);
      if (acc === 'ace-aceptar') { aceptar(ctx);
      } else if (acc === 'ace-rechazar') { st.segunda = { estado: 'sinTitular', a: null, rechazada: invitadoDe(st) }; ctx.repintar(); foco(ctx, 'ppal');
      } else if (acc === 'ace-deshacer') {
        var r = st.segunda.rechazada; m.noPosible = false;
        if (r) { st.segunda = { estado: 'invitada', a: r, rechazada: null }; }
        ctx.repintar(); foco(ctx, 'ppal');
      } else if (acc === 'ace-vista-titular') { ctx.ir('listo');
      } else if (acc === 'ace-listo') { ctx.ir('listo'); }
    }
  });
})();
