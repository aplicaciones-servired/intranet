import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";

export const POST: APIRoute = async ({ request }) => {
  // LOGIN_API_URL: variable runtime inyectada por docker-compose (proxy nginx interno)
  // Fallback: PUBLIC_LOGIN_URL para desarrollo local
  const loginApiUrl = process.env.LOGIN_API_URL ?? (import.meta.env.PUBLIC_LOGIN_URL as string);

  try {
    const body = await request.json().catch(() => null);
    const username: string = body?.username?.trim() ?? "";
    const password: string = body?.password ?? "";

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Usuario y contraseña son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Llamar a la API corporativa
    const loginRes = await fetch(`${loginApiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!loginRes.ok) {
      const errBody = await loginRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: errBody.message ?? "Credenciales inválidas" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // La API corporativa devuelve el JWT firmado en una cookie del response.
    // Extraemos el valor (primer cookie del header Set-Cookie).
    const setCookieHeader = loginRes.headers.get("set-cookie") ?? "";
    const tokenMatch = setCookieHeader.match(/^[^=]+=([^;]+)/);
    const token = tokenMatch?.[1] ?? null;

    if (!token) {
      console.error("API corporativa no devolvió cookie de sesión");
      return new Response(
        JSON.stringify({ error: "Error al iniciar sesión" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Reenviamos el JWT de la API como nuestra cookie __session.
    // Se verifica con el mismo JWT_SECRET que usa la API corporativa.
    // NODE_ENV es más confiable que X-Forwarded-Proto (la cadena NPM→nginx puede modificarlo).
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${secure}`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ Error en /api/auth/login:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
