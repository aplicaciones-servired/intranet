import { API_URL } from "../utils/const";
import axios from "axios";
import { adminAxios } from "../utils/adminAxios";

export type EstadoCarta = "pendiente" | "aprobado" | "rechazado";

export interface CartaLaboral {
  id: number;
  nombre_completo: string;
  cedula: string;
  correo: string;
  cargo: string;
  empresa: "Multired" | "Servired";
  sueldo?: string;
  contrato?: string;
  observaciones?: string;
  estado: EstadoCarta;
  fecha_solicitud?: string;
  fecha_aprobacion?: string;
  fecha_ingreso?: string;
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

export interface ResultadoAprobarCarta {
  carta: CartaLaboral;
  emailEnviado: boolean;
  message?: string;
}

export const aprobarCartaLaboral = async (
  id: number,
  data: { sueldo: string; observaciones?: string; fecha_ingreso: string, contrato: string }
): Promise<ResultadoAprobarCarta> => {
  const response = await adminAxios.patch(`${API_URL}/cartas-laborales/${id}/aprobar`, data);
  return response.data as ResultadoAprobarCarta;
};

export const getVistaPreviaCartaLaboral = async (
  id: number,
  data: { sueldo: string; fecha_ingreso: string, contrato: string }
): Promise<Blob> => {
  const response = await adminAxios.post(
    `${API_URL}/cartas-laborales/${id}/vista-previa`,
    data,
    { responseType: "blob" }
  );
  return response.data as Blob;
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
