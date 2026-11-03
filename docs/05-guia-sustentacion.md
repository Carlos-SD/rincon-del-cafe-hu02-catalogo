# Guía de sustentación · HU-02 Catálogo

La profesora preguntará cómo se construyó. Estas son las preguntas más probables y lo que hay que poder responder **con palabras propias**. Antes de sustentar, ejecuten todo en local al menos una vez y abran el reporte.

## La historia y el bug

**¿Cuál fue el bug y cómo lo encontraron?**
Diseñamos casos con valores límite del precio máximo. Con 12.000 se esperaban 5 productos y la app mostró 6: apareció Capuchino de 13.000. Probando 7.000 y 15.000 vimos el patrón: la app deja pasar productos hasta un 15 % más caros que el máximo (`precio <= max * 1.15`).

**¿Por qué 10.000 o 13.000 no lo detectan?**
Porque ningún producto cae en la ventana del bug: no hay precios entre 10.000 y 11.500, ni entre 13.000 y 14.950. Un caso solo detecta el bug si hay un producto con precio entre el máximo y el máximo × 1,15.

**¿Cómo saben que su prueba del bug es correcta y no está mal escrita?**
Porque con la app de referencia (`MODO_REFERENCIA=true`) los 4 casos `@bug` pasan. Fallan solo cuando el bug está activo. Eso es una prueba de confirmación.

**¿Por qué el caso que detecta el bug no tiene `@acceptanceTest`?**
Porque fallaría siempre y el pipeline quedaría en rojo en todos los commits. Lo marcamos `@bug`: existe, se puede correr con `npm run test:bug`, pero no bloquea.

**¿Qué técnicas de diseño usaron?**
Particiones de equivalencia (≤ 0 inválido; entre 0 y el más barato; rango parcial; todo el catálogo; sin filtro) y valores límite (0, 1, precio exacto de un producto, el producto más caro).

**¿Qué pasa con un precio negativo?**
El campo tiene `min="0"`, así que el navegador bloquea el envío y muestra su propio mensaje; la consulta ni siquiera llega a la app. La prueba verifica que hay mensaje de validación y que no se hizo ninguna petición. En la API, el negativo responde 400 con "El precio máximo debe ser mayor que 0".

## Playwright y las capas

**¿Qué va en cada carpeta?**
- `tests/`: qué debe pasar (`test` y `expect`). No hay localizadores.
- `fixtures/`: cómo se llega al estado inicial (login, abrir catálogo, sesión para la API).
- `pages/`: localizadores y acciones de cada pantalla. Es el único lugar con selectores.
- `data/`: el catálogo esperado (oráculo), usuarios y los datos de cada caso.

**¿Por qué el resultado esperado está en `data/productos.js` y no se lee de la app?**
Porque si el esperado viniera de la misma app, el bug también estaría en el esperado y la prueba nunca fallaría. El oráculo sale de la especificación y del seed.

**¿Qué localizadores usaron y por qué?**
`getByLabel('Precio máximo')`, `getByRole('button', { name: 'Buscar' })`, `getByTestId('total-resultados')`, `getByRole('status')` para el mensaje. Para la lista usamos `#lista-productos` porque no tiene nombre accesible: es el último recurso de la escalera y solo vive en `PaginaCatalogo.js`.

**¿Cómo evitan leer la lista antes de que se actualice?**
Con aserciones web-first (`toHaveText`, `toHaveCount`) y `expect.poll`, que reintentan hasta que la condición se cumple o vence el tiempo. No usamos `waitForTimeout`.

**¿Por qué hay pruebas de API además de las de interfaz?**
Pirámide de Cohn: las de API son más rápidas y estables y verifican la regla de negocio; las de interfaz verifican lo que ve el cliente (contador, lista, mensaje). Los mismos criterios en dos niveles.

## El pipeline

**¿Qué hace el job y en qué orden?**
Baja el código, instala Node 22, `npm ci` en `app/` y en `pruebas/`, instala Chromium, levanta la app en el 3000 en segundo plano, espera hasta que responda, corre `npx playwright test --grep @acceptanceTest` y sube el reporte aunque fallen.

**¿Qué pasa si falla un `@acceptanceTest`?**
El paso de pruebas termina con código distinto de 0, el job queda en rojo y el reporte igual se sube. Lo comprobamos en la rama `demo/bloqueo-pipeline`: rompimos CP-01 a propósito, quedó rojo, lo corregimos y volvió a verde.

**¿Por qué `reuseExistingServer: true`?**
El pipeline ya levantó la app. Si estuviera en `false`, Playwright intentaría iniciar otra en el mismo puerto 3000 y fallaría por puerto ocupado.

**¿Por qué no hay `continue-on-error`?**
Porque haría que el job pareciera exitoso aunque las pruebas fallen. En el `ci.yml` de Karate se usaba junto a un paso final con `exit 1`; aquí no hace falta ninguno de los dos.

**¿Por qué `npm ci` y no `npm install`?**
`npm ci` instala exactamente lo que dice `package-lock.json` y falla si no coincide con `package.json`. Así el pipeline usa las mismas versiones que nuestro computador.

**¿Por qué `if: always()` en el reporte?**
Sin él, el paso se salta cuando las pruebas fallan, justo cuando más se necesita el reporte.

**¿Por qué un mono repo?**
La app y sus pruebas viajan en el mismo commit, así el pipeline prueba exactamente esa versión. GitHub solo lee `.github/workflows/` en la raíz.

## Checklist de la sección 6 de las instrucciones

- [x] El workflow está en `.github/workflows/pipeline.yml` en la raíz.
- [x] Carpeta de pruebas: `pruebas/`.
- [x] `pruebas/package.json` tiene `"type": "module"`.
- [x] Hay `package-lock.json` en `app/` y en `pruebas/`, y el workflow usa `npm ci`.
- [x] El job levanta la app en el 3000 y espera a que responda.
- [x] `playwright.config.js` tiene `webServer` con `reuseExistingServer: true`.
- [x] Los casos de aceptación llevan `@acceptanceTest` en el título.
- [x] El job ejecuta `npx playwright test --grep @acceptanceTest`.
- [x] El job no tiene `continue-on-error`.
- [x] El reporte se sube como artifact con `if: always()`.
- [x] `node_modules/` y los reportes están en `.gitignore`.
- [x] Se probó un fallo a propósito y el pipeline quedó en rojo.
