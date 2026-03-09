import { jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";

const SESSION_COOKIE = "__session";

/**
 * Middleware que protege rutas verificando el JWT de sesión (__session cookie).
 * El token fue emitido por el cliente Astro tras autenticar contra la API corporativa.
 * Se comparte el mismo JWT_SECRET entre cliente (Astro) y servidor (Express).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    console.warn(`🚫 Sin cookie de sesión: ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    await jwtVerify(token, secret);
    next();
  } catch {
    console.warn(`🚫 JWT inválido o expirado: ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

// Alias para compatibilidad con las rutas existentes
export const requireClerkAuth = requireAuth;
