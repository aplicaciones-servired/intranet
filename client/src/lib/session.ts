import { jwtVerify } from "jose";

/**
 * Estructura del payload JWT que firma la API corporativa.
 * Campos definidos en su controlador loginUser.
 */
export interface SessionUser {
  id: number | string;
  names: string;
  lastnames: string;
  document: string;
  username: string;
  email: string;
  company: string;
  process: string;
  sub_process: string;
  state: string;
}

export const SESSION_COOKIE = "__session";

function getSecret(): Uint8Array {
  // En Astro SSR las variables privadas están disponibles vía import.meta.env
  const secret = import.meta.env.JWT_SECRET as string | undefined;
  if (!secret) throw new Error("JWT_SECRET no está configurado");
  return new TextEncoder().encode(secret);
}

/**
 * Verifica el JWT firmado por la API corporativa (mismo JWT_SECRET).
 * Devuelve el usuario del payload o null si el token es inválido/expirado.
 */
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as Record<string, unknown>;
    return {
      id: p.id as number | string,
      names: p.names as string,
      lastnames: p.lastnames as string,
      document: p.document as string,
      username: p.username as string,
      email: p.email as string,
      company: p.company as string,
      process: p.process as string,
      sub_process: p.sub_process as string,
      state: p.state as string,
    };
  } catch {
    return null;
  }
}
