# Índice central del proyecto (caché para no releer el código)

Leer esto primero. Actualizar al terminar cada batch o cambio estructural.

## Mapa de archivos

| Archivo | Qué es | ¿Editar a mano? |
|---|---|---|
| `index.html` | Página **Resumen**. ~900 KB: contenido (~líneas 1–2110) + JS de animaciones + bundle highlight.js inline al final. No leer entero: usar Grep. | Sí, con Edit puntual |
| `a-fondo.html` | Página **A fondo**. **Generada** por `tools/build_fondo.py`. | **No**: editar `fondo/` y reconstruir |
| `assets/base.css` | Tokens (colores, fuentes, escala), layout `.shell`/`.index`/`.mobile-nav`, componentes del resumen y **topbar**. Compartido por ambas páginas. | Sí |
| `assets/deep.css` | Componentes sólo de A fondo: `.deep-hero`, `.legend`, `figure.dgm`, `.stepper`, `.mini-wrap`, `.note`, `.kv`. | Sí |
| `assets/deep.js` | Stepper, índice activo, navegación móvil de A fondo. | Sí |
| `assets/theme.js` | Tema claro/oscuro persistente (`localStorage` `cuaderno-ml-theme`) para ambas páginas. Se carga en `<head>` sin defer. | Sí |
| `fondo/layout.html` | Plantilla de A fondo: `<head>`, defs de flechas SVG, topbar, hero, leyenda. Placeholders `{{NAV}}`, `{{SELECT}}`, `{{SECTIONS}}`. | Sí |
| `fondo/temas.json` | Orden, grupos, `id`, `titulo`, `tagline`, `resumen` (ids de fichas del resumen que enlazan aquí). | Sí |
| `fondo/temas/NN-*.html` | Cuerpo de cada tema (sin `<section>` ni `<h2>`). | Sí |
| `tools/build_fondo.py` | Genera `a-fondo.html` e inyecta enlaces `A fondo →` en `index.html` (idempotente). | Sí |
| `.github/workflows/static.yml` | Deploy GitHub Pages del repo completo en push a `main`. | No hace falta |

**Flujo de trabajo:** editar `fondo/…` → `python tools/build_fondo.py` → servir `python -m http.server 8000` → revisar.

## index.html: anclas útiles (buscar con Grep, las líneas cambian)

- Topbar: `<header class="topbar">` justo antes de `<div class="shell">`.
- Sidebar: `<nav class="index"` (una línea larga). Móvil: `<div class="mobile-nav">`.
- Fichas: `<section class="algo" id="ID"` con ids: `stats sigmoid softmax topk loss gd regul linreg logreg perceptron svm knn nbayes tree forest boost pca kmeans dbscan hclust gmm mlp metrics kfold`; tabla `#chuleta`.
- Fila de repaso por ficha: `<div class="done-row">…<span class="done-when"></span>` (+ `<a class="see-deep">` generado). El JS usa `nextElementSibling` del botón = `span.done-when`: no insertar nada entre ambos.
- JS principal: `/* ================= núcleo` … `/* ================= interfaz`. Animaciones 2D en `ANIMS[id]`, 3D en `initHero`/`initPCA`. Repintado de tema: `onTheme` (MutationObserver sobre `data-theme`).

## Tokens (assets/base.css `:root`)

Colores: `--paper --sheet --fig --ink --ink-2 --ink-3 --rule --rule-2 --accent --c1 (azul) --c2 (coral) --c3 (verde) --c4 (ámbar)`. Fuentes: `--f-display` (Bricolage), `--f-body` (Source Serif 4), `--f-math` (STIX Two), `--f-mono` (JetBrains). `--topbar-h: 52px`. Oscuro: `@media (prefers-color-scheme: dark) :root:not([data-theme=light])` y `:root[data-theme=dark]`.

## Convención de diagramas (A fondo)

SVG inline dentro de `figure.dgm > div.scroll > svg` (+ `figcaption`). `viewBox` ancho 960 típico; `min-width` 720 (`.narrow` = 520) → en móvil se desliza dentro de la figura, nunca la página. Sólo clases, nunca colores literales.

| Clase | Uso |
|---|---|
| `g.in` / `rect.in` | nodo de entrada (fondo sheet, borde rule) |
| `g.op` / `rect.op` | operación (fondo ink, texto paper) |
| `g.out` / `rect.out` | salida (borde accent) |
| `g.hot` | el algoritmo dentro del diagrama de sistema |
| `g.st` / `g.dec` / `g.bad` | estado persistido (c3) / decisión (c4) / error o riesgo (c2) |
| `rect.lane`, `rect.grp` | carril de fondo, grupo punteado |
| `path.e.fw` / `.e.bw` / `.e.st` / `.e.dec` / `.e.nt` | arista forward c1 / gradiente c2 punteada / estado c3 / decisión c4 / neutra; flecha automática (`.no-head` la quita) |
| `.ln`, `.ln.ink`, `.ln.dash` | líneas auxiliares sin flecha |
| `text` (13px display), `.m` (math 15px), `.sm` (math 12.5 tenue), `.s` (11px tenue), `.h` (negrita), `.cap` (mayúsculas), `.mid`/`.end` (anchor), `.c1..c4`/`.ac` (color) | texto |
| `.f1..f4 .fi .fa` (fill), `.s1..s4 .sa .si` (stroke), `.soft1..4` (fill suave), `.pt` (punto con borde), `.cell` | marcas de datos |

