# COM

Página web del Centro Operativo de Montevideo: https://com-mvd.github.io/com/

## Estructura

```
index.html        Portada: un cuadro por servicio con sus páginas
paginas/          Un .html por página
bases/            Solo lo que se edita a mano (bolsones-calendario.json)
assets/           Logo y archivos compartidos
```

## Servicios y bases de datos

La portada tiene un cuadro por servicio (Bolsones, Agenda, Zona Limpia, Reclamos), definidos en el array `SERVICIOS` de `index.html`.
Cada servicio tiene **una** base de datos que leen todas sus páginas:

- `base`: archivo JSON de la base (con un campo `generado` = fecha del último dato).
- `webhook`: dirección de n8n que regenera esa base. Mientras sea `null`, el botón **Actualizar** del cuadro solo vuelve a leer la copia.

Las bases **no están en este repo**: están en [com-mvd/bases](https://github.com/com-mvd/bases), publicadas en
`https://com-mvd.github.io/bases/<servicio>.json`. Las sube el n8n de la PC del COM al tocar **Actualizar**, y ese repo
no guarda historial (cada subida reemplaza el único commit), así las bases de hasta ~30 MB no hacen crecer nada.
La hora de la última subida de cada servicio está en `actualizado.json` de ese repo.

La base se actualiza solo desde la portada; las páginas no tienen botón de actualizar propio.
El botón **Actualizar GPS** está reservado (`GPS_WEBHOOK = null`).

## Agregar una página nueva

1. Copiar el `.html` a la carpeta `paginas/`.
2. En el `<head>` del nuevo `.html`, dejar la pestaña como el resto del sitio:

   ```html
   <title>COM</title>
   <link rel="icon" type="image/png" href="../assets/logo-ciemsa.png">
   ```

3. En `index.html`, sumar una línea en `paginas` del servicio que corresponda:

   ```js
   { nombre: 'Nombre visible', archivo: 'paginas/archivo.html' },
   ```

4. Commit y push.

El repo es público: las bases no deben llevar nombres, teléfonos ni emails en claro.

## Contraseña y datos privados

La portada pide una contraseña al abrir, una sola vez por navegador (`assets/llave.js`).
Lo privado (por ejemplo, teléfonos y descripciones completas de Bolsones) va **cifrado** en
`<servicio>-privado.json` del repo de bases; su `llave.json` sirve para comprobar la contraseña y no la contiene.
Las páginas internas que usan datos privados cargan `../assets/llave.js` y piden la contraseña si se
abren directo. Las páginas para clientes no la cargan y abren sin contraseña.

La contraseña no está en el repo: la tiene el generador de los datos (ver `dashboard-bolsones/README.md`
en la PC del COM).
