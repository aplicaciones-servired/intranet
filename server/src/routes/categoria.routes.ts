import { Router } from "express";
import {
  getCategoriasController,
  createCategoriaController,
  updateCategoriaController,
  deleteCategoriaController,
} from "../controllers/categoria.controller";

export const categoriaRoutes = Router();

categoriaRoutes.get("/categorias", getCategoriasController);
categoriaRoutes.post("/categorias", createCategoriaController);
categoriaRoutes.put("/categorias/:id", updateCategoriaController);
categoriaRoutes.delete("/categorias/:id", deleteCategoriaController);
