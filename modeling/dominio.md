# Modelo de dominio · Sistema de Validación Nacional (SVN)

Control de acceso nacional a eventos deportivos, principalmente fútbol profesional, bajo el
**Decreto 1622 de 2022**. Es un módulo transaccional del **SUID**, en el IVC del Ministerio del
Deporte. Gestiona el flujo boleta-persona completo: desde antes de la compra hasta el ingreso al
estadio. Funciona como producto digital y como API.

> Estado: **v1** (25-sep-2026). Las fuentes de verdad están en [`fuentes.md`](fuentes.md): donde
> contradicen este modelo, ganan ellas. Lo que no cubren va marcado *(decisión de producto)*, y lo
> que todavía no es decisión, *(exploratorio)*.

---

## La pregunta central

**¿Esta persona puede estar en este evento, en este lugar?**

Todo el sistema existe para responder esa pregunta o para cumplir su respuesta. Se hace en cuatro
puntos de validación:

| # | Validación | A quién se valida |
|---|---|---|
| 1 | ¿Puede comprar? | Al comprador: identidad, sanción vigente y límite de boletas |
| 2 | ¿Puede recibir esta boleta? | Al titular: identidad, sanción vigente, una boleta por evento, afinidad y sector |
| 3 | ¿Puede transferir? | A quien entrega y a quien recibe |
| 4 | ¿Puede entrar? | Al titular, en la puerta y con el estado de ese momento |

Para la comercializadora es una **consulta ciega**: solo recibe **sí o no** y un código de motivo
genérico, nunca el expediente ni los hechos.

---

## Módulos

| # | Módulo | De qué se encarga |
|---|---|---|
| 1 | **Medidas correctivas** | La base nacional de personas con prohibición de ingreso, en el SUID-IVC |
| 2 | **Identidad y elegibilidad** (el core) | Personas, verificación con la Registraduría, afinidad y la decisión de sí o no |
| 3 | **Escenarios y eventos** | Escenario, sectores, puertas, puestos, competencia, evento, partido y su configuración |
| 4 | **Boletería y asignación** | Comercializadoras homologadas, cupos, órdenes, boletas, invitaciones y transferencias |
| 5 | **Control de acceso** | Dispositivos, validación en la puerta con semáforo, ingresos y operación sin conexión |

---

## 1 · Medidas correctivas

### Quién emite y quién registra

| Actor | Papel |
|---|---|
| **Autoridades de policía** (inspecciones de policía, alcaldías) | **Emiten** la medida correctiva mediante un acto administrativo, en audiencia |
| **IVC del SUID (Mindeporte)** | **Registra** la medida a partir del oficio de entrada (radicado en GESDOC) y la mantiene |
| **Policía Nacional** | **Consulta**: recibe las alertas rojas de la puerta en el PMU y ve el detalle en la vista policial |
| **Entidades deportivas** (clubes y entidades formales) | **Reportan** a la autoridad de policía y al IVC los incidentes de sus eventos *(decisión de producto)* |

Hay **una sola base** de medidas correctivas, en el SUID-IVC, y **solo una medida correctiva
bloquea**. Las entidades deportivas no tienen una base propia: su camino es reportar y alinearse
con lo que decidan la autoridad de policía y el IVC.

### Reporte de entidad deportiva *(decisión de producto)*

Los documentos no lo cubren, pero dejar fuera a las entidades deportivas sería un error: son las
que ven los incidentes en sus estadios, a través de su logística.

- **Qué reporta:** la persona (tipo y número de documento), el evento, la fecha, las **conductas del
  catálogo** de la Ley 1453, la descripción y la **evidencia** (informe de logística, video, fotos).
- **A quién llega:** a la **autoridad de policía** competente, que decide si abre el procedimiento,
  y al **IVC**, que sigue el caso.
- **No bloquea por sí solo.** Un reporte nunca niega una compra ni un ingreso: solo lo hace la
  medida correctiva que resulte del procedimiento.
- **Estados:** enviado → recibido → en trámite → **derivó en medida** (queda enlazado a la medida
  que la autoridad emitió) o **archivado** (con su motivo).
- **La entidad ve** el estado de sus propios reportes, y si derivaron en medida. No ve expedientes ajenos.
- **Se alinea:** en sus estadios aplica las medidas vigentes de la base nacional, igual que todos.

