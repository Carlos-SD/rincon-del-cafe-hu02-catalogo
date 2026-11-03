// Cuenta de práctica del taller. Se puede cambiar con variables de entorno
// para que cada integrante de la pareja use su propia cuenta.
export const usuarioDePrueba = {
  correo: process.env.CAFE_CORREO || 'estudiante1@cafe.test',
  clave: process.env.CAFE_CLAVE || 'Cafe2026',
};
