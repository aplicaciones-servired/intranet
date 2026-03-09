import { Router } from "express";
import { getConfigController, setConfigController } from "../controllers/config.controller";
import { requireClerkAuth } from "../Miderlware/authMiddleware";

export const configRoutes = Router();

// GET config es público (se usa para cargar configuración del sitio)
configRoutes.get("/config/:clave", getConfigController);
// POST config solo para admins
configRoutes.post("/config", requireClerkAuth, setConfigController);
