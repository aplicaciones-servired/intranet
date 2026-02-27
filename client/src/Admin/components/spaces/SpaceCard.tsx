import { Flex, Box, Text, Badge, Icon, Button } from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuEye, LuEyeOff } from "react-icons/lu";
import type { Espacio, Categoria } from "../../../services/GetInfo";

const TIPO_COLORS: Record<string, string> = {
  slider: "blue",
  destacada: "orange",
  grid: "green",
  lista: "purple",
};

const TIPO_LABELS: Record<string, string> = {
  slider: "Slider",
  destacada: "Destacada",
  grid: "Grid",
  lista: "Lista",
};

interface Props {
  espacio: Espacio;
  categorias: Categoria[];
  onEdit: (e: Espacio) => void;
  onDelete: (e: Espacio) => void;
  onToggleVisible: (e: Espacio) => void;
}

export function SpaceCard({ espacio, categorias, onEdit, onDelete, onToggleVisible }: Props) {
  const cat = categorias.find((c) => c.value === espacio.categoria);
  const tipoColor = TIPO_COLORS[espacio.tipo] ?? "gray";
  const tipoLabel = TIPO_LABELS[espacio.tipo] ?? espacio.tipo;

  return (
    <Flex
      bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200"
      p={4} gap={3} align="flex-start"
      opacity={espacio.visible ? 1 : 0.55}
      transition="all 0.2s"
      _hover={{ shadow: "sm", borderColor: "gray.300" }}
    >
      {/* Info */}
      <Box flex={1} minW={0}>
        <Flex align="center" gap={2} flexWrap="wrap">
          <Text fontWeight="semibold" fontSize="sm" color="gray.900" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {espacio.nombre}
          </Text>
          {!espacio.visible && (
            <Badge colorPalette="gray" variant="subtle" fontSize="xs">Oculto</Badge>
          )}
        </Flex>

        {espacio.descripcion && (
          <Text fontSize="xs" color="gray.500" mt={0.5} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{espacio.descripcion}</Text>
        )}

        <Flex gap={1.5} mt={1.5} flexWrap="wrap" align="center">
          <Badge colorPalette={tipoColor} variant="subtle" fontSize="xs">{tipoLabel}</Badge>
          {cat && (
            <Badge colorPalette="gray" variant="outline" fontSize="xs">{cat.label}</Badge>
          )}
          {!cat && (
            <Badge colorPalette="red" variant="outline" fontSize="xs">Sin categoría</Badge>
          )}
        </Flex>
      </Box>

      {/* Acciones */}
      <Flex gap={1} flexShrink={0}>
        <Button
          size="xs" variant="ghost" borderRadius="lg"
          color={espacio.visible ? "green.500" : "gray.400"}
          title={espacio.visible ? "Ocultar espacio" : "Mostrar espacio"}
          onClick={() => onToggleVisible(espacio)}
        >
          <Icon>{espacio.visible ? <LuEye /> : <LuEyeOff />}</Icon>
        </Button>
        <Button
          size="xs" variant="ghost" borderRadius="lg" color="blue.500"
          title="Editar espacio"
          onClick={() => onEdit(espacio)}
        >
          <Icon><LuPencil /></Icon>
        </Button>
        <Button
          size="xs" variant="ghost" borderRadius="lg" color="red.500"
          title="Eliminar espacio"
          onClick={() => onDelete(espacio)}
        >
          <Icon><LuTrash2 /></Icon>
        </Button>
      </Flex>
    </Flex>
  );
}
