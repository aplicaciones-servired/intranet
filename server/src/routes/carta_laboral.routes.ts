import { Router } from "express";
import {
  getCartasLaborales,
  createCartaLaboral,
  aprobarCartaLaboral,
  vistaPreviaCartaLaboral,
  rechazarCartaLaboral,
  deleteCartaLaboral,
} from "../controllers/carta_laboral.controller";
import { requireAdmin } from "../Miderlware/authMiddleware";

const router = Router();

// Rutas públicas
router.post("/cartas-laborales", createCartaLaboral);

// Rutas de administración (requieren sesión de admin)
router.get("/cartas-laborales", requireAdmin, getCartasLaborales);
router.patch("/cartas-laborales/:id/aprobar", requireAdmin, aprobarCartaLaboral);
router.post("/cartas-laborales/:id/vista-previa", requireAdmin, vistaPreviaCartaLaboral);
router.patch("/cartas-laborales/:id/rechazar", requireAdmin, rechazarCartaLaboral);
router.delete("/cartas-laborales/:id", requireAdmin, deleteCartaLaboral);

export default router;
