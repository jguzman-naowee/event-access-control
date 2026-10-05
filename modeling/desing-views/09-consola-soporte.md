# 9 · Consola de soporte *(decisión de producto)*

## La superficie

| | |
|---|---|
| **Quién** | Soporte |
| **Dispositivo** | Web de escritorio |
| **Cuándo** | Continuo, con pico antes del plazo de asignación |
| **Módulos** | 4 · Boletería (boletas, transferencias); *Auditoría* |
| **Pregunta que responde** | ¿Qué le pasó a esta boleta y cómo se resuelve la reclamación? |

**Prototipo:** `prototype/svn/apps/soporte.js` (ruta `#/soporte`, escritorio): cola de reclamaciones, traza de la boleta y acciones según el estado, con panel de 9 casos.

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Reclamaciones** | Atender lo que llega | Bandeja con estado, persona, evento y plazo de asignación que vence |
| **Traza de una boleta** | Reconstruir su vida | Validación, token, invitación, asignación, transferencias e ingreso, en una línea de tiempo |
| **Transferir boletas congeladas** | Resolver el caso previsto por el dominio | Boletas de un propietario que quedó con medida; transferir la propiedad a otra persona elegible (se valida) |

## Estados

- **Boleta**: sin titular → invitada → asignada → usada · perdida · anulada · **congelada**.
- **Reclamación** *(decisión de producto)*: abierta → en gestión → resuelta · rechazada.

## Qué ve cada rol

Soporte ve la traza de boletas y el resultado de las validaciones, **no el expediente** de una medida.

## Reglas que hace cumplir

- **Efecto individual de una medida nueva**: se anula la boleta del sancionado y se congelan las que
  tiene sin titular; las de otros titulares siguen válidas.
- **Una transferencia valida a los dos lados.**
- **Después del inicio del encuentro no se transfiere nada.**

---

## Auditoría del demo

No existe. Lo más cercano es la tabla *Boletas emitidas* de la consola de puerta
(`index.html:343-366`), que muestra código, titular, token y estado, pero sin historial ni acciones.

## Preguntas abiertas

- ¿Soporte es de Naowee, de Mindeporte o de cada comercializadora? Define qué datos puede ver.
