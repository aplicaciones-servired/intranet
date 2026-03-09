import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setAdminToken } from "../../utils/adminAxios";

/**
 * Componente sin UI que mantiene actualizado el token de Clerk
 * en el módulo adminAxios. Debe montarse en el layout de admin.
 * Renueva el token cada 55 segundos (los tokens de Clerk expiran en 60s por defecto).
 */
export function AuthTokenSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      setAdminToken(null);
      return;
    }

    let active = true;

    const refresh = async () => {
      try {
        const token = await getToken();
        if (active) setAdminToken(token);
      } catch {
        if (active) setAdminToken(null);
      }
    };

    refresh();
    const interval = setInterval(refresh, 55_000);

    return () => {
      active = false;
      clearInterval(interval);
      setAdminToken(null);
    };
  }, [isSignedIn, getToken]);

  return null;
}
