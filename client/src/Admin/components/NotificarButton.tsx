import { Box, Button, Icon, Text, Flex, Badge } from "@chakra-ui/react"
import { LuBell, LuMail, LuCheck } from "react-icons/lu"
import { useState, useEffect } from "react"
import { 
  obtenerNotificacionesPendientes, 
  limpiarNotificacionesPendientes,
  type NotificacionesPendientes
} from "../../utils/notificacionesCache";
import Toast from "./Toast";

interface NotificarButtonProps {
  imagenesIds?: number[];
  formularioIds?: number[];
  onNotificacionEnviada?: () => void;
}

export default function NotificarButton({ 
  imagenesIds: imagenesIdsProp = [], 
  formularioIds: formularioIdsProp = [], 
  onNotificacionEnviada 
}: NotificarButtonProps) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    title: "",
    description: "",
    type: "success" as "success" | "error" | "warning"
  });
  
  // Inicializar vacío, cargar en useEffect
  const [pendientes, setPendientes] = useState<NotificacionesPendientes>({
    imagenesIds: [],
    formularioIds: []
  });

  // Sincronizar con sessionStorage solo en el cliente
  useEffect(() => {
    // Cargar inicial
    setPendientes(obtenerNotificacionesPendientes());
    
    // Actualizar cada segundo
    const interval = setInterval(() => {
      setPendientes(obtenerNotificacionesPendientes());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Usar los IDs de sessionStorage en lugar de las props
  const imagenesIds = pendientes.imagenesIds;
  const formularioIds = pendientes.formularioIds;
  const totalItems = imagenesIds.length + formularioIds.length;

  const handleNotificar = async () => {
    if (totalItems === 0) return;

    setEnviando(true);
    try {
      // Importar dinámicamente el servicio
      const { notificarSubida } = await import("../../services/imagen.service");
      
      await notificarSubida(imagenesIds, formularioIds);
      
      // Mostrar toast ANTES de limpiar (para guardar el total)
      setToastConfig({
        title: "¡Notificación enviada!",
        description: `Se notificó exitosamente ${totalItems} ${totalItems === 1 ? 'item' : 'items'} a todos los usuarios.`,
        type: "success"
      });
      setShowToast(true);
      console.log("✅ Toast de éxito activado - La notificación se envió correctamente");
      
      // Limpiar el storage después de mostrar el toast
      limpiarNotificacionesPendientes();
      setPendientes({ imagenesIds: [], formularioIds: [] });
      
      setEnviado(true);
      
      setTimeout(() => {
        setEnviado(false);
        setShowToast(false);
      }, 5000);
      
      if (onNotificacionEnviada) {
        onNotificacionEnviada();
      }
    } catch (error) {
      console.error("❌ Error al notificar:", error);
      setToastConfig({
        title: "Error al notificar",
        description: "No se pudo enviar la notificación. Por favor, intenta nuevamente.",
        type: "error"
      });
      setShowToast(true);
      console.log("⚠️ Toast de error activado - La notificación falló");
      setTimeout(() => setShowToast(false), 20000);
    } finally {
      setEnviando(false);
    }
  };

  // Mostrar el Toast si está activo, incluso si no hay items
  if (showToast) {
    return (
      <Toast
        title={toastConfig.title}
        description={toastConfig.description}
        type={toastConfig.type}
        onClose={() => setShowToast(false)}
      />
    );
  }

  // Si no hay IDs y no hay toast, no mostrar nada
  if (totalItems === 0) {
    return null;
  }

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      shadow="xl"
      border="1px solid"
      borderColor="gray.200"
      p={6}
      mt={6}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
        <Flex alignItems="center" gap={4}>
          <Box
            bg={enviado ? "green.500" : "orange.500"}
            p={3}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.3s"
          >
            <Icon fontSize="2xl" color="white">
              {enviado ? <LuCheck /> : <LuBell />}
            </Icon>
          </Box>
          <Box>
            <Flex alignItems="center" gap={2} mb={1}>
              <Text fontSize="lg" fontWeight="bold" color="gray.900">
                {enviado ? "¡Notificación enviada!" : "Contenido listo para notificar"}
              </Text>
              <Badge
                colorScheme={enviado ? "green" : "orange"}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {totalItems} {totalItems === 1 ? "item" : "items"}
                {imagenesIds.length > 0 && ` (${imagenesIds.length} img)`}
                {formularioIds.length > 0 && ` (${formularioIds.length} form)`}
              </Badge>
            </Flex>
            <Text fontSize="sm" color="gray.600">
              {enviado 
                ? "Los correos han sido enviados exitosamente a todos los destinatarios"
                : "Envía un correo de notificación a todos los usuarios"
              }
            </Text>
          </Box>
        </Flex>

        {!enviado && (
          <Button
            onClick={handleNotificar}
            disabled={enviando}
            size="lg"
            px={8}
            py={6}
            bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            color="white"
            fontSize="md"
            fontWeight="bold"
            borderRadius="xl"
            shadow="lg"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-2px)",
              shadow: "xl",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
            }}
          >
            <Icon fontSize="xl" mr={2}>
              <LuMail />
            </Icon>
            {enviando ? "Enviando..." : "Notificar Ahora"}
          </Button>
        )}

        {enviado && (
          <Flex
            alignItems="center"
            gap={2}
            px={4}
            py={2}
            bg="green.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="green.200"
          >
            <Icon fontSize="lg" color="green.600">
              <LuCheck />
            </Icon>
            <Text fontSize="sm" fontWeight="semibold" color="green.700">
              Enviado correctamente
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
