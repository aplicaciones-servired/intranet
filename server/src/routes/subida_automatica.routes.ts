import { Router } from "express";
import { multer_minio } from "../Miderlware/miderlware_minio";
import { requireClerkAuth } from "../Miderlware/authMiddleware";
import {
  createSubidaAutomatica,
  getSubidasAutomaticas,
  updateSubidaAutomaticaPendiente,
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

subidaAutomaticaRoutes.put(
  "/subidas-automaticas/:id",
  requireClerkAuth,
  multer_minio.fields([
    { name: "images", maxCount: 10 },
    { name: "imagen", maxCount: 1 },
  ]),
  updateSubidaAutomaticaPendiente,
);

subidaAutomaticaRoutes.post(
  "/subidas-automaticas/:id/editar",
  requireClerkAuth,
  multer_minio.fields([
    { name: "images", maxCount: 10 },
    { name: "imagen", maxCount: 1 },
  ]),
  updateSubidaAutomaticaPendiente,
);

export default subidaAutomaticaRoutes;
