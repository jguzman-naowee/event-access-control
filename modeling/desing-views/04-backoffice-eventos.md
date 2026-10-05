# 4 · Backoffice de eventos *(nueva)*

## La superficie

| | |
|---|---|
| **Quién** | Club u organizador; administrador del escenario |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Semanas y días antes del evento; horas antes para dejar cada puerta lista |
| **Módulos** | 3 · Escenarios y eventos; 4 · Boletería (cupos y plazo); 5 · Control de acceso (dispositivos) |
| **Pregunta que responde** | ¿Está todo configurado para que cada puerta sepa qué partido valida? |

**Prototipo:** `prototype/svn/apps/backoffice.js` (ruta `#/backoffice`, escritorio y tablet): las cinco pestañas se registran en `BACKOFFICE`; Escenario y Evento y partidos en `backoffice.js`, el resto en `backoffice-evento.js`.

**Paso del flujo:** 1

En el demo no existe: los partidos vienen sembrados y el partido de cada puerta se elige a mano en la
puerta. Esta superficie es la que le quita esa decisión al operador.

## Pantallas

| Pantalla | Rol | Para qué | Contenido clave |
|---|---|---|---|
| **Escenario** | Administrador del escenario | La base física, que se reusa | Sectores (numerado o aforo libre), puertas (cada una de un solo sector), puestos, dispositivos |
| **Evento y partidos** | Club u organizador | Crear el evento dentro de su competencia | Competencia, evento, partidos, fecha y hora, escenario |
| **Configuración del evento** | Club u organizador | Ajustar el escenario para este evento | Por sector: habilitado, visitante, cerrado, aforo reducido · por puerta: abierta o cerrada, horario, **partido de su torniquete** · por silla: bloqueada con motivo · plazo de asignación · sin hinchada visitante |
| **Cupos** | Club u organizador | Repartir el inventario | Cupo por comercializadora homologada (solo aparecen las homologadas) |
| **Listo para abrir** | Club, supervisor | Verificar antes de abrir puertas | Lista de chequeo: puertas con dispositivo asignado, paquete sin conexión descargado, plazo vencido |

## Estados

- **Evento** *(decisión de producto)*: borrador → publicado → en curso → cerrado.
- **Plazo de asignación**: abierto → vencido (las boletas sin titular se pierden).
- **Puerta**: abierta · cerrada; dispositivo en línea · sin conexión · sin paquete.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Club u organizador | Sus eventos, en sus escenarios |
| Administrador del escenario | Su escenario, para cualquier evento |
| Mindeporte | Lectura de todos |

*(decisión de producto, 29-sep-2026)* **Header en barra mínima, herramientas en la tabla** (propuesta B, la misma de Medidas). La barra queda en una fila baja: marca, *Backoffice de eventos* y el usuario en una línea. Las cinco pestañas bajan y son el título de la vista, con la acción principal a la derecha (*Agregar sector*, *Crear evento*, *Guardar configuración*…). El contexto del evento (nombre, estado, escenario, fecha, aforo, *Cambiar de evento*) es una línea de texto bajo las pestañas, no otra barra; Escenario y Evento y partidos no la llevan porque ya eligen o describen lo suyo. Búsqueda y filtros con conteo viven dentro de la tabla o tarjeta. Razón: la barra deja de competir con el contenido y las herramientas quedan pegadas a lo que filtran.

*(decisión de producto, 29-sep-2026)* **Tipo de evento.** Datos del evento suma *Tipo de evento* (Deportivo, Cultural / concierto, Otro); los eventos existentes son Deportivos. **«Sin hinchada visitante» solo aplica a eventos deportivos**: es un interruptor por partido en *Evento y partidos* y el mismo dato del interruptor de Configuración (una sola fuente). En un evento no deportivo ninguno de los dos aparece y Sur no se cierra por ese motivo.

## Reglas que hace cumplir

- **Cada puerta pertenece a un solo sector** y su torniquete se configura para un partido.
- **El plazo de asignación** no puede pasar del inicio del encuentro.
- **Solo comercializadoras homologadas** reciben cupo.
- Nombres del dominio: no reutilizar `venue` ni `zone` de Naowee Suite (`dominio.md` §3).

## Preguntas abiertas

- ¿El escenario lo mantiene el club, la alcaldía o un tercero? Define quién es *administrador del escenario*.
- ¿Se integra con el `venue-ms` existente de Naowee Suite o es un modelo propio del SVN?
