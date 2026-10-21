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
2. En el `<head>` del nuevo `.html`, dejar la pestaña como el resto del sitio:

   ```html
   <title>COM</title>
   <link rel="icon" type="image/png" href="../assets/logo-ciemsa.png">
   ```

3. En `index.html`, sumar una línea al principio de `PAGINAS` (`color: 'blue'` opcional; sin él el ícono es verde):

   ```js
   { nombre: 'Nombre visible', archivo: 'paginas/archivo.html', color: 'blue' },
   ```

4. Commit y push.
