import { Request, Response, NextFunction } from "express";

/**
 * Middleware que protege rutas de admin verificando el header x-api-key.
 * La clave se define en la variable de entorno API_SECRET.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_SECRET;

  if (!apiKey) {
    // Si no está configurada la clave, bloquear en producción
    console.error("❌ API_SECRET no está configurada en .env");
    res.status(500).json({ error: "Configuración de servidor incompleta" });
    return;
  }

  const headerKey = req.headers["x-api-key"];

  if (!headerKey || headerKey !== apiKey) {
    console.warn(`🚫 Intento de acceso no autorizado desde ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  next();
}
