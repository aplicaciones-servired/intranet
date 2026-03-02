import {
  Box,
  Heading,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Icon,
  Text,
  Field,
  Image,
} from "@chakra-ui/react";
import { LuUpload, LuX } from "react-icons/lu";

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
      shadow="lg"
      border="1px solid"
      borderColor="gray.200"
      p={6}
      mb={6}
    >
      <Heading size="md" mb={4} color="gray.800">
        {editingId ? "Editar Formulario" : "Nuevo Formulario"}
      </Heading>
      <form onSubmit={onSubmit}>
        <VStack gap={4} alignItems="stretch">
          {/* Imagen */}
          <Field.Root required={!editingId}>
            <Field.Label>Imagen del formulario</Field.Label>
            <Box>
              {imagePreview ? (
                <Box position="relative" w="full" maxW="300px">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    borderRadius="lg"
                    w="full"
                    h="200px"
                    objectFit="cover"
                  />
                  <Button
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onImageChange(null)}
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
                  p={8}
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="lg"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: "blue.500", bg: "blue.50" }}
                >
                  <Icon fontSize="3xl" color="gray.400" mb={2}><LuUpload /></Icon>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Haz clic para seleccionar una imagen
                  </Text>
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    PNG, JPG • Máx. 5MB
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                </Box>
              )}
            </Box>
          </Field.Root>

          <Field.Root required>
            <Field.Label>Título</Field.Label>
            <Input
              value={form.titulo}
              onChange={(e) => onFormChange("titulo", e.target.value)}
              placeholder="Ej: Encuesta de Satisfacción 2026"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Descripción</Field.Label>
            <Textarea
              value={form.descripcion}
              onChange={(e) => onFormChange("descripcion", e.target.value)}
              placeholder="Descripción breve del formulario..."
              rows={3}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>URL del Google Form</Field.Label>
            <Input
              value={form.url}
              onChange={(e) => onFormChange("url", e.target.value)}
              placeholder="https://forms.gle/..."
              type="url"
            />
          </Field.Root>

          <HStack gap={3} justifyContent="flex-end" mt={2}>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" bg="blue.500" color="white" _hover={{ bg: "blue.600" }}>
              {editingId ? "Actualizar" : "Crear"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
