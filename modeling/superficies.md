# Superficies · Sistema de Validación Nacional (SVN)

Quién usa qué, desde dónde, en qué momento y con qué datos. Complementa a [`dominio.md`](dominio.md).

> Estado: **v2.2** (28-sep-2026), rehecha a partir del demo SVN (`content-supplies/demo-svn`, ver
> [`fuentes.md`](fuentes.md)). Cada superficie dice si **ya existe en el demo**, si es **nueva** o si
> es una *(decisión de producto)*.

---

## Principio

El SVN es infraestructura del Estado: **valida, registra y audita**. No vende boletas.

- **Lo que ve el hincha lo pone la comercializadora.** Ella envía el documento y el nombre que
  capturó, y recibe sí o no con un código de motivo. Es una **consulta ciega**: nunca ve el expediente.
- **Nosotros construimos y operamos todas las superficies** del SVN, incluido el portal de integración
  de las comercializadoras.
- **Los derechos de la persona** (ver su estado) van en un portal propio, porque la comercializadora
  no conoce el motivo de un no.

---

## Mapa de superficies

Agrupadas por quién las opera.

| # | Superficie | Quién la usa | Dispositivo | Cuándo | En el demo |
|---|---|---|---|---|---|
| **Estado · Mindeporte** |||||
| 1 | **Registro de medidas correctivas** | Profesional del IVC | Web de escritorio | Continuo, con cada oficio de entrada | Sí · *Panel Mindeporte* |
| 2 | **Entidades deportivas y comercializadoras** | Clubes y entidades (reportan); Mindeporte (homologa) | Web de escritorio | Cada semestre, y después de cada evento | Parcial · *Panel Mindeporte*, segunda tabla; sin la vista de la entidad ni sus reportes de incidentes |
| 3 | **Monitor PMU y auditoría** | Policía Nacional, Mindeporte, supervisor del evento | Pantallas del PMU y escritorio | El día del evento, y consulta posterior | Sí · *Monitor en vivo* |
| **Operación del evento** |||||
| 4 | **Backoffice de eventos** | Club u organizador, administrador del escenario | Web de escritorio | Semanas y días antes | **No**: los partidos vienen sembrados |
| 5 | **Acceso en puerta** | Operador de puerta; Policía con vista ampliada | Celular o tablet (web móvil); consola de escritorio en el torniquete | Horas antes y durante el evento | Sí · *Control de acceso* y *SVN Móvil* |
| **Integración** |||||
| 6 | **API del SVN y portal de integración** | Comercializadoras (equipos técnicos) | Sus sistemas; portal web | Al homologarse, y en cada venta | API sí; portal **no** (la traza vive en el simulador) |
| 7 | **Componentes embebibles** | El hincha, dentro del canal de la comercializadora | Su web o app | Al registrarse y al aceptar una boleta | **No** · *(decisión de producto)* |
| **Persona y soporte** |||||
| 8 | **Portal de la persona** | La persona | Web móvil | Cuando recibe un no | **No** |
| 9 | **Consola de soporte** | Soporte | Web de escritorio | Continuo, con pico antes del plazo de asignación | **No** · *(decisión de producto)* |

> El **simulador de tiquetera** del demo (web y móvil) no es una superficie nuestra: representa el
> canal de venta de la comercializadora. Sirve para ver qué nos envía ella: evento, documento, nombre
> y localidad.

---

## 1 · Registro de medidas correctivas

**Quién:** profesional del IVC. **En el demo:** tabla *Base centralizada de medidas correctivas* y el
formulario *Radicar nueva medida correctiva (oficio ER)*.

**Qué hace:**
- **Recibir los reportes de las entidades deportivas** y seguirlos hasta que deriven en medida o se archiven.
- **Radicar** una medida a partir del oficio de entrada, con los campos del registro oficial:
  infractor, representante legal si es menor, hechos y conductas del catálogo, sanción y radicados de GESDOC.
