# 🔐 Middlewares y Rutas Protegidas - Intranet

## Configuración de Middleware

### Archivo: `src/middleware.ts`

El middleware de Astro está configurado para proteger automáticamente las rutas administrativas usando **Clerk Auth**.

#### ✅ Rutas Protegidas

Todas las rutas que coincidan con el patrón `/admin/*` requieren autenticación:

- `/admin` - Panel principal
- `/admin/Home` - Formulario de subida
- `/admin/Categories` - Gestión de categorías
- `/admin/Spaces` - Gestión de espacios
- `/admin/Config` - Configuración general

#### 🌐 Rutas Públicas

- `/` - Página principal (galería)
- `/sign-in` - Inicio de sesión
- `/sign-up` - Registro

#### 🔄 Redirecciones Automáticas

1. **Usuario no autenticado intenta acceder a `/admin/*`**
   - → Redirige a `/sign-in`

2. **Usuario autenticado intenta acceder a `/sign-in` o `/sign-up`**
   - → Redirige a `/`

### Implementación del Middleware

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, redirectToSignIn } = auth();
  
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn();
  }
});
```

## 🔍 Buscador Mejorado

### Características

- **Búsqueda en tiempo real** con debounce de 300ms
- **Contador visual** de resultados encontrados
- **Búsqueda por título y descripción**
- **Animaciones fluidas** al escribir y borrar
- **Indicador visual** de búsqueda activa
- **Diseño responsive** y moderno

### Uso del SearchBar

```tsx
<SearchBar 
  onSearch={setSearchQuery} 
  totalResults={imagenesFiltradas.length}
  placeholder="Buscar por título o descripción..."
/>
```

### Filtrado de Resultados

El buscador filtra automáticamente:
- ✅ Títulos de publicaciones
- ✅ Descripciones
- ✅ Todas las categorías
- ✅ Todos los espacios (Grid, Lista, Noticias, Grande, Carrusel)

## 🎨 Mejoras de UI

### SearchBar

1. **Input mejorado**
   - Bordes redondeados más grandes
   - Sombra elevada al hacer focus
   - Fondo azul claro cuando está activo
   - Placeholder que se atenúa al escribir

2. **Contador de resultados**
   - Badge azul con icono
   - Animación suave
   - Tamaño más visible

3. **Botón de limpiar**
   - Hover rojo para indicar acción destructiva
   - Icono más grande y claro
   - Tooltip informativo

4. **Indicador de búsqueda**
   - Badge con borde
   - Icono de lupa
   - Texto destacado

### Animaciones CSS

Nuevas animaciones añadidas en `global.css`:
- `fade-in` - Aparición suave
- `slide-in-from-top` - Deslizamiento desde arriba
- `pulse-gentle` - Pulso suave

## 📄 Página 404

Nueva página de error 404 personalizada:
- Diseño moderno y amigable
- Botones de navegación
- Links de ayuda
- Estilo consistente con la aplicación

## 🛡️ Seguridad

### Capas de Protección

1. **Middleware de Astro** (Primera capa)
   - Intercepta requests antes de renderizar
   - Redirecciona usuarios no autenticados

2. **Layout AdminLayouts** (Segunda capa)
   - Verificación adicional en cada página admin
   - Fail-safe por si el middleware falla

3. **Clerk Auth** (Tercera capa)
   - Gestión completa de sesiones
   - Tokens seguros
   - Refresh automático

### Buenas Prácticas

✅ Nunca confiar solo en protección del frontend  
✅ Validar autenticación en el servidor  
✅ Usar middleware para rutas protegidas  
✅ Implementar capas múltiples de seguridad  
✅ Redirigir apropiadamente según el estado del usuario  

## 🚀 Deployment

### Variables de Entorno Requeridas

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
PUBLIC_CLERK_SIGN_IN_URL=/sign-in
PUBLIC_CLERK_SIGN_UP_URL=/sign-up
PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
```

### Astro Config

```js
export default defineConfig({
  integrations: [react(), clerk({ localization: esES })],
  adapter: node({ mode: "standalone" }),
  output: "server", // ← Requerido para middleware
});
```

## 📱 Testing

### Probar Protección de Rutas

1. Abrir navegador en modo incógnito
2. Navegar a `/admin`
3. Verificar redirección a `/sign-in`
4. Iniciar sesión
5. Verificar acceso a `/admin`

### Probar Buscador

1. Ir a la página principal
2. Escribir en el buscador
3. Verificar filtrado en tiempo real
4. Verificar contador de resultados
5. Probar botón de limpiar

## 🐛 Troubleshooting

### El middleware no redirige

- Verificar `output: "server"` en `astro.config.mjs`
- Revisar que las variables de entorno estén configuradas
- Reiniciar el servidor de desarrollo

### El buscador no filtra

- Verificar que `imagenesFiltradas` esté siendo usado
- Revisar consola del navegador por errores
- Verificar que el debounce funcione (300ms)

### Estilos no se aplican

- Limpiar caché: `rm -rf node_modules/.vite`
- Recompilar Tailwind
- Verificar imports en `global.css`

---

**Última actualización**: 2 de marzo de 2026
