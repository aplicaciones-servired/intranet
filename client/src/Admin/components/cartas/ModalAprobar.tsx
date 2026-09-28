import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Icon,
  Text,
  Flex,
  HStack,
  VStack,
  Spinner,
  ChakraProvider,
  defaultSystem,
} from "@chakra-ui/react";
import { LuCheck, LuEye, LuX } from "react-icons/lu";
import type { CartaLaboral } from "../../../services/carta_laboral.service";
import { getVistaPreviaCartaLaboral } from "../../../services/carta_laboral.service";
import { sueldoALetras } from "../../../utils/sueldoALetras";
import { tipo_contrato } from "../../../utils/const";

interface Props {
  carta: CartaLaboral;
  onConfirm: (sueldo: string, observaciones: string, fechaIngreso: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function ModalAprobar({ carta, onConfirm, onCancel, submitting }: Props) {
  const [sueldo, setSueldo] = useState(carta.sueldo || "");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState(carta.observaciones || "");
  const [fechaIngreso, setFechaIngreso] = useState(carta.fecha_ingreso ? carta.fecha_ingreso.slice(0, 10) : "");
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tipoContrato, setTipoContrato] = useState<string | null>(null);
  const datosCompletos = !!sueldo.trim() && !!fechaIngreso;

  const onChangeMonto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMonto(raw);
    const numero = Number(raw.replace(",", "."));
    if (raw !== "" && Number.isFinite(numero) && numero > 0) {
      setSueldo(sueldoALetras(numero));
    } else {
      setSueldo("");
    }
  };

  // Liberar el objeto URL del blob al desmontar el modal
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const abrirVistaPrevia = async () => {
    setPreviewOpen(true);
    setPreviewError(null);
    setPreviewUrl(null);
    setPreviewing(true);
    try {
      const blob = await getVistaPreviaCartaLaboral(carta.id, {
        sueldo: sueldo.trim(),
        fecha_ingreso: fechaIngreso,
        contrato: tipoContrato || "",
      });
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setPreviewError("No se pudo generar la vista previa. Intenta de nuevo.");
    } finally {
      setPreviewing(false);
    }
  };

  const cerrarVistaPrevia = () => {
    setPreviewOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <Box position="fixed" inset={0} zIndex={50} display="flex" alignItems="center" justifyContent="center" p={4} bg="blackAlpha.600" backdropFilter="blur(4px)">
      <ChakraProvider value={defaultSystem}>
        <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="480px" maxHeight="calc(100vh - 2rem)" display="flex" flexDirection="column" overflow="hidden">
          <Box bg="linear-gradient(135deg, #005a9c 0%, #003d6b 100%)" px={6} py={4} flexShrink={0}>
            <Text fontSize="lg" fontWeight="bold" color="white">Aprobar carta laboral</Text>
            <Text fontSize="sm" color="whiteAlpha.800">{carta.nombre_completo} -- {carta.cargo}</Text>
          </Box>
          <Box p={6} overflowY="auto" flex={1}>
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
                  Tipo Contrato <Text as="span" color="red.500">*</Text>
                </Text>
                <select
                  value={tipo_contrato.find((tipo) => tipo.value === tipoContrato)?.value || ""}
                  onChange={(e) => setTipoContrato(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                >
                  <option value="">Selecciona un tipo</option>
                  {tipo_contrato.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>

              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1.5}>
                  Salario mensual (n&uacute;meros) <Text as="span" color="red.500">*</Text>
                </Text>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Ej: 1750905"
                  value={monto}
                  onChange={onChangeMonto}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                />
                <Text fontSize="xs" color="gray.400" mt={1}>Se convierte autom&aacute;ticamente a letras</Text>
                <Text fontSize="xs" color="gray.500" mt={3} mb={1}>Resultado en letras (editable)</Text>
                <textarea
                  rows={3}
                  placeholder="Escribe el sueldo en letras..."
                  value={sueldo}
                  onChange={(e) => setSueldo(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", outline: "none", fontSize: "14px", resize: "none", boxSizing: "border-box" }}
                />
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
              <Button flex={1} variant="outline" borderRadius="xl" onClick={onCancel} disabled={submitting || previewing}>Cancelar</Button>
              <Button
                flex={1}
                variant="outline"
                borderColor="blue.300"
                color="blue.600"
                borderRadius="xl"
                disabled={submitting || !datosCompletos}
                onClick={abrirVistaPrevia}
              >
                <Icon mr={2}><LuEye /></Icon>Vista previa
              </Button>
              <Button
                flex={2}
                bg="green.500" color="white" borderRadius="xl"
                _hover={{ bg: "green.600" }}
                disabled={submitting || previewing || !datosCompletos}
                onClick={() => onConfirm(sueldo, observaciones, fechaIngreso)}
                loading={submitting}
              >
                <Icon mr={2}><LuCheck /></Icon>Aprobar y enviar
              </Button>
            </HStack>
          </Box>
        </Box>

        {/* Diálogo de vista previa (sobre el modal de aprobar) */}
        {previewOpen && (
          <Box position="fixed" inset={0} zIndex={60} display="flex" alignItems="center" justifyContent="center" p={6} bg="blackAlpha.700" backdropFilter="blur(4px)">
            <Box bg="white" borderRadius="2xl" shadow="2xl" w="full" maxW="820px" h="88vh" overflow="hidden" display="flex" flexDirection="column">
              <Flex justify="space-between" align="center" px={6} py={4} borderBottom="1px solid" borderColor="gray.100">
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">Vista previa de la carta laboral</Text>
                  <Text fontSize="xs" color="gray.500">{carta.nombre_completo} — {carta.cargo}</Text>
                </Box>
                <HStack gap={2}>
                  <Button size="sm" variant="outline" borderRadius="lg" onClick={cerrarVistaPrevia} disabled={previewing}>
                    Cerrar
                  </Button>
                  <Button size="sm" variant="ghost" borderRadius="lg" aria-label="Cerrar vista previa" onClick={cerrarVistaPrevia} disabled={previewing}>
                    <LuX />
                  </Button>
                </HStack>
              </Flex>
              <Box flex={1} position="relative" bg="gray.100">
                {previewError ? (
                  <Flex h="full" align="center" justify="center" direction="column" gap={3}>
                    <Text color="red.600" fontSize="sm">{previewError}</Text>
                    <Button size="sm" colorPalette="blue" onClick={abrirVistaPrevia}>Reintentar</Button>
                  </Flex>
                ) : previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Vista previa de la carta laboral"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                ) : (
                  <Flex h="full" align="center" justify="center" gap={3}>
                    <Spinner size="lg" color="blue.500" />
                    <Text color="gray.500" fontSize="sm">Generando PDF...</Text>
                  </Flex>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </ChakraProvider>
    </Box>
  );
}
