import type { ReactNode } from "react";
import type { SubidaAutomatica, TipoSubidaAutomatica } from "../services/subida_automatica.service";

export interface SubidaTipoListProps {
  items: SubidaAutomatica[];
  tipoItem: TipoSubidaAutomatica;
  modo: "pendiente" | "fallido" | "procesado";
  editingId: number | null;
  savingEdit: boolean;
  onStartEdit: (item: SubidaAutomatica) => void;
  onCancelEdit: () => void;
  onSaveEdit: (item: SubidaAutomatica) => void;
  editProgramadoPara: string;
  setEditProgramadoPara: (value: string) => void;
  editCorreosDestino: string;
  setEditCorreosDestino: (value: string) => void;
  editTitulo: string;
  setEditTitulo: (value: string) => void;
  editCategoria: string;
  setEditCategoria: (value: string) => void;
  editUrl: string;
  setEditUrl: (value: string) => void;
  editDescripcion: string;
  setEditDescripcion: (value: string) => void;
  editImages: File[];
  setEditImages: (files: File[]) => void;
  editFormImage: File | null;
  setEditFormImage: (file: File | null) => void;
}


export interface EstadoSubidasPanelProps {
  title: string;
  count: number;
  icon: ReactNode;
  iconColor: string;
  bg: string;
  borderColor: string;
  tipoSeleccionado: boolean;
  children: ReactNode;
}
