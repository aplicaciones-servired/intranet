import { useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, Icon, VStack, Spinner, Badge, Container,
} from "@chakra-ui/react";
import { LuPlus, LuLayoutDashboard } from "react-icons/lu";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import Toast from "../Toast";

import {
  getEspacios, createEspacio, updateEspacio, deleteEspacio,
  getCategorias,
  type Espacio, type Categoria,
} from "../../../services/GetInfo";
import { SpaceForm } from "./SpaceForm";
import { SpaceCard } from "./SpaceCard";
import { ConfirmDialog } from "../shared/ConfirmDialog";

type Mode = "list" | "create" | "edit";

function SpacesManagerInner() {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Espacio | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Espacio | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchAll = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [esp, cats] = await Promise.all([getEspacios(), getCategorias()]);
      setEspacios(esp);
      setCategorias(cats);
    } catch {
      setLoadError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (data: Omit<Espacio, "id">) => {
    setSaving(true);
    try {
      await createEspacio(data);
      await fetchAll();
      setMode("list");
      setToast({ title: "Espacio creado", description: `"${data.nombre}" está disponible en la intranet.`, type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ title: "Error al crear", description: "No se pudo crear el espacio. Verifica los datos e intenta de nuevo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: Omit<Espacio, "id">) => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await updateEspacio(editing.id, data);
      await fetchAll();
      setMode("list");
      setEditing(null);
      setToast({ title: "Espacio actualizado", description: "Los cambios se guardaron correctamente.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ title: "Error al actualizar", description: "No se pudo actualizar el espacio. Intenta de nuevo.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete?.id) return;
    setDeleting(true);
    try {
      await deleteEspacio(confirmDelete.id);
      await fetchAll();
      setConfirmDelete(null);
      setToast({ title: "Espacio eliminado", description: "El espacio fue eliminado correctamente.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ title: "Error al eliminar", description: "No se pudo eliminar el espacio. Intenta de nuevo.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleVisible = async (espacio: Espacio) => {
    try {
      await updateEspacio(espacio.id!, { ...espacio, visible: !espacio.visible });
      await fetchAll();
      setToast({ title: "Visibilidad actualizada", description: `"${espacio.nombre}" ahora está ${!espacio.visible ? "visible" : "oculto"}.`, type: "success" });
    } catch {
      setToast({ title: "Error al actualizar", description: "No se pudo cambiar la visibilidad del espacio.", type: "error" });
    }
  };

  const handleEdit = (espacio: Espacio) => {
    setEditing(espacio);
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("list");
    setEditing(null);
  };

  return (
    <Container maxW="3xl" px={6} py={4}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center" gap={3}>
          <Box
            w="40px" h="40px" borderRadius="xl"
            bg="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
            display="flex" alignItems="center" justifyContent="center"
            shadow="md"
          >
            <Icon color="white" fontSize="18px"><LuLayoutDashboard /></Icon>
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="lg" color="gray.900">Espacios de la intranet</Text>
            <Text fontSize="xs" color="gray.500">
              Define qué secciones se muestran y cómo se presentan
            </Text>
          </Box>
        </Flex>
        {mode === "list" && (
          <Button
            size="sm" borderRadius="lg"
            bg="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
            color="white" shadow="md"
            onClick={() => setMode("create")}
            _hover={{ transform: "translateY(-1px)" }}
          >
            <Icon mr={1}><LuPlus /></Icon> Nuevo espacio
          </Button>
        )}
      </Flex>

      {/* Form panel */}
      {(mode === "create" || mode === "edit") && (
        <Box
          bg="white" borderRadius="2xl" shadow="md"
          border="1px solid" borderColor="purple.200" p={5} mb={5}
        >
          <Flex align="center" gap={2} mb={4}>
            <Badge colorPalette="purple" variant="subtle" px={2} py={0.5} borderRadius="full">
              {mode === "create" ? "Nuevo espacio" : `Editando: ${editing?.nombre}`}
            </Badge>
          </Flex>
          <SpaceForm
            initial={editing ?? undefined}
            categorias={categorias}
            onSave={mode === "create" ? handleCreate : handleUpdate}
            onCancel={handleCancel}
            loading={saving}
          />
        </Box>
      )}

      {/* List */}
      {loading ? (
        <Flex justify="center" align="center" h="120px">
          <Spinner color="purple.500" />
          <Text ml={3} color="gray.500">Cargando espacios…</Text>
        </Flex>
      ) : loadError ? (
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={5} textAlign="center">
          <Text color="red.600" fontWeight="medium" mb={2}>⚠️ Error al cargar</Text>
          <Text color="red.500" fontSize="sm">{loadError}</Text>
          <Button mt={3} size="sm" colorPalette="red" variant="outline" onClick={fetchAll}>Reintentar</Button>
        </Box>
      ) : espacios.length === 0 ? (
        <Box
          bg="purple.50" borderRadius="2xl" p={8} textAlign="center"
          border="1px dashed" borderColor="purple.300"
        >
          <Text fontSize="3xl" mb={2}>🗂️</Text>
          <Text fontWeight="semibold" color="purple.700" mb={1}>No hay espacios configurados</Text>
          <Text fontSize="sm" color="purple.500">
            Crea tu primer espacio para definir cómo se muestra el contenido en la intranet.
          </Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {espacios.map((esp) => (
            <SpaceCard
              key={esp.id}
              espacio={esp}
              categorias={categorias}
              onEdit={handleEdit}
              onDelete={setConfirmDelete}
              onToggleVisible={handleToggleVisible}
            />
          ))}
        </VStack>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar espacio"
          description={`¿Eliminar el espacio "${confirmDelete.nombre}"? Esta acción es irreversible.`}
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
    </Container>
  );
}

export function SpacesManager() {
  return (
    <ChakraProvider value={defaultSystem}>
      <SpacesManagerInner />
    </ChakraProvider>
  );
}
