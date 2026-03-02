import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Icon,
  Text,
  Flex,
  Container,
  Spinner,
  ChakraProvider,
  defaultSystem,
} from "@chakra-ui/react";
import { LuPlus, LuFileText } from "react-icons/lu";
import Toast from "../Toast";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import {
  getFormularios,
  createFormulario,
  updateFormulario,
  deleteFormulario,
  type Formulario,
} from "../../../services/GetInfo.service";
import { FormularioForm } from "./FormularioForm";
import { FormularioCard } from "./FormularioCard";

type Mode = "list" | "create" | "edit";

export default function FormulariosManager() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Formulario | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Formulario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" } | null>(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getFormularios();
      setFormularios(data);
    } catch {
      setLoadError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ title: "Error", description: "Solo se permiten imágenes", type: "warning" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast({ title: "Error", description: "La imagen no debe superar 5MB", type: "warning" });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo || !form.url) {
      setToast({ title: "Error", description: "Título y URL son obligatorios", type: "warning" });
      return;
    }

    if (!editing && !selectedImage) {
      setToast({ title: "Error", description: "La imagen es obligatoria", type: "warning" });
      return;
    }

    // Validar URL
    try {
      new URL(form.url);
    } catch {
      setToast({ title: "Error", description: "La URL no es válida", type: "warning" });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("descripcion", form.descripcion);
      formData.append("url", form.url);
      if (selectedImage) {
        formData.append("imagen", selectedImage);
      }

      if (editing) {
        await updateFormulario(editing.id, formData);
        setToast({ title: "Formulario actualizado", description: "Los cambios se guardaron correctamente.", type: "success" });
      } else {
        await createFormulario(formData);
        setToast({ title: "Formulario creado", description: "El nuevo formulario está disponible.", type: "success" });
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      setToast({ title: "Error al guardar", description: error.response?.data?.error || "No se pudo guardar el formulario.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (formulario: Formulario) => {
    setForm({
      titulo: formulario.titulo,
      descripcion: formulario.descripcion || "",
      url: formulario.url,
    });
    setImagePreview(formulario.imagen);
    setEditing(formulario);
    setMode("edit");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteFormulario(confirmDelete.id);
      await loadData();
      setConfirmDelete(null);
      setToast({ title: "Formulario eliminado", description: "El formulario fue eliminado correctamente.", type: "success" });
    } catch {
      setToast({ title: "Error al eliminar", description: "No se pudo eliminar el formulario.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActivo = async (id: number) => {
    try {
      const formulario = formularios.find(f => f.id === id);
      if (!formulario) return;
      
      // Usar updateFormulario igual que CategoriesManager
      const formData = new FormData();
      formData.append("titulo", formulario.titulo);
      formData.append("descripcion", formulario.descripcion || "");
      formData.append("url", formulario.url);
      formData.append("activo", (!formulario.activo).toString());
      
      const updated = await updateFormulario(id, formData);
      setFormularios((prev) => prev.map((f) => (f.id === id ? updated : f)));
      
      setToast({ 
        title: "Estado actualizado", 
        description: `Formulario "${formulario.titulo}" ${!formulario.activo ? "activado" : "desactivado"}.`, 
        type: "success" 
      });
    } catch (error: any) {
      setToast({ 
        title: "Error al actualizar", 
        description: "No se pudo cambiar el estado del formulario.", 
        type: "error" 
      });
    }
  };

  const resetForm = () => {
    setForm({ titulo: "", descripcion: "", url: "" });
    setSelectedImage(null);
    setImagePreview(null);
    setEditing(null);
    setMode("list");
  };

  if (loading) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="5xl" px={6} py={4}>
          <Flex justify="center" align="center" h="400px" direction="column" gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text fontSize="md" color="gray.600">Cargando formularios...</Text>
          </Flex>
        </Container>
      </ChakraProvider>
    );
  }

  if (loadError) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="5xl" px={6} py={4}>
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="xl"
            p={6}
            textAlign="center"
          >
            <Icon fontSize="3xl" color="red.500" mb={3}><LuFileText /></Icon>
            <Text fontSize="lg" fontWeight="bold" color="red.700" mb={2}>
              Error de conexión
            </Text>
            <Text color="red.600" fontSize="sm" mb={4}>
              {loadError}
            </Text>
            <Button onClick={loadData} colorScheme="red" size="sm">
              Reintentar
            </Button>
          </Box>
        </Container>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="5xl" px={6} py={4}>
        {toast && (
          <Toast
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {confirmDelete && (
          <ConfirmDialog
            title="Eliminar formulario"
            description={`¿Estás seguro de que deseas eliminar "${confirmDelete.titulo}"? Esta acción no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        )}

        {/* Header */}
        <Flex justifyContent="center" alignItems="center" gap={4} mb={8} direction={{ base: "column", md: "row" }}>
          <Box textAlign={{ base: "center", md: "left" }} flex={1}>
            <Flex align="center" gap={3} justify={{ base: "center", md: "flex-start" }} mb={2}>
              <Box
                bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
                p={2.5}
                borderRadius="lg"
                display="inline-flex"
              >
                <Icon fontSize="xl" color="white"><LuFileText /></Icon>
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                Formularios y Encuestas
              </Text>
            </Flex>
            <Text color="gray.600" fontSize="sm">
              Gestiona los enlaces a Google Forms que verán los usuarios
            </Text>
          </Box>
          <Button
            onClick={() => mode === "list" ? setMode("create") : resetForm()}
            size="sm"
            borderRadius="lg"
            bg={mode === "list" ? "linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" : "gray.500"}
            color="white"
            shadow="md"
            _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
          >
            <Icon mr={2}><LuPlus /></Icon>
            {mode === "list" ? "Nuevo Formulario" : "Cancelar"}
          </Button>
        </Flex>

        {/* Formulario de creación/edición */}
        {(mode === "create" || mode === "edit") && (
          <FormularioForm
            form={form}
            editingId={editing?.id || null}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            onFormChange={handleFormChange}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {/* Lista de formularios */}
        {mode === "list" && (
          <Box>
            {formularios.length === 0 ? (
              <Box
                bg="white"
                borderRadius="xl"
                p={12}
                textAlign="center"
                border="2px dashed"
                borderColor="gray.300"
              >
                <Icon fontSize="5xl" color="gray.400" mb={4}><LuFileText /></Icon>
                <Text fontSize="xl" fontWeight="bold" color="gray.700" mb={2}>
                  No hay formularios
                </Text>
                <Text color="gray.500" fontSize="sm" mb={4}>
                  Crea tu primer formulario haciendo clic en "Nuevo Formulario"
                </Text>
                <Button
                  onClick={() => setMode("create")}
                  size="sm"
                  bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
                  color="white"
                  borderRadius="lg"
                >
                  <Icon mr={2}><LuPlus /></Icon>
                  Crear primer formulario
                </Button>
              </Box>
            ) : (
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {formularios.map((formulario) => (
                  <FormularioCard
                    key={formulario.id}
                    formulario={formulario}
                    onToggle={handleToggleActivo}
                    onEdit={handleEdit}
                    onDelete={(id) => {
                      const form = formularios.find(f => f.id === id);
                      if (form) setConfirmDelete(form);
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </ChakraProvider>
  );
}
