import { Box, Button, Icon, Text, Flex, Input } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

interface FiltrosImagenesProps {
  searchTitulo: string;
  categoriaSeleccionada: string;
  todasCategorias: string[];
  totalImagenes: number;
  totalCategorias: number;
  imagenesSeleccionadas: number;
  onSearchChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onLimpiarFiltros: () => void;
  onLimpiarSeleccion: () => void;
}

export function FiltrosImagenes({
  searchTitulo,
  categoriaSeleccionada,
  todasCategorias,
  totalImagenes,
  totalCategorias,
  imagenesSeleccionadas,
  onSearchChange,
  onCategoriaChange,
  onLimpiarFiltros,
  onLimpiarSeleccion,
}: FiltrosImagenesProps) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={6}
      mb={6}
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex gap={4} direction={{ base: "column", md: "row" }} align="end">
        <Box flex={2}>
          <Flex align="center" gap={2} mb={2}>
            <Icon color="gray.600"><LuSearch /></Icon>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Buscar imágenes
            </Text>
          </Flex>
          <Input
            placeholder="Busca por título o descripción..."
            value={searchTitulo}
            onChange={(e) => onSearchChange(e.target.value)}
            size="md"
          />
        </Box>

        <Box flex={1}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Filtrar por categoría
          </Text>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => onCategoriaChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #e2e8f0",
              fontSize: "0.875rem",
            }}
          >
            <option value="">Todas las categorías</option>
            {todasCategorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </Box>

        {(searchTitulo || categoriaSeleccionada) && (
          <Button
            size="md"
            variant="ghost"
            onClick={onLimpiarFiltros}
          >
            Limpiar
          </Button>
        )}
      </Flex>

      <Flex align="center" justify="space-between" mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
        <Text fontSize="sm" color="gray.600">
          <strong>{totalImagenes}</strong> imagen(es) en <strong>{totalCategorias}</strong> categoría(s)
          {imagenesSeleccionadas > 0 && (
            <> · <strong style={{ color: "#3b82f6" }}>{imagenesSeleccionadas} seleccionada(s)</strong></>
          )}
        </Text>
        {imagenesSeleccionadas > 0 && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={onLimpiarSeleccion}
          >
            Limpiar selección
          </Button>
        )}
      </Flex>
    </Box>
  );
}
