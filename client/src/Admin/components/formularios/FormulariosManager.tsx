import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  Icon,
  Text,
  Flex,
  ChakraProvider,
  defaultSystem,
} from "@chakra-ui/react";
import { LuPlus, LuFileText, LuEyeOff } from "react-icons/lu";
import Toast from "../Toast";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import {
  getFormularios,
  createFormulario,
  updateFormulario,
  deleteFormulario,
  toggleFormularioActivo,
  type Formulario,
} from "../../../services/GetInfo.service";
import { API_URL } from "../../../utils/const";
import { FormularioForm } from "./FormularioForm";
import { FormularioCard } from "./FormularioCard";

export default function FormulariosManager() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    type: "success" as "success" | "error" | "warning",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    url: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const formData = await getFormularios();
      setFormularios(formData);
      setLoading(false);
    } catch (error) {
      showToast("Error", "No se pudieron cargar los datos", "error");
      setLoading(false);
    }
  };

  const showToast = (title: string, description: string, type: "success" | "error" | "warning") => {
    setAlertConfig({ title, description, type });
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Error", "Solo se permiten imágenes", "warning");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Error", "La imagen no debe superar 5MB", "warning");
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
      showToast("Error", "Título y URL son obligatorios", "warning");
      return;
    }

    if (!editingId && !selectedImage) {
      showToast("Error", "La imagen es obligatoria", "warning");
      return;
    }

    // Validar URL
    try {
      new URL(form.url);
    } catch {
      showToast("Error", "La URL no es válida", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("descripcion", form.descripcion);
      formData.append("url", form.url);
      if (selectedImage) {
        formData.append("imagen", selectedImage);
      }

      if (editingId) {
        await updateFormulario(editingId, formData);
        showToast("Éxito", "Formulario actualizado correctamente", "success");
      } else {
        await createFormulario(formData);
        showToast("Éxito", "Formulario creado correctamente", "success");
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      showToast("Error", error.response?.data?.error || "Error al guardar", "error");
    }
  };

  const handleEdit = (formulario: Formulario) => {
    setForm({
      titulo: formulario.titulo,
      descripcion: formulario.descripcion || "",
      url: formulario.url,
    });
    setImagePreview(`${API_URL}/${formulario.imagen}`);
    setEditingId(formulario.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      show: true,
      title: "Eliminar formulario",
      description: "¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          await deleteFormulario(id);
          showToast("Éxito", "Formulario eliminado correctamente", "success");
          await loadData();
        } catch (error) {
          showToast("Error", "No se pudo eliminar el formulario", "error");
        }
        setConfirmDialog({ ...confirmDialog, show: false });
      },
    });
  };

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleFormularioActivo(id);
      showToast("Éxito", "Estado actualizado correctamente", "success");
      await loadData();
    } catch (error) {
      showToast("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const resetForm = () => {
    setForm({ titulo: "", descripcion: "", url: "" });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Flex justify="center" align="center" h="400px">
          <Text fontSize="lg" color="gray.600">Cargando formularios...</Text>
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={defaultSystem}>
      <Box>
        {showAlert && (
          <Toast
            title={alertConfig.title}
            description={alertConfig.description}
            type={alertConfig.type}
            onClose={() => setShowAlert(false)}
          />
        )}

        {confirmDialog.show && (
          <ConfirmDialog
            title={confirmDialog.title}
            description={confirmDialog.description}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
          />
        )}

        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Heading size="xl" color="gray.900">Formularios y Encuestas</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Gestiona los enlaces a Google Forms que verán los usuarios
            </Text>
          </Box>
          <Button
            onClick={() => setShowForm(!showForm)}
            bg={showForm ? "red.500" : "blue.500"}
            color="white"
            _hover={{ bg: showForm ? "red.600" : "blue.600" }}
            size="md"
          >
            <Icon fontSize="lg" mr={2}>{showForm ? <LuEyeOff /> : <LuPlus />}</Icon>
            {showForm ? "Cancelar" : "Nuevo Formulario"}
          </Button>
        </Flex>

        {/* Formulario de creación/edición */}
        {showForm && (
          <FormularioForm
            form={form}
            editingId={editingId}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            onFormChange={handleFormChange}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        {/* Lista de formularios */}
        <Box>
          {formularios.length === 0 ? (
            <Box
              bg="white"
              borderRadius="xl"
              p={8}
              textAlign="center"
              border="2px dashed"
              borderColor="gray.300"
            >
              <Icon fontSize="4xl" color="gray.400" mb={3}><LuFileText /></Icon>
              <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={2}>
                No hay formularios
              </Text>
              <Text color="gray.500" fontSize="sm">
                Crea tu primer formulario haciendo clic en "Nuevo Formulario"
              </Text>
            </Box>
          ) : (
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              {formularios.map((formulario) => (
                <FormularioCard
                  key={formulario.id}
                  formulario={formulario}
                  apiUrl={API_URL}
                  onToggle={handleToggleActivo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </ChakraProvider>
  );
}
