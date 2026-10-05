/* Superficie 5 · Acceso en puerta: app del operador y vista policial. Modelo en modeling/desing-views/05-acceso-puerta.md. */
window.PANTALLAS = window.PANTALLAS || {};

(function () {
  var TIPOS = ['CC', 'TI', 'CE', 'PPT', 'Pasaporte', 'PEP', 'RUMV'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hora(min) { var h = 18 + Math.floor(min / 60), m = min % 60; return h + ':' + (m < 10 ? '0' : '') + m; }

  function montar(raiz, ctx, modo) {
    var D = ctx.D, E = D.evento;
    var st = {
      disp: modo === 'policia' ? 'tablet' : 'celular',
      offline: false, bio: true, torn: true,
      vista: 'lectura', caso: null,
      apoyo: false, acomp: false, policia: false, luz: false, zoomCam: false, hoja: null, digitos: '', tipo: 'CC',
      reloj: 40, pendientes: 0,
      turno: JSON.parse(JSON.stringify(D.turno)),
      historial: D.historial.slice(),
      alerta: 'nueva', cierre: null, toast: null,
      // Policía: primero el tablero del evento, después el perfil de la alerta que se abre.
      pvista: 'eventos', efiltro: 'vivo', ebusca: '', filtro: 'todas', abierta: null, min: 43, modal: null, tomaPrimero: false,
      alertas: JSON.parse(JSON.stringify(D.policia.tablero.alertas))
    };
    // Orden propio de Puerta (DC-347): «solo con CC» va segundo.
    var CASOS = D.casos.slice();
    CASOS.splice(1, 0, CASOS.splice(CASOS.map(function (c) { return c.id; }).indexOf('solocc'), 1)[0]);
    var temporizadores = [];
    function luego(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }
    var capa = null;
    function cancelar() { temporizadores.forEach(clearTimeout); temporizadores = []; if (capa) { capa.detener(); } }

    /* ---------- Guion (fuera del producto) ---------- */

    // Tema e icono por caso, para que el panel hable el mismo semáforo que la app.
    var ASPECTO = {
      verde: { tema: 'positive', icono: 'positive' },
      amarillo: { tema: 'warning', icono: 'attention' },
      rojo: { tema: 'negative', icono: 'negative' },
      rostro: { tema: 'informative', icono: 'avatar' }
    };

    function toolbar() {
      var titulo = modo === 'policia' ? 'Vista policial' : 'Acceso en puerta';
      var sub = modo === 'policia' ? 'Policía Nacional · ' + E.escenario : 'Operador de puerta · ' + E.puerta;
      return '<nwt-toolbar class="pp-toolbar">' +
        '<div class="pp-toolbar__marca"><nwt-logo-naowee></nwt-logo-naowee></div>' +
        '<nwt-title class="pp-toolbar__titulo">' + esc(titulo) + '<span slot="subtitle">' + esc(sub) + '</span></nwt-title>' +
        '<nwt-button slot="actions" nwt-variant="quiet" nwt-theme="neutral" nwt-size="medium" icon-end="logout" data-acc="salir">Cambiar de perfil</nwt-button>' +
      '</nwt-toolbar>';
    }

    function tarjeta(titulo, cuerpo) {
      return '<nwt-card class="pp-panel__card" nwt-size="small"><span slot="header" class="nwt-body-font-bold">' + esc(titulo) + '</span>' + cuerpo + '</nwt-card>';
    }

    function guion() {
      var casos = modo === 'policia'
        ? '<nwt-detail-item actionable icon="filter" nwt-theme="informative" data-acc="elegir-evento">Elegir el evento en vivo</nwt-detail-item>' +
          '<nwt-detail-item actionable icon="notification" nwt-theme="negative" data-acc="nueva-alerta">Recibir una alerta roja</nwt-detail-item>' +
          '<nwt-detail-item actionable icon="user" nwt-theme="informative" data-acc="agente-primero">Un agente la toma antes de asignarla</nwt-detail-item>'
        : CASOS.map(function (c) {
            var a = ASPECTO[c.punto];
            return '<nwt-detail-item actionable icon="' + a.icono + '" nwt-theme="' + a.tema + '" data-caso="' + c.id + '"><span class="pp-caso__punto pp-caso__punto--' + c.punto + '" aria-hidden="true"></span>' + esc(c.etiqueta) + '</nwt-detail-item>';
          }).join('');
      var fila = function (id, icono, texto, marcado) {
        return '<div class="pp-panel__fila"><nwt-icon-label icon="' + icono + '">' + texto + '</nwt-icon-label><nwt-switch id="' + id + '"' + (marcado ? ' checked' : '') + '></nwt-switch></div>';
      };
      return '<aside class="pp-panel" aria-label="Controles del demo">' + '<button type="button" class="pp-panel__toggle" aria-expanded="false"><span>Controles del demo</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>' +
        tarjeta('Dispositivo', '<nwt-tabs id="tabs-disp" full-width></nwt-tabs>') +
        tarjeta(modo === 'policia' ? 'Alertas' : 'Leer una persona', '<div class="pp-panel__lista">' + casos + '</div>') +
        (modo === 'policia' ? '' : tarjeta('Condiciones', fila('sw-offline', 'refresh', 'Sin conexión', false) + '<nwt-divider></nwt-divider>' + fila('sw-bio', 'avatar', 'Módulo biométrico', true) + '<nwt-divider></nwt-divider>' + fila('sw-torn', 'padlock-open', 'Torniquete', true))) +
        '<p class="nwt-smalltext-font-regular pp-panel__pie">Datos e información de prueba.</p>' +
      '</aside>';
    }

    function zoomControles() {
      return '<div class="pp-zoom">' +
        '<nwt-icon-button icon="zoom-out" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Alejar" data-zoom="out"></nwt-icon-button>' +
        '<nwt-icon-button icon="zoom-in" nwt-size="small" nwt-variant="mute" nwt-theme="neutral" label="Acercar" data-zoom="in"></nwt-icon-button>' +
      '</div>';
    }

    function velocidadControl() {
      return '<div class="pp-velocidad">' +
        '<div class="pp-velocidad__g" role="group" aria-label="Velocidad de validación" id="velocidad-ctrl">' +
          '<button type="button" class="pp-velocidad__b" data-vel="slow" aria-pressed="false">Slow motion</button>' +
          '<button type="button" class="pp-velocidad__b" data-vel="normal" aria-pressed="true">Tiempo real</button>' +
        '</div>' +
      '</div>';
    }

    function chipConexion() { return '<span class="pp-conexion' + (st.offline ? ' pp-conexion--off' : '') + '">' + (st.offline ? 'Sin conexión' : 'En línea') + '</span>'; }

    // Cromo del sistema operativo: barra de estado y fila de marca, como la app del conductor de uaesp.
    function cromo() {
      // Sin barra de estado mientras hay validación o resultado (DC-332).
      if (st.disp === 'consola' || st.vista !== 'lectura') { return ''; }
      var estado = '<div class="pp-estado" aria-hidden="true"><span>' + hora(st.reloj) + '</span>' +
        '<span class="pp-estado__r"><span class="pp-estado__sig"><i></i><i></i><i></i><i></i></span><span class="pp-estado__bat"></span></span></div>';
      // En tablet el logo va en la barra de la puerta (una sola línea); la fila de marca es solo del celular.
      if (st.disp === 'tablet') { return estado; }
      return estado +
        '<div class="pp-marca"><div class="pp-marca__izq">' + window.NAOWEE.entidades + '</div>' +
        '<div class="pp-marca__acciones">' + chipConexion() + '<span class="pp-marca__sep" aria-hidden="true"></span>' +
        '<button type="button" class="pp-menu" aria-label="Menú" data-acc="menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></button></div></div>';
    }

    /* ---------- Piezas de la app ---------- */

    // Cuenta regresiva al inicio del partido: parte de 20 min y baja cada segundo; cada lectura del demo resta un minuto.
    var desde = Date.now();
    function faltan() {
      var s = 20 * 60 - (st.reloj - 40) * 60 - Math.floor((Date.now() - desde) / 1000);
      if (s <= 0) { return '00:00'; }
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }
    var timerCuenta = setInterval(function () {
      disp && disp.querySelectorAll('[data-cuenta]').forEach(function (e) { e.textContent = faltan(); });
    }, 1000);

    function barra() {
      // Con validación o resultado en pantalla no va la barra de la puerta (DC-333).
      if (st.vista !== 'lectura') { return ''; }
      var partes = E.partido.split(/\svs\.?\s/);
      var logoNaowee = '<span class="pp-marca__naowee">' + window.NAOWEE.logo + '</span>';
      var equipo = function (nom, texto) { return '<span class="pp-equipo-nom"><img class="pp-escudo" src="assets/escudos/' + nom + '.png" alt="Escudo">' + esc(texto) + '</span>'; };
      // Cada pieza del partido va en su propio span sin corte: si no, el texto se parte entre los escudos.
      return '<header class="pp-barra">' +
        '<div class="pp-barra__marca">' + (st.disp === 'tablet' || st.disp === 'consola' ? logoNaowee : '') + '</div>' +
        '<div class="pp-barra__lugar"><div class="pp-barra__fila"><p class="pp-barra__puerta">' + esc(E.puerta) + '</p></div>' +
        '<p class="pp-barra__partido">' + equipo('nacional', partes[0]) + '<span class="pp-vs">vs</span>' + equipo('medellin', partes[1]) + '<span class="pp-tiempo"><span class="pp-hora">' + esc(E.hora) + '</span><span class="pp-faltan">Inicia en <b data-cuenta>' + faltan() + '</b></span></span></p></div>' +
        (st.disp === 'celular' ? '' : chipConexion()) +
      '</header>' +
      (st.offline ? '<div class="pp-aviso" role="status"><nwt-icon value="refresh"></nwt-icon>Validando con el paquete del evento · actualizado 17:05 · ' + st.pendientes + ' por sincronizar</div>' : '');
    }

    // Icon button sobre la cámara: solo ícono de 16 px, 44 px de objetivo; activo en naranja (DC-191).
    function tagCamara(acc, icono, texto, activo) {
      return '<button type="button" class="pp-camara__ib" data-acc="' + acc + '" aria-pressed="' + activo + '" aria-label="' + texto + '" title="' + texto + '"><nwt-icon value="' + icono + '"></nwt-icon></button>';
    }
    // Estado de un equipo: solo la palabra; el punto lleva el estado y `estadoEquipos` lo mantiene en vivo (DC-192).
    var ESTADOS = {
      red: { nombre: 'Conexión', ok: 'en línea', off: 'sin conexión' },
      bio: { nombre: 'Biométrico', ok: 'activo', off: 'apagado' },
      torn: { nombre: 'Torniquete', ok: 'conectado', off: 'sin conexión', ocupado: 'respondiendo', apagado: 'apagado' }
    };
    function puntoDe(clave) {
      if (clave === 'bio') { return st.bio ? 'ok' : 'off'; }
      if (clave === 'red') { return st.offline ? 'alerta' : 'ok'; }
      // Precedencia: apagado > sin conexión > respondiendo > conectado.
      return !st.torn ? 'apagado' : st.offline ? 'off' : st.vista === 'validando' ? 'ocupado' : 'ok';
    }
    function estadoCamara(clave) {
      var punto = puntoDe(clave), e = ESTADOS[clave], det = e.nombre + ': ' + e[punto];
      return '<span class="pp-camara__tag pp-camara__tag--estado" data-equipo="' + clave + '" role="status" aria-label="' + det + '" title="' + det + '"><i class="pp-camara__punto pp-camara__punto--' + punto + '"></i>' + e.nombre + '</span>';
    }
    function lectorFijo(texto) { return '<span class="pp-camara__tag pp-camara__tag--estado"><i class="pp-camara__punto pp-camara__punto--ok"></i>' + texto + '</span>'; }
    // Cambia solo el punto y el nombre accesible: sin repintar el equipo no se reinicia láser ni validación.
    function estadoEquipos() {
      disp.querySelectorAll('[data-equipo]').forEach(function (t) {
        var clave = t.dataset.equipo, punto = puntoDe(clave), e = ESTADOS[clave], det = e.nombre + ': ' + e[punto];
        t.querySelector('.pp-camara__punto').className = 'pp-camara__punto pp-camara__punto--' + punto;
        t.setAttribute('aria-label', det); t.title = det;
      });
    }

    function camara() {
      return '<div class="pp-camara' + (st.luz ? ' pp-camara--luz' : '') + (st.zoomCam ? ' pp-camara--zoom' : '') + '" aria-label="Cámara leyendo">' +
        '<div class="pp-camara__herr">' +
          '<div class="pp-camara__estado">' + estadoCamara('bio') + estadoCamara('torn') + '</div>' +
          '<div class="pp-camara__botones">' + tagCamara('linterna', 'sun', 'Linterna', st.luz) + tagCamara('zoom', 'zoom-in', 'Zoom 2×', st.zoomCam) + '</div>' +
        '</div>' +
        '<div class="pp-camara__guia"><span class="pp-esquina pp-esquina--1"></span><span class="pp-esquina pp-esquina--2"></span><span class="pp-esquina pp-esquina--3"></span><span class="pp-esquina pp-esquina--4"></span><span class="pp-camara__laser"></span></div>' +
        '<p class="pp-camara__ayuda">Acerque la cédula o la boleta · 15 a 20 cm</p>' +
      '</div>';
    }

    function acciones() {
      return '<div class="pp-acciones">' +
        '<nwt-button class="pp-grande" nwt-variant="quiet" icon="edit" data-acc="digitar">Digitar documento</nwt-button>' +
        (st.disp === 'celular' ? '<nwt-icon-button nwt-variant="quiet" icon="history" label="Mi turno" data-acc="turno"></nwt-icon-button>' : '') +
      '</div>';
    }

    function turno() {
      var t = st.turno;
      return '<div class="pp-turno"><p class="pp-turno__h">Mi turno</p>' +
        '<div class="pp-turno__stats">' +
          '<div class="pp-stat"><p class="pp-stat__v">' + t.ingresos + '</p><p class="pp-stat__l">Ingresos</p></div>' +
          '<div class="pp-stat"><p class="pp-stat__v">' + t.avisos + '</p><p class="pp-stat__l">Avisos</p></div>' +
          '<div class="pp-stat"><p class="pp-stat__v">' + t.rojos + '</p><p class="pp-stat__l">Rojos</p></div>' +
        '</div>' +
        '<p class="pp-turno__sub">Últimas lecturas</p>' +
        '<ul class="pp-historial">' + st.historial.filter(function (h) { return h.lectura; }).slice(0, 5).map(function (h) {
          return '<li><span class="pp-caso__punto pp-caso__punto--' + h.color + '"></span><span>' + esc(h.texto) + '</span><time>' + h.hora + '</time></li>';
        }).join('') + '</ul></div>';
    }

    function icono(v) { return '<div class="pp-resultado__icono" aria-hidden="true"><nwt-icon value="' + v + '"></nwt-icon></div>'; }

    /* ---------- Semáforo del equipo (canvas): palabra, rótulo, documento sobre el color, notas, acciones ---------- */

    var SVG = function (d, t) { return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">' + d + '</svg>'; };
    var I = {
      pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
      boleta: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M10 7v10"/>',
      aviso: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
      escudo: '<path d="M12 3l7.5 3v6c0 4.4-3.1 7.7-7.5 9-4.4-1.3-7.5-4.6-7.5-9V6z"/>',
      fecha: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
      flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
      candado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      refresh: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
      cara: '<circle cx="12" cy="9" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>',
      x: '<path d="M6 6l12 12M18 6L6 18"/>'
    };
    var SILUETA = '<svg viewBox="0 0 56 64" width="80%" height="80%" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="28" cy="24" r="11"/><path d="M6 64c2-14 11-20 22-20s20 6 22 20"/></svg>';

    // La foto viene del caso (`c.foto`); sin foto en el caso, la silueta. `sin` fuerza el estado "Sin foto".
    function foto(sin, rotulo, url) {
      var caja = sin
        ? '<div class="pp-r__foto pp-r__foto--sin">' + SVG('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 15h5"/>', 22) + 'Sin foto</div>'
        : url ? '<div class="pp-r__foto pp-r__foto--img"><img src="' + esc(url) + '" alt="Foto del documento"></div>'
        : '<div class="pp-r__foto">' + SILUETA + '</div>';
      return rotulo ? '<div class="pp-r__fotoc">' + caja + rotulo + '</div>' : caja;
    }

    // Mismo lugar y tamaño en todos los estados. El rojo por medida no lleva nombre (supuesto del modelo).
    function documento(c, extra) {
      var fotos = extra ? '<div class="pp-r__fotos">' + foto(c.sinFoto, 'Referencia', c.foto) + '<div class="pp-r__fotoc"><div class="pp-r__foto"><nwt-icon value="camera"></nwt-icon></div>Cámara</div></div>' : foto(c.sinFoto, null, c.foto);
      return '<section class="pp-r__doc" aria-label="Documento escaneado">' + fotos +
        '<div class="pp-r__datos"><span class="pp-r__tipo">Documento escaneado</span>' +
        '<span class="pp-r__nombre">' + esc(c.nombre || 'Policía reserva el nombre') + '</span><span class="pp-r__num">' + esc(c.doc) + '</span></div></section>';
    }

    function nota(icono, texto, fuerte) { return '<p class="pp-r__nota' + (fuerte ? ' pp-r__nota--fuerte' : '') + '">' + (icono ? SVG(I[icono], 16) : '') + '<span class="pp-r__nota-linea" title="' + esc(texto) + '">' + esc(texto) + '</span></p>'; }
    // Ícono a la izquierda, igual que nota() (DC-323).
    function notaDer(icono, texto, fuerte) { return '<p class="pp-r__nota' + (fuerte ? ' pp-r__nota--fuerte' : '') + '">' + SVG(I[icono], 16) + '<span class="pp-r__nota-linea" title="' + esc(texto) + '">' + esc(texto) + '</span></p>'; }
    function notaHtml(icono, html) { return '<p class="pp-r__nota">' + SVG(I[icono], 16) + html + '</p>'; }
    function boton(acc, texto, o) {
      o = o || {};
      var atajo = o.atajo && st.disp === 'consola' ? '<kbd>' + o.atajo + '</kbd>' : '';
      var fin = o.flecha && st.disp !== 'consola' ? SVG(I.flecha, 20) : '';
      return '<button type="button" class="pp-r__btn' + (o.sec ? ' pp-r__btn--sec' : '') + '" data-acc="' + acc + '"' + (o.off ? ' disabled aria-disabled="true"' : '') + '>' + atajo + esc(texto) + (o.check ? SVG('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18) : '') + fin + '</button>';
    }

    function pantalla(tono, palabra, rotulo, dato, doc, notas, acciones) {
      return '<section class="pp-r pp-r--' + tono + (st.disp === 'celular' ? '' : ' pp-r--cols') + '" role="alert"><div class="pp-r__top">' +
        '<h1 class="pp-r__palabra">' + palabra + '</h1>' +
        '<div class="pp-r__rotulo"><div class="pp-r__rotulo-l">' + SVG(I[rotulo[0]], 18) + '<span>' + esc(rotulo[1]) + '</span></div><p class="pp-r__dato">' + esc(dato) + '</p></div>' +
        doc + (notas ? '<div class="pp-r__notas">' + notas + '</div>' : '') + '</div>' +
        '<div class="pp-r__acciones">' + acciones + '</div>' +
        '<div class="pp-r__lector">' + SVG('<path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M7 12h10"/>', 20) + 'Lector activo · la siguiente lectura reemplaza esta pantalla</div></section>';
    }

    function validando() {
      // Mismo orden del splash: Deporte arriba, IVC al centro, el loader del código y el texto debajo (DC-375).
      return '<section class="pp-r pp-r--cargando" role="status"><div class="pp-r__centro">' +
        '<div class="pp-r__cabeza">' + window.NAOWEE.mindeporteSolo(56) + '</div>' +
        '<div class="pp-r__nucleo">' + window.NAOWEE.chipIvc(32) + SPLASH.codigo() +
        '<p class="pp-r__texto" aria-live="polite">' + (st.offline ? 'Validando con el paquete del evento…' : 'Consultando la base nacional…') + '</p></div></div>' +
        '<div class="pp-r__acciones">' + boton('cancelar-scan', 'Cancelar escaneo', { sec: true }) + '</div></section>';
    }

    function resultado() {
      var c = st.caso, hh = hora(st.reloj);
      if (st.vista === 'validando') { return validando(); }
      if (c.color === 'verde') {
        // Tras "Sí, es la persona" el verde nombra la verificación, no la ubicación (DC-107).
        return pantalla('verde', 'ENTRA', c.verificado ? ['escudo', 'Identidad verificada'] : ['pin', 'Ubicación'], c.detalle, documento(c),
          (c.soloCC ? nota('boleta', 'Sin boleta en mano: vale la asignada') : '') +
          (st.offline ? nota('refresh', 'Sin conexión · se sincroniza al volver') : ''),
          boton('continuar', 'Registrar Entrada', { atajo: 'Enter', flecha: true }));
      }
      if (c.color === 'amarillo' && c.riesgo) {
        return pantalla('amarillo', 'APARTAR', ['aviso', 'Posible riesgo en este partido'], c.detalle.replace(/\.$/, ''), documento(c),
          nota('campana', 'Señal, no certeza: apártelo y oriéntelo con pedagogía persuasiva'),
          boton('continuar', 'Continuar', { atajo: 'Enter', flecha: true }) +
          (st.acomp ? boton('acompanar', 'Acompañamiento solicitado', { sec: true, off: true, check: true }) : boton('acompanar', 'Solicitar acompañamiento', { sec: true })));
      }
      if (c.color === 'amarillo') {
        return pantalla('amarillo', 'ENTRA', ['aviso', 'Aviso'], c.detalle.replace(/\.$/, ''), documento(c),
          notaHtml('campana', '<span>Supervisor y Policía avisados<span class="pp-r__nota-sub">' + hh + ' · ' + esc(E.puerta) + '</span></span>'),
          boton('continuar', 'Continuar', { atajo: 'Enter', flecha: true }));
      }
      if (c.color === 'rojo' && c.operativo) {
        return pantalla('rojo', 'NO ENTRA', ['boleta', 'Causa'], c.causa, documento(c),
          notaDer('fecha', c.detalle.replace(/\.$/, '')) + notaDer('flecha', 'Diríjase a la taquilla oficial', true),
          boton('cerrar-rojo', 'Siguiente', { atajo: 'Enter', flecha: true }) +
          (st.policia ? boton('policia', 'Policía avisada', { sec: true, off: true, check: true }) : boton('policia', 'Llamar a la Policía', { sec: true, atajo: 'P' })));
      }
      if (c.color === 'rojo') {
        return pantalla('rojo', 'NO ENTRA', ['escudo', 'Medida vigente'], 'Remitir a la Policía', documento(c),
          nota(null, st.offline ? 'Alerta en cola · sale al volver la red' : 'Alerta al PMU · ' + hh + ' · ' + E.puerta.split(' · ')[0]) + nota(null, 'Nadie en la puerta puede autorizarlo'),
          boton('cerrar-rojo', 'Remitir y siguiente', { atajo: 'Enter', flecha: true }) +
          (st.apoyo ? boton('apoyo', 'Apoyo solicitado', { sec: true, off: true, check: true }) : boton('apoyo', 'Reportar alteración', { sec: true })));
      }
      // Confianza baja: misma composición; con el módulo encendido se compara contra la foto de referencia.
      var bio = st.bio;
      return pantalla('rostro', 'VERIFICAR', ['cara', 'Confianza baja'], c.motivo.replace(/\.$/, ''), documento(c, bio),
        nota(null, bio ? '¿Es la misma persona de la referencia?' : 'Compare la cédula con la persona', true),
        boton('rostro-si', 'Sí, es la persona') + boton('rostro-no', 'No coincide', { sec: true }));
    }

    // Solo presentación: bloques de 3 para leer el número; st.digitos queda sin espacios.
    // Miles desde la derecha: el grupo corto queda a la izquierda (DC-195).
    function grupos(d) { return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    function hoja() {
      if (!st.hoja) { return ''; }
      if (st.hoja === 'turno' || st.hoja === 'menu') {
        var tit = 'Mi turno';
        return '<div class="pp-velo" data-acc="cerrar-hoja"></div><div class="pp-hoja" role="dialog" aria-label="' + tit + '"><div class="pp-hoja__cab"><span>' + tit + '</span><nwt-icon-button nwt-variant="mute" nwt-size="small" icon="close" label="Cerrar" data-acc="cerrar-hoja"></nwt-icon-button></div>' + turno() + '</div>';
      }
      var teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'ok'];
      return '<div class="pp-velo" data-acc="cerrar-hoja"></div><div class="pp-hoja" role="dialog" aria-label="Digitar documento">' +
        '<div class="pp-hoja__cab"><span>Digitar documento</span><nwt-icon-button nwt-variant="mute" nwt-size="small" icon="close" label="Cerrar" data-acc="cerrar-hoja"></nwt-icon-button></div>' +
        '<div class="pp-tipos">' + TIPOS.map(function (t) { return '<nwt-tag data-tipo="' + t + '"' + (st.tipo === t ? ' active' : '') + '>' + t + '</nwt-tag>'; }).join('') + '</div>' +
        '<div class="pp-pantallita" aria-live="polite">' + esc(grupos(st.digitos)) + '</div>' +
        '<div class="pp-teclas">' + teclas.map(function (k) {
          return k === 'ok'
            ? '<button class="pp-tecla" style="background:var(--naotech-primary-color-600);color:var(--naotech-color-white-alpha-100)" data-tecla="ok" aria-label="Validar">Validar</button>'
            : '<button class="pp-tecla" data-tecla="' + k + '"' + (k === '⌫' ? ' aria-label="Borrar"' : '') + '>' + k + '</button>';
        }).join('') + '</div>' +
        '<p class="nwt-smalltext-font-regular pp-hoja__ayuda" id="hoja-ayuda">Mínimo 5 dígitos. Pruebe con un número que termine en 4447 para ver un rojo.</p></div>';
    }

    function toast() {
      return st.toast ? '<nwt-toast class="pp-toast" visible icon="' + (st.toast.tema === 'warning' ? 'attention' : 'positive') + '" nwt-theme="' + (st.toast.tema || 'positive') + '" heading="' + esc(st.toast.t) + '" message="' + esc(st.toast.m) + '" data-acc="cerrar-toast"></nwt-toast>' : '';
    }

    function listo() {
      return '<div class="pp-lateral__listo"><strong>Listo para leer</strong><span>La cámara sigue leyendo mientras ve el resultado.</span></div>';
    }

    function appOperador() {
      var hayResultado = st.vista !== 'lectura';
      var columnaCamara = '<div class="pp-columna">' + camara() + acciones() + '</div>';
      var cuerpo;
      if (st.disp === 'celular') {
        cuerpo = '<div class="pp-cuerpo">' + columnaCamara + (hayResultado ? resultado() : '') + '</div>';
      } else if (st.disp === 'tablet') {
        // Con resultado, ocupa toda la pantalla; la validación en curso queda en la columna.
        cuerpo = '<div class="pp-cuerpo">' + columnaCamara +
          '<div class="pp-lateral"><div class="pp-lateral__arriba">' + listo() + '</div>' + turno() + '</div>' +
          (st.vista === 'validando' ? validando() : st.vista === 'resultado' ? resultado() : '') + '</div>';
      } else {
        cuerpo = '<div class="pp-cuerpo"><div class="pp-lector">' +
          '<form class="pp-lector__campo" data-form="lector"><nwt-icon value="qr-code"></nwt-icon>' +
            '<input id="lector" autocomplete="off" inputmode="numeric" aria-label="Lectura del lector USB o documento digitado" placeholder="Pase el documento por el lector o digite el número">' +
            '<nwt-button type="submit" data-acc="leer">Validar</nwt-button></form>' +
          ('<div class="pp-lector__espera"><div><nwt-icon value="qr-code"></nwt-icon><p class="pp-resultado__causa">Esperando lectura</p><p>El foco vuelve solo al campo después de cada persona.</p></div></div>') +
          '</div><div class="pp-lateral"><div class="pp-lateral__arriba">' + listoConsola() + '</div>' + turno() + '</div>' +
          (st.vista === 'validando' ? validando() : st.vista === 'resultado' ? resultado() : '') + '</div>';
      }
      return '<div class="pp-app">' + barra() + cuerpo + hoja() + toast() + '</div>';
    }

    function listoConsola() {
      // Mismos tags de estado del celular, sobre fondo gris claro (DC-187).
      return '<div class="pp-lateral__listo"><strong>' + esc(E.puerta) + '</strong><span>Lector USB conectado · torniquete asignado desde el backoffice.</span>' +
        '<div class="pp-lateral__estado">' + estadoCamara('red') + estadoCamara('bio') + estadoCamara('torn') +
          lectorFijo('Lector de cédula · Conectado') + lectorFijo('Lector QR · Conectado') + '</div></div>';
    }

    // Club afín: el indicativo más visible de la vista. Escudo y nombre a la izquierda; barras y porcentaje a la derecha.
    // Ícono a la izquierda de cada título de señal (DC-100).
    var ICONO_SENAL = { 'Club afín': 'favorite', 'Tribuna habitual': 'gps-pin', 'Frecuencia': 'calendar', 'Viajes de visitante': 'vehicles', 'Con quién va': 'user', 'Intentos fallidos': 'attention' };
    function tituloSenal(l) { return '<p class="pp-senal__l"><nwt-icon value="' + (ICONO_SENAL[l] || 'info') + '"></nwt-icon>' + esc(l) + '</p>'; }

    function senalClub(s) {
      var partes = s.v.split(' · '), pct = parseInt(partes[1], 10) || 0, llenas = Math.round(pct / 20);
      var barras = [0, 1, 2, 3, 4].map(function (i) { return '<span class="pp-barra-n' + (i < llenas ? ' pp-barra-n--on' : '') + '" style="height:' + (10 + i * 6) + 'px"></span>'; }).join('');
      return '<div class="pp-senal pp-senal--decide pp-senal--club">' + tituloSenal(s.l) +
        '<div class="pp-club"><img class="pp-club__escudo" src="assets/escudos/nacional.png" alt="Escudo"><p class="pp-club__nombre">' + esc(partes[0]) + '</p>' +
        '<div class="pp-club__pct"><span class="pp-barras" aria-hidden="true">' + barras + '</span><span class="pp-club__num">' + esc(partes[1] || '') + '</span></div></div>' +
        '<p class="pp-senal__por">' + esc(s.por) + '</p><p class="pp-senal__marca">Único dato que decide un acceso: partidos sin hinchada visitante</p></div>';
    }

    /* ---------- Tablero del evento (Policía, antes del perfil) ---------- */

    function ahora() { return '18:' + st.min; }
    function abierta() { return st.alertas.filter(function (a) { return a.id === st.abierta; })[0]; }
    function contar(e) { return st.alertas.filter(function (a) { return a.estado === e; }).length; }

    function volverIcono(acc, rotulo) {
      return '<button type="button" class="pp-t__volver pp-t__volver--ico" data-acc="' + acc + '" aria-label="' + rotulo + '" title="' + rotulo + '">' + SVG('<path d="M19 12H5M11 6l-6 6 6 6"/>', 20) + '</button>';
    }

    // tipo: 'lista' (eventos, con el selector), 'tablero' (vuelve a eventos) o 'perfil' (vuelve al tablero).
    function barraPolicia(tipo) {
      // Volver es solo icono (DC-145): en el tablero vive junto al partido; en el perfil, en la barra.
      var volver = tipo === 'perfil' ? volverIcono('t-tablero', 'Volver al tablero del evento') : '';
      return '<header class="pp-policia__barra">' +
        '<div class="pp-policia__grupo pp-policia__grupo--izq">' + volver +
          window.NAOWEE.entidades +
          '</div>' +
        '<div class="pp-policia__grupo"><span class="pp-policia__texto">Policía Nacional</span><img class="pp-policia__escudo" src="assets/escudos/policia.png" alt="Policía Nacional"><span class="pp-conexion">En línea</span></div>' +
      '</header>';
    }

    var ESTADO = { nueva: 'Nueva', atencion: 'En atención', cerrada: 'Cerrada' };

    function nombres(a) { return (a.asignados || []).join(', '); }

    function tarjetaAlerta(a) {
      var ultimo = a.pasos[a.pasos.length - 1], asignada = a.estado === 'nueva' && a.asignados;
      var tiempo = a.estado === 'nueva' ? (asignada ? 'Notificada · ' + a.horaAsig : 'Sonando · ' + a.hora) : a.estado === 'atencion' ? 'Abierta · ' + a.hora : 'Cerrada · ' + ultimo.hora;
      var pasos = a.pasos.map(function (p) {
        return '<li><span class="pp-t__paso-hora">' + esc(p.hora) + '</span><span>' + esc(p.texto) + ' <span class="pp-t__quien">· ' + esc(p.quien) + '</span></span></li>';
      }).join('');
      // La Policía no toma la alerta: la asigna, y la toma el agente desde su dispositivo (DC-114).
      var primaria = a.estado === 'nueva' ? '<button type="button" class="pp-t__btn" data-acc="t-asignar" data-id="' + a.id + '">' + (asignada ? 'Cambiar asignación' : 'Asignar') + '</button>'
        : a.estado === 'atencion' ? '<button type="button" class="pp-t__btn" data-acc="t-perfil" data-id="' + a.id + '">Cerrar con resultado</button>' : '';
      return '<article class="pp-t__alerta pp-t__alerta--' + a.estado + '" data-alerta="' + a.id + '">' +
        '<div class="pp-t__alerta-top"><span class="pp-t__estado">' + ESTADO[a.estado] + '</span><span class="pp-t__origen">' + esc(a.origen) + '</span><span class="pp-t__tiempo">' + tiempo + '</span></div>' +
        '<div><p class="pp-t__puerta">' + esc(a.puerta) + '</p><p class="pp-t__doc">' + esc(a.doc) + ' · ' + esc(a.causa) + '</p></div>' +
        (asignada ? '<p class="pp-t__espera">' + SVG(I.campana, 16) + 'Notificada a ' + esc(nombres(a)) + ' · esperando que uno la tome</p>' : '') +
        '<ol class="pp-t__pasos">' + pasos + '</ol>' +
        '<div class="pp-t__acciones">' + primaria + '<button type="button" class="pp-t__btn pp-t__btn--sec" data-acc="t-perfil" data-id="' + a.id + '">Ver perfil</button></div>' +
      '</article>';
    }

    /* ---------- Asignar una alerta (DC-114): modal con la info de la puerta y los agentes a notificar ---------- */

    function zona(puesto) { return puesto.split(' · ')[1]; }
    // Más cerca primero: los de la misma puerta, luego la misma tribuna, luego el resto; los ocupados al final.
    function cercania(ag, puerta) { return ag.ocupado ? 3 : ag.puesto === puerta ? 0 : zona(ag.puesto) === zona(puerta) ? 1 : 2; }
    var CERCA = ['En la puerta', 'Misma tribuna', 'Otra tribuna', 'Ocupado'];
    function agentesDe(puerta) {
      return D.policia.agentes.slice().sort(function (x, y) { return cercania(x, puerta) - cercania(y, puerta); });
    }
    function abrirModal(a) {
      var lista = agentesDe(a.puerta), sel = [];
      if (a.asignados) { sel = lista.filter(function (g) { return a.asignados.indexOf(g.nombre) >= 0; }).map(function (g) { return g.id; }); }
      else { sel = lista.filter(function (g) { return cercania(g, a.puerta) === 0; }).map(function (g) { return g.id; }); if (!sel.length) { sel = [lista[0].id]; } }
      st.modal = { id: a.id, sel: sel, foco: true };
      pintarDispositivo();
    }

    function modal() {
      var m = st.modal; if (!m) { return ''; }
      var a = st.alertas.filter(function (x) { return x.id === m.id; })[0]; if (!a) { return ''; }
      var T = D.policia.tablero, i = T.puertas.map(function (p) { return p.nombre; }).indexOf(a.puerta), pt = T.puertas[i], pv = vivo.puertas[i];
      var tomo = a.estado !== 'nueva', quienTomo = tomo ? a.pasos.filter(function (p) { return p.texto === 'Tomada'; })[0] : null;
      var dato = function (l, v) { return '<div class="pp-m__dato"><span>' + l + '</span><b>' + v + '</b></div>'; };
      var puerta = pv ? '<div class="pp-m__puerta" aria-label="Información de la puerta">' +
        dato('Flujo por minuto', pv.off ? 'Sin conexión' : pv.flujo) + dato('Ingresados', pv.ing.toLocaleString('es-CO')) + dato('Avisos', pt.avisos) + dato('Rojos', pt.rojos) + '</div>' : '';
      var agentes = agentesDe(a.puerta).map(function (g) {
        var c = cercania(g, a.puerta), on = m.sel.indexOf(g.id) >= 0;
        var par = g.nombre.split(' '), ini = par[par.length - 2].charAt(0) + par[par.length - 1].charAt(0);
        return '<label class="pp-m__agente' + (g.ocupado ? ' pp-m__agente--off' : '') + '"><input type="checkbox" data-agente="' + g.id + '"' + (on ? ' checked' : '') + (g.ocupado || tomo ? ' disabled' : '') + '>' +
          '<nwt-avatar nwt-size="large" nwt-color="blue" aria-hidden="true">' + ini + (g.foto ? '<img class="pp-m__foto" src="' + g.foto + '" alt="" onerror="this.remove()">' : '') + '</nwt-avatar>' +
          '<span class="pp-m__quien"><b>' + esc(g.nombre) + '</b><span>' + esc(g.ocupado || g.puesto) + '</span><span class="pp-m__cerca pp-m__cerca--' + c + '">' + CERCA[c] + '</span></span></label>';
      }).join('');
      var aviso = tomo ? '<p class="pp-m__aviso" role="status">' + SVG(I.escudo, 16) + 'Ya la tomó ' + esc(quienTomo ? quienTomo.quien : 'un agente') + ' · ' + esc(quienTomo ? quienTomo.hora : '') + '. No hace falta asignarla.</p>' : '';
      var n = m.sel.length;
      return '<div class="pp-velo pp-velo--modal" data-acc="t-modal-cerrar"></div>' +
        '<div class="pp-modal" role="dialog" aria-modal="true" aria-labelledby="pp-m-t" tabindex="-1">' +
          '<div class="pp-modal__cab"><div><h2 class="pp-modal__t" id="pp-m-t">Asignar alerta</h2>' +
            '<p class="pp-modal__s">' + esc(a.puerta) + ' · ' + esc(a.causa) + ' · ' + esc(a.doc) + ' · ' + esc(a.hora) + '</p></div>' +
            '<button type="button" class="pp-modal__x" data-acc="t-modal-cerrar" aria-label="Cerrar">' + SVG(I.x, 20) + '</button></div>' +
          puerta + aviso +
          '<fieldset class="pp-m__agentes"><legend>Agentes a notificar</legend><div class="pp-m__grid">' + agentes + '</div></fieldset>' +
          '<p class="pp-modal__nota">Reciben la notificación en su dispositivo. Si uno la toma antes, la alerta pasa a En atención.</p>' +
          '<div class="pp-modal__pie"><button type="button" class="pp-m__btn pp-m__btn--sec" data-acc="t-modal-cerrar">' + (tomo ? 'Cerrar' : 'Cancelar') + '</button>' +
            (tomo ? '' : '<button type="button" class="pp-m__btn" data-acc="t-modal-asignar"' + (n ? '' : ' disabled') + '>' + (a.asignados ? 'Reasignar y notificar' : 'Asignar y notificar') + (n ? ' · ' + n : '') + '</button>') + '</div>' +
        '</div>';
    }

    var tomasPendientes = {};
    // Un agente toma la alerta desde su dispositivo: `propia` es cuando nadie se la había asignado.
    function tomaAgente(a, quien, propia) {
      if (!a || a.estado !== 'nueva') { return; }
      st.min++;
      a.estado = 'atencion';
      a.pasos.push({ hora: ahora(), texto: 'Tomada', quien: quien });
      clearTimeout(tomasPendientes[a.id]);
      if (st.abierta === a.id && st.alerta === 'nueva') { st.alerta = 'tomada'; }
      mostrarToast(propia ? quien + ' la tomó primero' : quien + ' tomó la alerta', a.puerta + ' · ' + ahora() + (propia ? ' · nadie la había asignado' : ''), true);
    }
    function programarToma(a) {
      clearTimeout(tomasPendientes[a.id]);
      tomasPendientes[a.id] = setTimeout(function () { if (a.estado === 'nueva' && a.asignados) { tomaAgente(a, a.asignados[0], false); } }, 7000);
      temporizadores.push(tomasPendientes[a.id]);
    }
    // Agente de la misma puerta si lo hay; si no, el más cercano que esté libre.
    function tomadorDe(a) { return agentesDe(a.puerta).filter(function (g) { return !g.ocupado; })[0].nombre; }
    // Caso "ellos la toman primero": pasado un rato sin asignar, el agente de la Puerta 6 la toma por su cuenta.
    function programarTomaPrimero() {
      if (st.tomaPrimero) { return; }
      st.tomaPrimero = true;
      luego(function () {
        var a = st.alertas.filter(function (x) { return x.id === 'a2'; })[0];
        if (a && a.estado === 'nueva' && !a.asignados) { tomaAgente(a, tomadorDe(a), true); }
      }, 20000);
    }

    /* ---------- Tablero en vivo (DC-108) ---------- */

    // Simulación en bucle: cada ciclo parte de los datos del tablero y vuelve a ellos. Con reduced-motion va más lenta.
    var QUIETO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PASO_MS = QUIETO ? 6000 : 1500, CICLO = 48;
    var vivo = null, paso = 0, timerVivo = null;
    function reiniciarVivo() {
      var T = D.policia.tablero;
      vivo = { flujo: T.flujo.slice(), acum: T.puertas.map(function () { return 0; }),
        puertas: T.puertas.map(function (p) { return { flujo: p.flujo, ing: p.ing, off: p.off }; }) };
      paso = 0;
    }
    reiniciarVivo();
    function sumaFlujo(v) { return v.puertas.reduce(function (n, p) { return n + (p.off ? 0 : p.flujo); }, 0); }
    function sumaIng(v) { return v.puertas.reduce(function (n, p) { return n + p.ing; }, 0); }
    function barrasHtml(flujo) {
      var max = Math.max.apply(null, flujo);
      return flujo.map(function (v, i) {
        return '<span class="pp-t__barra' + (i === flujo.length - 1 ? ' pp-t__barra--ahora' : '') + '" style="height:' + Math.round(v / max * 100) + '%" title="' + v + ' por minuto"></span>';
      }).join('');
    }
    function flujoPuertaHtml(p) {
      return p.off ? '<span class="pp-t__off">Sin conexión</span>' : '<span class="pp-t__pista"><span style="width:' + Math.round(p.flujo / 40 * 100) + '%"></span></span><span class="pp-t__num">' + p.flujo + '</span>';
    }
    function textoVivo(clave, txt) { var e = disp && disp.querySelector('[data-vivo="' + clave + '"]'); if (e && e.textContent !== txt) { e.textContent = txt; } }
    function latido() {
      var T = D.policia.tablero;
      paso++;
      if (paso >= CICLO) { reiniciarVivo(); }
      else {
        // Cada puerta oscila con su propia fase; lo que entra sale del flujo de ese momento.
        vivo.puertas.forEach(function (p, i) {
          if (p.off) { return; }
          p.flujo = Math.max(4, Math.round(T.puertas[i].flujo + 6 * Math.sin(paso / 3 + i * 1.7) + 3 * Math.sin(paso / 1.4 + i)));
          vivo.acum[i] += p.flujo * 0.16;
          p.ing = T.puertas[i].ing + Math.floor(vivo.acum[i]);
        });
        // La gráfica corre una barra cada 3 pasos: sale la más vieja, entra el flujo total de ahora.
        if (paso % 3 === 0) { vivo.flujo.shift(); vivo.flujo.push(sumaFlujo(vivo)); }
        else { vivo.flujo[vivo.flujo.length - 1] = sumaFlujo(vivo); }
      }
      var total = sumaIng(vivo), pm = sumaFlujo(vivo), pico = Math.max(190, Math.max.apply(null, vivo.flujo));
      textoVivo('ing', total.toLocaleString('es-CO'));
      textoVivo('ing-pct', (total / T.aforo * 100).toFixed(1).replace('.', ',') + ' % de ' + T.aforo.toLocaleString('es-CO'));
      textoVivo('pm', String(pm));
      textoVivo('pico', pico > 190 ? 'Pico: ' + pico + ' ahora' : 'Pico: ' + T.pico);
      var g = disp && disp.querySelector('[data-vivo="grafica"]'); if (g) { g.innerHTML = barrasHtml(vivo.flujo); }
      vivo.puertas.forEach(function (p, i) {
        var f = disp && disp.querySelector('[data-vivo="p' + i + '-f"]');
        if (f) { f.innerHTML = flujoPuertaHtml(p); }
        textoVivo('p' + i + '-i', p.ing.toLocaleString('es-CO'));
      });
    }
    // Un solo intervalo, solo mientras el tablero está en pantalla; el estado sobrevive a los repintados.
    function sincronizarVivo() {
      var ver = modo === 'policia' && st.pvista === 'tablero';
      if (ver && !timerVivo) { timerVivo = setInterval(latido, PASO_MS); }
      if (!ver && timerVivo) { clearInterval(timerVivo); timerVivo = null; }
    }

    /* ---------- Eventos (Policía): la primera pantalla, antes del tablero. Las cards viven en apps/eventos.js ---------- */

    function appEventos() {
      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('lista') +
        window.EVENTOS.lista({
          eventos: D.policia.eventos, filtro: st.efiltro, busca: st.ebusca, acc: 'e-abrir', accFiltro: 'e-filtro',
          titulo: 'Eventos', sub: 'Partidos de su jurisdicción: en vivo, los que vienen y los pasados.',
          accion: function (e) { return e.estado === 'pasado' ? 'Ver resumen' : e.estado === 'vivo' ? 'Abrir tablero' : 'Ver preparación'; },
          nota: function (e) { return e.tablero ? esc(e.nota) + ' · faltan <b data-cuenta>' + faltan() + '</b>' : esc(e.nota); },
          // El evento con tablero cuenta sus alertas en vivo; los demás traen las suyas en los datos.
          estados: function (e) { return e.tablero ? { nueva: contar('nueva'), atencion: contar('atencion'), cerrada: contar('cerrada') } : e.estados; }
        }) + '</div>' + toast() + '</div>';
    }

    function filtrarEventos() { window.EVENTOS.filtrar(disp, st.ebusca); }
    function onInput(ev) { if (ev.target.classList.contains('pp-e__busca')) { st.ebusca = ev.target.value; filtrarEventos(); } }

    function appTablero() {
      var T = D.policia.tablero;
      var orden = { nueva: 0, atencion: 1, cerrada: 2 };
      var lista = st.alertas.filter(function (a) { return st.filtro === 'todas' || a.estado === st.filtro; })
        .sort(function (a, b) { return orden[a.estado] - orden[b.estado]; });
      var nuevas = contar('nueva'), sinAsignar = st.alertas.filter(function (x) { return x.estado === 'nueva' && !x.asignados; }).length;
      var totalIng = sumaIng(vivo), pm = sumaFlujo(vivo);
      var pct = (totalIng / T.aforo * 100).toFixed(1).replace('.', ',');
      var barras = barrasHtml(vivo.flujo);
      var puertas = vivo.puertas.map(function (p, i) {
        return '<tr><th scope="row"><span class="pp-t__punto' + (p.off ? ' pp-t__punto--off' : '') + '"></span>' + esc(T.puertas[i].nombre) + '</th>' +
          '<td class="pp-t__flujo" data-vivo="p' + i + '-f">' + flujoPuertaHtml(p) + '</td>' +
          '<td class="pp-t__num" data-vivo="p' + i + '-i">' + p.ing.toLocaleString('es-CO') + '</td><td class="pp-t__num pp-t__num--aviso">' + T.puertas[i].avisos + '</td>' +
          '<td class="pp-t__num' + (T.puertas[i].rojos ? ' pp-t__num--rojo' : '') + '">' + T.puertas[i].rojos + '</td></tr>';
      }).join('');
      var filtros = [['todas', 'Todas', st.alertas.length], ['nueva', 'Nuevas', nuevas], ['atencion', 'En atención', contar('atencion')], ['cerrada', 'Cerradas', contar('cerrada')]].map(function (f) {
        return '<button type="button" role="tab" class="pp-t__filtro" aria-selected="' + (st.filtro === f[0]) + '" data-acc="t-filtro" data-id="' + f[0] + '">' + f[1] + ' · ' + f[2] + '</button>';
      }).join('');
      var kpi = function (l, v, s, mod, vivoV, vivoS) { return '<div class="pp-t__kpi' + (mod ? ' pp-t__kpi--' + mod : '') + '"><span class="pp-t__kpi-l">' + l + '</span><span class="pp-t__kpi-v"' + (vivoV ? ' data-vivo="' + vivoV + '"' : '') + '>' + v + '</span><span class="pp-t__kpi-s"' + (vivoS ? ' data-vivo="' + vivoS + '"' : '') + '>' + s + '</span></div>'; };

      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('tablero') +
        '<div class="pp-t">' +
          '<div class="pp-t__main">' +
            '<section class="pp-t__evento" aria-label="Evento">' +
              volverIcono('t-eventos', 'Volver a Eventos') +
              '<div>' + window.EVENTOS.equipos(E.partido) +
              '<p class="pp-t__lugar"><span>' + esc(E.escenario) + ' · hoy · inicio ' + esc(E.hora) + ' · ' + T.puertas.length + ' puertas</span><nwt-badge nwt-size="large" nwt-theme="positive">Abiertos</nwt-badge></p></div>' +
              '<div class="pp-t__cuenta"><span>Faltan para el inicio</span><b data-cuenta>' + faltan() + '</b></div>' +
            '</section>' +
            '<section class="pp-t__kpis" aria-label="Indicadores">' +
              kpi('Ingresados', totalIng.toLocaleString('es-CO'), pct + ' % de ' + T.aforo.toLocaleString('es-CO'), '', 'ing', 'ing-pct') +
              kpi('Ingresos por minuto', pm, 'Pico: ' + T.pico, '', 'pm', 'pico') +
              kpi('Avisos amarillos', T.avisos, 'Entraron con aviso', 'aviso') +
              kpi('Alertas rojas', st.alertas.length, nuevas + (nuevas === 1 ? ' nueva · ' : ' nuevas · ') + contar('atencion') + ' en atención · ' + contar('cerrada') + (contar('cerrada') === 1 ? ' cerrada' : ' cerradas'), 'rojo') +
            '</section>' +
            '<section class="pp-t__caja" aria-label="Ingreso en vivo"><h2 class="pp-t__h">Ingreso en vivo<span>Personas por minuto, cada 5 min · desde las 17:00</span></h2>' +
              '<div class="pp-t__grafica" data-vivo="grafica">' + barras + '</div><div class="pp-t__eje"><span>17:05</span><span>17:35</span><span>18:05</span><span>18:40</span></div></section>' +
            '<section class="pp-t__caja" aria-label="Puertas"><h2 class="pp-t__h">Puertas <span>7 en línea · 1 sin conexión</span></h2>' +
              '<table class="pp-t__tabla"><thead><tr><th scope="col">Puerta</th><th scope="col">Flujo por minuto</th><th scope="col">Ingresados</th><th scope="col">Avisos</th><th scope="col">Rojos</th></tr></thead><tbody>' + puertas + '</tbody></table></section>' +
          '</div>' +
          '<aside class="pp-t__panel" aria-label="Alertas rojas">' +
            '<div class="pp-t__panel-cab"><h2 class="pp-t__h">Alertas rojas <span>Evento de hoy · ' + st.alertas.length + '</span></h2>' +
              (sinAsignar ? '<p class="pp-t__sonando" role="status" title="Deja de sonar al asignarla">' + SVG(I.campana, 18) + (sinAsignar === 1 ? '1 alerta sin asignar' : sinAsignar + ' alertas sin asignar') + '</p>' : '') +
              '<div class="pp-t__filtros" role="tablist" aria-label="Filtrar por estado">' + filtros + '</div></div>' +
            '<div class="pp-t__lista">' + (lista.length ? lista.map(tarjetaAlerta).join('') : '<p class="pp-t__vacio">No hay alertas en este estado.</p>') + '</div>' +
            '<p class="pp-t__pie">Cada paso y cada consulta de perfil quedan en la auditoría.</p>' +
          '</aside>' +
        '</div></div>' + modal() + toast() + '</div>';
    }

    function appPolicia() {
      var P = D.policia, A = abierta() || { puerta: P.puerta, hora: P.hora, pasos: [] };
      var tomada = A.pasos.filter(function (p) { return p.texto === 'Tomada'; })[0];
      var accion;
      if (st.alerta === 'nueva') {
        accion = (A.asignados ? '<p class="pp-resultado__nota"><nwt-icon value="notification"></nwt-icon>Notificada a ' + esc(nombres(A)) + ' · esperando que uno la tome</p>' : '') +
          '<button type="button" class="pp-r__btn" data-acc="t-asignar" data-id="' + esc(A.id) + '">' + (A.asignados ? 'Cambiar asignación' : 'Asignar') + '</button>';
      } else if (st.alerta === 'tomada') {
        accion = '<p class="pp-resultado__nota"><nwt-icon value="user"></nwt-icon>Tomada por ' + esc(tomada ? tomada.quien : 'Pt. R. Gómez (usted)') + ' · ' + esc(tomada ? tomada.hora : ahora()) + '</p>' +
          '<p class="pp-resultado__causa" style="font-size:var(--naotech-sizing-18)">Cerrar con resultado</p>' +
          '<div class="pp-motivos">' + ['Conducido', 'No encontrado', 'Falsa alarma'].map(function (m) {
            return '<button class="pp-motivo pp-motivo--claro" aria-pressed="' + (st.cierre === m) + '" data-cierre="' + m + '">' + m + '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="pp-r__btn" data-acc="cerrar-alerta"' + (st.cierre ? '' : ' disabled style="opacity:.5;cursor:not-allowed"') + '>Cerrar alerta</button>';
      } else {
        accion = '<p class="pp-resultado__nota"><nwt-icon value="positive"></nwt-icon>Cerrada · ' + esc(st.cierre) + ' · queda en la auditoría</p>';
      }
      return '<div class="pp-app"><div class="pp-policia">' + barraPolicia('perfil') +
        '<div class="pp-policia__cuerpo">' +
          '<section class="pp-policia__alerta" aria-label="Alerta roja">' +
            '<h2 class="pp-r__palabra">ALERTA ROJA</h2>' +
            '<div class="pp-r__rotulo"><div class="pp-r__rotulo-l">' + SVG(I.pin, 18) + '<span>Puerta y hora</span></div><p class="pp-r__dato">' + esc(A.puerta) + ' · ' + esc(A.hora) + '</p></div>' +
            window.EVENTOS.equipos(E.partido, { extra: '<span class="pp-alerta__falta">Inicia en <b data-cuenta>' + faltan() + '</b></span>' }) +
            '<div class="pp-r__doc"><div class="pp-r__foto pp-r__foto--img"><img src="assets/fotos/sospechoso-sin.jpg" alt="Foto del documento"></div>' +
              '<div class="pp-r__datos"><span class="pp-r__nombre">' + esc(P.persona) + '</span><span class="pp-r__num">' + esc(P.doc) + '</span></div></div>' +
            '<div class="pp-alerta__accion">' + accion + '</div>' +
          '</section>' +
          '<div class="pp-policia__detalle">' +
            '<p class="pp-principio"><nwt-icon value="info"></nwt-icon><span>Estas señales <strong>informan, no deciden</strong>. No hay un puntaje de peligrosidad: cada dato dice de dónde sale. Esta consulta queda en la auditoría.</span></p>' +
            '<section class="pp-seccion"><h3 class="pp-seccion__h"><nwt-icon value="file"></nwt-icon>Medidas correctivas</h3>' + P.medidas.map(function (m) {
              return '<div class="pp-medida"><nwt-badge nwt-size="large" nwt-theme="' + m.tema + '">' + m.estado + '</nwt-badge><div><p class="pp-medida__t">' + esc(m.titulo) + '</p><p class="pp-medida__s">' + esc(m.sub) + '</p></div></div>';
            }).join('') +
            '<p class="pp-medida__s">Reincidencia: 2 medidas en los últimos 3 años.</p></section>' +
            '<section class="pp-seccion"><h3 class="pp-seccion__h"><nwt-icon value="categories"></nwt-icon>Datos cruzados</h3><div class="pp-senales">' + P.senales.map(function (s) {
              if (s.decide) { return senalClub(s); }
              return '<div class="pp-senal' + (s.decide ? ' pp-senal--decide' : '') + '">' + tituloSenal(s.l) + '<p class="pp-senal__v">' + esc(s.v) + '</p><p class="pp-senal__por">' + esc(s.por) + '</p>' +
                (s.decide ? '<p class="pp-senal__marca">Único dato que decide un acceso: partidos sin hinchada visitante</p>' : '') + '</div>';
            }).join('') + '</div></section>' +
          '</div></div></div>' + modal() + toast() + '</div>';
    }

    /* ---------- Pintado y escala ---------- */

    var disp, ultimaClave = '';
    // Repintar rehace el DOM y reiniciaba láser, giros y entradas: se devuelven a su punto (DC-170).
    function claveVista() { return [st.disp, st.vista, st.caso && st.caso.color, st.caso && st.caso.doc, st.pvista, st.hoja, !!st.modal].join('|'); }
    function propias(a) { return a.animationName && a.effect && a.effect.target && !a.effect.target.closest('.pp-toast'); }
    function animacionesVivas() {
      var por = {};
      if (!disp || !disp.getAnimations) { return por; }
      disp.getAnimations({ subtree: true }).filter(propias).forEach(function (a) { (por[a.animationName] = por[a.animationName] || []).push(a.currentTime); });
      return por;
    }
    function retomarAnimaciones(previas, mismaVista) {
      if (!disp.getAnimations) { return; }
      disp.getAnimations({ subtree: true }).filter(propias).forEach(function (a) {
        var t = previas[a.animationName] && previas[a.animationName].shift();
        if (t != null) { a.currentTime = t; }
        else if (mismaVista && a.effect.getComputedTiming().iterations !== Infinity) { a.finish(); }
      });
    }
    // El toast se monta y se quita solo, sin repintar el equipo (DC-170).
    function pintarToast() {
      var app = disp.querySelector('.pp-app');
      if (!app) { pintarDispositivo(); return; }
      var viejo = app.querySelector(':scope > .pp-toast');
      if (viejo) { viejo.remove(); }
      app.insertAdjacentHTML('beforeend', toast());
    }
    // Repintar rehace el DOM y una transition no corre sobre nodos nuevos: se toma foto de las tarjetas y se anima con WAAPI (DC-374).
    function fotoAlertas() {
      var lista = disp && disp.querySelector('.pp-t__lista');
      if (!lista || !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) { return null; }
      var foto = {};
      lista.querySelectorAll('[data-alerta]').forEach(function (t) {
        var c = getComputedStyle(t), e = getComputedStyle(t.querySelector('.pp-t__estado'));
        foto[t.dataset.alerta] = { pos: t.offsetTop, estado: t.className, fondo: c.backgroundColor, borde: c.borderTopColor, tinta: c.color, chipFondo: e.backgroundColor, chipTinta: e.color };
      });
      return foto;
    }
    function animarAlertas(foto) {
      var lista = foto && disp.querySelector('.pp-t__lista');
      if (!lista || !lista.animate) { return; }
      var ms = parseFloat(getComputedStyle(disp).getPropertyValue('--naotech-duration-base')) || 260, op = { duration: ms, easing: 'ease' };
      lista.querySelectorAll('[data-alerta]').forEach(function (t) {
        var antes = foto[t.dataset.alerta];
        if (!antes) { t.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], op); return; }
        var dy = antes.pos - t.offsetTop;
        if (dy) { t.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], op); }
        if (antes.estado !== t.className) {
          var c = getComputedStyle(t), chip = t.querySelector('.pp-t__estado'), e = getComputedStyle(chip);
          t.animate([{ backgroundColor: antes.fondo, borderColor: antes.borde, color: antes.tinta }, { backgroundColor: c.backgroundColor, borderColor: c.borderTopColor, color: c.color }], op);
          chip.animate([{ backgroundColor: antes.chipFondo, color: antes.chipTinta }, { backgroundColor: e.backgroundColor, color: e.color }], op);
        }
      });
    }
    function pintarDispositivo() {
      var previas = animacionesVivas(), clave = claveVista(), fotoA = fotoAlertas();
      var pie = st.disp === 'consola' ? '<div class="pp-soporte" aria-hidden="true"><span class="pp-soporte__cuello"></span><span class="pp-soporte__base"></span></div>' : '';
      disp.innerHTML = '<div class="pp-equipo-envoltura"><div class="pp-equipo pp-equipo--' + st.disp + '"><div class="pp-pantalla">' +
        cromo() + (modo === 'policia' ? (st.pvista === 'eventos' ? appEventos() : st.pvista === 'tablero' ? appTablero() : appPolicia()) : appOperador()) + '</div></div>' + pie + '</div>';
      retomarAnimaciones(previas, clave === ultimaClave);
      animarAlertas(fotoA);
      ultimaClave = clave;
      escalar();
      sincronizarVivo();
      if (modo === 'policia' && st.pvista === 'eventos' && st.ebusca) { filtrarEventos(); }
      if (st.modal && st.modal.foco) { st.modal.foco = false; var dlg = disp.querySelector('.pp-modal'); if (dlg) { dlg.focus({ preventScroll: true }); } }
      if (st.disp === 'consola' && !st.hoja) { var i = disp.querySelector('#lector'); if (i) { i.focus({ preventScroll: true }); } }
    }
    // El equipo mide fijo; se encoge para caber y el zoom del escenario multiplica esa escala.
    var zoom = 1;
    function escalar() {
      SPLASH.ver(disp);
      var esc_ = raiz.querySelector('.pp-escena'), m = disp.firstElementChild;
      if (!esc_ || !m) { return; }
      // Con la capa abierta el equipo se achica y deja abajo el alto real de la franja, más aire, para no pisar el tag.
      var abierta = esc_.classList.contains('pp-escena--capa');
      var capaEl = esc_.querySelector('.pp-c');
      var FRANJA = capaEl ? capaEl.offsetHeight + 28 : 0;
      esc_.style.setProperty('--franja', FRANJA + 'px');
      var ancho = esc_.clientWidth - 48;
      var alto = esc_.clientHeight - 64 - 24 - (abierta ? FRANJA + 20 : 0);
      var k = Math.min(ancho / m.offsetWidth, alto / m.offsetHeight, 1);
      disp.style.transform = 'translate(-50%, 0) scale(' + (k * zoom).toFixed(3) + ')';
      // La línea de la capa arranca a 8 px del equipo (el carril sobresale 8 px hacia arriba) (DC-169).
      esc_.style.setProperty('--capa-top', Math.round(64 + m.offsetHeight * k * zoom + 16) + 'px');
    }

    /* ---------- Acciones ---------- */

    // `lectura`: solo las lecturas suman a los contadores y salen en la lista (DC-212).
    function registrar(color, texto, lectura) { st.historial.unshift({ color: color, texto: texto, hora: hora(st.reloj), lectura: !!lectura }); if (st.offline) { st.pendientes++; } }
    // Sin repintar: el láser y la validación en curso no se reinician.
    function alternarCamara(btn, clave, clase) {
      st[clave] = !st[clave];
      btn.setAttribute('aria-pressed', String(st[clave]));
      btn.closest('.pp-camara').classList.toggle(clase, st[clave]);
    }
    function aLectura() { cancelar(); st.vista = 'lectura'; st.caso = null; st.apoyo = false; st.acomp = false; st.policia = false; pintarDispositivo(); }
    // Timer propio: cancelar() corre en cada lectura y no debe dejar el toast pegado.
    var timerToast = null;
    // `cambio`: la acción ya movió estado que se ve en pantalla, así que va un solo repintado con el toast.
    function mostrarToast(t, m, cambio, tema) {
      st.toast = { t: t, m: m, tema: tema };
      if (cambio) { pintarDispositivo(); } else { pintarToast(); }
      clearTimeout(timerToast);
      timerToast = setTimeout(function () { st.toast = null; pintarToast(); }, 3200);
    }

    // Ningún resultado se cierra solo: el turno suma al tocar Continuar.
    function continuar() {
      var c = st.caso;
      st.turno.ingresos++;
      if (c.color === 'amarillo') { st.turno.avisos++; registrar('amarillo', c.riesgo ? 'Entró · aviso · orientado (riesgo)' : 'Entró · aviso · ' + c.causa, true); }
      else { registrar('verde', c.registro || 'Entró · ' + c.detalle.split(' · ')[0], true); }
      aLectura();
    }

    function leer(caso) {
      cancelar();
      st.hoja = null; st.reloj++; st.apoyo = false; st.acomp = false; st.policia = false; 
      st.caso = caso; st.vista = 'validando';
      SPLASH.flash();
      pintarDispositivo();
      var mostrar = function () {
        st.vista = 'resultado';
        if (caso.color === 'rojo') { st.turno.rojos++; registrar('rojo', caso.operativo ? 'No entró · ' + caso.causa : 'No entró · alerta al PMU', true); }
        pintarDispositivo();
      };
      // Cada validación pasa por la capa oculta: 6 pasos de 1 s en Slow motion.
      if (capa) { capa.correr(caso, { evento: E, offline: st.offline, reloj: st.reloj, alCambiar: escalar }, mostrar); } else { luego(mostrar, 450); }
    }

    function casoPorDocumento(num) {
      var base = CASOS.filter(function (c) { return c.id === (/4447$/.test(num) ? 'medida' : 'verde'); })[0];
      var c = JSON.parse(JSON.stringify(base));
      if (c.color === 'verde') { c.doc = st.tipo + ' ' + num; }
      return c;
    }

    function onClick(ev) {
      var t = ev.target;
      var el = t.closest('[data-caso],[data-acc],[data-tecla],[data-tipo],[data-cierre],[data-zoom]');
      if (!el) { return; }
      if (el.dataset.zoom) {
        var z = el.dataset.zoom;
        zoom = z === 'in' ? Math.min(2, zoom + 0.15) : z === 'out' ? Math.max(0.5, zoom - 0.15) : 1;
        escalar();
        return;
      }
      if (el.dataset.caso) {
        // Se ve 1 s el estado inicial (lectura) antes de validar, en Tiempo real y en Slow motion (DC-178).
        var elegido = CASOS.filter(function (c) { return c.id === el.dataset.caso; })[0];
        st.hoja = null; aLectura(); luego(function () { leer(elegido); }, 1000);
        return;
      }
      if (el.dataset.cierre) { st.cierre = el.dataset.cierre; pintarDispositivo(); return; }
      if (el.dataset.tipo) {
        // Sin repintar el equipo: la hoja no debe reanimarse al elegir el tipo.
        st.tipo = el.dataset.tipo;
        disp.querySelectorAll('[data-tipo]').forEach(function (t) { t.toggleAttribute('active', t.dataset.tipo === st.tipo); if ('active' in t) { t.active = t.dataset.tipo === st.tipo; } });
        return;
      }
      if (el.dataset.tecla) {
        var k = el.dataset.tecla;
        if (k === '⌫') { st.digitos = st.digitos.slice(0, -1); }
        else if (k === 'ok') {
          if (st.digitos.length >= 5) { var n = st.digitos; st.digitos = ''; leer(casoPorDocumento(n)); return; }
          // Con menos de 5 dígitos no se valida: se avisa en vez de no hacer nada (DC-053).
          var ayuda = disp.querySelector('#hoja-ayuda');
          if (ayuda) { ayuda.textContent = 'Faltan dígitos: el documento tiene al menos 5.'; ayuda.classList.add('pp-hoja__ayuda--error'); }
          return;
        }
        else if (st.digitos.length < 12) { st.digitos += k; }
        var pant = disp.querySelector('.pp-pantallita');
        if (pant) { pant.textContent = grupos(st.digitos); }
        return;
      }
      switch (el.dataset.acc) {
        case 'salir': ctx.salir(); break;
        case 'digitar': st.hoja = 'digitar'; st.digitos = ''; pintarDispositivo(); break;
        case 'turno': st.hoja = 'turno'; pintarDispositivo(); break;
        case 'cerrar-hoja': st.hoja = null; pintarDispositivo(); break;
        case 'cerrar-toast': st.toast = null; clearTimeout(timerToast); pintarToast(); break;
        case 'menu': st.hoja = 'menu'; pintarDispositivo(); break;
        case 'linterna': alternarCamara(el, 'luz', 'pp-camara--luz'); break;
        case 'zoom': alternarCamara(el, 'zoomCam', 'pp-camara--zoom'); break;
        case 'cerrar-rojo':
          var sig = st.caso; aLectura();
          mostrarToast(sig && sig.operativo ? 'Caso cerrado' : 'Remitido a la Policía', (sig && sig.causa ? sig.causa + ' · ' : '') + 'Lector listo para la siguiente persona'); break;
        case 'policia': st.policia = true; registrar('rojo', 'Policía avisada'); mostrarToast('Policía avisada', E.puerta + ' · ' + hora(st.reloj), true); break;
        case 'acompanar': st.acomp = true; mostrarToast('Acompañamiento solicitado', 'Supervisor avisado', true); break;
        case 'apoyo': st.apoyo = true; registrar('rojo', 'Alteración reportada'); mostrarToast('Apoyo solicitado', 'Policía y supervisor avisados · ' + E.puerta + ' · ' + hora(st.reloj), true); break;
        case 'cancelar-scan': registrar('amarillo', 'Escaneo cancelado'); aLectura(); break;
        case 'continuar': continuar(); break;
        case 'rostro-si':
          var ok = JSON.parse(JSON.stringify(st.caso)); ok.color = 'verde'; ok.verificado = true; ok.registro = 'Entró · identidad verificada';
          st.vista = 'resultado'; st.caso = ok; pintarDispositivo();
          break;
        case 'rostro-no':
          var no = JSON.parse(JSON.stringify(st.caso));
          no.color = 'rojo'; no.operativo = true; no.causa = 'Identidad no confirmada';
          no.detalle = st.bio ? 'La persona no coincide con la foto de referencia.' : 'La persona no coincide con la foto de la cédula.';
          st.caso = no; st.turno.rojos++; registrar('rojo', 'No entró · identidad no confirmada', true); pintarDispositivo();
          break;
        case 'nueva-alerta':
          st.min++;
          st.alertas.push({ id: 'n' + st.alertas.length, estado: 'nueva', puerta: 'Puerta 3 · Occidental', hora: ahora(), doc: 'CC •••• 3318', causa: 'Medida vigente', origen: 'Lectura en puerta',
            pasos: [{ hora: ahora(), texto: 'Generada en la puerta', quien: 'Op. P. Torres' }] });
          st.pvista = 'tablero'; st.filtro = 'todas'; programarTomaPrimero(); pintarDispositivo(); break;
        case 't-tablero': st.pvista = 'tablero'; programarTomaPrimero(); pintarDispositivo(); break;
        case 't-eventos': st.pvista = 'eventos'; pintarDispositivo(); break;
        // Primer caso de Policía: elegir el evento en vivo, filtrado, antes de ver la bandeja de alertas (DC-317).
        case 'elegir-evento': st.pvista = 'eventos'; st.efiltro = 'vivo'; pintarDispositivo(); break;
        case 'e-filtro': st.efiltro = el.dataset.id; pintarDispositivo(); break;
        case 'e-abrir':
          var ev = D.policia.eventos.filter(function (x) { return x.id === el.dataset.id; })[0];
          // Monitor PMU y Auditoría son apps separadas (DC-116): el evento pasado avisa, no salta a la otra app.
          if (ev.estado === 'pasado') { mostrarToast(ev.partido, 'Resumen del evento: ' + window.EVENTOS.datoTexto(ev.dato) + '. El detalle registro a registro está en la app de Auditoría.'); break; }
          if (ev.tablero) { st.pvista = 'tablero'; programarTomaPrimero(); pintarDispositivo(); break; }
          mostrarToast(ev.partido, ev.estado === 'vivo' ? 'En el demo, el tablero está armado para Nacional vs. Medellín.' : 'La preparación del evento (puertas, operadores, medidas cruzadas) llega en la próxima versión.');
          break;
        case 't-filtro': st.filtro = el.dataset.id; pintarDispositivo(); break;
        case 't-asignar': abrirModal(st.alertas.filter(function (x) { return x.id === el.dataset.id; })[0]); break;
        case 't-modal-cerrar': st.modal = null; pintarDispositivo(); break;
        case 't-modal-asignar':
          var am = st.alertas.filter(function (x) { return x.id === st.modal.id; })[0];
          var nom = agentesDe(am.puerta).filter(function (g) { return st.modal.sel.indexOf(g.id) >= 0; }).map(function (g) { return g.nombre; });
          if (am.estado !== 'nueva' || !nom.length) { break; }
          st.min++; am.asignados = nom; am.horaAsig = ahora();
          am.pasos.push({ hora: ahora(), texto: 'Asignada a ' + nom.join(', '), quien: 'Pt. R. Gómez (usted)' });
          st.modal = null; programarToma(am);
          mostrarToast('Agentes notificados', nom.join(', ') + ' · ' + am.puerta, true);
          break;
        case 'agente-primero':
          var an = st.alertas.filter(function (x) { return x.estado === 'nueva'; })[0];
          if (!an) { mostrarToast('Sin alertas nuevas', 'Todas ya tienen quien las atienda.'); break; }
          st.pvista = 'tablero'; tomaAgente(an, tomadorDe(an), true); break;
        case 't-perfil':
          // Abrir el perfil es una consulta a datos protegidos: en el producto queda en la auditoría.
          var ap = st.alertas.filter(function (x) { return x.id === el.dataset.id; })[0];
          st.abierta = ap.id; st.alerta = { nueva: 'nueva', atencion: 'tomada', cerrada: 'cerrada' }[ap.estado]; st.cierre = ap.resultado || null;
          st.pvista = 'perfil'; pintarDispositivo(); break;
        case 'cerrar-alerta':
          if (!st.cierre) { return; }
          var ac = abierta();
          if (ac) { st.min++; ac.estado = 'cerrada'; ac.resultado = st.cierre; ac.pasos.push({ hora: ahora(), texto: 'Cerrada · ' + st.cierre, quien: 'Pt. R. Gómez (usted)' }); }
          st.alerta = 'cerrada'; mostrarToast('Alerta cerrada', st.cierre + ' · registrada en la auditoría del PMU', true); break;
      }
    }

    // Consola: Enter avanza y P llama a la Policía, sin tocar la pantalla.
    function onTecla(ev) {
      if (st.modal) {
        if (ev.key === 'Escape') { st.modal = null; pintarDispositivo(); return; }
        // Foco atrapado dentro del modal mientras está abierto.
        if (ev.key === 'Tab') {
          var f = Array.prototype.slice.call(disp.querySelectorAll('.pp-modal button:not(:disabled), .pp-modal input:not(:disabled)')); if (!f.length) { return; }
          var ult = f[f.length - 1], pri = f[0];
          if (ev.shiftKey && (document.activeElement === pri || document.activeElement.classList.contains('pp-modal'))) { ev.preventDefault(); ult.focus(); }
          else if (!ev.shiftKey && document.activeElement === ult) { ev.preventDefault(); pri.focus(); }
        }
        return;
      }
      if (st.disp !== 'consola' || st.vista !== 'resultado' || st.hoja || ev.target.closest && ev.target.closest('button')) { return; }
      var b = ev.key === 'Enter' ? disp.querySelector('.pp-r__acciones .pp-r__btn:not(.pp-r__btn--sec)') : (ev.key === 'p' || ev.key === 'P') ? disp.querySelector('[data-acc=policia]') : null;
      if (b && !b.disabled && b.dataset.acc !== 'rostro-si') { ev.preventDefault(); b.click(); }
    }

    // Casillas del modal: se actualiza el estado y el botón sin repintar, para no perder el foco.
    function onChange(ev) {
      var id = ev.target.dataset && ev.target.dataset.agente;
      if (!id || !st.modal) { return; }
      var i = st.modal.sel.indexOf(id);
      if (ev.target.checked && i < 0) { st.modal.sel.push(id); } else if (!ev.target.checked && i >= 0) { st.modal.sel.splice(i, 1); }
      var b = disp.querySelector('[data-acc="t-modal-asignar"]');
      if (b) { var n = st.modal.sel.length; b.disabled = !n; b.textContent = b.textContent.replace(/ · \d+$/, '') + (n ? ' · ' + n : ''); }
    }

    function onSubmit(ev) {
      if (!ev.target.matches('[data-form="lector"]')) { return; }
      ev.preventDefault();
      var v = (disp.querySelector('#lector').value || '').replace(/\D/g, '');
      if (v.length >= 5) { leer(casoPorDocumento(v)); }
    }

    /* ---------- Montaje ---------- */

    raiz.innerHTML = '<div class="pp-demo">' + toolbar() + '<div class="pp-demo__cuerpo">' + guion() +
      '<main class="pp-escenario"><div class="pp-escena pp-escena--ctl"><div class="pp-controles">' + (modo === 'puerta' ? velocidadControl() : '') + zoomControles() + '</div><div class="pp-dispositivo" id="dispositivo"></div>' +
      (modo === 'puerta' ? window.CAPA.html() : '') + '</div></main></div></div>';
    SPLASH.app(modo === 'policia' ? 'Monitor PMU' : 'Acceso en puerta');
    disp = raiz.querySelector('#dispositivo');
    if (modo === 'puerta') { capa = window.CAPA.crear(raiz.querySelector('.pp-escena')); }

    var tabs = raiz.querySelector('#tabs-disp');
    if (tabs) {
      // El tablero de la Policía es para tablet y escritorio: sin celular.
      tabs.items = modo === 'policia'
        ? [{ id: 'tablet', label: 'Tablet', value: 'tablet' }, { id: 'consola', label: 'Escritorio', value: 'consola' }]
        : [{ id: 'celular', label: 'Celular', value: 'celular' }, { id: 'tablet', label: 'Tablet', value: 'tablet' }, { id: 'consola', label: 'PC', value: 'consola' }];
      tabs.value = st.disp;
      tabs.addEventListener('nwtChange', function (e) { st.disp = e.detail; st.hoja = null; pintarDispositivo(); });
    }
    // Cada switch avisa con un toast breve y mueve su punto sobre el equipo (DC-208).
    var swOff = raiz.querySelector('#sw-offline'), swBio = raiz.querySelector('#sw-bio'), swTorn = raiz.querySelector('#sw-torn');
    if (swOff) {
      swOff.addEventListener('nwtChange', function (e) {
        st.offline = e.detail; if (!st.offline) { st.pendientes = 0; }
        if (st.offline) { mostrarToast('Sin conexión', 'Valida con el paquete del evento.', true, 'warning'); }
        else { mostrarToast('Conexión restablecida', 'Se sincroniza lo pendiente.', true); }
      });
    }
    if (swBio) {
      swBio.addEventListener('nwtChange', function (e) {
        st.bio = e.detail;
        var repinta = st.vista === 'resultado';
        if (!repinta) { estadoEquipos(); }
        if (st.bio) { mostrarToast('Módulo biométrico encendido', 'Compara el rostro con la foto de referencia.', repinta); }
        else { mostrarToast('Módulo biométrico apagado', 'Basta el documento; no se compara el rostro.', repinta, 'warning'); }
      });
    }
    if (swTorn) {
      swTorn.addEventListener('nwtChange', function (e) {
        st.torn = e.detail; estadoEquipos();
        if (st.torn) { mostrarToast('Torniquete encendido', 'Se abre solo con el verde.', false); }
        else { mostrarToast('Torniquete apagado', 'El paso se da a mano.', false, 'warning'); }
      });
    }
    var velCtrl = raiz.querySelector('#velocidad-ctrl');
    if (velCtrl) {
      velCtrl.addEventListener('click', function (e) {
        var b = e.target.closest('[data-vel]');
        if (!b) { return; }
        velCtrl.querySelectorAll('[data-vel]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        window.CAPA.setVelocidad(b.dataset.vel);
      });
    }

    raiz.addEventListener('click', onClick);
    raiz.addEventListener('input', onInput);
    raiz.addEventListener('change', onChange);
    raiz.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onTecla);
    window.addEventListener('resize', escalar);
    pintarDispositivo();
    requestAnimationFrame(escalar);

    return function () {
      cancelar();
      clearTimeout(timerToast);
      clearInterval(timerVivo);
      clearInterval(timerCuenta);
      raiz.removeEventListener('click', onClick);
      raiz.removeEventListener('input', onInput);
      raiz.removeEventListener('change', onChange);
      raiz.removeEventListener('submit', onSubmit);
      document.removeEventListener('keydown', onTecla);
      window.removeEventListener('resize', escalar);
    };
  }

  window.PANTALLAS.puerta = function (raiz, ctx) { return montar(raiz, ctx, 'puerta'); };
  window.PANTALLAS.policia = function (raiz, ctx) { return montar(raiz, ctx, 'policia'); };
})();
