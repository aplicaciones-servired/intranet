import multer from "multer";
import path from "path";

const MIMETYPES_PERMITIDOS = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
const EXTENSIONES_POR_MIMETYPE: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpg": [".jpg"],
  "image/jpeg": [".jpeg", ".jpg"],
  "application/pdf": [".pdf"],
};

export const multer_minio = multer({
  storage: multer.memoryStorage(), // Almacenar archivos en memoria para luego subirlos a MinIO
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB por archivo
  fileFilter: (req, file, cb) => {
    // Validar tanto el mimetype declarado como la extensión real del archivo
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetypeValido = MIMETYPES_PERMITIDOS.includes(file.mimetype);
    const extensionValida =
      mimetypeValido && (EXTENSIONES_POR_MIMETYPE[file.mimetype] || []).includes(extension);

    if (mimetypeValido && extensionValida) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido. Solo se permiten PNG, JPG, JPEG y PDF con su extensión correspondiente."));
    }
  },
});
