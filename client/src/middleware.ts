import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Define las rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
]);

// Define las rutas públicas (opcional, para mayor claridad)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, redirectToSignIn } = auth();
  const { url } = context;
  
  // Si la ruta es protegida y el usuario no está autenticado
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn();
  }

  // Si el usuario está autenticado y trata de acceder a sign-in/sign-up, redirigir al home
  if (userId && (url.pathname === "/sign-in" || url.pathname === "/sign-up")) {
    return context.redirect("/");
  }
});