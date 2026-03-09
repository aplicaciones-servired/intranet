import { Router } from "express";
import {
  getCategoriasController,
  createCategoriaController,
  updateCategoriaController,
  deleteCategoriaController,
} from "../controllers/categoria.controller";
import { requireClerkAuth } from "../Miderlware/authMiddleware";

export const categoriaRoutes = Router();

// GET es público (se usa en la intranet para mostrar el menú)
categoriaRoutes.get("/categorias", getCategoriasController);
// Escritura solo para admins autenticados
categoriaRoutes.post("/categorias", requireClerkAuth, createCategoriaController);
categoriaRoutes.put("/categorias/:id", requireClerkAuth, updateCategoriaController);
categoriaRoutes.delete("/categorias/:id", requireClerkAuth, deleteCategoriaController);
