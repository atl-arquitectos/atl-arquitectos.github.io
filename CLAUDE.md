# ATL Arquitectos — sitio web

Sitio estático (HTML/CSS/JS, sin build step) publicado con GitHub Pages en el dominio
`www.atl-arquitectos.com` (ver `CNAME`). Repo remoto: `atl-arquitectos/atl-arquitectos.github.io`.

## Estructura
- `index.html` — página principal
- `proyectos.html`, `servicios.html`, `quienes_somos.html`, `contacto.html`, `estructural.html` — demás páginas
- `assets/` — css, sass (fuente, sin pipeline de compilación configurado), js libs, imágenes, audio, video, webfonts
- `images/` — imágenes adicionales usadas por las páginas
- `index-backup.html` — respaldo local, nunca se publica (está en `.gitignore`)
- `robots.txt`, `.nojekyll`, `CNAME` — configuración de GitHub Pages

## Cómo previsualizar
Servidor local ya configurado en `.claude/launch.json` (`atl-site`, puerto 8787, `python3 -m http.server`).
Usar la herramienta de preview del entorno para levantarlo en vez de correrlo manualmente por Bash.

## Flujo de trabajo
- Cambios van directo sobre los `.html` y `assets/` — no hay paso de build.
- Antes de publicar, revisar visualmente con el preview.
- Los cambios se despliegan automáticamente al hacer push a `main` (GitHub Pages sirve desde ahí).
- Nunca hacer commit de `index-backup.html` ni de archivos `.DS_Store`.
