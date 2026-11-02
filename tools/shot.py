"""Capturas del dashboard (móvil, escritorio, menú y hoja)."""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:5180/?demo=1"
OUT = "/home/mialco/MotoApp/docs/capturas"
CHROME = "/home/mialco/PropuestaErradicar/.pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux-arm64/chrome-headless-shell"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        errores = []

        ctx = await browser.new_context(viewport={"width": 420, "height": 900}, device_scale_factor=2, locale="es-CO")
        page = await ctx.new_page()
        page.on("pageerror", lambda e: errores.append(str(e)))
        page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
        await page.goto(BASE, wait_until="networkidle")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT}/dash-top.png")
        await page.screenshot(path=f"{OUT}/dash-full.png", full_page=True)

        await page.get_by_role("button", name="Más").click()
        await page.wait_for_timeout(700)
        await page.screenshot(path=f"{OUT}/dash-menu.png")
        await page.get_by_role("button", name="Hoja de vida").click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT}/dash-sheet.png")
        await page.get_by_label("Cerrar").click()
        await page.wait_for_timeout(300)

        # Interacciones: checklist y cronómetro de cadena
        await page.get_by_role("button", name="Cadena").first.click()
        await page.wait_for_timeout(600)
        await page.get_by_role("button", name="Desengrasante 3:00").click()
        await page.wait_for_timeout(600)
        await page.screenshot(path=f"{OUT}/dash-cadena.png")

        ctx2 = await browser.new_context(viewport={"width": 1360, "height": 940}, locale="es-CO")
        page2 = await ctx2.new_page()
        page2.on("pageerror", lambda e: errores.append(str(e)))
        await page2.goto(BASE, wait_until="networkidle")
        await page2.wait_for_timeout(1400)
        await page2.screenshot(path=f"{OUT}/dash-desktop.png")
        await page2.screenshot(path=f"{OUT}/dash-desktop-full.png", full_page=True)

        print("ERRORES:", errores if errores else "ninguno")
        await browser.close()


asyncio.run(main())
