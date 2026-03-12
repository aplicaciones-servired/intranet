import { Box, Icon, Text, Flex } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";

interface BotonEliminarFlotanteProps {
  cantidadSeleccionadas: number;
  onEliminar: () => void;
}

export function BotonEliminarFlotante({ 
  cantidadSeleccionadas, 
  onEliminar 
}: BotonEliminarFlotanteProps) {
  if (cantidadSeleccionadas === 0) return null;

  return (
    <Box
      position="fixed"
      bottom={8}
      right={8}
      bg="red.600"
      color="white"
      px={6}
      py={4}
      borderRadius="full"
      boxShadow="0 10px 40px rgba(220, 38, 38, 0.4)"
      cursor="pointer"
      onClick={onEliminar}
      transition="all 0.2s"
      _hover={{ bg: "red.700", transform: "scale(1.05)" }}
      zIndex={100}
    >
      <Flex align="center" gap={3}>
        <Icon fontSize="xl"><LuTrash2 /></Icon>
        <Box>
          <Text fontSize="sm" fontWeight="bold">
            Eliminar seleccionadas
          </Text>
          <Text fontSize="xs" opacity={0.9}>
            {cantidadSeleccionadas} imagen(es)
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
