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

export interface Categoria {
  id: number;
  label: string;
  value: string;
  orden: number;
  activa: boolean;
}

export type EspacioTipo = "slider" | "destacada" | "grid" | "lista";

export interface Espacio {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: EspacioTipo;
  categoria: string;
  visible: boolean;
  orden: number;
}

/* ── Imágenes ── */
export const getImagenes = async (): Promise<Imagen[]> => {
  const response = await axios.get(`${API_URL}/getImagenes`);
  return response.data.datos as Imagen[];
};

/* ── Config ── */
export const getConfig = async (clave: string): Promise<string | null> => {
  const response = await axios.get(`${API_URL}/config/${clave}`);
  return response.data.valor ?? null;
};

export const setConfig = async (clave: string, valor: string): Promise<void> => {
  await axios.post(`${API_URL}/config`, { clave, valor });
};

/* ── Categorías ── */
export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await axios.get(`${API_URL}/categorias`);
  return response.data as Categoria[];
};

export const createCategoria = async (data: Omit<Categoria, "id">): Promise<Categoria> => {
  const response = await axios.post(`${API_URL}/categorias`, data);
  return response.data as Categoria;
};

export const updateCategoria = async (id: number, data: Partial<Omit<Categoria, "id">>): Promise<Categoria> => {
  const response = await axios.put(`${API_URL}/categorias/${id}`, data);
  return response.data as Categoria;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};

/* ── Espacios ── */
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

