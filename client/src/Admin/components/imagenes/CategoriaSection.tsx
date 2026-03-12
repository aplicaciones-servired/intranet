import { Box, Button, Icon, Text, Flex, Grid, Badge } from "@chakra-ui/react";
import { LuImage, LuCheck } from "react-icons/lu";
import { ImagenCard } from "./ImagenCard";
import type { Imagen } from "../../../services/imagen.service";

interface CategoriaSectionProps {
  categoria: string;
  imagenes: Imagen[];
  imagenesSeleccionadas: Set<number>;
  onToggleSeleccion: (id: number) => void;
  onSeleccionarTodas: (categoria: string) => void;
  onEliminar: (imagen: Imagen) => void;
}

export function CategoriaSection({
  categoria,
  imagenes,
  imagenesSeleccionadas,
  onToggleSeleccion,
  onSeleccionarTodas,
  onEliminar,
}: CategoriaSectionProps) {
  const todasSeleccionadas = imagenes.every(img => imagenesSeleccionadas.has(img.id));

  return (
    <Box
      mb={6}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      overflow="hidden"
      boxShadow="sm"
    >
      {/* Header de categoría */}
      <Box
        bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
        p={4}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={3}>
            <Icon fontSize="xl" color="white"><LuImage /></Icon>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {categoria}
              </Text>
              <Text fontSize="sm" color="blue.100">
                {imagenes.length} imagen(es)
              </Text>
            </Box>
          </Flex>
          <Flex align="center" gap={3}>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="whiteAlpha"
              onClick={() => onSeleccionarTodas(categoria)}
            >
              <Icon mr={2}><LuCheck /></Icon>
              {todasSeleccionadas ? "Deseleccionar todas" : "Seleccionar todas"}
            </Button>
            <Badge
              colorScheme="blue"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {imagenes.length}
            </Badge>
          </Flex>
        </Flex>
      </Box>

      {/* Grid de imágenes */}
      <Box p={6}>
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          {imagenes.map((imagen) => (
            <ImagenCard
              key={imagen.id}
              imagen={imagen}
              estaSeleccionada={imagenesSeleccionadas.has(imagen.id)}
              onToggleSeleccion={onToggleSeleccion}
              onEliminar={onEliminar}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
