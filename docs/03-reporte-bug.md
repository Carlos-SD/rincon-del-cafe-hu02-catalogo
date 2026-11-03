# Reporte de defecto · HU-02 Catálogo

| Campo | Valor |
|---|---|
| ID | BUG-HU02-01 |
| Título | El filtro de precio máximo muestra productos más caros que el máximo indicado |
| Historia | HU-02 · Catálogo |
| Criterio que incumple | CA-1: "Solo aparecen productos con precio menor o igual al precio máximo indicado" (y por arrastre CA-2, porque el contador cuenta productos que no deberían estar) |
| Severidad | Alta: el cliente ve productos que no puede pagar, justo lo que la historia busca evitar |
| Prioridad | Alta |
| Ambiente | Local, `http://localhost:3000`, Chromium (Playwright 1.64.1), Node 22+ |
| Detectado por | Casos `BUG-01`, `BUG-02`, `BUG-03`, `BUG-API` (`pruebas/tests/catalogo.bug.spec.js`) |

## Pasos para reproducir
1. Iniciar sesión con `estudiante1@cafe.test` / `Cafe2026`.
2. Abrir **Catálogo**.
3. Escribir `12000` en **Precio máximo** y pulsar **Buscar**.

## Resultado esperado
5 productos: Té verde ($7.000), Espresso ($8.000), Croissant ($9.000), Brownie ($10.000) y Latte ($12.000). `Resultados: 5`.

## Resultado obtenido
6 productos: aparece además **Capuchino ($13.000)**. `Resultados: 6`.

## Otros valores que lo reproducen
| Precio máximo | Producto que no debería aparecer |
|---|---|
| 7.000 | Espresso ($8.000) |
| 12.000 | Capuchino ($13.000) |
| 15.000 | Cheesecake ($16.000) |
| 11.999 | Latte ($12.000) y Capuchino ($13.000) |

## Patrón
La app incluye los productos cuyo precio es hasta un **15 %** mayor que el máximo: se comporta como `precio <= máximo × 1,15` en vez de `precio <= máximo`. Por eso valores como 10.000 o 13.000 no lo evidencian: no hay productos entre 10.000 y 11.500 ni entre 13.000 y 14.950.

También se reproduce en la API, sin pasar por la pantalla:
```bash
# con una sesión iniciada (cookie connect.sid)
GET /api/productos?precioMax=12000
# → { "total": 6, "productos": [ …, { "nombre": "Capuchino", "precio": 13000 } ] }
```

## Causa (análisis de caja blanca)
`app/server.js`, ruta `GET /api/productos`:
```js
lista = lista.filter((p) =>
  activo('catalogo_precio_sobrepasa') ? p.precio <= max * 1.15 : p.precio <= max
);
```
El interruptor `catalogo_precio_sobrepasa` de `app/lib/bugs.js` está activo. Con `MODO_REFERENCIA=true` la app usa `p.precio <= max` y los cuatro casos `@bug` pasan (prueba de confirmación).

## Evidencia
- Ejecución local con bug: los 4 casos `@bug` fallan; Playwright guarda captura y reporte en `pruebas/playwright-report/`.
- Ejecución local con `MODO_REFERENCIA=true`: 22 de 22 casos pasan.

## Observaciones adicionales (no son el bug inyectado)
- Con precio máximo **negativo**, el error lo muestra el **navegador** (el campo tiene `min="0"`), no la app: la consulta nunca se envía. La API sí responde 400 con "El precio máximo debe ser mayor que 0".
- Con precio máximo **0**, la app muestra el error pero deja en pantalla la lista y el contador de la búsqueda anterior. No incumple la historia, pero puede confundir al cliente.
