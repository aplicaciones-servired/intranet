import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Icon,
  Image,
  Link,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuExternalLink, LuToggleLeft, LuToggleRight } from "react-icons/lu";

interface Formulario {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  imagen: string;
  activo: boolean;
}

interface Props {
  formulario: Formulario;
  onToggle: (id: number) => void;
  onEdit: (formulario: Formulario) => void;
  onDelete: (id: number) => void;
}

export function FormularioCard({ formulario, onToggle, onEdit, onDelete }: Props) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      shadow="md"
      border="1px solid"
      borderColor="gray.200"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
    >
      <Box position="relative" h="200px" overflow="hidden">
        <Image
          src={formulario.imagen}
          alt={formulario.titulo}
          w="full"
          h="full"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          top={3}
          right={3}
          colorPalette={formulario.activo ? "green" : "gray"}
          size="lg"
          variant="solid"
        >
          {formulario.activo ? "Activo" : "Inactivo"}
        </Badge>
      </Box>

      <VStack p={5} alignItems="stretch" gap={3}>
        <Heading size="md" color="gray.800" lineClamp={2}>
          {formulario.titulo}
        </Heading>

        <Text fontSize="sm" color="gray.600" lineClamp={3}>
          {formulario.descripcion || "Sin descripción"}
        </Text>

        <Link
          href={formulario.url}
          target="_blank"
          rel="noopener noreferrer"
          fontSize="sm"
          color="blue.500"
          _hover={{ color: "blue.600", textDecoration: "underline" }}
        >
          <HStack gap={1}>
            <Icon><LuExternalLink /></Icon>
            <Text>Abrir formulario</Text>
          </HStack>
        </Link>

        <HStack gap={2} mt={2} pt={3} borderTop="1px solid" borderColor="gray.200">
          <Button
            size="sm"
            variant="outline"
            colorScheme={formulario.activo ? "gray" : "green"}
            onClick={() => onToggle(formulario.id)}
            flex={1}
          >
            <Icon>
              {formulario.activo ? <LuToggleRight /> : <LuToggleLeft />}
            </Icon>
            {formulario.activo ? "Desactivar" : "Activar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => onEdit(formulario)}
          >
            <Icon><LuPencil /></Icon>
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={() => onDelete(formulario.id)}
          >
            <Icon><LuTrash2 /></Icon>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
