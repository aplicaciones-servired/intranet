import { DataTypes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export type NotificacionTipo = "imagen" | "formulario" | "mixto";
export type NotificacionPrioridad = "baja" | "media" | "alta";
export type NotificacionEstado = "publicada" | "archivada";
export type NotificacionDigest = "ninguno" | "diario" | "semanal";

export interface NotificacionAttributes {
  id?: number;
  tipo: NotificacionTipo;
  prioridad: NotificacionPrioridad;
  estado: NotificacionEstado;
  digest: NotificacionDigest;
  titulo: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  imagen_ids?: number[];
  formulario_ids?: number[];
  url_destino: string;
  preview_image_url?: string;
  audiencia?: Record<string, any>;
  metadata?: Record<string, any>;
  enviada_correo: boolean;
  correos_destino?: string;
  fecha_publicacion?: Date;
  fecha_envio_correo?: Date;
  shown_count: number;
  opened_count: number;
  clicked_count: number;
  dismissed_count: number;
}

export class NotificacionModel extends Model<NotificacionAttributes> implements NotificacionAttributes {
  public id!: number;
  public tipo!: NotificacionTipo;
  public prioridad!: NotificacionPrioridad;
  public estado!: NotificacionEstado;
  public digest!: NotificacionDigest;
  public titulo!: string;
  public descripcion?: string;
  public categoria!: string;
  public cantidad!: number;
  public imagen_ids?: number[];
  public formulario_ids?: number[];
  public url_destino!: string;
  public preview_image_url?: string;
  public audiencia?: Record<string, any>;
  public metadata?: Record<string, any>;
  public enviada_correo!: boolean;
  public correos_destino?: string;
  public fecha_publicacion!: Date;
  public fecha_envio_correo?: Date;
  public shown_count!: number;
  public opened_count!: number;
  public clicked_count!: number;
  public dismissed_count!: number;
}

NotificacionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("imagen", "formulario", "mixto"),
      allowNull: false,
      defaultValue: "imagen",
    },
    prioridad: {
      type: DataTypes.ENUM("baja", "media", "alta"),
      allowNull: false,
      defaultValue: "media",
    },
    estado: {
      type: DataTypes.ENUM("publicada", "archivada"),
      allowNull: false,
      defaultValue: "publicada",
    },
    digest: {
      type: DataTypes.ENUM("ninguno", "diario", "semanal"),
      allowNull: false,
      defaultValue: "ninguno",
    },
    titulo: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "General",
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    imagen_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    formulario_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    url_destino: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    preview_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audiencia: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    enviada_correo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    correos_destino: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_envio_correo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shown_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    opened_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    clicked_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dismissed_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: info_db,
    tableName: "notificaciones",
    timestamps: false,
    underscored: true,
  }
);
