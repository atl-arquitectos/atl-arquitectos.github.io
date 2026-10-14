# ATL Arquitectos — sitio web

Sitio estático (HTML/CSS/JS, sin build step) publicado con GitHub Pages en el dominio
`www.atl-arquitectos.com` (ver `CNAME`). Repo remoto: `atl-arquitectos/atl-arquitectos.github.io`.
`gh` CLI ya está autenticado como `atl-arquitectos` en esta máquina (login por navegador, no token
manual) — `git push` funciona directo sin pedir credenciales.

## Estructura de páginas
- `index.html` — home. Referencia de diseño: todo lo demás se hizo "igual que el index".
- `proyectos.html` — galería de 5 proyectos a pantalla completa + hero con video + footer.
- `servicios.html`, `quienes_somos.html`, `contacto.html` — comparten `assets/css/atl.css`.
- `library.html` — landing de **ATL Library** (biblioteca de objetos para ArchiCAD). Se creó copiando
  el diseño de `estructural.html` (mismo fondo/estilo, nav con anclas internas). Tiene lista de espera
  con correo (Web3Forms, misma access_key que contacto.html).
- `estructural.html` — landing antigua de "ATL Estructural". YA NO está enlazada en ningún menú ni en
  el home (reemplazada por library). El archivo sigue en el repo; respaldo adicional fuera del repo en
  `~/Desktop/respaldo-atl-estructural/` (página + banner del home). El software vive en otro proyecto.
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
- `images/`, `assets/img/` — imágenes. `assets/img/atl-logo-white.png` — logo blanco (también usado
  para la firma de correo del usuario, generado en esta sesión). Ver sección de videos de hero abajo
  para `hero.mp4` / `hero-alt.mp4`.
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
- **Video de fondo del hero**: TODAS las páginas ya tienen video de hero (ya no hay fotos estáticas
  de hero en ninguna). Dos videos distintos:
  - `assets/video/hero.mp4` + `hero-poster.jpg` — toma nocturna de edificio con ventanales, usado en
    `index.html` y `proyectos.html`.
  - `assets/video/hero-alt.mp4` + `hero-alt-poster.jpg` — toma aérea del Monumento a la Revolución
    (CDMX), usado en `servicios.html`, `quienes_somos.html` y `contacto.html`. Comprimido de 17MB a
    5.9MB (crf 26) desde el archivo fuente que el usuario dejó en su Escritorio.
  - Estructura reusada: en index/proyectos el hero es una `<section>` propia a pantalla completa; en
    servicios/quienes_somos/contacto el video vive dentro de `.page-hero-bg` (que antes usaba
    `background-image`, ahora tiene un `<video>` hijo con `object-fit:cover`), reutilizando el resto
    del `.page-hero`/`.page-hero-fade`/`.page-hero-content` que ya existía.
  - Bug arreglado (solo afectaba a index/proyectos, que sí tienen el JS de salto de tiempo): en
    móvil, el JS que salta el video a ~88% de su duración lo dejaba pausado sin reanudarlo (los
    navegadores móviles pausan al hacer `seek`); ahora escucha `seeked` y
    `pause`/`visibilitychange` para forzar `.play()` de nuevo.
- **`.grid-interlude`**: franjas entre las 5 fotos de `proyectos.html` (solo ahí) donde se ve el
  grid 3D al hacer scroll entre proyectos, sin tapar las fotos. También encajonadas a 1400px.
- **Fotos de proyectos encajonadas**: cada `.proyecto` ahora envuelve su contenido en
  `.proyecto-inner` (max-width 1400px, centrado) — mismo tratamiento que el resto del sitio, deja
  ver el grid en los márgenes en pantallas anchas.
- **El tinte `rgba(8,8,8,0.78)` del `footer`** originalmente solo estaba en `index.html` (era parte
  de su selector compartido `#quienes, #especialidades, ..., footer { background: ... }`). Se agregó
  explícitamente al `footer` de `atl.css`, `proyectos.html` y `estructural.html` (fix en commit
  `cde4cd0`) — si se toca el CSS del footer en cualquier página nueva, no olvidar este tinte.
- **`servicios.html` — `.servicios-wrap` y `.servicio-info`** usaban un fondo sólido opaco
  (`var(--bg)`) en vez del tinte translúcido `rgba(8,8,8,0.78)` que usan las secciones equivalentes
  de las demás páginas (`.estudio-section`, `.contact-section`) — por eso no dejaba ver el grid
  detrás del texto. Corregido en el mismo commit `cde4cd0`.
