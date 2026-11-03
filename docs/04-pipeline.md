# Pipeline · explicación paso a paso

Archivo: [`.github/workflows/pipeline.yml`](../.github/workflows/pipeline.yml). Un solo job, `pruebas-aceptacion`. Alcance del taller: levantar la app y ejecutar las pruebas de aceptación; **no** hay despliegue a Render.

## Recorrido

| Bloque | Qué hace | Por qué |
|---|---|---|
| `on: push / pull_request [main]` + `workflow_dispatch` | Corre en cada push o PR hacia `main`, y a mano desde Actions | El PR valida un cambio **antes** de integrarlo |
| `permissions: contents: read` | El `GITHUB_TOKEN` solo puede leer el código | Mínimo privilegio. A diferencia del `ci.yml` de Karate, no actualizamos Issues, así que no necesitamos `issues: write` |
| `runs-on: ubuntu-latest` | Máquina virtual Linux nueva por ejecución | Empieza vacía: todo lo que se use se instala en el job |
| `actions/checkout@v7` | Baja el código del commit | Equivale a un `git clone` del mismo commit que se va a probar |
| `actions/setup-node@v7` con `cache: npm` | Instala Node 22 y cachea las descargas de npm | La clave del caché sale de los dos `package-lock.json`; si cambian, el caché se reconstruye |
| `npm ci` en `app/` y en `pruebas/` | Instala exactamente lo que dicen los lockfiles | Lo que pasa en local pasa igual en GitHub. Por eso los dos `package-lock.json` están en el repo |
| `npx playwright install --with-deps chromium` | Baja Chromium y sus librerías del sistema | Sin este paso Playwright no tiene navegador |
| `nohup npm start > app.log 2>&1 &` | Levanta la app en el puerto 3000 en segundo plano | El `&` deja el proceso vivo para los pasos siguientes; el log se guarda para diagnosticar |
| Bucle con `curl -sf http://localhost:3000` | Reintenta hasta 30 s a que la app responda | Evita `ECONNREFUSED`: no se prueba antes de que la app esté arriba |
| `npx playwright test --grep @acceptanceTest` | Corre solo los casos con esa etiqueta en el título | Solo esos deciden si el commit sirve. **Sin `continue-on-error`**: si uno falla, el job queda en rojo |
| `upload-artifact` con `if: always()` | Sube `pruebas/playwright-report/` y `app/app.log` | Corre aunque las pruebas fallen, que es justo cuando más se necesita el reporte |

## Relación con `playwright.config.js`

```js
webServer: {
  command: 'npm start',
  cwd: '../app',
  url: 'http://localhost:3000',
  reuseExistingServer: true,
},
```

- **En local:** si la app está apagada, Playwright la enciende con `npm start` en `../app` y la apaga al final. Si ya está encendida, la reutiliza.
- **En el pipeline:** la app ya la levantó el paso anterior. Con `reuseExistingServer: true` Playwright ve que `localhost:3000` responde y **no** intenta abrir otro servidor en el mismo puerto. Con `false` fallaría por puerto en uso.
- `cwd` se resuelve desde la carpeta de `playwright.config.js` (`pruebas/`), por eso es `../app`.
- `retries: process.env.CI ? 1 : 0` y `trace: 'on-first-retry'`: en GitHub (donde `CI=true`) un caso que falla se reintenta una vez y se graba el trace para abrirlo con Trace Viewer desde el reporte.

## Tarea de la diapositiva 23: ¿qué se reutiliza del `ci.yml` de Karate/Serenity?

| Parte del `ci.yml` | ¿Reutilizable? | Qué cambia para Playwright |
|---|---|---|
| `on:` (disparadores) | Parcial | Se mantienen push, PR y `workflow_dispatch`. Quitamos `develop` y el input `testTag`: el tag es fijo, `@acceptanceTest` |
| `permissions` | Parcial | Solo `contents: read`; no se usa `issues: write` porque no actualizamos Issues |
| Preparar entorno (checkout y setup) | Parcial | `checkout` igual; `setup-java` se cambia por `setup-node` con Node 22 |
| Caché de dependencias | Parcial | En vez de `actions/cache` con rutas de Gradle, `setup-node` con `cache: npm` y los dos lockfiles |
| Ejecutar pruebas (paso 8) | Parcial | Se cambia Gradle por `npx playwright test --grep @acceptanceTest` y se **quita** `continue-on-error: true` |
| Reportes (`upload-artifact`) | Sí | Mismo patrón con `if: always()`; cambia la ruta a `pruebas/playwright-report/` |
| Actualizar Issue (curl) | No | No hace parte del taller |
| Paso final (`exit 1`) | No | Ya no hace falta: sin `continue-on-error`, el paso de pruebas falla por sí solo y deja el job en rojo |
| *(nuevo)* | — | Levantar la app en el 3000 y esperar a que responda; instalar Chromium |

## Prueba del bloqueo
Se hizo en la rama `demo/bloqueo-pipeline` (PR en el repositorio):
1. Commit que rompe a propósito un caso `@acceptanceTest` (CP-01 espera un producto de más) → el job queda en **rojo** y el reporte igual se sube en Artifacts.
2. Commit que lo corrige → el job vuelve a **verde**.

## Comandos útiles en local
```bash
cd app && npm ci && npm start                      # app en http://localhost:3000
cd pruebas && npm ci && npx playwright install --with-deps chromium
npx playwright test --grep @acceptanceTest --list  # qué casos corre el pipeline
npx playwright test --grep @acceptanceTest         # lo mismo que el pipeline
npx playwright test --grep @bug                    # casos que detectan el bug (fallan)
npx playwright show-report                         # reporte HTML
```
