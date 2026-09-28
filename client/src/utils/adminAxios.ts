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

// Si la sesión expira mientras se usa el panel admin (401), redirige al login
// preservando la URL de regreso.
adminAxios.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/sign-in")) {
        const destino = encodeURIComponent(path + window.location.search);
        window.location.assign(`/sign-in?redirect_url=${destino}`);
      }
    }
    return Promise.reject(error);
  },
);

