# Carpeta de fotografías

Pon aquí las fotos que quieras subir directamente al repositorio (en vez de
usar un enlace externo).

**Nombra cada archivo exactamente igual al "slug" de la especie**, que
puedes encontrar en `data/especies.json` (campo `"slug"`). Ejemplos:

```
images/puma-concolor.jpg
images/mazama-rufina.png
images/passalites-murelia.webp
```

Formatos aceptados: `.jpg`, `.jpeg`, `.png`, `.webp`.

No necesitas registrar el archivo en ningún otro lugar: `js/app.js` busca
automáticamente una imagen con ese nombre para cada especie. Ver
`js/fotos-config.js` para la explicación completa y para la otra opción
(enlaces externos).
