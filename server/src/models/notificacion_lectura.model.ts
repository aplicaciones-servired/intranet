import { DataTypes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export interface NotificacionLecturaAttributes {
  id?: number;
  notificacion_id: number;
  cliente_id: string;
  leida: boolean;
  clickeada: boolean;
  recordarme_luego_hasta?: Date | null;
  fecha_lectura?: Date | null;
  fecha_click?: Date | null;
  fecha_actualizacion?: Date;
}

export class NotificacionLecturaModel extends Model<NotificacionLecturaAttributes> implements NotificacionLecturaAttributes {
  public id!: number;
  public notificacion_id!: number;
  public cliente_id!: string;
  public leida!: boolean;
  public clickeada!: boolean;
  public recordarme_luego_hasta?: Date | null;
  public fecha_lectura?: Date | null;
  public fecha_click?: Date | null;
  public fecha_actualizacion!: Date;
}

NotificacionLecturaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    notificacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cliente_id: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    clickeada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recordarme_luego_hasta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_lectura: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_click: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: info_db,
    tableName: "notificaciones_lecturas",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["notificacion_id", "cliente_id"],
      },
    ],
  }
);
