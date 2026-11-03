// Oráculo de la HU-02: el catálogo de partida (app/data/seed.json) escrito
// a mano. Las pruebas comparan lo que muestra la app contra esta lista,
// no contra lo que la app calcula.
export const CATALOGO = [
  { nombre: 'Espresso', categoria: 'bebidas', precio: 8000 },
  { nombre: 'Latte', categoria: 'bebidas', precio: 12000 },
  { nombre: 'Capuchino', categoria: 'bebidas', precio: 13000 },
  { nombre: 'Té verde', categoria: 'bebidas', precio: 7000 },
  { nombre: 'Croissant', categoria: 'postres', precio: 9000 },
  { nombre: 'Brownie', categoria: 'postres', precio: 10000 },
  { nombre: 'Cheesecake', categoria: 'postres', precio: 16000 },
  { nombre: 'Sándwich de pollo', categoria: 'comida', precio: 15000 },
];

// Resultado esperado según el criterio 1: precio <= precio máximo.
export function productosHasta(precioMax, categoria = '') {
  return CATALOGO.filter(
    (p) => p.precio <= precioMax && (!categoria || p.categoria === categoria)
  );
}

export const MENSAJE_PRECIO_INVALIDO = 'El precio máximo debe ser mayor que 0';
