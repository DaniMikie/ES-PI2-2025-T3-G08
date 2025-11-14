/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: passwordRoutes.ts
 * Data: 18/09/2025
 * 
 * Rotas de Recuperação de Senha
 * Define endpoints de recuperação e redefinição de senha
 */

import { Router } from "express";
import { requestReset, verifyCode, resetPassword } from "../controllers/passwordController";

const router = Router();

router.post("/request-reset", requestReset);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

export default router;
