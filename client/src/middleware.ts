import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Define las rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
]);

// Define las rutas públicas (opcional, para mayor claridad)
const isPublicRoute = createRouteMatcher([
  "/",
  "/formularios(.*)",
  "/carta-laboral(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, redirectToSignIn } = auth();
  const { url } = context;

  // Si la ruta es protegida y el usuario no está autenticado
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn({ returnBackUrl: url.pathname });
  }

  // Si el usuario está autenticado y trata de acceder a sign-in, redirigir al redirect_url o al admin
  if (userId && url.pathname === "/sign-in") {
    const redirectUrl = url.searchParams.get("redirect_url") ?? "/admin/Home";
    return context.redirect(redirectUrl);
  }
});