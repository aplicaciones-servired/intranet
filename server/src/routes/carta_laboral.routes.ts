import { Router } from "express";
import {
  getCartasLaborales,
  createCartaLaboral,
  aprobarCartaLaboral,
  rechazarCartaLaboral,
  deleteCartaLaboral,
} from "../controllers/carta_laboral.controller";

const router = Router();

router.get("/cartas-laborales", getCartasLaborales);
router.post("/cartas-laborales", createCartaLaboral);
router.patch("/cartas-laborales/:id/aprobar", aprobarCartaLaboral);
router.patch("/cartas-laborales/:id/rechazar", rechazarCartaLaboral);
router.delete("/cartas-laborales/:id", deleteCartaLaboral);

export default router;
