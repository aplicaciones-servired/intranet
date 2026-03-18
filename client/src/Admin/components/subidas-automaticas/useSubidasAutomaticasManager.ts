import { useEffect, useMemo, useState } from "react";
import { getCategorias, type Categoria } from "../../../services/categoria.service";
import {
  createSubidaAutomatica,
  getSubidasAutomaticas,
  type SubidaAutomatica,
  type TipoSubidaAutomatica,
  updateSubidaAutomaticaPendiente,
} from "../../../services/subida_automatica.service";
import { normalizarPayload, toDateTimeLocalInput } from "./utils";

interface ToastState {
  title: string;
  description: string;
  type: "success" | "error" | "warning";
}

const MAX_ITEMS_POR_LISTA = 5;

function ordenarPorFechaDesc(
  items: SubidaAutomatica[],
  field: "programado_para" | "fecha_procesado" | "fecha_creacion",
): SubidaAutomatica[] {
  return [...items].sort((a, b) => {
    const aTime = new Date((a as any)[field] || 0).getTime();
    const bTime = new Date((b as any)[field] || 0).getTime();
    return bTime - aTime;
  });
}

function limitarUltimosCinco(items: SubidaAutomatica[]): SubidaAutomatica[] {
  return items.slice(0, MAX_ITEMS_POR_LISTA);
}

