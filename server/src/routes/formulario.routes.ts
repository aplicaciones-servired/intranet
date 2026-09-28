import { Router } from "express";
import { multer_minio } from "../Miderlware/miderlware_minio";
import {
  getFormularios,
  getFormulariosActivos,
  createFormulario,
  updateFormulario,
  deleteFormulario,
  toggleFormularioActivo,
} from "../controllers/formulario.controller";
import { requireAdmin } from "../Miderlware/authMiddleware";

const router = Router();

// GET activos es público (se muestra en la intranet)
router.get("/formularios/activos", getFormulariosActivos);
// GET todos (incluye inactivos) solo para admins
router.get("/formularios", requireAdmin, getFormularios);
// Escritura solo para admins autenticados
router.post("/formularios", requireAdmin, multer_minio.single("imagen"), createFormulario);
router.put("/formularios/:id", requireAdmin, multer_minio.single("imagen"), updateFormulario);
router.delete("/formularios/:id", requireAdmin, deleteFormulario);
router.patch("/formularios/:id/toggle", requireAdmin, toggleFormularioActivo);

export default router;
