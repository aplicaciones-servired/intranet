import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { info_db } from "../db/db_info";

export class ImagenesModels extends Model<
  InferAttributes<ImagenesModels>,
  InferCreationAttributes<ImagenesModels>
> {
  declare id?: number;
  declare poster: string;
  declare categoria: string;
  declare titulo: string;
  declare descripcion?: string;
}

ImagenesModels.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    poster: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(600),
      allowNull: true,
    },
  },
  {
    sequelize: info_db,
    tableName: "imagenes",
    timestamps: false,
    underscored: true,
  },
);
