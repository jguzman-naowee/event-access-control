# 5 · Acceso en puerta

## La superficie

| | |
|---|---|
| **Quién** | Operador de puerta; la Policía con vista ampliada |
| **Dispositivo** | Celular o tablet (web móvil), a la intemperie, con una mano; consola de escritorio en el torniquete |
| **Cuándo** | Horas antes y durante el evento |
| **Módulos** | 5 · Control de acceso; 2 · Identidad; 1 · Medidas (solo el resultado) |
| **Pregunta que responde** | ¿Esta persona entra por esta puerta, a este partido, ahora? |

Es la cuarta validación del dominio (*¿Puede entrar?*) y la superficie que más se usa: una lectura
cada pocos segundos, con fila y ruido.

**Prototipo:** [`prototype/svn`](../../prototype/svn/README.md), rutas `#/puerta` y `#/policia`.
**Paso del flujo:** 3

Supuestos que toma: el rojo no muestra el nombre al operador; el verde sí, para cotejarlo con el
documento; la puerta de otro sector no tiene caso todavía; los tiempos de la capa oculta (6 pasos, 1,5 s en total) son ilustrativos, no un compromiso de rendimiento.

## Pantallas

| Pantalla | Rol | Para qué | Contenido clave |
|---|---|---|---|
| **Lectura** | Operador | Leer sin tocar nada | Cámara siempre abierta a pantalla completa; encabezado fijo *Puerta · Partido · Conexión*; *Digitar documento* como plan B; linterna y zoom |
| **Verificación de rostro** | Operador | Confirmar identidad cuando la confianza lo pide | Solo con el módulo biométrico encendido: foto de referencia contra la cámara. Apagado, la pantalla no existe y basta el documento |
| **Resultado** (capa sobre la cámara) | Operador | Saber de un vistazo | Verde *Entra* + *Continuar* · Amarillo *Entra · aviso* + causa + *Continuar* · Rojo operativo *No entra* + causa + *Siguiente* / *Llamar a la Policía* · Rojo por medida *No entra · remitir a Policía* (lo cierra el operador) |
| **Turno** | Operador | Saber cómo va | Ingresos, avisos amarillos, rojos, última sincronización |
| **Eventos** | Policía (otra sesión) | Elegir qué evento seguir | Cards por fecha: en vivo, próximos y pasados, con escenario, ciudad, estado del momento (*puertas abiertas*, *en juego*, *sin hinchada visitante*, *finalizado*) y alertas nuevas; el en vivo abre el tablero, el pasado la auditoría *(decisión de producto, 29-sep-2026)* |
| **Tablero del evento** | Policía (otra sesión) | Ver cómo va el ingreso antes de abrir un perfil | Partido y cuenta al inicio; ingresados, por minuto, avisos y rojos; flujo por puerta; **panel de alertas fijo a la derecha**: nueva → en atención → cerrada, con cada paso (quién la generó, la tomó y la cerró, y con qué resultado). *Ver perfil* abre la vista policial *(decisión de producto, 28-sep-2026)* |
| **Vista policial** | Policía (otra sesión) | Atender un rojo | Medidas vigentes y cumplidas con sus conductas, reincidencia y **datos cruzados**: club afín con su certeza, tribuna habitual, frecuencia, viajes de visitante, si va con personas con medida vigente, intentos fallidos. Cada señal explicable y **sin puntaje único de peligrosidad** |
| **Configuración del dispositivo** | Supervisor | Asignar la puerta y el partido | Solo si el backoffice (4) no lo dejó listo; pide supervisor |

**Por dispositivo:** celular = una columna, resultado como capa; tablet = cámara a la izquierda y
resultado con historial del turno a la derecha; consola de escritorio = lector USB con el foco
siempre en la lectura.

## Estados

- **Semáforo** (`dominio.md` §5): verde · amarillo (medida recién levantada, indicativos cruzados) · rojo operativo (problema de boleta; Policía opcional) · rojo por medida (alerta al PMU).
- **Amarillo**: entra y genera un aviso (causa, puerta, hora) para el supervisor y la vista policial.
- **Decisión del operador** en un rojo operativo: si llamó o no a la Policía, con operador, puerta y hora.
- **Boleta**: asignada → usada.
- **Dispositivo**: en línea · sin conexión (validando con el paquete del evento) · sincronizando.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Operador | El semáforo, la causa del amarillo y el documento que leyó. Nunca hechos ni expediente |
| Policía | El expediente de la persona del rojo, en la vista policial |

## Reglas que hace cumplir

- **Siempre cruzando con el documento**: boleta del partido de ese torniquete, sin medida vigente, no usada, **puerta de su sector**.
- **La puerta no consulta al IVC**: el SVN valida contra su propia base de medidas; el IVC solo las radica *(decisión de producto, 1-oct-2026)*.
- **Partido sin hinchada visitante**: el club afín es el único dato cruzado que decide un acceso; los
  demás solo informan a la vista policial y a la confianza de identidad.
