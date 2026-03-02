import { DataTypes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export type EstadoCarta = "pendiente" | "aprobado" | "rechazado";

interface CartaLaboralAttributes {
  id?: number;
  nombre_completo: string;
  cedula: string;
  correo: string;
  cargo: string;
  empresa: "Multired" | "Servired";
  sueldo?: string;
  observaciones?: string;
  estado: EstadoCarta;
  fecha_solicitud?: Date;
  fecha_aprobacion?: Date;
}

class CartaLaboral extends Model<CartaLaboralAttributes> implements CartaLaboralAttributes {
  declare id: number;
  declare nombre_completo: string;
  declare cedula: string;
  declare correo: string;
  declare cargo: string;
  declare empresa: "Multired" | "Servired";
  declare sueldo: string | undefined;
  declare observaciones: string | undefined;
  declare estado: EstadoCarta;
  declare fecha_solicitud: Date;
  declare fecha_aprobacion: Date | undefined;
}

CartaLaboral.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_completo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    empresa: {
      type: DataTypes.ENUM("Multired", "Servired"),
      allowNull: false,
    },
    sueldo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
      defaultValue: "pendiente",
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: info_db,
    tableName: "cartas_laborales",
    timestamps: false,
  }
);

export default CartaLaboral;
