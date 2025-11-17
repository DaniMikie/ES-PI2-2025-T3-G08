/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: institutionRoutes.ts
 * Data: 12/10/2025
 * 
 * Rotas de Instituições
 * Define endpoints de CRUD de instituições
 */

import { Router } from "express";
import { create, getAll, getOne, update, remove } from "../controllers/institutionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, getAll);
router.get("/:id", authMiddleware, getOne);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
