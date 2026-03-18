import { Request, Response } from "express";
import { insertFileToMinio } from "../utils/insertMinio";
import SubidaAutomatica from "../models/subida_automatica.model";

function normalizarCorreos(input: string): string[] {
  return input
    .split(/[;,\n]/)
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
}

function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function normalizarPayload(payload: unknown): Record<string, any> {
  if (!payload) return {};
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {};
    } catch {
      return {};
    }
  }
  if (typeof payload === "object") {
    return payload as Record<string, any>;
  }
  return {};
}

function normalizarListaImagenesEntrada(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    const value = input.trim();
    if (!value) return [];

    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Si no es JSON válido, se procesa como texto separado por delimitadores.
      }
    }

    return value
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export const createSubidaAutomatica = async (req: any, res: Response) => {
  try {
    const { tipo, programadoPara, correosDestino } = req.body;

    if (tipo !== "imagen" && tipo !== "formulario") {
      return res.status(400).json({ error: "El tipo debe ser 'imagen' o 'formulario'" });
    }

    if (!programadoPara) {
      return res.status(400).json({ error: "La fecha y hora de programación son obligatorias" });
    }

    const fechaProgramada = new Date(programadoPara);
    if (Number.isNaN(fechaProgramada.getTime())) {
      return res.status(400).json({ error: "La fecha de programación no es válida" });
    }

    if (fechaProgramada.getTime() < Date.now()) {
      return res.status(400).json({ error: "La fecha de programación debe ser futura" });
    }

    const correosEntrada =
      typeof correosDestino === "string" && correosDestino.trim().length > 0
        ? correosDestino
        : process.env.PUBLIC_CORREOS_URL || "";

    const correos = normalizarCorreos(correosEntrada);
    if (correos.length === 0) {
      return res.status(400).json({
        error:
          "No hay correos para notificar. Define PUBLIC_CORREOS_URL en el servidor o envía correosDestino.",
      });
    }

    const invalidos = correos.filter((c) => !esCorreoValido(c));
    if (invalidos.length > 0) {
      return res.status(400).json({
        error: `Correos inválidos: ${invalidos.join(", ")}`,
      });
    }

    let payload: Record<string, any>;

    if (tipo === "imagen") {
      const { categoria, titulo, descripcion, imagenesUrls: imagenesUrlsEntrada, imagenes_urls, urls } = req.body;
      const files = req.files?.images as Express.Multer.File[] | undefined;

      if (!categoria || !titulo) {
        return res.status(400).json({ error: "Categoría y título son obligatorios" });
      }

      const imagenesUrls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const imagenUrl = await insertFileToMinio(
            file.buffer,
            file.originalname,
            file.mimetype,
          );
          imagenesUrls.push(imagenUrl);
        }
      }

      const imagenesPreexistentes = normalizarListaImagenesEntrada(
        imagenesUrlsEntrada ?? imagenes_urls ?? urls,
      );

      const imagenesFinales = [...imagenesUrls, ...imagenesPreexistentes]
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);

      if (imagenesFinales.length === 0) {
        return res.status(400).json({
          error:
            "Debes seleccionar al menos una imagen o enviar una lista de URLs válidas en imagenesUrls.",
        });
      }

      payload = {
        categoria,
        titulo,
        descripcion: descripcion || "",
        imagenesUrls: imagenesFinales,
      };
    } else {
      const { titulo, descripcion, url } = req.body;
      const imagen = req.files?.imagen?.[0] as Express.Multer.File | undefined;

      if (!titulo || !url) {
        return res.status(400).json({ error: "Título y URL son obligatorios" });
      }

      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "La URL del formulario no es válida" });
      }

      if (!imagen) {
        return res.status(400).json({ error: "La imagen del formulario es obligatoria" });
      }

      const imagenUrl = await insertFileToMinio(
        imagen.buffer,
        imagen.originalname,
        imagen.mimetype,
      );

      payload = {
        titulo,
        descripcion: descripcion || "",
        url,
        imagenUrl,
      };
    }

    const subida = await SubidaAutomatica.create({
      tipo,
      payload,
      correos_destino: correos.join(","),
      programado_para: fechaProgramada,
      estado: "pendiente",
    });

    return res.status(201).json({
      message: "Subida automática programada correctamente",
      subida,
    });
  } catch (error: any) {
    console.error("Error al crear subida automática:", error);
    return res.status(500).json({
      error: error?.message || "No se pudo crear la programación",
    });
  }
};

export const getSubidasAutomaticas = async (req: Request, res: Response) => {
  try {
    const subidas = await SubidaAutomatica.findAll({
      order: [["programado_para", "DESC"]],
    });

    return res.status(200).json(subidas);
  } catch (error: any) {
    console.error("Error al listar subidas automáticas:", error);
    return res.status(500).json({
      error: error?.message || "No se pudieron obtener las subidas automáticas",
    });
  }
};

