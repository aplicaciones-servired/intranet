import { createHmac, timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";

const SESSION_COOKIE = "__session";

export interface PayloadSesion {
  id?: string | number;
  username?: string;
  names?: string;
  lastnames?: string;
  document?: string;
  email?: string;
  company?: string;
  exp?: number;
}

function base64urlToBuffer(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Verifica el JWT HS256 (__session cookie) con crypto nativo de Node.js.
 * Compatible con tokens firmados por jose (cliente Astro) y la API corporativa.
 * Sin dependencias ESM externas.
 */
export function verificarToken(token: string): PayloadSesion {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("JWT malformado");

  const [headerB64, payloadB64, sigB64] = parts;

  // Verificar expiración
  const payload = JSON.parse(base64urlToBuffer(payloadB64).toString("utf8")) as PayloadSesion;
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Token expirado");
  }

  // Verificar firma HMAC-SHA256 (timing-safe)
  const secret = process.env.JWT_SECRET || "";
  if (!secret) {
    throw new Error("JWT_SECRET no configurado");
  }
  const data = `${headerB64}.${payloadB64}`;
  const expectedSig = createHmac("sha256", secret).update(data).digest();
  const actualSig = base64urlToBuffer(sigB64);

  if (
    expectedSig.length !== actualSig.length ||
    !timingSafeEqual(expectedSig, actualSig)
  ) {
    throw new Error("Firma inválida");
  }

  return payload;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    console.warn(`🚫 Sin cookie de sesión: ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  // C3: fail-closed si el servidor no tiene JWT_SECRET configurado.
  // Si el secreto está vacío, rechazamos en vez de validar contra HMAC("") 
  // (lo que permitiría forjar tokens firmados con clave vacía).
  if (!process.env.JWT_SECRET) {
    console.error("🚫 JWT_SECRET no está configurado en el servidor. Rechazando autenticación.");
    res.status(500).json({ error: "Servidor mal configurado" });
    return;
  }

  try {
    const payload = verificarToken(token);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    console.warn(`🚫 JWT inválido: ${req.ip} → ${req.method} ${req.path} — ${err.message}`);
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

// Alias para compatibilidad con las rutas existentes
export const requireClerkAuth = requireAuth;

/**
 * Restringe las rutas a usuarios administradores.
 * La lista sale de ADMIN_USERS (usernames del JWT separados por coma).
 * Si ADMIN_USERS no está definida, se comporta como requireAuth y advierte,
 * para no romper despliegues existentes que no han definido la lista.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const admins = (process.env.ADMIN_USERS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (admins.length === 0) {
    console.warn(`⚠️ ADMIN_USERS no configurado: ${req.method} ${req.path} se protege solo con autenticación.`);
    return requireAuth(req, res, next);
  }

  await requireAuth(req, res, () => {
    const user = (req as any).user as PayloadSesion | undefined;
    const username = String(user?.username || "").trim().toLowerCase();
    if (!username || !admins.includes(username)) {
      console.warn(`🚫 Acceso admin denegado: ${req.ip} → ${req.method} ${req.path} — usuario: ${username || "desconocido"}`);
      res.status(403).json({ error: "No tiene permisos de administrador" });
      return;
    }
    next();
  });
}
