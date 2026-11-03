# Plan de desarrollo · HU-02 Catálogo

## 1. Historia asignada

> **HU-02 · Catálogo.** **Como** cliente, **quiero** filtrar productos por precio máximo **para** ver solo lo que puedo pagar.

| # | Criterio de aceptación |
|---|---|
| CA-1 | Solo aparecen productos con precio menor o igual al precio máximo indicado. |
| CA-2 | El número de resultados coincide con la cantidad de productos que se muestran. |
| CA-3 | Un precio máximo de 0 o negativo muestra un error. |

Entrega: 3 de noviembre de 2026, en el repositorio. Pareja, máximo dos estudiantes por historia.

## 2. Qué pide el taller y dónde queda resuelto

| Paso del taller | Entregable | Dónde |
|---|---|---|
| 1. Elegir la historia | HU-02 Catálogo | Este documento |
| 2. Encontrar el bug inyectado | Reporte del bug con evidencia | [03-reporte-bug.md](03-reporte-bug.md) |
| 3. Caso de prueba que lo detecte | `BUG-01..03` y `BUG-API` (`@bug`) | `pruebas/tests/catalogo.bug.spec.js` |
| 4. Todos los casos de la historia | Matriz de casos + specs UI y API | [02-casos-de-prueba.md](02-casos-de-prueba.md), `pruebas/tests/` |
| Despliegue (siguiente clase) | Pipeline que levanta la app y corre `@acceptanceTest` | `.github/workflows/pipeline.yml`, [04-pipeline.md](04-pipeline.md) |
| Sustentación | Preguntas probables y respuestas | [05-guia-sustentacion.md](05-guia-sustentacion.md) |

## 3. Fases de trabajo

### Fase 1 · Análisis (shift left)
1. Leer la HU y convertir cada criterio en condiciones verificables (CA-1, CA-2, CA-3).
2. Revisar el catálogo de partida (`app/data/seed.json`): 8 productos entre $7.000 y $16.000.
3. Explorar la pantalla con el inspector para encontrar localizadores: `Precio máximo`, `Categoría`, `Texto` (labels), botón `Buscar`, `data-testid="total-resultados"`, la lista `#lista-productos` y el mensaje `role="status"`.
4. Explorar la API detrás de la pantalla: `GET /api/productos?precioMax=…` (requiere sesión).

### Fase 2 · Diseño de casos
Técnicas de caja negra (ISTQB CTFL v4.0):
- **Particiones de equivalencia** del precio máximo: inválida (≤ 0), válida sin resultados (0 < max < 7.000), válida con resultados, válida que cubre todo el catálogo (≥ 16.000), vacía (sin filtro).
- **Valores límite**: 0 (inválido), 1 (primer válido), precio exacto de un producto (10.000, 13.000, 16.000) para comprobar el "menor **o igual**".
- **Combinación** con la categoría (el filtro de precio no rompe los otros filtros).

Resultado: la matriz de [02-casos-de-prueba.md](02-casos-de-prueba.md).

### Fase 3 · Búsqueda del bug
1. Ejecutar los casos de valores límite contra la app.
2. Con precio máximo 12.000 la app muestra **6** productos e incluye **Capuchino ($13.000)**; se esperaban 5.
3. Probar más valores para encontrar el patrón: 7.000 muestra Espresso ($8.000), 15.000 muestra Cheesecake ($16.000).
4. Patrón: la app deja pasar productos hasta un **15 %** por encima del máximo (`precio <= max * 1,15`).
5. Confirmación: con la app de referencia (`MODO_REFERENCIA=true`) los mismos casos pasan.

### Fase 4 · Automatización con Playwright (modelo en capas)
```
pruebas/
├── data/       oráculo (catálogo esperado), usuarios y datos de cada caso
├── pages/      PaginaLogin y PaginaCatalogo: el ÚNICO lugar con localizadores
├── fixtures/   paginaLogueada, catalogo y apiLogueada: preparan el estado
└── tests/      specs: solo test(...) y expect(...)
```
Dependencias solo hacia abajo: `tests → fixtures → pages`, y `data` alimenta a tests y fixtures.

Pirámide de Cohn: los mismos criterios se prueban en dos niveles:
- **API** (`catalogo.api.spec.js`): rápidas y estables, verifican la regla de negocio.
- **Interfaz** (`catalogo.spec.js`): verifican lo que ve el cliente (contador, lista, mensaje de error).

### Fase 5 · Etiquetas
| Etiqueta | Significado | ¿Bloquea el pipeline? |
|---|---|---|
| `@acceptanceTest` | Caso de aceptación que debe pasar | Sí |
| `@bug` | Caso que detecta el bug inyectado; falla mientras el bug exista | No |
| `@HU02` | Trazabilidad a la historia | — |
| `@api` | Caso a nivel de API | — |

Los casos `@bug` no llevan `@acceptanceTest` porque fallarían siempre y el pipeline quedaría en rojo sin que nadie pudiera desplegar (diapositiva 16 del material de despliegue).

### Fase 6 · Pipeline (CI)
Mono repo con `app/`, `pruebas/` y `.github/workflows/pipeline.yml`. Un solo job, `pruebas-aceptacion`: instala, baja Chromium, levanta la app en el 3000, espera a que responda, corre `--grep @acceptanceTest` y sube el reporte con `if: always()`. Detalle línea por línea en [04-pipeline.md](04-pipeline.md).

### Fase 7 · Prueba del bloqueo
Se abre una rama con un caso `@acceptanceTest` roto a propósito, se verifica en Actions que el job queda en **rojo**, se corrige y se verifica que vuelve a **verde**.

## 4. Criterios de terminado
- [x] Los 3 criterios de aceptación tienen al menos un caso de UI y uno de API.
- [x] El bug está documentado con pasos, resultado esperado y obtenido.
- [x] Hay casos que fallan con el bug y pasan con la app de referencia.
- [x] `npx playwright test --grep @acceptanceTest` pasa en local y en GitHub Actions.
- [x] El pipeline falla si un caso `@acceptanceTest` falla (probado a propósito).
- [x] El reporte de Playwright se descarga desde Artifacts.

## 5. Riesgos y cómo se manejan
| Riesgo | Mitigación |
|---|---|
| La lista se lee antes de que la app pinte el resultado | Aserciones web-first (`toHaveText`, `toHaveCount`, `expect.poll`) que reintentan |
| Datos en memoria modificados por otras pruebas | El catálogo es de solo lectura; ninguna prueba de la HU-02 modifica datos |
| Dos servidores en el puerto 3000 en CI | `webServer.reuseExistingServer: true` |
| Pipeline siempre rojo por el bug | El caso que lo detecta va con `@bug`, no con `@acceptanceTest` |