Markers definidos en `fondo/layout.html`: `#ah-c1 #ah-c2 #ah-c3 #ah-c4 #ah-ink`.

**Stepper**: `div.stepper.dgm` (la clase `dgm` activa estilos SVG) `> div.body > (div.scroll > svg con <g data-step="k"> o "a-b") + ol.panel > li` (un `li` por paso: `<b class="t">`, `<span class="eq">`, `<p>`) + `div.bar` con `button.btn.prev`, `button.btn.next`, `span.count`. Sin JS se ve todo.

**Tabla numérica**: `div.mini-wrap > table` (`td.n` números, `tr.hl` fila resaltada).

## Plantilla de tema (`fondo/temas/NN-*.html`)

1. `<p class="lead">` 1–2 frases.
2. `<h3>Mapa del cálculo</h3>` + `figure.dgm` (entradas → operaciones con fórmula → salidas, formas en aristas).
3. `<h3>Paso a paso</h3>` + `.stepper` con ejemplo numérico chico (valores verificados con NumPy).
4. `<h3>Fórmulas clave</h3>` + `dl.formulas` con derivación.
5. Diagramas extra del tema (geometría, variantes).
6. `<h3>En un sistema real</h3>` + `figure.dgm` (carriles offline/online, bloque `g.hot`) + `dl.kv` (dónde corre, costo, qué monitorear, cuándo re-entrenar).
7. `<h3>Trampas</h3>` + `ul.ojo`.
El script añade `<header>` y enlaces `← Ficha resumen`.

Estilo de texto: caveman en español. Frases ≤ 20 palabras, sin relleno, términos técnicos exactos. Diagrama explica; texto conecta. Nivel de detalle: **alto**.

## Estado de batches

| Batch | Temas | Estado |
|---|---|---|
| 0 | Infra: base.css, topbar, theme.js, deep.css/js, layout, builder, este índice | hecho |
| 1 | 01 backprop · 02 optimizadores · 03 softmax-ce · 04 regularización | hecho |
| 2 | 05 árbol · 06 random forest · 07 gradient boosting · 08 SVM | hecho |
| 3 | 09 PCA · 10 K-Means · 11 GMM/EM · 12 DBSCAN | hecho |
| 4 | 13 umbral/calibración · 14 CV/leakage · 15 KNN/vectorial · 16 sistema ML | hecho |

## Verificación (herramientas en scratchpad de la sesión; recrear si no existen)

- Screenshots: Chrome headless `chrome.exe --headless=new --window-size=W,H --screenshot=out.png URL` (+ `--blink-settings=preferredColorScheme=1` para claro). Recortar con PIL para leer detalle.
- Overflow: página `check.html` con iframes de 375 y 1300 px que reporta `scrollWidth` y elementos que sobresalen (excluye `.scroll`, tablas, `.eq`).
- Ejemplos numéricos: recalcular con NumPy antes de escribirlos.
- Revisar un solo tema: generar copia temporal de `a-fondo.html` sin las demás `section.deep` (y hero oculto), capturar a 1300 px y recortar. Borrar la copia al terminar.
- Validar steppers: máximo `data-step` de cada stepper ≤ número de `<li>` del panel; balance `<svg>`/`<g>`.

## Lecciones (evitan bugs repetidos)

- Grid items con contenido `nowrap` o SVG con `min-width` necesitan `min-width: 0` en el item o desbordan la página en móvil.
- `.cap` aplica `text-transform: uppercase`: no usarlo con fórmulas.
- `--accent` y `--c1` se parecen en oscuro: no usarlos juntos para distinguir series.
- Stepper: la clase `dgm` en el contenedor es obligatoria para los estilos SVG.
- Stepper: grupos pasados quedan a opacidad 0.55. Texto de pasos distintos en la misma posición se encima: usar `class="once"` en el `<g data-step>` (desaparece al pasar) o posiciones distintas.
- Probar un paso concreto: copia temporal con `<script>` que hace `click()` N veces en `.stepper .next` al cargar. Borrar `chrome-prof` del scratchpad si el CSS parece viejo (caché).
- Texto SVG no interpreta LaTeX: escribir subíndices con Unicode (Fₘ₋₁, wⱼ, Σₘ), nunca `F_{m-1}`.
- Tablas de 5 columnas no caben en `.cols`: ponerlas a ancho completo. Figuras SVG chicas (viewBox < 500): `dgm fit` + `max-width` inline, si no se agrandan.
- Flechas que cruzan cajas o captions de carril: rodear por debajo de la caja (`V…H…V`) y acortar captions de `rect.lane`.
- Etiquetas de líneas dentro de un gráfico denso: moverlas fuera del área (debajo del eje) en vez de encima de las líneas.
- `.formulas dd` y `.stepper .eq` son `nowrap`: dd ≤ ~90 caracteres; `.eq` ≤ ~44 caracteres, si no partir en dos `<span class="eq">`.
- Captions de carril: si una flecha baja por la izquierda, alinear el caption a la derecha (`class="cap end" x="944"`).
- Diagrama fuente → control: una columna por par con flecha vertical recta; nunca flechas cruzadas en el mismo `H`.
- Enlaces entre temas dentro de A fondo usan `#<id>-fondo` (ids en `fondo/temas.json`).

Verificación por batch: build sin errores · consola limpia · tema claro y oscuro · 375 px sin scroll horizontal de página · stepper avanza/retrocede · enlaces cruzados funcionan.
