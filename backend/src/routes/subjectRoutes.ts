/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: subjectRoutes.ts
 * Data: 18/09/2025
 * 
 * Rotas de Disciplinas
 * Define endpoints de CRUD de disciplinas
 */

import { Router } from "express";
import { create, getAll, getOne, update, remove } from "../controllers/subjectController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, create);
router.get("/course/:courseId", authMiddleware, getAll);
router.get("/:id", authMiddleware, getOne);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

export default router;
