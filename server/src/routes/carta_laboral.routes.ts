import { Router } from "express";
import {
  getCartasLaborales,
  createCartaLaboral,
  aprobarCartaLaboral,
  rechazarCartaLaboral,
  deleteCartaLaboral,
} from "../controllers/carta_laboral.controller";
import { requireClerkAuth } from "../Miderlware/authMiddleware";

const router = Router();

// Rutas públicas
router.post("/cartas-laborales", createCartaLaboral);

// Rutas de administración (requieren sesión Clerk)
router.get("/cartas-laborales", requireClerkAuth, getCartasLaborales);
router.patch("/cartas-laborales/:id/aprobar", requireClerkAuth, aprobarCartaLaboral);
router.patch("/cartas-laborales/:id/rechazar", requireClerkAuth, rechazarCartaLaboral);
router.delete("/cartas-laborales/:id", requireClerkAuth, deleteCartaLaboral);

export default router;
