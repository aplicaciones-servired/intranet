import { Router } from "express";
import {
  getEspaciosController,
  createEspacioController,
  updateEspacioController,
  deleteEspacioController,
} from "../controllers/espacio.controller";
import { requireAdmin } from "../Miderlware/authMiddleware";

export const espacioRoutes = Router();

// GET es público (se usa en la intranet)
espacioRoutes.get("/espacios", getEspaciosController);
// Escritura solo para admins autenticados
espacioRoutes.post("/espacios", requireAdmin, createEspacioController);
espacioRoutes.put("/espacios/:id", requireAdmin, updateEspacioController);
espacioRoutes.delete("/espacios/:id", requireAdmin, deleteEspacioController);
