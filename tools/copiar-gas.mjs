import fs from "node:fs";
import path from "node:path";

/**
 * Genera el paquete para Google Apps Script.
 *
 * Apps Script trunca el HTML servido por HtmlService a ~150 KB de código de
 * usuario, así que NO se puede inlinear el bundle (479 KB): el <script> llega
 * cortado y la página queda en blanco.
 *
 * Solución:
 *   - gas/app.html  → cascarón pequeño (CSS + spinner + cargador con caché)
 *   - gas/Bundle.gs → bundle en base64, servido por api('bundle')
 * El cargador lo pide con google.script.run, lo decodifica y lo inyecta como
 * <script>. Además lo cachea en localStorage para que la segunda visita sea
 * instantánea y avisa cuando hay una versión nueva.
 */

const origen = path.resolve("dist-gas/index.html");
const destinoHtml = path.resolve("gas/app.html");
const destinoBundle = path.resolve("gas/Bundle.gs");

const html = fs.readFileSync(origen, "utf8");

// 1. CSS inline generado por Vite
const estilos = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0]).join("\n");
if (!estilos) throw new Error("No encontré los estilos inline en dist-gas/index.html");

// 2. Bundle JS
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error("No encontré el script del bundle en dist-gas/index.html");
const js = scriptMatch[1];
if (!js || js.length < 1000) throw new Error("El bundle es sospechosamente pequeño");

// 3. Bundle.gs con el JS en base64 troceado (evita cualquier problema de escape)
const b64 = Buffer.from(js, "utf8").toString("base64");
const trozos = b64.match(/.{1,2000}/g);
const build = new Date().toISOString();
const bundleGs = `/**
 * MotoApp · bundle del cliente (generado automáticamente, no editar).
 * Build: ${build} · ${(b64.length / 1024).toFixed(0)} KB en base64
 */
const APP_B64 = [
${trozos.map((t) => `  "${t}",`).join("\n")}
].join("");

function bundleBase64_() {
  return { b64: APP_B64, bytes: APP_B64.length, build: ${JSON.stringify(build)} };
}
`;

const cargador = `
    <script>
      (function () {
        var raiz = document.getElementById("root");
        var estado = document.getElementById("boot-msg");
        var CLAVE = "motoapp-bundle";
        var CLAVE_BUILD = "motoapp-build";
        var inyectado = false;

        function mostrarError(titulo, detalle) {
          if (!raiz) return;
          raiz.innerHTML =
            '<div class="boot-card">' +
            '<div class="boot-icon boot-icon-error">!</div>' +
            '<h1>No pude abrir la app</h1>' +
            '<p>' + titulo + '</p>' +
            (detalle ? '<pre>' + String(detalle).slice(0, 600) + '</pre>' : '') +
            '<button class="btn btn-primary boot-retry" onclick="location.reload()">Reintentar</button>' +
            '</div>';
        }

        function texto(t) { if (estado) estado.textContent = t; }

        function decodificar(b64) {
          var bin = atob(b64);
          var bytes = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return new TextDecoder("utf-8").decode(bytes);
        }

        function inyectar(codigo) {
          if (inyectado) return;
          inyectado = true;
          var s = document.createElement("script");
          s.textContent = codigo;
          document.body.appendChild(s);
          var intentos = 0;
          var reloj = setInterval(function () {
            intentos++;
            if (raiz && raiz.childElementCount > 0) {
              clearInterval(reloj);
              var boot = document.getElementById("boot");
              if (boot) boot.remove();
            } else if (intentos > 40) {
              clearInterval(reloj);
              try { localStorage.removeItem(CLAVE); } catch (e) {}
              mostrarError("El código llegó pero la interfaz no arrancó.", "Recarga la página. Si sigue, borra los datos del sitio o revisa la consola (F12).");
            }
          }, 200);
        }

        function guardar(b64, build) {
          try {
            localStorage.setItem(CLAVE, b64);
            localStorage.setItem(CLAVE_BUILD, build || "");
          } catch (e) { /* modo privado: sin caché */ }
        }

        function barraActualizar() {
          if (document.getElementById("boot-update")) return;
          var barra = document.createElement("div");
          barra.id = "boot-update";
          barra.className = "boot-update";
          barra.innerHTML = '<span>Hay una versión nueva de MotoApp.</span><button class="btn btn-primary boot-update-btn">Actualizar</button>';
          barra.querySelector("button").onclick = function () { location.reload(); };
          document.body.appendChild(barra);
        }

        var cache = null, cacheBuild = null;
        try {
          cache = localStorage.getItem(CLAVE);
          cacheBuild = localStorage.getItem(CLAVE_BUILD);
        } catch (e) { /* sin almacenamiento */ }

        if (cache) {
          try {
            inyectar(decodificar(cache));
          } catch (e) {
            cache = null;
            try { localStorage.removeItem(CLAVE); } catch (e2) {}
          }
        }

        if (!cache) texto("Descargando la app…");

        if (!window.google || !google.script || !google.script.run) {
          mostrarError("Esta página solo funciona dentro de Google Apps Script.", "Abre la URL /exec de la implementación.");
          return;
        }

        google.script.run
          .withSuccessHandler(function (res) {
            if (!res || res.error) {
              if (!cache) mostrarError("Apps Script respondió con un error.", res && res.error);
              return;
            }
            if (!res.b64) {
              if (!cache) mostrarError("Llegó una respuesta vacía del servidor.");
              return;
            }
            if (cache) {
              if (res.build && res.build !== cacheBuild) {
                guardar(res.b64, res.build);
                barraActualizar();
              }
              return;
            }
            texto("Preparando la interfaz…");
            guardar(res.b64, res.build);
            try {
              inyectar(decodificar(res.b64));
            } catch (e) {
              mostrarError("Error al decodificar la app.", e && e.message ? e.message : e);
            }
          })
          .withFailureHandler(function (e) {
            if (!cache) mostrarError("No se pudo descargar la app desde Apps Script.", e && e.message ? e.message : e);
          })
          .api("bundle", null);
      })();
    </script>`;

