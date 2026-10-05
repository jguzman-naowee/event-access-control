# Prototipo · SVN

HTML plano sobre `sdk-frontend-foundations` y los custom elements de `sdk-stencil-components`, con look
and feel de Naowee. Modelo de cada superficie en [`../../modeling/desing-views/`](../../modeling/desing-views/README.md).

## Abrirlo

Doble clic en `index.html`. Funciona sin servidor.

- `#/`: gate **¿Quién puede entrar al evento hoy?**, por aplicación (abre primero, numerado por el paso del flujo) o por rol (ordenado por el mismo flujo) (mismo patrón que `uaesp-rutas-alta`).

Rutas en el orden del flujo de la demo (30-sep-2026):

1. `#/backoffice`: backoffice de eventos (superficie 4), organizador, en escritorio y tablet. Barra mínima y cinco pestañas que hacen de título
  (**Escenario**, **Evento y partidos**, **Configuración**, **Cupos**, **Listo para abrir**) con la acción principal a la derecha; el evento en curso va en una línea bajo las pestañas, con *Cambiar de evento*.
  Escenario: mapa esquemático, sector (nombre, tipo, aforo), puertas y tabla de dispositivos con filtro. Evento y partidos: lista con búsqueda y estados, detalle editable
  (solo lectura en curso o cerrado), partidos con hora obligatoria para publicar. Las vistas se registran en `BACKOFFICE.registrar` (contrato al inicio de `apps/backoffice.js`); una pestaña sin vista dice *En preparación*.

2. `#/compra`: **Vender la boleta** (paso 2; superficies 6 y 7), solo en celular, sobre una comercializadora ficticia (*graderío*).
  Pantallas en orden: **Evento y boletas** → **Identificarse** (consulta 1) → **Pago** (consulta 2, con «Pagando como») → **Compra aprobada** (2 s, verde, todo el equipo) →
  **Tus boletas** (todas las boletas; `listo` es el id interno) → por boleta sin titular, **Asignar esta boleta** abre la vista inmersiva de asignar
  (consulta 3) y vuelve a Tus boletas; **Aceptar** es la vista del acompañante. Cada consulta corre en la franja de la capa (a la persona se le presenta como consulta a DB):
  en *Slow motion* 1 s por paso; en *Tiempo real* la consulta completa dura 1,8 s y la franja no se muestra. Si la 1 o la 2 cortan, sale el
  componente «Resultado de la validación» sin motivo (salvo el límite, que sí se explica) y el flujo se detiene.
  El panel **Ver como** alterna entre *Quien compra* (los 11 casos de `C1-Casos`: elegir uno reinicia el flujo con ese destino) y
  *Quien recibe* (3 casos, desde la invitación en su celular: por aceptar, ya rechazada y no es posible aceptar). La asignación es solo por documento. Las tipografías de graderío
  (Bricolage Grotesque y Figtree) vienen de Google Fonts; sin conexión cae a `system-ui`.

  | # | Caso | Corta en |
  |---|---|---|
  | 1 | Compra sin problemas | no corta |
  | 2 | Bloqueo por medida | consulta 1 · Medidas (SVN) |
  | 3 | Límite al identificarse (tiene 4, pide 2; con 1 sí pasa) | consulta 1 · Límite |
  | 4 | Límite al pagar | consulta 2 · Límite |
  | 5 | Nombre no coincide (3 intentos; corrigiendo los datos pasa) | consulta 1 · Registraduría |
  | 6 | Cédula no válida | consulta 1 · Registraduría |
  | 7 | Medida durante el pago | consulta 2 · Medidas (SVN) |
  | 8 a 10 | Acompañante con medida / ya tiene boleta / sin club afín (cierra Sur) | consulta 3 |
  | 11 | Afinidad dudosa: pasa | no corta |

3. `#/puerta`: operador de puerta (superficie 5) en celular, tablet y consola.

