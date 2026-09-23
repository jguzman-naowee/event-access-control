# Modelo de dominio · Event Access Control

Control de acceso nacional a eventos deportivos, principalmente fútbol profesional. Gestiona el
flujo boleta-persona completo: desde antes de la compra hasta el ingreso al estadio. Funciona como
producto digital y como API.

> Estado: **borrador v0** (23-sep-2026). Lo marcado *exploratorio* todavía no es decisión.

---

## La pregunta central

**¿Esta persona puede estar en este evento, en este lugar?**

Todo el sistema existe para responder esa pregunta o para cumplir su respuesta. Se hace en cuatro
puntos de validación:

| # | Validación | A quién se valida |
|---|---|---|
| 1 | ¿Puede comprar? | Al comprador |
| 2 | ¿Puede recibir esta boleta? | Al titular: su estado, una boleta por evento, su afinidad y el sector |
| 3 | ¿Puede transferir? | A quien entrega y a quien recibe |
| 4 | ¿Puede entrar? | Al titular, en la puerta y con el estado de ese momento |

Para la comercializadora esto es **transparente**: solo recibe **sí o no**, nunca el motivo.

---

## Módulos

| # | Módulo | De qué se encarga |
|---|---|---|
| 1 | **Restricciones** | Las 3 fuentes de personas advertidas, sancionadas o vetadas, con su historial |
| 2 | **Identidad y elegibilidad** (el core) | Personas, cuentas de usuario, afinidad y la decisión de sí o no |
| 3 | **Escenarios y eventos** | Escenario, sectores, puertas, puestos, competencia, evento, partido y su configuración |
| 4 | **Boletería y asignación** | Cupos, reservas, órdenes, boletas, invitaciones, asignaciones y transferencias |
| 5 | **Control de acceso** | Dispositivos, validación en la puerta, ingresos y operación sin conexión |

---

## 1 · Restricciones

### Fuentes

Hay tres fuentes. Cada una **escribe solo en su propia base**, pero **puede leer el detalle de las
otras dos**, aunque no haya registrado nada propio.

| Fuente | Actor |
|---|---|
| Policía | Policía Nacional |
| IVC | IVC del SUID, del Ministerio del Deporte (módulo propio de Naowee Suite, integración interna) |
| Deportiva | Clubes y entidades deportivas formales |

### Estado de conducta

El estado de cada persona cambia con el tiempo y deja rastro. El estado vigente es **el peor entre
las tres fuentes**: basta con que una fuente bloquee.

```
Habilitado → Con advertencia → Sancionado / Vetado → Saneado
     ↑_______________________________________________|
```

| Registro | ¿Bloquea? | Vigencia |
|---|---|---|
| Anotación | No | Permanente, es una observación |
| Advertencia | No, pero cuenta como antecedente | Permanente |
| Sanción | Sí | Desde y hasta una fecha |
| Veto | Sí | Sin fecha de fin |
| Saneamiento | Levanta el bloqueo | Las anotaciones y advertencias siguen visibles |

**Alcance de una sanción o un veto:** nacional, un club, un escenario o un evento.

### Entidades

- **Fuente de restricción**: una de las 3 fuentes, con su actor dueño.
- **Registro de conducta**: la persona, la fuente, el tipo, el alcance, la vigencia, el soporte legal y el estado.
- **Historial**: cada cambio queda registrado y nunca se edita: quién, cuándo, por qué y con qué soporte.

### Saneamiento *(exploratorio)*

- Solo puede sanear la fuente que impuso el registro.
- Requiere un proceso formal: una solicitud con soporte, **la aprobación de las otras entidades** y
  la resolución. Todo queda en el historial.
- Por definir: quórum, plazos, qué pasa si una entidad no responde, y si una apelación de la persona
  arranca este mismo proceso.

---

## 2 · Identidad y elegibilidad (el core)

### Regla dura

**Una boleta = una persona = un documento**, obligatorio y verificado, para cada evento.

### Entidades

- **Persona**: tipo y número de documento verificado y datos básicos. Es la llave de todo el sistema.
- **Cuenta de usuario**: la persona dentro de la plataforma, con un **@usuario** único (ej. `@junattt`).
- **Identidad hacia las comercializadoras**: un identificador público de nuestros usuarios, para
  que las comercializadoras los reconozcan entre ellas. La vinculación entre una comercializadora y
  un usuario requiere el consentimiento del usuario. Junto con el sí o no, la comercializadora recibe
  **pocos datos, casi todos de identidad** (identificador público, @usuario, nombre), y **nunca el
  estado de conducta ni el motivo de un no**.
- **Biometría**: la plantilla de huella o de rostro, con el consentimiento de la persona. Es un dato sensible (Ley 1581).
- **Historial de asistencia**: se construye con los ingresos reales (módulo 5).
- **Perfil de afinidad**: **se infiere solo de los datos**: partidos a los que fue, de local o de
  visitante, y en qué sectores. **La persona no declara su club.**
