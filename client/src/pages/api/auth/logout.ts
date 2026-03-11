import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import axios from "axios";

export const POST: APIRoute = async ({ request }) => {
  const loginApiUrl = process.env.LOGIN_API_URL ?? (import.meta.env.PUBLIC_LOGIN_URL as string);
  // Intentar logout en la API corporativa (best effort — nunca bloquea el borrado de cookie)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await axios.post(`${loginApiUrl}/logout`, { headers: { Cookie: cookie } });
  } catch {
    // No interrumpir: la cookie local se borra siempre
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