4. `#/policia`: Monitor PMU (superficie 3), en tablet y escritorio. Primero **Eventos**: cards por fecha en franjas
  (en vivo verde tenue, próximos azul claro, pasados sin fondo); el evento en vivo abre el tablero y los pasados avisan
  con su resumen. Fotos de estadios en `assets/estadios/`: referencias para el demo, no para producción. Después el **tablero
  del evento** (partido, ingreso en vivo, puertas y el panel de alertas a la derecha). La Policía **asigna** la alerta: un
  modal con la info de la puerta y los agentes a notificar; el agente la toma (el demo lo simula a los 7 s) y ahí pasa a
  *En atención*. También pasa que un agente la toma antes (a los 20 s en la Puerta 6, o con el botón del panel del demo).
  *Ver perfil* o *Cerrar con resultado* abre el perfil de esa alerta, y *Tablero del evento* vuelve.

5. `#/medidas`: registro de medidas correctivas (superficie 1), profesional del IVC, en escritorio y tablet. Barra mínima y dos pestañas
  que hacen de título: **Base de medidas** (búsqueda y filtros con conteo en la cabecera de la tabla, orden en su última columna, expediente a la derecha, que se puede cerrar; los datos de un menor
  piden motivo y la apertura entra al historial) y **Reportes de entidades** (bandeja con estados, enlazar a una medida o
  archivar con motivo). **Radicar medida** es una vista aparte (botón en la cabecera de ambas, con *Volver*): 5 pasos con
  resumen en vivo; el fin y el estado se calculan desde la ejecutoria y los meses. El logo de Mindeporte (`assets/mindeporte.svg`, vector de Wikimedia Commons) es referencia para el demo, no para producción. El panel del demo trae atajos a cada caso.

6. `#/auditoria`: auditoría (superficie 3), en escritorio y tablet, app aparte del Monitor. Arranca en la misma lista de
  eventos (`apps/eventos.js`); al entrar, una cabecera con la foto del escenario, el tiempo del operativo y del partido,
  los equipos, los filtros y el exportar (simulado, no baja archivo); chips por lo que pasó en la puerta, tabla de
  registros y el registro elegido a la derecha con la foto de la persona, su historia y quién lo consultó.
  La usan la Policía y Mindeporte (se cambia en el panel del demo).

7. `#/portal`: **Portal de la persona** (superficie 8), solo en celular (web móvil), persona y representante legal. **Identificarse** con documento y nombre
  (verificación simulada contra la Registraduría; el representante legal entra por el menor) → **Mi estado** (*Sin medidas vigentes*, o la medida con autoridad, acto,
  desde, hasta, días restantes y los hechos) con **Cómo controvertirla** (exploratorio) y **Otros motivos de un no**; **Boletas** (aceptar o rechazar una invitación) y
  **Vínculos** (revocar una comercializadora sin cortar lo que está en curso; foto de referencia y su permiso solo con el módulo biométrico encendido). Nunca muestra
  datos de otra persona ni la palabra SVN. Casos del panel: sin medidas, medida vigente, por vencer, menor con representante, entrada desde un bloqueo de la compra,
  documento no vigente y nombre que no coincide; «Adelantar el reloj» hace que la medida venza sola.

8. `#/soporte`: **Consola de soporte** (superficie 9), en escritorio. Cola de reclamaciones (filtro por estado, búsqueda por caso, nombre o documento, plazo de asignación
  que vence) y el detalle: lo que dice la persona, la boleta con su estado, su traza (validación, token, asignación, ingreso) y el historial. Acciones según el estado:
  *Tomar el caso* → *Transferir boletas congeladas* (valida a quien entrega y a quien recibe), *Resolver* o *Rechazar* con motivo; un caso cerrado no se edita. No ve el expediente de
  una medida. «Pasar el inicio del encuentro» bloquea la transferencia (después del inicio no se transfiere nada).

