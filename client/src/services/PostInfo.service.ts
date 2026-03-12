import { API_URL } from "../utils/const";
import { adminAxios } from "../utils/adminAxios";
import { useState, useEffect } from "react";
import { 
  obtenerNotificacionesPendientes, 
  agregarImagenesPendientes 
} from "../utils/notificacionesCache";

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
  const [resetKey, setResetKey] = useState(0);
  
  // Inicializar vacío en el servidor, cargar desde storage solo en el cliente
  const [imagenesIdsSubidas, setImagenesIdsSubidas] = useState<number[]>([]);
  
  // Cargar desde sessionStorage después del mount (solo en cliente)
  useEffect(() => {
    const pendientes = obtenerNotificacionesPendientes();
    if (pendientes.imagenesIds.length > 0) {
      setImagenesIdsSubidas(pendientes.imagenesIds);
    }
  }, []);
  
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "success" as "success" | "error" | "warning",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.categoria === "" || form.titulo === "" || images.length === 0) {
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
      const response = await adminAxios.post(`${API_URL}/insertImagen`, formData, {
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

        // Guardar los IDs de las imágenes subidas para notificación posterior
        if (response.data.imagenesIds && Array.isArray(response.data.imagenesIds)) {
          // Guardar en sessionStorage
          agregarImagenesPendientes(response.data.imagenesIds);
          
          // Actualizar estado local
          setImagenesIdsSubidas(prev => [...prev, ...response.data.imagenesIds]);
        }

        setForm({
          categoria: "",
          titulo: "",
          descripcion: "",
        });

        setImages([]);
        setResetKey((prev) => prev + 1);
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

  return { 
    handleSubmit, 
    setImages, 
    showAlert, 
    alertConfig, 
    setShowAlert, 
    resetKey,
    imagenesIdsSubidas,
    limpiarImagenesSubidas: () => {
      setImagenesIdsSubidas([]);
    },
  };
};
