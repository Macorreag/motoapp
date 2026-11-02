# Política de seguridad

## Qué proteger

Este repositorio **no contiene credenciales**, pero sí puede contener, por
error, datos que no deberían ser públicos:

- IDs de Google Sheets, de proyectos de Apps Script o URLs de despliegue.
- Tokens de OAuth (`~/.clasprc.json`, `.tok`).
- Datos del vehículo o personales (placa, VIN, pólizas, direcciones).
- Capturas de pantalla con esos datos.

## Cómo reportar

**No abras un issue público.** Usa una de estas vías:

1. [GitHub Security Advisories](../../security/advisories/new) del repositorio
   (privado, solo lo ven los mantenedores).
2. Si no está disponible, abre un issue **sin detalles sensibles** pidiendo un
   canal privado.

Incluye: qué encontraste, dónde (archivo, commit o URL) y cómo reproducirlo.
Intentamos responder en menos de 7 días.

## Alcance

- La app del navegador no tiene backend: los datos viven en IndexedDB.
- La versión de Apps Script es opcional y se despliega con `access: MYSELF`.
- GitHub Pages publica solo el build estático (`dist/`) de este repositorio.

## Qué NO es un problema de seguridad

- La ausencia de autenticación: es una app local sin cuentas, por diseño.
- Que la demo use datos ficticios.
- Las limitaciones conocidas de la versión de Google Sheets documentadas en
  [`docs/gas.md`](docs/gas.md).
