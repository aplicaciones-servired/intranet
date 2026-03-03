import { useState } from "react";
import {
  Box,
  Button,
  Icon,
  Text,
  HStack,
  ChakraProvider,
  defaultSystem,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import type { CartaLaboral } from "../../../services/carta_laboral.service";

interface Props {
  carta: CartaLaboral;
  onConfirm: (observaciones: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ModalRechazar({ carta, onConfirm, onCancel, submitting }: Props) {
  const [observaciones, setObservaciones] = useState("");

  return (
    <Box position="fixed" inset={0} zIndex={50} display="flex" alignItems="center" justifyContent="center" p={4} bg="blackAlpha.600" backdropFilter="blur(4px)">
      <ChakraProvider value={defaultSystem}>
        <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="440px" overflow="hidden">
          <Box bg="red.500" px={6} py={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">Rechazar solicitud</Text>
            <Text fontSize="sm" color="whiteAlpha.800">De {carta.nombre_completo}</Text>
          </Box>
          <Box p={6}>
            <Box mb={4}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>Motivo del rechazo (opcional)</Text>
              <textarea
                rows={4}
                placeholder="Indica el motivo del rechazo..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", resize: "none", boxSizing: "border-box" }}
              />
            </Box>
            <HStack gap={3}>
              <Button flex={1} variant="outline" borderRadius="xl" onClick={onCancel} disabled={submitting}>Cancelar</Button>
              <Button
                flex={1} bg="red.500" color="white" borderRadius="xl"
                _hover={{ bg: "red.600" }}
                disabled={submitting}
                onClick={() => onConfirm(observaciones)}
                loading={submitting}
              >
                <Icon mr={2}><LuX /></Icon>Rechazar
              </Button>
            </HStack>
          </Box>
        </Box>
      </ChakraProvider>
    </Box>
  );
}
