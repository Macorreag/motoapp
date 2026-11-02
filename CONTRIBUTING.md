# Guía para contribuir

Gracias por pasarte. Este es un proyecto personal, pero los issues y los pull
requests son bienvenidos si respetan estas reglas.

## Antes de abrir un issue

- Busca en los issues existentes: puede estar ya reportado.
- Para dudas de mantenimiento de la moto, revisa [`docs/research/`](docs/research/):
  casi todo está documentado con su fuente.
- **No pegues datos personales** (placa, VIN, dirección, teléfono, números de
  póliza o de la hoja de cálculo) en issues, capturas o PRs.

## Entorno

- Node.js 20 o superior (ver `.nvmrc`).
- `npm install` y `npm run dev` → <http://127.0.0.1:5180>.

## Flujo de trabajo

1. Abre un issue describiendo el cambio o el bug.
2. Crea una rama: `feat/algo`, `fix/algo`, `docs/algo`.
3. Haz cambios pequeños y con un objetivo claro.
4. Antes de subir:

   ```bash
   npm run typecheck
   npm run build
   ```

5. Abre el PR contra `main` y rellena la plantilla.

## Estilo de código

- TypeScript estricto; sin `any` implícitos ni `@ts-ignore`.
- Componentes funcionales y hooks; nada de clases salvo en `src/store/`.
- Los cálculos de negocio viven en `src/lib/` y deben ser funciones puras.
- Los textos visibles van en español (Colombia), con cifras en formato COP.
- Sigue el diseño existente: `src/index.css` define tokens (`--brand`, `--ink`,
  `--surface`…). No introduzcas colores sueltos ni librerías de UI.

## Commits

Convención [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(dashboard): añade cronómetro de cadena
fix(calc): corrige el cálculo de días proyectados
docs(gas): explica el bundle en base64
```

## Seguridad y datos

- Nunca confirmes `.env.local`, `gas/.clasp.json`, `gas/Bundle.gs`,
  `gas/app.html` ni credenciales de `clasp`.
- Si encuentras un secreto o datos personales en el repositorio, **no abras un
  issue público**: usa [`SECURITY.md`](SECURITY.md).

## Licencia

Al contribuir aceptas que tu aporte se publique bajo la licencia MIT del
proyecto.
