/* Lista de eventos por fecha, compartida por la vista policial (apps/puerta.js) y la auditoría (apps/auditoria.js). */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function svg(d, t) { return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none">' + d + '</svg>'; }
  var PIN = '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>';
  var IR = '<path d="M7 17L17 7M9 7h8v8"/>';
  var LUPA = '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>';
  var EST = { vivo: 'En vivo', proximo: 'Próximo', pasado: 'Finalizado' };
  var MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  // Las alertas del en vivo por estado: lo que la Policía necesita ver antes de abrir el tablero.
  function estados(n) {
    if (!n) { return ''; }
    var pill = function (k, v, texto) { return '<span class="pp-e__al pp-e__al--' + k + (v ? '' : ' pp-e__al--cero') + '">' + v + ' ' + texto + '</span>'; };
    return '<div class="pp-e__estados" aria-label="Alertas del evento"><span class="pp-e__al-l">Alertas</span>' +
      pill('nueva', n.nueva, n.nueva === 1 ? 'nueva' : 'nuevas') + pill('atencion', n.atencion, 'en atención') + pill('cerrada', n.cerrada, n.cerrada === 1 ? 'cerrada' : 'cerradas') + '</div>';
  }

  // Dos cifras con la principal en negrita (DC-204); el «de» solo lo lee el lector de pantalla.
  function datoHtml(d) {
    return '<b class="pp-e__dato-n">' + esc(d.principal) + '</b><span aria-hidden="true"> / </span><span class="pp-e__sr"> de </span>' + esc(d.total) + ' ' + esc(d.etiqueta) + (d.resto ? ' · ' + esc(d.resto) : '');
  }
  function datoTexto(d) { return d.principal + ' de ' + d.total + ' ' + d.etiqueta + (d.resto ? ' · ' + d.resto : ''); }

  function tarjeta(e, o) {
    var f = e.fecha.split('-'), accion = o.accion(e);
    var nota = o.nota ? o.nota(e) : esc(e.nota);
    return '<article class="pp-e__card pp-e__card--' + e.estado + '" data-busca="' + esc((e.partido + ' ' + e.escenario + ' ' + e.ciudad).toLowerCase()) + '">' +
      '<div class="pp-e__foto">' + (e.foto ? '<img src="assets/estadios/' + e.foto + '.jpg" alt="' + esc(e.escenario) + '" loading="lazy">' : '') +
        '<span class="pp-e__chip"><span class="pp-e__punto"></span>' + EST[e.estado] + '</span>' +
        '<button type="button" class="pp-e__ir" data-acc="' + o.acc + '" data-id="' + e.id + '" aria-label="' + esc(accion) + ': ' + esc(e.partido) + '" title="' + esc(accion) + '">' + svg(IR, 20) + '</button></div>' +
      '<div class="pp-e__cuerpo">' +
        '<div class="pp-e__cal" aria-hidden="true"><span class="pp-e__mes">' + MESES[+f[1] - 1] + '</span><span class="pp-e__dia">' + (+f[2]) + '</span><span class="pp-e__hora">' + e.hora + '</span></div>' +
        '<div class="pp-e__info">' +
          '<div class="pp-e__fila"><p class="pp-e__nota">' + nota + '</p><p class="pp-e__dato">' + datoHtml(e.dato) + '</p></div>' +
          '<h3 class="pp-e__titulo">' + esc(e.partido) + '</h3>' +
          '<p class="pp-e__comp">' + esc(e.competicion) + '</p>' +
          '<p class="pp-e__lugar">' + svg(PIN, 16) + esc(e.escenario) + ' · ' + esc(e.ciudad) + '</p>' +
        '</div></div>' +
      (e.estado === 'vivo' && o.estados ? '<div class="pp-e__pie">' + estados(o.estados(e)) + '</div>' : '') +
    '</article>';
  }

  // o: { eventos, filtro, busca, titulo, sub, acc, accFiltro, accion(e), nota(e)?, estados(e)? }
  function lista(o) {
    var EV = o.eventos;
    var n = function (s) { return EV.filter(function (e) { return e.estado === s; }).length; };
    // Hoy primero (con alertas arriba), luego lo que viene en orden y al final lo pasado, del más reciente al más viejo.
    var peso = { vivo: 0, proximo: 1, pasado: 2 };
    var items = EV.filter(function (e) { return o.filtro === 'todos' || e.estado === o.filtro; }).slice().sort(function (a, b) {
      return peso[a.estado] - peso[b.estado] || (a.estado === 'pasado' ? b.fecha.localeCompare(a.fecha) : a.fecha.localeCompare(b.fecha)) ||
        (b.alertas || 0) - (a.alertas || 0) || a.hora.localeCompare(b.hora);
    });
    var grupos = [];
    items.forEach(function (e) { var g = grupos[grupos.length - 1]; if (!g || g.dia !== e.dia || g.estado !== e.estado) { grupos.push({ dia: e.dia, estado: e.estado, items: [e] }); } else { g.items.push(e); } });
    var filtros = [['todos', 'Todos', EV.length], ['vivo', 'En vivo', n('vivo')], ['proximo', 'Próximos', n('proximo')], ['pasado', 'Pasados', n('pasado')]].map(function (x) {
      return '<button type="button" role="tab" class="pp-t__filtro" aria-selected="' + (o.filtro === x[0]) + '" data-acc="' + o.accFiltro + '" data-id="' + x[0] + '">' + x[1] + ' · ' + x[2] + '</button>';
    }).join('');
    return '<div class="pp-e">' +
      '<div class="pp-e__cab"><h1 class="pp-e__h1">' + esc(o.titulo) + '</h1><p class="pp-e__sub">' + esc(o.sub) + '</p></div>' +
      '<div class="pp-e__barra"><div class="pp-t__filtros pp-e__filtros" role="tablist" aria-label="Filtrar por estado">' + filtros + '</div>' +
        '<label class="pp-e__buscar">' + svg(LUPA, 18) + '<span class="pp-e__sr">Buscar</span><input class="pp-e__busca" type="search" placeholder="Buscar estadio, ciudad o equipo" value="' + esc(o.busca) + '"></label></div>' +
      grupos.map(function (g) {
        return '<section class="pp-e__grupo pp-e__grupo--' + g.estado + '" aria-label="' + esc(g.dia) + '"><h2 class="pp-e__fecha">' + esc(g.dia) + '<span>' + g.items.length + '</span></h2>' +
          '<div class="pp-e__grid">' + g.items.map(function (e) { return tarjeta(e, o); }).join('') + '</div></section>';
      }).join('') +
      '<p class="pp-e__vacio" hidden>Ningún evento coincide con la búsqueda.</p>' +
    '</div>';
  }

  // Filtra en el DOM sin repintar, para no perder el foco del campo de búsqueda.
  function filtrar(raiz, q) {
    q = (q || '').trim().toLowerCase();
    var visibles = 0;
    raiz.querySelectorAll('.pp-e__grupo').forEach(function (g) {
      var hay = 0;
      g.querySelectorAll('.pp-e__card').forEach(function (c) { var ok = !q || c.dataset.busca.indexOf(q) >= 0; c.hidden = !ok; hay += ok ? 1 : 0; });
      g.hidden = !hay; visibles += hay;
    });
    var v = raiz.querySelector('.pp-e__vacio'); if (v) { v.hidden = visibles > 0; }
  }

  // Los dos equipos con su escudo, la misma pieza en el tablero, el perfil de la alerta y la auditoría. Solo hay escudos de Nacional y Medellín.
  var ESCUDOS = ['nacional', 'medellin'];
  function equipos(partido, o) {
    o = o || {};
    var t = o.tag || 'p', partes = partido.split(/\s+vs\.?\s+/);
    var uno = function (nom) {
      var f = nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return '<span class="pp-equipo-nom">' + (ESCUDOS.indexOf(f) >= 0 ? '<img class="pp-escudo" src="assets/escudos/' + f + '.png" alt="Escudo">' : '') + esc(nom) + '</span>';
    };
    return '<' + t + ' class="pp-alerta__equipos' + (o.clase ? ' ' + o.clase : '') + '">' + uno(partes[0]) + '<span class="pp-vs">vs</span>' + uno(partes[1]) + (o.extra || '') + '</' + t + '>';
  }

  window.EVENTOS = { datoTexto: datoTexto, lista: lista, filtrar: filtrar, equipos: equipos };
})();
