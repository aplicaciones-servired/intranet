import { createHmac, timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";

const SESSION_COOKIE = "__session";

function base64urlToBuffer(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Verifica el JWT HS256 (__session cookie) con crypto nativo de Node.js.
 * Compatible con tokens firmados por jose (cliente Astro) y la API corporativa.
 * Sin dependencias ESM externas.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    console.warn(`🚫 Sin cookie de sesión: ${req.ip} → ${req.method} ${req.path}`);
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("JWT malformado");

    const [headerB64, payloadB64, sigB64] = parts;

    // Verificar expiración
    const payload = JSON.parse(base64urlToBuffer(payloadB64).toString("utf8"));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      throw new Error("Token expirado");
    }

    // Verificar firma HMAC-SHA256 (timing-safe)
    const secret = process.env.JWT_SECRET || "";
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = createHmac("sha256", secret).update(data).digest();
    const actualSig = base64urlToBuffer(sigB64);

    if (
      expectedSig.length !== actualSig.length ||
      !timingSafeEqual(expectedSig, actualSig)
    ) {
      throw new Error("Firma inválida");
    }

    next();
  } catch (err: any) {
    console.warn(`🚫 JWT inválido: ${req.ip} → ${req.method} ${req.path} — ${err.message}`);
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

// Alias para compatibilidad con las rutas existentes
export const requireClerkAuth = requireAuth;
