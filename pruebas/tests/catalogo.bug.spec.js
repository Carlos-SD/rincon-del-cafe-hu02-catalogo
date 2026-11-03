// HU-02 · Catálogo — casos que detectan el bug inyectado.
//
// Bug: el filtro deja pasar productos hasta un 15 % más caros que el precio
// máximo (precio <= máximo * 1.15 en vez de precio <= máximo).
//
// Estos casos FALLAN mientras el bug exista. Por eso llevan @bug y no
// @acceptanceTest: si bloquearan el pipeline, quedaría siempre en rojo.
// Con la app de referencia (MODO_REFERENCIA=true) pasan todos.
import { test, expect } from '../fixtures/login.js';
import { PaginaCatalogo } from '../pages/PaginaCatalogo.js';
import { productosHasta } from '../data/productos.js';
import { FILTROS_BUG } from '../data/casosCatalogo.js';

test.describe('HU-02 Catálogo · detección del bug de precio máximo', () => {
  for (const caso of FILTROS_BUG) {
    test(`${caso.id} con precio máximo ${caso.precioMax} no aparece ${caso.intruso} @HU02 @bug`, async ({ catalogo }) => {
      const esperados = productosHasta(caso.precioMax);

      await catalogo.filtrar({ precioMax: caso.precioMax });

      // Ningún precio mostrado supera el máximo (criterio 1).
      await expect
        .poll(async () => (await catalogo.preciosMostrados()).filter((p) => p > caso.precioMax))
        .toEqual([]);
      await expect(catalogo.productos).toHaveText(esperados.map(PaginaCatalogo.textoDe));
      await expect(catalogo.totalResultados).toHaveText(String(esperados.length));
    });
  }

  test('BUG-API precioMax=12000 no devuelve productos más caros que el máximo @HU02 @api @bug', async ({ apiLogueada }) => {
    const r = await apiLogueada.get('/api/productos', { params: { precioMax: 12000 } });
    const { productos } = await r.json();

    expect(productos.filter((p) => p.precio > 12000)).toEqual([]);
  });
});
