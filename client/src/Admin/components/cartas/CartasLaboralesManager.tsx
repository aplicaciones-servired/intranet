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
  VStack,
} from "@chakra-ui/react";
import { LuClipboardList } from "react-icons/lu";
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
import { CartaCard } from "./CartaCard";
import { CartasFiltros } from "./CartasFiltros";
import { ModalAprobar } from "./ModalAprobar";
import { ModalRechazar } from "./ModalRechazar";

type ModalType = "aprobar" | "rechazar" | null;

export default function CartasLaboralesManager() {
  const [cartas, setCartas] = useState<CartaLaboral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string; type: "success" | "error" | "warning" } | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCarta, setSelectedCarta] = useState<CartaLaboral | null>(null);
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

  const handleAprobar = async (sueldo: string, observaciones: string) => {
    if (!selectedCarta) return;
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

  const handleRechazar = async (observaciones: string) => {
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

        <CartasFiltros filtro={filtro} counts={counts} onChange={setFiltro} />

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
            {cartasFiltradas.map((carta) => (
              <CartaCard
                key={carta.id}
                carta={carta}
                onAprobar={(c) => { setSelectedCarta(c); setModalType("aprobar"); }}
                onRechazar={(c) => { setSelectedCarta(c); setModalType("rechazar"); }}
                onDelete={setConfirmDelete}
              />
            ))}
          </VStack>
        )}
      </Container>

      {modalType === "aprobar" && selectedCarta && (
        <ModalAprobar
          carta={selectedCarta}
          onConfirm={handleAprobar}
          onCancel={() => setModalType(null)}
          submitting={submitting}
        />
      )}

      {modalType === "rechazar" && selectedCarta && (
        <ModalRechazar
          carta={selectedCarta}
          onConfirm={handleRechazar}
          onCancel={() => setModalType(null)}
          submitting={submitting}
        />
      )}
    </ChakraProvider>
  );
}
