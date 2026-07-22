# Mamíferos de Colombia — Catálogo interactivo

Sitio web estático (HTML + CSS + JavaScript, sin frameworks ni paso de
compilación) que muestra un catálogo de 553 especies de mamíferos
registradas en Colombia, con filtros de búsqueda, mapa de distribución por
departamento y una ficha individual por especie con foto, descripción y
claves de identificación.

Pensado para publicarse gratis en **GitHub Pages**.

---

## 1. Estructura del proyecto

```
mamiferos-colombia/
├── index.html              # Única página del sitio (estructura HTML)
├── css/
│   └── styles.css          # Todos los estilos (colores, tipografía, layout)
├── js/
│   ├── fotos-config.js     # <- AQUÍ agregas las fotos de cada especie
│   ├── mapa.js              # Lógica de los mapas interactivos (Leaflet)
│   └── app.js               # Lógica principal: filtros, tarjetas, ficha modal
├── data/
│   ├── especies.json        # Los datos de las 553 especies
│   └── departamentos.geojson # Formas geográficas de los 33 departamentos
├── images/                  # Fotos subidas directamente (ver LEEME.md)
└── docs/
    └── GUIA-CONTENIDO.md    # Cómo redactar descripción/claves por especie
```

Cada archivo JavaScript empieza con un bloque de comentario que explica,
paso a paso, qué hace cada función y qué debes tocar para modificarla —
ábrelos y lee el encabezado antes de editar.

---

## 2. Probar el sitio en tu computador

Como el sitio carga los archivos `data/especies.json` y
`data/departamentos.geojson` con `fetch()`, **no puedes abrir `index.html`
con doble clic** (los navegadores bloquean esas descargas cuando la página
se abre como `file://`). Necesitas un servidor local muy simple:

Con Python (viene instalado en Mac/Linux, y en Windows si instalaste Python):

```bash
cd mamiferos-colombia
python3 -m http.server 8000
```

Y abre `http://localhost:8000` en tu navegador.

Con la extensión "Live Server" de VS Code también funciona: clic derecho
sobre `index.html` → "Open with Live Server".

---

## 3. Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `mamiferos-colombia`).
2. Sube todo el contenido de esta carpeta a la raíz del repositorio:

   ```bash
   cd mamiferos-colombia
   git init
   git add .
   git commit -m "Primera versión del catálogo"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/mamiferos-colombia.git
   git push -u origin main
   ```

3. En GitHub, entra a **Settings → Pages**.
4. En "Build and deployment" → "Source", elige **Deploy from a branch**.
5. En "Branch", elige `main` y la carpeta `/ (root)`. Guarda.
6. Espera uno o dos minutos y tu sitio quedará publicado en:
   `https://TU-USUARIO.github.io/mamiferos-colombia/`

Cada vez que hagas `git push` con cambios, GitHub Pages los publica
automáticamente en unos minutos.

---

## 4. Cómo completar el contenido (descripción, claves, fotos)

Ver `docs/GUIA-CONTENIDO.md` — ahí está explicado paso a paso, con
ejemplos, cómo:
- Redactar la descripción y las claves de identificación de cada especie.
- Agregar fotos, ya sea subiendo el archivo o pegando un enlace externo.

---

## 5. Cómo modificar los filtros de búsqueda

Los filtros disponibles hoy son: texto libre, **Orden**, **Familia**,
**Género**, Estado de amenaza (UICN), Endémica, CITES y Departamento (desde
el mapa). Orden → Familia → Género funcionan **en cascada**: si eliges un
orden, el select de Familia solo muestra las familias de ese orden, y si
además eliges una familia, el select de Género solo muestra sus géneros.
Esa cascada la maneja la función `actualizarOpcionesFamiliaGenero()` en
`js/app.js`.

Los filtros viven en dos lugares que trabajan juntos:

