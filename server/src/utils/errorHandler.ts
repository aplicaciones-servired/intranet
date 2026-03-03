import { Response } from "express";

/**
 * Manejo centralizado de errores 500.
 * Evita exponer detalles internos (error.message) en producción.
 */
export function handleServerError(res: Response, error: unknown, context?: string): void {
  const isDev = process.env.NODE_ENV !== "production";
  const message = error instanceof Error ? error.message : String(error);

  if (context) {
    console.error(`❌ Error en ${context}:`, message);
  } else {
    console.error("❌ Error interno:", message);
  }

  res.status(500).json({
    error: isDev ? message : "Error interno del servidor",
  });
}
