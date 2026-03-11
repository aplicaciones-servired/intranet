import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import axios from "axios";

export const POST: APIRoute = async ({ request }) => {
  const loginApiUrl = process.env.LOGIN_API_URL ?? (import.meta.env.PUBLIC_LOGIN_URL as string);
  // Intentar logout en la API corporativa también (best effort)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await axios.post(`${loginApiUrl}/logout`, { headers: { Cookie: cookie } });
  } catch (error) {
    // Si falla la petición, continuar de todas formas (podría ser un error de red o la API podría no estar disponible
    return new Response(JSON.stringify({ error: "Error al cerrar sesión en la API corporativa" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
      "Content-Type": "application/json",
    },
  });
};
