import { where } from "sequelize";
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
          fecha_registro: new Date(), // Agregar fecha de registro actual
          notificado: false, // Inicialmente no notificado
        });

        imagenesInsertadas.push(insertImagen);
      }
    }

    res.status(200).json({
      message: `${imagenesInsertadas.length} imagen(es) insertada(s) correctamente`,
      datos: imagenesInsertadas,
      imagenesSubidas: imagenesInsertadas.length,
      imagenesIds: imagenesInsertadas.map(img => img.id), // IDs para notificación posterior
    });
  } catch (error) {
    console.error("Error al insertar imagen:", error);
    res.status(500).json({ error: "Error al insertar imagen" });
  }
};

export const getImagenesController = async (
  req: any,
  res: any,
): Promise<any> => {
  try {
    const imagenes = await ImagenesModels.findAll({
      order: [["fecha_registro", "DESC"]], // Ordenar por fecha de registro descendente
    });

    res
      .status(200)
      .json({ datos: imagenes, message: "registros obtenidos correctamente" });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
};

export const notificarSubidaController = async (
  req: any,
  res: any,
): Promise<any> => {
  try {
    const { imagenesIds, formularioIds, urlIntranet } = req.body;

    let totalNotificados = 0;
    const infoNotificacion: any = {
      imagenes: 0,
      formularios: 0,
      items: [],
    };

    // Notificar imágenes
    if (imagenesIds && Array.isArray(imagenesIds) && imagenesIds.length > 0) {
      const imagenes = await ImagenesModels.findAll({
        where: {
          id: imagenesIds,
          notificado: false,
        },
      });

      if (imagenes.length > 0) {
        const primeraImagen = imagenes[0];
        
        const { enviarNotificacionNuevaInformacion } = await import("../utils/enviarCorreo");
        
        await enviarNotificacionNuevaInformacion({
          cantidad: imagenes.length,
          categoria: primeraImagen.categoria,
          titulo: primeraImagen.titulo,
          descripcion: primeraImagen.descripcion,
          urlIntranet: urlIntranet || process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
          tipo: "imagen",
        });

        await ImagenesModels.update(
          { notificado: true },
          { where: { id: imagenesIds } }
        );

        infoNotificacion.imagenes = imagenes.length;
        totalNotificados += imagenes.length;
      }
    }

    // Notificar formularios
    if (formularioIds && Array.isArray(formularioIds) && formularioIds.length > 0) {
      const Formulario = (await import("../models/formulario.model")).default;
      
      const formularios = await Formulario.findAll({
        where: {
          id: formularioIds,
          notificado: false,
        },
      });

      if (formularios.length > 0) {
        const primerFormulario = formularios[0];
        
        const { enviarNotificacionNuevaInformacion } = await import("../utils/enviarCorreo");
        
        await enviarNotificacionNuevaInformacion({
          cantidad: formularios.length,
          categoria: "Formularios",
          titulo: primerFormulario.titulo,
          descripcion: primerFormulario.descripcion,
          urlIntranet: urlIntranet || process.env.PUBLIC_INTRANET_URL || "https://intranet.grupomultired.com.co",
          tipo: "formulario",
        });

        await Formulario.update(
          { notificado: true },
          { where: { id: formularioIds } }
        );

        infoNotificacion.formularios = formularios.length;
        totalNotificados += formularios.length;
      }
    }

    if (totalNotificados === 0) {
      return res.status(404).json({ error: "No se encontraron items pendientes de notificar" });
    }

    res.status(200).json({
      message: "Notificación enviada exitosamente",
      totalNotificados,
      detalles: infoNotificacion,
    });
  } catch (error) {
    console.error("Error al notificar subida:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
};
