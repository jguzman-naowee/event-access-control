# 3 · Monitor PMU y auditoría

## La superficie

| | |
|---|---|
| **Quién** | Policía Nacional en el PMU, Mindeporte, supervisor del evento; el club ve la de sus eventos |
| **Dispositivo** | Pantallas del PMU (pared) y escritorio |
| **Cuándo** | El día del evento, y consulta posterior |
| **Módulos** | 5 · Control de acceso; *Auditoría* transversal |
| **Preguntas que responde** | En vivo: ¿hay un rojo, dónde y a qué hora? · Después: ¿qué pasó con esta persona, esta puerta o este evento? |

**Prototipo:** [`prototype/svn`](../../prototype/svn/README.md), ruta `#/auditoria` (el en vivo es `#/policia`).

**Paso del flujo:** 4 (Monitor PMU, `#/policia`) y 6 (Auditoría, `#/auditoria`)

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **En vivo · alertas** (modo pared) | Que ningún rojo se pierda | Cola de rojos arriba: puerta, hora, partido; *Asignar* (modal con la info de la puerta y los agentes a notificar) → el agente la toma → *Cerrar* con resultado. Suena y no se va hasta que se asigna |
| **En vivo · flujo por puerta** | Que el supervisor vea la operación | Ingresos por minuto, avisos amarillos y llamados a la Policía en rojos operativos, puertas sin conexión |
| **Auditoría** | Reconstruir lo que pasó | Filtros por evento, puerta, color, origen, documento y fecha; paginada y exportable |
| **Indicadores** | Resumen del evento o del periodo | Medidas vigentes, boletas emitidas, ingresos, avisos amarillos, rojos operativos y rojos por medida |

## Estados

- **Validación**: verde · amarillo (aviso, entra) · rojo operativo (con o sin llamado a la Policía) · rojo por medida (notificado al PMU).
- **Alerta roja** *(decisión de producto, 29-sep-2026)*: nueva → asignada (los agentes reciben la notificación; sigue *Nueva*) → tomada por un agente → cerrada, con resultado. Si un agente la toma antes de que se asigne, pasa directo a tomada.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Policía | Todo, con las alertas como protagonistas |
| Mindeporte | Todo |
| Supervisor del evento | El flujo de su evento y sus puertas |
| Club | La auditoría integral de sus eventos |
| Comercializadora | Solo sus consultas, en el portal de integración (6) |

## Reglas que hace cumplir

- **Registro inmutable**: fecha y hora, origen, documento, resultado y detalle (`dominio.md` · *Auditoría*).
- **El amarillo y el rojo no se confunden**: el amarillo avisa y deja pasar; el rojo no deja pasar.
- **Cada consulta a datos protegidos también queda registrada.**

---

## Auditoría del demo

**Vista:** *Monitor en vivo (auditoría PMU)* (`index.html:372-401`; `app.js:591-623`).

**Qué conservar:** un registro por intento, de venta y de ingreso; el detalle en lenguaje de negocio
(*Boleta ya utilizada*, *Alerta policial: intento de ingreso con sanción activa*); se actualiza solo.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **Amarillo y rojo iguales**: *boleta ya utilizada*, *sin boleta* y *alerta policial* salen como `RECHAZADO` con la misma etiqueta roja. | `app.js:601-607` |
| **Crítico** | **El rojo no avisa**: es una fila más entre 15, sin sonido ni estado de *atendida*. | `app.js:591-623` |
| Alto | No dice en qué puerta pasó: *Origen* es `MOLINETE_PUERTA` para todas. | `app.js:612` |
| Alto | Sin filtros y solo las últimas 15 filas: no sirve para auditoría posterior. | `server.py` `/api/transacciones` |
| Alto | La columna *Endpoint* ocupa el ancho de la puerta y no le dice nada al PMU. | `index.html:389` |
| Medio | Cuatro palabras para dos resultados (*Autorizado*, *Admitido*, *Denegado*, *Rechazado*). | `app.js:601-605` |
| Medio | Solo se actualiza con la pestaña abierta; *Streaming activo* es fijo. | `app.js:140-144` |
| Medio | Sin modo pared: tabla de 13 px en tarjeta blanca. | `styles.css:235-257` |

## Preguntas abiertas

- ¿Quién cierra una alerta roja y con qué resultados (conducido, no encontrado, falsa alarma)?
- ¿El club ve el monitor en vivo de su evento o solo la auditoría después?
