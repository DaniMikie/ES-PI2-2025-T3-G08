/**
 * Rotas de Autenticação
 * Define endpoints de login, registro e verificação
 */

import { Router } from "express";
import { login, register, verifyCode } from "../controllers/authController";

const router = Router();

// POST /api/auth/login - Autenticar usuário
router.post("/login", login);

// POST /api/auth/register - Registrar novo usuário
router.post("/register", register);

// POST /api/auth/verify-code - Verificar código de confirmação
router.post("/verify-code", verifyCode);

export default router;
