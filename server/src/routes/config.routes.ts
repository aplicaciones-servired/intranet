import { Router } from "express";
import { getConfigController, setConfigController } from "../controllers/config.controller";

export const configRoutes = Router();

configRoutes.get("/config/:clave", getConfigController);
configRoutes.post("/config", setConfigController);
