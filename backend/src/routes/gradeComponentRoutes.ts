/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: gradeComponentRoutes.ts
 * Data: 28/10/2025
 * 
 * Rotas de Componentes de Avaliação
 * Define endpoints de CRUD de componentes de notas
 */

import { Router } from "express";
import { create, getAll, remove } from "../controllers/gradeComponentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/subject/:subjectId", authMiddleware, getAll);
router.delete("/subject/:subjectId", authMiddleware, remove);

export default router;
