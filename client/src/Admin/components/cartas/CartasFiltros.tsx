import { Flex, Button, Badge } from "@chakra-ui/react";
import type { EstadoCarta } from "../../../services/carta_laboral.service";

type FiltroType = EstadoCarta | "todos";

interface Counts {
  todos: number;
  pendiente: number;
  aprobado: number;
  rechazado: number;
}

interface Props {
  filtro: FiltroType;
  counts: Counts;
  onChange: (f: FiltroType) => void;
}

export function CartasFiltros({ filtro, counts, onChange }: Props) {
  return (
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
            onClick={() => onChange(f)}
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
  );
}
