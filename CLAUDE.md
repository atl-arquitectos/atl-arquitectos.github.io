# ATL Arquitectos — sitio web

Sitio estático (HTML/CSS/JS, sin build step) publicado con GitHub Pages en el dominio
`www.atl-arquitectos.com` (ver `CNAME`). Repo remoto: `atl-arquitectos/atl-arquitectos.github.io`.
`gh` CLI ya está autenticado como `atl-arquitectos` en esta máquina (login por navegador, no token
manual) — `git push` funciona directo sin pedir credenciales.

## Estructura de páginas
- `index.html` — home. Referencia de diseño: todo lo demás se hizo "igual que el index".
- `proyectos.html` — galería de 5 proyectos a pantalla completa + hero con video + footer.
- `servicios.html`, `quienes_somos.html`, `contacto.html` — comparten `assets/css/atl.css`.
- `estructural.html` — landing del producto "ATL Estructural" (software), diseño propio,
  navegación con anclas internas (`#features`, `#compat`, etc.) en vez de Proyectos/Servicios/...
- `assets/css/atl.css` — CSS compartido por servicios/quienes_somos/contacto (index y
  proyectos/estructural tienen su CSS inline en el propio `<style>`, por decisión original del
  proyecto, no migrado).
- `assets/js/threejs-bg.js` — fondo 3D (wireframe de skyline, cámara con parallax por scroll y
  mouse). Compartido por las 6 páginas vía `<script src="assets/js/threejs-bg.js">` + un
  `<canvas id="threejs-bg">` en el body + carga previa de
  `https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js`. Extraído de index.html
  (antes eran ~1000 líneas duplicadas inline).
- `assets/js/sound-system.js` — botón flotante "AMBIENT" (audio ambiental, `assets/audio/ambient.mp3`).
  Se auto-inyecta vía JS (`document.body.appendChild`), no necesita HTML propio — solo el CSS
  `.atl-sound-btn` (en `atl.css` o inline según la página) y el `<script>`. Compartido por las 6 páginas.
- `images/`, `assets/img/` — imágenes. `assets/video/hero.mp4` + `hero-poster.jpg` — video del hero,
  reusado también en el hero de `proyectos.html`.
- `index-backup.html` — respaldo local, nunca se publica (está en `.gitignore`).
- `robots.txt`, `.nojekyll`, `CNAME` — configuración de GitHub Pages.

## Patrones de diseño ya aplicados a las 6 páginas (excepto donde se indica)
- **Menú hamburguesa móvil**: punto de quiebre real es ~1100px (no 900px — el nav de escritorio
  con 5 links + redes necesita ~1030px reales; usar 900px dejaba una franja rota en celulares
  grandes/horizontal). CSS: `.nav-toggle`, `.mobile-menu`. Incluye "ATL Estructural" en todos los
  menús.
- **Footer simplificado**: logo + íconos de redes sociales + copyright — SIN repetir los links de
  navegación (se quitó esa duplicación a propósito). Clases `.footer-social`, `.footer-copy`.
  `proyectos.html` fue la última en tener footer (se le agregó igual a las demás).
- **Section-dots** (navegación lateral de puntos): visible también en móvil en todas las páginas
  (antes solo `proyectos.html` lo dejaba visible; se igualó el resto).
- **Fondo 3D (grid wireframe)**: visible detrás de secciones con `background: rgba(8,8,8,0.78)`.
  Regla importante de layout: el tinte oscuro debe vivir en el MISMO elemento que tiene
  `max-width:1400px; margin:0 auto` (igual que `#quienes`/`#especialidades` en index) — si el tinte
  se aplica a un contenedor de ancho completo y el `max-width` a un hijo interior, el tinte tapa el
  grid en TODA la página en vez de solo dentro de la caja de 1400px. Este bug se dio en
  `proyectos.html` (fix en commit `55c68c4`).
- **Cinta de texto animada (marquee)**: "Arquitectura · Diseño · Innovación · ..." debajo del hero,
  en todas las páginas. `proyectos.html` no tenía hero → se le construyó uno nuevo con el mismo
  video del home + esta cinta.
- **Video de fondo del hero**: en index y proyectos. En servicios/quienes_somos/contacto se dejó
  la foto de hero original de cada página (decisión explícita del usuario — no reemplazar por video
  ahí). Bug arreglado: en móvil, el JS que salta el video a ~88% de su duración lo dejaba pausado
  sin reanudarlo (los navegadores móviles pausan al hacer `seek`); ahora escucha `seeked` y
  `pause`/`visibilitychange` para forzar `.play()` de nuevo.
- **`.grid-interlude`**: franjas entre las 5 fotos de `proyectos.html` (solo ahí) donde se ve el
  grid 3D al hacer scroll entre proyectos, sin tapar las fotos. También encajonadas a 1400px.
- **Fotos de proyectos encajonadas**: cada `.proyecto` ahora envuelve su contenido en
  `.proyecto-inner` (max-width 1400px, centrado) — mismo tratamiento que el resto del sitio, deja
  ver el grid en los márgenes en pantallas anchas.

## Gotchas / cosas que costó descubrir
- **GitHub Pages build a veces se queda "atorado"** (`status: "building"` sin avanzar por minutos,
  o directo `"errored"` sin detalle). Es intermitente, no relacionado con el código. Fix: reintentar
  manual con `gh api -X POST repos/atl-arquitectos/atl-arquitectos.github.io/pages/builds`, luego
  revisar `gh api repos/atl-arquitectos/atl-arquitectos.github.io/pages/builds/latest` (build normal
  tarda ~20s).
- **Cache del navegador de preview**: al editar `assets/css/atl.css`, el navegador de pruebas puede
  seguir sirviendo una versión vieja cacheada. Forzar con
  `document.querySelector('link[href*="atl.css"]').href = 'assets/css/atl.css?v=' + Date.now()`
  antes de verificar visualmente.
- **Body con background sólido + canvas fixed z-index:-1**: aunque `body { background: var(--bg) }`
  parece opaco, CSS propaga ese color al canvas raíz del documento (por debajo de todo), así que un
  elemento `position:fixed; z-index:-1` (el canvas del wireframe) sí queda visible por encima —
  siempre que ningún elemento intermedio tenga su propio background opaco tapándolo.
- El repo NO usa Jekyll (`.nojekyll` presente) pero el build de Pages sigue llamándose "legacy
  build" internamente — no confundir con GitHub Actions (no hay `.github/workflows`).
- `estructural.html` queda deliberadamente fuera de algunos cambios "para todas las páginas" salvo
  que el usuario confirme explícitamente lo contrario (se ha preguntado varias veces — la respuesta
  ha sido mitad y mitad según el caso).

## Cómo previsualizar
No hay servidor de preview persistente configurado en este entorno de momento; si se necesita,
levantar uno rápido con `python3 -m http.server 8787` desde la raíz del repo y navegar a
`http://localhost:8787/`.

## Flujo de trabajo
- Cambios van directo sobre los `.html` y `assets/` — no hay paso de build.
- Antes de publicar, revisar visualmente.
- `git push` a `main` dispara el deploy de GitHub Pages automáticamente (con las salvedades de
  "Gotchas" arriba).
- Nunca hacer commit de `index-backup.html` ni de archivos `.DS_Store`.
- El usuario pide confirmación explícita del build de Pages después de cada push ("¿ya está en
  GitHub?") — conviene chequear proactivamente y avisar cuando el build termine.
