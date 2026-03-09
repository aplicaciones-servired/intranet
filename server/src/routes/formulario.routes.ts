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
import { requireClerkAuth } from "../Miderlware/authMiddleware";

const router = Router();

// GET activos es público (se muestra en la intranet)
router.get("/formularios/activos", getFormulariosActivos);
// GET todos (incluye inactivos) solo para admins
router.get("/formularios", requireClerkAuth, getFormularios);
// Escritura solo para admins autenticados
router.post("/formularios", requireClerkAuth, multer_minio.single("imagen"), createFormulario);
router.put("/formularios/:id", requireClerkAuth, multer_minio.single("imagen"), updateFormulario);
router.delete("/formularios/:id", requireClerkAuth, deleteFormulario);
router.patch("/formularios/:id/toggle", requireClerkAuth, toggleFormularioActivo);

export default router;
