import { API_URL } from "../utils/const";
import axios from "axios";
import { adminAxios } from "../utils/adminAxios";

// GET es público
export const getConfig = async (clave: string): Promise<string | null> => {
  const response = await axios.get(`${API_URL}/config/${clave}`);
  return response.data.valor ?? null;
};

// POST requiere autenticación
export const setConfig = async (clave: string, valor: string): Promise<void> => {
  await adminAxios.post(`${API_URL}/config`, { clave, valor });
};
