import { Router } from "express";
import {
  getEspaciosController,
  createEspacioController,
  updateEspacioController,
  deleteEspacioController,
} from "../controllers/espacio.controller";

export const espacioRoutes = Router();

espacioRoutes.get("/espacios", getEspaciosController);
espacioRoutes.post("/espacios", createEspacioController);
espacioRoutes.put("/espacios/:id", updateEspacioController);
espacioRoutes.delete("/espacios/:id", deleteEspacioController);
