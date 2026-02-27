import { CategoriaModel } from "../models/categoria.model";

// GET /categorias — todas las activas (para la intranet)
export const getCategoriasController = async (_req: any, res: any): Promise<any> => {
  try {
    const categorias = await CategoriaModel.findAll({
      order: [["orden", "ASC"]],
    });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res.status(500).json({ error: "Error al obtener categorías" });
  }
};

// POST /categorias — crear nueva categoría
export const createCategoriaController = async (req: any, res: any): Promise<any> => {
  const { label, value, orden, activa } = req.body;
  if (!label || !value) {
    return res.status(400).json({ error: "label y value son requeridos" });
  }
  try {
    const existing = await CategoriaModel.findOne({ where: { value } });
    if (existing) {
      return res.status(409).json({ error: "Ya existe una categoría con ese valor" });
    }
    const maxOrden = await CategoriaModel.max<number, CategoriaModel>("orden") ?? 0;
    const nueva = await CategoriaModel.create({
      label,
      value,
      orden: orden ?? (Number(maxOrden) + 1),
      activa: activa ?? true,
    });
    return res.status(201).json(nueva);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return res.status(500).json({ error: "Error al crear categoría" });
  }
};

// PUT /categorias/:id — actualizar categoría
export const updateCategoriaController = async (req: any, res: any): Promise<any> => {
  const { id } = req.params;
  const { label, value, orden, activa } = req.body;
  try {
    const cat = await CategoriaModel.findByPk(id);
    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
    await cat.update({ label, value, orden, activa });
    return res.status(200).json(cat);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

// DELETE /categorias/:id — eliminar categoría
export const deleteCategoriaController = async (req: any, res: any): Promise<any> => {
  const { id } = req.params;
  try {
    const cat = await CategoriaModel.findByPk(id);
    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
    await cat.destroy();
    return res.status(200).json({ message: "Categoría eliminada" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.status(500).json({ error: "Error al eliminar categoría" });
  }
};
