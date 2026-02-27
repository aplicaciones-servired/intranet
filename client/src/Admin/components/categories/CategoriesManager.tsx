import { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, Icon, Spinner,
  VStack, Heading, Container, ChakraProvider, defaultSystem,
} from "@chakra-ui/react";
import { LuPlus, LuTag } from "react-icons/lu";
import {
  getCategorias, createCategoria, updateCategoria,
  deleteCategoria, type Categoria,
} from "../../../services/GetInfo";
import { CategoryRow } from "./CategoryRow";
import { CategoryForm } from "./CategoryForm";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import Toast from "../Toast";

type Mode = "list" | "create" | "edit";

export function CategoriesManager() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Categoria | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch {
      setLoadError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Omit<Categoria, "id">) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateCategoria(editing.id, data);
        setCategorias((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        setToast({ title: "Categoría actualizada", description: "Los cambios se guardaron correctamente.", type: "success" });
      } else {
        const nueva = await createCategoria(data);
        setCategorias((prev) => [...prev, nueva]);
        setToast({ title: "Categoría creada", description: "La nueva categoría está disponible.", type: "success" });
      }
      setMode("list");
      setEditing(null);
    } catch {
      setToast({ title: "Error al guardar", description: "No se pudo guardar la categoría. Intenta de nuevo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteCategoria(confirmDelete.id);
      setCategorias((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      setConfirmDelete(null);
      setToast({ title: "Categoría eliminada", description: "La categoría fue eliminada correctamente.", type: "success" });
    } catch {
      setToast({ title: "Error al eliminar", description: "No se pudo eliminar la categoría. Intenta de nuevo.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActiva = async (cat: Categoria) => {
    try {
      const updated = await updateCategoria(cat.id, { activa: !cat.activa });
      setCategorias((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      setToast({ title: "Estado actualizado", description: `Categoría "${cat.label}" ${!cat.activa ? "activada" : "desactivada"}.`, type: "success" });
    } catch {
      setToast({ title: "Error al actualizar", description: "No se pudo cambiar el estado de la categoría.", type: "error" });
    }
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="3xl" px={6} py={4}>
        {/* Header */}
        <Flex justifyContent="center" alignItems="center" gap={4} mb={8} direction={{ base: "column", md: "row" }}>
          <Box bg="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)" p={3} borderRadius="xl" shadow="lg">
            <Icon fontSize="2xl" color="white"><LuTag /></Icon>
          </Box>
          <Box flex={1}>
            <Heading size="xl" color="gray.900">Categorías</Heading>
            <Text color="gray.600" fontSize="sm">Gestiona las categorías de contenido de la intranet</Text>
          </Box>
          {mode === "list" && (
            <Button
              onClick={() => { setEditing(null); setMode("create"); }}
              bg="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
              color="white" size="sm" px={5} borderRadius="xl" shadow="md"
              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
            >
              <Icon mr={2}><LuPlus /></Icon>
              Nueva categoría
            </Button>
          )}
        </Flex>

        {/* Formulario crear/editar */}
        {(mode === "create" || mode === "edit") && (
          <Box
            bg="white" border="1px solid" borderColor="purple.200"
            borderRadius="2xl" shadow="xl" p={6} mb={6}
          >
            <Flex align="center" gap={2} mb={5}>
              <Box w={1} h={6} bg="purple.500" borderRadius="full" />
              <Text fontWeight="bold" color="gray.900" fontSize="md">
                {mode === "create" ? "Nueva categoría" : `Editar: ${editing?.label}`}
              </Text>
            </Flex>
            <CategoryForm
              initial={editing ?? undefined}
              onSave={handleSave}
              onCancel={() => { setMode("list"); setEditing(null); }}
              loading={saving}
            />
          </Box>
        )}

        {/* Lista */}
        {loading ? (
          <Flex justify="center" align="center" direction="column" gap={4} py={16}>
            <Spinner size="xl" color="purple.500" borderWidth="4px" />
            <Text color="gray.400" fontSize="sm">Cargando categorías...</Text>
          </Flex>
        ) : loadError ? (
          <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={5} textAlign="center">
            <Text color="red.600" fontWeight="medium" mb={2}>⚠️ Error al cargar</Text>
            <Text color="red.500" fontSize="sm">{loadError}</Text>
            <Button mt={3} size="sm" colorPalette="red" variant="outline" onClick={load}>Reintentar</Button>
          </Box>
        ) : (
          <VStack gap={2} align="stretch">
            {categorias.length === 0 ? (
              <Box
                textAlign="center" py={16} bg="white" borderRadius="2xl"
                border="2px dashed" borderColor="gray.200"
              >
                <Text fontSize="4xl" mb={3}>🗂️</Text>
                <Text fontWeight="semibold" color="gray.500">No hay categorías creadas aún</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Crea la primera categoría para organizar el contenido
                </Text>
              </Box>
            ) : (
              <>
                <Flex px={2} mb={1}>
                  <Text fontSize="xs" color="gray.400" fontWeight="medium">
                    {categorias.length} categoría{categorias.length !== 1 ? "s" : ""}
                    {" · "}
                    {categorias.filter((c) => c.activa).length} activa{categorias.filter((c) => c.activa).length !== 1 ? "s" : ""}
                  </Text>
                </Flex>
                {categorias.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    categoria={cat}
                    onEdit={() => { setEditing(cat); setMode("edit"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    onDelete={() => setConfirmDelete(cat)}
                    onToggleActiva={() => handleToggleActiva(cat)}
                  />
                ))}
              </>
            )}
          </VStack>
        )}
      </Container>

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmDialog
          title={`¿Eliminar "${confirmDelete.label}"?`}
          description="Esta acción es irreversible. El contenido asociado a esta categoría no se eliminará."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          title={toast.title}
          description={toast.description}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ChakraProvider>
  );
}
