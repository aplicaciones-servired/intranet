import {
  Box,
  Button,
  Icon,
  Text,
  Flex,
  Badge,
  HStack,
} from "@chakra-ui/react";
import {
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
import type { CartaLaboral, EstadoCarta } from "../../../services/carta_laboral.service";

const ESTADO_CONFIG: Record<EstadoCarta, { color: string; label: string; chakra: string }> = {
  pendiente: { color: "#f59e0b", label: "Pendiente", chakra: "yellow" },
  aprobado:  { color: "#22c55e", label: "Aprobado",  chakra: "green"  },
  rechazado: { color: "#ef4444", label: "Rechazado", chakra: "red"    },
};

interface Props {
  carta: CartaLaboral;
  onAprobar: (carta: CartaLaboral) => void;
  onRechazar: (carta: CartaLaboral) => void;
  onDelete: (carta: CartaLaboral) => void;
}

export function CartaCard({ carta, onAprobar, onRechazar, onDelete }: Props) {
  const estadoCfg = ESTADO_CONFIG[carta.estado];

  return (
    <Box
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
              <Button size="sm" bg="green.500" color="white" borderRadius="lg" _hover={{ bg: "green.600", transform: "translateY(-1px)" }} onClick={() => onAprobar(carta)}>
                <Icon mr={1}><LuCheck /></Icon>Aprobar
              </Button>
              <Button size="sm" bg="red.500" color="white" borderRadius="lg" _hover={{ bg: "red.600", transform: "translateY(-1px)" }} onClick={() => onRechazar(carta)}>
                <Icon mr={1}><LuX /></Icon>Rechazar
              </Button>
            </>
          )}
          {carta.estado === "aprobado" && (
            <Button size="sm" variant="outline" borderRadius="lg" color="gray.600" onClick={() => onAprobar(carta)}>
              Editar
            </Button>
          )}
          <Button size="sm" variant="ghost" borderRadius="lg" color="gray.400" _hover={{ bg: "red.50", color: "red.500" }} onClick={() => onDelete(carta)}>
            <Icon><LuTrash2 /></Icon>
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
