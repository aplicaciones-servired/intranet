import { DataTypes, Model } from "sequelize";
import { info_db } from "../db/db_info";

interface FormularioAttributes {
  id?: number;
  titulo: string;
  descripcion?: string;
  url: string;
  imagen: string;
  activo: boolean;
  fecha_registro?: Date;
}

class Formulario extends Model<FormularioAttributes> implements FormularioAttributes {
  public id!: number;
  public titulo!: string;
  public descripcion?: string;
  public url!: string;
  public imagen!: string;
  public activo!: boolean;
  public fecha_registro!: Date;
}

Formulario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagen: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: info_db,
    tableName: "formularios",
    timestamps: false,
  }
);

export default Formulario;