- **Regla de elegibilidad**: por ejemplo, una boleta por persona, un sector solo para visitantes, o
  un partido sin hinchada visitante que niega el acceso a quien tenga afinidad alta con el visitante.
- **Decisión de elegibilidad**: quién preguntó, sobre quién, para qué evento y en qué punto de
  validación, con la respuesta y el motivo interno. Cada decisión queda auditada.

### Salvaguardas de la afinidad

Negar un acceso a partir de un perfil inferido es perfilamiento automático. Por eso:

- La afinidad tiene tres resultados: **afín**, **no afín** o **no concluyente**. Si no es concluyente (por ejemplo, sin historial), se deja pasar.
- El motivo queda en la auditoría y la persona puede apelar.
- La comercializadora sigue viendo solo sí o no.

---

## 3 · Escenarios y eventos

```
Escenario
 └─ Sector (tribuna; numerado o de aforo libre)
     ├─ Puerta   (pertenece a un solo sector)
     └─ Puesto   (fila + silla) o cupo de aforo libre

Competencia → Evento → Partido
```

- **Escenario**, **sector**, **puerta** (cada puerta pertenece a un solo sector) y **puesto**.
- **Competencia**: por ejemplo, la liga o el torneo.
- **Evento**: lo que abre puertas y tiene aforo. Es a lo que da acceso una boleta.
- **Partido**: la contienda deportiva dentro de un evento. Un evento puede tener varios partidos.
- **Configuración del evento**: toma la base del escenario y la ajusta para ese evento, con control total:
  - Por sector: habilitado, visitante, cerrado o con aforo reducido.
  - Por puerta: abierta o cerrada, y su horario.
  - Por silla: bloqueada, con motivo (prensa, seguridad, dañada o reservada).
  - El plazo límite para asignar boletas (módulo 4).
  - Si el partido es sin hinchada visitante (activa la regla de afinidad).

> **Nombres:** en Naowee Suite `venue` ya significa dos cosas (el escenario en venue-ms y la sede en
> catalog), y `zone` significa urbano o rural. No reutilizar ninguno de los dos para sector o puerta.

---

## 4 · Boletería y asignación

### Qué hace la comercializadora y qué hacemos nosotros

- **La comercializadora** vende por su canal: su página, su pasarela y el pago son suyos. Integra
  nuestra API para las validaciones, la compra, la asignación y la transferencia.
- **Nosotros** le entregamos el estado del escenario en vivo: la silletería, la disponibilidad y el
  avance de la venta.

### Propietario y titular

- **Propietario**: quien compró la boleta y la controla.
- **Titular**: la persona que entra al estadio con esa boleta.

Se compra en cantidad (un propietario, N boletas), pero **cada boleta se asigna a un solo titular y un solo puesto**.

### Entidades

- **Comercializadora**: el cliente de la API.
- **Cupo**: la parte del inventario del evento que tiene cada comercializadora, en sillas concretas o en cantidad de un sector de aforo libre.
- **Reserva**: bloquea el inventario mientras se paga y vence sola.
- **Orden**: la hace el comprador, que tiene que ser elegible, y se crea con el pago ya confirmado por la comercializadora.
- **Boleta**: la unidad de acceso a un evento, en un sector y un puesto.
- **Invitación de asignación**: la oferta de una boleta a una persona, por cédula o por @usuario.
- **Asignación**: la boleta ligada a su titular y a su puesto.
- **Transferencia**: un cambio de propietario o de titular, con su historial.
- **Límites**: un máximo de boletas por comprador en cada evento, configurable.

### Asignar requiere aceptación

```
Invitación:  enviada → aceptada
                    ↘ rechazada / vencida / cancelada
```

1. El propietario invita a una persona, por cédula o por @usuario.
2. **Se valida la elegibilidad al enviar la invitación**, y de nuevo cuando la persona acepta.
3. Si la persona acepta, la boleta queda asignada. Si la persona rechaza, la boleta vuelve a estar sin titular.
4. La invitación **no tiene plazo propio**: vence con el plazo de asignación del evento. El
   propietario y la comercializadora pueden consultar en todo momento si está enviada, aceptada o rechazada.

### Plazo para asignar

Es **configurable por evento**, con un máximo: el inicio del encuentro.

- **Cuando empieza el encuentro ya no se puede hacer nada**: ni invitar, ni aceptar, ni transferir.
  Solo se puede entrar, incluso tarde, con una boleta ya asignada y sin problemas.
- **Una boleta sin titular cuando vence el plazo se pierde**: queda comprada y sin usar, sin
  devolución y sin reventa. Su silla queda vacía. Las invitaciones pendientes vencen con ella.

