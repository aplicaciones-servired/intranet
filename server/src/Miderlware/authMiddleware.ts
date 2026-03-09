import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

/**
 * Middleware que protege rutas de admin verificando el JWT de sesión de Clerk.
 * Requiere que app.use(clerkMiddleware()) esté en index.ts.
 * El cliente debe pasar: Authorization: Bearer <clerk_session_token>
 */
export function requireClerkAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);

  if (!userId) {
    console.warn(`🚫 Intento de acceso no autorizado desde ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  next();
}
