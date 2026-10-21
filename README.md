# COM

Página web del Centro Operativo de Montevideo con una portada tipo lista que enlaza a varias páginas HTML.

## Estructura

```
index.html        Portada con la lista de páginas y buscador
paginas/          Un .html por página
assets/           Logo y archivos compartidos
```

## Agregar una página nueva

1. Copiar el `.html` a la carpeta `paginas/`.
2. En `index.html`, sumar una línea al principio de `PAGINAS`:

   ```js
   { nombre: 'Nombre visible', archivo: 'paginas/archivo.html', descripcion: 'Qué muestra', fecha: '2026-10-21' },
   ```

3. Commit y push desde GitHub Desktop.
