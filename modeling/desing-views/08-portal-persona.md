# 8 · Portal de la persona *(nueva)*

## La superficie

| | |
|---|---|
| **Quién** | La persona (y el representante legal de un menor) |
| **Dispositivo** | Web móvil |
| **Cuándo** | Cuando recibe un no, o cuando quiere revisar sus boletas y vínculos |
| **Módulos** | 1 · Medidas (la suya); 2 · Identidad (cuenta, consentimientos); 4 · Boletería (sus boletas) |
| **Pregunta que responde** | ¿Por qué me dijeron que no, hasta cuándo, y qué puedo hacer? |

Existe porque la comercializadora no conoce el motivo de un no (`superficies.md` · *Principio*). Es
donde se cumplen los derechos de la persona sobre sus datos.

**Prototipo:** `prototype/svn/apps/portal.js` (ruta `#/portal`, celular): identificarse, Mi estado, cómo controvertirla, otros motivos, boletas y vínculos, con panel de 7 casos.

## Pantallas

| Pantalla | Para qué | Contenido clave |
|---|---|---|
| **Identificarse** | Que solo la persona vea lo suyo | Documento y verificación (con el ANI o la cuenta); el representante legal entra por el menor |
| **Mi estado** | Responder el no | *Sin medidas vigentes*, o la medida: autoridad que la emitió, acto, desde y hasta cuándo, días restantes |
| **Cómo controvertirla** | Saber a quién acudir | Autoridad competente y datos de contacto *(exploratorio: los documentos no cubren la apelación)* |
| **Otros motivos** | Cuando el no no es una medida | *Tu documento no aparece vigente en la Registraduría* · *El nombre no coincide*; qué hacer en cada caso |
| **Mis boletas e invitaciones** | Ver qué tiene a su nombre | Boletas asignadas, invitaciones pendientes, transferencias |
| **Consentimientos y vínculos** | Administrar sus datos | Comercializadoras vinculadas, *Revocar*; foto de referencia y su consentimiento, solo con el módulo biométrico encendido |

## Qué ve cada rol

La persona ve **solo lo suyo**, incluida su medida con sus hechos. El representante legal ve la del
menor que representa.

## Reglas que hace cumplir

- **La medida se cumple sola**: al vencer, *Mi estado* pasa a *Sin medidas vigentes* sin trámite.
- **Revocar un vínculo no corta operaciones en curso.**
- **Cada consulta queda auditada**, como cualquier otra.

---

## Auditoría del demo

No existe. El demo termina en la caja roja del rechazo de compra (ver `07`), sin salida para la persona.

## Preguntas abiertas

- ¿Con qué se identifica la persona sin cuenta: una consulta al ANI con preguntas de seguridad, o la
  cuenta de la plataforma?
- ¿La apelación la recibe el IVC o la autoridad de policía que emitió el acto?
