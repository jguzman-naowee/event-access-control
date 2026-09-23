# Kick-off · Event Access Control

Deck de 16 slides del modelo v0 (`modeling/dominio.md` y `modeling/superficies.md`), con la
paleta y la tipografía de `sdk-frontend-foundations` y la navegación hecha con botones del SDK.

## Abrirlo

Doble clic en `index.html`. Funciona sin servidor. Flechas o espacio para avanzar, `Inicio` y
`Fin` para saltar, `#7` en la URL para abrir la slide 7.

## Editar y sincronizar

1. Editar `dev.html` (el contenido) o `deck.css` (el estilo). `dev.html` también se abre con doble clic.
2. `python3 publicar.py`: regenera `index.html` con todo embebido (CSS, fuentes y script).
3. Republicar `index.html` sobre la misma URL del artifact.

`index.html` es generado: no se edita a mano.

Artifact: https://claude.ai/artifact/KQs3PVuZJc6ff5oRzLt3Hh (privado). `artf.html` abre ese enlace.

## Estructura

```
artf.html    vínculo local al artifact publicado
index.html   LA página: todo embebido, la que se abre y la que se publica (generada)
dev.html     mesa de trabajo: las 16 slides, con archivos separados
publicar.py  genera index.html desde dev.html (no transforma, solo concatena y embebe)
deck.css     lo que el SDK no tiene (prefijo dk-), todo en tokens --naotech-*
deck.js      escala el lienzo de 1920×1080 y maneja la navegación
vendor/      copia de sdk-frontend-foundations + Google Sans recortada a latín. NO SE EDITA
```
