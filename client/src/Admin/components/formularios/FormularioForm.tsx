import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Flex,
  Icon,
  Text,
  Image,
} from "@chakra-ui/react";
import { LuUpload, LuX, LuCheck } from "react-icons/lu";

interface Props {
  form: {
    titulo: string;
    descripcion: string;
    url: string;
  };
  editingId: number | null;
  selectedImage: File | null;
  imagePreview: string | null;
  onFormChange: (field: string, value: string) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function FormularioForm({
  form,
  editingId,
  selectedImage,
  imagePreview,
  onFormChange,
  onImageChange,
  onSubmit,
  onCancel,
}: Props) {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
      p={6}
      mb={6}
    >
      <form onSubmit={onSubmit}>
        <VStack gap={4} alignItems="stretch">
          {/* Imagen */}
          <Box>
            <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">
              Imagen del formulario {!editingId && "*"}
            </Text>
            <Box>
              {imagePreview ? (
                <Box position="relative" w="full" maxW="280px">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    borderRadius="lg"
                    w="full"
                    h="160px"
                    objectFit="cover"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  <Button
                    position="absolute"
                    top={2}
                    right={2}
                    size="xs"
                    bg="white"
                    color="red.600"
                    shadow="md"
                    borderRadius="lg"
                    onClick={() => onImageChange(null)}
                    _hover={{ bg: "red.50" }}
                  >
                    <Icon><LuX /></Icon>
                  </Button>
                </Box>
              ) : (
                <Box
                  as="label"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  p={6}
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="lg"
                  cursor="pointer"
                  transition="all 0.2s"
                  bg="gray.50"
                  maxW="280px"
                  _hover={{ borderColor: "#005a9c", bg: "blue.50" }}
                >
                  <Icon fontSize="2xl" color="gray.400" mb={2}><LuUpload /></Icon>
                  <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="medium">
                    Subir imagen
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    PNG, JPG • Máx. 5MB
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                    required={!editingId}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Título *</Text>
            <Input
              value={form.titulo}
              onChange={(e) => onFormChange("titulo", e.target.value)}
              placeholder="Ej: Encuesta de Satisfacción 2026"
              size="sm"
              borderRadius="lg"
              required
            />
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Descripción</Text>
            <Textarea
              value={form.descripcion}
              onChange={(e) => onFormChange("descripcion", e.target.value)}
              placeholder="Descripción breve del formulario..."
              rows={3}
              size="sm"
              borderRadius="lg"
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              Opcional. Se mostrará en la tarjeta del formulario.
            </Text>
          </Box>

          <Box>
            <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">URL del Google Form *</Text>
            <Input
              value={form.url}
              onChange={(e) => onFormChange("url", e.target.value)}
              placeholder="https://forms.gle/..."
              type="url"
              size="sm"
              borderRadius="lg"
              fontFamily="mono"
              required
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              Pega aquí el enlace completo del formulario de Google.
            </Text>
          </Box>

          <Flex gap={3} justifyContent="flex-end" pt={2}>
            <Button variant="outline" size="sm" borderRadius="lg" onClick={onCancel} type="button">
              <Icon mr={1}><LuX /></Icon> Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              borderRadius="lg"
              bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
              color="white"
              shadow="md"
              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
            >
              <Icon mr={1}><LuCheck /></Icon>
              {editingId ? "Guardar cambios" : "Crear formulario"}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}
