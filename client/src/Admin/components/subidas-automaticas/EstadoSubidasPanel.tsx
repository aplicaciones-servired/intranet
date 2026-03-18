import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { EstadoSubidasPanelProps } from "../../../types/subiaTypes";


export default function EstadoSubidasPanel({
  title,
  count,
  icon,
  iconColor,
  bg,
  borderColor,
  tipoSeleccionado,
  children,
}: EstadoSubidasPanelProps) {
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={5}
      shadow="sm"
    >
      <Flex align="center" gap={2} mb={3}>
        <Box color={iconColor}>{icon}</Box>
        <Text fontSize="md" fontWeight="bold">{title} ({count})</Text>
      </Flex>
      {!tipoSeleccionado ? (
        <Text fontSize="sm" color="gray.500">Selecciona una card para ver el detalle por tipo.</Text>
      ) : (
        children
      )}
    </Box>
  );
}
