import asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:5180"
CHROME = "/home/mialco/PropuestaErradicar/.pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux-arm64/chrome-headless-shell"
OUT = "/home/mialco/MotoApp/docs/capturas"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 420, "height": 900}, locale="es-CO")
        page = await ctx.new_page()
        errores = []
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)

        await page.goto(BASE, wait_until="networkidle")
        # Onboarding
        await page.get_by_placeholder("Tu nombre").fill("Miller")
        await page.get_by_placeholder("ABC12D").fill("XTZ 25F")
        await page.get_by_placeholder("18450").fill("6400")
        await page.locator('input[type="date"]').first.fill("2024-05-20")
        await page.get_by_role("button", name="Continuar").click()
        await page.wait_for_timeout(400)
        await page.screenshot(path=f"{OUT}/m-onboarding-2.png")
        await page.get_by_text("Todavía no tengo estas fechas").click()
        await page.get_by_role("button", name="Empezar a usarla").click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT}/m-onboarding-fin.png")
        contenido = await page.content()
        assert "XTZ 25F" in contenido, "No aparece la placa en el dashboard"
        assert "Mantenimiento 10.000 km" in contenido or "Checklist" in contenido, "No cargó el dashboard"

        # Registrar mantenimiento desde el dock
        await page.get_by_role("button", name="Servicio", exact=True).first.click()
        await page.wait_for_timeout(500)
        await page.get_by_role("button", name="Aceite", exact=True).click()
        await page.locator('input[inputmode="numeric"]').nth(1).fill("70000")
        await page.get_by_role("button", name="Guardar", exact=True).click()
        await page.wait_for_timeout(900)
        await page.screenshot(path=f"{OUT}/m-smoke-dashboard.png")

        # Historial dentro del menú
        await page.get_by_role("button", name="Más").click()
        await page.wait_for_timeout(500)
        await page.get_by_role("button", name="Mantenimientos").click()
        await page.wait_for_timeout(600)
        await page.get_by_role("tab", name="Historial").click()
        await page.wait_for_timeout(500)
        assert "Cambio de aceite" in await page.content(), "No aparece el registro en el historial"
        await page.screenshot(path=f"{OUT}/m-smoke-historial.png")
        await page.get_by_label("Cerrar").click()
        await page.wait_for_timeout(400)

        # Tanqueo desde el dock
        await page.get_by_role("button", name="Tanqueo", exact=True).first.click()
        await page.wait_for_timeout(400)
        await page.get_by_role("button", name="Guardar tanqueo").click()
        await page.wait_for_timeout(700)
        assert "Tanqueo" in await page.content()

        # Persistencia
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(1400)
        contenido = await page.content()
        assert "XTZ 25F" in contenido, "La placa no persistió"
        assert "Cambio de aceite" in contenido, "El registro no persistió"
        print("SMOKE OK", "errores:", errores if errores else "ninguno")
        await browser.close()

asyncio.run(main())