- **Consultar y buscar** por documento, nombre, ciudad o conducta.
- **Ver el estado calculado**: vigente con los días que le quedan, o cumplida. Nadie lo digita.

**Lo que falta frente al demo:**
- El formulario del demo pide menos campos que el registro oficial: faltan fecha de nacimiento,
  representante legal completo, agravantes, fecha de los hechos y los radicados de financiera y jurídica.
- **Historial** de cada medida y **correcciones** *(exploratorio)*.
- Los datos de menores con **reserva reforzada**: la tabla del demo los muestra igual que los de un adulto.

**Endpoints:** `GET/POST /api/sanciones`.

---

## 2 · Entidades deportivas y comercializadoras

**Quién:** los clubes y entidades deportivas reportan, y Mindeporte homologa. **En el demo:** tabla *Reporte semestral de
clubes e integración de tiqueteras*.

**Qué hace:**
- Cada club **carga en el SVN, por semestre,** qué comercializadora vende para su estadio.
- Mindeporte **condiciona la aprobación** a que esa comercializadora tenga la **certificación de
  interoperabilidad** activa con el SVN: pendiente → en pruebas → homologada.
- Al homologar, se emite la **llave de API** de producción.
- **Reportar incidentes** de sus eventos *(decisión de producto)*: persona, conductas del catálogo,
  descripción y evidencia. El reporte llega a la autoridad de policía y al IVC, y la entidad sigue
  su estado hasta que deriva en medida o se archiva. No bloquea por sí solo.

**Lo que falta frente al demo:**
- La **vista de la entidad deportiva**, para cargar su comercializadora y sus reportes de incidentes:
  en el demo solo existe la vista de Mindeporte.
- La **vigencia semestral**: qué pasa con una comercializadora cuando termina el semestre sin renovar.
- La **revocación** de una llave.

**Endpoints:** `GET /api/clubes`, `POST /api/clubes/homologar`.

---

## 3 · Monitor PMU y auditoría

**Quién:** Policía Nacional en el PMU, Mindeporte y el supervisor del evento. **En el demo:** *Monitor
en tiempo real de transacciones*.

**Qué hace:**
- **Registro inmutable** de cada intento de compra o de ingreso: fecha, origen, endpoint, documento,
  resultado y detalle. Según el demo, es para la **Superintendencia de Industria y Comercio (SIC)**,
  Mindeporte y la Policía Nacional.
- **Alertas rojas**: cada intento de ingreso con medida vigente llega al PMU con la puerta y la hora.
- **Indicadores**: medidas en la base, boletas emitidas, validaciones aprobadas y bloqueos en taquilla y puerta.

**Lo que falta frente al demo:**
- **Filtrar por evento, puerta y color**, y ver solo los rojos.
- **Separar las vistas por rol**: la Policía necesita las alertas y el supervisor, el flujo por puerta.
- La **vista del club**: la auditoría integral de sus propios eventos.

**Endpoints:** `GET /api/transacciones`, `GET /api/info`.

---

## 4 · Backoffice de eventos *(nueva)*

**Quién:** el club u organizador y el administrador del escenario. **En el demo:** no existe; los
cuatro partidos vienen sembrados en la base.

**Qué hace:**
- Escenario, sectores (tribunas), puertas y puestos.
- Crear el evento y el partido, dentro de su competencia.
- **Configurar el evento**: sectores habilitados o cerrados, sector visitante, sillas bloqueadas,
  plazo de asignación y partido sin hinchada visitante.
- **Asignar cada torniquete a un partido**: en el demo se elige a mano en la puerta.
- Repartir el cupo entre comercializadoras homologadas.

---

## 5 · Acceso en puerta

**Quién:** el operador de puerta. **En el demo:** *Consola de control de acceso* (escritorio) y la
pestaña *Control de acceso* de *SVN Móvil*.

