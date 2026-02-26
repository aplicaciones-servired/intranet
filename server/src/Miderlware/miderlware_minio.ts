import multer from "multer";

export const multer_minio = multer({
  storage: multer.memoryStorage(), // Almacenar archivos en memoria para luego subirlos a MinIO
  limits: { fileSize: 50 * 1024 * 1024 }, // Limite de 50MB por archivo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf']; // Permitir solo PNG, JPG, JPEG y PDF
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten PNG, JPG, JPEG y PDF.'));
    }
  }
});
