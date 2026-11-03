// Datos de los casos de prueba de la HU-02.
// Técnicas: particiones de equivalencia y análisis de valores límite.

// Casos válidos que pasan con la app actual: ningún producto cae en la
// "ventana del bug" (precio > máximo y precio <= máximo * 1.15).
export const FILTROS_VALIDOS = [
  { id: 'CP-01', precioMax: 10000, descripcion: 'límite exacto: incluye el producto que cuesta lo mismo (Brownie)' },
  { id: 'CP-02', precioMax: 13000, descripcion: 'límite exacto en otro rango (Capuchino)' },
  { id: 'CP-03', precioMax: 16000, descripcion: 'igual al producto más caro: muestra todo el catálogo' },
  { id: 'CP-04', precioMax: 6000, descripcion: 'menor que el producto más barato: cero resultados' },
  { id: 'CP-05', precioMax: 1, descripcion: 'valor límite válido más pequeño: sin error y cero resultados' },
];

export const FILTRO_CON_CATEGORIA = { id: 'CP-06', precioMax: 10000, categoria: 'bebidas' };

// Partición inválida: 0 y negativos.
export const PRECIOS_INVALIDOS = [
  { id: 'CP-08', precioMax: 0, descripcion: 'cero (límite inválido)' },
  { id: 'CP-09', precioMax: -5000, descripcion: 'negativo' },
];

// Casos que detectan el bug inyectado: hay un producto con precio
// apenas por encima del máximo (dentro del 15 %) que la app no debería mostrar.
export const FILTROS_BUG = [
  { id: 'BUG-01', precioMax: 12000, intruso: 'Capuchino' },
  { id: 'BUG-02', precioMax: 7000, intruso: 'Espresso' },
  { id: 'BUG-03', precioMax: 15000, intruso: 'Cheesecake' },
];
