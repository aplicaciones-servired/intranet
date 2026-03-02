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

const router = Router();

router.get("/formularios", getFormularios);
router.get("/formularios/activos", getFormulariosActivos);
router.post("/formularios", multer_minio.single("imagen"), createFormulario);
router.put("/formularios/:id", multer_minio.single("imagen"), updateFormulario);
router.delete("/formularios/:id", deleteFormulario);
router.patch("/formularios/:id/toggle", toggleFormularioActivo);

export default router;