### Estados de la boleta

```
sin titular → invitada → asignada → usada
     │            │           │
     └────────────┴───────────┴──→ perdida (venció el plazo)
                                  anulada
                                  congelada (su propietario quedó restringido)
```

### Transferencias

Tanto **quien entrega como quien recibe** tienen que pasar la validación de elegibilidad. Recibir
una transferencia pasa por el mismo flujo de aceptación.

### Si aparece una restricción después de comprar

El efecto es **individual**:

| Situación | Resultado |
|---|---|
| Boleta asignada a otra persona elegible | Sigue válida |
| Boleta asignada a la persona restringida | Se anula |
| Boletas sin titular de un propietario restringido | Se congelan: el propietario ya no puede asignarlas |
| Reclamación | **Soporte** puede transferir la propiedad de las boletas congeladas a otra persona elegible |

---

## 5 · Control de acceso

### Dispositivos

Hay cuatro tipos: **verificador de boleta** (QR), **lector de documento**, **huella** y **cámara**.

### Validación en la puerta

Se valida **siempre cruzando con el documento**:

1. Se identifica a la persona con cualquiera de los dispositivos.
2. Se busca su asignación para el evento.
3. Se revisa que esté en una puerta de su sector, que no haya entrado ya y que su estado de conducta siga habilitado.
4. Se deja entrar o no, y todo queda registrado.

### Entidades

- **Dispositivo**: tiene un tipo y está ubicado en una puerta.
- **Credencial**: el token o QR que liga una boleta con su titular.
- **Validación**: la persona, el método, la puerta, la hora, el resultado y el motivo.
- **Ingreso**: impide el doble ingreso y alimenta el historial de asistencia.

### Sin conexión (contingencia)

- Antes del evento, cada puerta descarga su **paquete del evento**: las asignaciones de su sector, la
  lista de documentos bloqueados y, si la puerta tiene huella o cámara, las plantillas de los titulares esperados.
- Las validaciones se guardan localmente y se sincronizan al volver la red. Los conflictos, como una
  misma boleta usada en dos puertas, quedan marcados para revisión.
- Como cada puerta pertenece a un solo sector, una boleta solo sirve en las puertas de ese sector. Eso achica el riesgo de doble ingreso.

---

## Roles

| Rol | Qué hace |
|---|---|
| **Policía Nacional** | Escribe su fuente de restricciones y lee las otras dos |
| **IVC (MinDeporte)** | Escribe su fuente de restricciones y lee las otras dos |
| **Clubes o entidades deportivas** | Escriben su fuente de restricciones y leen las otras dos |
| **Comercializadora** | Consulta sí o no para comprar, asignar y transferir; vende y cobra por su canal |
| **Comprador o propietario** | Tiene que ser elegible para comprar; invita, asigna y transfiere |
| **Titular** | Acepta la invitación, tiene que ser elegible y es quien entra |
| **Soporte** | Atiende reclamaciones y transfiere la propiedad de boletas congeladas |
| **Organizador o club local** | Configura el evento y reparte los cupos |
| **Administrador del escenario** | Mantiene sectores, puertas, sillas y dispositivos |
| **Operador de puerta** | Opera la validación y resuelve excepciones |
| **Supervisor del evento** | Sigue los ingresos y los incidentes en vivo |
| **Administrador de la plataforma** | Da de alta a comercializadoras y actores, y gestiona sus credenciales |
| **Persona** | Consulta su estado y apela |

---

## Flujo completo

1. **Preparación**: se da de alta el escenario con sectores, puertas y puestos; se crea el evento, se configura y se reparten los cupos.
2. **Enrolamiento**: la persona crea su cuenta con documento verificado y, si aplica, biometría con consentimiento.
3. **Antes de la compra**: la comercializadora pregunta si el comprador puede comprar y recibe sí o no.
4. **Compra en cantidad**: reserva, pago en la comercializadora y orden con N boletas sin titular.
5. **Invitación y aceptación**: se valida a cada titular y la boleta queda asignada.
6. **Transferencias**: se valida a los dos lados y la persona que recibe acepta.
7. **Revisión continua**: una restricción nueva anula o congela solo las boletas de esa persona.
8. **Vence el plazo de asignación**: las boletas sin titular se pierden.
9. **Día del evento**: se valida en la puerta cruzando con el documento, con o sin conexión.
10. **Después del evento**: el historial de asistencia se actualiza y alimenta la afinidad; los incidentes pueden generar registros de conducta nuevos.

---

## Preguntas abiertas

- Saneamiento: quórum, plazos y qué pasa si una entidad no responde. *(exploratorio)*
- ¿Los datos de identidad que recibe la comercializadora incluyen el número de documento?
- ¿Cómo revoca el usuario su vínculo con una comercializadora, y qué pasa con sus boletas vigentes?
