import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import axios from "axios";

export const POST: APIRoute = async ({ request, cookies }) => {
  const loginApiUrl = process.env.LOGIN_API_URL ?? (import.meta.env.PUBLIC_LOGIN_URL as string);
  // Intentar logout en la API corporativa (best effort — nunca bloquea el borrado de cookie)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await axios.post(`${loginApiUrl}/logout`, { headers: { Cookie: cookie } });
  } catch (_error) {
    // No interrumpir: la cookie local se borra siempre
  }

  // Usar la API nativa de Astro — maneja Secure/Path/HttpOnly automáticamente
  cookies.delete(SESSION_COOKIE, { path: "/" });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
