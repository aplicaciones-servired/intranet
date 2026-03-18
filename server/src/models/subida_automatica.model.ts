import { DataTypes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export type TipoSubidaAutomatica = "imagen" | "formulario";
export type EstadoSubidaAutomatica = "pendiente" | "procesando" | "publicado" | "error";

interface SubidaAutomaticaAttributes {
  id?: number;
  tipo: TipoSubidaAutomatica;
  payload: Record<string, any>;
  correos_destino: string;
  programado_para: Date;
  estado: EstadoSubidaAutomatica;
  fecha_creacion?: Date;
  fecha_procesado?: Date;
  ids_publicados?: number[];
  error_mensaje?: string;
}

class SubidaAutomatica
  extends Model<SubidaAutomaticaAttributes>
  implements SubidaAutomaticaAttributes
{
  public id!: number;
  public tipo!: TipoSubidaAutomatica;
  public payload!: Record<string, any>;
  public correos_destino!: string;
  public programado_para!: Date;
  public estado!: EstadoSubidaAutomatica;
  public fecha_creacion!: Date;
  public fecha_procesado?: Date;
  public ids_publicados?: number[];
  public error_mensaje?: string;
}

SubidaAutomatica.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("imagen", "formulario"),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correos_destino: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    programado_para: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "procesando", "publicado", "error"),
      allowNull: false,
      defaultValue: "pendiente",
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_procesado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ids_publicados: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    error_mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: info_db,
    tableName: "subidas_automaticas",
    timestamps: false,
    underscored: true,
  },
);

export default SubidaAutomatica;
