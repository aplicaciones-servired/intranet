import { EspacioModel } from "../models/espacio.model";

// GET /espacios — todos los espacios
export const getEspaciosController = async (_req: any, res: any): Promise<any> => {
  try {
    const espacios = await EspacioModel.findAll({ order: [["orden", "ASC"]] });
    return res.status(200).json(espacios);
  } catch (error) {
    console.error("Error al obtener espacios:", error);
    return res.status(500).json({ error: "Error al obtener espacios" });
  }
};

// POST /espacios — crear nuevo espacio
export const createEspacioController = async (req: any, res: any): Promise<any> => {
  const { nombre, descripcion, tipo, categoria, visible, orden } = req.body;
  if (!nombre || !tipo || !categoria) {
    return res.status(400).json({ error: "nombre, tipo y categoria son requeridos" });
  }
  try {
    const maxOrden = await EspacioModel.max<number, EspacioModel>("orden") ?? 0;
    const nuevo = await EspacioModel.create({
      nombre,
      descripcion: descripcion ?? "",
      tipo,
      categoria,
      visible: visible ?? true,
      orden: orden ?? (Number(maxOrden) + 1),
    });
    return res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al crear espacio:", error);
    return res.status(500).json({ error: "Error al crear espacio" });
  }
};

// PUT /espacios/:id — actualizar espacio
export const updateEspacioController = async (req: any, res: any): Promise<any> => {
  const { id } = req.params;
  const { nombre, descripcion, tipo, categoria, visible, orden } = req.body;
  try {
    const espacio = await EspacioModel.findByPk(id);
    if (!espacio) return res.status(404).json({ error: "Espacio no encontrado" });
    await espacio.update({ nombre, descripcion, tipo, categoria, visible, orden });
    return res.status(200).json(espacio);
  } catch (error) {
    console.error("Error al actualizar espacio:", error);
    return res.status(500).json({ error: "Error al actualizar espacio" });
  }
};

// DELETE /espacios/:id — eliminar espacio
export const deleteEspacioController = async (req: any, res: any): Promise<any> => {
  const { id } = req.params;
  try {
    const espacio = await EspacioModel.findByPk(id);
    if (!espacio) return res.status(404).json({ error: "Espacio no encontrado" });
    await espacio.destroy();
    return res.status(200).json({ message: "Espacio eliminado" });
  } catch (error) {
    console.error("Error al eliminar espacio:", error);
    return res.status(500).json({ error: "Error al eliminar espacio" });
  }
};