**Qué hace:**
- **Configurar el torniquete** para un partido, o dejar la detección automática.
- **Leer**, con la cámara (linterna y zoom), la cédula digital (QR o MRZ), la cédula tradicional
  (PDF417 o reverso) o el QR de la boleta; o digitar el número.
- **Responder con semáforo**: verde entra; amarillo (otro partido, sin boleta, ya usada) **lo decide
  el operador ahí mismo**, y su decisión queda registrada; rojo no entra y **alerta al PMU**.
- Mostrar el estado de conexión (*en línea*).

**Lo que falta frente al demo:**
- El **modo sin conexión** con el paquete del evento *(decisión de producto)*: el demo solo muestra "en línea".
- La **vista policial** *(decisión de producto)*: el demo dice "remitir al PMU", pero no da a la
  Policía una vista con el detalle. Mostraría medidas vigentes y cumplidas con sus conductas,
  reincidencia, afinidad y alertas de la validación, **sin un puntaje único de peligrosidad**.
- **La decisión del operador ante un amarillo**: dejar entrar o no, con el motivo. Se registra en la
  auditoría con el operador, la puerta y la hora. El demo hoy solo muestra el mensaje.
- El **contrato del gateway** para torniquetes de terceros *(decisión de producto)*: primero la app
  web móvil; el contrato se publica desde el día uno.

**Endpoints:** `POST /api/v1/estadio/validar-ingreso`, `POST /api/v1/estadio/escanear-documento`.

---

## 6 · API del SVN y portal de integración

**Quién:** los equipos técnicos de las comercializadoras. **En el demo:** la API existe, y la *Auditoría
de interoperabilidad (consulta ciega)* del simulador muestra la traza de cada consulta.

**Qué hace:**
- **Validar al aficionado** antes de vender: documento, nombre, evento y cantidad. Responde autorizado
  con **token del SVN**, o denegado con código de motivo.
- **Registrar la boleta nominalizada** con su token.

**Lo que falta frente al demo** *(nueva)*:
- Un **portal de integración**, que construimos y operamos nosotros, con la documentación, el **ambiente de pruebas** (el estado *en pruebas*
  de la homologación lo necesita), la gestión de llaves y la **traza de sus propias consultas**.
- Los endpoints de invitación, aceptación y transferencia *(decisión de producto)*.

**Endpoints:** `POST /api/v1/svn/validar-aficionado`, `POST /api/tiquetera/comprar`.

---

## 7 · Componentes embebibles *(decisión de producto)*

**Quién:** el hincha, dentro del canal de la comercializadora. **En el demo:** no existen.

- **"Ingresar con [plataforma]"**: registro e inicio de sesión con el @usuario compartido entre comercializadoras.
- **Validación con foto**: solo si se confirma la base legal de la biometría (ver `dominio.md`).

---

## 8 · Portal de la persona *(nueva)*

**Quién:** la persona. **En el demo:** no existe.

- Ver su estado: si tiene una medida vigente y hasta cuándo.
- Saber ante qué autoridad controvertirla *(exploratorio: los documentos no cubren la apelación)*.
- Administrar sus consentimientos y sus vínculos con comercializadoras *(decisión de producto)*.

Cuando la comercializadora recibe un no, solo le muestra un enlace al hincha:
*"No es posible continuar. Consultá tu estado en [portal]"*.

---

## 9 · Consola de soporte *(decisión de producto)*

**Quién:** soporte. **En el demo:** no existe.

- Atender reclamaciones y transferir la propiedad de boletas congeladas.
- Consultar la traza de una boleta: validación, token, asignación e ingreso.

---

## Quién ve qué

