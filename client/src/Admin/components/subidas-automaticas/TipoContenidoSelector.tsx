import { Box, Flex, Grid, Icon, Text } from "@chakra-ui/react";
import { LuFileText, LuImage } from "react-icons/lu";
import type { TipoSubidaAutomatica } from "../../../services/subida_automatica.service";

interface TipoContenidoSelectorProps {
  tipo: TipoSubidaAutomatica | null;
  onSelect: (tipo: TipoSubidaAutomatica) => void;
}

export default function TipoContenidoSelector({ tipo, onSelect }: TipoContenidoSelectorProps) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Tipo de contenido *</Text>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
        <Box
          as="button"
          textAlign="left"
          p={4}
          borderRadius="xl"
          border="2px solid"
          borderColor={tipo === "imagen" ? "blue.500" : "gray.200"}
          bg={tipo === "imagen" ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "white"}
          shadow={tipo === "imagen" ? "md" : "sm"}
          transition="all 0.2s"
          _hover={{ borderColor: "blue.400", transform: "translateY(-1px)" }}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onSelect("imagen");
          }}
        >
          <Flex align="center" gap={2} mb={2}>
            <Box p={2} borderRadius="lg" bg="blue.600" color="white">
              <Icon fontSize="lg"><LuImage /></Icon>
            </Box>
            <Text fontSize="md" fontWeight="bold" color="gray.900">Imagenes</Text>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            Publica una o varias imagenes con titulo, categoria y descripcion.
          </Text>
        </Box>

        <Box
          as="button"
          textAlign="left"
          p={4}
          borderRadius="xl"
          border="2px solid"
          borderColor={tipo === "formulario" ? "emerald.500" : "gray.200"}
          bg={tipo === "formulario" ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" : "white"}
          shadow={tipo === "formulario" ? "md" : "sm"}
          transition="all 0.2s"
          _hover={{ borderColor: "emerald.400", transform: "translateY(-1px)" }}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onSelect("formulario");
          }}
        >
          <Flex align="center" gap={2} mb={2}>
            <Box p={2} borderRadius="lg" bg="green.emphasized" color="white">
              <Icon fontSize="lg"><LuFileText /></Icon>
            </Box>
            <Text fontSize="md" fontWeight="bold" color="gray.900">Formularios</Text>
          </Flex>
          <Text fontSize="xs" color="gray.600">
            Publica un formulario con URL, imagen de portada y descripcion.
          </Text>
        </Box>
      </Grid>
    </Box>
  );
}
