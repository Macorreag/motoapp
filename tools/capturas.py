"""Capturas públicas de MotoApp con datos de demo (sin datos personales).

Uso:
    npm run dev                     # en otra terminal, http://127.0.0.1:5180
    pip install playwright && playwright install chromium
    python tools/capturas.py

Variables opcionales:
    BASE_URL      URL de la app en desarrollo (por defecto http://127.0.0.1:5180)
    CHROME_PATH   ruta a un Chromium/Chrome concreto (si no, usa el de Playwright)
    OUT_DIR       carpeta de salida (por defecto docs/capturas)
"""
import asyncio
import os
from pathlib import Path

from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:5180").rstrip("/")
OUT = Path(os.environ.get("OUT_DIR", "docs/capturas"))
CHROME = os.environ.get("CHROME_PATH")

SECCIONES = [
    ("m-vehiculo", "Hoja de vida"),
    ("m-mantenimientos", "Mantenimientos"),
    ("m-gastos", "Gastos y tanqueos"),
    ("m-reportes", "Reportes"),
    ("m-alertas", "Alertas"),
    ("m-pico", "Pico y placa"),
    ("m-talleres", "Talleres"),
    ("m-ajustes", "Ajustes"),
]


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    errores: list[str] = []
    opciones = {"args": ["--no-sandbox"]}
    if CHROME:
        opciones["executable_path"] = CHROME

    async with async_playwright() as p:
        browser = await p.chromium.launch(**opciones)

        # ---------- móvil ----------
        ctx = await browser.new_context(
            viewport={"width": 420, "height": 900}, device_scale_factor=2, locale="es-CO"
        )
        page = await ctx.new_page()
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
        await page.goto(BASE + "/?demo=1", wait_until="networkidle")
        await page.wait_for_timeout(1800)
        await page.screenshot(path=OUT / "m-inicio.png")
        await page.screenshot(path=OUT / "m-inicio-full.png", full_page=True)

        # cadena desplegada con cronómetro
        await page.get_by_role("button", name="Cadena").first.click()
        await page.wait_for_timeout(700)
        await page.get_by_role("button", name="Desengrasante 3:00").click()
        await page.wait_for_timeout(600)
        await page.screenshot(path=OUT / "m-cadena.png")

        # menú + secciones
        await page.evaluate("window.scrollTo({ top: 0 })")
        await page.wait_for_timeout(600)
        await page.get_by_role("button", name="Más").click()
        await page.wait_for_timeout(700)
        await page.screenshot(path=OUT / "m-menu.png")

        for archivo, label in SECCIONES:
            boton = page.get_by_role("button", name=label, exact=True).first
            # el encabezado fijo de la hoja tapa la primera fila: se pulsa por DOM
            await boton.evaluate("el => el.click()")
            await page.wait_for_timeout(1100)
            await page.screenshot(path=OUT / f"{archivo}.png")
            await page.locator('[aria-label="Cerrar"]:visible').first.click()
            await page.wait_for_timeout(500)
            await page.get_by_role("button", name="Más").click()
            await page.wait_for_timeout(500)

        # onboarding en un contexto limpio (sin demo)
        ctx2 = await browser.new_context(
            viewport={"width": 420, "height": 900}, device_scale_factor=2, locale="es-CO"
        )
        page2 = await ctx2.new_page()
        page2.on("pageerror", lambda e: errores.append(str(e)))
        await page2.goto(BASE + "/", wait_until="networkidle")
        await page2.wait_for_timeout(1200)
        await page2.screenshot(path=OUT / "m-onboarding.png")

        # ---------- escritorio ----------
        ctx3 = await browser.new_context(viewport={"width": 1360, "height": 940}, locale="es-CO")
        page3 = await ctx3.new_page()
        page3.on("pageerror", lambda e: errores.append(str(e)))
        await page3.goto(BASE + "/?demo=1", wait_until="networkidle")
        await page3.wait_for_timeout(1600)
        await page3.screenshot(path=OUT / "d-inicio.png")
        await page3.screenshot(path=OUT / "d-inicio-full.png", full_page=True)

        print("ERRORES:", errores if errores else "ninguno")
        await browser.close()


asyncio.run(main())
