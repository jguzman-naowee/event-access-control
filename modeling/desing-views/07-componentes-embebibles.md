# 7 · Componentes embebibles *(decisión de producto)*

## La superficie

| | |
|---|---|
| **Quién** | El hincha, dentro del canal de la comercializadora |
| **Dispositivo** | La web o la app de la comercializadora |
| **Cuándo** | Al registrarse, al comprar y al aceptar una boleta |
| **Módulos** | 2 · Identidad (cuenta, @usuario, consentimiento); 4 · Boletería (invitaciones) |
| **Pregunta que responde** | ¿Soy yo, y acepto esta boleta? |

Es lo único nuestro que el hincha ve dentro de un canal ajeno. Lo demás (la página, el pago, el
diseño) es de la comercializadora.

**Paso del flujo:** 2 (vender la boleta, en diseño; prototipo `#/compra` reservado).

**En la compra el SVN se consulta tres veces** *(decisión de producto, 30-sep-2026)*:
1. **Al identificarse:** ¿puede comprar?
2. **Al pagar:** revalida, porque el estado pudo cambiar durante la reserva; si sigue en sí, emite el token.
3. **Al asignar** cada boleta: ¿puede recibirla?

El hincha nunca ve el motivo de un no.

## Componentes

| Componente | Para qué | Contenido clave |
|---|---|---|
| **Ingresar con [plataforma]** | Identificarse una vez para todas las comercializadoras | Registro o inicio de sesión con el @usuario; consentimiento para vincular esa comercializadora |
| **Aceptar boleta** | Cerrar la invitación | Evento, sector y puesto, quién invita; *Aceptar* / *Rechazar*; vence con el plazo del evento |
| **Resultado de la validación** | Lo que ve el hincha cuando el SVN dice que no | *"No es posible continuar. Consulta tu estado en [portal]"*, con el enlace al portal de la persona (8). Nunca el motivo |
| **Validación con foto** | Tomar la foto de referencia al aceptar la primera boleta | Parte del módulo biométrico desacoplable: se enciende por configuración. Con norma que lo exija es obligatoria; sin ella, voluntaria con consentimiento explícito (`dominio.md` · *Preguntas abiertas*) |

## Estados

- **Invitación**: enviada → aceptada · rechazada · vencida · cancelada.
- **Vínculo con la comercializadora**: activo → revocación solicitada → revocado (sin cortar
  operaciones en curso).

## Reglas que hace cumplir

- **La elegibilidad se valida al invitar y otra vez al aceptar.**
- **El hincha nunca ve el motivo del no** dentro del canal de la comercializadora.
- **Vincular requiere consentimiento**, y revocar es un trámite sin cortes a mitad de camino.

---

## Auditoría del demo

No existen. Lo más cercano es el **resultado de compra del simulador** (`app.js:395-442`,
`mobile.html:1463-1523`), que muestra lo que vería el hincha:

**Qué conservar:** la boleta emitida en el móvil, con el nombre grande, filas claras y el QR como
protagonista.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **El rechazo le cuenta al hincha el motivo legal** (*"medida restrictiva vigente… prohibición legal de emitir boletas a ciudadanos con restricción activa"*), delante de quien mire la pantalla. | `app.js:431-439`, `mobile.html:1513-1522` |
| Alto | El rechazo no deja salida: no dice a dónde ir ni cómo consultar su estado. | `app.js:431-439` |
| Medio | El QR de la boleta se genera en un servicio externo con el código en la URL. | `mobile.html:1467` |

- *(decisión de producto, 1-oct-2026)* Por ahora la asignación de la segunda boleta es solo por documento; el @usuario queda para una siguiente versión.

- *(decisión de producto, 1-oct-2026)* La comercializadora no nombra al SVN al usuario final; la consulta se presenta como consulta a base de datos.

## Preguntas abiertas

- ¿Las comercializadoras aceptan embeber un componente nuestro, o prefieren implementar la
  experiencia con la API y una guía de contenido?
- Si se muestra en el demo, que sea dentro de una tiquetera ficticia neutra, sin imitar marcas reales.
