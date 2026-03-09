import axios from "axios";

/**
 * Token de sesión Clerk para peticiones admin.
 * Lo actualiza AuthTokenSync.tsx antes de cualquier llamada.
 */
let _sessionToken: string | null = null;

export function setAdminToken(token: string | null) {
  _sessionToken = token;
}

/**
 * Instancia de axios que inyecta automáticamente el JWT de Clerk
 * en el header Authorization: Bearer <token> de cada petición.
 * Usar solo para operaciones que requieren autenticación (admin).
 */
export const adminAxios = axios.create();

adminAxios.interceptors.request.use((config) => {
  if (_sessionToken) {
    config.headers.Authorization = `Bearer ${_sessionToken}`;
  }
  return config;
});
