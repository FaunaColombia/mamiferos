/* ==========================================================================
   mapa.js
   ==========================================================================
   Todas las funciones relacionadas con los mapas interactivos de Colombia.
   Usamos la librería Leaflet (cargada desde un CDN en index.html) para
   dibujar el archivo data/departamentos.geojson como un mapa "coropleta"
   (cada departamento coloreado según un valor).

   Este archivo define dos mapas distintos, que reutilizan las mismas
   funciones auxiliares:

     1. Mapa general de la portada (función crearMapaGeneral)
        Colorea cada departamento según CUÁNTAS especies del catálogo
        (filtrado o no) están registradas allí, y permite hacer clic en
        un departamento para filtrar la cuadrícula de especies.

     2. Mapa de una ficha individual (función crearMapaEspecie)
        Resalta en verde SOLO los departamentos donde esa especie
        puntual ha sido registrada.

   CÓMO CAMBIAR LOS COLORES DEL MAPA:
   Busca la función coloresPorCantidad() y coloresDistribucion() más abajo.

   CÓMO CAMBIAR LA VISTA INICIAL (centro/zoom) DEL MAPA:
   Busca la constante VISTA_INICIAL_COLOMBIA.
   ========================================================================== */

const VISTA_INICIAL_COLOMBIA = { centro: [4.2, -73.5], zoom: 5 };

// Guardamos el GeoJSON ya descargado para no pedirlo dos veces al servidor.
let _geojsonDepartamentosCache = null;

/**
 * Descarga (una sola vez) el archivo con las formas geográficas de los
 * departamentos de Colombia y lo deja en caché para reutilizarlo.
 */
async function cargarGeoJsonDepartamentos() {
  if (_geojsonDepartamentosCache) return _geojsonDepartamentosCache;
  const respuesta = await fetch('data/departamentos.geojson');
  if (!respuesta.ok) {
    throw new Error('No se pudo cargar data/departamentos.geojson');
  }
  _geojsonDepartamentosCache = await respuesta.json();
  return _geojsonDepartamentosCache;
}

/**
 * Devuelve un color según cuántas especies hay en un departamento,
 * usado por el mapa general de la portada.
 * Cambia estos valores hexadecimales para usar otra paleta.
 */
function coloresPorCantidad(cantidad) {
  if (cantidad === 0) return '#e2d8ba';   // sin registros -> tono "papel" apagado
  if (cantidad < 30) return '#c3d3b8';
  if (cantidad < 80) return '#9bb98c';
  if (cantidad < 150) return '#729b62';
  return '#3f6244';                        // el departamento con más especies
}

/**
 * Crea (o recicla, si ya existe) el mapa general que se muestra en la
 * portada dentro del panel "Mapa de distribución". Recibe:
 *   - contenedorId: el id del <div> donde se debe dibujar el mapa
 *   - especies: la lista de especies ACTUALMENTE visible (ya filtrada)
 *   - alClicDepartamento: función que se llama con el nombre del
 *     departamento cuando el usuario hace clic sobre él
 * Devuelve el objeto del mapa de Leaflet para poder actualizarlo después
 * con actualizarMapaGeneral().
 */
async function crearMapaGeneral(contenedorId, especies, alClicDepartamento) {
  const geojson = await cargarGeoJsonDepartamentos();

  const mapa = L.map(contenedorId, {
    scrollWheelZoom: false,
    minZoom: 4,
    maxZoom: 8,
  }).setView(VISTA_INICIAL_COLOMBIA.centro, VISTA_INICIAL_COLOMBIA.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
  }).addTo(mapa);

  const capaDepartamentos = L.geoJSON(geojson, {
    style: () => ({ color: '#35513a', weight: 1, fillOpacity: 0.85 }),
    onEachFeature: (feature, layer) => {
      layer.on('click', () => alClicDepartamento(feature.properties.DPTO_CNMBR));
      layer.on('mouseover', () => layer.setStyle({ weight: 2.5 }));
      layer.on('mouseout', () => layer.setStyle({ weight: 1 }));
    },
  }).addTo(mapa);

  mapa._capaDepartamentos = capaDepartamentos;
  actualizarMapaGeneral(mapa, especies);
  return mapa;
}

/**
 * Repinta los colores del mapa general según una nueva lista de especies
 * (por ejemplo, después de aplicar un filtro). No vuelve a crear el mapa,
 * solo actualiza los colores y los popups.
 */
function actualizarMapaGeneral(mapa, especies) {
  // Contamos cuántas especies hay registradas en cada departamento.
  const conteo = {};
  for (const especie of especies) {
    for (const depto of especie.departamentosGeo) {
      conteo[depto] = (conteo[depto] || 0) + 1;
    }
  }

  mapa._capaDepartamentos.eachLayer((layer) => {
    const nombreDepto = layer.feature.properties.DPTO_CNMBR;
    const cantidad = conteo[nombreDepto] || 0;
    layer.setStyle({ fillColor: coloresPorCantidad(cantidad) });
    layer.bindPopup(
      `<strong>${capitalizarDepartamento(nombreDepto)}</strong><br>${cantidad} especie(s) en la selección actual`
    );
  });
}

/**
 * Crea el pequeño mapa de distribución que aparece en la pestaña
 * "Distribución" de la ficha de una especie. Resalta en verde los
 * departamentos donde la especie fue registrada; el resto queda en gris.
 */
async function crearMapaEspecie(contenedorId, especie) {
  const geojson = await cargarGeoJsonDepartamentos();

  const mapa = L.map(contenedorId, {
    scrollWheelZoom: false,
    minZoom: 4,
    maxZoom: 8,
    zoomControl: false,
  }).setView(VISTA_INICIAL_COLOMBIA.centro, VISTA_INICIAL_COLOMBIA.zoom);

  L.control.zoom({ position: 'bottomright' }).addTo(mapa);

  const presentes = new Set(especie.departamentosGeo);

  L.geoJSON(geojson, {
    style: (feature) => {
      const presente = presentes.has(feature.properties.DPTO_CNMBR);
      return {
        color: presente ? '#203a24' : '#c9be9c',
        weight: presente ? 1.5 : 0.6,
        fillColor: presente ? '#4f7a52' : '#e2d8ba',
        fillOpacity: presente ? 0.85 : 0.4,
      };
    },
    onEachFeature: (feature, layer) => {
      const presente = presentes.has(feature.properties.DPTO_CNMBR);
      layer.bindTooltip(capitalizarDepartamento(feature.properties.DPTO_CNMBR), { sticky: true });
      if (presente) layer.bindPopup(`<strong>${capitalizarDepartamento(feature.properties.DPTO_CNMBR)}</strong><br>Registro presente`);
    },
  }).addTo(mapa);

  return mapa;
}

/** "SANTANDER" -> "Santander" (para mostrar los nombres de forma legible). */
function capitalizarDepartamento(nombre) {
  return nombre
    .toLowerCase()
    .split(' ')
    .map((palabra) => (palabra.length > 2 ? palabra[0].toUpperCase() + palabra.slice(1) : palabra))
    .join(' ')
    .replace(/\bd\.c\./i, 'D.C.');
}
