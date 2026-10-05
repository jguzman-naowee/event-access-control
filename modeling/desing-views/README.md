# Vistas por superficie · SVN

Un documento por cada superficie de [`../superficies.md`](../superficies.md), con la misma
numeración. Cada uno **modela la superficie** (pantallas, estados, qué ve cada rol y qué reglas del
[`../dominio.md`](../dominio.md) hace cumplir) y, cuando existe en el demo, trae su **auditoría de
usabilidad** como evidencia. No es un brief para replicar el demo.

> Estado: **v2.1** (28-sep-2026). Alineado con `dominio.md` (con las decisiones del kick-off),
> `superficies.md` v2.3 y `fuentes.md`.
> La auditoría sale de leer el código del demo (`content-supplies/demo-svn`) y recorrerlo en local a
> 1440, 820 y 390 px. Las capturas no se versionan: muestran nombres y documentos de los insumos.

## Superficies

*Origen*, como en `superficies.md`: **Del demo** la trajo Mindeporte y la ampliamos; **Nuestra** la
identificamos nosotros.

| # | Documento | Quién | Dispositivo | Origen | Críticos del demo |
|---|---|---|---|---|---|
| 0 | [`00-transversal.md`](00-transversal.md) | Todas | — | — | 2 |
| 1 | [`01-registro-medidas.md`](01-registro-medidas.md) | Profesional del IVC | Escritorio | Del demo | 3 |
| 2 | [`02-entidades-comercializadoras.md`](02-entidades-comercializadoras.md) | Clubes y Mindeporte | Escritorio | Del demo (sin la vista del club) | 1 |
| 3 | [`03-monitor-pmu.md`](03-monitor-pmu.md) | Policía, Mindeporte, supervisor | Pantallas del PMU y escritorio | Del demo | 2 |
| 4 | [`04-backoffice-eventos.md`](04-backoffice-eventos.md) | Club u organizador, administrador del escenario | Escritorio | Nuestra | — |
| 5 | [`05-acceso-puerta.md`](05-acceso-puerta.md) | Operador de puerta, Policía | Celular, tablet y consola | Del demo | 4 |
| 6 | [`06-api-portal-integracion.md`](06-api-portal-integracion.md) | Comercializadoras | Sus sistemas y portal web | Del demo la API; nuestro el portal | 2 |
| 7 | [`07-componentes-embebibles.md`](07-componentes-embebibles.md) | El hincha | Canal de la comercializadora | Nuestra | — |
| 8 | [`08-portal-persona.md`](08-portal-persona.md) | La persona | Web móvil | Nuestra | — |
| 9 | [`09-consola-soporte.md`](09-consola-soporte.md) | Soporte | Escritorio | Nuestra | — |

El **simulador de tiquetera** del demo no es una superficie nuestra: su auditoría está repartida
entre la 6 (lo que viaja por la API) y la 7 (lo que ve el hincha).

## Estructura de cada documento

1. **La superficie**: quién, dispositivo, momento, módulos del dominio y la pregunta que responde.
2. **Pantallas**: cada una con su propósito y su contenido.
3. **Estados**: los del dominio que la superficie muestra o cambia.
4. **Qué ve cada rol**, tomado de *Quién ve qué* en `superficies.md`.
5. **Reglas que hace cumplir**, con su referencia al dominio.
6. **Auditoría del demo**: qué conservar y hallazgos con severidad y evidencia (`archivo:línea`).
7. **Preguntas abiertas**.

## Severidad

| Nivel | Qué significa |
|---|---|
| **Crítico** | Rompe una regla legal o de negocio, o lleva a una decisión equivocada |
| **Alto** | La tarea se hace, pero con error probable o demasiado esfuerzo |
| **Medio** | Fricción, ruido o inconsistencia |
| **Bajo** | Pulido |

## Lo que más pesa del demo

1. **Menores sin reserva**: nombre y documento completos en la tabla abierta (1).
2. **Amarillo y rojo iguales en el monitor**, y el rojo no avisa (3).
3. **El amarillo no se decide en la puerta** y el resultado no se limpia solo (5).
4. **El hincha ve el motivo legal del rechazo** y la compra no coteja el nombre con el ANI (6, 7).
5. **Radicación prellenada** con datos de otra medida (1).
