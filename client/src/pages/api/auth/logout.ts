import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import { AUTH_API_URL } from "../../../utils/const";

export const POST: APIRoute = async ({ request }) => {
  // Intentar logout en la API corporativa también (best effort)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await fetch(`${AUTH_API_URL}/logout`, { headers: { Cookie: cookie } });
  } catch {
    // No interrumpir si la API corporativa no responde
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      "Content-Type": "application/json",
    },
  });
};