- **Confianza de identidad** define si basta el documento o se pide rostro (con el módulo encendido);
  una confianza baja pide más verificación, nunca niega por sí sola.
- **El rojo no se puede autorizar** y se notifica al PMU.
- **El rojo por medida muestra la foto del documento pero no el nombre** *(decisión de producto, 28-sep-2026)*: el operador necesita reconocer a la persona para remitirla; el nombre y el número completos quedan reservados a la Policía.
- **Ninguna pantalla de resultado se cierra sola**: el operador la cierra con *Continuar* (verde y amarillo), *Siguiente* (rojo operativo) o *Remitir y siguiente* (rojo por medida) *(decisión de producto, 28-sep-2026)*.
- **El amarillo no bloquea**: entra y avisa. Lo único que decide el operador es llamar o no a la Policía en un rojo operativo.
- **Sin conexión**: valida con el paquete del evento; los rojos salen al PMU al volver la red.

---

## Auditoría del demo

**Vistas:** consola *Control de acceso* (`index.html:257-367`; `app.js:452-554`) y *SVN Móvil*
(`mobile.html:572-655`, `:914-1418`), revisadas a 1440, 820 y 390 px.

**Qué conservar:**
- El resultado con el color a pantalla completa, icono y título grande: se lee de lejos.
- Sonidos distintos por color, y vibración distinta en el móvil: la señal más confiable con ruido.
- El lector USB que valida solo cuando entra una cadena larga.
- La cámara con linterna y zoom solo si el dispositivo los tiene, el marco de lectura y el consejo de distancia.
- Cinco intentos de lectura antes de pedir que se digite.
- El tema oscuro del móvil, que hace resaltar el color.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **El amarillo del demo bloquea con un mensaje**: en el modelo el amarillo entra con aviso. | `app.js:516-529`, `mobile.html:1380-1394` |
| **Crítico** | **El resultado no se limpia solo**: el verde o el rojo quedan hasta la siguiente lectura; con fila, el operador puede leer el de la persona anterior. | `app.js:503-546` |
| **Crítico** | **La cámara del móvil se cierra después de cada lectura**: hay que abrirla otra vez por cada persona. | `mobile.html:1123-1124` |
| **Crítico** | **`user-scalable=no`**: no se puede ampliar el texto (WCAG 1.4.4). | `mobile.html:5` |
| Alto | El partido se cambia con un desplegable a la vista, con *Todos los partidos (detección automática)*: cualquiera reconfigura la puerta. | `index.html:266-282`, `mobile.html:575-586` |
| Alto | El amarillo mezcla señales: fondo naranja con *"Habilitado (sin sanción policial)"* en verde dentro. | `app.js:524-528` |
| Alto | El rojo muestra un párrafo legal, el protocolo y una nota en cursiva de 12 px. | `app.js:534-545` |
| Alto | En el celular, con un resultado en pantalla, la lectura y los botones quedan bajo el pliegue (390 × 844). | Captura a 390 px |
| Alto | Muestras de cédula con nombre de archivo y casos de prueba en la barra del operador. | `mobile.html:638-653`, `index.html:324-338` |
| Alto | La vista policial no existe: el rojo solo dice *remitir al PMU*. | — |
| Medio | No valida que la puerta sea del sector de la boleta. | `server.py:898-1100` |
| Medio | La puerta está fija en el código (*Puerta 4 Oriental*). | `app.js:496`, `mobile.html:1352` |
| Medio | La consola no devuelve el foco a la lectura después de validar. | `app.js:467-554` |
| Medio | En la tablet, ~770 px de naranja casi vacío y los controles abajo del todo. | Captura a 820 px |
| Medio | Botones de 36 a 40 px y *chips* de 28 px. | `mobile.html:206-213`, `:265-277` |
| Medio | La tiquetera comparte la app con la puerta. | `mobile.html:560-567` |
| Medio | *En línea* es una etiqueta fija; no hay modo sin conexión. | `mobile.html:553-556` |
| Bajo | El nombre del motor de lectura (*IA Vision ML*, *ZXing HD*) aparece sobre la cámara. | `mobile.html:995`, `:1032` |

## Preguntas abiertas

- Una boleta del partido correcto por la puerta de otro sector, ¿es amarillo o rojo? El dominio la
  valida pero no le asigna color.
- ¿El rojo muestra el nombre de la persona al operador? *Quién ve qué* solo le da el semáforo y el
  documento que leyó.
- ¿Cuánto tarda la vuelta automática a *Lectura* tras un verde? Hay que medirlo en una fila real.
