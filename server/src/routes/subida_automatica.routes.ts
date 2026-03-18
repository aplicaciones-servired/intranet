import { Router } from "express";
import { multer_minio } from "../Miderlware/miderlware_minio";
import { requireClerkAuth } from "../Miderlware/authMiddleware";
import {
  createSubidaAutomatica,
  getSubidasAutomaticas,
} from "../controllers/subida_automatica.controller";

const subidaAutomaticaRoutes = Router();

subidaAutomaticaRoutes.get("/subidas-automaticas", requireClerkAuth, getSubidasAutomaticas);
subidaAutomaticaRoutes.post(
  "/subidas-automaticas",
  requireClerkAuth,
  multer_minio.fields([
    { name: "images", maxCount: 10 },
    { name: "imagen", maxCount: 1 },
  ]),
  createSubidaAutomatica,
);

export default subidaAutomaticaRoutes;
