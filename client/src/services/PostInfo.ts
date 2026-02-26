import axios from "axios";
import { API_URL } from "../utils/const";
import { useState } from "react";

interface FormData {
  categoria: string;
  titulo: string;
  descripcion: string;
}

export const usePostInfo = (
  form: FormData,
  setForm: React.Dispatch<React.SetStateAction<FormData>>,
) => {
  const [images, setImages] = useState<File[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "success" as "success" | "error" | "warning",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.categoria === "" || form.titulo === "" || form.descripcion === "" || images.length === 0) {
      setAlertConfig({
        title: "Error de validación",
        description: "Todos los campos son obligatorios y al menos una imagen debe ser seleccionada",
        type: "warning",
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    const formData = new FormData();
    formData.append("categoria", form.categoria);
    formData.append("titulo", form.titulo);
    formData.append("descripcion", form.descripcion);

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await axios.post(`${API_URL}/insertImagen`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setAlertConfig({
          title: "¡Información insertada correctamente!",
          description: response.data.message,
          type: "success",
        });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);

        setForm({
          categoria: "",
          titulo: "",
          descripcion: "",
        });

        setImages([]);
      }
    } catch (error: any) {
      setAlertConfig({
        title: "Error al insertar información",
        description: error.response?.data?.error || "Error desconocido",
        type: "error",
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return { handleSubmit, setImages, showAlert, alertConfig, setShowAlert };
};