9. `#/entidades`: **Entidades y comercializadoras** (superficie 2), en escritorio. «Ver como» alterna **Club** (Atlético Nacional) y **Mindeporte**; comparten los mismos datos.
  Club: **Reporte semestral** (elige su comercializadora y ve la respuesta a «¿puede vender este semestre?»), **Reportes de incidentes** (los del club en la bandeja del IVC, con su estado y sin
  ver la medida) y **Reportar incidente** (persona verificada con el ANI, un menor queda reservado, conductas de los art. 97 y 98, evidencia; no bloquea, llega a la autoridad y al IVC) y **Mis eventos** (cifras agregadas).
  Mindeporte: **Reportes semestrales** (semestre, filtros, club atrasado; *Aprobar* queda deshabilitado con el porqué si la certificación no está activa) y **Certificación de comercializadoras**
  (pendiente → en pruebas → homologada, sin saltos; *Homologar* exige las 4 pruebas; *Emitir llave* no muestra la llave, la entrega el portal; *Suspender* y *Revocar* con motivo). El gate por rol de Mindeporte sigue en Auditoría: a esta app se entra por su card o con «Ver como».

10. `#/integracion`: **API y portal de integración** (superficie 6), en escritorio, para el equipo técnico de Graderío. **Llaves y entornos** (pruebas y producción; la llave se ve una sola vez y después queda enmascarada; rotar con 24 h de gracia y revocar;
  la de producción solo existe si está homologada), **Documentación** (los 3 puntos de validación más registrar boleta y estado del escenario, con solicitud, respuestas y códigos de motivo; nunca motivo ni expediente),
  **Homologación** (4 casos de prueba, la *cumplida* sale autorizada; solicitar la homologación), **Registro de llamadas** (con el documento enmascarado y solo códigos) y **Estado del servicio** (con un caso degradado).

En *Por aplicación*, cada card entra por la ruta de su app con la sesión de su primer rol.

Los demás perfiles responden *Disponible próximamente*: ninguna card queda muda.

## Qué muestra la puerta

| Caso | Qué hace |
|---|---|
| Verde | *Entra*, vuelve solo a la lectura a los 3,5 s |
| Verde solo con CC | La persona presenta solo la cédula: la capa consulta la boleta asignada a ese documento para el partido (la boleta es nominativa) y da verde con la ubicación. Distinto del rojo *sin boleta*, donde el documento no tiene ninguna asignada |
| Amarillo (otro partido, sin boleta, ya usada) | *Revisar* → *Dejar entrar* / *No entra* → motivo → decisión registrada |
| Rojo | *No entra · remitir a la Policía*, alerta al PMU; solo lo cierra el operador |
| Confianza baja | Rostro contra la foto de referencia con el módulo biométrico encendido; con el módulo apagado, la foto de la cédula |
| Sin conexión | Valida con el paquete del evento y cuenta lo pendiente por sincronizar; el rojo queda en cola |
| Condiciones | Cada switch (Sin conexión, Módulo biométrico, Torniquete) baja un toast breve y mueve su punto sobre la cámara: Conexión, Biométrico, Torniquete |
| Capa oculta | En cada validación el equipo se achica y aparece debajo una franja sin fondo: los 6 pasos en una línea (lectura, ANI · Registraduría, boleta, Policía, medidas del SVN y decisión: 2 consultas externas y 4 del SVN; el IVC solo radica las medidas, no se consulta), el sistema que responde y su label, el tag del resultado, y al final el reloj con play/pausa. En Slow motion dura 1 s por paso (6 s) y representa 1,5 s reales. En cada paso baja un dato del equipo a la línea y sube la respuesta, de a uno, con el color de lo que dio. Al definirse el resultado, todos los pasos toman ese color, y 2 s después la franja se va. Solo en Slow motion: en Tiempo real no aparece y el equipo conserva su tamaño |
| Digitar | Teclado numérico con los 7 tipos de documento. Un número que termine en `4471` da rojo |

El panel izquierdo es **del demo, no del producto**: dispara lo que llegaría por la cámara o el lector.
Está hecho solo con componentes del SDK (`nwt-toolbar`, `nwt-title`, `nwt-alert`, `nwt-card`, `nwt-tabs`,
`nwt-detail-item`, `nwt-switch`, `nwt-icon-label`, `nwt-divider`).

Todo va en **modo claro**. Los equipos se simulan como la app del conductor de `uaesp-rutas-alta`:
marco con bisel, barra de estado y fila de marca en celular y tablet, monitor con pie en la consola,
y, arriba a la derecha, el zoom del escenario (alejar, acercar); en la puerta, en la misma línea, la velocidad (Slow motion | Tiempo real).

