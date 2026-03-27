import { where } from "sequelize";
import { ImagenesModels } from "../models/imagenes.model";
import { insertFileToMinio } from "../utils/insertMinio";
import { abrirStreamNotificaciones, emitirNotificacionNuevaInformacion } from "../utils/notificacionesRealtime";
import { crearNotificacion } from "../utils/notificacionesStore";

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
    const { imagenesIds, formularioIds, urlIntranet, prioridad, audiencia, digestMode } = req.body;
    const baseIntranetUrl =
      urlIntranet ||
      process.env.PUBLIC_INTRANET_URL ||
      "https://intranet.grupomultired.com.co";

    const normalizarBase = (url: string): string => url.replace(/\/+$/, "");
    const baseUrl = normalizarBase(baseIntranetUrl);

    let totalNotificados = 0;
    let tituloResumen = "Nueva actualización";
    let categoriaResumen = "Intranet";
    let descripcionResumen = "Se publicó contenido nuevo en la intranet.";
    let tipoEvento: "imagen" | "formulario" | "mixto" = "mixto";
    let urlDestinoEvento = baseUrl;
    let primeraImagenId: number | null = null;
    let imagenesNotificadasIds: number[] = [];
    let primerFormularioId: number | null = null;
    let primerFormularioUrl = "";
    let previewImageUrl = "";
    let correosDestino = "";
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
        primeraImagenId = Number(primeraImagen.id);
        previewImageUrl = String(primeraImagen.poster || "");
        imagenesNotificadasIds = imagenes
          .map((img) => Number(img.id))
          .filter((id) => Number.isFinite(id));
        tituloResumen = primeraImagen.titulo || tituloResumen;
        categoriaResumen = primeraImagen.categoria || categoriaResumen;
        descripcionResumen = primeraImagen.descripcion || descripcionResumen;

        const queryImagenes = imagenesNotificadasIds.length > 0
          ? `?openImageIds=${imagenesNotificadasIds.join(",")}${
              primeraImagenId && Number.isFinite(primeraImagenId)
                ? `&openImageId=${primeraImagenId}`
                : ""
            }`
          : primeraImagenId && Number.isFinite(primeraImagenId)
            ? `?openImageId=${primeraImagenId}`
            : "";

        const urlDestinoImagen =
          queryImagenes.length > 0
            ? `${baseUrl}/${queryImagenes}`
            : baseUrl;
        
        const { enviarNotificacionNuevaInformacion } = await import("../utils/enviarCorreo");
        
        await enviarNotificacionNuevaInformacion({
          cantidad: imagenes.length,
          categoria: primeraImagen.categoria,
          titulo: primeraImagen.titulo,
          descripcion: primeraImagen.descripcion,
          urlIntranet: urlDestinoImagen,
          tipo: "imagen",
        });

        correosDestino = String(process.env.PUBLIC_CORREOS_URL || "");

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
        primerFormularioId = Number(primerFormulario.id);
        primerFormularioUrl = String(primerFormulario.url || "").trim();
        if (!previewImageUrl) {
          previewImageUrl = String(primerFormulario.imagen || "");
        }

        if (!infoNotificacion.imagenes) {
          tituloResumen = primerFormulario.titulo || tituloResumen;
          categoriaResumen = "Formularios";
          descripcionResumen = primerFormulario.descripcion || descripcionResumen;
        }

        const urlDestinoFormulario =
          primerFormularioUrl.length > 0
            ? primerFormularioUrl
            : `${baseUrl}/formularios${
                primerFormularioId && Number.isFinite(primerFormularioId)
                  ? `?openFormularioId=${primerFormularioId}`
                  : ""
              }`;
        
        const { enviarNotificacionNuevaInformacion } = await import("../utils/enviarCorreo");
        
        await enviarNotificacionNuevaInformacion({
          cantidad: formularios.length,
          categoria: "Formularios",
          titulo: primerFormulario.titulo,
          descripcion: primerFormulario.descripcion,
          urlIntranet: urlDestinoFormulario,
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

    if (infoNotificacion.imagenes > 0 && infoNotificacion.formularios === 0) {
      tipoEvento = "imagen";
      const queryImagenes = imagenesNotificadasIds.length > 0
        ? `?openImageIds=${imagenesNotificadasIds.join(",")}${
            primeraImagenId && Number.isFinite(primeraImagenId)
              ? `&openImageId=${primeraImagenId}`
              : ""
          }`
        : primeraImagenId && Number.isFinite(primeraImagenId)
          ? `?openImageId=${primeraImagenId}`
          : "";

      urlDestinoEvento = queryImagenes.length > 0 ? `${baseUrl}/${queryImagenes}` : baseUrl;
    } else if (infoNotificacion.formularios > 0 && infoNotificacion.imagenes === 0) {
      tipoEvento = "formulario";
      categoriaResumen = "Formularios";
      urlDestinoEvento =
        primerFormularioUrl.length > 0
          ? primerFormularioUrl
          : `${baseUrl}/formularios${
              primerFormularioId && Number.isFinite(primerFormularioId)
                ? `?openFormularioId=${primerFormularioId}`
                : ""
            }`;
    } else {
      tipoEvento = "mixto";
      categoriaResumen = "Actualización general";
      if (imagenesNotificadasIds.length > 0) {
        const queryImagenes = `?openImageIds=${imagenesNotificadasIds.join(",")}${
          primeraImagenId && Number.isFinite(primeraImagenId)
            ? `&openImageId=${primeraImagenId}`
            : ""
        }`;
        urlDestinoEvento = `${baseUrl}/${queryImagenes}`;
      } else if (primeraImagenId && Number.isFinite(primeraImagenId)) {
        urlDestinoEvento = `${baseUrl}/?openImageId=${primeraImagenId}`;
      } else if (primerFormularioUrl.length > 0) {
        urlDestinoEvento = primerFormularioUrl;
      } else if (primerFormularioId && Number.isFinite(primerFormularioId)) {
        urlDestinoEvento = `${baseUrl}/formularios?openFormularioId=${primerFormularioId}`;
      }
    }

    const notificacion = await crearNotificacion({
      tipo: tipoEvento,
      prioridad: prioridad === "alta" || prioridad === "baja" ? prioridad : "media",
      digest: digestMode === "diario" || digestMode === "semanal" ? digestMode : "ninguno",
      titulo: tituloResumen,
      descripcion: descripcionResumen,
      categoria: categoriaResumen,
      cantidad: totalNotificados,
      imagenIds: imagenesNotificadasIds,
      formularioIds: primerFormularioId ? [primerFormularioId] : [],
      urlDestino: urlDestinoEvento,
      previewImageUrl,
      audiencia: audiencia && typeof audiencia === "object" ? audiencia : { scope: "publico", tags: ["all"] },
      metadata: {
        imagenes: infoNotificacion.imagenes,
        formularios: infoNotificacion.formularios,
      },
      enviadaCorreo: true,
      correosDestino,
    });

    emitirNotificacionNuevaInformacion({
      eventId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      notificationId: notificacion?.id,
      tipo: tipoEvento,
      cantidad: totalNotificados,
      titulo: tituloResumen,
      categoria: categoriaResumen,
      descripcion: descripcionResumen,
      urlDestino: urlDestinoEvento,
      prioridad: prioridad === "alta" || prioridad === "baja" ? prioridad : "media",
      previewImageUrl,
      fecha: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Notificación enviada exitosamente",
      notificacionId: notificacion?.id || null,
      totalNotificados,
      detalles: infoNotificacion,
    });
  } catch (error) {
    console.error("Error al notificar subida:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
};

export const streamNotificacionesController = (req: any, res: any): void => {
  abrirStreamNotificaciones(req, res);
};

// Eliminar imagen
export const deleteImagenController = async (
  req: any,
  res: any,
): Promise<any> => {
  try {
    const { id } = req.params;

    const imagen = await ImagenesModels.findByPk(Number(id));

    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    // Eliminar registro de la base de datos
    await imagen.destroy();

    res.status(200).json({
      message: "Imagen eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
};
