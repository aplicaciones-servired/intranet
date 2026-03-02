import { API_URL } from "../utils/const";
import axios from "axios";

export const getConfig = async (clave: string): Promise<string | null> => {
  const response = await axios.get(`${API_URL}/config/${clave}`);
  return response.data.valor ?? null;
};

export const setConfig = async (clave: string, valor: string): Promise<void> => {
  await axios.post(`${API_URL}/config`, { clave, valor });
};
