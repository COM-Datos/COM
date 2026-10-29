# COM

Página web del Centro Operativo de Montevideo: https://com-datos.github.io/COM/

## Estructura

```
index.html        Portada: un cuadro por servicio con sus páginas
paginas/          Un .html por página
paginas/datos/    Bases de datos (JSON) que comparten las páginas de cada servicio
assets/           Logo y archivos compartidos
```

## Servicios y bases de datos

La portada tiene un cuadro por servicio (Bolsones, Agenda, Zona Limpia, Reclamos), definidos en el array `SERVICIOS` de `index.html`.
Cada servicio tiene **una** base de datos que leen todas sus páginas:

- `base`: archivo JSON de la base (con un campo `generado` = fecha de la copia). Hoy solo Bolsones tiene: `paginas/datos/bolsones.json`.
- `webhook`: dirección de n8n que regenera esa base. Mientras sea `null`, el botón **Actualizar** del cuadro solo vuelve a leer la copia.

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

El repo es público: las bases no deben llevar nombres, teléfonos ni emails.