### La medida correctiva

Es una **prohibición de ingreso a escenarios deportivos**, por las conductas de la Ley 1445 de 2011
(arts. 14 y 15), modificada por la Ley 1453 de 2011 (arts. 97 y 98).

- **Vigencia:** empieza el día siguiente a la **fecha de constancia de ejecutoria** y dura los
  **meses de sanción**. El fin de vigencia se calcula, no se digita.
- **Alcance: nacional.** Rige en todos los escenarios del país donde haya espectáculos deportivos
  profesionales con público (Decreto 079 de 2012, art. 6, par. 4).
- **Estado automático:** **vigente** mientras no pase el fin de vigencia; después, **cumplida**. La
  persona queda habilitada sola, sin trámite.
- Puede llevar **multa** (valor de la sanción, en pesos).

### Entidades

- **Medida correctiva**, con los grupos de campos del registro oficial (detalle en `fuentes.md`):
  - **Infractor:** tipo y número de identificación, nombre, residencia, contacto, fecha de nacimiento,
    edad y si es menor (calculados), sexo.
  - **Representante legal:** obligatorio si el infractor es menor de edad (Ley 1098 de 2006).
  - **Hechos:** fecha, evento, competición, ciudad, **conductas** (catálogo, selección múltiple),
    **agravantes** y descripción breve.
  - **Sanción:** acto administrativo, fecha de ejecutoria, meses, fin de vigencia, valor, estado.
  - **Gestión interna:** radicados de GESDOC (entrada, respuesta, financiera, jurídica), profesional
    responsable y observaciones.
- **Catálogo de conductas:** art. 97 (6 conductas), art. 98 (3) y agravantes (3).
- **Historial:** cada registro y cada cambio queda con quién, cuándo y con qué soporte. No se edita.
- **Reporte de entidad deportiva:** persona, evento, conductas, descripción, evidencia, estado y, si
  derivó en medida, el enlace a ella.

### Menores de edad

Un menor **puede ser sancionado**. Su registro exige el representante legal y tiene **reserva
reforzada**: sus datos solo los ven los roles que los necesitan, y cada consulta queda auditada.

### Estados sugeridos *(decisión de producto)*

Los documentos solo definen **vigente** y **cumplida**. Sugerimos sumar estos, y mientras no se
aprueben, solo la medida vigente bloquea:

| Estado sugerido | ¿Bloquea? | Para qué | Qué haría falta |
|---|---|---|---|
| **Anotación** | No | Dejar una observación, como un reporte archivado | Nada: es interna del IVC |
| **Advertencia** | No, pero es antecedente | Llamado de atención previo; cuenta para la reincidencia | Definir quién la emite |
| **Reporte en trámite** | No | Reporte de una entidad deportiva que la autoridad aún no decide | Ya está en el modelo |
| **Levantada** | Levanta el bloqueo antes de tiempo | Recurso o revocatoria del acto | Un nuevo acto administrativo |
| **Veto sin fecha** | Sí, indefinido | Reincidencia grave | Soporte legal: hoy la ley fija meses |

### Correcciones y levantamiento anticipado *(exploratorio)*

Los documentos no cubren cómo se corrige un registro con error o se levanta una medida antes de su
fin de vigencia. Si hace falta, será un trámite formal del IVC con su soporte (un nuevo acto
administrativo), y queda en el historial.

---

## 2 · Identidad y elegibilidad (el core)

### Regla dura

**Una boleta = una persona = un documento**, obligatorio y verificado, para cada evento. El documento
es **tipo más número**. Tipos válidos: cédula de ciudadanía (CC), cédula de extranjería (CE),
tarjeta de identidad (TI), pasaporte, PPT, PEP y RUMV (Decreto 1622 de 2022).

### Verificación con la Registraduría

Cada documento se verifica contra el **Archivo Nacional de Identificación (ANI)** de la Registraduría.
Es un **servicio paralelo y compartido**, tal como viene en el demo: lo consulta cualquier parte del
sistema que necesite validar un documento (la venta, la asignación, la puerta, la radicación de una
medida, el reporte de una entidad deportiva y el portal de la persona).

