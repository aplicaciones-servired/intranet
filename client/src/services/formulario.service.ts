import { API_URL } from "../utils/const";
import axios from "axios";
import { adminAxios } from "../utils/adminAxios";

export interface Formulario {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  imagen: string;
  activo: boolean;
  fecha_registro?: string;
}

export interface CrearFormularioResponse {
  message: string;
  formulario: Formulario;
  formularioId: number;
}

// GETs públicos
export const getFormulariosActivos = async (): Promise<Formulario[]> => {
  const response = await axios.get(`${API_URL}/formularios/activos`);
  return response.data as Formulario[];
};

// GETs admin (requieren JWT)
export const getFormularios = async (): Promise<Formulario[]> => {
  const response = await adminAxios.get(`${API_URL}/formularios`);
  return response.data as Formulario[];
};

export const createFormulario = async (formData: FormData): Promise<CrearFormularioResponse> => {
  const response = await adminAxios.post(`${API_URL}/formularios`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log('📝 createFormulario - Respuesta completa del backend:', response.data);
  return response.data as CrearFormularioResponse;
};

export const updateFormulario = async (id: number, formData: FormData): Promise<Formulario> => {
  const response = await adminAxios.put(`${API_URL}/formularios/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.formulario as Formulario;
};

export const deleteFormulario = async (id: number): Promise<void> => {
  await adminAxios.delete(`${API_URL}/formularios/${id}`);
};

export const toggleFormularioActivo = async (id: number): Promise<Formulario> => {
  const response = await adminAxios.patch(`${API_URL}/formularios/${id}/toggle`);
  return response.data.formulario as Formulario;
};
