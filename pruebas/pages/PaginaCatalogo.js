export class PaginaCatalogo {
  constructor(page) {
    this.page = page;
    this.menuCatalogo = page.getByRole('button', { name: 'Catálogo', exact: true });
    this.titulo = page.getByRole('heading', { name: 'Catálogo' });
    this.texto = page.getByLabel('Texto');
    this.categoria = page.getByLabel('Categoría');
    this.precioMaximo = page.getByLabel('Precio máximo');
    this.botonBuscar = page.getByRole('button', { name: 'Buscar' });
    this.totalResultados = page.getByTestId('total-resultados');
    // La lista no tiene nombre accesible: se usa su id como último recurso.
    this.productos = page.locator('#lista-productos').getByRole('listitem');
    this.mensaje = page.getByRole('status');
  }

  // Así muestra la pantalla cada producto: "Espresso (bebidas): $8000".
  static textoDe(producto) {
    return `${producto.nombre} (${producto.categoria}): $${producto.precio}`;
  }

  async ir() {
    await this.menuCatalogo.click();
    await this.titulo.waitFor();
  }

  async filtrar({ precioMax, categoria = '', texto = '' }) {
    await this.texto.fill(texto);
    await this.categoria.selectOption(categoria);
    await this.precioMaximo.fill(String(precioMax ?? ''));
    await this.botonBuscar.click();
  }

  // Precios que se ven en la lista, leídos del texto "…: $8000".
  async preciosMostrados() {
    const textos = await this.productos.allTextContents();
    return textos.map((t) => Number(t.split('$').pop()));
  }

  // Mensaje de validación nativo del navegador para el campo de precio.
  async mensajeValidacionPrecio() {
    return this.precioMaximo.evaluate((input) => input.validationMessage);
  }
}
