import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Icon,
  Text,
  Flex,
  Container,
  Spinner,
  ChakraProvider,
  defaultSystem,
  Badge,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  LuClipboardList,
  LuCheck,
  LuX,
  LuTrash2,
  LuMail,
  LuUser,
  LuBriefcase,
  LuBuilding2,
  LuDollarSign,
  LuClock,
  LuCalendarCheck,
} from "react-icons/lu";
import Toast from "../Toast";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import {
  getCartasLaborales,
  aprobarCartaLaboral,
  rechazarCartaLaboral,
  deleteCartaLaboral,
  type CartaLaboral,
  type EstadoCarta,
} from "../../../services/carta_laboral.service";

type ModalType = "aprobar" | "rechazar" | null;

const ESTADO_CONFIG: Record<EstadoCarta, { color: string; label: string; chakra: string }> = {
  pendiente: { color: "#f59e0b", label: "Pendiente", chakra: "yellow" },
  aprobado:  { color: "#22c55e", label: "Aprobado",  chakra: "green"  },
  rechazado: { color: "#ef4444", label: "Rechazado", chakra: "red"    },
};

export default function CartasLaboralesManager() {
  const [cartas, setCartas] = useState<CartaLaboral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" } | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCarta, setSelectedCarta] = useState<CartaLaboral | null>(null);
  const [sueldo, setSueldo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<CartaLaboral | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filtro, setFiltro] = useState<EstadoCarta | "todos">("todos");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getCartasLaborales();
      setCartas(data);
    } catch {
      setLoadError("No se pudo conectar con el servidor. Verifica que el backend este corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAprobar = (carta: CartaLaboral) => {
    setSelectedCarta(carta);
    setSueldo(carta.sueldo || "");
    setObservaciones(carta.observaciones || "");
    setModalType("aprobar");
  };

  const openRechazar = (carta: CartaLaboral) => {
    setSelectedCarta(carta);
    setObservaciones("");
    setModalType("rechazar");
  };

  const handleAprobar = async () => {
    if (!selectedCarta || !sueldo.trim()) return;
    setSubmitting(true);
    try {
      const res: any = await aprobarCartaLaboral(selectedCarta.id, { sueldo: sueldo.trim(), observaciones });
      const enviado = res?.emailEnviado ?? true;
      setToast({
        title: "Carta aprobada",
        description: enviado
          ? `Carta enviada al correo de ${selectedCarta.nombre_completo}`
          : "Aprobada, pero no se pudo enviar el correo. Revisa la configuracion SMTP.",
        type: enviado ? "success" : "warning",
      });
      setModalType(null);
      await loadData();
    } catch {
      setToast({ title: "Error", description: "No se pudo aprobar la solicitud", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!selectedCarta) return;
    setSubmitting(true);
    try {
      await rechazarCartaLaboral(selectedCarta.id, { observaciones });
      setToast({ title: "Solicitud rechazada", description: `Se rechazo la solicitud de ${selectedCarta.nombre_completo}`, type: "warning" });
      setModalType(null);
      await loadData();
    } catch {
      setToast({ title: "Error", description: "No se pudo rechazar la solicitud", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteCartaLaboral(confirmDelete.id);
      setToast({ title: "Eliminado", description: "Solicitud eliminada correctamente", type: "success" });
      setConfirmDelete(null);
      await loadData();
    } catch {
      setToast({ title: "Error", description: "No se pudo eliminar", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const cartasFiltradas = filtro === "todos" ? cartas : cartas.filter((c) => c.estado === filtro);
  const counts = {
    todos: cartas.length,
    pendiente: cartas.filter((c) => c.estado === "pendiente").length,
    aprobado:  cartas.filter((c) => c.estado === "aprobado").length,
    rechazado: cartas.filter((c) => c.estado === "rechazado").length,
  };

  if (loading) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="5xl" px={6} py={4}>
          <Flex justify="center" align="center" h="400px" direction="column" gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text fontSize="md" color="gray.600">Cargando solicitudes...</Text>
          </Flex>
        </Container>
      </ChakraProvider>
    );
  }

  if (loadError) {
    return (
      <ChakraProvider value={defaultSystem}>
        <Container maxW="5xl" px={6} py={4}>
          <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={6} textAlign="center">
            <Icon fontSize="3xl" color="red.500" mb={3}><LuClipboardList /></Icon>
            <Text fontSize="lg" fontWeight="bold" color="red.700" mb={2}>Error de conexion</Text>
            <Text color="red.600" fontSize="sm" mb={4}>{loadError}</Text>
            <Button onClick={loadData} colorPalette="red" size="sm" borderRadius="lg">Reintentar</Button>
          </Box>
        </Container>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="5xl" px={6} py={4}>
        {toast && <Toast title={toast.title} description={toast.description} type={toast.type} onClose={() => setToast(null)} />}

        {confirmDelete && (
          <ConfirmDialog
            title="Eliminar solicitud"
            description={`Seguro que deseas eliminar la solicitud de "${confirmDelete.nombre_completo}"? Esta accion no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        )}

        {/* Header */}
        <Flex align="center" gap={4} mb={8} justify="space-between">
          <Flex align="center" gap={3}>
            <Box bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" p={2.5} borderRadius="lg" display="inline-flex">
              <Icon fontSize="xl" color="white"><LuClipboardList /></Icon>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">Cartas Laborales</Text>
              <Text color="gray.500" fontSize="sm">Gestiona las solicitudes de cartas laborales</Text>
            </Box>
          </Flex>
          <Button onClick={loadData} size="sm" variant="outline" borderRadius="lg" color="gray.600">
            Actualizar
          </Button>
        </Flex>

        {/* Filtros */}
        <Flex gap={2} mb={6} flexWrap="wrap">
          {(["todos", "pendiente", "aprobado", "rechazado"] as const).map((f) => {
            const active = filtro === f;
            return (
              <Button
                key={f}
                size="sm"
                borderRadius="lg"
                variant={active ? "solid" : "outline"}
                bg={active ? "linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" : undefined}
                color={active ? "white" : "gray.600"}
                borderColor="gray.200"
                onClick={() => setFiltro(f)}
                _hover={{ transform: "translateY(-1px)" }}
                transition="all 0.15s"
              >
                {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                <Badge
                  ml={2} fontSize="10px"
                  bg={active ? "rgba(255,255,255,0.25)" : "gray.100"}
                  color={active ? "white" : "gray.600"}
                  borderRadius="full" px={2}
                >
                  {counts[f]}
                </Badge>
              </Button>
            );
          })}
        </Flex>

        {/* Lista */}
        {cartasFiltradas.length === 0 ? (
          <Box bg="white" borderRadius="xl" p={12} textAlign="center" border="2px dashed" borderColor="gray.300">
            <Icon fontSize="5xl" color="gray.300" mb={4}><LuClipboardList /></Icon>
            <Text fontSize="xl" fontWeight="bold" color="gray.600" mb={2}>
              No hay solicitudes{filtro !== "todos" ? ` con estado "${filtro}"` : ""}
            </Text>
            <Text color="gray.400" fontSize="sm">Las solicitudes enviadas desde el portal apareceran aqui</Text>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            {cartasFiltradas.map((carta) => {
              const estadoCfg = ESTADO_CONFIG[carta.estado];
              return (
                <Box
                  key={carta.id}
                  bg="white" borderRadius="xl" shadow="md"
                  border="1px solid" borderColor="gray.200" overflow="hidden"
                  transition="all 0.2s" _hover={{ shadow: "xl", transform: "translateY(-1px)" }}
                >
                  <Box h="4px" bg={estadoCfg.color} />
                  <Flex p={5} gap={4} align="flex-start" justify="space-between" flexWrap="wrap">
                    <Box flex={1} minW="240px">
                      <Flex align="center" gap={3} mb={3} flexWrap="wrap">
                        <Text fontWeight="bold" fontSize="lg" color="gray.900">{carta.nombre_completo}</Text>
                        <Badge colorPalette={estadoCfg.chakra} variant="subtle" borderRadius="full" px={3}>
                          {estadoCfg.label}
                        </Badge>
                      </Flex>
                      <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={2}>
                        <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                          <Icon color="gray.400"><LuUser /></Icon>
                          <Text>Cedula: <Text as="span" fontWeight="semibold">{carta.cedula}</Text></Text>
                        </Flex>
                        <Flex align="center" gap={2} fontSize="sm" color="gray.600" minW={0}>
                          <Icon color="gray.400" flexShrink={0}><LuMail /></Icon>
                          <Text truncate>{carta.correo}</Text>
                        </Flex>
                        <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                          <Icon color="gray.400"><LuBriefcase /></Icon>
                          <Text>{carta.cargo}</Text>
                        </Flex>
                        <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                          <Icon color="gray.400"><LuBuilding2 /></Icon>
                          <Text>{carta.empresa}</Text>
                        </Flex>
                        {carta.sueldo && (
                          <Flex align="center" gap={2} fontSize="sm" color="gray.600">
                            <Icon color="gray.400"><LuDollarSign /></Icon>
                            <Text>Sueldo: <Text as="span" fontWeight="semibold">{carta.sueldo}</Text></Text>
                          </Flex>
                        )}
                      </Box>
                      {carta.observaciones && (
                        <Box mt={3} p={3} bg="gray.50" borderRadius="lg" borderLeft="3px solid" borderColor="gray.300">
                          <Text fontSize="sm" color="gray.500" fontStyle="italic">"{carta.observaciones}"</Text>
                        </Box>
                      )}
                      <HStack mt={3} gap={4}>
                        {carta.fecha_solicitud && (
                          <Flex align="center" gap={1.5} fontSize="xs" color="gray.400">
                            <Icon><LuClock /></Icon>
                            <Text>Solicitado: {new Date(carta.fecha_solicitud).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</Text>
                          </Flex>
                        )}
                        {carta.fecha_aprobacion && (
                          <Flex align="center" gap={1.5} fontSize="xs" color="gray.400">
                            <Icon><LuCalendarCheck /></Icon>
                            <Text>Gestionado: {new Date(carta.fecha_aprobacion).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</Text>
                          </Flex>
                        )}
                      </HStack>
                    </Box>
                    <HStack gap={2} flexShrink={0} align="flex-start" pt={1}>
                      {carta.estado === "pendiente" && (
                        <>
                          <Button size="sm" bg="green.500" color="white" borderRadius="lg" _hover={{ bg: "green.600", transform: "translateY(-1px)" }} onClick={() => openAprobar(carta)}>
                            <Icon mr={1}><LuCheck /></Icon>Aprobar
                          </Button>
                          <Button size="sm" bg="red.500" color="white" borderRadius="lg" _hover={{ bg: "red.600", transform: "translateY(-1px)" }} onClick={() => openRechazar(carta)}>
                            <Icon mr={1}><LuX /></Icon>Rechazar
                          </Button>
                        </>
                      )}
                      {carta.estado === "aprobado" && (
                        <Button size="sm" variant="outline" borderRadius="lg" color="gray.600" onClick={() => openAprobar(carta)}>
                          Editar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" borderRadius="lg" color="gray.400" _hover={{ bg: "red.50", color: "red.500" }} onClick={() => setConfirmDelete(carta)}>
                        <Icon><LuTrash2 /></Icon>
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Container>

      {/* Modal Aprobar */}
      {modalType === "aprobar" && selectedCarta && (
        <Box position="fixed" inset={0} zIndex={50} display="flex" alignItems="center" justifyContent="center" p={4} bg="blackAlpha.600" backdropFilter="blur(4px)">
          <ChakraProvider value={defaultSystem}>
            <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="480px" overflow="hidden">
              <Box bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" px={6} py={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Aprobar carta laboral</Text>
                <Text fontSize="sm" color="whiteAlpha.800">{selectedCarta.nombre_completo} -- {selectedCarta.cargo}</Text>
              </Box>
              <Box p={6}>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>
                      Salario mensual <Text as="span" color="red.500">*</Text>
                    </Text>
                    <input
                      type="text"
                      placeholder="Ej: UN MILLON TRESCIENTOS MIL PESOS ($1.300.000)"
                      value={sueldo}
                      onChange={(e) => setSueldo(e.target.value)}
                      style={{ width:"100%", padding:"12px 16px", border:"2px solid #e5e7eb", borderRadius:"12px", outline:"none", fontSize:"14px", boxSizing:"border-box" }}
                    />
                    <Text fontSize="xs" color="gray.400" mt={1}>Escribe como aparecera en la carta</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>Observaciones internas (opcional)</Text>
                    <textarea
                      rows={3}
                      placeholder="Notas internas..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      style={{ width:"100%", padding:"12px 16px", border:"2px solid #e5e7eb", borderRadius:"12px", outline:"none", fontSize:"14px", resize:"none", boxSizing:"border-box" }}
                    />
                  </Box>
                  <Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <Text fontSize="xs" color="blue.700">
                      Al aprobar se generara el PDF y se enviara al correo&nbsp;<strong>{selectedCarta.correo}</strong>
                    </Text>
                  </Box>
                </VStack>
                <HStack gap={3} mt={6}>
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setModalType(null)} disabled={submitting}>Cancelar</Button>
                  <Button flex={1} bg="green.500" color="white" borderRadius="xl" _hover={{ bg:"green.600" }} disabled={submitting || !sueldo.trim()} onClick={handleAprobar} loading={submitting}>
                    <Icon mr={2}><LuCheck /></Icon>Aprobar y enviar
                  </Button>
                </HStack>
              </Box>
            </Box>
          </ChakraProvider>
        </Box>
      )}

      {/* Modal Rechazar */}
      {modalType === "rechazar" && selectedCarta && (
        <Box position="fixed" inset={0} zIndex={50} display="flex" alignItems="center" justifyContent="center" p={4} bg="blackAlpha.600" backdropFilter="blur(4px)">
          <ChakraProvider value={defaultSystem}>
            <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="440px" overflow="hidden">
              <Box bg="red.500" px={6} py={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Rechazar solicitud</Text>
                <Text fontSize="sm" color="whiteAlpha.800">De {selectedCarta.nombre_completo}</Text>
              </Box>
              <Box p={6}>
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>Motivo del rechazo (opcional)</Text>
                  <textarea
                    rows={4}
                    placeholder="Indica el motivo del rechazo..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    style={{ width:"100%", padding:"12px 16px", border:"2px solid #e5e7eb", borderRadius:"12px", outline:"none", fontSize:"14px", resize:"none", boxSizing:"border-box" }}
                  />
                </Box>
                <HStack gap={3}>
                  <Button flex={1} variant="outline" borderRadius="xl" onClick={() => setModalType(null)} disabled={submitting}>Cancelar</Button>
                  <Button flex={1} bg="red.500" color="white" borderRadius="xl" _hover={{ bg:"red.600" }} disabled={submitting} onClick={handleRechazar} loading={submitting}>
                    <Icon mr={2}><LuX /></Icon>Rechazar
                  </Button>
                </HStack>
              </Box>
            </Box>
          </ChakraProvider>
        </Box>
      )}
    </ChakraProvider>
  );
}
