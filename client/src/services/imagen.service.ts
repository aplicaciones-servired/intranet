import { API_URL } from "../utils/const";
import axios from "axios";

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
