import { Request, Response } from "express";
import Formulario from "../models/formulario.model";
import { insertFileToMinio } from "../utils/insertMinio";
import { handleServerError } from "../utils/errorHandler";

// Obtener todos los formularios
export const getFormularios = async (req: Request, res: Response) => {
  try {
    const formularios = await Formulario.findAll({
      order: [["fecha_registro", "DESC"]],
    });
    res.json(formularios);
  } catch (error) {
    handleServerError(res, error, "getFormularios");
  }
};

// Obtener formularios activos
export const getFormulariosActivos = async (req: Request, res: Response) => {
  try {
    const formularios = await Formulario.findAll({
      where: { activo: true },
      order: [["fecha_registro", "DESC"]],
    });
    res.json(formularios);
  } catch (error) {
    handleServerError(res, error, "getFormulariosActivos");
  }
};

// Crear nuevo formulario
export const createFormulario = async (req: any, res: Response) => {
  try {
    const { titulo, descripcion, url } = req.body;

    if (!titulo || !url) {
      return res.status(400).json({ 
        error: "Título y URL son obligatorios" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: "La imagen es obligatoria" 
      });
    }

    // Subir imagen a MinIO
    const imagenUrl = await insertFileToMinio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const nuevoFormulario = await Formulario.create({
      titulo,
      descripcion: descripcion || "",
      url,
      imagen: imagenUrl,
      activo: true,
    });

    res.status(201).json({
      message: "Formulario creado exitosamente",
      formulario: nuevoFormulario,
    });
  } catch (error) {
    handleServerError(res, error, "createFormulario");
  }
};

// Actualizar formulario
export const updateFormulario = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, url, activo } = req.body;

    const formulario = await Formulario.findByPk(Number(id));

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    let imagenUrl = formulario.imagen;

    // Si hay nueva imagen, subirla a MinIO
    if (req.file) {
      imagenUrl = await insertFileToMinio(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );
    }

    await formulario.update({
      titulo: titulo || formulario.titulo,
      descripcion: descripcion !== undefined ? descripcion : formulario.descripcion,
      url: url || formulario.url,
      imagen: imagenUrl,
      activo: activo !== undefined ? activo : formulario.activo,
    });

    res.json({
      message: "Formulario actualizado exitosamente",
      formulario,
    });
  } catch (error) {
    handleServerError(res, error, "updateFormulario");
  }
};

// Eliminar formulario
export const deleteFormulario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const formulario = await Formulario.findByPk(Number(id));

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    await formulario.destroy();

    res.json({ message: "Formulario eliminado exitosamente" });
  } catch (error) {
    handleServerError(res, error, "deleteFormulario");
  }
};

// Cambiar estado activo/inactivo
export const toggleFormularioActivo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const formulario = await Formulario.findByPk(Number(id));

    if (!formulario) {
      return res.status(404).json({ error: "Formulario no encontrado" });
    }

    formulario.activo = !formulario.activo;
    await formulario.save();

    res.json({
      message: `Formulario ${formulario.activo ? "activado" : "desactivado"} exitosamente`,
      formulario,
    });
  } catch (error) {
    handleServerError(res, error, "toggleFormularioActivo");
  }
};
