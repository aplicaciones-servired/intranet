import { Grid } from "@chakra-ui/react";
import { LuCalendarClock, LuClock3, LuX } from "react-icons/lu";
import EstadoSubidasPanel from "./EstadoSubidasPanel";
import SubidaTipoList from "./SubidaTipoList";
import type { TipoSubidaAutomatica } from "../../../services/subida_automatica.service";
import type { SubidaTipoListProps } from "../../../types/subiaTypes";

interface SubidasEstadoGridProps {
  tipo: TipoSubidaAutomatica | null;
  pendientesCount: number;
  fallidasCount: number;
  procesadasCount: number;
  pendientesImagen: SubidaTipoListProps["items"];
  pendientesFormulario: SubidaTipoListProps["items"];
  fallidasImagen: SubidaTipoListProps["items"];
  fallidasFormulario: SubidaTipoListProps["items"];
  procesadasImagen: SubidaTipoListProps["items"];
  procesadasFormulario: SubidaTipoListProps["items"];
  listProps: Omit<
    SubidaTipoListProps,
    "items" | "tipoItem" | "modo"
  >;
}

export default function SubidasEstadoGrid({
  tipo,
  pendientesCount,
  fallidasCount,
  procesadasCount,
  pendientesImagen,
  pendientesFormulario,
  fallidasImagen,
  fallidasFormulario,
  procesadasImagen,
  procesadasFormulario,
  listProps,
}: SubidasEstadoGridProps) {
  const tipoSeleccionado = Boolean(tipo);

  if (!tipoSeleccionado) {
    return null;
  }

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        xl: "repeat(3, 1fr)",
      }}
      gap={6}
    >
      <EstadoSubidasPanel
        title="Pendientes de subir"
        count={pendientesCount}
        icon={<LuClock3 />}
        iconColor="orange.500"
        bg="linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)"
        borderColor="orange.100"
        tipoSeleccionado={tipoSeleccionado}
      >
        <SubidaTipoList
          {...listProps}
          items={tipo === "imagen" ? pendientesImagen : pendientesFormulario}
          tipoItem={tipo === "imagen" ? "imagen" : "formulario"}
          modo="pendiente"
        />
      </EstadoSubidasPanel>

      <EstadoSubidasPanel
        title="Fallidos"
        count={fallidasCount}
        icon={<LuX />}
        iconColor="red.500"
        bg="linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)"
        borderColor="red.100"
        tipoSeleccionado={tipoSeleccionado}
      >
        <SubidaTipoList
          {...listProps}
          items={tipo === "imagen" ? fallidasImagen : fallidasFormulario}
          tipoItem={tipo === "imagen" ? "imagen" : "formulario"}
          modo="fallido"
        />
      </EstadoSubidasPanel>

      <EstadoSubidasPanel
        title="Ya procesados"
        count={procesadasCount}
        icon={<LuCalendarClock />}
        iconColor="green.500"
        bg="linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%)"
        borderColor="green.100"
        tipoSeleccionado={tipoSeleccionado}
      >
        <SubidaTipoList
          {...listProps}
          items={tipo === "imagen" ? procesadasImagen : procesadasFormulario}
          tipoItem={tipo === "imagen" ? "imagen" : "formulario"}
          modo="procesado"
        />
      </EstadoSubidasPanel>
    </Grid>
  );
}
