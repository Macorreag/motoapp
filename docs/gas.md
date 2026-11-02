# Versión Google Apps Script (datos en tu hoja)

Sabor alternativo de la app: la misma interfaz, pero los datos viven en **tu** Google Sheets y se
sincronizan cada 15 segundos. Es opcional; la versión del navegador (la que publica GitHub Pages)
no necesita nada de esto.

> **Los IDs no están en el repositorio.** Este repo no incluye la URL de despliegue, el ID del
> proyecto de Apps Script ni el ID de ninguna hoja de cálculo. Son tuyos y se configuran localmente
> (ver más abajo).

---

## 1. Crear tu propio despliegue

Requisitos: Node 20+, [`clasp`](https://github.com/google/clasp) y una cuenta de Google.

```bash
npm install -g @google/clasp
clasp login                       # abre el navegador y guarda ~/.clasprc.json
```

1. Crea una hoja de cálculo nueva (o usa una existente).
2. Copia `gas/.clasp.example.json` a `gas/.clasp.json` y pon el `scriptId` de tu proyecto
   (o crea uno con `clasp create --type sheets --title "MotoApp"`).
3. Indica el ID de tu hoja de una de estas dos formas:
   - propiedad de script `HOJA_ID`, o
   - constante `HOJA_ID` en `gas/Hoja.gs` (por defecto usa la hoja vinculada).
4. Genera el bundle y súbelo:

```bash
npm run build:gas                  # genera gas/app.html + gas/Bundle.gs desde src/
cd gas && clasp push -f            # sube código y HTML
clasp deploy -d "v1"               # crea la implementación y devuelve la URL /exec
```

5. En el editor de Apps Script ejecuta `setup` una vez para crear las pestañas.
6. Abre la URL `/exec` con tu cuenta. Si quieres cargar los datos de ejemplo, añade `?demo=1`
   mientras la hoja esté vacía.

Para enlazar la app con la hoja y el editor desde la interfaz, crea un `.env.local`:

```bash
VITE_HOJA_ID=tu_id_de_hoja
VITE_SCRIPT_ID=tu_id_de_proyecto
```

Esos enlaces son opcionales: si no existen, la app simplemente no los muestra.

### Privacidad del despliegue

El manifiesto (`gas/appsscript.json`) queda con `executeAs: USER_DEPLOYING` y `access: MYSELF`:
**solo tu cuenta puede abrir la URL**. No cambies `access` a `ANYONE` si vas a guardar datos
personales: cualquiera con el enlace podría leerlos.

---

## Por qué hay un `Bundle.gs` y no un HTML con todo el código

Apps Script **trunca el HTML que sirve `HtmlService` a ~150 KB de código de usuario**. El bundle de la
app pesa ~480 KB, así que al inlinearlo llegaba cortado a la mitad y la página quedaba **en blanco**
(el `<script>` terminaba dentro de una cadena).

La solución implementada:

1. `gas/app.html` es un **cascarón** (CSS, spinner y un cargador).
2. `gas/Bundle.gs` guarda el bundle en **base64** y lo expone con `api('bundle')` → `google.script.run`.
3. El cargador lo pide, lo decodifica e **inyecta un `<script>`** con el código.
4. Lo guarda en `localStorage`: la primera visita tarda 3–5 s; las siguientes arrancan al instante.
5. Cuando despliegas una versión nueva, la siguiente visita muestra una barra
   **«Hay una versión nueva de MotoApp · Actualizar»**.

Así el límite del HTML deja de importar y se puede seguir usando React, gráficas y QR.

> `gas/Bundle.gs` y `gas/app.html` son artefactos de build: no se versionan (`npm run build:gas`
> los regenera).

## Cómo se sincroniza

```
   Hoja de cálculo  ──lee cada 15 s──►  Apps Script  ──google.script.run──►  App (React)
        ▲                                                                        │
        └────────────────── escribe al guardar (con control de versión) ◄─────────┘
```

- **Editas la hoja** → en ≤15 s la app lo detecta, se actualiza y muestra el aviso
  «Actualizado desde la hoja de cálculo».
- **Editas en la app** → se escribe la pestaña afectada y se devuelve un token nuevo.
- **Conflictos**: cada lectura genera un token (hash MD5 del estado). Al guardar, el servidor
  compara el token del cliente con el actual:
  - igual → escribe;
  - distinto (editaste la hoja mientras tanto) → **no pisa nada**: devuelve la hoja actual,
    la app reaplica tu cambio sobre ella y reintenta. Si el segundo intento también choca,
    avisa y recarga.
- El polling se **pausa** cuando la pestaña está oculta y se reanuda (con lectura inmediata) al volver.
- Botón **↻ Actualizar** en la cabecera (móvil) y en la barra lateral (escritorio) para forzar la lectura.

---

## Pestañas que usa la app

Cada pestaña es una tabla: **fila 1 = cabeceras**, datos desde la fila 2. La app lee **por nombre de
cabecera**, así que puedes mover columnas de sitio sin romper nada.

| Pestaña | Contenido | Cabeceras |
|---|---|---|
| `Moto` | una fila con el vehículo | `id, placa, apodo, marca, linea, modelo, color, cilindraje, vin, numeroMotor, kmActual, kmInicial, fechaMatricula, fechaCompra, ciudad, notas, archivado, creado` |
| `Plan` | componentes de desgaste | `id, nombre, categoria, intervaloKm, intervaloMeses, vidaUtilKm, costoEstimado, ultimoKm, ultimaFecha, notas, activo, icono` |
| `Mantenimientos` | servicios y tanqueos | `id, fecha, km, categoria, titulo, tipo, costo, taller, descripcion, componenteId, galones, precioGalon, odometro, tanqueLleno` |
| `Documentos` | guantera (SOAT, tecno, seguro, licencia, impuesto) | `id, tipo, nombre, numero, entidad, fechaExpedicion, fechaVencimiento, valor, notas` |
| `Alertas` | legales y personalizadas | `id, titulo, detalle, tipo, fechaVencimiento, kmVencimiento, anticipacionDias, activa, creada` |
| `Talleres` | red de confianza | `id, nombre, telefono, direccion, especialidad, calificacion, notas` |
| `Ordenes` | órdenes de servicio | `id, tallerId, fecha, km, concepto, costo, calificacion, estado, notas` |
| `Puntos` | gamificación | `id, fecha, motivo, puntos` |
| `Ajustes` | configuración clave/valor | `clave, valor` |
| `Tareas` | checklist 10k, pasos de cadena, kit/EDC y pendientes | `id, tipo, titulo, detalle, hecho, prioridad, orden` |

### Reglas al editar a mano

- **Fechas** en formato `AAAA-MM-DD` (`2026-11-09`). Si escribes otra cosa, la app la leerá como texto.
- **Números** sin puntos de miles (`85000`, no `85.000`).
- **Booleanos**: `TRUE`/`FALSE` (o `SI`/`NO`).
- **Filas nuevas**: si no pones `id`, la app genera uno estable a partir del contenido.
- **Borrar una fila** = borrar ese registro en la app.
- **No renombres las cabeceras**; sí puedes reordenarlas o insertar columnas nuevas (se ignoran).
- Los **tanqueos** son registros de `Mantenimientos` con `galones` > 0; las demás columnas de tanqueo
  pueden quedar vacías.

---

## Qué cambia frente a la versión del navegador

| Función | Navegador (local) | Google Sheets |
|---|---|---|
| Datos | IndexedDB del navegador | tu hoja de cálculo |
| Sincronización | — | sí, cada 15 s |
| Fotos de facturas/documentos | sí | **no** (la app oculta esos botones) |
| Respaldo JSON / CSV / PDF | sí | sí |
| Multi-dispositivo | no | sí (misma hoja) |

Las fotos no se guardan en la hoja porque cada celda admite ~50.000 caracteres y una foto comprimida
los supera. Si más adelante las quieres, la vía natural es subirlas a Drive y guardar el enlace en la
columna `notas` o en una columna nueva `fotoUrl`.

---

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| Pantalla en blanco (versión anterior a la v5) | Era el HTML truncado por Apps Script. Actualizado en la v6: recarga con Ctrl+Shift+R. |
| «Falta autorizar la hoja» | Ejecuta `setup` en el editor y acepta los permisos de Sheets. |
| «Acceso restringido» | El script guardó tu correo en `DUENO` y la sesión no lo devuelve. Abre el editor → Configuración del proyecto → Propiedades del script y borra `DUENO`; vuelve a ejecutar `setup`. |
| «No se pudo guardar porque la hoja cambió» | Editaste la hoja justo al guardar. La app ya recargó: repite la acción. |
| Los cambios de la hoja no aparecen | Espera ≤15 s o pulsa ↻. Si sigue igual, revisa que la edición esté en una pestaña de la tabla y que las cabeceras no se hayan renombrado. |
| Una fecha sale como número | La celda no es texto/fecha válida: usa `AAAA-MM-DD`. |
| El primer arranque tarda 2–4 s | Es normal: Apps Script abre el libro y lee 9 pestañas. Después hay caché de cabeceras. |
| Quiero empezar de cero | Ajustes → «Borrar todo» (limpia las pestañas) o borra las filas a mano. |

---

## Notas técnicas

- `doGet` sirve `app.html` (cascarón estático, sin módulos ES).
- `api('bundle')` devuelve `{ b64, bytes, build }`; el cliente decodifica base64 → UTF-8 → `<script>`.
- Hay una **guardia de dueño** en `doGet` y `api`: si `setup` guardó tu correo en la propiedad `DUENO`,
  cualquier sesión sin correo (o con otro correo) recibe «Acceso restringido». Es defensa extra por si
  algún día cambias el acceso de la implementación; con `access: MYSELF` Google ya filtra.
- El cliente llama a un único punto: `google.script.run.api(accion, datos)` con `accion` ∈
  `cargar | guardar | setup | diagnostico`.
- `cargar` devuelve `{ estado, token, capacidades, meta }`. `guardar` devuelve `{ ok, token }` o
  `{ ok: false, estado, token, conflicto: true }`.
- `SpreadsheetApp` solo se toca en `Hoja.gs`; las cuentas, la vida útil y la salud del vehículo se
  calculan en el cliente (`src/lib/calc.ts`), así que el servidor es un almacén tonto y predecible.