| Dato | IVC | Policía (PMU, vista policial) | Club / organizador | Comercializadora | Operador de puerta | Persona |
|---|---|---|---|---|---|---|
| Expediente de la medida (hechos, conducta, acto) | Sí | Sí | No | **No** | No | La suya |
| Reportes de incidentes | Todos | Todos | Los suyos, con su estado | No | No | No |
| Datos de menores | Con reserva reforzada | Con reserva reforzada | No | No | No | Su representante legal |
| Resultado sí o no y código de motivo | Sí | Sí | No | Sí | Semáforo | La suya |
| Documento de la persona | Sí | Sí | No | El que ella envió | El que lee | El suyo |
| Afinidad *(decisión de producto)* | Sí | Sí | No | No | No | No |
| Auditoría de transacciones | Integral | Integral | Integral de sus eventos | Sus consultas | Sus decisiones | No |

Cada consulta a un expediente o a datos de menores queda auditada.

---

## Recorridos por rol

| Rol | Recorrido |
|---|---|
| **Profesional del IVC** | Recibe el oficio (GESDOC) → radica la medida (1) → la medida queda vigente y se cumple sola |
| **Entidad deportiva** | Carga su comercializadora cada semestre (2) → configura escenario, partido y torniquetes (4) → reporta los incidentes de su evento (2) → sigue si derivaron en medida |
| **Mindeporte** | Revisa el reporte → certifica la comercializadora en pruebas (6) → la homologa y entrega la llave (2) |
| **Comercializadora** | Se integra en pruebas (6) → homologada, consulta el SVN en cada venta (6) → emite la boleta con token |
| **Hincha** | Compra en la comercializadora → si recibe un no, consulta su estado (8) → entra por la puerta (5) |
| **Operador de puerta** | Configura el torniquete para su partido (5) → lee documento o boleta → ante un amarillo decide y queda registrado |
| **Policía** | Sigue el monitor en el PMU (3) → recibe cada rojo con la puerta y la hora → atiende en la puerta |

---

## Línea de tiempo

| Momento | Qué pasa | Superficies |
|---|---|---|
| Cada semestre | El club carga su reporte; certificación y homologación de la comercializadora | 2, 6 |
| Continuo | Radicación de medidas correctivas; vencimiento automático | 1 |
| Semanas antes | Escenario, evento, torniquetes, cupos, plazo | 4 |
| Días antes | Venta con consulta al SVN; invitaciones y transferencias; reclamaciones | 6, 7, 8, 9 |
| Horas antes | Vence el plazo de asignación; cada puerta queda lista y configurada | 4, 5 |
| Durante el evento | Ingresos con semáforo; rojos al PMU | 3, 5 |
| Después del evento | Auditoría; la entidad reporta incidentes; la autoridad decide y el IVC radica | 1, 2, 3 |

---

## Qué construir primero

El demo ya prueba el recorrido central. Para pasar de demo a producto, por orden:

1. **Registro de medidas (1)** con el registro oficial completo, historial y reserva de menores.
2. **API del SVN (6)** con llaves por comercializadora homologada y consulta ciega.
3. **Acceso en puerta (5)** con semáforo, torniquete por partido y alertas al PMU.
4. **Monitor PMU (3)** con filtros y vistas por rol.
5. **Clubes y comercializadoras (2)**, con la vista del club, y el portal de integración (6).
6. **Backoffice de eventos (4)**, para dejar de sembrar partidos.
7. Después: portal de la persona (8), soporte (9) y componentes embebibles (7).

*Este orden es una propuesta para discutir.*

---

## Decisiones de superficies (28-sep-2026)

- **El club carga su reporte semestral** en el SVN (superficie 2).
- **Las entidades deportivas reportan incidentes** a la autoridad de policía y al IVC y se alinean con lo que decidan; no tienen una base propia que bloquee.
- **La auditoría es integral** para quien la ve: Mindeporte y Policía, toda; el club, la de sus eventos.
- **Ante un amarillo, el operador decide en la puerta** y la decisión queda registrada. El rojo no se puede autorizar.
- **Nosotros construimos y operamos todo**, incluido el portal de integración.
