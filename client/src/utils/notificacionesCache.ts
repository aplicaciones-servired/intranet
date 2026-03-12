/**
 * Utilidad para manejar la caché de notificaciones pendientes
 * Usa sessionStorage para persistir entre navegaciones
 */

const STORAGE_KEY = 'intranet_notificaciones_pendientes';

export interface NotificacionesPendientes {
  imagenesIds: number[];
  formularioIds: number[];
}

/**
 * Verifica si estamos en el navegador (cliente)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

/**
 * Obtiene los IDs pendientes de notificación desde sessionStorage
 */
export function obtenerNotificacionesPendientes(): NotificacionesPendientes {
  // Si estamos en el servidor (SSR), retornar vacío
  if (!isBrowser()) {
    return { imagenesIds: [], formularioIds: [] };
  }

  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return { imagenesIds: [], formularioIds: [] };
    }
    
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('❌ Error al leer notificaciones pendientes:', error);
    return { imagenesIds: [], formularioIds: [] };
  }
}

/**
 * Agrega nuevos IDs de imágenes a las notificaciones pendientes
 */
export function agregarImagenesPendientes(nuevosIds: number[]): void {
  if (!isBrowser()) return;
  
  const pendientes = obtenerNotificacionesPendientes();
  
  // Evitar duplicados
  const idsUnicos = [...new Set([...pendientes.imagenesIds, ...nuevosIds])];
  
  const actualizados = {
    ...pendientes,
    imagenesIds: idsUnicos,
  };
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
}

/**
 * Agrega nuevos IDs de formularios a las notificaciones pendientes
 */
export function agregarFormulariosPendientes(nuevosIds: number[]): void {
  if (!isBrowser()) return;
  
  const pendientes = obtenerNotificacionesPendientes();
  
  // Evitar duplicados
  const idsUnicos = [...new Set([...pendientes.formularioIds, ...nuevosIds])];
  
  const actualizados = {
    ...pendientes,
    formularioIds: idsUnicos,
  };
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
}

/**
 * Limpia todas las notificaciones pendientes
 */
export function limpiarNotificacionesPendientes(): void {
  if (!isBrowser()) return;
  
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Obtiene el total de items pendientes
 */
export function obtenerTotalPendientes(): number {
  const pendientes = obtenerNotificacionesPendientes();
  return pendientes.imagenesIds.length + pendientes.formularioIds.length;
}
