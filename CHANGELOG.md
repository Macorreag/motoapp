# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] — 2026-10-31

Primera versión pública.

### Añadido

- Dashboard único tipo *Trail.Hacker OS*: HUD de telemetría (ODO, TRIP 1/2,
  rendimiento, autonomía), mapa de 7 subsistemas con hotspots, checklist de los
  10.000 km, asistente de cadena de 14 pasos, kit/EDC, pendientes, costos, mapa
  de llaves y consola de comandos.
- Hoja de vida de la moto: guantera de documentos, indicadores de desgaste,
  atributos y QR.
- Mantenimientos: registro con categorías, km, costo, taller y foto; historial
  con filtros; plan editable por modelo.
- Alertas legales (SOAT, tecnomecánica, impuesto) y personalizadas, con días
  proyectados según el ritmo real de km/día.
- Reportes: barras, dona, score 0–100, exportación CSV e impresión/PDF.
- Pico y placa: reglas por ciudad (Bogotá exenta para motos, Medellín con
  rotación editable), festivos 2026 y excepciones.
- Talleres y órdenes de servicio; Zona Moto con puntos e insignias.
- Persistencia en IndexedDB con respaldo/restauración JSON.
- Versión opcional con Google Sheets + Apps Script, con sincronización cada
  15 s y resolución de conflictos por token.
- Investigación documentada en `docs/research/` (producto, manual XTZ 250 y
  normativa colombiana) con fuentes.
- GitHub Pages con despliegue automático desde `main`.
- CI (typecheck + build + escaneo de secretos), CodeQL, Dependabot y
  plantillas de issues/PR.
- Datos de demo anonimizados; ningún ID de Google ni dato personal en el
  repositorio.
