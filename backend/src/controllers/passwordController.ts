/**
 * Controller de Recuperação de Senha
 * Gerencia requisições HTTP de recuperação e redefinição de senha
 */

import { Request, Response } from "express";
import * as passwordService from "../services/passwordService";

export async function requestReset(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const result = await passwordService.requestPasswordReset(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function verifyCode(req: Request, res: Response) {
  const { email, code } = req.body;

  try {
    const result = await passwordService.verifyResetCode(email, code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, newPassword } = req.body;

  try {
    const result = await passwordService.resetPassword(email, code, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