- **Existe y está vigente.** Una cédula **cancelada** (por muerte o por doble cedulación) se deniega.
- **Nombre oficial.** El nombre que envía la comercializadora se coteja con el del ANI. Un nombre
  distinto es posible suplantación y se deniega; uno incompleto (una sola palabra) se pide completo.

### Entidades

- **Persona**: tipo y número de documento, verificados con el ANI. Es la llave de todo el sistema.
- **Cuenta de usuario** *(decisión de producto)*: la persona dentro de la plataforma, con un
  **@usuario** único (ej. `@junattt`), para identificarse entre comercializadoras. La vinculación con
  una comercializadora requiere su consentimiento.
- **Nosotros no le enviamos identidad a la comercializadora.** Ella nos envía lo que ya tiene
  (el documento y el nombre que capturó, o el @usuario) y nosotros respondemos sí o no.
- **Revocar el vínculo es un trámite formal, sin cortes a mitad de camino** *(decisión de producto)*.
  Desde la solicitud no se inician operaciones nuevas; las que están en curso terminan normalmente,
  y la revocación se hace efectiva cuando se cierra la última.
- **Referencia biométrica** *(decisión de producto)*: la foto contra la cual se compara en la puerta.
  **Va en el producto como un módulo pegado pero desacoplable**: se activa por configuración, y si la
  base legal no alcanza, se apaga sin afectar el resto. Ver *Confianza de identidad*.
- **Confianza de identidad** *(exploratorio)*: cuánto confiamos en que la persona es quien dice ser.
- **Historial de asistencia**: se construye con los ingresos reales (módulo 5).
- **Datos cruzados** *(decisión de producto)*: señales explicables que salen del historial de la
  persona. **El club afín es una de ellas**, no la única:
  - **Club afín**, con su certeza (por ejemplo, Club A, 86%). La persona no declara su club.
  - **Tribuna habitual** (por ejemplo, la de su barra).
  - **Frecuencia de asistencia** (partidos en los últimos meses).
  - **Viajes de visitante.**
  - **Con quién va:** si comparte boletas con personas que tienen una medida vigente.
  - **Intentos fallidos en la puerta.**
  Solo el **club afín** alimenta una regla de acceso (partidos sin hinchada visitante). Las demás
  informan: a la vista policial y a la confianza de identidad.
- **Regla de elegibilidad**: sanción vigente, documento vigente, límite de boletas, una boleta por
  persona por evento, sector visitante, partido sin hinchada visitante.
- **Decisión de elegibilidad**: quién preguntó, sobre quién, para qué evento y en qué punto de
  validación, con el resultado, el **código de motivo** y el detalle interno. Cada decisión queda auditada.

### Códigos de motivo

La comercializadora recibe el resultado y un código de motivo genérico, sin el expediente:

| Resultado | Código de motivo | Cuándo |
|---|---|---|
| Autorizado | — | Pasa todas las reglas; se emite un token del SVN |
| Denegado | Límite de venta excedido | Pide más de 5 boletas por el canal normal |
| Denegado | Medida restrictiva vigente | Tiene una medida correctiva vigente |
| Denegado | Documento no válido | No existe en el ANI o está cancelado *(nombre del código por definir)* |
| Denegado | Identidad no coincide | El nombre no corresponde al documento *(nombre del código por definir)* |

### Salvaguardas de la afinidad *(decisión de producto)*

Negar un acceso a partir de un perfil inferido es perfilamiento automático. Por eso:

- La afinidad tiene tres resultados: **afín**, **no afín** o **no concluyente**. Si no es concluyente, se deja pasar.
- El motivo queda en la auditoría y la persona puede apelar.
- La comercializadora sigue viendo solo sí o no.

### Confianza de identidad *(exploratorio)*

Un **porcentaje por persona, actualizable**, que define **cuánta verificación se le pide en la puerta**:
solo el documento, o el documento más el rostro.

- **Factores:** el estado del documento en el ANI, el resultado del cotejo nominal, los ingresos
  exitosos, las validaciones fallidas y si el documento ya se usó en otro intento.
- **No es una sanción:** una confianza baja pide más verificación, pero nunca niega el acceso por sí
  sola. Negar es cosa de las medidas correctivas y de las reglas.
- **La foto de referencia** se toma al aceptar la primera boleta, o en la puerta en el primer ingreso
  del titular a cargo. Vive en el **módulo biométrico desacoplable**: sin él, la verificación sigue
  con el ANI y el documento, como en el demo.