- **`index.html`**: los `<select>` y el campo de búsqueda (busca la sección
  `BARRA DE FILTROS`).
- **`js/app.js`**, función `aplicarFiltros()`: la lógica que decide qué
  especies coinciden con los filtros activos.

Para **agregar un filtro nuevo simple, sin cascada** (por ejemplo, filtrar
por estado de amenaza ya existe así — úsalo como plantilla):

1. Agrega un `<select id="filtro-loquesea">` en `index.html`, junto a los
   demás filtros.
2. En `js/app.js`, función `poblarSelectsDeFiltros()`, agrega el código
   para llenarlo con los valores únicos del campo que quieras (copia el
   bloque que hace esto para `filtro-cites`).
3. En `leerFiltrosActuales()`, agrega una línea para leer su valor.
4. En `aplicarFiltros()`, agrega la condición correspondiente (copia una
   de las líneas `if (f.algo && especie.algo !== f.algo) return false;`).
5. En `iniciar()`, conecta el nuevo `<select>` con
   `.addEventListener('change', aplicarFiltros)`.
6. En `limpiarFiltros()`, agrega la línea que lo reinicia a `''`.

Para **quitar un filtro existente**, borra las partes equivalentes de esos
mismos lugares (si el filtro que quitas es Orden o Familia, revisa también
`actualizarOpcionesFamiliaGenero()`, porque de ahí depende la cascada).

---

## 6. Cómo funciona el mapa interactivo

Todo el código del mapa está en `js/mapa.js`, con comentarios detallados
en cada función. Hay dos mapas:

- **Mapa general** (`crearMapaGeneral`): aparece al hacer clic en "Ver mapa
  de distribución" en la portada. Colorea cada departamento según cuántas
  especies (de las que están filtradas en ese momento) tienen registro
  allí, y al hacer clic en un departamento filtra el catálogo a esa zona.
- **Mapa de una especie** (`crearMapaEspecie`): aparece en la pestaña
  "Distribución" de cada ficha, y resalta en verde los departamentos donde
  esa especie puntual tiene registros.

Ambos mapas dibujan el archivo `data/departamentos.geojson`, que contiene
los límites de los 33 departamentos de Colombia (fuente: Marco Geoestadístico
Nacional del DANE, simplificado para que el archivo sea liviano).

Para cambiar los colores del mapa, edita las funciones `coloresPorCantidad()`
(mapa general) o el bloque `style:` dentro de `crearMapaEspecie()` (mapa de
una especie), ambas en `js/mapa.js`.

---

## 7. Cómo agregar o corregir una especie

Todo el contenido de las especies vive en `data/especies.json`, un arreglo
de objetos. Para **agregar una especie nueva**, copia un objeto existente,
cambia sus valores, y asegúrate de que:
- `"slug"` sea único (nombre científico en minúsculas, con guiones).
- `"departamentosGeo"` use los nombres oficiales en mayúsculas que aparecen
  en `data/departamentos.geojson` (por ejemplo `"VALLE DEL CAUCA"`), para
  que el mapa la reconozca correctamente.

Para **corregir un dato** (por ejemplo, el estado de amenaza), busca la
especie por su nombre científico y edita el campo correspondiente.

---

## 8. Créditos de las fuentes de datos

- Listado de especies, distribución por departamento, estado de amenaza
  (UICN) y apéndice CITES: recopilado por el autor del sitio a partir de
  fuentes propias (archivo Excel original).
- Límites departamentales (`data/departamentos.geojson`): Marco
  Geoestadístico Nacional del DANE (2018), redistribuido por el repositorio
  público [caticoa3/colombia_mapa](https://github.com/caticoa3/colombia_mapa),
  simplificado con [mapshaper](https://mapshaper.org/).
- Mapa base (calles/fondo): [CARTO](https://carto.com/basemaps) sobre datos
  de OpenStreetMap.
- Librería de mapas: [Leaflet](https://leafletjs.com/).