## Estructura

```
index.html     la página: carga vendor, estilos y scripts
app.js         sesión ficticia por rol, router por hash, aviso de "próximamente"
gate.js        el gate por rol o aplicación, con el zoom de entrada
datos.js       roles, las 9 superficies, casos de la puerta, vista policial y auditoría (todo ficticio)
marca.js       el logo de Naowee (copiado de uaesp-rutas-alta) para nwt-logo-naowee
svn.css        gate y transición (prefijo sv-)
apps/puerta.*  superficie 5: operador y vista policial (prefijo pp-)
apps/auditoria.*  superficie 3: auditoría (prefijo pa-); reusa el marco del demo y del equipo de pp-
apps/medidas.*    superficie 1: registro de medidas (prefijo pm-); reusa el marco del demo y del equipo de pp-
apps/backoffice.*  superficie 4: marco, Escenario y Evento y partidos (prefijo pb-, clases base en el CSS)
apps/backoffice-evento.*  superficie 4: Configuración, Cupos y Listo para abrir (prefijo pbe-)
apps/compra.*  paso 2 del flujo (superficies 6 y 7, prefijo pc-): estado, casos, consultas, Evento/Identificarse/Pago/Listo; reusa el marco del demo y del equipo de pp-
apps/compra-asignar.*  paso 2: Asignar (vista inmersiva por boleta) y Aceptar (prefijo pca-); se registra en `COMPRA`
apps/portal.*  superficie 8: portal de la persona (prefijo pt-); reusa el marco del demo y del equipo de pp-
apps/soporte.*  superficie 9: consola de soporte (prefijo sp-); reusa el marco del demo y del monitor de pp-
apps/entidades.*  superficie 2: entidades y comercializadoras (prefijo en-); reusa el marco del demo y del equipo de pp-
apps/integracion.*  superficie 6: API y portal de integración (prefijo ig-); reusa el marco del demo y del equipo de pp-
apps/capa.js   capa oculta de la validación: `correr` (puerta, 6 pasos) y `correrDef` (compra, pasos y tag propios)
vendor/        foundations 3.1.0 + nwt.js. NO SE EDITA
```

## Contrato de la compra (`apps/compra.js`)

`COMPRA.registrar(id, { render(ctx), onClick?(el, ev, ctx), onInput?(ev, ctx), alMontar?(ctx) })`. `ctx = { D, st, repintar, toast, esc, ir, consultar, reiniciar, raiz }`.
`st` es el estado del flujo (`pantalla`, `caso` con `.id` e `.invitado`, `persona`, `localidad {id, nombre}`, `cantidad`, `boletas`, `segunda {estado, a}`).
`consultar(n, alTerminar, extra?)` elige la definición por caso y llama `alTerminar({ ok, corte, codigo })`; en la 3 usa la fase de `st.pantalla`
(`aceptar` revalida; cualquier otra asigna). Ayudas: `COMPRA.marco`, `resultado`, `ico`, `qr`, `dinero`. Acciones `data-acc`: `cmp-` (A), `asg-` y `ace-` (B).

## Actualizar el SDK

```bash
F=~/Naowee/sdk-frontend-foundations
cp $F/dist/styles.css vendor/foundations.css
cp $F/dist/components.css vendor/
sed "s#@naowee-tech/sdk-frontend-foundations/fonts/#./#g" $F/dist/icons.css > vendor/icons.css
```

`vendor/nwt.js` es un bundle IIFE de los custom elements que se usan, porque el loader lazy de
Stencil no carga desde `file://`. Para regenerarlo: `npm run build:core` en `sdk-stencil-components`
y empaquetar con esbuild los `dist/components/nwt-<nombre>.js` que se usan (hoy: button, icon-button,
icon, badge, tag, spinner, logo-naowee, stat-card, text-field, toast, switch, tabs, card, avatar,
avatar-icon, toolbar, title, detail-item, alert, divider, icon-label, stepper).
