# Guías de viaje

Todas las guías en una sola web: https://iaadileli.github.io/guias/

Cada carpeta es una guía completa (página, fotos, `sw.js` y su generador). La portada es `index.html`.

- **Guía nueva:** carpeta, portada en `portadas/`, una línea en `index.html` y el nombre en `sw.js`.
- **Cambio en una guía:** subir `CACHE` en el `sw.js` de su carpeta y pasar su `generador/revisar.mjs`.
- **Cachés:** cada `sw.js` borra solo las que empiezan por su propio prefijo (`guias-…`).
