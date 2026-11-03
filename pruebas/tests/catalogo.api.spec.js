// HU-02 · Catálogo — pruebas de API (capa intermedia de la pirámide de Cohn).
// Verifican las mismas reglas de negocio sin pasar por la pantalla.
import { test, expect } from '../fixtures/login.js';
import { productosHasta, MENSAJE_PRECIO_INVALIDO } from '../data/productos.js';
import { FILTROS_VALIDOS, PRECIOS_INVALIDOS } from '../data/casosCatalogo.js';

test.describe('HU-02 Catálogo · API GET /api/productos', () => {
  for (const caso of FILTROS_VALIDOS) {
    test(`API ${caso.id} precioMax=${caso.precioMax} devuelve solo productos con precio <= máximo @HU02 @api @acceptanceTest`, async ({ apiLogueada }) => {
      const r = await apiLogueada.get('/api/productos', { params: { precioMax: caso.precioMax } });
      expect(r.status()).toBe(200);
      const { total, productos } = await r.json();

      expect(productos.map((p) => p.nombre).sort()).toEqual(
        productosHasta(caso.precioMax).map((p) => p.nombre).sort()
      );
      expect(total).toBe(productos.length);
    });
  }

  for (const caso of [...PRECIOS_INVALIDOS, { id: 'CP-10', precioMax: -1, descripcion: 'negativo cercano a 0' }]) {
    test(`API ${caso.id} precioMax=${caso.precioMax} responde 400 con el error @HU02 @api @acceptanceTest`, async ({ apiLogueada }) => {
      const r = await apiLogueada.get('/api/productos', { params: { precioMax: caso.precioMax } });

      expect(r.status()).toBe(400);
      expect((await r.json()).error).toBe(MENSAJE_PRECIO_INVALIDO);
    });
  }

  test('API CP-11 sin sesión no se puede consultar el catálogo @HU02 @api', async ({ playwright, baseURL }) => {
    const anonimo = await playwright.request.newContext({ baseURL });
    const r = await anonimo.get('/api/productos', { params: { precioMax: 10000 } });
    expect(r.status()).toBe(401);
    await anonimo.dispose();
  });
});
