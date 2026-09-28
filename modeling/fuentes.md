# Fuentes de verdad · Event Access Control

Qué documentos mandan sobre el modelo y qué dice cada uno. **Donde un documento contradice al
modelo, gana el documento.** Lo que los documentos no cubren queda en el modelo como decisión de
producto y se marca así: *(decisión de producto)*.

> Recibido el 25-sep-2026. Vive en `content-supplies/demo-svn/`, **fuera de git** (`.gitignore`): el
> Excel, la base y hasta el código del demo traen nombres y documentos asociados a sanciones,
> incluidos menores. Acá solo queda su estructura.
>
> Para verlo: `cd content-supplies/demo-svn` y `python server.py` (requiere FastAPI, uvicorn, OpenCV,
> Pillow y zxing-cpp) → `http://localhost:8000`. No es una página para abrir con doble clic.

---

## 1 · Demo SVN

Prototipo del **Sistema de Validación Nacional (SVN)**: módulo transaccional del SUID, en el IVC del
Ministerio del Deporte, bajo el Decreto 1622 de 2022. Backend FastAPI + SQLite, un escáner de
documentos y tres pantallas (panel Mindeporte, simulador de comercializadora, app móvil de puerta
con monitor del PMU).

### Pantallas

| Pantalla | Qué muestra |
|---|---|
| **Panel Mindeporte (SUID-IVC)** | Indicadores; base centralizada de medidas con estado calculado; formulario *Radicar nueva medida (oficio ER)*; tabla de reporte semestral de clubes y homologación de tiqueteras |
| **Simulador de tiquetera comercial** | Compra nominalizada (evento, documento, nombre, localidad) y la traza de la consulta ciega |
| **Control de acceso (torniquetes)** | Partido del torniquete, lectura de cédula o boleta, semáforo y boletas emitidas |
| **Monitor en vivo (auditoría PMU)** | Registro inmutable de transacciones, para la SIC, Mindeporte y la Policía Nacional |
| **SVN Móvil** (`/mobile`) | Las mismas puerta y tiquetera en el celular, con cámara, linterna y zoom |

### Endpoints

| Endpoint | Quién lo usa | Qué hace |
|---|---|---|
| `POST /api/v1/svn/validar-aficionado` | Comercializadora, en tiempo real | Valida límite de boletas y sanciones vigentes. Responde AUTORIZADO con token, o DENEGADO con un código de motivo. **Consulta ciega**: no entrega expediente ni hechos. |
| `POST /api/tiquetera/comprar` | Comercializadora | Valida y emite una boleta **nominalizada** con el token del SVN |
| `POST /api/v1/estadio/validar-ingreso` | Torniquete o app de puerta | Valida sanción, partido y doble ingreso. Responde con semáforo |
| `POST /api/v1/estadio/escanear-documento` | App de puerta | Decodifica cédula digital, cédula tradicional o boleta desde una foto |
| `GET /api/v1/registraduria/consultar` | SVN | Consulta al Archivo Nacional de Identificación (ANI): existencia, vigencia y nombre oficial |
| `POST /api/sanciones` | Profesional del IVC | Radica una medida correctiva a partir de un oficio de entrada (GESDOC) |
| `POST /api/clubes/homologar` | Mindeporte | Homologa la comercializadora de un club y emite su llave de API |
| `GET /api/transacciones` | Monitor del PMU | Auditoría de todas las consultas |

### Reglas que implementa

- **Límite de 5 boletas por aficionado** (Decreto 1622, art. 2.17.16, num. 7). Más de 5 se deniega
  con `LIMITE_VENTA_EXCEDIDO`: requiere canal especial y protocolo de verificación reforzada (KYC).
- **Sanción vigente** deniega la compra (`SANCION_LEY_1445_VIGENTE`) y el ingreso (`RESTRICCION_ACCESO_LEY_1445`).
- **Vigencia**: fecha de ejecutoria más los meses de sanción. Estado automático: vigente o cumplida.
- **Puerta, semáforo:**
  - **Verde**: entra.
  - **Amarillo**: boleta de otro partido, sin boleta asociada o boleta ya usada.
  - **Rojo**: sanción vigente. Se **notifica al PMU** de la Policía Nacional.
- **El torniquete se configura por partido**: una boleta de otro partido no entra.
- **Cotejo nominal con la Registraduría**: el nombre que envía la comercializadora se compara con el
  nombre oficial. Nombre distinto se trata como posible suplantación; nombre de una sola palabra, como incompleto.
- **Estados del documento en la Registraduría**: vigente, cancelada por muerte, cancelada por doble cedulación.
- **Auditoría**: cada consulta registra fecha, origen (comercializadora, torniquete, registro del
  IVC), endpoint, documento, resultado y detalle.

### Documentos que lee la puerta

