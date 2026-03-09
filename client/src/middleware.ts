import { sequence } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import { verifySession, SESSION_COOKIE } from "./lib/session";

// Rutas que requieren sesión activa
const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");
const isSignIn = (pathname: string) => pathname === "/sign-in";

// Solo permite redirigir a rutas internas (previene open redirect)
function safeInternalUrl(raw: string | null, fallback = "/admin/CartasLaborales"): string {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

const authHandler: MiddlewareHandler = async (context, next) => {
  const { url } = context;
  const token = context.cookies.get(SESSION_COOKIE)?.value ?? null;
  const user = token ? await verifySession(token) : null;

  // Exponer el usuario en locals para los layouts
  (context.locals as any).user = user;
  (context.locals as any).userId = user?.username ?? null;

  // Ruta protegida sin sesión → redirigir al login
  if (isAdminRoute(url.pathname) && !user) {
    const returnTo = encodeURIComponent(url.pathname);
    return context.redirect(`/sign-in?redirect_url=${returnTo}`);
  }

  // Ya autenticado intentando ir al login → redirigir al admin
  if (isSignIn(url.pathname) && user) {
    const redirectUrl = safeInternalUrl(url.searchParams.get("redirect_url"));
    return context.redirect(redirectUrl);
  }

  return next();
};

// Evita que el navegador cachee las páginas de /admin (deshabilita bfcache)
const noCacheForAdmin: MiddlewareHandler = async (context, next) => {
  const response = await next();
  if (context.url.pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
  }
  return response;
};

export const onRequest = sequence(noCacheForAdmin, authHandler);