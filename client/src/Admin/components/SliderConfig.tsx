import { useState, useEffect } from "react";
import { getConfig, setConfig, getImagenes, type Imagen } from "../../services/GetInfo";
import { categories } from "../../utils/const";
import {
  Box,
  ChakraProvider,
  defaultSystem,
  Icon,
  Text,
  Flex,
  Heading,
  Container,
  VStack,
  Grid,
  GridItem,
  Badge,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { LuEye, LuLayoutDashboard, LuSave, LuCheck, LuStar, LuImage } from "react-icons/lu";

const CATEGORY_ICONS: Record<string, string> = {
  comunicaciones: "ðŸ“¢",
  eventos: "ðŸŽ‰",
  productos: "ðŸ“¦",
  equipo: "ðŸ‘¥",
  instalaciones: "ðŸ¢",
  otros: "ðŸ—‚ï¸",
};

const SECCIONES = [
  {
    label: "Slider principal",
    description: "Banner rotativo en la parte superior de la pÃ¡gina",
    key: "slider_categoria",
    icon: <LuImage />,
    gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    accentColor: "blue.500",
  },
  {
    label: "SecciÃ³n destacada",
    description: "Columna izquierda con contenido resaltado",
    key: "seccion_destacada",
    icon: <LuStar />,
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    accentColor: "orange.400",
  },
];

function isVideo(url: string): boolean {
  return [".mp4", ".webm", ".ogg", ".mov"].some((e) => url.toLowerCase().includes(e));
}

/* â”€â”€ Preview Panel â”€â”€ */
function PreviewPanel({ config, imagenes }: { config: Record<string, string>; imagenes: Imagen[] }) {
  const sliderCat = config["slider_categoria"] ?? "comunicaciones";
  const destacadaCat = config["seccion_destacada"] ?? null;
  const sliderLabel = categories.items.find((c) => c.value === sliderCat)?.label ?? sliderCat;
  const destacadaLabel = categories.items.find((c) => c.value === destacadaCat)?.label;

  const porCategoria = (cat: string) => imagenes.filter((i) => i.categoria === cat);
  const sliderItems = porCategoria(sliderCat);
  const sliderFirst = sliderItems[0] ?? imagenes[0];
  const destacadaItems = destacadaCat ? porCategoria(destacadaCat).slice(0, 3) : [];
  const restoCats = categories.items.filter(
    (c) => c.value !== destacadaCat && porCategoria(c.value).length > 0
  );

  return (
    <Box bg="white" borderRadius="2xl" shadow="xl" border="1px solid" borderColor="gray.200" overflow="hidden">
      {/* Barra de navegador simulada */}
      <Box bg="linear-gradient(135deg, #1f2937 0%, #374151 100%)" px={5} py={3}>
        <Flex align="center" gap={3}>
          <Flex gap={1.5}>
            <Box w={3} h={3} borderRadius="full" bg="red.400" />
            <Box w={3} h={3} borderRadius="full" bg="yellow.400" />
            <Box w={3} h={3} borderRadius="full" bg="green.400" />
          </Flex>
          <Box flex={1} bg="gray.600" borderRadius="md" px={3} py={1} textAlign="center">
            <Text fontSize="xs" color="gray.300">intranet.empresa.com</Text>
          </Box>
          <Badge colorPalette="blue" variant="subtle" fontSize="xs">Vista previa</Badge>
        </Flex>
      </Box>

      {/* Contenido escalado */}
      <Box style={{ transform: "scale(0.68)", transformOrigin: "top left", width: "147%", marginBottom: "-32%" }}>
        {/* Barra de categorÃ­as */}
        <Box bg="#005a9c" px={4}>
          <Flex gap={0} overflow="hidden">
            {categories.items.map((cat) => (
              <Box
                key={cat.value}
                px={4}
                py="10px"
                fontSize="xs"
                fontWeight="medium"
                whiteSpace="nowrap"
                borderBottom="4px solid"
                borderColor={cat.value === sliderCat ? "white" : "transparent"}
                color={cat.value === sliderCat ? "white" : "whiteAlpha.600"}
                bg={cat.value === sliderCat ? "whiteAlpha.200" : "transparent"}
              >
                {cat.label}
              </Box>
            ))}
          </Flex>
        </Box>

        {/* Slider */}
        <Box position="relative" bg="gray.800" overflow="hidden" height="160px">
          {sliderFirst ? (
            isVideo(sliderFirst.poster) ? (
              <video src={sliderFirst.poster} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} muted playsInline />
            ) : (
              <img src={sliderFirst.poster} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} alt="" />
            )
          ) : (
            <Flex w="full" h="full" align="center" justify="center" bg="linear-gradient(135deg, rgba(0,90,156,0.4), rgba(0,61,107,0.6))">
              <Text color="whiteAlpha.400" fontSize="lg">Sin imÃ¡genes en esta categorÃ­a</Text>
            </Flex>
          )}
          <Box position="absolute" inset={0} bgGradient="to-t" gradientFrom="blackAlpha.700" gradientVia="transparent" gradientTo="transparent" />
          <Box position="absolute" bottom={4} left={6} color="white">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="whiteAlpha.600" mb={1}>
              ðŸ–¼ï¸ Slider â€” {sliderLabel} â€¢ {sliderItems.length || 0} items
            </Text>
            <Text fontSize="lg" fontWeight="bold" textShadow="md">
              {sliderFirst?.titulo ?? "Sin contenido"}
            </Text>
          </Box>
        </Box>

        {/* Cuerpo */}
        <Box bg="#f4f4f4" p={4}>
          <Flex gap={4} minH="140px">
            {/* Columna destacada */}
            {destacadaCat && destacadaItems.length > 0 && (
              <Box w="200px" flexShrink={0}>
                <Box bg="white" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="blue.100" shadow="sm">
                  <Flex bg="#005a9c" px={3} py={2} align="center" gap={1.5}>
                    <Text color="white" fontSize="xs" fontWeight="semibold">â­ {destacadaLabel}</Text>
                    <Text ml="auto" color="whiteAlpha.600" fontSize="10px">{porCategoria(destacadaCat).length} items</Text>
                  </Flex>
                  <VStack gap={1.5} p={2} align="stretch">
                    {destacadaItems.map((item) => (
                      <Flex key={item.id} gap={2} align="center" bg="gray.50" borderRadius="lg" p="6px">
                        <Box w="48px" h="36px" bg="gray.200" borderRadius="md" overflow="hidden" flexShrink={0}>
                          {isVideo(item.poster) ? (
                            <video src={item.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          ) : (
                            <img src={item.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                          )}
                        </Box>
                        <Text fontSize="10px" color="gray.700" lineClamp={2} lineHeight="tight">{item.titulo}</Text>
                      </Flex>
                    ))}
                    {porCategoria(destacadaCat).length > 3 && (
                      <Text fontSize="10px" color="gray.400" textAlign="center" py={1}>+{porCategoria(destacadaCat).length - 3} mÃ¡s</Text>
                    )}
                  </VStack>
                </Box>
              </Box>
            )}

            {/* Grid */}
            <Box flex={1}>
              {restoCats.length === 0 ? (
                <Flex align="center" justify="center" h="full">
                  <Text color="gray.400" fontSize="xs">Todo el contenido estÃ¡ en la secciÃ³n destacada</Text>
                </Flex>
              ) : (
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                  {restoCats.slice(0, 6).map((cat) => {
                    const items = porCategoria(cat.value);
                    const first = items[0];
                    return (
                      <Box key={cat.value} bg="white" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200" shadow="sm">
                        <Box h="48px" bg="gray.100" overflow="hidden">
                          {first && (isVideo(first.poster) ? (
                            <video src={first.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          ) : (
                            <img src={first.poster} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                          ))}
                        </Box>
                        <Box px={2} py="6px">
                          <Text fontSize="9px" fontWeight="bold" color="#005a9c" textTransform="uppercase" letterSpacing="wider">{cat.label}</Text>
                          <Text fontSize="10px" color="gray.500">{items.length} items</Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

/* â”€â”€ Componente principal â”€â”€ */
export function SliderConfig() {
  const [config, setConfigState] = useState<Record<string, string>>({});
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const claves = SECCIONES.map((s) => s.key);
    Promise.all([
      ...claves.map((k) => getConfig(k).then((v) => ({ k, v }))),
      getImagenes(),
    ])
      .then((results) => {
        const imgs = results.pop() as Imagen[];
        setImagenes(imgs);
        const map: Record<string, string> = {};
        (results as { k: string; v: string | null }[]).forEach(({ k, v }) => {
          map[k] = v ?? "comunicaciones";
        });
        setConfigState(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (clave: string) => {
    setSaving(clave);
    try {
      await setConfig(clave, config[clave]);
      setSaved(clave);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      alert("Error al guardar");
    } finally {
      setSaving(null);
    }
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="5xl" px={6} py={4}>

        {/* Header */}
        <Flex justifyContent="center" alignItems="center" gap={4} mb={8} direction={{ base: "column", md: "row" }}>
          <Box bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" p={3} borderRadius="xl" shadow="lg">
            <Icon fontSize="2xl" color="white"><LuLayoutDashboard /></Icon>
          </Box>
          <VStack gap={0} alignItems={{ base: "center", md: "flex-start" }}>
            <Heading size="xl" color="gray.900">Configurar secciones</Heading>
            <Text color="gray.600" fontSize="sm">
              Elige quÃ© categorÃ­a se muestra en cada secciÃ³n de la pÃ¡gina principal
            </Text>
          </VStack>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" direction="column" gap={4} py={20}>
            <Spinner size="xl" color="#005a9c" borderWidth="4px" />
            <Text color="gray.400" fontSize="sm">Cargando configuraciÃ³n...</Text>
          </Flex>
        ) : (
          <>
            {/* Cards de configuraciÃ³n */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={8}>
              {SECCIONES.map((seccion) => {
                const currentCat = categories.items.find((c) => c.value === config[seccion.key]);
                const isSaving = saving === seccion.key;
                const isSaved = saved === seccion.key;

                return (
                  <GridItem key={seccion.key}>
                    <Box
                      bg="white"
                      borderRadius="2xl"
                      shadow="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      overflow="hidden"
                      h="full"
                    >
                      {/* Card header */}
                      <Flex
                        align="center"
                        gap={4}
                        px={6}
                        py={4}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        bg="linear-gradient(135deg, rgba(0,90,156,0.04) 0%, transparent 100%)"
                      >
                        <Box bg={seccion.gradient} p={2.5} borderRadius="lg" shadow="md">
                          <Icon fontSize="xl" color="white">{seccion.icon}</Icon>
                        </Box>
                        <Box flex={1}>
                          <Text fontWeight="bold" color="gray.900" fontSize="md">{seccion.label}</Text>
                          <Text fontSize="xs" color="gray.400" mt="1px">{seccion.description}</Text>
                        </Box>
                        {currentCat && (
                          <Badge
                            colorPalette="blue"
                            variant="subtle"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            display={{ base: "none", sm: "flex" }}
                            gap={1}
                            alignItems="center"
                          >
                            <span>{CATEGORY_ICONS[currentCat.value]}</span>
                            {currentCat.label}
                          </Badge>
                        )}
                      </Flex>

                      {/* Card body */}
                      <Box px={6} py={5}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={3}>
                          Selecciona una categorÃ­a
                        </Text>

                        <Grid templateColumns="repeat(2, 1fr)" gap={2} mb={5}>
                          {categories.items.map((cat) => {
                            const isSelected = config[seccion.key] === cat.value;
                            return (
                              <Box
                                key={cat.value}
                                as="button"
                                onClick={() => setConfigState((prev) => ({ ...prev, [seccion.key]: cat.value }))}
                                display="flex"
                                alignItems="center"
                                gap={2}
                                px={3}
                                py="10px"
                                borderRadius="xl"
                                fontSize="sm"
                                fontWeight="medium"
                                border="2px solid"
                                textAlign="left"
                                cursor="pointer"
                                transition="all 0.15s"
                                borderColor={isSelected ? "#005a9c" : "gray.200"}
                                bg={isSelected ? "#005a9c" : "gray.50"}
                                color={isSelected ? "white" : "gray.600"}
                                shadow={isSelected ? "md" : "none"}
                                _hover={!isSelected ? { borderColor: "#005a9c", bg: "blue.50", color: "#005a9c" } : {}}
                              >
                                <Text as="span" fontSize="base" lineHeight={1}>{CATEGORY_ICONS[cat.value]}</Text>
                                <Text as="span" flex={1} lineHeight="tight">{cat.label}</Text>
                                {isSelected && (
                                  <Icon ml="auto" flexShrink={0} color="white"><LuCheck /></Icon>
                                )}
                              </Box>
                            );
                          })}
                        </Grid>

                        {/* Footer */}
                        <Flex align="center" justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.100">
                          <Text fontSize="xs" color="gray.400">
                            Activo:{" "}
                            <Text as="span" fontWeight="semibold" color="gray.700">
                              {currentCat?.label ?? "â€”"}
                            </Text>
                          </Text>
                          <Button
                            onClick={() => handleSave(seccion.key)}
                            disabled={isSaving}
                            size="sm"
                            px={5}
                            borderRadius="xl"
                            fontWeight="semibold"
                            bg={isSaved ? "green.500" : "linear-gradient(135deg, #005a9c 0%, #003d6b 100%)"}
                            color="white"
                            shadow="md"
                            transition="all 0.2s"
                            _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
                            _active={{ transform: "scale(0.97)" }}
                          >
                            {isSaving ? (
                              <Flex align="center" gap={2}>
                                <Spinner size="xs" color="white" />
                                Guardando...
                              </Flex>
                            ) : isSaved ? (
                              <Flex align="center" gap={2}>
                                <Icon><LuCheck /></Icon>
                                Guardado
                              </Flex>
                            ) : (
                              <Flex align="center" gap={2}>
                                <Icon><LuSave /></Icon>
                                Guardar
                              </Flex>
                            )}
                          </Button>
                        </Flex>
                      </Box>
                    </Box>
                  </GridItem>
                );
              })}
            </Grid>

            {/* SecciÃ³n de preview */}
            <Box>
              <Flex align="center" gap={3} mb={4}>
                <Box bg="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" p={2} borderRadius="lg" shadow="md">
                  <Icon fontSize="lg" color="white"><LuEye /></Icon>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.900" fontSize="md">Vista previa de la pÃ¡gina</Text>
                  <Text fontSize="xs" color="gray.400">Se actualiza en tiempo real al cambiar la selecciÃ³n</Text>
                </Box>
              </Flex>
              <PreviewPanel config={config} imagenes={imagenes} />
            </Box>
          </>
        )}
      </Container>
    </ChakraProvider>
  );
}
