import { API_URL } from "../utils/const";
import { adminAxios } from "../utils/adminAxios";

export interface NotificacionTopItem {
  id: number;
  tipo: "imagen" | "formulario" | "mixto";
  prioridad: "baja" | "media" | "alta";
  titulo: string;
  categoria: string;
  cantidad: number;
  preview_image_url?: string | null;
  shown_count: number;
  opened_count: number;
  clicked_count: number;
  dismissed_count: number;
  fecha_publicacion?: string;
  url_destino: string;
}

export interface NotificacionMetricsResponse {
  total: number;
  shown: number;
  opened: number;
  clicked: number;
  dismissed: number;
  topVistas: NotificacionTopItem[];
  topClicks: NotificacionTopItem[];
}

export async function getNotificacionesMetrics(): Promise<NotificacionMetricsResponse> {
  const response = await adminAxios.get(`${API_URL}/notificaciones/metrics`);
  return response.data as NotificacionMetricsResponse;
}
