import { API_URL } from "../utils/const";
import axios from "axios";

export type EspacioTipo = "slider" | "destacada" | "grid" | "lista" | "carrusel" | "grande" | "noticias";

export interface Espacio {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: EspacioTipo;
  categoria: string;
  visible: boolean;
  orden: number;
}

export const getEspacios = async (): Promise<Espacio[]> => {
  const response = await axios.get(`${API_URL}/espacios`);
  return response.data as Espacio[];
};

export const createEspacio = async (data: Omit<Espacio, "id">): Promise<Espacio> => {
  const response = await axios.post(`${API_URL}/espacios`, data);
  return response.data as Espacio;
};

export const updateEspacio = async (id: number, data: Partial<Omit<Espacio, "id">>): Promise<Espacio> => {
  const response = await axios.put(`${API_URL}/espacios/${id}`, data);
  return response.data as Espacio;
};

export const deleteEspacio = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/espacios/${id}`);
};
