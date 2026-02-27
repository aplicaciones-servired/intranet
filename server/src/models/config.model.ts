import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { info_db } from "../db/db_info";

export class ConfigModel extends Model<
  InferAttributes<ConfigModel>,
  InferCreationAttributes<ConfigModel>
> {
  declare id?: number;
  declare clave: string;
  declare valor: string;
}

ConfigModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    valor: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    sequelize: info_db,
    tableName: "config",
    timestamps: false,
  }
);
