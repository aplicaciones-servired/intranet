import { Request, Response, NextFunction } from "express";

const SESSION_COOKIE = "__session";

/**
 * Middleware que protege rutas verificando el JWT de sesión (__session cookie).
 * Usa dynamic import de jose para compatibilidad con módulos CommonJS del servidor.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    console.warn(`🚫 Sin cookie de sesión: ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    const { jwtVerify } = await import("jose");
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