export function useSubidasAutomaticasManager() {
  const [tipo, setTipo] = useState<TipoSubidaAutomatica | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [programadoPara, setProgramadoPara] = useState(
    toDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
  );

  const [imgCategoria, setImgCategoria] = useState("");
  const [imgTitulo, setImgTitulo] = useState("");
  const [imgDescripcion, setImgDescripcion] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [insertResetKey, setInsertResetKey] = useState(0);

  const [formTitulo, setFormTitulo] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [subidas, setSubidas] = useState<SubidaAutomatica[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProgramadoPara, setEditProgramadoPara] = useState("");
  const [editCorreosDestino, setEditCorreosDestino] = useState("");
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editFormImage, setEditFormImage] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, listado] = await Promise.all([getCategorias(), getSubidasAutomaticas()]);
      setCategorias(cats.filter((c) => c.activa));
      setSubidas(listado);
    } catch {
      setToast({
        title: "Error",
        description: "No se pudo cargar la configuracion de subidas automaticas.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendientes = useMemo(
    () => subidas.filter((s) => s.estado === "pendiente" || s.estado === "procesando"),
    [subidas],
  );

  const fallidas = useMemo(() => subidas.filter((s) => s.estado === "error"), [subidas]);
  const procesadas = useMemo(() => subidas.filter((s) => s.estado === "publicado"), [subidas]);

  const pendientesImagen = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(pendientes.filter((s) => s.tipo === "imagen"), "programado_para")),
    [pendientes],
  );
  const pendientesFormulario = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(pendientes.filter((s) => s.tipo === "formulario"), "programado_para")),
    [pendientes],
  );
  const fallidasImagen = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(fallidas.filter((s) => s.tipo === "imagen"), "programado_para")),
    [fallidas],
  );
  const fallidasFormulario = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(fallidas.filter((s) => s.tipo === "formulario"), "programado_para")),
    [fallidas],
  );
  const procesadasImagen = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(procesadas.filter((s) => s.tipo === "imagen"), "fecha_procesado")),
    [procesadas],
  );
  const procesadasFormulario = useMemo(
    () => limitarUltimosCinco(ordenarPorFechaDesc(procesadas.filter((s) => s.tipo === "formulario"), "fecha_procesado")),
    [procesadas],
  );

  const handleFormImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setFormImage(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setToast({ title: "Archivo invalido", description: "Debes seleccionar una imagen.", type: "warning" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        title: "Archivo muy grande",
        description: "La imagen no debe superar 5MB.",
        type: "warning",
      });
      return;
    }
    setFormImage(file);
  };

  useEffect(() => {
    if (!formImage) {
      setFormImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formImage);
    setFormImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formImage]);

  const resetForm = () => {
    setTipo(null);
    setProgramadoPara(toDateTimeLocalInput(new Date(Date.now() + 60 * 60 * 1000)));
    setImgCategoria("");
    setImgTitulo("");
    setImgDescripcion("");
    setImages([]);
    setInsertResetKey((prev) => prev + 1);
    setFormTitulo("");
    setFormDescripcion("");
    setFormUrl("");
    setFormImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo) {
      setToast({
        title: "Selecciona un tipo",
        description: "Elige Imagenes o Formularios para continuar.",
        type: "warning",
      });
      return;
    }

    if (!programadoPara) {
      setToast({
        title: "Fecha requerida",
        description: "Debes indicar fecha y hora de publicacion.",
        type: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("programadoPara", programadoPara);

    if (tipo === "imagen") {
      if (!imgCategoria || !imgTitulo || images.length === 0) {
        setToast({
          title: "Campos incompletos",
          description: "Para imagenes debes indicar categoria, titulo y archivos.",
          type: "warning",
        });
        return;
      }

      formData.append("categoria", imgCategoria);
      formData.append("titulo", imgTitulo);
      formData.append("descripcion", imgDescripcion);
      for (const image of images) {
        formData.append("images", image);
      }
    } else {
      if (!formTitulo || !formUrl || !formImage) {
        setToast({
          title: "Campos incompletos",
          description: "Para formularios debes indicar titulo, URL e imagen.",
          type: "warning",
        });
        return;
      }
      formData.append("titulo", formTitulo);
      formData.append("descripcion", formDescripcion);
      formData.append("url", formUrl);
      formData.append("imagen", formImage);
    }

    setSaving(true);
    try {
      await createSubidaAutomatica(formData);
      setToast({
        title: "Programacion creada",
        description: "La subida automatica quedo programada correctamente.",
        type: "success",
      });
      resetForm();
      await loadData();
    } catch (error: any) {
      setToast({
        title: "No se pudo programar",
        description: error?.response?.data?.error || "Ocurrio un error al crear la programacion.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const iniciarEdicionPendiente = (item: SubidaAutomatica) => {
    const payload = normalizarPayload(item.payload);
    setEditingId(item.id);
    setEditProgramadoPara(toDateTimeLocalInput(new Date(item.programado_para)));
    setEditCorreosDestino(item.correos_destino || "");
    setEditTitulo(String(payload.titulo || ""));
    setEditDescripcion(String(payload.descripcion || ""));
    setEditCategoria(String(payload.categoria || ""));
    setEditUrl(String(payload.url || ""));
    setEditImages([]);
    setEditFormImage(null);
  };

  const cancelarEdicionPendiente = () => {
    setEditingId(null);
    setEditProgramadoPara("");
    setEditCorreosDestino("");
    setEditTitulo("");
    setEditDescripcion("");
    setEditCategoria("");
    setEditUrl("");
    setEditImages([]);
    setEditFormImage(null);
  };

  const guardarEdicionPendiente = async (item: SubidaAutomatica) => {
    if (!editProgramadoPara) {
      setToast({
        title: "Fecha requerida",
        description: "Debes indicar fecha y hora de publicacion.",
        type: "warning",
      });
      return;
    }

    if (!editCorreosDestino.trim()) {
      setToast({
        title: "Correos requeridos",
        description: "Debes indicar al menos un correo destino.",
        type: "warning",
      });
      return;
    }

    if (!editTitulo.trim()) {
      setToast({
        title: "Titulo requerido",
        description: "Debes indicar un titulo.",
        type: "warning",
      });
      return;
    }

    if (item.tipo === "imagen" && !editCategoria.trim()) {
      setToast({
        title: "Categoria requerida",
        description: "Debes indicar la categoria para imagenes.",
        type: "warning",
      });
      return;
    }

    if (item.tipo === "formulario" && !editUrl.trim()) {
      setToast({
        title: "URL requerida",
        description: "Debes indicar la URL del formulario.",
        type: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("programadoPara", editProgramadoPara);
    formData.append("correosDestino", editCorreosDestino);
    formData.append("titulo", editTitulo);
    formData.append("descripcion", editDescripcion);

    if (item.tipo === "imagen") {
      formData.append("categoria", editCategoria);
      for (const image of editImages) {
        formData.append("images", image);
      }
    } else {
      formData.append("url", editUrl);
      if (editFormImage) {
        formData.append("imagen", editFormImage);
      }
    }

    setSavingEdit(true);
    try {
      await updateSubidaAutomaticaPendiente(item.id, formData);
      setToast({
        title: "Pendiente actualizado",
        description: "Se guardaron los cambios correctamente.",
        type: "success",
      });
      cancelarEdicionPendiente();
      await loadData();
    } catch (error: any) {
      const detalleError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo actualizar la programacion pendiente.";

      setToast({
        title: "No se pudo editar",
        description: detalleError,
        type: "error",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  return {
    tipo,
    setTipo,
    categorias,
    programadoPara,
    setProgramadoPara,
    imgCategoria,
    setImgCategoria,
    imgTitulo,
    setImgTitulo,
    imgDescripcion,
    setImgDescripcion,
    images,
    setImages,
    insertResetKey,
    formTitulo,
    setFormTitulo,
    formDescripcion,
    setFormDescripcion,
    formUrl,
    setFormUrl,
    formImage,
    setFormImage,
    formImagePreview,
    loading,
    saving,
    savingEdit,
    editingId,
    editProgramadoPara,
    setEditProgramadoPara,
    editCorreosDestino,
    setEditCorreosDestino,
    editTitulo,
    setEditTitulo,
    editDescripcion,
    setEditDescripcion,
    editCategoria,
    setEditCategoria,
    editUrl,
    setEditUrl,
    editImages,
    setEditImages,
    editFormImage,
    setEditFormImage,
    toast,
    setToast,
    loadData,
    handleFormImageChange,
    handleSubmit,
    iniciarEdicionPendiente,
    cancelarEdicionPendiente,
    guardarEdicionPendiente,
    pendientes,
    fallidas,
    procesadas,
    pendientesImagen,
    pendientesFormulario,
    fallidasImagen,
    fallidasFormulario,
    procesadasImagen,
    procesadasFormulario,
  };
}
