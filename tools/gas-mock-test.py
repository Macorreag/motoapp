import asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:5180"
CHROME = "/home/mialco/PropuestaErradicar/.pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux-arm64/chrome-headless-shell"

MOCK = r"""
window.__mock = {
  estado: {
    version: 1, vehiculo: null, documentos: [], componentes: [], mantenimientos: [],
    alertas: [], talleres: [], ordenes: [], puntos: [],
    ajustes: { nombre: '', tema: 'auto', ciudad: 'bogota', tipoVehiculo: 'moto', moneda: 'COP',
               mostrarPuntos: true, picoPlacaDigitos: {}, picoPlacaActivo: true },
    onboardingCompleto: false, esDemo: false
  },
  token: 't0', guardados: 0, conflictos: 0, cargas: 0
};
window.__mockToken = function () {
  const s = JSON.stringify(window.__mock.estado);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  window.__mock.token = (h >>> 0).toString(36) + '-' + s.length.toString(36);
  return window.__mock.token;
};
window.__crearRunner = function () {
  return {
  _ok: null, _err: null,
  withSuccessHandler(fn) { return Object.assign({}, this, { _ok: fn }); },
  withFailureHandler(fn) { return Object.assign({}, this, { _err: fn }); },
  api(accion, datos) {
    const self = this;
    setTimeout(function () {
      try {
        if (accion === 'cargar') {
          window.__mock.cargas++;
          self._ok({ estado: JSON.parse(JSON.stringify(window.__mock.estado)), token: window.__mockToken(),
                     capacidades: { fotos: false, backend: 'gas', importar: true },
                     meta: { libro: 'Mock', pestanas: 9, registros: window.__mock.estado.mantenimientos.length } });
          return;
        }
        if (accion === 'guardar') {
          if (datos.token !== window.__mock.token) {
            window.__mock.conflictos++;
            self._ok({ ok: false, conflicto: true, estado: JSON.parse(JSON.stringify(window.__mock.estado)), token: window.__mock.token });
            return;
          }
          window.__mock.estado = JSON.parse(JSON.stringify(datos.estado));
          window.__mock.guardados++;
          self._ok({ ok: true, token: window.__mockToken() });
          return;
        }
        self._ok({ error: 'accion desconocida' });
      } catch (e) { self._err(String(e)); }
    }, 120);
  }
  };
};
window.google = { script: { run: window.__crearRunner() } };
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 420, "height": 900}, locale="es-CO")
        await ctx.add_init_script(MOCK)
        page = await ctx.new_page()
        errores = []
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)

        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_timeout(900)

        # Onboarding en modo Google Sheets
        await page.get_by_placeholder("Tu nombre").fill("Miller")
        await page.get_by_placeholder("ABC12D").fill("GAS 01")
        await page.get_by_placeholder("18450").fill("5200")
        await page.locator('input[type="date"]').first.fill("2024-06-01")
        await page.get_by_role("button", name="Continuar").click()
        await page.wait_for_timeout(400)
        await page.get_by_text("Todavía no tengo estas fechas").click()
        await page.get_by_role("button", name="Empezar a usarla").click()
        await page.wait_for_timeout(1500)

        m = await page.evaluate("window.__mock")
        assert m["estado"]["vehiculo"]["placa"] == "GAS 01", "no se guardó el vehículo en el mock"
        assert m["guardados"] >= 1, "no hubo escritura"

        # Sin fotos en modo gas (Hoja de vida dentro del menú)
        await page.get_by_role("button", name="Más").click()
        await page.wait_for_timeout(500)
        await page.get_by_role("button", name="Hoja de vida").click()
        await page.wait_for_timeout(700)
        assert await page.query_selector('input[type="file"]') is None, "no debería haber inputs de foto"
        assert await page.query_selector('[aria-label="QR del vehículo"]') is not None
        await page.get_by_label("Cerrar").click()
        await page.wait_for_timeout(400)

        # Registrar mantenimiento desde el dock
        await page.get_by_role("button", name="Servicio", exact=True).first.click()
        await page.wait_for_timeout(500)
        await page.get_by_role("button", name="Aceite", exact=True).click()
        await page.locator('input[inputmode="numeric"]').nth(1).fill("88000")
        await page.get_by_role("button", name="Guardar", exact=True).click()
        await page.wait_for_timeout(1300)
        m = await page.evaluate("window.__mock")
        assert len(m["estado"]["mantenimientos"]) == 1, "no se guardó el mantenimiento"
        assert m["estado"]["mantenimientos"][0]["km"] == 5200

        # Simular edición externa de la hoja y esperar la sincronización
        await page.evaluate("""() => {
          window.__mock.estado.mantenimientos.push({
            id: 'hoja-1', vehiculoId: 'x', fecha: '2026-10-01', km: 5300,
            categoria: 'frenos', titulo: 'Ajuste hecho desde la hoja', tipo: 'correctivo',
            costo: 45000, taller: 'Taller de la hoja'
          });
          window.__mock.estado.kilometrajeExterno = true;
          window.__mockToken();
        }""")
        await page.wait_for_function(
            "() => document.body.innerText.includes('Actualizado desde la hoja') || document.body.innerText.includes('Ajuste hecho desde la hoja')",
            timeout=25000,
        )
        await page.screenshot(path="/home/mialco/MotoApp/docs/capturas/m-gas-sync.png")

        # Conflicto: cambia la hoja justo antes de guardar desde la app
        await page.evaluate("""() => {
          window.__mock.estado.mantenimientos.push({
            id: 'hoja-2', vehiculoId: 'x', fecha: '2026-10-02', km: 5400,
            categoria: 'llantas', titulo: 'Cambio externo de llanta', tipo: 'correctivo', costo: 300000
          });
          window.__mockToken();
        }""")
        await page.get_by_role("button", name="Tanqueo", exact=True).first.click()
        await page.wait_for_timeout(400)
        await page.locator('input[inputmode="decimal"]').fill("3.2")
        await page.get_by_role("button", name="Guardar tanqueo").click()
        await page.wait_for_function("() => window.__mock.conflictos >= 1", timeout=20000)
        await page.wait_for_timeout(1200)

        m = await page.evaluate("window.__mock")
        assert m["conflictos"] >= 1, "no se detectó el conflicto"
        titulos = [x["titulo"] for x in m["estado"]["mantenimientos"]]
        assert any("llanta" in t for t in titulos), "se perdió el cambio externo tras el conflicto"
        assert any("Tanqueo" in t for t in titulos), "no se guardó el tanqueo tras resolver el conflicto"
        print("GAS MOCK OK · guardados:", m["guardados"], "conflictos:", m["conflictos"], "errores:", errores if errores else "ninguno")
        await browser.close()

asyncio.run(main())
