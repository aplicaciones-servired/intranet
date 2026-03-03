import { API_URL, API_KEY } from "../utils/const";
import axios from "axios";

// Instancia con header de autenticación para llamadas admin
const adminAxios = axios.create({
  headers: { "x-api-key": API_KEY },
});

export type EstadoCarta = "pendiente" | "aprobado" | "rechazado";

export interface CartaLaboral {
  id: number;
  nombre_completo: string;
  cedula: string;
  correo: string;
  cargo: string;
  empresa: "Multired" | "Servired";
  sueldo?: string;
  observaciones?: string;
  estado: EstadoCarta;
  fecha_solicitud?: string;
  fecha_aprobacion?: string;
}

export const getCartasLaborales = async (): Promise<CartaLaboral[]> => {
  const response = await adminAxios.get(`${API_URL}/cartas-laborales`);
  return response.data as CartaLaboral[];
};

export const createCartaLaboral = async (data: {
  nombre_completo: string;
  cedula: string;
  correo: string;
  cargo: string;
  empresa: "Multired" | "Servired";
}): Promise<CartaLaboral> => {
  // POST público: no requiere API key
  const response = await axios.post(`${API_URL}/cartas-laborales`, data);
  return response.data.carta as CartaLaboral;
};

export const aprobarCartaLaboral = async (
  id: number,
  data: { sueldo: string; observaciones?: string }
): Promise<CartaLaboral> => {
  const response = await adminAxios.patch(`${API_URL}/cartas-laborales/${id}/aprobar`, data);
  return response.data.carta as CartaLaboral;
};

export const rechazarCartaLaboral = async (
  id: number,
  data?: { observaciones?: string }
): Promise<CartaLaboral> => {
  const response = await adminAxios.patch(`${API_URL}/cartas-laborales/${id}/rechazar`, data || {});
  return response.data.carta as CartaLaboral;
};

export const deleteCartaLaboral = async (id: number): Promise<void> => {
  await adminAxios.delete(`${API_URL}/cartas-laborales/${id}`);
};
