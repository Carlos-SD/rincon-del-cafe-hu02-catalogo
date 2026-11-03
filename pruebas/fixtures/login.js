import { test as base, expect } from '@playwright/test';
import { PaginaLogin } from '../pages/PaginaLogin.js';
import { PaginaCatalogo } from '../pages/PaginaCatalogo.js';
import { usuarioDePrueba } from '../data/usuarios.js';

export const test = base.extend({
  // Página con la sesión iniciada (el login no es parte de la HU).
  paginaLogueada: async ({ page }, use) => {
    const login = new PaginaLogin(page);
    await login.ir();
    await login.iniciarSesion(usuarioDePrueba.correo, usuarioDePrueba.clave);
    await expect(login.menuCarrito).toBeVisible();
    await use(page);
  },

  // Pantalla de catálogo abierta, con la carga inicial ya pintada.
  catalogo: async ({ paginaLogueada }, use) => {
    const catalogo = new PaginaCatalogo(paginaLogueada);
    await catalogo.ir();
    await expect(catalogo.productos.first()).toBeVisible();
    await use(catalogo);
  },

  // Contexto HTTP con sesión, para las pruebas de API (capa intermedia de la pirámide).
  apiLogueada: async ({ request }, use) => {
    const r = await request.post('/api/login', {
      data: { correo: usuarioDePrueba.correo, contrasena: usuarioDePrueba.clave },
    });
    expect(r.ok()).toBeTruthy();
    await use(request);
  },
});

export { expect };
