/* Capa oculta: la validación en 6 pasos (2 consultas externas y 4 del SVN), en una franja debajo del equipo. */
window.CAPA = (function () {
  var LENTITUD = 8;
  var velocidad = 'normal';
  var TIEMPO_REAL = 1800;
  var ESPERA_SALIDA = 2000;
  // Milisegundos simulados por paso; suman 1800 para que la consulta en tiempo real dure 1,8 s.
  var DURACION = [240, 360, 240, 300, 360, 300];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function segundos(ms) { return (ms / 1000).toFixed(2).replace('.', ',') + ' s'; }

  // Por paso: qué baja del equipo, qué sube como respuesta, y si esa respuesta pasó.
  function pasos(caso, o) {
    var off = o.offline, id = caso.id;
    var solo = id === 'solocc';
    var boleta = solo ? ['Asignada al documento ✓', 'ok'] : { otro: ['Otro partido ✕', 'falla'], sin: ['Sin boleta ✕', 'falla'], usada: ['Ya usada ✕', 'falla'] }[id] || ['Del partido ✓', 'ok'];
    var lista = [
      { n: 'Lectura', texto: solo ? 'Cédula leída · sin boleta presentada' : off ? 'Cédula leída · se valida en el equipo' : 'Cédula leída · consulta cifrada al SVN', baja: 'Cédula', sube: off ? 'Paquete local' : caso.doc, r: 'ok' },
      { n: 'Registraduría', logo: 'ANI', texto: off ? 'Verificada antes del evento' : 'Documento vigente · nombre coincide', baja: caso.doc, sube: 'Vigente ✓', r: 'ok' },
      { n: 'Boleta', texto: solo ? 'Boleta asignada a este documento · sin usar' : boleta[1] === 'ok' ? 'Boleta del partido y la puerta · sin usar' : boleta[0].replace(' ✕', ''), baja: solo ? 'Documento · Partido' : 'Partido · Puerta', sube: boleta[0], r: boleta[1] },
      { n: 'Policía', logo: 'POL', texto: off ? 'Medidas al corte del paquete del evento' : 'Sin actos de la autoridad de policía pendientes', baja: 'Documento', sube: 'Sin pendientes ✓', r: 'ok' },
      { n: 'Medidas', logo: 'SVN', texto: id === 'medida' ? 'Medida correctiva vigente: con medida' : id === 'veto' ? 'Medida levantada el 25 sep · Res. 0198' : 'Medida correctiva vigente: sin medida', baja: 'Documento', sube: id === 'medida' ? 'Medida vigente ✕' : id === 'veto' ? 'Levantada hace 3 días' : 'Sin medida ✓', r: id === 'medida' ? 'falla' : id === 'veto' ? 'aviso' : 'ok' },
      { n: 'Decisión', logo: 'SVN', texto: id === 'rostro' ? 'Confianza baja: pedir verificación' : id === 'cruce' ? 'Va con 2 personas que han tenido medidas · queda registrado' : id === 'riesgo' ? 'Posible riesgo en este partido · queda registrado' : id === 'veto' ? 'Queda registrado · aviso al supervisor' : 'Confianza alta · queda registrado', baja: 'Historial · Resultado', sube: null, r: 'final' }
    ];
    var falla_en = lista.map(function (x) { return x.r; }).indexOf('falla');
    return { pasos: lista, falla_en: falla_en };
  }

  var FINAL = {
    verde: { clase: 'verde', texto: 'Verde · Entra', dato: 'Verde' },
    amarillo: { clase: 'amarillo', texto: 'Amarillo · Entra con aviso', dato: 'Amarillo' },
    rojo: { clase: 'rojo', texto: 'Rojo · No entra', dato: 'Rojo' },
    rostro: { clase: 'rostro', texto: 'Verificar identidad', dato: 'Verificar' }
  };

  var ICONO_PAUSA = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="3" x2="5" y2="13"/><line x1="11" y1="3" x2="11" y2="13"/></svg>';
  var ICONO_PLAY = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.2v9.6c0 .5.5.8.9.5l7.2-4.8c.4-.3.4-.8 0-1L5.9 2.7c-.4-.3-.9 0-.9.5z"/></svg>';

  function html() {
    return '<section class="pp-c" id="capa" aria-label="Capa oculta de la validación" aria-live="polite">' +
      '<div class="pp-c__carril" id="capa-carril" aria-hidden="true"></div>' +
      '<div class="pp-c__pasos">' + DURACION.map(function (d, i) {
        return '<span class="pp-c__punto"></span>' + (i < DURACION.length - 1 ? '<span class="pp-c__linea"></span>' : '');
      }).join('') + '</div>' +
      '<p class="pp-c__label" id="capa-label"></p>' +
      '<div class="pp-c__reloj"><span class="pp-c__cifra" id="capa-cifra">0,00 s</span>' +
        '<button type="button" class="pp-c__play" id="capa-play" aria-label="Pausar"></button></div>' +
    '</section>';
  }

  // Franja de una consulta de la compra: pasos variables; consulta y resultado van en texto oculto (DC-229). La puerta usa html().
  function htmlDef() {
    return '<section class="pp-c pc-c" id="capa" aria-label="Consulta a la base de datos" aria-live="polite">' +
      '<div class="pp-c__carril" id="capa-carril" aria-hidden="true"></div>' +
      '<div class="pp-c__pasos" id="capa-pasos"></div>' +
      '<p class="pp-c__label" id="capa-label"></p>' +
      '<span class="pc-sr" id="capa-estado"></span>' +
      '<div class="pp-c__reloj"><span class="pp-c__cifra" id="capa-cifra">0,00 s</span>' +
        '<button type="button" class="pp-c__play" id="capa-play" aria-label="Pausar"></button></div>' +
    '</section>';
  }

  // Monta el control dentro de `escena`; la clase en `escena` abre la franja y achica el equipo.
  function crear(escena) {
    var el = {
      carril: escena.querySelector('#capa-carril'), cifra: escena.querySelector('#capa-cifra'), play: escena.querySelector('#capa-play'),
      puntos: escena.querySelectorAll('.pp-c__punto'), lineas: escena.querySelectorAll('.pp-c__linea'),
      label: escena.querySelector('#capa-label')
    };
    var raf = null, timers = [], corriendo = false, sim = 0, ultimo = 0;
    var lista = null, fin = null, final = null, actual = -1, alCambiar = null, dur = DURACION, total = 1000, escala = LENTITUD;

    function limpiar() { if (raf) { cancelAnimationFrame(raf); raf = null; } timers.forEach(clearTimeout); timers = []; }
    function ocultar() { escena.classList.remove('pp-escena--capa'); if (alCambiar) { alCambiar(); } }
    function detener() { limpiar(); corriendo = false; ocultar(); }
    function pintarPlay() { el.play.innerHTML = corriendo ? ICONO_PAUSA : ICONO_PLAY; el.play.setAttribute('aria-label', corriendo ? 'Pausar' : 'Reanudar'); }

    // Velocidad constante: baja 450ms, pausa 100ms, sube 450ms. Escalados según velocidad.
    function viajar(p, i) {
      var f = escala / LENTITUD, BAJA_DUR = 450 * f, PAUSA_DUR = 100 * f, SUPE_DUR = 450 * f;
      el.carril.className = 'pp-c__carril pp-c__carril--baja';
      var html = '';
      if (p.baja) { html += '<span class="pp-c__dato pp-c__dato--baja" style="animation-duration:' + BAJA_DUR + 'ms">' + esc(p.baja) + '</span>'; }
      var sube = p.r === 'final' ? final.dato : p.sube;
      var clase = p.r === 'final' ? final.clase : p.r;
      html += '<span class="pp-c__dato pp-c__dato--sube pp-c__dato--' + clase + '" style="animation-duration:' + SUPE_DUR + 'ms;animation-delay:' + (p.baja ? BAJA_DUR + PAUSA_DUR : 0) + 'ms">' + esc(sube) + '</span>';
      el.carril.innerHTML = html;
      timers.push(setTimeout(function () { el.carril.className = 'pp-c__carril pp-c__carril--sube'; }, BAJA_DUR));
    }

    function pintarPaso(i, terminado) {
      el.puntos.forEach(function (d, k) {
        d.className = 'pp-c__punto' + (terminado ? ' pp-c__punto--' + final.clase : k < i ? ' pp-c__punto--hecho' : k === i ? ' pp-c__punto--activo' : '');
      });
      el.lineas.forEach(function (l, k) {
        l.className = 'pp-c__linea' + (terminado ? ' pp-c__linea--' + final.clase : k < i ? ' pp-c__linea--hecha' : '');
      });
      var p = lista[i];
      el.label.innerHTML = (p.logo ? '<span class="pp-c__logo">' + p.logo + '</span>' : '') + '<span><b>' + esc(p.n) + '</b> · ' + esc(p.texto) + '</span>';
      // Ya definido el resultado no queda nada en el carril: ni tag ni datos viajando por detrás.
      if (terminado) { el.carril.innerHTML = ''; }
      if (!terminado) { viajar(p, i); }
    }

    function terminar(idx) {
      raf = null; corriendo = false; pintarPlay();
      el.cifra.textContent = segundos(total);
      pintarPaso(idx == null ? dur.length - 1 : idx, true);
      if (fin) { fin(); }
      timers.push(setTimeout(ocultar, ESPERA_SALIDA));
    }

    function correr(caso, opciones, alTerminar) {
      limpiar();
      var resultado = pasos(caso, opciones);
      lista = resultado.pasos;
      var falla_en = resultado.falla_en;
      final = FINAL[caso.color] || FINAL.verde;
      escala = velocidad === 'normal' ? 1 : LENTITUD;
      dur = lista.map(function (p, i) { return falla_en >= 0 && i > falla_en ? 0 : DURACION[i]; });
      total = dur.reduce(function (a, b) { return a + b; }, 0);
      fin = alTerminar; alCambiar = opciones.alCambiar;
      sim = 0; actual = -1; corriendo = true; pintarPlay();
      el.carril.innerHTML = '';
      // En tiempo real la franja no sale y el equipo conserva su tamaño; la validación corre igual.
      escena.classList.toggle('pp-escena--capa', velocidad !== 'normal');
      if (alCambiar) { alCambiar(); }
      ultimo = performance.now();
      // Slow motion: 1 s por paso. Tiempo real: la consulta dura 1,8 s aunque corte en una falla temprana.
      var corren = falla_en >= 0 ? falla_en + 1 : dur.length;
      var PASO_REAL = velocidad === 'normal' ? TIEMPO_REAL / corren : 1000, pasoMs = 0;
      raf = requestAnimationFrame(function cuadroConFalla(ahora) {
        if (corriendo) { pasoMs += Math.max(0, ahora - ultimo); } // el primer cuadro puede venir antes que performance.now()
        ultimo = ahora;
        var i = Math.floor(pasoMs / PASO_REAL);
        // Una falla corta el recorrido en ese paso: no se espera a los que ya no importan.
        if (i >= (falla_en >= 0 ? falla_en + 1 : dur.length)) { terminar(falla_en >= 0 ? falla_en : dur.length - 1); return; }
        if (i !== actual) { actual = i; pintarPaso(i, false); }
        var fracPaso = (pasoMs % PASO_REAL) / PASO_REAL;
        sim = dur.reduce(function (a, b, idx) { return idx < actual ? a + b : a; }, 0) + fracPaso * dur[actual];
        el.cifra.textContent = segundos(sim);
        raf = requestAnimationFrame(cuadroConFalla);
      });
    }

    // Una consulta de la compra: {consulta, tag, pasos:[{n, logo, texto, baja, sube, r, ms}]}. No toca correr() ni la velocidad global.
    function correrDef(def, opciones, alTerminar) {
      limpiar();
      var vel = opciones.velocidad || velocidad, lento = vel !== 'normal';
      var n = def.pasos.length, idxFalla = -1;
      def.pasos.forEach(function (p, i) { if (idxFalla < 0 && p.r === 'falla') { idxFalla = i; } });
      var fallo = idxFalla >= 0, corte = fallo ? idxFalla : n - 1, corren = corte + 1;
      var cont = escena.querySelector('#capa-pasos'), estado = escena.querySelector('#capa-estado');
      cont.innerHTML = def.pasos.map(function (p, i) { return '<span class="pp-c__punto"></span>' + (i < n - 1 ? '<span class="pp-c__linea"></span>' : ''); }).join('');
      var puntos = cont.querySelectorAll('.pp-c__punto'), lineas = cont.querySelectorAll('.pp-c__linea');
      estado.textContent = def.consulta + ' · Consultando DB…';
      escala = lento ? LENTITUD : 1;
      alCambiar = opciones.alCambiar;
      var total = 0, acum = def.pasos.map(function (p) { var a = total; total += p.ms || 0; return a; });
      var totalCorte = acum[corte] + (def.pasos[corte].ms || 0);
      var actualDef = -1, pasoMs = 0, PASO = lento ? 1000 : TIEMPO_REAL / corren;

      function pintarDef(i, terminado) {
        puntos.forEach(function (d, k) {
          d.className = 'pp-c__punto' + (terminado ? (k <= corte ? (fallo ? ' pp-c__punto--rojo' : ' pp-c__punto--verde') : ' pc-c__punto--omitido') : k < i ? ' pp-c__punto--hecho' : k === i ? ' pp-c__punto--activo' : '');
        });
        lineas.forEach(function (l, k) {
          l.className = 'pp-c__linea' + (terminado ? (k < corte ? (fallo ? ' pp-c__linea--rojo' : ' pp-c__linea--verde') : ' pc-c__linea--omitida') : k < i ? ' pp-c__linea--hecha' : '');
        });
        var p = def.pasos[i];
        el.label.innerHTML = (p.logo ? '<span class="pp-c__logo">' + esc(p.logo) + '</span>' : '') + '<span><b>' + esc(p.n) + '</b> · ' + esc(p.texto) + '</span>';
        if (terminado) { el.carril.innerHTML = ''; } else { viajar(p, i); }
      }

      corriendo = true; pintarPlay();
      el.carril.innerHTML = ''; el.cifra.textContent = segundos(0);
      escena.classList.toggle('pp-escena--capa', lento);
      if (alCambiar) { alCambiar(); }
      ultimo = performance.now();
      raf = requestAnimationFrame(function cuadro(ahora) {
        if (corriendo) { pasoMs += Math.max(0, ahora - ultimo); } // el primer cuadro puede venir antes que performance.now()
        ultimo = ahora;
        var i = Math.floor(pasoMs / PASO);
        if (i >= corren) {
          raf = null; corriendo = false; pintarPlay();
          el.cifra.textContent = segundos(totalCorte);
          pintarDef(fallo ? corte : n - 1, true);
          estado.textContent = def.consulta + ' · ' + def.tag;
          if (alTerminar) { alTerminar({ ok: !fallo, corte: idxFalla, codigo: def.codigo || null }); }
          if (!opciones.mantener) { timers.push(setTimeout(ocultar, ESPERA_SALIDA)); }
          return;
        }
        if (i !== actualDef) { actualDef = i; pintarDef(i, false); }
        el.cifra.textContent = segundos(acum[i] + ((pasoMs % PASO) / PASO) * (def.pasos[i].ms || 0));
        raf = requestAnimationFrame(cuadro);
      });
    }

    // Pausar también congela el dato que está viajando.
    el.play.addEventListener('click', function () {
      if (!raf) { return; }
      corriendo = !corriendo; pintarPlay();
      el.carril.classList.toggle('pp-c__carril--pausa', !corriendo);
    });
    return { correr: correr, correrDef: correrDef, detener: detener };
  }

  return { html: html, htmlDef: htmlDef, crear: crear, setVelocidad: function(v) { velocidad = v; } };
})();
