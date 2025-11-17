/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: classRoutes.ts
 * Data: 18/10/2025
 * 
 * Rotas de Turmas
 * Define endpoints de CRUD de turmas
 */

import { Router } from "express";
import { create, getAll, update, remove, getDeletionInfo } from "../controllers/classController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/subject/:subjectId", authMiddleware, getAll);
router.get("/:id/deletion-info", authMiddleware, getDeletionInfo);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
