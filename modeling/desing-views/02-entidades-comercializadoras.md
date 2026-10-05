# 2 · Entidades deportivas y comercializadoras

## La superficie

| | |
|---|---|
| **Quién** | Clubes y entidades deportivas (reportan); Mindeporte (homologa) |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Cada semestre, y después de cada evento |
| **Módulos** | 4 · Boletería (comercializadoras y homologación); 1 · Medidas (reportes de incidentes) |
| **Preguntas que responde** | Club: ¿mi comercializadora puede vender este semestre? ¿En qué quedó mi reporte? · Mindeporte: ¿qué clubes están habilitados y qué falta? |

**Prototipo:** [`prototype/svn`](../../prototype/svn/README.md), ruta `#/entidades` (escritorio): cara del club y de Mindeporte con «Ver como», reporte semestral, reportes de incidentes, certificación y homologación, con panel de 13 casos.

Tiene **dos caras** con la misma data: la del club, que reporta, y la de Mindeporte, que aprueba.

## Pantallas

| Pantalla | Rol | Para qué | Contenido clave |
|---|---|---|---|
| **Reporte semestral** | Club | Cargar qué comercializadora vende en su estadio | Semestre, estadio, comercializadora; estado de su certificación |
| **Reportes de incidentes** | Club | Reportar lo que vio su logística y seguirlo | Persona (tipo y número, verificada con el ANI), evento, fecha, conductas del catálogo, descripción, evidencia; estado |
| **Auditoría de mis eventos** | Club | Ver lo que pasó en sus eventos | Transacciones de sus eventos (ver superficie 3) |
| **Reportes semestrales** | Mindeporte | Aprobar el reporte de cada club | Un registro por club, estadio y semestre; *Aprobar* solo si la comercializadora está certificada |
| **Certificación de comercializadoras** | Mindeporte | Avanzar la interoperabilidad | Estado, resultado de las pruebas, quién aprobó y cuándo; *Emitir llave*, *Suspender*, *Revocar* |

## Estados

- **Homologación** (club, estadio, semestre, llave): pendiente → en pruebas → homologada. Se renueva
  por semestre. El reporte del club solo se aprueba con la certificación activa.
- **Reporte de incidente**: enviado → recibido → en trámite → derivó en medida · archivado.

## Qué ve cada rol

| Rol | Ve |
|---|---|
| Club | Su reporte semestral, **sus** reportes de incidentes con su estado, la auditoría integral de sus eventos. No ve expedientes ajenos ni el detalle de una medida |
| Mindeporte | Todos los reportes semestrales y certificaciones |
| IVC | Los reportes de incidentes llegan a su bandeja (superficie 1) |

## Reglas que hace cumplir

- **Solo una comercializadora homologada** consulta el SVN en producción.
- **Aprobación condicionada** a la certificación de interoperabilidad activa.
- **La llave de API se entrega una vez**, por el portal de integración (6), nunca en esta pantalla.
- **El reporte de incidente no bloquea**; llega a la autoridad de policía y al IVC.

---

## Auditoría del demo

**Vista:** *Panel Mindeporte*, tabla *Reporte semestral de clubes e integración de tiqueteras*
(`index.html:119-145`; `app.js:292-346`). Solo existe la cara de Mindeporte.

**Qué conservar:** los tres estados con color y la acción al lado; club, estadio y comercializadora
en una fila, que es la unidad de la homologación.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **_Certificar_ salta directo a *Homologada***: *No homologada* y *En sandbox* llaman a la misma acción; se salta las pruebas. | `app.js:308-311`, `:337` |
| Alto | La llave de API se muestra en claro en la tabla y en un `alert()`. | `app.js:305`, `:340` |
| Alto | *Certificar* (azul) y *Aprobar* (verde) para lo mismo, sin decir qué se revisó ni qué pasa después. | `app.js:308`, `:311` |
| Alto | No existe la cara del club ni los reportes de incidentes. | — |
| Medio | Sin selector de semestre: todas las filas dicen `2026-II`. Sin aviso de club atrasado. | `app.js:320` |
| Medio | Una celda con dos comercializadoras (*Wompi / TuBoleta*): no se sabe cuál homologar. | Datos sembrados |
| Medio | Sin suspensión ni revocación. | — |

## Preguntas abiertas

- La certificación de interoperabilidad, ¿es de la comercializadora (una vez) y la homologación del
  par club–estadio por semestre? El dominio las separa; conviene confirmarlo con Mindeporte.
- ¿Qué pasa con las ventas en curso cuando vence el semestre sin renovar?
