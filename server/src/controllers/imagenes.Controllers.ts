import { ImagenesModels } from "../models/imagenes.model";
import { insertFileToMinio } from "../utils/insertMinio";

export const imagenesController = async (req: any, res: any): Promise<any> => {
  const { categoria, titulo, descripcion } = req.body;
  try {
    const imagenesInsertadas = [];

    // Procesar múltiples archivos
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // Subir imagen a MinIO
        const imagenUrl = await insertFileToMinio(
          file.buffer,
          file.originalname,
          file.mimetype,
        );

        // Insertar cada imagen en la base de datos
        const insertImagen = await ImagenesModels.create({
          poster: imagenUrl,
          categoria: categoria,
          titulo: titulo,
          descripcion: descripcion || "",
        });

        imagenesInsertadas.push(insertImagen);
      }
    }

    res.status(200).json({
      message: `${imagenesInsertadas.length} imagen(es) insertada(s) correctamente`,
      datos: imagenesInsertadas,
      imagenesSubidas: imagenesInsertadas.length,
    });
  } catch (error) {
    console.error("Error al insertar imagen:", error);
    res.status(500).json({ error: "Error al insertar imagen" });
  }
};
