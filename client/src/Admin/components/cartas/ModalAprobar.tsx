import { useState } from "react";
import {
  Box,
  Button,
  Icon,
  Text,
  Flex,
  HStack,
  VStack,
  ChakraProvider,
  defaultSystem,
} from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import type { CartaLaboral } from "../../../services/carta_laboral.service";

interface Props {
  carta: CartaLaboral;
  onConfirm: (sueldo: string, observaciones: string, fechaIngreso: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ModalAprobar({ carta, onConfirm, onCancel, submitting }: Props) {
  const [sueldo, setSueldo] = useState(carta.sueldo || "");
  const [observaciones, setObservaciones] = useState(carta.observaciones || "");
  const [fechaIngreso, setFechaIngreso] = useState(carta.fecha_ingreso ? carta.fecha_ingreso.slice(0, 10) : "");

  return (
    <Box position="fixed" inset={0} zIndex={50} display="flex" alignItems="center" justifyContent="center" p={4} bg="blackAlpha.600" backdropFilter="blur(4px)">
      <ChakraProvider value={defaultSystem}>
        <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="480px" overflow="hidden">
          <Box bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" px={6} py={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">Aprobar carta laboral</Text>
            <Text fontSize="sm" color="whiteAlpha.800">{carta.nombre_completo} -- {carta.cargo}</Text>
          </Box>
          <Box p={6}>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>
                  Fecha de ingreso <Text as="span" color="red.500">*</Text>
                </Text>
                <input
                  type="date"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>
                  Salario mensual <Text as="span" color="red.500">*</Text>
                </Text>
                <input
                  type="text"
                  placeholder="Ej: UN MILLON TRESCIENTOS MIL PESOS ($1.300.000)"
                  value={sueldo}
                  onChange={(e) => setSueldo(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
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
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", resize: "none", boxSizing: "border-box" }}
                />
              </Box>
              <Box p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.700">
                  Al aprobar se generara el PDF y se enviara al correo&nbsp;<strong>{carta.correo}</strong>
                </Text>
              </Box>
            </VStack>
            <HStack gap={3} mt={6}>
              <Button flex={1} variant="outline" borderRadius="xl" onClick={onCancel} disabled={submitting}>Cancelar</Button>
              <Button
                flex={1} bg="green.500" color="white" borderRadius="xl"
                _hover={{ bg: "green.600" }}
                disabled={submitting || !sueldo.trim() || !fechaIngreso}
                onClick={() => onConfirm(sueldo, observaciones, fechaIngreso)}
                loading={submitting}
              >
                <Icon mr={2}><LuCheck /></Icon>Aprobar y enviar
              </Button>
            </HStack>
          </Box>
        </Box>
      </ChakraProvider>
    </Box>
  );
}