| Documento | Cómo se lee |
|---|---|
| Cédula digital | QR y zona de lectura mecánica (MRZ, ICAO 9303 TD1) |
| Cédula tradicional (amarilla) | Código PDF417 y OCR del reverso |
| Boleta digital | QR con el código de la boleta o el token del SVN |
| Cualquiera | Número digitado a mano |

### Estados que maneja

- **Boleta**: emitida → ingresada, o anulada.
- **Homologación de comercializadora**: pendiente → en pruebas → homologada. Se renueva por semestre.
  Mindeporte **condiciona la aprobación** del reporte del club a que su comercializadora tenga la
  certificación de interoperabilidad activa con el SVN.

---

## 2 · Base de datos de sancionatorios (Excel)

Hojas: **Registro**, **Diccionario de datos** (41 campos con regla y soporte normativo) y **Catálogos**.

### Campos, por grupo

| Grupo | Campos |
|---|---|
| Control del registro | Fecha de registro (no puede ser futura) |
| Identificación y contacto | Tipo y número de identificación, nombre completo, ciudad y departamento de residencia, dirección, teléfono (máx. 10), correo, fecha de nacimiento, edad (calculada), sexo, ¿es menor de edad? (calculado) |
| Representante legal | Obligatorio si el infractor es menor: tipo y número de identificación, nombre, residencia, dirección, teléfono, correo, fecha de nacimiento, sexo |
| Hechos y conducta | Fecha de los hechos, evento deportivo, competición, ciudad de los hechos, conducta (catálogo de la Ley 1453, selección múltiple), descripción breve |
| Información de la sanción | Acto administrativo o resolución, fecha de constancia de ejecutoria, tiempo de sanción en meses, fin de vigencia (calculado), valor de la sanción, estado de la restricción (automático) |
| Gestión interna | Radicado de entrada en Mindeporte, respuesta al radicado, radicado financiera, radicado jurídica (todos de GESDOC), profesional responsable, observaciones |

### Catálogos

- **Tipos de identificación**: CC, CE, TI, pasaporte, PPT, PEP, RUMV.
- **Sexo**: hombre, mujer, intersexual, prefiero no decirlo.
- **Conductas del art. 97** (Ley 1453 de 2011): 1. armas u objetos peligrosos · 2. estupefacientes ·
  3. violencia contra la fuerza pública · 4. invadir el terreno de juego · 5. desatender a la
  logística en ubicación y tránsito · 6. ingresar o ingerir bebidas alcohólicas.
- **Conductas del art. 98**: a) agresión física · b) agresión verbal · c) daño a infraestructura.
- **Agravantes**: ser organizador o protagonista del evento · ser dirigente de un club profesional ·
  actuar bajo efectos de sustancias.
- **Estado de la restricción**: vigente · cumplida, expirada o vencida.

---

## 3 · Marco normativo citado

| Norma | Qué fija, según los documentos |
|---|---|
| **Decreto 1622 de 2022** | Crea el SVN. Art. 2.17.16, num. 7: máximo 5 boletas por aficionado. Arts. 2.17.3 y 2.17.4, num. 3: documentos válidos de identificación (el Excel cita los dos; confirmar cuál) |
| **Ley 1445 de 2011**, arts. 14 y 15, modificados por la **Ley 1453 de 2011**, arts. 97 y 98 | Conductas sancionables, periodos de prohibición y rangos de multa |
| **Decreto 079 de 2012** | Art. 6, par. 4: la prohibición cuenta desde el día siguiente a la ejecutoria y **rige en todos los escenarios del país** con espectáculos deportivos profesionales con público. Art. 7: lo que debe contener la decisión (identificación, nombre, tiempo, modo y lugar, fundamento, descripción) |
| **Decreto 1007 de 2012**, art. 17 | La información sobre aficionados excluidos debe indicar la causal |
| **Ley 1098 de 2006**, art. 7 | Menores: representante legal obligatorio y protección reforzada |
| **Ley 1581 de 2012** | Protección de datos personales |

---

## Qué cambió en el modelo por estos documentos

| Antes | Ahora, según los documentos |
|---|---|
| Tres fuentes (Policía, IVC, clubes), cada una con su base | **Una base de medidas correctivas en el SUID-IVC.** Las autoridades de policía emiten el acto, el IVC lo radica. Los clubes reportan su comercializadora |
| Anotación, advertencia, sanción y veto | **Medida correctiva** con meses y multa; estado vigente o cumplida |
| Alcance nacional, club, escenario o evento | **Nacional por ley** |
| Saneamiento con aprobación de las tres entidades | **Se cumple sola** al vencer la vigencia |
| Límite de boletas configurable | **5 por aficionado**; más, por canal especial con KYC |
| Credencial genérica | **Token del SVN** en cada boleta |
| Alta de comercializadoras | **Homologación** por semestre, a partir del reporte del club |
| Entra o no entra | **Semáforo** verde, amarillo y rojo; el rojo alerta al PMU |
