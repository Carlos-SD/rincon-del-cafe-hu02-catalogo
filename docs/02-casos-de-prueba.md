# Casos de prueba · HU-02 Catálogo

**Precondición común:** sesión iniciada con una cuenta de práctica (`estudiante1@cafe.test` / `Cafe2026`) y pantalla **Catálogo** abierta. El login no hace parte de la historia: lo prepara el fixture.

**Catálogo de partida (oráculo, `pruebas/data/productos.js`):**

| Producto | Categoría | Precio |
|---|---|---|
| Té verde | bebidas | 7.000 |
| Espresso | bebidas | 8.000 |
| Croissant | postres | 9.000 |
| Brownie | postres | 10.000 |
| Latte | bebidas | 12.000 |
| Capuchino | bebidas | 13.000 |
| Sándwich de pollo | comida | 15.000 |
| Cheesecake | postres | 16.000 |

## Particiones y valores límite del precio máximo

| Partición | Valores representativos | Resultado esperado |
|---|---|---|
| Inválida: ≤ 0 | 0 (límite), -1, -5.000 | Error |
| Válida sin resultados: 0 < max < 7.000 | 1 (límite), 6.000 | 0 productos, sin error |
| Válida con resultados parciales | 10.000, 13.000 (precio exacto de un producto) | Solo productos con precio ≤ max |
| Válida, todo el catálogo: ≥ 16.000 | 16.000 (límite) | 8 productos |
| Sin precio máximo | vacío | 8 productos (no se filtra) |

## Casos de aceptación (`@acceptanceTest`, bloquean el pipeline)

| ID | CA | Nivel | Entrada | Resultado esperado | Spec |
|---|---|---|---|---|---|
| CP-01 | 1, 2 | UI + API | max = 10.000 | Té verde, Espresso, Croissant, Brownie. Resultados: 4. Brownie ($10.000) sí aparece (límite "igual") | `catalogo.spec.js`, `catalogo.api.spec.js` |
| CP-02 | 1, 2 | UI + API | max = 13.000 | Los 4 anteriores + Latte y Capuchino. Resultados: 6 | ídem |
| CP-03 | 1, 2 | UI + API | max = 16.000 | Los 8 productos. Resultados: 8 | ídem |
| CP-04 | 1, 2 | UI + API | max = 6.000 | Lista vacía. Resultados: 0. Sin error | ídem |
| CP-05 | 1, 2, 3 | UI + API | max = 1 | Lista vacía. Resultados: 0. **Sin** error (primer valor válido) | ídem |
| CP-06 | 1, 2 | UI | max = 10.000, categoría = bebidas | Té verde y Espresso. Resultados: 2 | `catalogo.spec.js` |
| CP-07 | 2 | UI | max vacío | 8 productos y el contador dice 8 | `catalogo.spec.js` |
| CP-08 | 3 | UI + API | max = 0 | UI: mensaje "El precio máximo debe ser mayor que 0". API: 400 con ese mensaje | ambos |
| CP-09 | 3 | UI + API | max = -5.000 | UI: el navegador muestra su mensaje de validación (campo `min="0"`) y **no** se envía la consulta. API: 400 con el mensaje de la app | ambos |
| CP-10 | 3 | API | max = -1 | 400 "El precio máximo debe ser mayor que 0" | `catalogo.api.spec.js` |

En cada caso válido se verifican **juntos** CA-1 (los productos exactos) y CA-2 (el contador `Resultados` coincide con los elementos de la lista).

## Casos complementarios (no bloquean)

| ID | Nivel | Entrada | Resultado esperado | Etiquetas |
|---|---|---|---|---|
| CP-11 | API | `GET /api/productos?precioMax=10000` sin sesión | 401 | `@HU02 @api` |

## Casos que detectan el bug (`@bug`, no bloquean)

La "ventana del bug" son los precios que cumplen `max < precio <= max × 1,15`. Un caso detecta el bug si algún producto cae en esa ventana.

| ID | Nivel | Entrada | Ventana del bug | Esperado | Obtenido con el bug |
|---|---|---|---|---|---|
| BUG-01 | UI | max = 12.000 | (12.000, 13.800] → Capuchino | 5 productos, sin Capuchino | 6 productos, aparece Capuchino $13.000 |
| BUG-02 | UI | max = 7.000 | (7.000, 8.050] → Espresso | 1 producto (Té verde) | 2 productos, aparece Espresso $8.000 |
| BUG-03 | UI | max = 15.000 | (15.000, 17.250] → Cheesecake | 7 productos, sin Cheesecake | 8 productos, aparece Cheesecake $16.000 |
| BUG-API | API | precioMax = 12.000 | ídem BUG-01 | Ningún producto con precio > 12.000 | Devuelve Capuchino |

**Por qué los casos de aceptación CP-01..CP-05 pasan aunque el bug existe:** sus valores se eligieron fuera de la ventana del bug (por ejemplo, entre 10.000 y 11.500 no hay productos). Son casos válidos de la historia que la app sí cumple; los casos `@bug` son los que muestran dónde no la cumple.

## Resultados de ejecución (local, 2 de noviembre de 2026)

| Escenario | Comando | Resultado |
|---|---|---|
| App con bugs | `npx playwright test` | 18 pasan, 4 fallan (los 4 `@bug`) |
| App con bugs, solo aceptación | `npx playwright test --grep @acceptanceTest` | 17 de 17 pasan |
| App de referencia (`MODO_REFERENCIA=true`) | `npx playwright test` | 22 de 22 pasan |
