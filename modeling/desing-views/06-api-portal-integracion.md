# 6 · API del SVN y portal de integración

## La superficie

| | |
|---|---|
| **Quién** | Equipos técnicos de las comercializadoras |
| **Dispositivo** | Sus sistemas (API) y un portal web que construimos y operamos nosotros |
| **Cuándo** | Al homologarse, y en cada venta, asignación y transferencia |
| **Módulos** | 2 · Identidad y elegibilidad; 4 · Boletería |
| **Pregunta que responde** | ¿Puedo vender, asignar o transferir esta boleta a esta persona? |

**Paso del flujo:** 2 (vender la boleta).

**Prototipo:** `prototype/svn`, ruta `#/compra` (celular y escritorio, con panel de 11 casos y la capa de las tres consultas); el portal, en `#/integracion` (escritorio): llaves y entornos, documentación, pruebas de homologación, registro de llamadas y estado del servicio, con panel de 9 casos.

**En la compra el SVN se consulta tres veces** *(decisión de producto, 30-sep-2026)*:
1. **Al identificarse:** ¿puede comprar?
2. **Al pagar:** revalida, porque el estado pudo cambiar durante la reserva; si sigue en sí, emite el token.
3. **Al asignar** cada boleta: ¿puede recibirla?

*(decisión de producto, 1-oct-2026)* En ninguna de las tres el SVN consulta al IVC: la medida se valida contra la base de medidas del SVN, donde el IVC la radicó.

*(decisión de producto, 30-sep-2026)* El pago llega con la persona ya identificada: la pantalla dice «Pagando como» con su nombre y documento, con la identidad verificada por el SVN, sin volver a pedir el documento y con «No soy yo · Cambiar de persona». El titular de la tarjeta es aparte y puede ser otra persona. La consulta 2 revalida antes de cobrar; si falla, no se cobra y se libera la reserva.

El hincha nunca ve el motivo de un no.

## La API: tres de los cuatro puntos de validación

| Punto (`dominio.md`) | Qué envía la comercializadora | Qué recibe |
|---|---|---|
| 1 · ¿Puede comprar? | Documento, nombre, evento, cantidad | Autorizado + token, o denegado + código |
| 2 · ¿Puede recibir esta boleta? | Invitación por documento o @usuario; aceptación | Ídem, al invitar y al aceptar |
| 3 · ¿Puede transferir? | Quien entrega y quien recibe | Ídem, para los dos |

Además: registrar la boleta nominalizada con su token, y consultar el estado del escenario en vivo
*(decisión de producto)*. El cuarto punto (*¿Puede entrar?*) es de la puerta (5).

**Códigos de motivo** (`dominio.md` §2): límite de venta excedido · medida restrictiva vigente ·
documento no válido · identidad no coincide. Nunca el expediente.

## Pantallas del portal

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Documentación** | Integrarse sin llamar a nadie | Endpoints, códigos de motivo, ejemplos, límites |
| **Ambiente de pruebas** | Pasar de *en pruebas* a *homologada* | Casos de prueba que dicen lo que hacen (vigente, cumplida, nombre no coincide, más de 5), resultado de cada corrida |
| **Llaves** | Recibir y rotar credenciales | Llave de pruebas y de producción; se ve una sola vez; rotar y revocar |
| **Traza de consultas** | Diagnosticar | Sus propias consultas: fecha, punto de validación, resultado, código. Sin hechos |

## Qué ve cada rol

La comercializadora ve **sus** consultas y el documento que ella envió. Nada más.

---

## Auditoría del demo

**Vista:** *Simulador de tiquetera* (`index.html:152-252`; `app.js:349-449`) y su versión móvil
(`mobile.html:660-720`). No es nuestra superficie, pero muestra qué viaja por la API.

**Qué conservar:** el panel *Consulta ciega* al lado de la compra, que muestra la petición y la
respuesta mientras se compra. Es la mejor pieza del demo para explicar la regla, y en producto su
lugar es la *Traza de consultas* del portal.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **La respuesta de compra trae el motivo legal completo** en `mensaje` (*"medida restrictiva vigente… Ley 1445/1453"*), aunque ya hay un código de motivo. El texto invita a la comercializadora a mostrárselo al hincha. | `server.py:801`, `app.js:390` |
| **Crítico** | **Se emite la boleta sin cotejar el nombre con el ANI**: la función existe y nunca se llama. En los insumos hay una boleta a *"NOMBRE CUALQUIERA SIN VALIDACION ANI"*. | `server.py:325`, `:769-836` |
| Alto | Solo existe el punto 1 (comprar) y por una boleta: no hay invitación, aceptación, transferencia ni propietario distinto del titular. | `app.js:374-387` |
| Alto | Los casos de prueba no cumplen lo que prometen: un *Sancionado* tiene la medida cumplida y la compra sale aprobada. | `index.html:183`, `mobile.html:706` |
| Medio | La llave de API no viaja en la petición del simulador: no se ve que solo una comercializadora homologada consulta. | `app.js:374-387` |
| Medio | Dos botones iguales para abrir el simulador móvil. | `index.html:161-173` |

- *(decisión de producto, 1-oct-2026)* La comercializadora no nombra al SVN al usuario final; la consulta se presenta como consulta a base de datos.
- *(decisión de producto, 1-oct-2026)* Tras pagar, la persona queda en «Tus boletas»; asignar es una acción por boleta, en una vista propia.

## Preguntas abiertas

- ¿La comercializadora puede distinguir *documento no válido* de *identidad no coincide*? Ayuda a
  corregir un error de digitación, pero le dice algo más de la persona.
