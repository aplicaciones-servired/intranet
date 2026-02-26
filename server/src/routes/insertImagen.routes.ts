import { imagenesController } from "../controllers/imagenes.Controllers";
import { Router } from "express";
import { multer_minio } from "../Miderlware/miderlware_minio";

export const intraRoutes = Router();

intraRoutes.post("/insertImagen", multer_minio.array("images", 10), imagenesController);

