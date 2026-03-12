import { API_URL } from "../utils/const";
import axios from "axios";
import { adminAxios } from "../utils/adminAxios";

export interface Imagen {
  id: number;
  poster: string;
  categoria: string;
  titulo: string;
  descripcion?: string;
  fecha_registro?: string;
}

export const getImagenes = async (): Promise<Imagen[]> => {
  const response = await axios.get(`${API_URL}/getImagenes`);
  return response.data.datos as Imagen[];
};

/**
 * Servicio para notificar sobre nueva información subida a la intranet
 * @param imagenesIds Array de IDs de las imágenes a notificar
 * @param formularioIds Array de IDs de los formularios a notificar
 * @param urlIntranet URL de la intranet (opcional, se usará una por defecto)
 * @returns Promise con la respuesta del servidor
 */
export async function notificarSubida(
  imagenesIds?: number[],
  formularioIds?: number[],
  urlIntranet?: string
): Promise<{ message: string; totalNotificados: number }> {
  try {
    const response = await adminAxios.post(`${API_URL}/notificar-subida`, {
      imagenesIds: imagenesIds || [],
      formularioIds: formularioIds || [],
      urlIntranet: urlIntranet || window.location.origin,
    });

    return response.data;
  } catch (error: any) {
    console.error("Error en notificarSubida:", error);
    throw new Error(
      error.response?.data?.error || "Error al enviar la notificación"
    );
  }
}