export const updateSubidaAutomaticaPendiente = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ error: "El id de la subida no es válido" });
    }

    const subida = await SubidaAutomatica.findByPk(id);
    if (!subida) {
      return res.status(404).json({ error: "La subida automática no existe" });
    }

    if (subida.estado !== "pendiente") {
      return res.status(400).json({
        error: "Solo se pueden editar subidas en estado pendiente",
      });
    }

    const payloadActual = normalizarPayload(subida.payload);
    const {
      programadoPara,
      correosDestino,
      categoria,
      titulo,
      descripcion,
      url,
      imagenesUrls,
      imagenes_urls,
      urls,
      imagenUrl,
    } = req.body;

    const correosEntrada =
      typeof correosDestino === "string" && correosDestino.trim().length > 0
        ? correosDestino
        : subida.correos_destino;

    const correos = normalizarCorreos(correosEntrada);
    if (correos.length === 0) {
      return res.status(400).json({
        error: "Debes indicar al menos un correo destino válido",
      });
    }

    const invalidos = correos.filter((c) => !esCorreoValido(c));
    if (invalidos.length > 0) {
      return res.status(400).json({
        error: `Correos inválidos: ${invalidos.join(", ")}`,
      });
    }

    let fechaProgramada = new Date(subida.programado_para);
    if (typeof programadoPara === "string" && programadoPara.trim().length > 0) {
      fechaProgramada = new Date(programadoPara);
      if (Number.isNaN(fechaProgramada.getTime())) {
        return res.status(400).json({ error: "La fecha de programación no es válida" });
      }
      if (fechaProgramada.getTime() < Date.now()) {
        return res.status(400).json({ error: "La fecha de programación debe ser futura" });
      }
    }

    let payloadActualizado: Record<string, any> = { ...payloadActual };

    if (subida.tipo === "imagen") {
      const files = req.files?.images as Express.Multer.File[] | undefined;
      const imagenesSubidas: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const imagenSubida = await insertFileToMinio(
            file.buffer,
            file.originalname,
            file.mimetype,
          );
          imagenesSubidas.push(imagenSubida);
        }
      }

      const imagenesEntrada = normalizarListaImagenesEntrada(
        imagenesUrls ?? imagenes_urls ?? urls,
      );

      const imagenesBase =
        imagenesSubidas.length > 0 || imagenesEntrada.length > 0
          ? [...imagenesSubidas, ...imagenesEntrada]
          : normalizarListaImagenesEntrada(payloadActual.imagenesUrls || payloadActual.imagenes_urls);

      const imagenesFinales = imagenesBase
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);

      const categoriaFinal = typeof categoria === "string" && categoria.trim().length > 0
        ? categoria.trim()
        : String(payloadActual.categoria || "").trim();

      const tituloFinal = typeof titulo === "string" && titulo.trim().length > 0
        ? titulo.trim()
        : String(payloadActual.titulo || "").trim();

      const descripcionFinal = typeof descripcion === "string"
        ? descripcion.trim()
        : String(payloadActual.descripcion || "").trim();

      if (!categoriaFinal || !tituloFinal || imagenesFinales.length === 0) {
        return res.status(400).json({
          error: "Para imágenes debes conservar categoría, título y al menos una imagen.",
        });
      }

      payloadActualizado = {
        ...payloadActual,
        categoria: categoriaFinal,
        titulo: tituloFinal,
        descripcion: descripcionFinal,
        imagenesUrls: imagenesFinales,
      };
    } else {
      const fileImagen = req.files?.imagen?.[0] as Express.Multer.File | undefined;

      let imagenFinal = typeof imagenUrl === "string" && imagenUrl.trim().length > 0
        ? imagenUrl.trim()
        : String(payloadActual.imagenUrl || "").trim();

      if (fileImagen) {
        imagenFinal = await insertFileToMinio(
          fileImagen.buffer,
          fileImagen.originalname,
          fileImagen.mimetype,
        );
      }

      const tituloFinal = typeof titulo === "string" && titulo.trim().length > 0
        ? titulo.trim()
        : String(payloadActual.titulo || "").trim();

      const urlFinal = typeof url === "string" && url.trim().length > 0
        ? url.trim()
        : String(payloadActual.url || "").trim();

      const descripcionFinal = typeof descripcion === "string"
        ? descripcion.trim()
        : String(payloadActual.descripcion || "").trim();

      if (!tituloFinal || !urlFinal || !imagenFinal) {
        return res.status(400).json({
          error: "Para formularios debes conservar título, URL e imagen.",
        });
      }

      try {
        new URL(urlFinal);
      } catch {
        return res.status(400).json({ error: "La URL del formulario no es válida" });
      }

      payloadActualizado = {
        ...payloadActual,
        titulo: tituloFinal,
        descripcion: descripcionFinal,
        url: urlFinal,
        imagenUrl: imagenFinal,
      };
    }

    await subida.update({
      payload: payloadActualizado,
      programado_para: fechaProgramada,
      correos_destino: correos.join(","),
      error_mensaje: null,
    });

    return res.status(200).json({
      message: "Subida automática pendiente actualizada correctamente",
      subida,
    });
  } catch (error: any) {
    console.error("Error al editar subida automática pendiente:", error);
    return res.status(500).json({
      error: error?.message || "No se pudo editar la subida automática",
    });
  }
};
