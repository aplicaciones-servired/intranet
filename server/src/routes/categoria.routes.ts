import { Router } from "express";
import {
  getCategoriasController,
  createCategoriaController,
  updateCategoriaController,
  deleteCategoriaController,
} from "../controllers/categoria.controller";
import { requireAdmin } from "../Miderlware/authMiddleware";

export const categoriaRoutes = Router();

// GET es público (se usa en la intranet para mostrar el menú)
categoriaRoutes.get("/categorias", getCategoriasController);
// Escritura solo para admins autenticados
categoriaRoutes.post("/categorias", requireAdmin, createCategoriaController);
categoriaRoutes.put("/categorias/:id", requireAdmin, updateCategoriaController);
categoriaRoutes.delete("/categorias/:id", requireAdmin, deleteCategoriaController);
