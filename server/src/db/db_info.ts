import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DB_MYSQL_HOST = process.env.DB_MYSQL_HOST as string;
const DB_MYSQL_USER = process.env.DB_MYSQL_USER as string;
const DB_MYSQL_PASSWORD = process.env.DB_MYSQL_PASSWORD as string;
const DB_MYSQL_DATABASE = process.env.DB_MYSQL_DATABASE as string;

export const info_db = new Sequelize(DB_MYSQL_DATABASE, DB_MYSQL_USER, DB_MYSQL_PASSWORD, {
  host: DB_MYSQL_HOST,
  dialect: "mysql",
  timezone: "-05:00",
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});
