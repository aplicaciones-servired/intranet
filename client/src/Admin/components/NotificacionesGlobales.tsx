import { Container, ChakraProvider, defaultSystem } from "@chakra-ui/react";
import NotificarButton from "./NotificarButton";
import { useState, useEffect } from "react";
import { obtenerNotificacionesPendientes, type NotificacionesPendientes } from "../../utils/notificacionesCache";

/**
 * Componente global que muestra el botón de notificación en todas las páginas del admin
 * Se sincroniza automáticamente con sessionStorage
 */
export default function NotificacionesGlobales() {
  const [pendientes, setPendientes] = useState<NotificacionesPendientes>({ imagenesIds: [], formularioIds: [] });

  // Cargar pendientes solo en el cliente y actualizar cada segundo
  useEffect(() => {
    setPendientes(obtenerNotificacionesPendientes());
    
    const interval = setInterval(() => {
      setPendientes(obtenerNotificacionesPendientes());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalPendientes = pendientes.imagenesIds.length + pendientes.formularioIds.length;

  // Solo mostrar si hay items pendientes
  if (totalPendientes === 0) {
    return null;
  }

  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="8xl" px={6} py={4}>
        <NotificarButton />
      </Container>
    </ChakraProvider>
  );
}