Confianza (¿es quien dice ser?), medida correctiva (¿puede entrar?) y datos cruzados (¿qué dicen
sus datos?) son tres ejes separados.

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
- **Competencia**: por ejemplo, la Liga BetPlay Dimayor o la Copa Libertadores.
- **Evento**: lo que abre puertas y tiene aforo. Es a lo que da acceso una boleta.
- **Partido**: la contienda deportiva dentro de un evento. Un evento puede tener varios partidos.
- **Configuración del evento**: toma la base del escenario y la ajusta para ese evento:
  - Por sector: habilitado, visitante, cerrado o con aforo reducido.
  - Por puerta: abierta o cerrada, su horario y **el partido para el que está configurado su torniquete**.
  - Por silla: bloqueada, con motivo (prensa, seguridad, dañada o reservada).
  - El plazo límite para asignar boletas (módulo 4).
  - Si el partido es sin hinchada visitante (activa la regla de afinidad).

> **Nombres:** en Naowee Suite `venue` ya significa dos cosas (el escenario en venue-ms y la sede en
> catalog), y `zone` significa urbano o rural. No reutilizar ninguno de los dos para sector o puerta.

---

## 4 · Boletería y asignación

### Comercializadoras homologadas

- Cada **club** carga en el SVN, **por semestre**, qué comercializadora vende para su estadio.
- Mindeporte **homologa** esa comercializadora: **pendiente → en pruebas → homologada**. En pruebas
  trabaja contra un ambiente de pruebas; homologada recibe su **llave de API** de producción.
- Mindeporte **condiciona la aprobación** del reporte del club a que su comercializadora tenga la
  certificación de interoperabilidad activa.
- Solo una comercializadora homologada consulta el SVN en producción.

### Qué hace la comercializadora y qué hacemos nosotros

- **La comercializadora** vende por su canal: su página, su pasarela y el pago son suyos. Consulta
  el SVN en tiempo real antes de vender, asignar o transferir.
- **Nosotros** respondemos sí o no y le entregamos el estado del escenario en vivo: silletería,
  disponibilidad y avance de la venta *(decisión de producto)*.

### Límite de boletas

- **Máximo 5 boletas por aficionado** (Decreto 1622 de 2022, art. 2.17.16, num. 7).
- **No hay compra de más de 5.** El SVN la deniega, y no se abre un canal especial.
- **Cada boleta se asocia a una persona**: se compra hasta 5 y cada una queda nominalizada a un titular.

### Propietario y titular *(decisión de producto)*

- **Propietario**: quien compró la boleta y la controla.
- **Titular**: la persona que entra al estadio con esa boleta. La boleta es **nominalizada**: va a su nombre y documento.

Se compra hasta 5 (un propietario, N boletas), pero **cada boleta se asigna a un solo titular y un solo puesto**.

### Entidades

- **Comercializadora** y su **homologación** (club, estadio, semestre, estado, llave de API).
- **Cupo**: la parte del inventario del evento que tiene cada comercializadora.
- **Reserva**: bloquea el inventario mientras se paga y vence sola.
- **Orden**: la hace el comprador, que tiene que ser elegible, con el pago ya confirmado por la comercializadora.
- **Boleta**: código, evento, sector o tribuna, fila y silla, titular y **token del SVN** que prueba
  que la venta pasó por la validación.
- **Invitación de asignación** *(decisión de producto)*: la oferta de una boleta a una persona, por documento o por @usuario.
- **Asignación**: la boleta ligada a su titular y a su puesto.
- **Transferencia**: un cambio de propietario o de titular, con su historial.

### Asignar requiere aceptación *(decisión de producto)*

```
Invitación:  enviada → aceptada
                    ↘ rechazada / vencida / cancelada
```

1. El propietario invita a una persona, por documento o por @usuario.
2. **Se valida la elegibilidad al enviar la invitación**, y de nuevo cuando la persona acepta.
3. Si acepta, la boleta queda asignada y se emite su token. Si rechaza, vuelve a estar sin titular.
4. La invitación vence con el plazo de asignación del evento.

### Asignación a cargo (titular sin cuenta) *(exploratorio)*

Para quien no va a validar nada por su cuenta: un hijo, un adulto mayor, alguien sin celular.

