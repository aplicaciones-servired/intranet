import axios from "axios";
import { API_URL } from "../utils/const";

export type PrioridadNotificacion = "baja" | "media" | "alta";
export type TipoNotificacion = "imagen" | "formulario" | "mixto";

export interface NotificacionItem {
  id: number;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotificacion;
  titulo: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  url_destino: string;
  preview_image_url?: string;
  fecha_publicacion?: string;
  leida?: boolean;
  clickeada?: boolean;
}

export interface NotificacionListResponse {
  clienteId: string;
  unreadCount: number;
  total: number;
  items: NotificacionItem[];
}

export async function getNotificaciones(clienteId: string, onlyUnread = false, limit = 50): Promise<NotificacionListResponse> {
  const response = await axios.get(`${API_URL}/notificaciones`, {
    params: {
      clienteId,
      onlyUnread,
      limit,
    },
  });

  return response.data as NotificacionListResponse;
}

export async function marcarNotificacionLeida(notificacionId: number, clienteId: string): Promise<void> {
  await axios.post(`${API_URL}/notificaciones/${notificacionId}/read`, { clienteId });
}

export async function clickNotificacion(notificacionId: number, clienteId: string): Promise<void> {
  await axios.post(`${API_URL}/notificaciones/${notificacionId}/click`, { clienteId });
}

export async function recordarNotificacion(notificacionId: number, clienteId: string, minutes = 30): Promise<void> {
  await axios.post(`${API_URL}/notificaciones/${notificacionId}/remind`, { clienteId, minutes });
}

export async function registrarImpresion(notificacionId: number): Promise<void> {
  await axios.post(`${API_URL}/notificaciones/${notificacionId}/shown`);
}

export function getOrCreateClientId(): string {
  if (typeof window === "undefined") {
    return "anon";
  }

  const key = "intranet_client_id";
  const existing = window.localStorage.getItem(key);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const generated = `cli_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}
