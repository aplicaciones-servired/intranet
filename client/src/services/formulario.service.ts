import { API_URL } from "../utils/const";
import axios from "axios";

export interface Formulario {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  imagen: string;
  activo: boolean;
  fecha_registro?: string;
}

export const getFormularios = async (): Promise<Formulario[]> => {
  const response = await axios.get(`${API_URL}/formularios`);
  return response.data as Formulario[];
};

export const getFormulariosActivos = async (): Promise<Formulario[]> => {
  const response = await axios.get(`${API_URL}/formularios/activos`);
  return response.data as Formulario[];
};

export const createFormulario = async (formData: FormData): Promise<Formulario> => {
  const response = await axios.post(`${API_URL}/formularios`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.formulario as Formulario;
};

export const updateFormulario = async (id: number, formData: FormData): Promise<Formulario> => {
  const response = await axios.put(`${API_URL}/formularios/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.formulario as Formulario;
};

export const deleteFormulario = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/formularios/${id}`);
};

export const toggleFormularioActivo = async (id: number): Promise<Formulario> => {
  const response = await axios.patch(`${API_URL}/formularios/${id}/toggle`);
  return response.data.formulario as Formulario;
};
