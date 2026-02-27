import { Box, Flex, Text, Button, Icon, Badge } from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuGripVertical, LuEyeOff, LuEye } from "react-icons/lu";
import type { Categoria } from "../../../services/GetInfo";

interface Props {
  categoria: Categoria;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActiva: () => void;
}

export function CategoryRow({ categoria, onEdit, onDelete, onToggleActiva }: Props) {
  return (
    <Flex
      align="center"
      gap={3}
      p={4}
      bg={categoria.activa ? "white" : "gray.50"}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="sm"
      transition="all 0.15s"
      opacity={categoria.activa ? 1 : 0.6}
      _hover={{ shadow: "md", borderColor: "gray.300" }}
    >
      {/* Drag handle (visual) */}
      <Icon color="gray.300" fontSize="lg" cursor="grab"><LuGripVertical /></Icon>

      {/* Color badge con valor */}
      <Box flex={1} minW={0}>
        <Flex align="center" gap={2}>
          <Text fontWeight="semibold" color="gray.900" fontSize="sm">{categoria.label}</Text>
          {!categoria.activa && (
            <Badge colorPalette="gray" variant="subtle" fontSize="xs">Inactiva</Badge>
          )}
        </Flex>
        <Text fontFamily="mono" fontSize="xs" color="gray.400">{categoria.value}</Text>
      </Box>

      {/* Acciones */}
      <Flex gap={1} flexShrink={0}>
        <Button
          variant="ghost" size="xs" borderRadius="lg" p={2}
          color={categoria.activa ? "gray.500" : "green.500"}
          _hover={{ bg: categoria.activa ? "gray.100" : "green.50" }}
          onClick={onToggleActiva}
          title={categoria.activa ? "Desactivar" : "Activar"}
        >
          <Icon>{categoria.activa ? <LuEye /> : <LuEyeOff />}</Icon>
        </Button>
        <Button
          variant="ghost" size="xs" borderRadius="lg" p={2}
          color="blue.500" _hover={{ bg: "blue.50" }}
          onClick={onEdit}
        >
          <Icon><LuPencil /></Icon>
        </Button>
        <Button
          variant="ghost" size="xs" borderRadius="lg" p={2}
          color="red.500" _hover={{ bg: "red.50" }}
          onClick={onDelete}
        >
          <Icon><LuTrash2 /></Icon>
        </Button>
      </Flex>
    </Flex>
  );
}
