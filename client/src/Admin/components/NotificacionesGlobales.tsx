import { Box, Container, Button, Text as ChakraText, ChakraProvider, defaultSystem } from "@chakra-ui/react";
import NotificarButton from "./NotificarButton";
import { useState, useEffect } from "react";
import { obtenerNotificacionesPendientes, agregarImagenesPendientes, type NotificacionesPendientes } from "../../utils/notificacionesCache";

/**
 * Componente global que muestra el botón de notificación en todas las páginas del admin
 * Se sincroniza automáticamente con sessionStorage
 */
export default function NotificacionesGlobales() {
  const [actualizador, setActualizador] = useState(0);
  const [pendientes, setPendientes] = useState<NotificacionesPendientes>({ imagenesIds: [], formularioIds: [] });

  // Cargar pendientes solo en el cliente
  useEffect(() => {
    console.log('🌐 NotificacionesGlobales: Componente montado');
    
    // Cargar initial
    const inicial = obtenerNotificacionesPendientes();
    console.log('🌐 NotificacionesGlobales: Pendientes iniciales:', inicial);
    setPendientes(inicial);
    
    // Actualizar cada segundo para detectar cambios
    const interval = setInterval(() => {
      const actualizados = obtenerNotificacionesPendientes();
      console.log('🌐 NotificacionesGlobales: Actualizando pendientes:', actualizados);
      setPendientes(actualizados);
    }, 1000);

    return () => {
      console.log('🌐 NotificacionesGlobales: Componente desmontado');
      clearInterval(interval);
    };
  }, []);

  const totalPendientes = pendientes.imagenesIds.length + pendientes.formularioIds.length;
  console.log('🌐 NotificacionesGlobales: Total pendientes =', totalPendientes);

  // SIEMPRE mostrar algo para depuración
  return (
    <ChakraProvider value={defaultSystem}>
      <Container maxW="8xl" px={6} py={4}>
        {/* Panel de depuración - TEMPORAL */}
        <Box mb={4} p={4} bg="yellow.50" border="2px dashed" borderColor="yellow.400" borderRadius="lg">
          <ChakraText fontSize="xs" fontWeight="bold" color="yellow.900" mb={2}>
            🐛 DEBUG - NotificacionesGlobales
          </ChakraText>
          <ChakraText fontSize="xs" color="yellow.800" mb={2}>
            Total pendientes: {totalPendientes} | 
            Imágenes: {pendientes.imagenesIds.length} {JSON.stringify(pendientes.imagenesIds)} | 
            Formularios: {pendientes.formularioIds.length} {JSON.stringify(pendientes.formularioIds)}
          </ChakraText>
          <Button 
            size="xs" 
            colorScheme="yellow" 
            onClick={() => {
              console.log('🧪 Prueba: Agregando IDs de prueba');
              agregarImagenesPendientes([999, 888, 777]);
            }}
          >
            🧪 Agregar IDs de Prueba
          </Button>
        </Box>
        
        {/* Botón de notificación */}
        {totalPendientes > 0 ? (
          <NotificarButton />
        ) : (
          <Box p={4} bg="gray.50" borderRadius="lg" textAlign="center">
            <ChakraText fontSize="sm" color="gray.600">
              No hay items pendientes de notificación. Sube una imagen para ver el botón aparecer aquí.
            </ChakraText>
          </Box>
        )}
      </Container>
    </ChakraProvider>
  );
}