- **Logo en vez de foto**: en `quienes_somos.html`, sección "Nuestra historia", la foto de render se
  reemplazó por `assets/img/atl-logo-white.png` (el logo blanco, generado antes en la sesión para
  firma de correo). Usa una clase modificadora `.estudio-img.is-logo` (fondo sutil, `object-fit:
  contain`, sin el zoom al hover que sí tienen las fotos reales) — no reusar `.estudio-img` a secas
  para logos, se vería recortado/deformado con el `object-fit:cover` normal.

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
- **Herramientas de preview inestables en esta sesión**: el MCP `Claude_Preview` (preview_start,
  preview_screenshot, etc.) dejó de estar disponible a mitad de sesión sin aviso previo — si
  `mcp__Claude_Preview__*` falla con "No such tool available", no reintentar, usar el fallback de
  abajo. `claude-in-chrome` (el navegador real del usuario) también ha tenido desconexiones
  transitorias — un síntoma visto: un `<video>` con `autoplay` reporta `paused:true` justo después
  de un hiccup de conexión aunque el HTML/CSS estén perfectamente bien; antes de diagnosticar un bug
  real, recargar la página (`navigate` de nuevo a la misma URL) y volver a chequear.
- **Levantar servidor local manualmente** (ya que `preview_start` puede no estar disponible):
  `(python3 -m http.server 8787 &>/tmp/pyserver.log &)` desde la raíz del repo, luego
  `lsof -ti:8787 | xargs kill` para pararlo al terminar. Ya está en el allowlist de permisos.

## Copy / textos actualizados en esta sesión
- Home, tagline del hero: ahora entre comillas tipográficas — `"La arquitectura es un acto de
  responsabilidad social y ambiental."`
- Home, "Quiénes somos" (resumen corto): sin la palabra "contemporáneos" al final.
- `quienes_somos.html`, sección "Nuestra historia": título cambiado a "¿Qué es ATL Arquitectos?" y
  los 3 párrafos reescritos con enfoque en sustentabilidad (materiales de bajo impacto, madera
  certificada, bambú, concreto de cáñamo, etc.) — reemplaza el texto anterior centrado en
  "experiencia técnica acumulada".

## Permisos de Claude Code (`.claude/settings.json`)
Ya tiene un allowlist de comandos de solo lectura (`git status/diff/log`, `ls`, `find`, `grep`,
`python3 -m http.server`, `curl` a localhost/al sitio en vivo, `ffprobe`, `pip3 show`). Regla
importante: **nunca se agregó una regla para `gh api`** aunque se usa mucho (checar el build de
GitHub Pages) — un patrón de prefijo tipo `Bash(gh api repos/.../pages*)` no puede distinguir de
forma confiable un GET de un `-X POST` si las banderas cambian de orden (ej. `gh api repos/... -X
POST` en vez de `gh api -X POST repos/...`), así que sería inseguro. Alternativa pendiente que se
propuso pero no se implementó: un script `.sh` fijo con el comando exacto, agregado al allowlist por
su ruta — retomar esto si el usuario lo vuelve a pedir.

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

## ATL Library — visión y decisiones (2026-10)
- **Meta del usuario:** ser un pilar para impulsar ArchiCAD frente a Revit, a nivel MUNDIAL (no solo
  México). Línea futura: plugins/herramientas (API de Python/JSON de ArchiCAD; add-ons C++ más adelante).
- **Solo ArchiCAD**, versión del usuario: **ArchiCAD 29**. Objetos GDL en bibliotecas `.lcf`.
- **Modelo de negocio:** packs GRATIS a cambio de correo + packs PRO de pago. Precios: máx **1 USD por
  objeto** y máx **5 USD por pack** (pack de ~20 objetos). Aviso: las pasarelas cobran tarifa fija por
  transacción, así que la venta suelta de 1 USD no es rentable; vender packs. Cobro/entrega de pagos vía
  plataforma externa (Lemon Squeezy/Gumroad/Mercado Pago), el sitio es solo catálogo (GitHub Pages no
  protege archivos). Solo vender objetos modelados por el usuario (no la biblioteca de Graphisoft ni
  modelos de fabricantes).
- **Primer contenido:** mínimo 20 objetos, empezando por **MEP eléctrico** (apagadores, contactos, salidas
  de luz, centro de carga, medidor, registros, datos/TV, minisplit, sensores, ventilador...). Pack gratis
  de ~10 objetos básicos. Cada objeto: símbolo 2D + 3D ligero, parámetros, clasificación IFC; variantes
  NOM/NEC (127 V) e IEC (230 V). Se modelará en una sesión aparte (probar conector Tapir con ArchiCAD).
- **Idiomas (PENDIENTE, paso 2):** TODO el sitio debe tener español + inglés con selector. Decisión
  recomendada: páginas separadas en `/en/` (mejor SEO) con botón ES | EN en el menú y `hreflang`.
  Las traducciones las hace Claude y el usuario las revisa.
- **Pendiente después:** catálogo (`catalog.json`) + tarjetas de objetos, cobro/descargas, textos legales
  (licencia de uso, privacidad por correos, términos), reemplazar la vista previa ilustrativa del mockup
  por capturas reales, y sección de equipo/textos en plural → singular (ahora el estudio es solo el usuario).
- El equipo en `quienes_somos.html` quedó con UNA sola persona (se quitó "Dirección de Diseño / Asociada").

## ATL Library — estructura implementada (2026-10)
- `library.html` (portada) + `library-catalog.html` (plantilla única de catálogo, se llena con JS desde
  `assets/data/library-catalog.json`; navegación por query: `?g=<grupo>`, `?c=<categoría>`, `?s=<subcat>`).
