/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: courseRoutes.ts
 * Data: 13/10/2025
 * 
 * Rotas de Cursos
 * Define endpoints de consulta de cursos
 */

import { Router } from "express";
import { getOne } from "../controllers/courseController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/:id", authMiddleware, getOne);

export default router;
