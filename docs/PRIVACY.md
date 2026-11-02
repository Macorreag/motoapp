# Privacidad

## Resumen

MotoApp **no recolecta nada**. No hay servidor, ni cuentas, ni analytics, ni
telemetría, ni cookies de terceros.

| Qué | Dónde vive |
|---|---|
| Datos de la moto, mantenimientos, gastos, documentos | IndexedDB de tu navegador (o tu Google Sheets, si usas ese sabor) |
| Fotos de facturas | IndexedDB, comprimidas en el navegador |
| Respaldo | archivo JSON que descargas y guardas tú |
| Preferencias de tema y ciudad | `localStorage` |

## Qué NO hay

- Peticiones a servidores propios: todo se sirve estático desde GitHub Pages.
- Envío de datos a terceros.
- Rastreo entre sitios.

## Qué hay que cuidar

- **El repositorio es público**, así que la app de demo usa datos ficticios
  (placa `ABC12D`, taller genérico, sin números de póliza).
- Los IDs de Google (hoja de cálculo y proyecto de Apps Script) **no están en
  el repositorio**: se configuran en `.env.local`, que está ignorado por git.
- La versión de Apps Script se despliega con `access: MYSELF`: solo la cuenta
  dueña puede abrirla.
- Si haces un respaldo o una captura de pantalla, revísala antes de publicarla.

## Borrar tus datos

- **Navegador:** Ajustes → «Borrar todo» (limpia IndexedDB y `localStorage`).
  También puedes borrar los datos del sitio desde las preferencias del navegador.
- **Google Sheets:** borra las filas o las pestañas; la app se sincroniza con lo
  que quede.

## Contacto

Para reportar una filtración de datos, usa el canal privado de
[`SECURITY.md`](../SECURITY.md).
