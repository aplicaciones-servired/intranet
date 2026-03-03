import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Define las rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
]);

// Solo permite redirigir a rutas internas (previene open redirect)
function safeInternalUrl(raw: string | null, fallback = "/admin/Home"): string {
  if (!raw) return fallback;
  // Debe empezar con / y NO con // (que sería //evil.com)
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, redirectToSignIn } = auth();
  const { url } = context;

  // Si la ruta es protegida y el usuario no está autenticado
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn({ returnBackUrl: url.pathname });
  }

  // Si el usuario está autenticado y trata de acceder a sign-in, redirigir al redirect_url o al admin
  // IMPORTANTE: no redirigir si hay __clerk_handshake, ese es el proceso interno de verificación de Clerk
  if (userId && url.pathname === "/sign-in" && !url.searchParams.has("__clerk_handshake")) {
    const redirectUrl = safeInternalUrl(url.searchParams.get("redirect_url"));
    return context.redirect(redirectUrl);
  }
});