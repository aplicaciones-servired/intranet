import { Router } from "express";
import {
  getCartasLaborales,
  createCartaLaboral,
  aprobarCartaLaboral,
  rechazarCartaLaboral,
  deleteCartaLaboral,
} from "../controllers/carta_laboral.controller";
import { requireApiKey } from "../Miderlware/authMiddleware";

const router = Router();

// Rutas públicas
router.post("/cartas-laborales", createCartaLaboral);

// Rutas de administración (requieren API key)
router.get("/cartas-laborales", requireApiKey, getCartasLaborales);
router.patch("/cartas-laborales/:id/aprobar", requireApiKey, aprobarCartaLaboral);
router.patch("/cartas-laborales/:id/rechazar", requireApiKey, rechazarCartaLaboral);
router.delete("/cartas-laborales/:id", requireApiKey, deleteCartaLaboral);

export default router;
