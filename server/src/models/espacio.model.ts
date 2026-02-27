import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export type EspacioTipo = "slider" | "destacada" | "grid" | "lista";

export class EspacioModel extends Model<
  InferAttributes<EspacioModel>,
  InferCreationAttributes<EspacioModel>
> {
  declare id?: number;
  declare nombre: string;
  declare descripcion: string;
  declare tipo: EspacioTipo;
  declare categoria: string;
  declare visible: boolean;
  declare orden: number;
}

EspacioModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(300),
      allowNull: false,
      defaultValue: "",
    },
    tipo: {
      type: DataTypes.ENUM("slider", "destacada", "grid", "lista"),
      allowNull: false,
      defaultValue: "grid",
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: info_db,
    tableName: "espacios",
    timestamps: false,
  }
);
