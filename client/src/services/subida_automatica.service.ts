import { API_URL } from "../utils/const";
import { adminAxios } from "../utils/adminAxios";

export type TipoSubidaAutomatica = "imagen" | "formulario";
export type EstadoSubidaAutomatica = "pendiente" | "procesando" | "publicado" | "error";

export interface SubidaAutomatica {
  id: number;
  tipo: TipoSubidaAutomatica;
  payload: Record<string, any>;
  correos_destino: string;
  programado_para: string;
  estado: EstadoSubidaAutomatica;
  fecha_creacion?: string;
  fecha_procesado?: string;
  ids_publicados?: number[];
  error_mensaje?: string;
}

export async function createSubidaAutomatica(
  formData: FormData,
): Promise<{ message: string; subida: SubidaAutomatica }> {
  const response = await adminAxios.post(`${API_URL}/subidas-automaticas`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as { message: string; subida: SubidaAutomatica };
}

export async function getSubidasAutomaticas(): Promise<SubidaAutomatica[]> {
  const response = await adminAxios.get(`${API_URL}/subidas-automaticas`);
  return response.data as SubidaAutomatica[];
}

export async function updateSubidaAutomaticaPendiente(
  id: number,
  formData: FormData,
): Promise<{ message: string; subida: SubidaAutomatica }> {
  const response = await adminAxios.put(`${API_URL}/subidas-automaticas/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data as { message: string; subida: SubidaAutomatica };
}
