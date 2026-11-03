# El Rincón del Café · HU-02 Catálogo

[![Pruebas de aceptación](https://github.com/Carlos-SD/rincon-del-cafe-hu02-catalogo/actions/workflows/pipeline.yml/badge.svg)](https://github.com/Carlos-SD/rincon-del-cafe-hu02-catalogo/actions/workflows/pipeline.yml)

Taller de automatización con Playwright: mono repo con la app, sus pruebas de aceptación y el pipeline de GitHub Actions.

> **HU-02 · Catálogo.** Como cliente, quiero filtrar productos por precio máximo para ver solo lo que puedo pagar.

## Estructura

```
.
├── app/                     El Rincón del Café (Node.js + Express)
├── pruebas/                 Pruebas con Playwright (JavaScript, ES modules)
│   ├── data/                oráculo del catálogo, usuarios y datos de los casos
│   ├── pages/               PaginaLogin, PaginaCatalogo (únicos con localizadores)
│   ├── fixtures/            paginaLogueada, catalogo, apiLogueada
│   ├── tests/               catalogo.spec.js (UI), catalogo.api.spec.js (API), catalogo.bug.spec.js (bug)
│   └── playwright.config.js
├── docs/                    plan, casos, bug, pipeline y guía de sustentación
└── .github/workflows/pipeline.yml
```

## Resumen

| Paso del taller | Resultado |
|---|---|
| Historia | HU-02 Catálogo |
| Bug inyectado | El filtro muestra productos hasta un 15 % más caros que el máximo. Ej.: máximo 12.000 muestra Capuchino de 13.000 → [reporte](docs/03-reporte-bug.md) |
| Caso que lo detecta | `BUG-01..03` y `BUG-API` (`@bug`) en `pruebas/tests/catalogo.bug.spec.js` |
| Todos los casos | 17 `@acceptanceTest` (UI + API) + 1 complementario + 4 `@bug` → [matriz](docs/02-casos-de-prueba.md) |
| Pipeline | Un job `pruebas-aceptacion` que levanta la app y corre `@acceptanceTest` → [explicación](docs/04-pipeline.md) |

Documentación: [plan de desarrollo](docs/01-plan-de-desarrollo.md) · [casos de prueba](docs/02-casos-de-prueba.md) · [reporte del bug](docs/03-reporte-bug.md) · [pipeline](docs/04-pipeline.md) · [guía de sustentación](docs/05-guia-sustentacion.md)

## Cómo ejecutar en local

Requisitos: Node.js 22 o superior.

```bash
# 1. La app
cd app
npm ci
npm start                    # http://localhost:3000

# 2. Las pruebas (otra terminal)
cd pruebas
npm ci
npx playwright install --with-deps chromium
npx playwright test --grep @acceptanceTest   # lo mismo que corre el pipeline
npx playwright test --grep @bug              # casos que detectan el bug: FALLAN a propósito
npx playwright show-report
```

Si la app está apagada, `webServer` en `playwright.config.js` la enciende sola.

Para comprobar que los casos `@bug` son correctos, levanten la app sin bugs y córranlos de nuevo: deben pasar.

```bash
cd app && MODO_REFERENCIA=true npm start
cd pruebas && npx playwright test            # 22 de 22 pasan
```

Cuenta de práctica: `estudiante1@cafe.test` / `Cafe2026` (se puede cambiar con `CAFE_CORREO` y `CAFE_CLAVE`).