- **Grupos:** Arquitectura (01 Arquitectura, 09 Estructura) · Interiores y equipamiento (02 Mobiliario,
  03 Cocina, 04 Baño, 10 Equipamiento) · MEP (06 Eléctrico, 05 Iluminación, 07 HVAC, 08 Hidrosanitario).
  Decidido: Iluminación en MEP; Baño/Cocina en Interiores; Seguridad dentro de Equipamiento.
- **Agregar un objeto:** añadir una entrada en `objects` del JSON (cat, sub, pack, icon, status, es, en,
  tags). Agregar categoría/subcategoría = una línea en `categories`. Nombres ya bilingües (es/en) en el
  JSON; la UI aún está en español (`LANG` en el script de library-catalog.html) — falta el paso ES/EN.
- Los 8 objetos actuales son EJEMPLOS con `status: "soon"` (en desarrollo), no productos reales.
- El menú de la librería tiene submenú "Catálogo" (hover) con los 3 grupos; menú móvil lo lista plano.
- Sin cuentas de usuario por ahora (decisión: usar la cuenta de la plataforma de venta; ver cuentas
  propias con Supabase/Firebase más adelante si hay demanda).
- Pendiente: páginas de ficha por objeto, packs/compra, legal, inglés en todo el sitio, imágenes reales.

## ATL Library — navegación (actualizado)
- Menú de arriba en library.html y library-catalog.html = el MISMO menú principal del sitio (Proyectos,
  Servicios, Estudio, Contacto, ATL Library + redes). Ya no hay enlaces estilo "Características/Planes".
- Menú propio de la librería = barra de categorías (grupos → categorías → subcategorías) fija bajo el
  menú: `<div class="cat-bar" id="bar">` + `assets/js/library-bar.js` + `assets/css/library-bar.css`.
  Se dibuja desde `assets/data/library-catalog.json`. TODA página nueva de la librería debe incluir ese
  div, el css y el js. A la derecha de la barra: "Packs" y botón "Lista de espera".
- Gotcha: `overflow-x: hidden` en html/body rompe `position: sticky`; en estas páginas se usa `clip`.

## ATL Library — aspecto independiente (actualizado)
- La librería debe parecer un sitio PROPIO dentro del dominio (como antes ATL Estructural): en
  library.html y library-catalog.html NO se usa el menú principal del sitio. Header propio: logo
  "ATL Library", grupos (Todo/Arquitectura/Interiores/MEP) + Packs, botón "Pack gratis" y enlace
  "ATL arquitectos ↗" para volver. Debajo, la barra de categorías/subcategorías (library-bar.js).
- Se eliminaron los restos de Estructural: mockup de software, sección Compatibilidad, "Lista de
  espera" (ahora "Pack gratis": el correo recibe el Pack 01 cuando exista), etiquetas Beta/En desarrollo
  en la portada. Portada: hero → categorías → "Cada objeto incluye" → packs → pack gratis.
- Los ids internos del formulario siguen llamándose waitlist* (no visibles); la sección es `#free`.
- Las demás páginas del sitio siguen enlazando a "ATL Library" en su menú.
- Altura del header/barra de Library es FIJA (nav sin encogerse; la barra siempre tiene 2 filas: categorías +
  subcategorías o un aviso). Si se agregan filas o se cambia el padding del nav, mantener esa estabilidad.
- Los archivos library-bar.css/js se enlazan con `?v=N`; subir N al modificarlos (GitHub Pages cachea 10 min).

## ATL Library — primer objeto publicado (2026-10-14)
- **Centro de carga QO** (2 a 42 espacios, MEP conectable, ArchiCAD 29+), GRATIS "hasta que tenga alcance
  real". Archivo: `library-files/centro-de-carga-qo-atl.zip` (gsm + instrucciones), copiado de
  `~/Desktop/Libreria BIM Electrica/publicar/`. Los objetos nuevos siguen el mismo flujo: zip en
  `library-files/` + entrada en `assets/data/library-catalog.json` (campos: file, fileName, version,
  desc_es/en, specs, status "available").
- Ficha: `library-object.html?o=<id>` (generada por script desde el shell del catálogo; si se vuelve a
  generar, hay que repetirlo). Descarga con correo "blando": el correo llega por Web3Forms al dueño y se
  guarda un flag en localStorage; el ZIP en sí es un enlace público (no hay protección real).
  Si algún objeto pasa a PAGO, NO guardarlo en el repo: usar plataforma externa (Lemon Squeezy/Gumroad).
- Quitados los 7 objetos de ejemplo del catálogo; solo hay objetos reales. Imagen de la ficha = ícono
  temporal (pendiente captura/render del tablero).
- Pendiente: versión "Compatible" AC24+ del tablero, imagen real, más objetos del pack 01.
- **Analítica privada:** `assets/js/analytics.js` (GoatCounter) incluido en TODAS las páginas pero INACTIVO
  hasta poner el código del sitio en `var CODE = ''`. El panel de GoatCounter solo lo ve el dueño (cuenta
  con login). Cuenta eventos `registro-<id>` y `descarga-<id>` en las fichas. No cuenta en localhost.
