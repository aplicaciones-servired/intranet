import { API_URL } from "../utils/const";
import axios from "axios";

export interface Categoria {
  id: number;
  label: string;
  value: string;
  orden: number;
  activa: boolean;
}

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
