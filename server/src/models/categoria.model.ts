import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export class CategoriaModel extends Model<
  InferAttributes<CategoriaModel>,
  InferCreationAttributes<CategoriaModel>
> {
  declare id?: number;
  declare label: string;
  declare value: string;
  declare orden: number;
  declare activa: boolean;
}

CategoriaModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: info_db,
    tableName: "categorias",
    timestamps: false,
  }
);
