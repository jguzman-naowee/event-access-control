# Superficies · Event Access Control

Quién usa qué, desde dónde y en qué momento. Complementa a [`dominio.md`](dominio.md).

> Estado: **borrador v0** (23-sep-2026). Lo marcado *indefinido* o *exploratorio* todavía no es decisión.

---

## Principio

**Todo lo que ve el hincha va por la comercializadora**, que solo maneja el número de documento y el
@usuario, y nunca toca biometría. La foto de referencia la captura nuestro componente embebible
cuando la persona acepta su primera boleta, y nos llega directo. Los derechos de la persona (ver su estado,
apelar) van en un portal propio, porque la comercializadora nunca conoce el motivo de un no.

---

## Mapa de superficies

| # | Superficie | Quién la usa | Dispositivo | Cuándo |
|---|---|---|---|---|
| A | **API + componentes embebibles** | Comercializadora (y, a través de ella, el hincha) | Su web o su app | Desde el enrolamiento hasta el inicio del encuentro |
| B | **Consola de restricciones** | Policía Nacional, IVC (MinDeporte), clubes | Web de escritorio, en oficina | Continuo, sobre todo después de cada fecha |
| C | **Backoffice de eventos** | Organizador o club local, administrador del escenario | Web de escritorio | Semanas y días antes |
| D | **Acceso en puerta** | Operador de puerta, y la Policía con su vista ampliada | App propia y/o hardware de terceros | Horas antes y durante el evento, con o sin conexión |
| E | **Centro de control** | Supervisor del evento; la Policía (reportes) | Pantallas grandes en el puesto de mando (PMU) | El día del evento |
| F | **Consola de soporte** | Soporte | Web de escritorio | Continuo, con picos antes del plazo de asignación |
| G | **Administración de la plataforma** | Administrador de la plataforma | Web de escritorio | Al incorporar comercializadoras o actores |
| H | **Portal de la persona** | La persona | Web móvil | Cuando recibe un no, o para revisar sus datos |

---

## A · API + componentes embebibles

La comercializadora arma su propio recorrido para el hincha: comprar, ver sus boletas, invitar,
aceptar, transferir, ver el estado de cada invitación y mostrar su credencial. Para validar solo
necesita el **número de documento** o el **@usuario**; nunca recibe ni guarda biometría.

Tiene **dos formas de integrarse**:

| Forma | Qué hace la comercializadora |
|---|---|
| **Con componentes embebibles** (recomendada) | Ubica nuestros componentes en su recorrido |
| **Solo API** | Arma toda la interfaz ella misma; si el titular no tiene referencia, redirige a nuestro portal para capturarla al aceptar |

Los componentes embebibles:

- **"Ingresar con [plataforma]"**: el registro y el inicio de sesión con el @usuario compartido entre
  todas las comercializadoras.
- **Validación con foto**: foto con prueba de vida al aceptar la primera boleta, si el titular no
  tiene referencia. Es obligatoria para que la boleta quede asignada.

---

## D · Acceso en puerta *(indefinido)*

Lo que ya está definido: **una app propia que lee la boleta (QR), el documento y el rostro** con la
cámara del dispositivo. La huella se lee con un lector externo, si hace falta.

Para el hardware hay dos caminos, igual que en A:

| Forma | Qué es |
|---|---|
| **App propia** | Nuestra app en dispositivos de mano, con el lector de huella externo si aplica |
| **Gateway de dispositivos** | Un contrato abierto para que torniquetes y lectores de terceros pidan la misma decisión de acceso y descarguen el mismo paquete del evento para operar sin conexión |

En los dos casos la decisión es la misma y la toma el sistema, no el dispositivo. El método que se
exige a cada persona (solo cédula, o cédula más rostro) sale de su **confianza de identidad** (`dominio.md`).

### Captura en puerta

Para los titulares a cargo sin foto de referencia, la app de puerta verifica con el documento físico
y captura la foto en ese ingreso. Sin conexión, la foto se guarda en el dispositivo y se sincroniza después.

### Vista policial *(exploratorio)*

Es un complemento de la app de puerta, disponible **solo para el rol Policía**. Además del resultado
de la validación, muestra:

- El historial de conducta de la persona, en las tres fuentes.
- Su perfil de afinidad.
- Indicadores de seguridad (por definir cuáles y cómo se calculan).

Cada consulta desde esta vista queda auditada: quién consultó, a quién, cuándo y en qué puerta.

---

## E · Centro de control

- **Supervisor del evento**: ingresos en vivo por sector y por puerta, alertas y conflictos de las validaciones sin conexión.
- **Policía**: reportes del evento. En el estadio consulta a las personas desde la vista policial de D.

---

## H · Portal de la persona

- Ver su estado y sus registros de conducta.
- Apelar un registro.
- Administrar sus consentimientos, incluida la biometría.
- Revocar sus vínculos con comercializadoras.
- Hacer la validación con foto, cuando la comercializadora está integrada solo por API.

Cuando la comercializadora recibe un no, solo le muestra un enlace al hincha:
*"No es posible continuar. Consultá tu estado en [portal]"*.

---

## Línea de tiempo del evento

| Momento | Qué pasa | Superficies |
|---|---|---|
| Semanas antes | Silletería, configuración del evento, cupos, plazo de asignación | C, G |
| Días antes | Venta, invitaciones, transferencias, reclamaciones | A, F, H |
| Horas antes | Vence el plazo; cada puerta descarga su paquete del evento; se prueban los dispositivos | C, D |
| Inicio del encuentro | Todo queda congelado; solo se puede entrar | D, E |
| Durante el evento | Ingresos, ingresos tardíos, incidentes, consultas policiales | D, E |
| Después del evento | Sincronización de lo validado sin conexión, reportes, registros de conducta nuevos | B, E |

---

## Preguntas abiertas

- Hardware de puerta: si ofrecemos la app propia, el gateway de dispositivos o los dos.
- Vista policial: qué indicadores de seguridad muestra y de dónde salen.
