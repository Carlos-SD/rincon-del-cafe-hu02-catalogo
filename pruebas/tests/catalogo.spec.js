// HU-02 · Catálogo — pruebas de interfaz (E2E).
// Como cliente, quiero filtrar productos por precio máximo para ver solo lo que puedo pagar.
import { test, expect } from '../fixtures/login.js';
import { PaginaCatalogo } from '../pages/PaginaCatalogo.js';
import {
  CATALOGO,
  productosHasta,
  MENSAJE_PRECIO_INVALIDO,
} from '../data/productos.js';
import {
  FILTROS_VALIDOS,
  FILTRO_CON_CATEGORIA,
  PRECIOS_INVALIDOS,
} from '../data/casosCatalogo.js';

test.describe('HU-02 Catálogo · filtro por precio máximo', () => {
  // Criterios 1 y 2: solo productos con precio <= máximo, y el número de
  // resultados coincide con los productos que se ven.
  for (const caso of FILTROS_VALIDOS) {
    test(`${caso.id} precio máximo ${caso.precioMax}: ${caso.descripcion} @HU02 @acceptanceTest`, async ({ catalogo }) => {
      const esperados = productosHasta(caso.precioMax);

      await catalogo.filtrar({ precioMax: caso.precioMax });

      await expect(catalogo.productos).toHaveText(esperados.map(PaginaCatalogo.textoDe));
      await expect(catalogo.totalResultados).toHaveText(String(esperados.length));
      await expect(catalogo.productos).toHaveCount(esperados.length);
      await expect(catalogo.mensaje).toBeEmpty();
    });
  }

  test(`${FILTRO_CON_CATEGORIA.id} el precio máximo se combina con la categoría @HU02 @acceptanceTest`, async ({ catalogo }) => {
    const { precioMax, categoria } = FILTRO_CON_CATEGORIA;
    const esperados = productosHasta(precioMax, categoria);

    await catalogo.filtrar({ precioMax, categoria });

    await expect(catalogo.productos).toHaveText(esperados.map(PaginaCatalogo.textoDe));
    await expect(catalogo.totalResultados).toHaveText(String(esperados.length));
  });

  test('CP-07 sin precio máximo se muestra todo el catálogo y el contador coincide @HU02 @acceptanceTest', async ({ catalogo }) => {
    await catalogo.filtrar({ precioMax: '' });

    await expect(catalogo.productos).toHaveCount(CATALOGO.length);
    await expect(catalogo.totalResultados).toHaveText(String(CATALOGO.length));
  });

  // Criterio 3: un precio máximo de 0 o negativo muestra un error.
  test(`${PRECIOS_INVALIDOS[0].id} precio máximo 0 muestra el error de la app @HU02 @acceptanceTest`, async ({ catalogo }) => {
    await catalogo.filtrar({ precioMax: PRECIOS_INVALIDOS[0].precioMax });

    await expect(catalogo.mensaje).toHaveText(MENSAJE_PRECIO_INVALIDO);
  });

  test(`${PRECIOS_INVALIDOS[1].id} precio máximo negativo muestra un error y no filtra @HU02 @acceptanceTest`, async ({ catalogo, paginaLogueada: page }) => {
    // El campo tiene min="0": el navegador frena el envío antes de llegar a la app.
    let consultas = 0;
    page.on('request', (r) => {
      if (r.url().includes('/api/productos?')) consultas++;
    });

    await catalogo.filtrar({ precioMax: PRECIOS_INVALIDOS[1].precioMax });

    expect(await catalogo.mensajeValidacionPrecio()).not.toBe('');
    await expect(catalogo.productos).toHaveCount(CATALOGO.length);
    expect(consultas).toBe(0);
  });
});
