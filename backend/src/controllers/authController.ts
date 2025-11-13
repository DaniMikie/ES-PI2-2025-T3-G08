/**
 * Controller de Autenticação
 * Gerencia requisições HTTP de registro, login e verificação
 */

import { Request, Response } from "express";
import * as authService from "../services/authService";

/**
 * POST /api/auth/register - Registra novo usuário
 */
export async function register(req: Request, res: Response) {
  const { name, email, phone, password } = req.body;
  
  try {
    const result = await authService.registerUser(name, email, phone, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/auth/verify-code - Verifica código e cria usuário
 */
export async function verifyCode(req: Request, res: Response) {
  const { email, code } = req.body;
  
  try {
    const result = await authService.verifyRegistrationCode(email, code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/auth/login - Autentica usuário e retorna token JWT
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  
  try {
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
