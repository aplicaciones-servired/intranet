import { ConfigModel } from "../models/config.model";

// GET /config/:clave
export const getConfigController = async (req: any, res: any): Promise<any> => {
  const { clave } = req.params;
  try {
    const config = await ConfigModel.findOne({ where: { clave } });
    if (!config) {
      return res.status(200).json({ clave, valor: null });
    }
    return res.status(200).json({ clave: config.clave, valor: config.valor });
  } catch (error) {
    console.error("Error al obtener config:", error);
    return res.status(500).json({ error: "Error al obtener configuración" });
  }
};

// POST /config  — body: { clave, valor }
export const setConfigController = async (req: any, res: any): Promise<any> => {
  const { clave, valor } = req.body;
  if (!clave || !valor) {
    return res.status(400).json({ error: "clave y valor son requeridos" });
  }
  try {
    const [config, created] = await ConfigModel.upsert({ clave, valor });
    return res.status(200).json({
      message: created ? "Configuración creada" : "Configuración actualizada",
      clave,
      valor,
    });
  } catch (error) {
    console.error("Error al guardar config:", error);
    return res.status(500).json({ error: "Error al guardar configuración" });
  }
};
