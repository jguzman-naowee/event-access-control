#!/usr/bin/env python3
"""
Arma index.html: UNA sola página del deck con todo adentro. Es la que se abre con
doble clic Y la que se publica — el mismo archivo, sin segunda versión.

El visor de artifacts bloquea (sin error) cualquier <link rel="stylesheet">
que no venga de fonts.googleapis.com, así que las cuatro hojas del SDK,
deck.css y las fuentes van embebidas. Los scripts van inline por la misma
razón: que nada dependa de una petición que el visor pueda cortar.

No es un build: no transforma nada. Concatena en el mismo orden que
dev.html (la mesa de trabajo, con archivos separados) y convierte las fuentes a data URI.
"""
import base64, re, pathlib

raiz = pathlib.Path(__file__).parent
html = (raiz / 'dev.html').read_text(encoding='utf8')

def data_uri(rel, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode((raiz / rel).read_bytes()).decode('ascii')

def css_con_fuentes(rel):
    # Las hojas del SDK vienen con BOM. Enlazadas el navegador lo descarta;
    # embebidas en <style> invalida la primera regla (el @font-face de los
    # iconos, el .nwt-app). Fuera.
    css = (raiz / rel).read_text(encoding='utf8').lstrip('\ufeff')
    base = pathlib.Path(rel).parent
    def sub(m):
        ruta = m.group(1).strip('\'"')
        if ruta.startswith(('data:', 'http')): return m.group(0)
        f = (base / ruta).as_posix()
        mime = {'.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'}[pathlib.Path(f).suffix]
        return 'url(' + data_uri(f, mime) + ')'
    return re.sub(r'url\(([^)]+)\)', sub, css)

head = re.search(r'<head>(.*?)</head>', html, flags=re.S).group(1)
body = re.search(r'<body>(.*?)</body>', html, flags=re.S).group(1)

titulo = re.search(r'<title>.*?</title>', head).group(0)
descr  = re.search(r'<meta name="description"[^>]*>', head).group(0)
hojas  = re.findall(r'<link rel="stylesheet" href="([^"]+)">', head)
scripts = re.findall(r'<script src="([^"]+)"></script>', body)
resto = re.sub(r'\s*<script src="[^"]+"></script>', '', body).strip()

# Las imágenes locales (logos/) también van como data URI: el visor no sirve archivos sueltos.
resto = re.sub(r'(src|href)="(logos/[^"]+)"',
               lambda m: '%s="%s"' % (m.group(1), data_uri(m.group(2), {'.png': 'image/png', '.svg': 'image/svg+xml'}[pathlib.Path(m.group(2)).suffix])),
               resto)

# El charset va PRIMERO y explícito: sin él, servido por http sin cabecera
# (python -m http.server, un hosting cualquiera) el navegador adivina la
# codificación y las tildes y los glifos del set de iconos salen rotos.
out = ['<meta charset="utf-8">', titulo, descr,
       '<!-- Generado por publicar.py desde dev.html. Editar la carpeta, no este archivo. -->']
for h in hojas:
    out.append('<style data-origen="%s">\n%s\n</style>' % (h, css_con_fuentes(h)))
out.append(resto)
for s in scripts:
    js = (raiz / s).read_text(encoding='utf8')
    assert '</script' not in js, s
    out.append('<script data-origen="%s">\n%s\n</script>' % (s, js))

(raiz / 'index.html').write_text('\n'.join(out) + '\n', encoding='utf8')
print('index.html: %.1f MB · %d hojas · %d scripts' % ((raiz / 'index.html').stat().st_size / 1e6, len(hojas), len(scripts)))
