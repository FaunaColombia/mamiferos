# Guía para completar el contenido de cada especie

El archivo `data/especies.json` trae ya las 553 especies con todos los datos
que estaban en tu Excel (nombre científico, familia, departamentos, estado
de amenaza, etc.). Dos campos llegan **vacíos a propósito**, porque el
Excel no los traía, y son los que le dan más valor a cada ficha:

- `"descripcion"` → texto libre para la pestaña "Descripción"
- `"clavesIdentificacion"` → texto libre para la pestaña "Claves de identificación"

## Cómo completar una especie

1. Abre `data/especies.json` en cualquier editor de texto.
2. Busca la especie por su nombre científico (Ctrl+F), por ejemplo `"Mazama rufina"`.
3. Verás un bloque así:

   ```json
   {
     "id": 2,
     "slug": "mazama-rufina",
     "orden": "Artiodactyla",
     "familia": "Cervidae",
     "genero": "Mazama",
     "epiteto": "rufina",
     "nombreCientifico": "Mazama rufina",
     "nombreComun": "Soche, Soche de páramo, Venado chonta\nUchpataruca",
     "departamentos": ["Antioquia", "Boyacá", "..."],
     "departamentosGeo": ["ANTIOQUIA", "BOYACÁ", "..."],
     "ocurrencia": "...",
     "endemica": false,
     "estadoAmenaza": "VU",
     "cites": null,
     "descripcion": "",
     "clavesIdentificacion": ""
   }
   ```

4. Escribe el texto entre las comillas de `"descripcion"` y
   `"clavesIdentificacion"`. Si el texto tiene varios párrafos, usa `\n\n`
   para separarlos (así se ve como un salto de línea en la página):

   ```json
   "descripcion": "Es un cérvido pequeño de páramo y bosque altoandino.\n\nPesa entre 9 y 13 kg y mide...",
   "clavesIdentificacion": "Se diferencia de M. temama por su pelaje más rojizo y su tamaño menor.\n\nCuernos simples, sin ramificar, presentes solo en machos."
   ```

5. Guarda el archivo. **No necesitas tocar nada más** — la página lee este
   archivo directamente al cargar.

> Consejo: como son 553 especies, no tienes que llenarlas todas de una vez.
> Mientras un campo esté vacío (`""`), la ficha simplemente muestra el
> aviso "Este contenido aún no se ha redactado para esta especie", sin
> romper nada.

## Cómo agregar la fotografía de una especie

Ver las instrucciones completas y comentadas en `js/fotos-config.js`.
En resumen, tienes dos caminos:

- **Subir el archivo directamente**: guarda la foto en `images/` con el
  nombre exacto del `slug` de la especie (por ejemplo `images/mazama-rufina.jpg`).
- **Usar un enlace externo**: agrega una línea en el objeto `FOTOS` de
  `js/fotos-config.js`, por ejemplo:
  `"mazama-rufina": "https://ejemplo.com/foto.jpg",`

## ¿De dónde salió cada campo?

| Campo en el JSON | Columna original en tu Excel |
|---|---|
| `orden`, `familia`, `genero`, `epiteto` | Orden, Familia, Genero, Epíteto específico |
| `nombreCientifico` | Especie |
| `nombreComun` | Nombre común |
| `departamentos` | Localidad (tal cual, para mostrarla en la ficha) |
| `departamentosGeo` | Localidad, normalizada a los nombres oficiales que usa el mapa (`data/departamentos.geojson`) para poder colorear el mapa |
| `ocurrencia` | Ocurrencia (texto libre de regiones naturales) |
| `endemica` | Endemicas (`true` si decía "Endémica") |
| `estadoAmenaza` | Estado de amenaza (VU / EN / CR) |
| `cites` | CITES (I / II / III) |
