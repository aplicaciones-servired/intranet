import axios from "axios";

/**
 * Instancia de axios para operaciones admin.
 * Envia automáticamente la cookie de sesión (__session) en cada petición.
 * Los navegadores incluyen cookies en peticiones al mismo dominio automáticamente
 * cuando withCredentials es true.
 */
export const adminAxios = axios.create({
  withCredentials: true,
});

