import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import { LOGIN_URL } from "../../../utils/const";

export const POST: APIRoute = async ({ request }) => {
  // Intentar logout en la API corporativa también (best effort)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await fetch(`${LOGIN_URL}/logout`, { headers: { Cookie: cookie } });
  } catch {
    // No interrumpir si la API corporativa no responde
  }

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const secure = proto === "https" ? "; Secure" : "";

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
      "Content-Type": "application/json",
    },
  });
};
