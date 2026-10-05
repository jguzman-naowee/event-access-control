# 0 · Transversal

Lo que comparten todas las superficies: cómo se separan por rol, el vocabulario, el semáforo y los
patrones de interfaz. Al final, la auditoría del marco del demo (`static/index.html`: encabezado,
cuatro pestañas, métricas y modal *Conectar smartphone*).

---

## Principios

- **Una aplicación por superficie y rol**, dentro del shell de NaoSuite. Los permisos de *Quién ve
  qué* (`superficies.md`) se resuelven por sesión, no escondiendo pestañas.
- **El SVN valida, registra y audita; no vende.** Ninguna superficie nuestra muestra precios ni cobra.
- **Consulta ciega en todo lo que toca a la comercializadora y al operador**: resultado y código de
  motivo, nunca hechos ni expediente.
- **La Registraduría (ANI) es un servicio compartido**: la venta, la asignación, la puerta, la
  radicación, el reporte de una entidad y el portal de la persona lo consultan igual, con el mismo
  resultado (documento vigente o no, nombre coincide o no).
- **La biometría es un módulo desacoplable**: toda pantalla que la use funciona también con el módulo
  apagado, con documento y ANI.
- **Todo deja rastro**: cada consulta, cada decisión de un operador y cada apertura de datos protegidos
  es una transacción de la auditoría (`dominio.md` · *Auditoría*).

## Vocabulario

Un término por concepto, el del dominio:

| Usar | No usar |
|---|---|
| Medida correctiva | Sanción, veto, restricción (salvo cuando se cita la norma) |
| Vigente · Cumplida | Caducada, expirada, activa |
| Puerta · Torniquete (el dispositivo) | Molinete, taquilla |
| Comercializadora | Tiquetera |
| Titular · Propietario | Espectador, comprador (salvo en la compra) |
| Consulta a la base nacional | POST al API Gateway, endpoint |

## El semáforo, igual en todas

| Color | Texto | Quién lo resuelve |
|---|---|---|
| Verde | **Entra** | Nadie: la boleta queda usada |
| Amarillo | **Entra · aviso** + causa (medida recién levantada · indicativos cruzados) | Nadie: entra igual y el supervisor y la Policía quedan avisados |
| Rojo operativo | **No entra** + causa (boleta de otro partido, ya usada, vencida, falsa, sin boleta) | Nadie la autoriza; el operador elige si llama a la Policía |
| Rojo por medida | **No entra** | Nadie en la puerta; alerta al PMU |

Siempre con texto e icono al lado del color, nunca solo el color.

## Patrones de interfaz

- Componentes del SDK (`@naowee-tech/sdk-react-components`), tokens `--naotech-*` e iconos de foundations.
- Toasts y confirmaciones del SDK (`useToast`, `useConfirmation`), nunca `alert()` ni `confirm()`.
- Datos protegidos (menores, expediente) **enmascarados por defecto**, con *Ver* que pide motivo.
- Métricas propias de cada superficie, solo las que sirven para decidir en ella.
- Lenguaje de funcionario; la traza técnica vive solo en el portal de integración (6).
- Accesibilidad AA: zoom permitido, objetivos táctiles de 44 px como mínimo (48 en la puerta).

---

## Auditoría del marco del demo

**Qué conservar:** un solo hilo de datos entre vistas (lo vendido aparece en la puerta y en el
monitor) y el atajo *Probar ingreso con esta boleta*, útil como recurso de guion.

| Sev. | Hallazgo | Evidencia |
|---|---|---|
| **Crítico** | **Cuatro roles con permisos opuestos en una sola página**: IVC, comercializadora, operador y Policía comparten pestañas; nada separa quién ve el expediente. | `index.html:33-46` |
| **Crítico** | **_Bloqueos: sanciones aplicadas efectivamente_ cuenta también los amarillos**, que no son medidas. El número subió con cada boleta repetida del recorrido. | `index.html:68-72`, `server.py` `/api/info` |
| Alto | Las mismas cuatro métricas en todas las pestañas: a la puerta no le sirve *Medidas en base* ni al IVC *Boletas con token*. | `index.html:52-73` |
| Alto | Jerga técnica de cara al usuario: *Migradas de Excel a PostgreSQL* (la base es SQLite), *Endpoint*, *Token criptográfico*, *Streaming activo*. | `index.html:56`, `:378` |
| Alto | `alert()` y `confirm()` nativos para éxito, error y confirmación. | `app.js:332`, `:340`, `:661` |
| Medio | *Sanción* y *medida correctiva*, *molinete*, *torniquete* y *puerta* se usan como sinónimos. | `index.html:89`, `:409`, `:261` |
| Medio | No responde a pantallas angostas: a 390 px las pestañas se cortan sin indicio de scroll. | `styles.css:591-604` |
| Medio | Iconos con emoji, que cambian por sistema y el lector de pantalla lee en voz alta. | Todo `index.html` |
| Medio | El QR de *Conectar smartphone* se genera en un servicio externo, y la IP local aparece en el encabezado. | `app.js:180`, `:706` |
| Bajo | El título dice *SUID - FUTBOL \| ACCESO*; el sistema se llama SVN. | `index.html:6` |
