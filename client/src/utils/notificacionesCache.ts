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
    console.log('📥 obtenerNotificacionesPendientes: No estamos en el navegador (SSR)');
    return { imagenesIds: [], formularioIds: [] };
  }

  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    console.log('📥 obtenerNotificacionesPendientes: Raw data from storage:', data);
    
    if (!data) {
      console.log('📥 obtenerNotificacionesPendientes: No hay datos en storage, retornando vacío');
      return { imagenesIds: [], formularioIds: [] };
    }
    
    const parsed = JSON.parse(data);
    console.log('📥 obtenerNotificacionesPendientes: Datos parseados:', parsed);
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
  console.log('💾 agregarImagenesPendientes: Recibidos nuevos IDs:', nuevosIds);
  
  if (!isBrowser()) {
    console.log('💾 agregarImagenesPendientes: No estamos en el navegador, abortando');
    return;
  }
  
  const pendientes = obtenerNotificacionesPendientes();
  console.log('💾 agregarImagenesPendientes: Pendientes actuales:', pendientes);
  
  // Evitar duplicados
  const idsUnicos = [...new Set([...pendientes.imagenesIds, ...nuevosIds])];
  console.log('💾 agregarImagenesPendientes: IDs únicos después de merge:', idsUnicos);
  
  const actualizados = {
    ...pendientes,
    imagenesIds: idsUnicos,
  };
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  console.log('💾 agregarImagenesPendientes: Guardado en sessionStorage:', actualizados);
  
  // Verificar que se guardó correctamente
  const verificacion = sessionStorage.getItem(STORAGE_KEY);
  console.log('💾 agregarImagenesPendientes: Verificación - Lo que hay en storage:', verificacion);
}

/**
 * Agrega nuevos IDs de formularios a las notificaciones pendientes
 */
export function agregarFormulariosPendientes(nuevosIds: number[]): void {
  console.log('💾 agregarFormulariosPendientes: Recibidos nuevos IDs:', nuevosIds);
  
  if (!isBrowser()) {
    console.log('💾 agregarFormulariosPendientes: No estamos en el navegador, abortando');
    return;
  }
  
  const pendientes = obtenerNotificacionesPendientes();
  console.log('💾 agregarFormulariosPendientes: Pendientes actuales:', pendientes);
  
  // Evitar duplicados
  const idsUnicos = [...new Set([...pendientes.formularioIds, ...nuevosIds])];
  console.log('💾 agregarFormulariosPendientes: IDs únicos después de merge:', idsUnicos);
  
  const actualizados = {
    ...pendientes,
    formularioIds: idsUnicos,
  };
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  console.log('💾 agregarFormulariosPendientes: Guardado en sessionStorage:', actualizados);
  
  // Verificar que se guardó correctamente
  const verificacion = sessionStorage.getItem(STORAGE_KEY);
  console.log('💾 agregarFormulariosPendientes: Verificación - Lo que hay en storage:', verificacion);
}

/**
 * Limpia todas las notificaciones pendientes
 */
export function limpiarNotificacionesPendientes(): void {
  if (!isBrowser()) return;
  
  sessionStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Notificaciones pendientes limpiadas');
}

/**
 * Obtiene el total de items pendientes
 */
export function obtenerTotalPendientes(): number {
  const pendientes = obtenerNotificacionesPendientes();
  return pendientes.imagenesIds.length + pendientes.formularioIds.length;
}
