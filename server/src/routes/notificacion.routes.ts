import { Router } from "express";
import {
  clickNotificacion,
  enviarResumenDigest,
  listarNotificaciones,
  marcarNotificacionLeida,
  metricsNotificaciones,
  recordarNotificacion,
  registrarImpresionNotificacion,
  requireNotificacionAdmin,
} from "../controllers/notificacion.controller";

const router = Router();

router.get("/notificaciones", listarNotificaciones);
router.post("/notificaciones/:id/read", marcarNotificacionLeida);
router.post("/notificaciones/:id/click", clickNotificacion);
router.post("/notificaciones/:id/remind", recordarNotificacion);
router.post("/notificaciones/:id/shown", registrarImpresionNotificacion);

// Endpoints del admin (protegidos; requieren rol admin si ADMIN_USERS está definido)
router.get("/notificaciones/metrics", requireNotificacionAdmin, metricsNotificaciones);
router.post("/notificaciones/digest", requireNotificacionAdmin, enviarResumenDigest);

export default router;
