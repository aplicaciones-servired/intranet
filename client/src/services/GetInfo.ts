import { useState } from "react";
import { API_URL } from "../utils/const";
import { set } from "astro:schema";
import axios from "axios";


export const getInfo = async () => {
  const [data, setData] = useState<any[]>([]);

  try {
    const response = await axios.get(`${API_URL}/getImagenes`);
    if (response.status !== 200) {
      throw new Error("Error al obtener la información");
    }
    setData(response.data.datos);
  } catch (error) {
    console.error("Error al obtener la información:", error);
    throw error;
  }

  return data;
};
