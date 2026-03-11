import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "../../../lib/session";
import axios from "axios";



export const POST: APIRoute = async ({ request }) => {
  const loginApiUrl = process.env.LOGIN_API_URL ?? (import.meta.env.PUBLIC_LOGIN_URL as string);
  // Intentar logout en la API corporativa también (best effort)
  try {
    const cookie = request.headers.get("cookie") ?? "";
    await axios.post(`${loginApiUrl}/logout`, { headers: { Cookie: cookie } });
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
