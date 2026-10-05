/* Datos del prototipo. Todo ficticio: ningún nombre ni documento sale de los insumos. */
window.SVN_DATOS = {
  entidad: { nombre: 'Ministerio del Deporte', sigla: 'Mindeporte', monograma: 'MD', sistema: 'Sistema de Validación Nacional' },

  // Las 9 superficies de modeling/superficies.md, con sus grupos.
  grupos: [
    { id: 'estado', nombre: 'Estado · Mindeporte' },
    { id: 'evento', nombre: 'Operación del evento' },
    { id: 'integracion', nombre: 'Integración' },
    { id: 'persona', nombre: 'Persona y soporte' }
  ],
  apps: [
    // Orden = flujo de la demo (30-sep-2026); `paso` es el número visible en el gate y `n` la superficie del modelo.
    { paso: 1, n: 4, id: 'backoffice', grupo: 'evento', nombre: 'Backoffice de eventos', disp: 'Escritorio', icono: 'calendar', roles: ['organizador'], ruta: '#/backoffice' },
    { paso: 2, n: '6 y 7', id: 'compra', grupo: 'integracion', nombre: 'Vender la boleta', disp: 'Celular · escritorio', icono: 'payment', roles: ['persona', 'comercializadora'], ruta: '#/compra' },
    { paso: 3, n: 5, id: 'puerta', grupo: 'evento', nombre: 'Acceso en puerta', disp: 'Celular · tablet · consola', icono: 'qr-code', roles: ['operador', 'policia'], ruta: '#/puerta' },
    { paso: 4, n: 3, id: 'pmu', grupo: 'estado', nombre: 'Monitor PMU', disp: 'Tablet · escritorio', icono: 'view-grid', roles: ['policia', 'supervisor'], ruta: '#/policia' },
    { paso: 5, n: 1, id: 'registro', grupo: 'estado', nombre: 'Registro de medidas', disp: 'Escritorio', icono: 'file', roles: ['ivc'], ruta: '#/medidas' },
    // Policía primero: la card de la app entra con roles[0] y el diseño aprobado es el de la Policía.
    { paso: 6, n: 3, id: 'auditoria', grupo: 'estado', nombre: 'Auditoría', disp: 'Escritorio', icono: 'history', roles: ['policia', 'mindeporte'], ruta: '#/auditoria' },
    { paso: 7, n: 8, id: 'portal', grupo: 'persona', nombre: 'Portal de la persona', disp: 'Web móvil', icono: 'user', roles: ['persona'], ruta: '#/portal' },
    { paso: 8, n: 9, id: 'soporte', grupo: 'persona', nombre: 'Consola de soporte', disp: 'Escritorio', icono: 'helper', roles: ['soporte'], ruta: '#/soporte' },
    { paso: 9, n: 2, id: 'entidades', grupo: 'estado', nombre: 'Entidades y comercializadoras', disp: 'Escritorio', icono: 'official-stores', roles: ['club', 'mindeporte'], ruta: '#/entidades' },
    { paso: 10, n: 6, id: 'integracion', grupo: 'integracion', nombre: 'API y portal de integración', disp: 'Portal web', icono: 'link', roles: ['comercializadora'], ruta: '#/integracion' }
  ],

  // Roles de dominio.md. `ruta` solo en los que ya tienen pantalla.
  roles: [
    // En el orden del flujo de la demo; los que no tienen `ruta` bajan a chips en ese mismo orden.
    { id: 'organizador', rol: 'Organizador', ini: 'OR', color: 'pink', desc: 'Configura escenario, evento y puertas.', app: 'backoffice', ruta: '#/backoffice' },
    { id: 'comercializadora', rol: 'Comercializadora', ini: 'CO', color: 'cyan', desc: 'Se integra y consulta en cada venta.', app: 'integracion', ruta: '#/integracion' },
    { id: 'persona', rol: 'Persona', ini: 'PE', color: 'orange', desc: 'Consulta su estado y sus boletas.', app: 'portal', ruta: '#/portal' },
    { id: 'operador', rol: 'Operador de puerta', ini: 'OP', color: 'orange', desc: 'Lee documentos y boletas; decide los amarillos.', app: 'puerta', ruta: '#/puerta' },
    { id: 'policia', rol: 'Policía Nacional', ini: 'PN', color: 'blue', desc: 'Sigue el evento en vivo, atiende los rojos y consulta la auditoría.', app: 'pmu', ruta: '#/policia' },
    { id: 'ivc', rol: 'Profesional del IVC', ini: 'IV', color: 'purple', desc: 'Radica las medidas desde el oficio.', app: 'registro', ruta: '#/medidas' },
    { id: 'mindeporte', rol: 'Mindeporte', ini: 'MD', color: 'amber', desc: 'Consulta la auditoría; homologa comercializadoras.', app: 'auditoria', ruta: '#/auditoria' },
    { id: 'supervisor', rol: 'Supervisor del evento', ini: 'SE', color: 'teal', desc: 'Sigue ingresos y alertas en vivo.', app: 'pmu' },
    { id: 'club', rol: 'Club o entidad', ini: 'CL', color: 'green', desc: 'Reporta su comercializadora e incidentes.', app: 'entidades', ruta: '#/entidades' },
    { id: 'soporte', rol: 'Soporte', ini: 'SO', color: 'blue', desc: 'Resuelve reclamaciones de boletas.', app: 'soporte', ruta: '#/soporte' }
  ],

  evento: { puerta: 'Puerta 4 · Oriental', partido: 'Nacional vs. Medellín', hora: '19:00', escenario: 'Estadio Atanasio Girardot' },

  // Casos de la puerta. Rojo por medida: sin nombre y con alerta al PMU. Rojo operativo: boleta; con nombre y Policía opcional.
  casos: [
    { id: 'verde', foto: 'assets/fotos/verde.jpg', punto: 'verde', etiqueta: 'Verde · entra', color: 'verde', nombre: 'Andrés Felipe Restrepo Gil', doc: 'CC 1.036.482.117', detalle: 'Oriental Baja · Fila E · Silla 18' },
    { id: 'veto', foto: 'assets/fotos/amarillo.jpg', punto: 'amarillo', etiqueta: 'Amarillo · veto levantado', color: 'amarillo', causa: 'Veto levantado', detalle: 'Medida levantada el 25 sep · Resolución 0198.', nombre: 'Mateo Giraldo Paz', doc: 'CC 1.001.246.583' },
    { id: 'cruce', foto: 'assets/fotos/amarillo.jpg', punto: 'amarillo', etiqueta: 'Amarillo · indicativos cruzados', color: 'amarillo', causa: 'Indicativos cruzados', detalle: 'Va con 2 personas que han tenido medidas.', nombre: 'Sebastián Cardona Ruiz', doc: 'CC 1.152.708.664' },
    { id: 'riesgo', foto: 'assets/fotos/amarillo.jpg', punto: 'amarillo', etiqueta: 'Amarillo · en riesgo', color: 'amarillo', riesgo: true, causa: 'Posible riesgo en este partido', detalle: 'Posible hincha de equipo rival.', nombre: 'Daniel Ospina Cano', doc: 'CC 1.020.774.310' },
    { id: 'solocc', foto: 'assets/fotos/verde-cc.jpg', punto: 'verde', etiqueta: 'Verde · entra solo con CC', color: 'verde', soloCC: true, nombre: 'Felipe Osorio Marín', doc: 'CC 1.037.615.208', detalle: 'Oriental Baja · Fila H · Silla 12', registro: 'Entró · solo con CC · Oriental Baja' },
    { id: 'medida', foto: 'assets/fotos/sospechoso-sin.jpg', punto: 'rojo', etiqueta: 'Rojo · medida vigente', color: 'rojo', doc: 'CC •••• 4447' },
    { id: 'otro', foto: 'assets/fotos/sospechoso-otro.jpg', punto: 'rojo', etiqueta: 'Rojo · otro partido', color: 'rojo', operativo: true, causa: 'Boleta de otro partido', detalle: 'Es para Millonarios vs. Santa Fe · 5 oct.', nombre: 'Andrés Zuluaga Mejía', doc: 'CC 1.017.335.902' },
    { id: 'usada', foto: 'assets/fotos/sospechoso-usada.jpg', punto: 'rojo', etiqueta: 'Rojo · boleta ya usada', color: 'rojo', operativo: true, causa: 'Boleta ya usada', detalle: 'Ingresó 17:58 por la Puerta 2.', nombre: 'Mateo Giraldo Paz', doc: 'CC 1.001.246.583' },
    { id: 'sin', foto: 'assets/fotos/amarillo.jpg', punto: 'rojo', etiqueta: 'Rojo · sin boleta', color: 'rojo', operativo: true, causa: 'Sin boleta para este partido', detalle: 'Este documento no tiene boleta asignada.', nombre: 'Sebastián Cardona Ruiz', doc: 'CC 1.152.708.664' },
    { id: 'rostro', punto: 'rostro', etiqueta: 'Confianza baja · verificar', color: 'rostro', nombre: 'Camilo Arango Vélez', doc: 'CC 1.214.559.030', detalle: 'Oriental Alta · Fila B · Silla 7', motivo: 'Primer ingreso con este documento.' }
  ],

  historial: [
    { color: 'verde', texto: 'Entró · Oriental Baja', hora: '18:39', lectura: true },
    { color: 'amarillo', texto: 'Entró · aviso · Medida levantada', hora: '18:37', lectura: true },
    { color: 'verde', texto: 'Entró · Oriental Alta', hora: '18:36', lectura: true },
    { color: 'verde', texto: 'Entró · Oriental Baja', hora: '18:35', lectura: true }
  ],
  turno: { ingresos: 312, avisos: 5, rojos: 1 },

  // Vista policial: señales explicables, sin puntaje. Solo el club afín decide un acceso.
  policia: {
    // Eventos de la jurisdicción: la primera pantalla de la Policía. `tablero: true` abre el tablero armado.
    eventos: [
      { id: 'e1', estado: 'vivo', fecha: '2026-09-28', dia: 'Hoy · lunes 28 de septiembre', hora: '19:00', partido: 'Nacional vs. Medellín', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', foto: 'atanasio', nota: 'Puertas abiertas', dato: { principal: '4.812', total: '38.000', etiqueta: 'ingresados' }, alertas: 2, tablero: true },
      { id: 'e2', estado: 'vivo', fecha: '2026-09-28', dia: 'Hoy · lunes 28 de septiembre', hora: '18:00', partido: 'Junior vs. Santa Fe', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio Metropolitano', ciudad: 'Barranquilla', foto: 'metropolitano', nota: 'En juego · 2.º tiempo', dato: { principal: '41.230', total: '46.000', etiqueta: 'ingresados' }, alertas: 0, estados: { nueva: 0, atencion: 1, cerrada: 3 } },
      { id: 'e3', estado: 'proximo', fecha: '2026-09-29', dia: 'Mañana · martes 29 de septiembre', hora: '20:00', partido: 'Millonarios vs. América', competicion: 'Liga profesional · fecha 12', escenario: 'Estadio El Campín', ciudad: 'Bogotá', foto: 'campin', nota: 'Puertas abren 17:30', dato: { principal: '28.400', total: '36.000', etiqueta: 'boletas emitidas', resto: '12 ventas bloqueadas' } },
      { id: 'e4', estado: 'proximo', fecha: '2026-10-03', dia: 'Sábado 3 de octubre', hora: '16:00', partido: 'América vs. Once Caldas', competicion: 'Liga profesional · fecha 13', escenario: 'Estadio Olímpico Pascual Guerrero', ciudad: 'Cali', foto: 'pascual-guerrero', nota: 'Sin hinchada visitante', dato: { principal: '14.020', total: '36.000', etiqueta: 'boletas emitidas', resto: '3 ventas bloqueadas' } },
      { id: 'e5', estado: 'proximo', fecha: '2026-10-03', dia: 'Sábado 3 de octubre', hora: '18:30', partido: 'Real Cartagena vs. Unión Magdalena', competicion: 'Torneo de ascenso · fecha 9', escenario: 'Estadio Jaime Morón', ciudad: 'Cartagena', foto: 'jaime-moron', nota: 'Venta abierta', dato: { principal: '9.310', total: '16.000', etiqueta: 'boletas emitidas', resto: '1 venta bloqueada' } },
      { id: 'e6', estado: 'pasado', fecha: '2026-09-27', dia: 'Ayer · domingo 27 de septiembre', hora: '17:00', partido: 'Medellín vs. Junior', competicion: 'Liga profesional · fecha 11', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', foto: 'atanasio', nota: 'Finalizado', dato: { principal: '35.102', total: '38.000', etiqueta: 'asistentes', resto: '3 rojos · alertas cerradas' } },
      { id: 'e7', estado: 'pasado', fecha: '2026-09-26', dia: 'Sábado 26 de septiembre', hora: '19:30', partido: 'Santa Fe vs. Nacional', competicion: 'Liga profesional · fecha 11', escenario: 'Estadio El Campín', ciudad: 'Bogotá', foto: 'campin', nota: 'Finalizado', dato: { principal: '29.880', total: '36.000', etiqueta: 'asistentes', resto: '5 rojos · alertas cerradas' } }
    ],
    // Tablero del evento: la primera pantalla de la Policía, antes del perfil.
    tablero: {
      aforo: 38000, ingresados: 4812, porMinuto: 186, pico: '190 a las 18:30', avisos: 23,
      flujo: [6, 9, 12, 18, 26, 35, 47, 60, 76, 94, 112, 131, 148, 163, 175, 183, 188, 190, 186, 186],
      puertas: [
        { nombre: 'Puerta 1 · Norte', flujo: 34, ing: 812, avisos: 4, rojos: 1 },
        { nombre: 'Puerta 2 · Norte', flujo: 22, ing: 640, avisos: 3, rojos: 1 },
        { nombre: 'Puerta 3 · Occidental', flujo: 20, ing: 588, avisos: 2, rojos: 0 },
        { nombre: 'Puerta 4 · Oriental', flujo: 28, ing: 701, avisos: 5, rojos: 1 },
        { nombre: 'Puerta 5 · Oriental', flujo: 26, ing: 624, avisos: 3, rojos: 0 },
        { nombre: 'Puerta 6 · Sur', flujo: 19, ing: 512, avisos: 2, rojos: 1 },
        { nombre: 'Puerta 7 · Sur', flujo: 0, ing: 455, avisos: 1, rojos: 0, off: true },
        { nombre: 'Puerta 8 · Occidental', flujo: 37, ing: 480, avisos: 3, rojos: 1 }
      ],
      alertas: [
        { id: 'a1', estado: 'nueva', puerta: 'Puerta 4 · Oriental', hora: '18:42', doc: 'CC •••• 4447', causa: 'Medida vigente', origen: 'Lectura en puerta',
          pasos: [{ hora: '18:42', texto: 'Generada en la puerta', quien: 'Op. L. Mejía' }] },
        { id: 'a2', estado: 'nueva', puerta: 'Puerta 6 · Sur', hora: '18:40', doc: 'CC •••• 9013', causa: 'Boleta falsa', origen: 'Llamado del operador',
          pasos: [{ hora: '18:40', texto: 'El operador llamó a la Policía', quien: 'Op. D. Salazar' }] },
        { id: 'a3', estado: 'atencion', puerta: 'Puerta 2 · Norte', hora: '18:31', doc: 'CC •••• 2208', causa: 'Medida vigente', origen: 'Lectura en puerta',
          pasos: [{ hora: '18:31', texto: 'Generada en la puerta', quien: 'Op. J. Ríos' }, { hora: '18:31', texto: 'Asignada a Pt. M. Castaño', quien: 'Pt. R. Gómez' }, { hora: '18:32', texto: 'Tomada', quien: 'Pt. M. Castaño' }, { hora: '18:35', texto: 'En la puerta con la persona', quien: 'Pt. M. Castaño' }] },
        { id: 'a4', estado: 'cerrada', puerta: 'Puerta 1 · Norte', hora: '18:05', doc: 'CC •••• 7730', causa: 'Medida vigente', origen: 'Lectura en puerta', resultado: 'Conducido',
          pasos: [{ hora: '18:05', texto: 'Generada en la puerta', quien: 'Op. A. Rueda' }, { hora: '18:05', texto: 'Asignada a Pt. A. Duarte', quien: 'Pt. R. Gómez' }, { hora: '18:06', texto: 'Tomada', quien: 'Pt. A. Duarte' }, { hora: '18:14', texto: 'Cerrada · Conducido', quien: 'Pt. A. Duarte' }] },
        { id: 'a5', estado: 'cerrada', puerta: 'Puerta 8 · Occidental', hora: '17:48', doc: 'CC •••• 5561', causa: 'Boleta falsa', origen: 'Llamado del operador', resultado: 'No encontrado',
          pasos: [{ hora: '17:48', texto: 'El operador llamó a la Policía', quien: 'Op. M. Cano' }, { hora: '17:49', texto: 'Tomada', quien: 'Sub. C. Pérez' }, { hora: '17:57', texto: 'Cerrada · No encontrado', quien: 'Sub. C. Pérez' }] }
      ]
    },
    // Agentes de la jurisdicción para asignar una alerta: el puesto dice qué tan cerca está de la puerta.
    agentes: [
      { id: 'g1', foto: 'assets/agentes/g1.jpg', nombre: 'Pt. J. Marín', puesto: 'Puerta 4 · Oriental' },
      { id: 'g2', foto: 'assets/agentes/g2.jpg', nombre: 'Pt. L. Vargas', puesto: 'Puerta 5 · Oriental' },
      { id: 'g3', foto: 'assets/agentes/g3.jpg', nombre: 'Sub. E. Molina', puesto: 'Puerta 6 · Sur' },
      { id: 'g4', foto: 'assets/agentes/g4.jpg', nombre: 'Pt. D. Rincón', puesto: 'Puerta 3 · Occidental' },
      { id: 'g5', foto: 'assets/agentes/g5.jpg', nombre: 'Pt. A. Duarte', puesto: 'Puerta 1 · Norte' },
      { id: 'g6', foto: 'assets/agentes/g6.jpg', nombre: 'Sub. C. Pérez', puesto: 'Puerta 8 · Occidental' },
      { id: 'g7', nombre: 'Pt. M. Castaño', puesto: 'Puerta 2 · Norte', ocupado: 'Atendiendo la alerta de Puerta 2 · Norte' },
      { id: 'g8', nombre: 'Pt. H. Londoño', puesto: 'Puerta 7 · Sur' },
      { id: 'g9', nombre: 'Pt. S. Ramírez', puesto: 'Puerta 3 · Occidental' }
    ],
    persona: 'Julián Andrés Posada', doc: 'CC 71.894.447', puerta: 'Puerta 4 · Oriental', hora: '18:42',
    // Auditoría (superficie 3): mismos hechos que las alertas del tablero, más ventas, lecturas y consultas.
    auditoria: {
      total: 5117, porPagina: 25, fecha: '28 sep 2026', evento: 'Nacional vs. Medellín · 28 sep',
      registros: [
        { hora: '18:43', tipo: 'consulta', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 4447', origen: 'Vista policial', detalle: 'Abrió el perfil desde la alerta', quien: 'Pt. R. Gómez' },
        { hora: '18:42', tipo: 'medida', puerta: 'Puerta 4 · Oriental', doc: 'CC •••• 4447', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. L. Mejía' },
        { hora: '18:41', tipo: 'verde', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 2117', origen: 'Lectura en puerta', detalle: 'Entró · Oriental Baja, fila E', quien: 'Op. A. Rueda' },
        { hora: '18:40', tipo: 'operativo', puerta: 'Puerta 6 · Sur', doc: 'CC •••• 9013', origen: 'Lectura en puerta', detalle: 'Boleta falsa · llamó a la Policía', quien: 'Op. D. Salazar' },
        { hora: '18:39', tipo: 'amarillo', puerta: 'Puerta 5 · Oriental', doc: 'CC •••• 6583', origen: 'Lectura en puerta', detalle: 'Entró con aviso · veto levantado', quien: 'Op. S. León' },
        { hora: '18:37', tipo: 'operativo', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 7702', origen: 'Lectura en puerta', detalle: 'Boleta ya usada · no llamó a la Policía', quien: 'Op. J. Ríos' },
        { hora: '18:35', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista policial', detalle: 'En la puerta con la persona', quien: 'Pt. M. Castaño' },
        { hora: '18:32', tipo: 'consulta', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista policial', detalle: 'Abrió el perfil desde la alerta', quien: 'Pt. R. Gómez' },
        { hora: '18:32', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista policial', detalle: 'Alerta tomada', quien: 'Pt. M. Castaño' },
        { hora: '18:31', tipo: 'policia', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Vista policial', detalle: 'Alerta asignada a Pt. M. Castaño', quien: 'Pt. R. Gómez' },
        { hora: '18:31', tipo: 'medida', puerta: 'Puerta 2 · Norte', doc: 'CC •••• 2208', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. J. Ríos' },
        { hora: '18:14', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista policial', detalle: 'Alerta cerrada · Conducido', quien: 'Pt. A. Duarte' },
        { hora: '18:06', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista policial', detalle: 'Alerta tomada', quien: 'Pt. A. Duarte' },
        { hora: '18:05', tipo: 'policia', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Vista policial', detalle: 'Alerta asignada a Pt. A. Duarte', quien: 'Pt. R. Gómez' },
        { hora: '18:05', tipo: 'medida', puerta: 'Puerta 1 · Norte', doc: 'CC •••• 7730', origen: 'Lectura en puerta', detalle: 'No entró · alerta al PMU', quien: 'Op. A. Rueda' },
        { hora: '17:57', tipo: 'policia', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Vista policial', detalle: 'Alerta cerrada · No encontrado', quien: 'Sub. C. Pérez' },
        { hora: '17:49', tipo: 'policia', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Vista policial', detalle: 'Alerta tomada', quien: 'Sub. C. Pérez' },
        { hora: '17:48', tipo: 'operativo', puerta: 'Puerta 8 · Occidental', doc: 'CC •••• 5561', origen: 'Lectura en puerta', detalle: 'Boleta falsa · llamó a la Policía', quien: 'Op. M. Cano' },
        { hora: '16:22', tipo: 'venta', puerta: '—', doc: 'CC •••• 6583', origen: 'Comercializadora A', detalle: 'Venta autorizada · con aviso', quien: 'Canal web' },
        { hora: '15:08', tipo: 'venta', puerta: '—', doc: 'CC •••• 4447', origen: 'Comercializadora B', detalle: 'Venta bloqueada · medida vigente', quien: 'Canal web' },
        { hora: '14:51', tipo: 'venta', puerta: '—', doc: 'CC •••• 2117', origen: 'Comercializadora A', detalle: 'Venta autorizada', quien: 'Canal web' },
        { hora: '12:30', tipo: 'venta', puerta: '—', doc: 'CC •••• 4447', origen: 'Comercializadora A', detalle: 'Venta bloqueada · medida vigente', quien: 'Taquilla oficial' }
      ]
    },
    medidas: [
      { estado: 'Vigente', tema: 'negative', titulo: 'Agresión física (art. 98, a)', sub: 'Resolución de la Inspección 14 · vence 31 may 2027 · 245 días' },
      { estado: 'Cumplida', tema: 'neutral', titulo: 'Ingresar bebidas alcohólicas (art. 97, 6)', sub: 'Acta de audiencia · cumplida el 3 sep 2025' }
    ],
    senales: [
      { l: 'Club afín', v: 'Atlético Nacional · 86 %', por: '14 de 16 partidos en tribuna local.', decide: true },
      { l: 'Tribuna habitual', v: 'Sur', por: '11 de 16 ingresos por la tribuna Sur.' },
      { l: 'Frecuencia', v: '16 partidos en 6 meses', por: 'Ingresos reales registrados en la puerta.' },
      { l: 'Viajes de visitante', v: '3', por: 'Ingresos en escenarios de otras ciudades.' },
      { l: 'Con quién va', v: '2 personas que han tenido medidas', por: 'Comparten boletas del mismo propietario.' },
      { l: 'Intentos fallidos', v: '1 hoy', por: 'Puerta 4 · Oriental, 18:42.' }
    ]
  },

  // Superficie 1 · Registro de medidas. Fechas en ISO: el fin y el estado se calculan en apps/medidas.js.
  ivc: {
    usuario: { nombre: 'Carolina Vélez Ortiz', cargo: 'Profesional del IVC · Mindeporte' },
    hoy: '2026-09-29',
    medidas: [
      { id: 'MC-2025-0831', persona: 'p1', nombre: 'Julián Andrés Posada', doc: 'CC 71.894.447', conductas: ['Agresión física (art. 98, a)'], agravantes: ['Actuar bajo efectos de sustancias'],
        evento: 'Nacional vs. Medellín · Estadio Atanasio Girardot', hechos: '2025-10-19', competicion: 'Liga profesional de fútbol · 2025-II',
        acto: 'Resolución 0457 de 2025', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0457/2025 · Inspección 14',
        ejecutoria: '2025-11-30', meses: 18, multa: '$ 1.423.500', nacimiento: '1994-07-12', residencia: 'Bello, Antioquia', contacto: '300 •••• 4471',
        descripcion: 'Agredió a otro aficionado en la tribuna Oriental Baja durante el segundo tiempo. La logística lo retuvo y lo entregó a la Policía.',
        radicada: '2025-12-04', entrada: '2025-E-041872', respuesta: '2025-S-038110', financiera: '2025-F-006204', juridica: '2025-J-003391',
        extra: [
          { fecha: '11 dic 2025', texto: 'Radicado de financiera 2025-F-006204 agregado · soporte: oficio', quien: 'Jaime Pardo Ruiz', punto: 'azul' },
          { fecha: '28 sep 2026', texto: 'Bloqueó el ingreso en Puerta 4 · Oriental (Nacional vs. Medellín)', quien: 'SVN · Op. L. Mejía', punto: 'rojo' }
        ] },
      { id: 'MC-2025-0214', persona: 'p1', nombre: 'Julián Andrés Posada', doc: 'CC 71.894.447', conductas: ['Ingresar bebidas alcohólicas (art. 97, 6)'],
        evento: 'Medellín vs. Once Caldas · Estadio Atanasio Girardot', hechos: '2025-02-09', competicion: 'Liga profesional de fútbol · 2025-I',
        acto: 'Resolución 0098 de 2025', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0098/2025 · Inspección 14',
        ejecutoria: '2025-03-02', meses: 6, nacimiento: '1994-07-12', residencia: 'Bello, Antioquia', contacto: '300 •••• 4471',
        descripcion: 'Ingresó bebidas alcohólicas a la tribuna Sur; se le encontraron en la segunda requisa.', radicada: '2025-03-10', entrada: '2025-E-009318' },
      { id: 'MC-2025-0377', persona: 'p2', nombre: 'Brayan Stiven Ospina Mesa', doc: 'CC 1.036.482.119', conductas: ['Invadir el terreno de juego (art. 97, 4)'],
        evento: 'Envigado vs. Nacional · Estadio Polideportivo Sur', hechos: '2025-03-16', ciudad: 'Envigado, Antioquia', competicion: 'Liga profesional de fútbol · 2025-I',
        acto: 'Resolución 0212 de 2025', autoridad: 'Inspección de Policía 3 de Envigado', corta: 'Res. 0212/2025 · Inspección 3 Envigado',
        ejecutoria: '2025-04-18', meses: 18, nacimiento: '2001-05-03', residencia: 'Envigado, Antioquia', radicada: '2025-04-25', entrada: '2025-E-015540' },
      { id: 'MC-2026-0802', persona: 'p3', nombre: 'Samuel David Rendón Hoyos', iniciales: 'S. D. R. H.', doc: 'TI 1.021.774.331', docMask: 'TI •••• 4331', menor: true,
        conductas: ['Daño a infraestructura (art. 98, c)'], evento: 'Nacional vs. Medellín · Estadio Atanasio Girardot', hechos: '2026-07-12', competicion: 'Liga profesional de fútbol · 2026-I',
        acto: 'Resolución 0371 de 2026', autoridad: 'Inspección de Policía 5 de Medellín', corta: 'Res. 0371/2026 · Inspección 5',
        ejecutoria: '2026-08-14', meses: 6, multa: 'Sin multa', nacimiento: '2010-02-02', residencia: 'Bello, Antioquia', contacto: '301 •••• 219',
        descripcion: 'Arrancó dos sillas de la tribuna Norte al final del partido.', radicada: '2026-08-21', entrada: '2026-E-033905',
        rep: [{ k: 'Nombre', v: 'Gloria Patricia Hoyos Marín' }, { k: 'Documento', v: 'CC 43.512.876' }, { k: 'Parentesco', v: 'Madre' }, { k: 'Teléfono', v: '312 •••• 407' }] },
      { id: 'MC-2026-0877', persona: 'p4', nombre: 'Andrés Felipe Cardona Ruiz', doc: 'CC 1.017.225.804', conductas: ['Violencia contra la fuerza pública (art. 97, 3)'], agravantes: ['Actuar bajo efectos de sustancias'],
        evento: 'Medellín vs. Millonarios · Estadio Atanasio Girardot', hechos: '2026-08-03', competicion: 'Liga profesional de fútbol · 2026-II',
        acto: 'Resolución 0388 de 2026', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0388/2026 · Inspección 14',
        ejecutoria: '2026-09-08', meses: 23, multa: '$ 2.135.250', nacimiento: '1990-11-21', radicada: '2026-09-15', entrada: '2026-E-036114' },
      { id: 'MC-2025-0520', persona: 'p5', nombre: 'Luis Carlos Mejía Henao', doc: 'CC 98.765.310', conductas: ['Estupefacientes (art. 97, 2)'],
        evento: 'Nacional vs. Junior · Estadio Atanasio Girardot', hechos: '2025-04-20', competicion: 'Liga profesional de fútbol · 2025-I',
        acto: 'Resolución 0301 de 2025', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0301/2025 · Inspección 14',
        ejecutoria: '2025-07-11', meses: 6, nacimiento: '1987-01-08', radicada: '2025-07-18', entrada: '2025-E-024417' },
      { id: 'MC-2025-0611', persona: 'p6', nombre: 'Daniela Restrepo Gil', doc: 'CE 4.518.227', sexo: 'Mujer', conductas: ['Agresión verbal (art. 98, b)'],
        evento: 'Medellín vs. América · Estadio Atanasio Girardot', hechos: '2025-08-24', competicion: 'Liga profesional de fútbol · 2025-II',
        acto: 'Resolución 0512 de 2025', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0512/2025 · Inspección 14',
        ejecutoria: '2025-10-05', meses: 12, nacimiento: '1996-09-17', radicada: '2025-10-14', entrada: '2025-E-037702' },
      { id: 'MC-2026-0145', persona: 'p7', nombre: 'Kevin Alejandro Zapata Londoño', doc: 'CC 1.152.009.873', conductas: ['Armas u objetos peligrosos (art. 97, 1)'],
        evento: 'Nacional vs. Medellín · Estadio Atanasio Girardot', hechos: '2026-02-01', competicion: 'Liga profesional de fútbol · 2026-I',
        acto: 'Resolución 0077 de 2026', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0077/2026 · Inspección 14',
        ejecutoria: '2026-03-22', meses: 36, multa: '$ 2.847.000', nacimiento: '1999-08-30', radicada: '2026-03-30', entrada: '2026-E-011290' },
      { id: 'MC-2025-0702', persona: 'p8', nombre: 'Tomás Esteban Arango Vélez', iniciales: 'T. E. A. V.', doc: 'TI 1.013.556.045', docMask: 'TI •••• 6045', menor: true,
        conductas: ['Invadir el terreno de juego (art. 97, 4)'], evento: 'Nacional vs. Pereira · Estadio Atanasio Girardot', hechos: '2025-11-09', competicion: 'Liga profesional de fútbol · 2025-II',
        acto: 'Resolución 0610 de 2025', autoridad: 'Inspección de Policía 5 de Medellín', corta: 'Res. 0610/2025 · Inspección 5',
        ejecutoria: '2025-12-29', meses: 6, multa: 'Sin multa', nacimiento: '2009-05-14', radicada: '2026-01-08', entrada: '2026-E-000884',
        rep: [{ k: 'Nombre', v: 'Hernán Darío Arango Ríos' }, { k: 'Documento', v: 'CC 70.118.942' }, { k: 'Parentesco', v: 'Padre' }, { k: 'Teléfono', v: '310 •••• 655' }] },
      { id: 'MC-2025-0409', persona: 'p9', nombre: 'Sebastián Muñoz Arango', doc: 'PPT 5.882.104', conductas: ['Desatender a la logística en ubicación y tránsito (art. 97, 5)'],
        evento: 'Medellín vs. Santa Fe · Estadio Atanasio Girardot', hechos: '2025-05-04', competicion: 'Liga profesional de fútbol · 2025-I',
        acto: 'Resolución 0266 de 2025', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0266/2025 · Inspección 14',
        ejecutoria: '2025-03-31', meses: 12, nacimiento: '1993-12-02', radicada: '2025-04-07', entrada: '2025-E-012076' },
      { id: 'MC-2026-0529', persona: 'p10', nombre: 'Jhon Fredy Ríos Castaño', doc: 'CC 71.230.558', conductas: ['Agresión física (art. 98, a)'],
        evento: 'Nacional vs. Cali · Estadio Atanasio Girardot', hechos: '2026-03-15',
        acto: 'Resolución 0190 de 2026', autoridad: 'Inspección de Policía 14 de Medellín', corta: 'Res. 0190/2026 · Inspección 14',
        ejecutoria: '2026-07-02', meses: 6, multa: '$ 1.423.500', nacimiento: '1978-06-06', radicada: '2026-07-09', entrada: '2026-E-026503' }
    ],
    reportes: [
      { id: 'R-2026-0431', iso: '2026-09-29', fecha: '29 sep · 08:12', estado: 'enviado', entidad: 'Atlético Nacional', nombre: 'Mateo Giraldo Uribe', doc: 'CC 1.040.338.912',
        evento: 'Nacional vs. Medellín · 28 sep 2026 · Estadio Atanasio Girardot', corto: 'Nacional vs. Medellín · 28 sep', hechos: '28 sep 2026', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Invadir el terreno de juego (art. 97, 4)'], evid: { vid: true, fot: 3 }, descripcion: 'Saltó la malla de la tribuna Sur al minuto 88 y corrió hacia el arco. La logística lo retuvo en la pista atlética.',
        historial: [{ fecha: '29 sep 2026', texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }] },
      { id: 'R-2026-0430', iso: '2026-09-29', fecha: '29 sep · 07:40', estado: 'enviado', entidad: 'Independiente Medellín', nombre: 'Juan Esteban Toro Mesa', doc: 'CC 1.128.450.667',
        evento: 'Nacional vs. Medellín · 28 sep 2026 · Estadio Atanasio Girardot', corto: 'Nacional vs. Medellín · 28 sep', hechos: '28 sep 2026', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Ingresar bebidas alcohólicas (art. 97, 6)', 'Desatender a la logística (art. 97, 5)'], evid: { fot: 2 }, descripcion: 'Ingresó licor en la Puerta 5 · Oriental y se negó a ubicarse en su sector cuando la logística se lo pidió.',
        historial: [{ fecha: '29 sep 2026', texto: 'Enviado por la entidad', quien: 'Independiente Medellín · Seguridad', punto: 'azul' }] },
      { id: 'R-2026-0418', iso: '2026-09-22', fecha: '22 sep · 16:05', estado: 'recibido', entidad: 'Atlético Nacional', nombre: 'Cristian Camilo Bedoya Arias', doc: 'CC 1.001.225.390',
        evento: 'Nacional vs. Junior · 20 sep 2026 · Estadio Atanasio Girardot', corto: 'Nacional vs. Junior · 20 sep', hechos: '20 sep 2026', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Agresión verbal (art. 98, b)'], evid: { fot: 1 }, descripcion: 'Insultos reiterados a un integrante de la logística en la Puerta 2 · Norte.',
        historial: [{ fecha: '22 sep 2026', texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: '23 sep 2026', texto: 'Recibido por el IVC', quien: 'Jaime Pardo Ruiz', punto: 'gris' }] },
      { id: 'R-2026-0412', iso: '2026-08-05', fecha: '5 ago · 11:30', estado: 'tramite', entidad: 'Independiente Medellín', nombre: 'Andrés Felipe Cardona Ruiz', doc: 'CC 1.017.225.804',
        evento: 'Medellín vs. Millonarios · 3 ago 2026 · Estadio Atanasio Girardot', corto: 'Medellín vs. Millonarios · 3 ago', hechos: '3 ago 2026', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Violencia contra la fuerza pública (art. 97, 3)'], evid: { vid: true, fot: 4 }, candidatas: ['MC-2026-0877'], descripcion: 'Empujó y golpeó a un patrullero en la salida de la tribuna Occidental. Según la logística, estaba bajo efectos de alcohol.',
        historial: [{ fecha: '5 ago 2026', texto: 'Enviado por la entidad', quien: 'Independiente Medellín · Seguridad', punto: 'azul' }, { fecha: '6 ago 2026', texto: 'Recibido por el IVC', quien: 'Carolina Vélez Ortiz', punto: 'gris' }, { fecha: '12 ago 2026', texto: 'La autoridad abrió procedimiento · oficio 2026-E-031778', quien: 'Carolina Vélez Ortiz', punto: 'amarillo' }] },
      { id: 'R-2026-0405', iso: '2026-08-11', fecha: '11 ago · 09:18', estado: 'tramite', entidad: 'Atlético Nacional', nombre: 'Yeison Darío Montoya Cano', doc: 'CC 1.036.901.558',
        evento: 'Nacional vs. Pereira · 10 ago 2026 · Estadio Atanasio Girardot', corto: 'Nacional vs. Pereira · 10 ago', hechos: '10 ago 2026', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Armas u objetos peligrosos (art. 97, 1)'], evid: { fot: 2 }, descripcion: 'En la requisa de la Puerta 6 · Sur se le encontró un arma cortopunzante.',
        historial: [{ fecha: '11 ago 2026', texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: '11 ago 2026', texto: 'Recibido por el IVC', quien: 'Jaime Pardo Ruiz', punto: 'gris' }, { fecha: '19 ago 2026', texto: 'La autoridad abrió procedimiento · oficio 2026-E-032410', quien: 'Jaime Pardo Ruiz', punto: 'amarillo' }] },
      { id: 'R-2025-0288', iso: '2025-10-20', fecha: '20 oct 2025', estado: 'derivo', medida: 'MC-2025-0831', entidad: 'Atlético Nacional', nombre: 'Julián Andrés Posada', doc: 'CC 71.894.447',
        evento: 'Nacional vs. Medellín · 19 oct 2025 · Estadio Atanasio Girardot', corto: 'Nacional vs. Medellín · 19 oct 2025', hechos: '19 oct 2025', autoridad: 'Inspección de Policía 14 de Medellín',
        conductas: ['Agresión física (art. 98, a)'], evid: { vid: true, fot: 2 }, descripcion: 'Agredió a otro aficionado en la tribuna Oriental Baja durante el segundo tiempo.',
        historial: [{ fecha: '20 oct 2025', texto: 'Enviado por la entidad', quien: 'Atlético Nacional · Jefe de logística', punto: 'azul' }, { fecha: '21 oct 2025', texto: 'Recibido por el IVC', quien: 'Carolina Vélez Ortiz', punto: 'gris' }, { fecha: '28 oct 2025', texto: 'La autoridad abrió procedimiento', quien: 'Carolina Vélez Ortiz', punto: 'amarillo' }, { fecha: '4 dic 2025', texto: 'Derivó en la medida MC-2025-0831', quien: 'Carolina Vélez Ortiz', punto: 'rojo' }] },
      { id: 'R-2026-0379', iso: '2026-07-27', fecha: '27 jul · 14:52', estado: 'archivado', motivoArchivo: 'La autoridad no abrió procedimiento', notaArchivo: 'Oficio de la Inspección de Policía 9 de Bogotá, radicado 2026-E-029904.', entidad: 'Millonarios', nombre: 'Óscar Iván Rincón Pulido', doc: 'CC 80.556.214',
        evento: 'Millonarios vs. Nacional · 26 jul 2026 · Estadio El Campín', corto: 'Millonarios vs. Nacional · 26 jul', hechos: '26 jul 2026', autoridad: 'Inspección de Policía 9 de Bogotá',
        conductas: ['Agresión física (art. 98, a)'], evid: { fot: 0 }, descripcion: 'Riña en la tribuna Norte; el informe no identifica quién inició la agresión.',
        historial: [{ fecha: '27 jul 2026', texto: 'Enviado por la entidad', quien: 'Millonarios · Seguridad', punto: 'azul' }, { fecha: '28 jul 2026', texto: 'Recibido por el IVC', quien: 'Natalia Suárez Pineda', punto: 'gris' }, { fecha: '2 sep 2026', texto: 'Archivado · la autoridad no abrió procedimiento', quien: 'Natalia Suárez Pineda', punto: 'gris' }] }
    ]
  },
  // Superficie 4 · Backoffice de eventos. Fechas y horas alineadas con `policia.eventos`.
  backoffice: {
    hoy: '2026-09-28',
    usuario: { nombre: 'Laura Cárdenas Mejía', cargo: 'Organizadora' },
    competencias: ['Liga profesional 2026-II', 'Torneo de ascenso 2026-II', 'Copa nacional 2026'],
    escenarios: [
      { nombre: 'Estadio Atanasio Girardot', ciudad: 'Medellín', aforo: '38.000' },
      { nombre: 'Estadio Metropolitano', ciudad: 'Barranquilla', aforo: '46.692' },
      { nombre: 'Estadio El Campín', ciudad: 'Bogotá', aforo: '36.343' },
      { nombre: 'Estadio Pascual Guerrero', ciudad: 'Cali', aforo: '35.405' },
      { nombre: 'Estadio Jaime Morón', ciudad: 'Cartagena', aforo: '16.068' }
    ],
    // Base física del escenario: cada evento la toma y la ajusta en su configuración.
    escenario: {
      nombre: 'Estadio Atanasio Girardot', ciudad: 'Medellín', modificado: '26 sep 2026, 10:14 · J. Restrepo',
      sectores: [
        { id: 'norte', nombre: 'Norte', tipo: 'libre', aforo: 8500, filas: '' },
        { id: 'occ', nombre: 'Occidental', tipo: 'num', aforo: 9200, filas: 'Filas A a T' },
        { id: 'ori', nombre: 'Oriental', tipo: 'num', aforo: 11800, filas: 'Filas A a Y' },
        { id: 'sur', nombre: 'Sur', tipo: 'libre', aforo: 8500, filas: '' }
      ],
      puertas: [{ n: 1, sector: 'norte' }, { n: 2, sector: 'norte' }, { n: 3, sector: 'occ' }, { n: 8, sector: 'occ' }, { n: 4, sector: 'ori' }, { n: 5, sector: 'ori' }, { n: 6, sector: 'sur' }, { n: 7, sector: 'sur' }],
      dispositivos: [
        { id: 'DSP-0101', tipo: 'Torniquete con lector', puerta: 1, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0102', tipo: 'Celular de operador', puerta: 1, estado: 'linea', senal: '16:07' },
        { id: 'DSP-0201', tipo: 'Torniquete con lector', puerta: 2, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0301', tipo: 'Torniquete con lector', puerta: 3, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0401', tipo: 'Torniquete con lector', puerta: 4, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0402', tipo: 'Tablet de operador', puerta: 4, estado: 'linea', senal: '16:06' },
        { id: 'DSP-0501', tipo: 'Torniquete con lector', puerta: 5, estado: 'paquete', senal: '16:05' },
        { id: 'DSP-0601', tipo: 'Torniquete con lector', puerta: 6, estado: 'linea', senal: '16:08' },
        { id: 'DSP-0701', tipo: 'Tablet de operador', puerta: 7, estado: 'sinred', senal: '15:42' },
        { id: 'DSP-0901', tipo: 'Celular de operador', puerta: 0, estado: 'libre', senal: '16:02' }
      ]
    },
    // `hora` es la del partido; `apertura`, la de las puertas. `sinVis`: partido sin hinchada visitante.
    eventos: [
      { id: 'e1', codigo: 'EV-2026-0412', nombre: 'Nacional vs. Medellín', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Atanasio Girardot', ciudad: 'Medellín', fecha: '2026-09-28', apertura: '16:00', estado: 'publicado', aforo: '38.000', pub: 'Publicado el 12 sep 2026', partidos: [{ local: 'Nacional', visita: 'Medellín', hora: '19:00', sinVis: false }] },
      { id: 'e2', codigo: 'EV-2026-0410', nombre: 'Junior vs. Santa Fe', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Metropolitano', ciudad: 'Barranquilla', fecha: '2026-09-28', apertura: '15:00', estado: 'curso', aforo: '46.692', pub: 'Publicado el 9 sep 2026', partidos: [{ local: 'Junior', visita: 'Santa Fe', hora: '18:00', sinVis: false }] },
      { id: 'e3', codigo: 'EV-2026-0409', nombre: 'Millonarios vs. América', competencia: 'Liga profesional 2026-II', escenario: 'Estadio El Campín', ciudad: 'Bogotá', fecha: '2026-09-29', apertura: '17:30', estado: 'publicado', aforo: '36.343', pub: 'Publicado el 14 sep 2026', partidos: [{ local: 'Millonarios', visita: 'América', hora: '20:00', sinVis: false }] },
      { id: 'e4', codigo: 'EV-2026-0431', nombre: 'América vs. Once Caldas', competencia: 'Liga profesional 2026-II', escenario: 'Estadio Pascual Guerrero', ciudad: 'Cali', fecha: '2026-10-03', apertura: '13:00', estado: 'borrador', aforo: '35.405', pub: '', partidos: [{ local: 'América', visita: 'Once Caldas', hora: '16:00', sinVis: true }] },
      { id: 'e5', codigo: 'EV-2026-0388', nombre: 'Santa Fe vs. Nacional', competencia: 'Liga profesional 2026-II', escenario: 'Estadio El Campín', ciudad: 'Bogotá', fecha: '2026-09-26', apertura: '16:30', estado: 'cerrado', aforo: '36.343', pub: 'Publicado el 8 sep 2026', partidos: [{ local: 'Santa Fe', visita: 'Nacional', hora: '19:30', sinVis: false }] }
    ]
  }
};
