/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: passwordService.ts
 * Data: 18/10/2025
 * 
 * Serviço de Recuperação de Senha
 * Gerencia solicitação e redefinição de senha via código
 */

import bcrypt from "bcryptjs";
import { executeQuery } from "../db/database";

// Armazena códigos temporários em memória (Map)
// Estrutura: email -> { code, expiresAt }
const resetCodes = new Map<string, { code: string; expiresAt: number }>();

/**
 * Solicita recuperação de senha e envia código por email
 * email - Email do usuário
 */
export async function requestPasswordReset(email: string) {
  // Validação: email não pode estar vazio
  if (!email || email.trim().length === 0) {
    throw new Error("O email não pode estar vazio.");
  }

  const emailNormalized = email.trim().toLowerCase();

  // Verifica se o usuário existe
  const users = await executeQuery(
    "SELECT id, name FROM users WHERE email = ?",
    [emailNormalized]
  );

  if (users.length === 0) {
    throw new Error("Usuário não encontrado");
  }

  const user = users[0];

  // Gera código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Expira em 15 minutos
  const expiresAt = Date.now() + 15 * 60 * 1000;

  // Armazena o código
  resetCodes.set(emailNormalized, { code, expiresAt });

  // Envia email de recuperação
  try {
    const { sendPasswordResetEmail } = await import("./emailService");
    await sendPasswordResetEmail(emailNormalized, code, user.name);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error("Erro ao enviar email de recuperação. Tente novamente mais tarde.");
  }

  return {
    message: "Código enviado para o email"
  };
}

/**
 * Verifica se código de recuperação é válido
 * email - Email do usuário
 * code - Código de 6 dígitos
 */
export async function verifyResetCode(email: string, code: string) {
  // Validação: código deve ter 6 dígitos
  if (!code || !/^\d{6}$/.test(code)) {
    throw new Error("Código inválido. Deve conter 6 dígitos.");
  }

  const emailNormalized = email.trim().toLowerCase();
  const stored = resetCodes.get(emailNormalized);

  if (!stored) {
    throw new Error("Código não encontrado ou expirado");
  }

  if (Date.now() > stored.expiresAt) {
    resetCodes.delete(emailNormalized);
    throw new Error("Código expirado");
  }

  if (stored.code !== code) {
    throw new Error("Código inválido");
  }

  return { valid: true };
}

/**
 * Redefine senha do usuário após verificar código
 * email - Email do usuário
 * code - Código de verificação
 * newPassword - Nova senha em texto plano (será criptografada)
 */
export async function resetPassword(email: string, code: string, newPassword: string) {
  // Validação: senha deve ter no mínimo 8 caracteres, 1 maiúscula e 1 minúscula
  if (!newPassword || newPassword.length < 8) {
    throw new Error("A senha deve ter no mínimo 8 caracteres.");
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!senhaRegex.test(newPassword)) {
    throw new Error("A senha deve conter pelo menos uma letra maiúscula e uma minúscula.");
  }

  const emailNormalized = email.trim().toLowerCase();

  // Verifica o código novamente
  await verifyResetCode(emailNormalized, code);

  // Hash da nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualiza a senha
  await executeQuery(
    "UPDATE users SET password_hash = ? WHERE email = ?",
    [hashedPassword, emailNormalized]
  );

  // Remove o código usado
  resetCodes.delete(emailNormalized);

  return { success: true };
}
