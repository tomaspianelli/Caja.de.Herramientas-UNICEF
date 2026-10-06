# Caja de Herramientas — UNICEF Argentina

Presentación web para proyectar. Se navega con el teclado:
- Avanzar: → ↓ RePág Espacio
- Retroceder: ← ↑ RePág

## Estructura

```
index.html
style.css
script.js
.nojekyll
fonts/    UniversLight.ttf · UniversRegular.ttf · UniversBold.ttf
assets/   logos, portadas (Portada-2.1.png … Portada-2.7.png), Portada-2.1.1.png,
          Slide_5_Indice.png, foto-completa-herramienta.png, portada-caja.png, qr-documento.png
```

## Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub y subí **todo el contenido de esta carpeta** (`index.html` tiene que quedar en la raíz).
2. En el repositorio: **Settings → Pages → Build and deployment**.
3. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guardá.
4. A los 1–2 minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Antes de subir

Ejecutá `bash verificar-rutas.sh` en esta carpeta: comprueba que los nombres de archivo coincidan exactamente.
GitHub Pages distingue mayúsculas de minúsculas (`Portada-2.1.png` ≠ `portada-2.1.png`).
