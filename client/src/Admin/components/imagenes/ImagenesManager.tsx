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
import { LuImage } from "react-icons/lu";
import Toast from "../Toast";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { getImagenes, deleteImagen, type Imagen } from "../../../services/imagen.service";
import { FiltrosImagenes } from "./FiltrosImagenes";
import { CategoriaSection } from "./CategoriaSection";
import { BotonEliminarFlotante } from "./BotonEliminarFlotante";

export default function ImagenesManager() {
  // Estados
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Imagen | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" } | null>(null);
  const [searchTitulo, setSearchTitulo] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<Set<number>>(new Set());
  const [confirmDeleteMultiple, setConfirmDeleteMultiple] = useState(false);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getImagenes();
      setImagenes(data);
    } catch {
      setLoadError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers de eliminación
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteImagen(confirmDelete.id);
      await loadData();
      setConfirmDelete(null);
      setToast({ 
        title: "Imagen eliminada", 
        description: "La imagen fue eliminada correctamente.", 
        type: "success" 
      });
    } catch {
      setToast({ 
        title: "Error al eliminar", 
        description: "No se pudo eliminar la imagen.", 
        type: "error" 
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMultiple = async () => {
    if (imagenesSeleccionadas.size === 0) return;
    setDeleting(true);
    try {
      const promesas = Array.from(imagenesSeleccionadas).map(id => deleteImagen(id));
      await Promise.all(promesas);
      await loadData();
      setImagenesSeleccionadas(new Set());
      setConfirmDeleteMultiple(false);
      setToast({ 
        title: "Imágenes eliminadas", 
        description: `Se eliminaron ${promesas.length} imagen(es) correctamente.`, 
        type: "success" 
      });
    } catch {
      setToast({ 
        title: "Error al eliminar", 
        description: "No se pudieron eliminar todas las imágenes.", 
        type: "error" 
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handlers de selección
  const toggleSeleccion = (id: number) => {
    const nuevasSeleccionadas = new Set(imagenesSeleccionadas);
    if (nuevasSeleccionadas.has(id)) {
      nuevasSeleccionadas.delete(id);
    } else {
      nuevasSeleccionadas.add(id);
    }
    setImagenesSeleccionadas(nuevasSeleccionadas);
  };

  const seleccionarTodasCategoria = (categoria: string) => {
    const imagenesCategoria = imagenesPorCategoria[categoria];
    const idsCategoria = imagenesCategoria.map(img => img.id);
    const todasSeleccionadas = idsCategoria.every(id => imagenesSeleccionadas.has(id));
    
    const nuevasSeleccionadas = new Set(imagenesSeleccionadas);
    if (todasSeleccionadas) {
      idsCategoria.forEach(id => nuevasSeleccionadas.delete(id));
    } else {
      idsCategoria.forEach(id => nuevasSeleccionadas.add(id));
    }
    setImagenesSeleccionadas(nuevasSeleccionadas);
  };

  const limpiarSeleccion = () => {
    setImagenesSeleccionadas(new Set());
  };

  // Filtrado y agrupación
  const imagenesFiltradas = imagenes.filter((img) => {
    const matchTitulo = searchTitulo 
      ? img.titulo.toLowerCase().includes(searchTitulo.toLowerCase()) ||
        img.descripcion?.toLowerCase().includes(searchTitulo.toLowerCase())
      : true;
    const matchCategoria = categoriaSeleccionada 
      ? img.categoria === categoriaSeleccionada
      : true;
    return matchTitulo && matchCategoria;
  });

  const imagenesPorCategoria = imagenesFiltradas.reduce((acc, img) => {
    if (!acc[img.categoria]) {
      acc[img.categoria] = [];
    }
    acc[img.categoria].push(img);
    return acc;
  }, {} as Record<string, Imagen[]>);

  const categorias = Object.keys(imagenesPorCategoria).sort();
  const todasCategorias = Array.from(new Set(imagenes.map(img => img.categoria))).sort();

  // Estados de carga
  if (loading) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="7xl" px={6} py={4}>
          <Flex justify="center" align="center" h="400px" direction="column" gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text fontSize="md" color="gray.600">Cargando imágenes...</Text>
          </Flex>
        </Container>
      </ChakraProvider>
    );
  }

  if (loadError) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="7xl" px={6} py={4}>
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="xl"
            p={6}
            textAlign="center"
          >
            <Icon fontSize="3xl" color="red.500" mb={3}><LuImage /></Icon>
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

  // Render principal
  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="7xl" px={6} py={4}>
        {/* Toast de notificaciones */}
        {toast && (
          <Toast
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Diálogos de confirmación */}
        {confirmDelete && (
          <ConfirmDialog
            title="Eliminar imagen"
            description={`¿Estás seguro de que deseas eliminar "${confirmDelete.titulo}"? Esta acción no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        )}

        {confirmDeleteMultiple && (
          <ConfirmDialog
            title="Eliminar imágenes seleccionadas"
            description={`¿Estás seguro de que deseas eliminar ${imagenesSeleccionadas.size} imagen(es)? Esta acción no se puede deshacer.`}
            onConfirm={handleDeleteMultiple}
            onCancel={() => setConfirmDeleteMultiple(false)}
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
                <Icon fontSize="xl" color="white"><LuImage /></Icon>
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                Gestión de Imágenes
              </Text>
            </Flex>
            <Text color="gray.600" fontSize="sm">
              Administra las imágenes subidas a la intranet
            </Text>
          </Box>
        </Flex>

        {/* Filtros */}
        <FiltrosImagenes
          searchTitulo={searchTitulo}
          categoriaSeleccionada={categoriaSeleccionada}
          todasCategorias={todasCategorias}
          totalImagenes={imagenesFiltradas.length}
          totalCategorias={categorias.length}
          imagenesSeleccionadas={imagenesSeleccionadas.size}
          onSearchChange={setSearchTitulo}
          onCategoriaChange={setCategoriaSeleccionada}
          onLimpiarFiltros={() => {
            setSearchTitulo("");
            setCategoriaSeleccionada("");
          }}
          onLimpiarSeleccion={limpiarSeleccion}
        />

        {/* Botón flotante para eliminar seleccionadas */}
        <BotonEliminarFlotante
          cantidadSeleccionadas={imagenesSeleccionadas.size}
          onEliminar={() => setConfirmDeleteMultiple(true)}
        />

        {/* Contenido por categorías */}
        {categorias.length === 0 ? (
          <Box
            bg="gray.50"
            borderRadius="xl"
            p={12}
            textAlign="center"
            border="2px dashed"
            borderColor="gray.300"
          >
            <Icon fontSize="4xl" color="gray.400" mb={3}><LuImage /></Icon>
            <Text fontSize="lg" fontWeight="medium" color="gray.600" mb={2}>
              No hay imágenes para mostrar
            </Text>
            <Text color="gray.500" fontSize="sm">
              {searchTitulo || categoriaSeleccionada
                ? "Intenta ajustar los filtros de búsqueda"
                : "Las imágenes subidas aparecerán aquí"}
            </Text>
          </Box>
        ) : (
          <Box>
            {categorias.map((categoria) => (
              <CategoriaSection
                key={categoria}
                categoria={categoria}
                imagenes={imagenesPorCategoria[categoria]}
                imagenesSeleccionadas={imagenesSeleccionadas}
                onToggleSeleccion={toggleSeleccion}
                onSeleccionarTodas={seleccionarTodasCategoria}
                onEliminar={setConfirmDelete}
              />
            ))}
          </Box>
        )}
      </Container>
    </ChakraProvider>
  );
}
