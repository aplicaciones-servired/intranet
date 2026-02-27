import { useState } from "react";
import {
  Box, Flex, Text, Button, Input, Textarea, Icon, Grid, VStack, Badge,
} from "@chakra-ui/react";
import { LuCheck, LuX, LuMonitor } from "react-icons/lu";
import type { Categoria, Espacio, EspacioTipo } from "../../../services/GetInfo";

const TIPOS: { value: EspacioTipo; label: string; desc: string; color: string }[] = [
  { value: "slider", label: "Slider / Banner", desc: "Carrusel de imágenes a pantalla completa", color: "blue" },
  { value: "destacada", label: "Columna destacada", desc: "Listado lateral izquierdo con thumbnails", color: "orange" },
  { value: "grid", label: "Grid de tarjetas", desc: "Mosaico de tarjetas con imagen y texto", color: "green" },
  { value: "lista", label: "Lista horizontal", desc: "Tarjetas horizontales con resumen", color: "purple" },
];

const TIPO_COLORS: Record<EspacioTipo, string> = {
  slider: "#3B82F6",
  destacada: "#F59E0B",
  grid: "#22C55E",
  lista: "#A855F7",
};

/* ── Mockup visual del layout de la intranet ── */
function LayoutPreview({ tipo, nombre, catLabel }: { tipo: EspacioTipo; nombre: string; catLabel: string }) {
  const accent = TIPO_COLORS[tipo];
  const pulse: React.CSSProperties = {
    outline: `2.5px solid ${accent}`,
    outlineOffset: "1px",
    borderRadius: "3px",
    position: "relative",
  };
  const label: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: accent,
    color: "white",
    fontSize: "7px",
    fontWeight: 700,
    padding: "2px 5px",
    borderRadius: "3px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    zIndex: 10,
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="md" border="1px solid" borderColor="gray.200" overflow="hidden">
      {/* Barra navegador */}
      <Box bg="#1f2937" px={3} py={2}>
        <Flex align="center" gap={2}>
          <Flex gap={1}>
            <Box w={2} h={2} borderRadius="full" bg="red.400" />
            <Box w={2} h={2} borderRadius="full" bg="yellow.400" />
            <Box w={2} h={2} borderRadius="full" bg="green.400" />
          </Flex>
          <Box flex={1} bg="gray.600" borderRadius="sm" px={2} py={0.5} textAlign="center">
            <Text fontSize="8px" color="gray.300">intranet.empresa.com</Text>
          </Box>
        </Flex>
      </Box>

      {/* Contenido mockup */}
      <Box bg="#f4f4f4">
        {/* Barra de categorías */}
        <Box bg="#005a9c" px={2} py={1.5}>
          <Flex gap={2}>
            {["Inicio", "Categoría", catLabel || "…", "Más"].map((c, i) => (
              <Box
                key={i}
                px={2} py={0.5}
                bg={i === 2 ? "whiteAlpha.300" : "transparent"}
                borderRadius="sm"
              >
                <Text fontSize="7px" color={i === 2 ? "white" : "whiteAlpha.600"} fontWeight={i === 2 ? 700 : 400}>
                  {c}
                </Text>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Slider */}
        <Box
          style={tipo === "slider" ? { ...pulse, display: "block" } : {}}
          bg={tipo === "slider" ? "#bfdbfe" : "#d1d5db"}
          h="40px"
          position="relative"
        >
          {tipo === "slider" ? (
            <>
              <style>{`@keyframes spPulse {0%,100%{opacity:1}50%{opacity:.6}}`}</style>
              <Box style={{ ...pulse, animation: "spPulse 1.8s ease-in-out infinite", height: "100%" }}>
                <Box style={label}>{nombre || "Slider / Banner"}</Box>
              </Box>
            </>
          ) : (
            <Flex align="center" justify="center" h="full">
              <Text fontSize="7px" color="gray.400">Banner</Text>
            </Flex>
          )}
        </Box>

        {/* Cuerpo */}
        <Flex gap={1.5} p={1.5} minH="60px">
          {/* Columna destacada */}
          <Box
            w="28%"
            flexShrink={0}
            bg={tipo === "destacada" ? "#fef3c7" : "white"}
            borderRadius="sm"
            style={tipo === "destacada" ? pulse : {}}
            position="relative"
            overflow="hidden"
          >
            {tipo === "destacada" ? (
              <>
                <style>{`@keyframes spPulse {0%,100%{opacity:1}50%{opacity:.6}}`}</style>
                <Box style={{ animation: "spPulse 1.8s ease-in-out infinite", height: "100%", minHeight: "56px" }}>
                  <Box style={label}>{nombre || "Columna destacada"}</Box>
                  {[1, 2, 3].map((i) => (
                    <Flex key={i} gap={1} p={1} align="center">
                      <Box w="14px" h="10px" bg="#fde68a" borderRadius="1px" flexShrink={0} />
                      <Box flex={1} h="6px" bg="#fde68a" borderRadius="1px" />
                    </Flex>
                  ))}
                </Box>
              </>
            ) : (
              <Box p={1}>
                <Box h="6px" bg="gray.200" borderRadius="1px" mb={1} />
                {[1, 2, 3].map((i) => (
                  <Flex key={i} gap={1} mb={0.5} align="center">
                    <Box w="12px" h="8px" bg="gray.200" borderRadius="1px" flexShrink={0} />
                    <Box flex={1} h="5px" bg="gray.100" borderRadius="1px" />
                  </Flex>
                ))}
              </Box>
            )}
          </Box>

          {/* Área principal: grid o lista */}
          <Box flex={1} position="relative">
            {tipo === "grid" && (
              <>
                <style>{`@keyframes spPulse {0%,100%{opacity:1}50%{opacity:.6}}`}</style>
                <Box style={{ ...pulse, animation: "spPulse 1.8s ease-in-out infinite", height: "100%", minHeight: "56px" }}>
                  <Box style={label}>{nombre || "Grid de tarjetas"}</Box>
                  <Grid templateColumns="repeat(3, 1fr)" gap={1} p={1}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Box key={i} bg="#bbf7d0" borderRadius="sm" h="16px" />
                    ))}
                  </Grid>
                </Box>
              </>
            )}
            {tipo === "lista" && (
              <>
                <style>{`@keyframes spPulse {0%,100%{opacity:1}50%{opacity:.6}}`}</style>
                <Box style={{ ...pulse, animation: "spPulse 1.8s ease-in-out infinite", height: "100%", minHeight: "56px" }}>
                  <Box style={label}>{nombre || "Lista horizontal"}</Box>
                  <VStack gap={1} p={1} align="stretch">
                    {[1, 2, 3].map((i) => (
                      <Flex key={i} gap={1} align="center" bg="#f3e8ff" borderRadius="sm" p={0.5}>
                        <Box w="20px" h="14px" bg="#d8b4fe" borderRadius="2px" flexShrink={0} />
                        <Box flex={1} h="6px" bg="#e9d5ff" borderRadius="1px" />
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
            {(tipo === "slider" || tipo === "destacada") && (
              <Grid templateColumns="repeat(3, 1fr)" gap={1} p={1}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Box key={i} bg="white" borderRadius="sm" h="16px" />
                ))}
              </Grid>
            )}
          </Box>
        </Flex>
      </Box>

      {/* Leyenda */}
      <Flex align="center" gap={1.5} px={3} py={2} borderTop="1px solid" borderColor="gray.100" bg="white">
        <Box w={2} h={2} borderRadius="full" style={{ background: accent }} flexShrink={0} />
        <Text fontSize="9px" color="gray.500">
          <Box as="span" fontWeight="bold" color="gray.700">{TIPOS.find((t) => t.value === tipo)?.label}</Box>
          {" · "}{catLabel ? `categoría "${catLabel}"` : "sin categoría"}
          {" · "}{nombre || "sin nombre"}
        </Text>
      </Flex>
    </Box>
  );
}

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
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} alignItems="start">
        {/* Columna izquierda: campos */}
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

        {/* Columna derecha: vista previa */}
        <Box position="sticky" top={4}>
          <Flex align="center" gap={2} mb={3}>
            <Icon color="gray.400" fontSize="sm"><LuMonitor /></Icon>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">Vista previa del layout</Text>
          </Flex>
          <LayoutPreview tipo={tipo} nombre={nombre} catLabel={catSelected?.label ?? ""} />
          <Text fontSize="9px" color="gray.400" textAlign="center" mt={2}>
            La zona resaltada indica dónde aparecerá este espacio en la intranet
          </Text>
        </Box>
      </Grid>
    </Box>
  );
}
