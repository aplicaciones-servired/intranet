import { useState } from "react";
import { Box, Flex, Text, Button, Input, Icon, VStack } from "@chakra-ui/react";
import { LuCheck, LuX } from "react-icons/lu";
import type { Categoria } from "../../../services/GetInfo";

interface Props {
  initial?: Partial<Categoria>;
  onSave: (data: Omit<Categoria, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function CategoryForm({ initial, onSave, onCancel, loading }: Props) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [value, setValue] = useState(initial?.value ?? "");
  const [autoSlug, setAutoSlug] = useState(!initial?.value);

  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (autoSlug) setValue(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !value.trim()) return;
    await onSave({
      label: label.trim(),
      value: value.trim(),
      orden: initial?.orden ?? 0,
      activa: initial?.activa ?? true,
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <Box>
          <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Nombre *</Text>
          <Input
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Ej: Comunicados Internos"
            size="sm"
            borderRadius="lg"
            required
          />
        </Box>

        <Box>
          <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Identificador (slug) *</Text>
          <Input
            value={value}
            onChange={(e) => { setValue(e.target.value); setAutoSlug(false); }}
            placeholder="comunicados_internos"
            size="sm"
            borderRadius="lg"
            fontFamily="mono"
            required
          />
          <Text fontSize="xs" color="gray.400" mt={1}>
            Se genera automaticamente desde el nombre. Solo letras, numeros y guion bajo.
          </Text>
        </Box>

        {label && (
          <Flex align="center" gap={2} bg="gray.50" p={3} borderRadius="xl">
            <Text fontWeight="semibold" color="gray.800" fontSize="sm">{label}</Text>
            <Box
              ml="auto" px={2} py={0.5} borderRadius="full"
              bg="gray.200" color="gray.700" fontSize="xs" fontWeight="medium"
              fontFamily="mono"
            >
              {value || "-"}
            </Box>
          </Flex>
        )}

        <Flex gap={3} justify="flex-end" pt={2}>
          <Button variant="outline" size="sm" borderRadius="lg" onClick={onCancel} type="button">
            <Icon mr={1}><LuX /></Icon> Cancelar
          </Button>
          <Button
            type="submit" size="sm" borderRadius="lg"
            bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
            color="white" shadow="md" loading={loading}
            _hover={{ transform: "translateY(-1px)" }}
          >
            <Icon mr={1}><LuCheck /></Icon>
            {initial?.id ? "Guardar cambios" : "Crear categoria"}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
