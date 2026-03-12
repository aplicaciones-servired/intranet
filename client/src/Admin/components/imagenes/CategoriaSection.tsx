import { useState } from "react";
import { Box, Button, Icon, Text, Flex, Grid, Badge } from "@chakra-ui/react";
import { LuImage, LuCheck, LuChevronDown, LuChevronUp } from "react-icons/lu";
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

const IMAGENES_POR_PAGINA = 12;

export function CategoriaSection({
  categoria,
  imagenes,
  imagenesSeleccionadas,
  onToggleSeleccion,
  onSeleccionarTodas,
  onEliminar,
}: CategoriaSectionProps) {
  const [expandido, setExpandido] = useState(true);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  
  const todasSeleccionadas = imagenes.every(img => imagenesSeleccionadas.has(img.id));
  const hayMasImagenes = imagenes.length > IMAGENES_POR_PAGINA;
  const imagenesMostradas = mostrarTodas ? imagenes : imagenes.slice(0, IMAGENES_POR_PAGINA);
  const imagenesSeleccionadasEnCategoria = Array.from(imagenesSeleccionadas)
    .filter(id => imagenes.some(img => img.id === id)).length;

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
      {/* Header de categoría - Clickeable para colapsar/expandir */}
      <Box
        bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
        p={4}
        cursor="pointer"
        onClick={() => setExpandido(!expandido)}
        transition="all 0.2s"
        _hover={{ bg: "linear-gradient(135deg, #006bb3 0%, #004d82 100%)" }}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={3}>
            <Icon fontSize="xl" color="white">
              {expandido ? <LuChevronUp /> : <LuChevronDown />}
            </Icon>
            <Icon fontSize="xl" color="white"><LuImage /></Icon>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {categoria}
              </Text>
              <Text fontSize="sm" color="blue.100">
                {imagenes.length} imagen(es)
                {imagenesSeleccionadasEnCategoria > 0 && (
                  <> · {imagenesSeleccionadasEnCategoria} seleccionada(s)</>
                )}
              </Text>
            </Box>
          </Flex>
          <Flex align="center" gap={3}>
            <Button
              size="sm"
              variant="surface"
              colorScheme="dark"
              onClick={(e) => {
                e.stopPropagation();
                onSeleccionarTodas(categoria);
              }}
            >
              <Icon mr={2}><LuCheck /></Icon>
              {todasSeleccionadas ? "Deseleccionar todas" : "Seleccionar todas"}
            </Button>
            <Badge
              colorScheme="cyan"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {imagenes.length}
            </Badge>
          </Flex>
        </Flex>
      </Box>

      {/* Contenido colapsable */}
      {expandido && (
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
            {imagenesMostradas.map((imagen) => (
              <ImagenCard
                key={imagen.id}
                imagen={imagen}
                estaSeleccionada={imagenesSeleccionadas.has(imagen.id)}
                onToggleSeleccion={onToggleSeleccion}
                onEliminar={onEliminar}
              />
            ))}
          </Grid>

          {/* Botón Ver más/Ver menos */}
          {hayMasImagenes && (
            <Flex justify="center" mt={6}>
              <Button
                onClick={() => setMostrarTodas(!mostrarTodas)}
                variant="outline"
                colorScheme="blue"
                size="md"
              >
                {mostrarTodas ? (
                  <>
                    <Icon mr={2}><LuChevronUp /></Icon>
                    Ver menos
                  </>
                ) : (
                  <>
                    <Icon mr={2}><LuChevronDown /></Icon>
                    Ver más ({imagenes.length - IMAGENES_POR_PAGINA} restantes)
                  </>
                )}
              </Button>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
}
