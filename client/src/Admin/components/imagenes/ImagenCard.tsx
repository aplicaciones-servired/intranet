import { Box, Button, Icon, Text, Image } from "@chakra-ui/react";
import { LuTrash2, LuCheck } from "react-icons/lu";
import type { Imagen } from "../../../services/imagen.service";

interface ImagenCardProps {
  imagen: Imagen;
  estaSeleccionada: boolean;
  onToggleSeleccion: (id: number) => void;
  onEliminar: (imagen: Imagen) => void;
}

export function ImagenCard({
  imagen,
  estaSeleccionada,
  onToggleSeleccion,
  onEliminar
}: ImagenCardProps) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      overflow="hidden"
      border="2px solid"
      borderColor={estaSeleccionada ? "blue.500" : "gray.200"}
      transition="all 0.2s"
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
        borderColor: estaSeleccionada ? "blue.600" : "blue.300"
      }}
      position="relative"
    >
      {/* Checkbox de selección */}
      <Box
        position="absolute"
        top={2}
        left={2}
        zIndex={2}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSeleccion(imagen.id);
        }}
        cursor="pointer"
      >
        <Box
          width="32px"
          height="32px"
          bg={estaSeleccionada ? "blue.500" : "white"}
          border="2px solid"
          borderColor={estaSeleccionada ? "blue.600" : "gray.300"}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 2px 8px rgba(0,0,0,0.15)"
          transition="all 0.2s"
          _hover={{ borderColor: "blue.500" }}
        >
          {estaSeleccionada && (
            <Icon color="white" fontSize="lg"><LuCheck /></Icon>
          )}
        </Box>
      </Box>

      {/* Imagen */}
      <Box
        position="relative"
        paddingBottom="75%"
        bg="gray.100"
        onClick={() => onToggleSeleccion(imagen.id)}
        cursor="pointer"
      >
        <Image
          src={imagen.poster}
          alt={imagen.titulo}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={estaSeleccionada ? 0.7 : 1}
          transition="opacity 0.2s"
          loading="lazy"
        />
        {estaSeleccionada && (
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            bg="rgba(59, 130, 246, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon fontSize="4xl" color="white"><LuCheck /></Icon>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.900"
          mb={1}
          overflow="hidden"
          textOverflow="ellipsis"
          css={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {imagen.titulo}
        </Text>
        {imagen.descripcion && (
          <Text
            fontSize="xs"
            color="gray.500"
            mb={3}
            overflow="hidden"
            textOverflow="ellipsis"
            css={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {imagen.descripcion}
          </Text>
        )}
        {imagen.fecha_registro && (
          <Text fontSize="xs" color="gray.400" mb={3}>
            {new Date(imagen.fecha_registro).toLocaleDateString('es-ES')}
          </Text>
        )}

        {/* Botón eliminar individual */}
        <Button
          size="sm"
          colorScheme="red"
          variant="ghost"
          width="100%"
          bg="red.500" 
          _hover={{ bg: "red.600" }}
          color="white"
          onClick={(e) => {
            e.stopPropagation();
            onEliminar(imagen);
          }}
        >
          <Icon mr={2}><LuTrash2 /></Icon>
          Eliminar
        </Button>
      </Box>
    </Box>
  );
}