- **El propietario asigna por documento y acepta en nombre del titular**, declarando la relación.
  Queda como **responsable** de esa asignación.
- **La elegibilidad se valida igual**, contra el documento del titular.
- **Menores de edad:** el responsable tiene que ser su representante legal.
- **Flexibilidad por edad:** para menores de 14 años y adultos mayores (umbral configurable, entre 70
  y 80 años) se afloja **solo la verificación de identidad**. Las medidas correctivas aplican igual:
  un menor sancionado no entra.

### Plazo para asignar *(decisión de producto)*

Es **configurable por evento**, con un máximo: el inicio del encuentro.

- **Cuando empieza el encuentro ya no se puede hacer nada**: ni invitar, ni aceptar, ni transferir.
  Solo se puede entrar, incluso tarde, con una boleta ya asignada.
- **Una boleta sin titular cuando vence el plazo se pierde**: sin devolución ni reventa.

### Estados de la boleta

Los documentos definen **emitida → ingresada**, o **anulada**. El modelo los detalla así:

```
sin titular → invitada → asignada (emitida) → usada (ingresada)
     │            │           │
     └────────────┴───────────┴──→ perdida (venció el plazo)
                                  anulada
                                  congelada (su propietario quedó restringido)
```

### Transferencias *(decisión de producto)*

Tanto **quien entrega como quien recibe** tienen que pasar la validación. Quien recibe acepta.

### Si aparece una medida correctiva después de comprar

El efecto es **individual**:

| Situación | Resultado |
|---|---|
| Boleta asignada a otra persona elegible | Sigue válida |
| Boleta asignada a la persona sancionada | Se anula |
| Boletas sin titular de un propietario sancionado | Se congelan: ya no puede asignarlas |
| Reclamación | **Soporte** puede transferir la propiedad de las boletas congeladas a otra persona elegible |

---

## 5 · Control de acceso

### Qué lee la puerta

| Documento | Cómo se lee |
|---|---|
| Cédula digital | QR y zona de lectura mecánica (MRZ) |
| Cédula tradicional (amarilla) | Código PDF417 y OCR del reverso |
| Boleta digital | QR con el código de la boleta o el token del SVN |
| Cualquiera | Número digitado a mano |

Rostro y huella son extensiones *(decisión de producto, sujetas a base legal)*.

### Validación en la puerta

Se valida **siempre cruzando con el documento**:

1. Se identifica a la persona o su boleta, con cualquiera de las formas de arriba.
2. Se busca su boleta para **el partido configurado en ese torniquete**.
3. Se revisa que no tenga una medida correctiva vigente, que la boleta no se haya usado y que la
   puerta sea de su sector.
4. El resultado sale en **semáforo**, y todo queda registrado.

### El semáforo

| Color | Qué significa | Qué pasa |
|---|---|---|
| **Verde** | Entra | Se marca la boleta como usada |
| **Amarillo** | Boleta de otro partido, sin boleta asociada o boleta ya usada | **El operador decide** si entra o no, con su motivo; queda registrado |
| **Rojo** | Medida correctiva vigente | No entra y **se notifica al PMU** de la Policía Nacional. Nadie en la puerta lo puede autorizar |

### Entidades

- **Dispositivo**: tiene un tipo, está en una puerta y se configura para un partido.
- **Validación**: la persona, el método, la puerta, la hora, el color, el motivo y si se notificó al PMU.
- **Decisión del operador**: ante un amarillo, si dejó entrar o no, el motivo, el operador, la puerta y la hora.
- **Ingreso**: impide el doble ingreso y alimenta el historial de asistencia.

### Sin conexión (contingencia) *(decisión de producto)*

- Antes del evento, cada puerta descarga su **paquete del evento**: las boletas de su sector, la
  lista de documentos con medida vigente y el nivel de verificación de cada titular.
- Las validaciones se guardan localmente y se sincronizan al volver la red. Los conflictos quedan
  marcados para revisión, y las alertas rojas se envían al PMU en cuanto hay red.

---

## Auditoría

Toda consulta queda como una **transacción** en un registro **inmutable**: fecha y hora, **origen**
(comercializadora, torniquete, registro del IVC), endpoint, documento, resultado y detalle. Lo usan
la Superintendencia de Industria y Comercio (SIC), Mindeporte y la Policía Nacional, y es la base del
monitor del PMU y de los reportes.

