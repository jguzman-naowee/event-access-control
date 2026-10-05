/* Backoffice de eventos, vistas del evento: Configuración, Cupos y Listo para abrir.
   Se registran en window.BACKOFFICE (lo crea apps/backoffice.js; si este archivo carga antes, se crea aquí). */
(function () {
  var B = window.BACKOFFICE = window.BACKOFFICE || { vistas: {} };
  if (!B.vistas) { B.vistas = {}; }
  if (!B.registrar) { B.registrar = function (id, def) { B.vistas[id] = def; }; }

  // ---------- Datos semilla (el escenario y el evento de la maqueta) ----------
  var EVENTO = { partido: 'Nacional vs. Medellín', hora: '19:00', inicio: '2026-09-28T19:00', dia: 'hoy 28 sep 2026', aforo: 38000 };
  var SEC = [
    { id: 'norte', nombre: 'Norte', tipo: 'Aforo libre', base: 8500 },
    { id: 'occ', nombre: 'Occidental', tipo: 'Numerado', base: 9200 },
    { id: 'ori', nombre: 'Oriental', tipo: 'Numerado', base: 11800 },
    { id: 'sur', nombre: 'Sur', tipo: 'Aforo libre', base: 8500 }
  ];
  var PUERTAS = [[1, 'norte'], [2, 'norte'], [3, 'occ'], [4, 'ori'], [5, 'ori'], [6, 'sur'], [7, 'sur'], [8, 'occ']];
  var MOTIVOS = ['Prensa', 'Seguridad', 'Dañada', 'Reservada'];
  var DISPOSITIVOS = [{ id: 'DSP-0901', nombre: 'Celular de operador' }, { id: 'DSP-0902', nombre: 'Tableta de reserva' }];
  var ESTADOS = [['habilitado', 'Habilitado'], ['visitante', 'Visitante'], ['cerrado', 'Cerrado'], ['reducido', 'Reducido']];
  var COMERC = [['a', 'Comercializadora A'], ['b', 'Comercializadora B']];

  // ---------- Utilidades ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return (n < 0 ? '−' : '') + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function svg(d, t, w) { return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="pbe-ico">' + d + '</svg>'; }
  var I = {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alerta: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    ok: '<path d="M5 12l5 5L20 7"/>',
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    escudo: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    escudoX: '<path d="M12 3l7 3v6c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z"/><path d="M12 9v4M12 16h.01"/>',
    puerta: '<path d="M3 21h18M5 21V4a1 1 0 0 1 1-1h8v18M14 5h4v16"/><path d="M11 12h.01"/>'
  };
  function cuenta(txt) {
    return String(txt || '').split(',').reduce(function (a, p) {
      var r = p.split('-').map(function (x) { return parseInt(x, 10); });
      if (r.length === 2 && !isNaN(r[0]) && !isNaN(r[1])) { return a + Math.max(0, r[1] - r[0] + 1); }
      return a + (isNaN(r[0]) ? 0 : 1);
    }, 0);
  }
  function hhmm(iso) { return (iso || '').split('T')[1] || ''; }
  function nombreSec(id) { return SEC.filter(function (s) { return s.id === id; })[0]; }
  function secDe(n) { return PUERTAS.filter(function (p) { return p[0] === n; })[0][1]; }
  function fechaCorta(iso) {
    if (!iso) { return ''; }
    var d = iso.slice(0, 10), h = hhmm(iso), M = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    if (d === '2026-09-28') { return 'hoy a las ' + h; }
    var p = d.split('-');
    return 'el ' + (+p[2]) + ' ' + M[+p[1] - 1] + ' a las ' + h;
  }
  function ahora() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function el(e) { return e && e.closest ? e.closest('[data-acc]') : e; }

  // Un cambio de hora o fecha se guarda en silencio y se repinta al salir del campo, sin perder un clic en curso.
  var abajo = false;
  if (!window.__pbeGancho) {
    window.__pbeGancho = true;
    document.addEventListener('pointerdown', function () { abajo = true; }, true);
    document.addEventListener('pointerup', function () { setTimeout(function () { abajo = false; }, 400); }, true);
  }
  function diferir(ctx) {
    var ir = function () { document.removeEventListener('click', ir); setTimeout(function () { ctx.repintar(); }, 0); };
    if (!abajo) { setTimeout(function () { ctx.repintar(); }, 0); return; }
    document.addEventListener('click', ir);
    setTimeout(ir, 700);
  }
  function escuchar(ctx) {
    var r = ctx.raiz; if (!r || r.__pbe) { return; }
    r.__pbe = true;
    r.addEventListener('focusout', function (e) {
      var a = e.target; if (a && a.dataset && a.dataset.silencio && ctx.st.__pend) { ctx.st.__pend = false; diferir(ctx); }
    });
  }

  // ---------- Estado compartido (st.cfg) ----------
  function cfg(st) {
    if (!st.cfg) {
      var h = {}, ab = {}, pa = {}, di = {}, pk = {};
      PUERTAS.forEach(function (p) { ab[p[0]] = true; h[p[0]] = [(p[0] === 6 || p[0] === 7) ? '16:30' : '16:00', '21:30']; pa[p[0]] = p[0] === 8 ? '' : 'p1'; });
      di = { 1: 'DSP-0101 y 1 más', 2: 'DSP-0201', 3: 'DSP-0301', 4: 'DSP-0401 y 1 más', 5: 'DSP-0501', 6: 'DSP-0601', 7: 'DSP-0701', 8: null };
      pk = { 1: '15:38', 2: '15:38', 3: '15:39', 4: '15:39', 5: 'parcial', 6: '15:41', 7: '15:42', 8: null };
      st.cfg = {
        tab: 'sectores', plazo: '2026-09-28T18:00', guardado: '15:58', sucio: false,
        sec: { norte: 'habilitado', occ: 'habilitado', ori: 'reducido', sur: 'visitante' },
        red: { norte: 8500, occ: 9200, ori: 10600, sur: 8500 },
        abierta: ab, horario: h, partido: pa, disp: di, paquete: pk, conexion: { 7: false },
        sillas: [
          { id: 's1', sector: 'Occidental', fila: 'A', sillas: '1-24', motivo: 'Prensa' },
          { id: 's2', sector: 'Occidental', fila: 'B', sillas: '1-6', motivo: 'Seguridad' },
          { id: 's3', sector: 'Oriental', fila: 'C', sillas: '40-46', motivo: 'Reservada' },
          { id: 's4', sector: 'Oriental', fila: 'K', sillas: '112', motivo: 'Dañada' }
        ],
        nueva: { sector: 'Occidental', fila: '', sillas: '', motivo: 'Prensa' }
      };
      // Una sola fuente: sinVis vive en los partidos del evento (Evento y partidos); solo aplica a los deportivos.
      var evAct = function () { return st.eventos.filter(function (e) { return e.id === st.evento; })[0] || st.eventos[0]; };
      Object.defineProperty(st.cfg, 'dep', { get: function () { return (evAct().tipo || 'deportivo') === 'deportivo'; } });
      Object.defineProperty(st.cfg, 'sinVis', {
        get: function () { return this.dep && evAct().partidos.some(function (p) { return p.sinVis; }); },
        set: function (v) { evAct().partidos.forEach(function (p) { p.sinVis = !!v; }); }
      });
    }
    return st.cfg;
  }
  function cupos(st) {
    if (!st.cupos) { st.cupos = { a: [5000, 6000, 7000, 0], b: [3000, 3000, 3500, 8500], guardado: null }; }
    return st.cupos;
  }
  function listo(st) {
    if (!st.listo) { st.listo = { sel: {}, vistos: {}, reloj: 16 * 60 + 10, abierto: false, abiertoA: '' }; }
    return st.listo;
  }

  // ---------- Derivados del estado ----------
  function eff(c, id) { return (c.sinVis && c.sec[id] === 'visitante') ? 'cerrado' : c.sec[id]; }
  function aforoDe(c, s) { var e = eff(c, s.id); if (e === 'cerrado') { return 0; } if (e === 'reducido') { return Math.min(Number(c.red[s.id]) || 0, s.base); } return s.base; }
  function abierta(c, n) { return eff(c, secDe(n)) !== 'cerrado' && !!c.abierta[n]; }
  function bloqueadas(c, s) {
    if (s.tipo !== 'Numerado' || eff(c, s.id) === 'cerrado') { return 0; }
    return c.sillas.filter(function (b) { return b.sector === s.nombre; }).reduce(function (a, b) { return a + cuenta(b.sillas); }, 0);
  }
  function totalBloq(c) { return c.sillas.reduce(function (a, b) { return a + cuenta(b.sillas); }, 0); }
  function dispDe(c, s) { return Math.max(0, aforoDe(c, s) - bloqueadas(c, s)); }
  function plazoMal(c) { return !c.plazo || c.plazo > EVENTO.inicio; }
  function sum(xs) { return xs.reduce(function (x, y) { return x + (Number(y) || 0); }, 0); }
  function sinTitular() { return 412; }

  // Estado de los cupos frente a la disponibilidad actual de cada sector.
  function estadoCupos(c, q) {
    var cols = SEC.map(function (s, i) {
      var d = dispDe(c, s), rep_ = (Number(q.a[i]) || 0) + (Number(q.b[i]) || 0);
      var e = eff(c, s.id);
      var tipo = e === 'reducido' ? 'Reducido · ' + s.tipo.toLowerCase() : e === 'visitante' ? 'Visitante · ' + s.tipo.toLowerCase() : e === 'cerrado' ? 'Cerrado' : s.tipo;
      return { s: s, disp: d, rep: rep_, resto: d - rep_, tipo: tipo };
    });
    var total = sum(cols.map(function (x) { return x.disp; })), repT = sum(q.a) + sum(q.b);
    return { cols: cols, total: total, rep: repT, resto: total - repT, exced: cols.filter(function (x) { return x.resto < 0; }) };
  }

  function chip(cls, txt) { return '<span class="pb-badge pb-badge--' + ({ ok: 'ok', mal: 'error', w: 'alerta', n: 'neutro' }[cls]) + '">' + txt + '</span>'; }

  // ================= CONFIGURACIÓN =================
  function mapa(c) {
    var V = { habilitado: 'Habilitado', visitante: 'Visitante', cerrado: 'Cerrado', reducido: 'Aforo reducido' };
    function zona(id, x, y, w, h, rot, tx, ty) {
      var e = eff(c, id), s = nombreSec(id), lab = e === 'cerrado' ? 'Cerrado' : V[e] + ' · ' + fmt(aforoDe(c, s));
      var t = '<text x="' + tx + '" y="' + (ty - (rot ? 6 : -0)) + '" text-anchor="middle" class="pbe-m__n">' + s.nombre + '</text><text x="' + tx + '" y="' + (ty + (rot ? 16 : 24)) + '" text-anchor="middle" class="pbe-m__l">' + lab + '</text>';
      if (rot) { t = '<g transform="rotate(' + rot + ' ' + tx + ' 282)">' + t + '</g>'; }
      return '<g class="pbe-m pbe-m--' + e + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14"/>' + t + '</g>';
    }
    var pts = { 1: [190, 22], 2: [330, 22], 3: [22, 190], 8: [22, 374], 4: [498, 190], 5: [498, 374], 6: [190, 542], 7: [330, 542] };
    var puertas = Object.keys(pts).map(function (n) {
      var a = abierta(c, +n);
      return '<g class="pbe-pm pbe-pm--' + (a ? 'on' : 'off') + '"><circle cx="' + pts[n][0] + '" cy="' + pts[n][1] + '" r="16"/><text x="' + pts[n][0] + '" y="' + (pts[n][1] + 6) + '" text-anchor="middle">' + n + '</text></g>';
    }).join('');
    return '<svg class="pbe-mapa" viewBox="0 0 520 564" role="img" aria-label="Mapa del escenario con el estado de cada sector y puerta">' +
      zona('norte', 112, 22, 296, 80, 0, 260, 58) + zona('sur', 112, 462, 296, 80, 0, 260, 498) +
      zona('occ', 22, 112, 80, 340, -90, 62, 282) + zona('ori', 418, 112, 80, 340, 90, 458, 282) +
      '<rect x="122" y="112" width="276" height="340" rx="6" class="pbe-m__campo"/><line x1="122" y1="282" x2="398" y2="282" class="pbe-m__campo-l"/><circle cx="260" cy="282" r="38" class="pbe-m__campo-l pbe-m__campo-c"/>' +
      puertas + '</svg>';
  }

  function tabSectores(c) {
    var aviso = c.sinVis ? '<div class="pb-aviso" role="status">' + svg(I.info, 18) + '<span>Sin hinchada visitante: ningún sector puede ser visitante. Sur quedó cerrado; puede habilitarlo para la hinchada local.</span></div>' : '';
    return aviso + SEC.map(function (s) {
      var e = eff(c, s.id), red = Number(c.red[s.id]) || 0, mal = red > s.base;
      var ops = ESTADOS.map(function (o) {
        var on = e === o[0] || (e === 'cerrado' && o[0] === 'cerrado'), off = o[0] === 'visitante' && c.sinVis;
        return '<button type="button" class="pb-seg" aria-pressed="' + on + '"' + (off ? ' disabled' : '') + ' data-acc="cfg-sec" data-id="' + s.id + '.' + o[0] + '">' + o[1] + '</button>';
      }).join('');
      var der = e === 'reducido'
        ? '<label class="pb-campo">Aforo para este evento<input type="text" inputmode="numeric" autocomplete="off" value="' + red + '" class="pb-input pbe-in pbe-in--num' + (mal ? ' is-mal' : '') + '" data-acc="cfg-red" data-id="' + s.id + '"' + (mal ? ' aria-invalid="true"' : '') + '>' +
          (mal ? '<span class="pb-error">No puede pasar de ' + fmt(s.base) + '.</span>' : '') + '</label>'
        : '<span class="pbe-aforo"><span class="pbe-aforo__l">Aforo para este evento</span><span class="pbe-aforo__v' + (e === 'cerrado' ? ' is-nulo' : '') + '">' + fmt(aforoDe(c, s)) + '</span></span>';
      return '<div class="pbe-sec"><span class="pbe-sec__n"><b>' + s.nombre + '</b><span>' + s.tipo + ' · base ' + fmt(s.base) + '</span></span>' +
        '<div class="pb-segmento" role="group" aria-label="Estado de ' + s.nombre + '">' + ops + '</div>' + der + '</div>';
    }).join('');
  }

  function tabPuertas(c) {
    var sinP = [];
    var filas = PUERTAS.map(function (p) {
      var n = p[0], s = nombreSec(p[1]), cerradoSec = eff(c, p[1]) === 'cerrado', a = abierta(c, n), falta = a && !c.partido[n];
      if (falta) { sinP.push(n); }
      return '<div class="pbe-pu">' +
        '<span class="pbe-pu__id"><span class="pbe-pu__c' + (a ? '' : ' is-off') + '">' + n + '</span><span class="pbe-pu__t"><b>Puerta ' + n + '</b><span>Sector ' + s.nombre + '</span></span></span>' +
        '<button type="button" role="switch" class="pbe-sw pbe-sw--sm" aria-checked="' + a + '" aria-label="Puerta ' + n + ' abierta" data-acc="cfg-puerta" data-id="' + n + '"' + (cerradoSec ? ' disabled' : '') + '><span class="pbe-sw__pista"><span class="pbe-sw__bola"></span></span><span class="pbe-sw__t' + (a ? ' is-on' : '') + '">' + (cerradoSec ? 'Sector cerrado' : (a ? 'Abierta' : 'Cerrada')) + '</span></button>' +
        '<span class="pbe-pu__h"><input type="time" class="pb-input pbe-in pbe-in--h" aria-label="Apertura de la puerta ' + n + '" value="' + c.horario[n][0] + '" data-silencio="1" data-acc="cfg-desde" data-id="' + n + '"' + (a ? '' : ' disabled') + '><span>a</span>' +
        '<input type="time" class="pb-input pbe-in pbe-in--h" aria-label="Cierre de la puerta ' + n + '" value="' + c.horario[n][1] + '" data-silencio="1" data-acc="cfg-hasta" data-id="' + n + '"' + (a ? '' : ' disabled') + '></span>' +
        '<select class="pb-input pbe-in' + (falta ? ' is-mal' : '') + '" aria-label="Partido del torniquete de la puerta ' + n + '" data-acc="cfg-partido" data-id="' + n + '"' + (a ? '' : ' disabled') + (falta ? ' aria-invalid="true"' : '') + '>' +
        '<option value="">Sin partido asignado</option><option value="p1"' + (a && c.partido[n] === 'p1' ? ' selected' : '') + '>' + EVENTO.partido + ' · ' + EVENTO.hora + '</option></select></div>';
    }).join('');
    var nAb = PUERTAS.filter(function (p) { return abierta(c, p[0]); }).length;
    var res = sinP.length
      ? '<div class="pbe-res pbe-res--mal" role="status">' + svg(I.alerta, 16) + sinP.map(function (n) { return 'Puerta ' + n; }).join(', ') + (sinP.length === 1 ? ' está abierta sin partido: su torniquete no sabrá qué validar.' : ' están abiertas sin partido: sus torniquetes no sabrán qué validar.') + '</div>'
      : '<div class="pbe-res pbe-res--ok" role="status">' + svg(I.ok, 16) + nAb + (nAb === 1 ? ' puerta abierta, con su partido asignado.' : ' puertas abiertas, todas con su partido asignado.') + '</div>';
    return '<div class="pbe-pu pbe-pu--cab" aria-hidden="true"><span>Puerta</span><span>Estado</span><span>Horario</span><span>Partido de su torniquete</span></div>' + filas + res;
  }

  function tabSillas(c) {
    var nv = c.nueva, inc = !nv.fila.trim() || !cuenta(nv.sillas);
    var nums = SEC.filter(function (s) { return s.tipo === 'Numerado'; });
    var form = '<div class="pbe-sf">' +
      '<label class="pb-campo">Sector numerado<select class="pb-input pbe-in" data-acc="cfg-nsector">' + nums.map(function (s) { return '<option' + (nv.sector === s.nombre ? ' selected' : '') + '>' + s.nombre + '</option>'; }).join('') + '</select></label>' +
      '<label class="pb-campo">Fila<input type="text" class="pb-input pbe-in" value="' + esc(nv.fila) + '" placeholder="A" data-acc="cfg-nfila" autocomplete="off"></label>' +
      '<label class="pb-campo">Sillas<input type="text" class="pb-input pbe-in" value="' + esc(nv.sillas) + '" placeholder="1-12" data-acc="cfg-nsillas" autocomplete="off"></label>' +
      '<label class="pb-campo">Motivo<select class="pb-input pbe-in" data-acc="cfg-nmotivo">' + MOTIVOS.map(function (m) { return '<option' + (nv.motivo === m ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="pb-btn pb-btn--pri" data-acc="cfg-bloquear"' + (inc ? ' disabled' : '') + '>Bloquear</button></div>';
    var filas = c.sillas.map(function (b) {
      return '<div class="pbe-sl"><b>' + esc(b.sector) + '</b><span>' + esc(b.fila) + '</span><span class="pb-num">' + esc(b.sillas) + '</span><span class="pb-num">' + cuenta(b.sillas) + '</span>' + '<span class="pb-etiqueta">' + esc(b.motivo) + '</span>' +
        '<button type="button" class="pb-btn" data-acc="cfg-quitar" data-id="' + b.id + '" aria-label="Desbloquear fila ' + esc(b.fila) + ' sillas ' + esc(b.sillas) + ' de ' + esc(b.sector) + '">Desbloquear</button></div>';
    }).join('');
    var t = totalBloq(c);
    return form + '<div class="pbe-sl pbe-sl--cab" aria-hidden="true"><span>Sector</span><span>Fila</span><span>Sillas</span><span>Cantidad</span><span>Motivo</span><span></span></div>' + filas +
      '<p class="pbe-nota">' + fmt(t) + (t === 1 ? ' silla bloqueada.' : ' sillas bloqueadas.') + ' Las sillas bloqueadas no entran en los cupos.</p>';
  }

  function renderConfig(ctx) {
    var c = cfg(ctx.st), mal = plazoMal(c);
    var hab = sum(SEC.map(function (s) { return aforoDe(c, s); }));
    var sinP = PUERTAS.filter(function (p) { return abierta(c, p[0]) && !c.partido[p[0]]; }).length;
    var tabs = [['sectores', 'Sectores', 4, 0], ['puertas', 'Puertas', 8, sinP], ['sillas', 'Sillas bloqueadas', totalBloq(c), 0]].map(function (t) {
      var on = c.tab === t[0];
      return '<button type="button" role="tab" class="pbe-tab' + (on ? ' is-on' : '') + '" aria-selected="' + on + '" data-acc="cfg-tab" data-id="' + t[0] + '">' + t[1] +
        '<span class="pbe-tab__n' + (t[3] ? ' is-mal' : '') + '">' + (t[3] ? t[3] + ' sin partido' : t[2]) + '</span></button>';
    }).join('');
    var cuerpo = c.tab === 'puertas' ? tabPuertas(c) : c.tab === 'sillas' ? tabSillas(c) : tabSectores(c);
    var ayuda = mal
      ? (c.plazo ? 'No puede pasar del inicio del encuentro: ' + EVENTO.dia + ', ' + EVENTO.hora + '.' : 'Indique fecha y hora del plazo.')
      : 'Vence ' + fechaCorta(c.plazo).replace(/^hoy a las/, 'hoy a las') + '. Una boleta sin titular al vencer se pierde, sin devolución ni reventa.';
    return '<div class="pbe pbe-cfg">' +
      '<div class="pbe-top">' +
        '<section class="pb-card pbe-card' + (mal ? ' is-mal' : '') + '" aria-label="Plazo de asignación"><div class="pbe-card__c"><label for="pbe-plazo" class="pb-h2 pbe-card__t">Plazo para asignar boletas</label>' + (mal ? chip('mal', 'No válido') : chip('ok', 'Abierto')) + '</div>' +
          '<input id="pbe-plazo" type="datetime-local" class="pb-input pbe-in' + (mal ? ' is-mal' : '') + '" value="' + esc(c.plazo) + '" max="' + EVENTO.inicio + '" data-silencio="1" data-acc="cfg-plazo" aria-describedby="pbe-plazo-a"' + (mal ? ' aria-invalid="true"' : '') + '>' +
          '<span id="pbe-plazo-a" class="pbe-ayuda' + (mal ? ' is-mal' : '') + '">' + ayuda + '</span></section>' +
        (c.dep ? '<section class="pb-card pbe-card" aria-label="Hinchada visitante"><button type="button" role="switch" class="pbe-sw" aria-checked="' + c.sinVis + '" data-acc="cfg-sinvis"><span class="pbe-sw__t2">Partido sin hinchada visitante</span><span class="pbe-sw__pista"><span class="pbe-sw__bola"></span></span></button>' +
          '<span class="pbe-ayuda">' + (c.sinVis ? 'Ningún sector es visitante. Las puertas cruzan el club afín de cada persona.' : 'Sur recibe a la hinchada visitante. Actívelo si la autoridad restringe su ingreso.') + '</span></section>' : '') +
        '<section class="pb-card pbe-card" aria-label="Aforo habilitado"><span class="pb-h2 pbe-card__t">Aforo habilitado</span><span class="pbe-kpi"><b>' + fmt(hab) + '</b><span>de ' + fmt(EVENTO.aforo) + '</span></span>' +
          '<span class="pbe-barra" aria-hidden="true"><span style="width:' + Math.round(hab / EVENTO.aforo * 100) + '%"></span></span>' +
          '<span class="pbe-ayuda" role="status">' + (c.sucio ? 'Cambios sin guardar' : 'Guardado a las ' + c.guardado) + '</span></section>' +
      '</div>' +
      '<div class="pbe-cuerpo">' +
        '<section class="pb-card pbe-card pbe-card--mapa" aria-label="Mapa del evento"><span class="pb-h2 pbe-card__t">Así queda el escenario</span>' + mapa(c) +
          '<div class="pbe-leyenda"><span><i class="pbe-lg pbe-lg--habilitado"></i>Habilitado</span><span><i class="pbe-lg pbe-lg--visitante"></i>Visitante</span><span><i class="pbe-lg pbe-lg--reducido"></i>Aforo reducido</span><span><i class="pbe-lg pbe-lg--cerrado"></i>Cerrado</span><span><i class="pbe-lg pbe-lg--on"></i>Puerta abierta</span><span><i class="pbe-lg pbe-lg--off"></i>Puerta cerrada</span></div></section>' +
        '<section class="pb-card pbe-card pbe-card--tabs" aria-label="Ajustes"><div class="pbe-tabs" role="tablist" aria-label="Ajustes por nivel">' + tabs + '</div><div class="pbe-panel" role="tabpanel">' + cuerpo + '</div></section>' +
      '</div></div>';
  }

  function clickConfig(a, ctx) {
    var c = cfg(ctx.st), id = a.dataset.id, acc = a.dataset.acc;
    if (acc === 'cfg-tab') { c.tab = id; }
    else if (acc === 'cfg-sinvis') { c.sinVis = !c.sinVis; c.sucio = true; }
    else if (acc === 'cfg-sec') { if (a.disabled) { return; } c.sec[id.split('.')[0]] = id.split('.')[1]; c.sucio = true; }
    else if (acc === 'cfg-puerta') { if (a.disabled) { return; } c.abierta[id] = !c.abierta[id]; c.sucio = true; }
    else if (acc === 'cfg-quitar') { c.sillas = c.sillas.filter(function (b) { return b.id !== id; }); c.sucio = true; }
    else if (acc === 'cfg-bloquear') {
      var nv = c.nueva; if (!nv.fila.trim() || !cuenta(nv.sillas)) { return; }
      c.sillas.push({ id: 's' + Date.now(), sector: nv.sector, fila: nv.fila.trim().toUpperCase(), sillas: nv.sillas.trim(), motivo: nv.motivo });
      c.nueva = { sector: nv.sector, fila: '', sillas: '', motivo: nv.motivo }; c.sucio = true;
      ctx.toast('Sillas bloqueadas', 'Quedan fuera de los cupos.');
    }
    else if (acc === 'cfg-guardar') {
      if (plazoMal(c)) { ctx.toast('No se pudo guardar', 'El plazo no puede pasar del inicio del encuentro (' + EVENTO.hora + ').'); return; }
      c.guardado = ahora(); c.sucio = false;
      ctx.toast('Configuración guardada', 'A las ' + c.guardado + '. La base del escenario no cambió.');
    }
    else { return; }
  }

  function entero(v) { return Number(String(v).replace(/\D/g, '')) || 0; }
  // Devuelve false cuando no debe repintar (teclear o editar hora/fecha: se repinta al salir del campo).
  function entradaConfig(ev, ctx) {
    var a = el(ev.target); if (!a || !a.dataset.acc) { return; }
    var c = cfg(ctx.st), acc = a.dataset.acc, id = a.dataset.id, v = a.value;
    if (acc === 'cfg-nfila' || acc === 'cfg-nsillas') {
      c.nueva[acc === 'cfg-nfila' ? 'fila' : 'sillas'] = v;
      var b = ctx.raiz && ctx.raiz.querySelector ? ctx.raiz.querySelector('[data-acc="cfg-bloquear"]') : null;
      if (b) { b.disabled = !c.nueva.fila.trim() || !cuenta(c.nueva.sillas); }
      return false;
    }
    if (acc === 'cfg-red') { c.red[id] = entero(v); c.sucio = true; return; }
    if (acc === 'cfg-plazo' || acc === 'cfg-desde' || acc === 'cfg-hasta') {
      if (acc === 'cfg-plazo') { c.plazo = v; } else { c.horario[id][acc === 'cfg-desde' ? 0 : 1] = v; }
      c.sucio = true; ctx.st.__pend = true; return false;
    }
    if (acc === 'cfg-partido') { c.partido[id] = v; c.sucio = true; }
    else if (acc === 'cfg-nsector') { c.nueva.sector = v; }
    else if (acc === 'cfg-nmotivo') { c.nueva.motivo = v; }
  }

  // ================= CUPOS =================
  function renderCupos(ctx) {
    var c = cfg(ctx.st), q = cupos(ctx.st), e = estadoCupos(c, q), ex = e.exced.length > 0, mal = plazoMal(c);
    var hab = sum(SEC.map(function (s) { return aforoDe(c, s); })), bloq = totalBloq(c);
    var filas = COMERC.map(function (m, k) {
      var col = m[0], tot = sum(q[col]);
      var celdas = SEC.map(function (s, i) {
        var malc = e.cols[i].resto < 0;
        return '<div class="pbe-cu__c"><input type="text" inputmode="numeric" autocomplete="off" class="pb-input pbe-in pbe-in--num' + (malc ? ' is-mal' : '') + '" aria-label="' + m[1] + ', sector ' + s.nombre + '" value="' + (Number(q[col][i]) || 0) + '" data-acc="cup-set" data-k="' + col + '" data-id="' + i + '"' + (malc ? ' aria-invalid="true"' : '') + '></div>';
      }).join('');
      return '<div class="pbe-cu"><span class="pbe-cu__m"><i class="pbe-cu__b pbe-cu__b--' + col + '"></i><span class="pbe-cu__t"><b>' + m[1] + '</b><span class="pbe-hom">' + svg(I.escudo, 14, 2.4) + 'Homologada · llave de API activa</span></span></span>' + celdas +
        '<span class="pbe-cu__tot"><b class="pb-num">' + fmt(tot) + '</b><span>' + (e.total ? (Math.round(tot / e.total * 1000) / 10).toString().replace('.', ',') : '0') + ' % del disponible</span></span></div>';
    }).join('');
    var barA = e.total ? Math.min(100, sum(q.a) / e.total * 100) : 0, barB = e.total ? Math.min(100 - barA, sum(q.b) / e.total * 100) : 0;
    var cab = '<div class="pbe-cu pbe-cu--cab" aria-hidden="true"><span>Comercializadora</span>' + e.cols.map(function (x) { return '<span class="pbe-cu__h"><span>' + x.s.nombre + '</span><span>' + x.tipo + '</span></span>'; }).join('') + '<span class="pbe-r">Total</span></div>';
    var disp = '<div class="pbe-cu pbe-cu--pie"><span><b>Disponible</b></span>' + e.cols.map(function (x) { return '<span class="pbe-r pb-num">' + fmt(x.disp) + '</span>'; }).join('') + '<span class="pbe-r pb-num"><b>' + fmt(e.total) + '</b></span></div>';
    var resto = '<div class="pbe-cu pbe-cu--pie pbe-cu--resto"><span><b>Sin repartir</b></span>' + e.cols.map(function (x) { return '<span class="pbe-r pb-num ' + (x.resto < 0 ? 'is-mal' : x.resto === 0 ? 'is-ok' : '') + '"><b>' + fmt(x.resto) + '</b></span>'; }).join('') + '<span class="pbe-r pb-num' + (ex ? ' is-mal' : '') + '"><b>' + fmt(e.resto) + '</b></span></div>';
    var err = ex ? '<div class="pb-aviso pbe-aviso--mal" role="alert">' + svg(I.alerta, 18) + '<span>' + e.exced.map(function (x) { return x.s.nombre + ' excede su disponible en ' + fmt(-x.resto); }).join(' · ') + '. Ajuste antes de guardar.</span></div>' : '';
    var sobra = -sum(e.exced.map(function (x) { return x.resto; }));
    return '<div class="pbe pbe-cup">' +
      '<div class="pbe-kpis">' +
        '<div class="pb-card pbe-card"><span class="pbe-card__s">Aforo habilitado</span><span class="pbe-kpi"><b>' + fmt(hab) + '</b></span><button type="button" class="pb-btn pb-btn--enlace" data-acc="cup-ir" data-id="config">Ver sectores del evento</button></div>' +
        '<div class="pb-card pbe-card"><span class="pbe-card__s">Sillas bloqueadas</span><span class="pbe-kpi"><b>' + fmt(bloq) + '</b></span><span class="pbe-ayuda">Prensa, seguridad, dañadas y reservadas</span></div>' +
        '<div class="pb-card pbe-card"><span class="pbe-card__s">Disponible para cupos</span><span class="pbe-kpi"><b>' + fmt(e.total) + '</b></span><span class="pbe-ayuda">Aforo habilitado menos sillas bloqueadas</span></div>' +
        '<div class="pb-card pbe-card' + (ex ? ' is-mal' : '') + '"><span class="pbe-card__s' + (ex ? ' is-mal' : '') + '">' + (ex ? 'Excede el disponible' : 'Sin repartir') + '</span><span class="pbe-kpi' + (ex ? ' is-mal' : '') + '"><b>' + fmt(ex ? sobra : e.resto) + '</b></span><span class="pbe-ayuda' + (ex ? ' is-mal' : '') + '">Repartido ' + fmt(e.rep) + ' de ' + fmt(e.total) + '</span></div>' +
      '</div>' +
      '<section class="pb-card pbe-card pbe-card--tabla" aria-label="Reparto por comercializadora"><div class="pbe-rep"><span class="pb-h2 pbe-card__t">Reparto por sector</span>' +
        '<div class="pbe-rep__b" aria-hidden="true"><span class="pbe-rep__a" style="width:' + barA + '%"></span><span class="pbe-rep__b2" style="width:' + barB + '%"></span></div>' +
        '<span class="pbe-rep__lg"><span><i class="pbe-cu__b pbe-cu__b--a pbe-cu__b--mini"></i>A</span><span><i class="pbe-cu__b pbe-cu__b--b pbe-cu__b--mini"></i>B</span><span><i class="pbe-lg pbe-lg--vacio"></i>Sin repartir</span></span>' +
        '<button type="button" class="pb-btn" data-acc="cup-reset">Restablecer</button></div>' +
        '<div class="pbe-tabla">' + cab + filas + disp + resto + '</div>' + err + '</section>' +
      '<div class="pbe-dos">' +
        '<section class="pb-card pbe-card pbe-nota-card" aria-label="Plazo de asignación">' + svg(I.reloj, 22) + '<div><div class="pbe-card__c"><b>Plazo de asignación: ' + (c.plazo ? fechaCorta(c.plazo).replace('hoy a las', 'hoy, ') : 'sin definir') + '</b>' + (mal ? chip('mal', 'No válido') : chip('ok', 'Abierto')) + '</div>' +
          '<p>Las comercializadoras asignan titulares hasta esa hora. Una boleta sin titular al vencer se pierde, sin devolución ni reventa.</p><button type="button" class="pb-btn pb-btn--enlace" data-acc="cup-ir" data-id="config">Cambiar el plazo en Configuración</button></div></section>' +
        '<section class="pb-card pbe-card pbe-nota-card" aria-label="Comercializadoras sin homologar">' + svg(I.escudoX, 22) + '<div><div class="pbe-card__c"><b>Comercializadora C</b>' + chip('w', 'En pruebas') + '</div>' +
          '<p>No recibe cupo hasta que Mindeporte la homologue. Solo las comercializadoras homologadas consultan el SVN en producción.</p></div></section>' +
      '</div></div>';
  }

  function clickCupos(a, ctx) {
    var acc = a.dataset.acc, c = cfg(ctx.st), q = cupos(ctx.st);
    if (acc === 'cup-reset') { q.a = [5000, 6000, 7000, 0]; q.b = [3000, 3000, 3500, 8500]; ctx.toast('Reparto restablecido', 'Volvió al último reparto de la maqueta.'); }
    else if (acc === 'cup-ir') { ctx.ir(a.dataset.id); return false; }
    else if (acc === 'cup-guardar') {
      var e = estadoCupos(c, q);
      if (e.exced.length) { ctx.toast('No se pudo guardar', e.exced[0].s.nombre + ' excede su disponible en ' + fmt(-e.exced[0].resto) + '.'); return; }
      q.guardado = ahora(); ctx.toast('Reparto guardado', fmt(e.rep) + ' boletas repartidas entre las comercializadoras homologadas.');
    }
    else { return; }
  }
  function entradaCupos(ev, ctx) {
    var a = el(ev.target); if (!a || a.dataset.acc !== 'cup-set') { return; }
    cupos(ctx.st)[a.dataset.k][+a.dataset.id] = entero(a.value);
  }

  // ================= LISTO PARA ABRIR =================
  function evaluar(ctx) {
    var c = cfg(ctx.st), L = listo(ctx.st), q = cupos(ctx.st);
    var ab = PUERTAS.filter(function (p) { return abierta(c, p[0]); }).map(function (p) { return p[0]; });
    var N = ab.length, con = function (f) { return ab.filter(f); };
    var okD = con(function (n) { return c.disp[n]; }), okP = con(function (n) { return c.partido[n]; }), okK = con(function (n) { return /^\d/.test(c.paquete[n] || ''); });
    var e = estadoCupos(c, q), mal = plazoMal(c);
    var libres = DISPOSITIVOS.filter(function (d) { return PUERTAS.every(function (p) { return c.disp[p[0]] !== d.id; }); });
    return { c: c, L: L, ab: ab, N: N, okD: okD, okP: okP, okK: okK, e: e, mal: mal, libres: libres };
  }

  function renderListo(ctx) {
    var V = evaluar(ctx), c = V.c, L = V.L, N = V.N, ab = V.ab;
    var falD = ab.filter(function (n) { return !c.disp[n]; }), falP = ab.filter(function (n) { return !c.partido[n]; }), falK = ab.filter(function (n) { return !/^\d/.test(c.paquete[n] || ''); });
    falK.forEach(function (n) { L.vistos[n] = true; });
    var dn = function (n) { return 'Puerta ' + n + ' · ' + nombreSec(secDe(n)).nombre; };
    var lisIr = function (v, t, f) { return '<button type="button" class="pb-btn pb-btn--enlace" data-acc="listo-ir" data-id="' + v + '">' + t + '</button>'; };

    // Cada control: [ok, titulo, cuenta, detalle, extra html]
    var extraD = falD.map(function (n) {
      if (!V.libres.length) { return '<p class="pbe-ayuda is-mal">No hay dispositivos disponibles para la Puerta ' + n + '.</p>'; }
      var sel = L.sel[n] || '';
      return '<div class="pbe-acc"><label for="pbe-d' + n + '" class="pbe-acc__l">Puerta ' + n + '</label><select id="pbe-d' + n + '" class="pb-input pbe-in" data-acc="listo-dsel" data-id="' + n + '"><option value="">Elegir dispositivo disponible</option>' +
        V.libres.map(function (d) { return '<option value="' + d.id + '"' + (sel === d.id ? ' selected' : '') + '>' + d.id + ' · ' + d.nombre + ' · en línea</option>'; }).join('') + '</select>' +
        '<button type="button" class="pb-btn pb-btn--pri" data-acc="listo-disp" data-id="' + n + '"' + (sel ? '' : ' disabled') + '>Asignar</button></div>';
    }).join('');
    var extraP = falP.map(function (n) {
      var sin = !c.disp[n];
      return '<div class="pbe-acc"><button type="button" class="pb-btn" data-acc="listo-partido" data-id="' + n + '"' + (sin ? ' disabled' : '') + '>Configurar Puerta ' + n + ' para ' + EVENTO.partido + '</button>' + (sin ? '<span class="pbe-ayuda">Primero asigne un dispositivo</span>' : '') + '</div>';
    }).join('');
    var pkNs = ab.filter(function (n) { return L.vistos[n]; });
    var extraK = pkNs.map(function (n) {
      var ok = /^\d/.test(c.paquete[n] || ''), parc = c.paquete[n] === 'parcial', listaD = c.disp[n] && c.partido[n];
      var est = ok ? 'Descargado a las ' + c.paquete[n] : parc ? 'La descarga se interrumpió al 64 %' : listaD ? 'Sin paquete' : 'Necesita dispositivo y partido antes de descargar';
      return '<div class="pbe-pkg"><span class="pbe-pkg__t"><b>' + dn(n) + '</b><span>' + est + '</span></span><button type="button" class="pb-btn" data-acc="listo-pkg" data-id="' + n + '"' + (ok || !listaD ? ' disabled' : '') + '>' + (ok ? 'Descargado' : parc ? 'Reintentar descarga' : 'Descargar paquete') + '</button></div>';
    }).join('');

    var visit = SEC.filter(function (s) { return eff(c, s.id) === 'visitante'; }).map(function (s) { return s.nombre; });
    var cerr = SEC.filter(function (s) { return eff(c, s.id) === 'cerrado'; }).map(function (s) { return s.nombre; });
    var chk = [
      { ok: V.okD.length === N && N > 0, t: 'Cada puerta abierta tiene dispositivo', n: V.okD.length + ' de ' + N,
        d: falD.length ? falD.map(dn).join(', ') + (falD.length === 1 ? ' no tiene dispositivo asignado.' : ' no tienen dispositivo asignado.') : 'Todas las puertas abiertas tienen dispositivo.', x: extraD },
      { ok: V.okP.length === N && N > 0, t: 'Cada torniquete está configurado para su partido', n: V.okP.length + ' de ' + N,
        d: falP.length ? 'El torniquete de ' + falP.map(function (n) { return 'la Puerta ' + n; }).join(' y ') + ' no tiene partido. El operador no debe elegirlo en la puerta.' : 'Todas validan ' + EVENTO.partido + ' · ' + EVENTO.hora + '.', x: extraP },
      { ok: V.okK.length === N && N > 0, t: 'Paquete sin conexión descargado en cada puerta', n: V.okK.length + ' de ' + N,
        d: falK.length ? 'Cada puerta necesita sus boletas, los documentos con medida vigente y el nivel de verificación de cada titular.' : 'Boletas del sector, documentos con medida vigente y nivel de verificación de cada titular.', x: extraK },
      { ok: N > 0, t: 'Sectores y puertas configurados', n: N > 0 ? 'Listo' : 'Pendiente',
        d: N > 0 ? N + (N === 1 ? ' puerta abierta' : ' puertas abiertas') + ', cada una de un solo sector.' + (visit.length ? ' ' + visit.join(' y ') + ' recibe a la hinchada visitante.' : '') + (cerr.length ? ' Cerrado: ' + cerr.join(', ') + '.' : '') : 'No hay ninguna puerta abierta.',
        x: N > 0 ? '' : lisIr('config', 'Ir a Configuración', 'ir-c1') },
      { ok: V.e.exced.length === 0, t: 'Cupos dentro del aforo habilitado', n: V.e.exced.length ? 'Excede' : 'Listo',
        d: V.e.exced.length ? V.e.exced.map(function (x) { return x.s.nombre + ' excede su disponible en ' + fmt(-x.resto); }).join(' · ') + '.' : fmt(V.e.rep) + ' repartidos de ' + fmt(V.e.total) + ' disponibles, solo a comercializadoras homologadas.',
        x: V.e.exced.length ? lisIr('cupos', 'Ajustar en Cupos', 'ir-c2') : '' },
      { ok: !V.mal, t: 'Plazo de asignación antes del inicio', n: V.mal ? 'No válido' : 'Listo',
        d: V.mal ? 'El plazo no puede pasar del inicio del encuentro (' + EVENTO.hora + ').' : 'Vence ' + fechaCorta(c.plazo) + '; el encuentro empieza a las ' + EVENTO.hora + '.', x: V.mal ? lisIr('config', 'Ir a Configuración', 'ir-c3') : '' }
    ];
    var bloqueos = chk.filter(function (x) { return !x.ok; }).length, hechas = chk.length - bloqueos;

    var avisos = [];
    ab.filter(function (n) { return c.conexion[n] === false; }).forEach(function (n) {
      var h = /^\d/.test(c.paquete[n] || '') ? c.paquete[n] : null;
      avisos.push({ t: dn(n) + ' sin conexión' + (h ? ' desde las ' + h : ''), d: h ? 'Validará con el paquete que descargó a esa hora. Los rojos por medida llegarán al PMU cuando vuelva la red.' : 'No tiene paquete ni red: no podrá validar hasta reconectarse.' });
      if (h) { avisos.push({ t: 'El paquete de la Puerta ' + n + ' no incluye 2 medidas radicadas después de las ' + h, d: 'Se actualizará en cuanto el dispositivo recupere la conexión.' }); }
    });
    if (!V.mal) { avisos.push({ t: 'Plazo de asignación abierto hasta las ' + hhmm(c.plazo), d: fmt(sinTitular()) + ' boletas siguen sin titular. Si nadie las asigna antes de esa hora, se pierden.' }); }
    SEC.forEach(function (s) {
      var e = eff(c, s.id);
      if (e === 'reducido') { avisos.push({ t: s.nombre + ' con aforo reducido', d: fmt(aforoDe(c, s)) + ' de ' + fmt(s.base) + ' puestos habilitados para este evento.' }); }
      if (e === 'cerrado') { avisos.push({ t: s.nombre + ' cerrado para este evento', d: 'Sus puertas no abren y no recibe cupo.' }); }
    });

    var puertas = PUERTAS.map(function (p) {
      var n = p[0], s = nombreSec(p[1]), a = abierta(c, n), d = c.disp[n], part = !!c.partido[n], pk = c.paquete[n], ok = /^\d/.test(pk || ''), con = c.conexion[n] === false ? 'Sin conexión' : (d ? 'En línea' : '—');
      var lista = !a || (d && part && ok);
      var tag = !a ? chip('n', 'Cerrada') : !lista ? chip('mal', 'Pendiente') : (con === 'Sin conexión' ? chip('w', 'Lista · sin red') : chip('ok', 'Lista'));
      var dd = function (txt, bad) { return '<dd class="' + (bad ? 'is-mal' : '') + '">' + txt + '</dd>'; };
      var dl = a
        ? '<dt>Dispositivo</dt>' + dd(d || 'Sin asignar', !d) + '<dt>Partido</dt>' + dd(part ? EVENTO.partido : 'Sin partido', !part) + '<dt>Paquete</dt>' + dd(ok ? 'Descargado ' + pk : (pk === 'parcial' ? 'Interrumpido' : 'Sin paquete'), !ok) + '<dt>Conexión</dt><dd class="' + (con === 'Sin conexión' ? 'is-w' : '') + '">' + con + '</dd>'
        : '<dt>Estado</dt><dd>' + (eff(c, p[1]) === 'cerrado' ? 'Sector cerrado para este evento' : 'Cerrada para este evento') + '</dd>';
      return '<div class="pbe-pcard' + (a && !lista ? ' is-mal' : '') + '"><div class="pbe-pcard__c"><span class="pbe-pu__c' + (a ? '' : ' is-off') + '">' + n + '</span><span class="pbe-pu__t"><b>Puerta ' + n + '</b><span>' + s.nombre + '</span></span>' + tag + '</div><dl>' + dl + '</dl></div>';
    }).join('');
    var listas = PUERTAS.filter(function (p) { return abierta(c, p[0]) && (c.disp[p[0]] && c.partido[p[0]] && /^\d/.test(c.paquete[p[0]] || '')); }).length;

    var top, cta;
    if (L.abierto) {
      top = { cls: 'abierto', ic: I.ok, t: 'Puertas abiertas a las ' + L.abiertoA, d: 'Cada puerta valida ' + EVENTO.partido + '. El ingreso se sigue en vivo.' + (bloqueos ? ' Un cambio posterior dejó ' + bloqueos + (bloqueos === 1 ? ' verificación pendiente.' : ' verificaciones pendientes.') : '') };
      cta = '<button type="button" class="pbe-cta is-hecho" disabled>' + svg(I.puerta, 20) + 'Puertas abiertas</button>';
    } else if (bloqueos) {
      top = { cls: 'bloq', ic: I.candado, t: 'Todavía no se pueden abrir las puertas', d: bloqueos + (bloqueos === 1 ? ' verificación bloquea' : ' verificaciones bloquean') + ' la apertura. Los avisos no la impiden.' };
      cta = '<button type="button" class="pbe-cta" disabled>' + svg(I.puerta, 20) + 'Abrir puertas</button>';
    } else {
      top = { cls: 'listo', ic: I.ok, t: 'Todo listo para abrir', d: 'Las ' + N + ' puertas tienen dispositivo, partido y paquete. ' + (avisos.length ? 'Quedan ' + avisos.length + (avisos.length === 1 ? ' aviso.' : ' avisos.') : 'Sin avisos.') };
      cta = '<button type="button" class="pbe-cta is-on" data-acc="listo-abrir">' + svg(I.puerta, 20) + 'Abrir puertas</button>';
    }

    return '<div class="pbe pbe-lis">' +
      '<section class="pbe-estado pbe-estado--' + top.cls + '" aria-label="Estado de la apertura"><span class="pbe-estado__i">' + svg(top.ic, 24, top.cls === 'bloq' ? 2.4 : 3) + '</span>' +
        '<div class="pbe-estado__t"><h2>' + top.t + '</h2><span>' + top.d + '</span></div>' +
        '<div class="pbe-estado__v" role="status"><span>Verificaciones</span><b>' + hechas + ' de ' + chk.length + '</b></div>' + cta + '</section>' +
      '<div class="pbe-lis__g">' +
        '<section class="pb-card pbe-card pbe-card--lista" aria-label="Lista de chequeo"><div class="pbe-lh"><h3>Bloquea la apertura</h3><span>Sin esto, alguna puerta no sabe qué validar</span></div><ul class="pbe-ul">' +
          chk.map(function (x) {
            return '<li class="pbe-ck"><span class="pbe-ck__i' + (x.ok ? ' is-ok' : '') + '">' + (x.ok ? svg(I.ok, 14, 3.4) : '') + '</span><div class="pbe-ck__c"><div class="pbe-ck__h"><b>' + x.t + '</b><span class="' + (x.ok ? 'is-ok' : 'is-mal') + '">' + (x.ok ? '' : '<span class="pbe-sr">Pendiente: </span>') + x.n + '</span></div><span class="pbe-ck__d' + (x.ok ? ' is-ok' : '') + '">' + x.d + '</span>' + (x.x || '') + '</div></li>';
          }).join('') + '</ul>' +
          '<div class="pbe-lh pbe-lh--av"><h3>Solo avisa</h3><span>Se puede abrir; conviene tenerlo presente</span></div><ul class="pbe-ul">' +
          (avisos.length ? avisos.map(function (a) { return '<li class="pbe-ck pbe-ck--av"><span class="pbe-ck__i is-av" aria-hidden="true">!</span><div class="pbe-ck__c"><b>' + esc(a.t) + '</b><span class="pbe-ck__d">' + esc(a.d) + '</span></div></li>'; }).join('') : '<li class="pbe-ck pbe-ck--av"><div class="pbe-ck__c"><span class="pbe-ck__d">Sin avisos.</span></div></li>') + '</ul></section>' +
        '<section class="pbe-pcol" aria-label="Puertas"><div class="pbe-pcol__c"><h3>Puertas</h3><span>' + listas + ' de ' + N + ' listas</span>' + lisIr('config', 'Ir a la configuración', 'ir-cfg') + '</div><div class="pbe-pgrid">' + puertas + '</div></section>' +
      '</div></div>';
  }

  function clickListo(a, ctx) {
    var acc = a.dataset.acc, id = +a.dataset.id, V = evaluar(ctx), c = V.c, L = V.L;
    if (acc === 'listo-ir') { ctx.ir(a.dataset.id); return false; }
    else if (acc === 'listo-disp') {
      var d = L.sel[id]; if (!d || c.disp[id]) { return; }
      c.disp[id] = d; c.conexion[id] = true; delete L.sel[id]; ctx.toast('Dispositivo asignado', d + ' quedó en la Puerta ' + id + '.');
    }
    else if (acc === 'listo-partido') { if (!c.disp[id]) { return; } c.partido[id] = 'p1'; ctx.toast('Torniquete configurado', 'La Puerta ' + id + ' valida ' + EVENTO.partido + '.'); }
    else if (acc === 'listo-pkg') {
      if (!c.disp[id] || !c.partido[id]) { return; }
      L.reloj += 1; var h = ('0' + Math.floor(L.reloj / 60)).slice(-2) + ':' + ('0' + (L.reloj % 60)).slice(-2);
      c.paquete[id] = h; ctx.toast('Paquete descargado', 'Puerta ' + id + ', a las ' + h + '.');
    }
    else if (acc === 'listo-abrir') {
      if (V.N === 0 || V.okD.length < V.N || V.okP.length < V.N || V.okK.length < V.N || V.mal || V.e.exced.length) { return; }
      L.abierto = true; L.abiertoA = ('0' + Math.floor(L.reloj / 60)).slice(-2) + ':' + ('0' + (L.reloj % 60)).slice(-2);
      ctx.toast('Puertas abiertas', 'A las ' + L.abiertoA + '. Cada puerta valida ' + EVENTO.partido + '.');
    }
    else { return; }
  }
  function entradaListo(ev, ctx) {
    var a = el(ev.target); if (!a || a.dataset.acc !== 'listo-dsel') { return; }
    listo(ctx.st).sel[a.dataset.id] = a.value;
  }

  // ---------- Registro ----------
  function ruta(prefijo, click, entrada) {
    var mio = function (n) { var a = el(n); return a && a.dataset && a.dataset.acc && a.dataset.acc.indexOf(prefijo) === 0 ? a : null; };
    var ent = function (ev, ctx) { return mio(ev.target) ? entrada(ev, ctx) : undefined; };
    // Un clic dentro de un campo no repinta: se perdería el foco o se cerraría el desplegable.
    return { onClick: function (e, ev, ctx) { var a = mio(e); if (!a) { return; } return /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) ? false : click(a, ctx); }, onInput: ent, onChange: ent };
  }
  var rc = ruta('cfg-', clickConfig, entradaConfig), rq = ruta('cup-', clickCupos, entradaCupos), rl = ruta('listo-', clickListo, entradaListo);

  // La maqueta trae la configuración sembrada solo para el primer evento; con otro se ofrece volver a él.
  function otroEvento(ctx, pref) {
    var e = ctx.ev ? ctx.ev() : null;
    if (!e || e.id === 'e1') { return ''; }
    return '<div class="pb-vacio"><b>Esta vista está sembrada para Nacional vs. Medellín</b><span>' + esc(e.nombre) + ' no tiene configuración cargada en el prototipo.</span>' +
      '<button type="button" class="pb-btn pb-btn--pri" data-acc="' + pref + '-e1">Ver Nacional vs. Medellín</button></div>';
  }
  function con(pref, vista, r) {
    var click = r.onClick;
    r.onClick = function (e, ev, ctx) {
      var a = el(e);
      if (a && a.dataset && a.dataset.acc === pref + '-e1') { ctx.st.evento = 'e1'; return; }
      return click(e, ev, ctx);
    };
    var render = vista.render;
    vista.render = function (ctx) { return otroEvento(ctx, pref) || render(ctx); };
    vista.onClick = r.onClick; vista.onInput = r.onInput; vista.onChange = r.onChange;
    var monta = vista.alMontar;
    vista.alMontar = function (ctx) { cfg(ctx.st); cupos(ctx.st); listo(ctx.st); escuchar(ctx); if (monta) { monta(ctx); } };
    B.registrar(vista.id, vista);
  }
  var fuera = function (ctx) { return ctx.ev && ctx.ev().id !== 'e1'; };
  con('cfg', { id: 'config', label: 'Configuración', orden: 3, render: renderConfig,
    accion: function (ctx) { return { label: 'Guardar configuración', acc: 'cfg-guardar', disabled: fuera(ctx) || plazoMal(cfg(ctx.st)) }; } }, rc);
  con('cup', { id: 'cupos', label: 'Cupos', orden: 4, render: renderCupos,
    accion: function (ctx) { return { label: 'Guardar reparto', acc: 'cup-guardar', disabled: fuera(ctx) || estadoCupos(cfg(ctx.st), cupos(ctx.st)).exced.length > 0 }; } }, rq);
  con('listo', { id: 'listo', label: 'Listo para abrir', orden: 5, render: renderListo }, rl);
})();
