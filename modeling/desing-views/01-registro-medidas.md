# 1 · Registro de medidas correctivas

> **Parte 1 · lo que pide el IVC (Fuente 2, HU-26.3).** Esta es la única superficie con una HU detrás;
> hasta aquí llega lo que pide el IVC. Las superficies 2 a 9 son la Parte 2.

## La superficie

| | |
|---|---|
| **Quién** | Profesional del IVC (Mindeporte) |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Continuo, con cada oficio de entrada (GESDOC) |
| **Módulos** | 1 · Medidas correctivas; 2 · Identidad (consulta al ANI) |
| **Pregunta que responde** | ¿Esta persona tiene una medida vigente, y hasta cuándo? |

Es la fuente del *no*: la única base que bloquea (`dominio.md` §1). Sin esta superficie, ninguna otra
tiene qué responder.

**Prototipo:** `prototype/svn/apps/medidas.js` (ruta `#/medidas`, escritorio y tablet): base de medidas, radicación en 5 pasos y bandeja de reportes.

**Paso del flujo:** 5

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Base de medidas** | Encontrar a una persona y ver su estado | Búsqueda por documento o nombre; filtros *Vigentes · Por vencer · Cumplidas · Menores*; estado junto al nombre; fin de vigencia |
| **Detalle de la medida** (panel lateral) | Ver el expediente completo | Infractor, representante legal, hechos, conductas y agravantes, sanción, radicados GESDOC, **historial** |
| **Radicar medida** (vista independiente, con *Volver*) | Registrar el acto a partir del oficio | 1) Persona y consulta al ANI, con *¿es menor?* primero · 2) Hechos: evento, competición, ciudad, conductas del catálogo, agravantes · 3) Sanción: acto, ejecutoria, meses, multa · 4) Gestión: radicados y profesional · 5) Revisión: *"Quedará vigente hasta…"* |
| **Reportes de entidades** (bandeja) | Seguir los reportes que llegan de los clubes | Estado del reporte, persona, evento, conductas, evidencia; acción *Enlazar a medida* o *Archivar con motivo* |

*(decisión de producto, 29-sep-2026)* **Radicar medida no es una pestaña.** Las pestañas quedan en *Base de medidas* y *Reportes de entidades*; radicar se abre con el botón *Radicar medida* de la cabecera de cada una, como flujo propio con *Volver a la base / a reportes*. La barra del flujo cambia las pestañas por el título. Los detalles de la base y de los reportes se pueden cerrar, y los botones del pie del detalle de un reporte pasan a dos filas cuando no caben. A la derecha de la barra va el logo de la entidad del usuario (Mindeporte).

*(decisión de producto, 29-sep-2026)* **Header en barra mínima, herramientas en la tabla** (propuesta B de tres). La barra superior queda en una sola fila baja: marca, *Medidas correctivas*, y a la derecha el usuario en una línea y el logo de la entidad; sin pestañas. Las pestañas bajan y son el título de la vista (*Base de medidas* / *Reportes de entidades* con su badge de nuevos), con *Radicar medida* a la derecha en esa fila; no hay subtítulo ni título repetido. La búsqueda y los filtros con conteo viven en la cabecera de la tabla, y el orden es un selector en la última columna del encabezado. *Reportes* usa el mismo patrón (búsqueda, entidad y periodo, y los chips de estado en su cabecera). Razón: la barra deja de competir con la tabla y las herramientas quedan pegadas a lo que filtran.

## Estados

- **Registro y seguimiento** (lo mueve el profesional): Recibido → Validado · Por subsanar.
- **Restricción** (calculada): Inactiva → Activa → Cumplida. Pasa a Activa cuando el registro queda
  Validado; a Cumplida, un día después del fin de vigencia. Solo *Activa* bloquea. Nada se elimina.
- Los estados sugeridos (anotación, advertencia, levantada, veto sin fecha) son *decisión de producto*
  pendiente.
- **Reporte de entidad**: enviado → recibido → en trámite → derivó en medida · archivado.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Profesional del IVC | Todo, incluidos los reportes; los datos de menores con reserva reforzada |
| Policía (vista policial) | El expediente, en su propia superficie (5), no aquí |
| Los demás | Nada de esta superficie |

## Reglas que hace cumplir

- **Fin de vigencia calculado**: día siguiente a la ejecutoria más los meses (Decreto 079, art. 6), con un mínimo de 6.
- **Sin duplicados**: misma persona, mismo acto y mismo periodo.
- **Fecha de los hechos** anterior a la del acto y nunca futura; *¿es menor?* se calcula a la fecha de los hechos.
- **Carga masiva** con reporte de inconsistencias (Fuente 2).
- **Alcance nacional**, sin selector de alcance.
- **Menor → representante legal obligatorio** y reserva reforzada; cada apertura queda auditada.
- **Campos y catálogos del registro oficial** (`fuentes.md` §2 y §3, 55 campos): 7 tipos de documento (CC, CE, TI,
  pasaporte, PPT, PEP, RUMV), sexo, conductas del art. 97 (6) y 98 (3), agravantes (3).
- **No se edita**: cada cambio es una entrada del historial con soporte.
- **Un reporte de entidad nunca bloquea** por sí solo.

---

## Auditoría del demo

**Vista:** *Panel Mindeporte*, tabla *Base centralizada de medidas correctivas* y modal *Radicar*
(`index.html:81-116`, `:406-505`; `app.js:253-289`, `:634-668`).

**Qué conservar:** la vigencia calculada con días restantes (*Vigente · 352 días*), la búsqueda
única que filtra mientras se escribe y el radicado GESDOC visible en cada fila.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **Menores sin reserva**: nombre, documento y ciudad completos en la tabla abierta, con solo una etiqueta *Menor infractor*. | `app.js:270-283` |
| **Crítico** | **Radicación prellenada** con radicado, causal, fecha, meses y multa de otra medida. En los insumos hay dos personas distintas con el mismo radicado. | `index.html:452-484` |
| **Crítico** | **Sin validación de duplicados ni de identidad**: el servidor tiene la consulta al ANI y el formulario no la usa. | `app.js:634-668`, `server.py:647` |
| Alto | Sin filtro por estado: 3 de 12 vigentes van mezcladas con las cumplidas. | `index.html:86-91` |
| Alto | Siete columnas con el mismo peso; el estado va en la quinta y su etiqueta se parte en tres líneas. | `app.js:266-283` |
| Alto | Sin detalle ni historial: todo tiene que caber en la fila. | `app.js:274-284` |
| Alto | *¿Es menor?* va al final del formulario, cuando define qué hay que pedir. | `index.html:492-497` |
| Alto | Texto libre en evento, ciudad, conducta y causal; solo 4 de los 7 tipos de documento; sin sexo, fecha de nacimiento, representante legal, agravantes ni radicados de financiera y jurídica. | `index.html:416-490` |
| Alto | No muestra la vigencia antes de guardar; el éxito es un `alert()`. | `app.js:661` |
| Medio | No existe la bandeja de reportes de entidades. | — |
| Medio | Sin orden, paginación ni conteo; la columna *Clasificación* gasta ancho para decir *Adulto*. | `app.js:270-272` |
| Medio | El texto de ayuda empieza a mitad de frase (*"calcula automáticamente…"*). | `index.html:94-96` |

## Preguntas abiertas

- ¿Quién dentro del IVC puede abrir los datos de un menor, y basta con dejar un motivo?
- ¿Cómo se corrige una medida mal radicada? (`dominio.md` lo deja *exploratorio*.)
