import { useState } from "react";
import {
  Box, Flex, Text, Button, Input, Textarea, Icon, Grid, VStack, Badge,
} from "@chakra-ui/react";
import { LuCheck, LuX } from "react-icons/lu";
import type { Categoria, Espacio, EspacioTipo } from "../../../services/GetInfo";

const TIPOS: { value: EspacioTipo; label: string; desc: string; color: string }[] = [
  { value: "slider", label: "Slider / Banner", desc: "Carrusel de imágenes a pantalla completa", color: "blue" },
  { value: "destacada", label: "Columna destacada", desc: "Listado lateral izquierdo con thumbnails", color: "orange" },
  { value: "grid", label: "Grid de tarjetas", desc: "Mosaico de tarjetas con imagen y texto", color: "green" },
  { value: "lista", label: "Lista horizontal", desc: "Tarjetas horizontales con resumen", color: "purple" },
];

interface Props {
  initial?: Partial<Espacio>;
  categorias: Categoria[];
  onSave: (data: Omit<Espacio, "id">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SpaceForm({ initial, categorias, onSave, onCancel, loading }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [tipo, setTipo] = useState<EspacioTipo>(initial?.tipo ?? "grid");
  const [categoria, setCategoria] = useState(initial?.categoria ?? (categorias[0]?.value ?? ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !categoria) return;
    await onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      tipo,
      categoria,
      visible: initial?.visible ?? true,
      orden: initial?.orden ?? 0,
    });
  };

  const catSelected = categorias.find((c) => c.value === categoria);

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        {/* Nombre + Descripción */}
        <VStack gap={3} align="stretch">
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Nombre del espacio *</Text>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Noticias de la empresa" size="sm" borderRadius="lg" required />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1.5} fontWeight="medium">Descripción</Text>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué muestra este espacio..." size="sm" borderRadius="lg" rows={2} resize="none" />
          </Box>
        </VStack>

        {/* Tipo de display */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">Tipo de visualización *</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            {TIPOS.map((t) => (
              <Box
                key={t.value}
                onClick={() => setTipo(t.value)}
                p={3} borderRadius="xl" border="2px solid" textAlign="left"
                borderColor={tipo === t.value ? `${t.color}.500` : "gray.200"}
                bg={tipo === t.value ? `${t.color}.50` : "white"}
                cursor="pointer" transition="all 0.15s"
              >
                <Flex align="center" gap={2} mb={1}>
                  <Badge colorPalette={t.color} variant="subtle" fontSize="xs">{t.label}</Badge>
                  {tipo === t.value && <Icon color={`${t.color}.500`} ml="auto"><LuCheck /></Icon>}
                </Flex>
                <Text fontSize="xs" color="gray.500">{t.desc}</Text>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Categoría */}
        <Box>
          <Text fontSize="xs" color="gray.500" mb={2} fontWeight="medium">Categoría de contenido *</Text>
          {categorias.length === 0 ? (
            <Box p={3} bg="yellow.50" borderRadius="lg" border="1px solid" borderColor="yellow.200">
              <Text fontSize="sm" color="yellow.700">⚠️ No hay categorías creadas. Ve a "Categorías" y crea una primero.</Text>
            </Box>
          ) : (
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {categorias.filter((c) => c.activa).map((cat) => (
                <Box
                  key={cat.value}
                  onClick={() => setCategoria(cat.value)}
                  p={2.5} borderRadius="xl" border="2px solid" textAlign="left"
                  borderColor={categoria === cat.value ? "blue.500" : "gray.200"}
                  bg={categoria === cat.value ? "blue.50" : "white"}
                  cursor="pointer" transition="all 0.15s"
                  display="flex" alignItems="center" gap={2}
                >
                  <Text fontSize="xs" fontWeight="medium" color="gray.700" flex={1}>{cat.label}</Text>
                  {categoria === cat.value && (
                    <Box w="6px" h="6px" borderRadius="full" bg="blue.500" flexShrink={0} />
                  )}
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Preview */}
        {nombre && catSelected && (
          <Flex align="center" gap={3} bg="gray.50" p={3} borderRadius="xl">
            <Box flex={1}>
              <Text fontWeight="semibold" fontSize="sm" color="gray.900">{nombre}</Text>
              <Flex gap={1.5} mt={0.5}>
                <Badge colorPalette="blue" variant="subtle" fontSize="xs">
                  {TIPOS.find((t) => t.value === tipo)?.label}
                </Badge>
                <Badge colorPalette="gray" variant="outline" fontSize="xs">
                  {catSelected.label}
                </Badge>
              </Flex>
            </Box>
          </Flex>
        )}

        {/* Botones */}
        <Flex gap={3} justify="flex-end" pt={2}>
          <Button variant="outline" size="sm" borderRadius="lg" onClick={onCancel} type="button">
            <Icon mr={1}><LuX /></Icon> Cancelar
          </Button>
          <Button
            type="submit" size="sm" borderRadius="lg"
            bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"
            color="white" shadow="md" loading={loading}
            disabled={!nombre.trim() || !categoria || categorias.length === 0}
            _hover={{ transform: "translateY(-1px)" }}
          >
            <Icon mr={1}><LuCheck /></Icon>
            {initial?.id ? "Guardar cambios" : "Crear espacio"}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
