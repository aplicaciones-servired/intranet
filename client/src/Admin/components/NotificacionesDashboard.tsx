import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ChakraProvider,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  defaultSystem,
} from "@chakra-ui/react";
import { LuBell, LuCircleX, LuEye, LuExternalLink, LuMousePointerClick, LuRefreshCcw, LuUserCheck } from "react-icons/lu";
import { getNotificacionesMetrics, type NotificacionMetricsResponse, type NotificacionTopItem } from "../../services/notificacionAdmin.service";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={4} shadow="sm">
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="gray.600" fontWeight="600">{label}</Text>
        <Box color={color}>{icon}</Box>
      </HStack>
      <Text fontSize="2xl" fontWeight="bold" color="gray.900">{value.toLocaleString("es-CO")}</Text>
    </Box>
  );
}

function TopTable({
  title,
  items,
  metricKey,
}: {
  title: string;
  items: NotificacionTopItem[];
  metricKey: "shown_count" | "clicked_count";
}) {
  return (
    <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.200" shadow="md" overflow="hidden">
      <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
        <Heading size="sm" color="gray.900">{title}</Heading>
        <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2}>{items.length}</Badge>
      </Flex>

      {items.length === 0 ? (
        <Text px={5} py={6} color="gray.500" fontSize="sm">Sin datos todavía.</Text>
      ) : (
        <Box>
          {items.map((item, index) => {
            const previewUrl = String(item.preview_image_url || "").trim();
            const totalItems = Math.max(Number(item.cantidad || 1), 1);
            const extraItems = Math.max(totalItems - 1, 0);
            return (
            <Flex
              key={`${title}-${item.id}-${index}`}
              px={5}
              py={3}
              borderBottom={index === items.length - 1 ? "none" : "1px solid"}
              borderColor="gray.100"
              align="center"
              gap={3}
            >
              <Box minW="28px" h="28px" borderRadius="full" bg="gray.100" color="gray.700" fontSize="xs" fontWeight="bold" display="flex" alignItems="center" justifyContent="center">
                {index + 1}
              </Box>
              <Box
                w="42px"
                h="42px"
                minW="42px"
                borderRadius="md"
                overflow="hidden"
                position="relative"
                border="1px solid"
                borderColor="gray.200"
                bg="gray.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={item.titulo}
                    w="full"
                    h="full"
                    objectFit="cover"
                    loading="lazy"
                  />
                ) : (
                  <Text fontSize="xs" color="gray.400">N/A</Text>
                )}
                {extraItems > 0 ? (
                  <Badge
                    position="absolute"
                    top="-7px"
                    right="-7px"
                    colorPalette="blue"
                    borderRadius="full"
                    px={1.5}
                    py={0.5}
                    fontSize="10px"
                    lineHeight="1"
                    boxShadow="sm"
                  >
                    +{extraItems}
                  </Badge>
                ) : null}
              </Box>
              <Box flex={1} minW={0}>
                <Text fontSize="sm" color="gray.900" fontWeight="600" lineClamp={1}>{item.titulo}</Text>
                <Text fontSize="xs" color="gray.500">{item.categoria} · {item.tipo} · {totalItems} item{totalItems > 1 ? "s" : ""}</Text>
              </Box>
              <HStack gap={2}>
                <Badge colorPalette="purple" variant="subtle" px={2} borderRadius="full">
                  {item[metricKey]}
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => window.open(item.url_destino, "_blank", "noopener,noreferrer")}
                >
                  <LuExternalLink />
                </Button>
              </HStack>
            </Flex>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default function NotificacionesDashboard() {
  const [data, setData] = useState<NotificacionMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotificacionesMetrics();
      setData(response);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudieron cargar las métricas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ctr = useMemo(() => {
    if (!data || data.shown === 0) return 0;
    return Number(((data.clicked / data.shown) * 100).toFixed(2));
  }, [data]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="7xl" px={6} py={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={7} direction={{ base: "column", md: "row" }} gap={3}>
          <HStack gap={3}>
            <Box p={3} borderRadius="xl" bg="linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" color="white" shadow="md">
              <LuBell />
            </Box>
            <Box>
              <Heading size="lg" color="gray.900">Analítica de Notificaciones</Heading>
              <Text fontSize="sm" color="gray.600">Más vistas, clics y rendimiento general del canal de avisos.</Text>
            </Box>
          </HStack>
          <Button onClick={load} variant="outline" borderRadius="xl" disabled={loading} bg={"blue.500"} _hover={{bg:"teal.500"}} color="white"  aria-label="Actualizar métricas">
            <LuRefreshCcw />
            Actualizar
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" py={20} direction="column" gap={4}>
            <Spinner size="xl" color="#2563eb" />
            <Text fontSize="sm" color="gray.500">Cargando métricas...</Text>
          </Flex>
        ) : error ? (
          <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={4}>
            <Text color="red.700" fontWeight="600">{error}</Text>
          </Box>
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(6, 1fr)" }} gap={4} mb={6}>
              <StatCard label="Total" value={data?.total || 0} icon={<LuBell />} color="#2563eb" />
              <StatCard label="Mostradas" value={data?.shown || 0} icon={<LuEye />} color="#0f766e" />
              <StatCard label="Abiertas" value={data?.opened || 0} icon={<LuUserCheck />} color="#047857" />
              <StatCard label="Clics" value={data?.clicked || 0} icon={<LuMousePointerClick />} color="#7c3aed" />
              <StatCard label="Descartadas" value={data?.dismissed || 0} icon={<LuCircleX />} color="#b91c1c" />
              <StatCard label="CTR %" value={ctr} icon={<LuBell />} color="#1d4ed8" />
            </Grid>

            <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
              <TopTable title="Top Más Vistas" items={data?.topVistas || []} metricKey="shown_count" />
              <TopTable title="Top Más Clickeadas" items={data?.topClicks || []} metricKey="clicked_count" />
            </Grid>
          </>
        )}
      </Container>
    </ChakraProvider>
  );
}