const shell = `<!doctype html>
<!-- Generado automáticamente por tools/copiar-gas.mjs · ${build} -->
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#f97316" />
    <title>MotoApp · XTZ 250</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%23f97316'/%3E%3Ctext x='50' y='68' font-size='52' font-family='system-ui' font-weight='700' text-anchor='middle' fill='white'%3EX%3C/text%3E%3C/svg%3E" />
${estilos}
    <style>
      .boot { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .boot-card {
        background: var(--surface); border: 1px solid var(--line); border-radius: 22px;
        padding: 26px 22px; max-width: 420px; text-align: center; box-shadow: var(--shadow);
      }
      .boot-icon {
        width: 52px; height: 52px; margin: 0 auto 12px; border-radius: 16px; display: flex;
        align-items: center; justify-content: center; font-size: 24px; font-weight: 800;
        background: linear-gradient(135deg,#fb923c,#ea580c); color: #fff;
      }
      .boot-icon-error { background: var(--bad-soft); color: var(--bad); }
      .boot-card h1 { font-size: 1.05rem; margin: 0 0 6px; color: var(--ink); }
      .boot-card p { font-size: 0.82rem; color: var(--ink-2); margin: 0 0 12px; line-height: 1.5; }
      .boot-card pre {
        font-size: 0.66rem; text-align: left; background: var(--surface-2); color: var(--ink-2);
        padding: 8px 10px; border-radius: 10px; overflow: auto; max-height: 140px; white-space: pre-wrap;
      }
      .boot-retry { margin-top: 4px; }
      .boot-spin {
        width: 34px; height: 34px; margin: 0 auto 12px; border-radius: 50%;
        border: 3px solid var(--surface-3); border-top-color: var(--brand);
        animation: boot-spin 0.9s linear infinite;
      }
      @keyframes boot-spin { to { transform: rotate(360deg); } }
      .boot-update {
        position: fixed; left: 50%; transform: translateX(-50%); bottom: 18px; z-index: 9999;
        display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 14px;
        background: var(--surface); border: 1px solid var(--line); border-radius: 999px;
        box-shadow: var(--shadow); font-size: 0.75rem; color: var(--ink-2);
      }
      .boot-update-btn { padding: 6px 12px; font-size: 0.72rem; }
      @media (prefers-reduced-motion: reduce) { .boot-spin { animation-duration: 2s; } }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="boot" id="boot">
        <div class="boot-card">
          <div class="boot-spin"></div>
          <h1>MotoApp · XTZ 250</h1>
          <p id="boot-msg">Abriendo tu hoja de vida…</p>
        </div>
      </div>
    </div>
${cargador}
  </body>
</html>
`;

fs.mkdirSync(path.dirname(destinoHtml), { recursive: true });
fs.writeFileSync(destinoHtml, shell, "utf8");
fs.writeFileSync(destinoBundle, bundleGs, "utf8");

const kbHtml = (Buffer.byteLength(shell) / 1024).toFixed(1);
const kbBundle = (Buffer.byteLength(bundleGs) / 1024).toFixed(0);
console.log(`gas/app.html: ${kbHtml} KB (cascarón; el límite de Apps Script es ~150 KB)`);
console.log(`gas/Bundle.gs: ${kbBundle} KB en base64 · ${trozos.length} trozos`);