---

## Roles

| Rol | Qué hace |
|---|---|
| **Autoridad de policía** (inspección, alcaldía) | Emite la medida correctiva por acto administrativo |
| **Profesional del IVC** (Mindeporte) | Radica la medida en el SUID desde el oficio de entrada y gestiona sus radicados |
| **Policía Nacional** | Recibe las alertas rojas en el PMU y consulta en la vista policial |
| **Club o entidad deportiva** | Carga cada semestre su comercializadora; configura sus eventos; **reporta incidentes** a la autoridad de policía y al IVC y sigue su estado; ve la auditoría integral de sus eventos |
| **Mindeporte** (homologación) | Homologa comercializadoras y entrega sus llaves de API |
| **Comercializadora** | Consulta el SVN antes de vender, asignar y transferir; vende y cobra por su canal |
| **Comprador o propietario** | Tiene que ser elegible para comprar; compra hasta 5; invita, asigna y transfiere |
| **Titular** | Acepta la invitación, tiene que ser elegible y es quien entra |
| **Soporte** | Atiende reclamaciones y transfiere la propiedad de boletas congeladas |
| **Administrador del escenario** | Mantiene sectores, puertas, sillas y dispositivos |
| **Operador de puerta** | Opera la validación y decide los amarillos; su decisión queda registrada |
| **Supervisor del evento** | Sigue los ingresos y las alertas en vivo |
| **Administrador de la plataforma** | Gestiona actores, credenciales y configuración |
| **Persona** | Consulta su estado y apela |

---

## Flujo completo

1. **Cada semestre**: el club carga su comercializadora en el SVN y Mindeporte la homologa.
2. **Continuo**: las autoridades de policía emiten medidas correctivas; el IVC las radica en el SUID.
   Cada medida vence sola al cumplir sus meses.
3. **Preparación del evento**: escenario, sectores, puertas y puestos; se configura el evento y los torniquetes, y se reparten los cupos.
4. **Antes de la compra**: la comercializadora consulta el SVN con el documento y el nombre del
   comprador. El SVN verifica con el ANI, revisa medidas vigentes y el límite de 5, y responde sí o no.
5. **Compra**: reserva, pago en la comercializadora y orden con hasta 5 boletas.
6. **Invitación y aceptación**: se valida a cada titular; la boleta queda nominalizada y con su token.
7. **Transferencias**: se valida a los dos lados y quien recibe acepta.
8. **Revisión continua**: una medida nueva anula o congela solo las boletas de esa persona.
9. **Vence el plazo de asignación**: las boletas sin titular se pierden.
10. **Día del evento**: cada torniquete, configurado para su partido, valida contra el documento y
    responde en semáforo. Los amarillos los decide el operador y quedan registrados; los rojos van al PMU.
11. **Después del evento**: se sincroniza lo validado sin conexión y se actualiza el historial de
    asistencia. La entidad deportiva **reporta los incidentes**; la autoridad de policía decide si
    abre el procedimiento, y si emite una medida, el IVC la radica.

---

## Decisiones del kick-off (28-sep-2026)

- **Biometría: va**, como un módulo pegado pero desacoplable. Se activa por configuración y se apaga
  sin afectar el resto.
- **Más de 5 boletas: no.** Máximo 5 por aficionado, cada una asociada a una persona.
- **Registraduría (ANI):** un servicio paralelo que consulta todo el que necesite validar un documento.

## Preguntas abiertas

- **Base legal para encender el módulo biométrico.** La Ley 1581 y el Decreto 1377 de 2013 prohíben
  condicionar una actividad a que la persona entregue datos sensibles, salvo que una ley lo exija.
  Con norma, la foto es obligatoria para todo titular; sin norma, es voluntaria con consentimiento
  explícito, y quien no la dé entra con documento y más verificación.
- **Estados sugeridos de la medida:** cuáles aprueba el IVC y con qué soporte.
- **Documentos válidos:** el Excel cita el art. 2.17.3 y el art. 2.17.4 del Decreto 1622 para lo
  mismo; confirmar cuál.
- **Correcciones y levantamiento anticipado de una medida:** no están en los documentos.
- **Convenio con la Registraduría:** el demo simula el ANI. El modelo ya está decidido; falta el trámite del convenio.
