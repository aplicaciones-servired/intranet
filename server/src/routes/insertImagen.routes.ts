import { getImagenesController, imagenesController, notificarSubidaController, deleteImagenController, streamNotificacionesController } from "../controllers/imagenes.Controller";
import { Router } from "express";
import { multer_minio } from "../Miderlware/miderlware_minio";
import { requireClerkAuth } from "../Miderlware/authMiddleware";

export const intraRoutes = Router();

// POST requiere autenticación (solo admins pueden subir imágenes)
intraRoutes.post("/insertImagen", requireClerkAuth, multer_minio.array("images", 10), imagenesController);
// GET es público (las imágenes se muestran en la intranet)
intraRoutes.get("/getImagenes", getImagenesController);
// GET SSE público para notificaciones visuales en vivo
intraRoutes.get("/notificaciones/stream", streamNotificacionesController);
// POST para notificar nueva información subida
intraRoutes.post("/notificar-subida", requireClerkAuth, notificarSubidaController);
// DELETE para eliminar imagen (requiere autenticación)
intraRoutes.delete("/imagenes/:id", requireClerkAuth, deleteImagenController);