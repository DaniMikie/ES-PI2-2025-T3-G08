/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: authService.ts
 * Data: 10/10/2025
 * 
 * Serviço de Autenticação
 * Gerencia registro, login e verificação de usuários
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../db/database";

// Chave secreta para geração de tokens JWT
const SECRET = process.env.JWT_SECRET || "seuSegredoSuperSeguro123";

// Armazena códigos de verificação temporários em memória (Map)
// Estrutura: email -> { code, expiresAt, userData }
const verificationCodes = new Map<string, { code: string; expiresAt: number; userData: any }>();

/**
 * Registra novo usuário e envia código de verificação
 * Usuário só é criado no banco após verificar o código
 * name - Nome completo do usuário
 * email - Email do usuário
 * phone - Telefone do usuário
 * password - Senha em texto plano (será criptografada)
 * Retorna mensagem de sucesso
 */
export async function registerUser(name: string, email: string, phone: string, password: string) {
  // Validação: nome não pode estar vazio e deve ter apenas letras e espaços
  if (!name || name.trim().length === 0) {
    throw new Error("O nome não pode estar vazio.");
  }

  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
    throw new Error("O nome deve conter apenas letras e espaços.");
  }

  // Validação: email deve ser válido 
  if (!email || email.trim().length === 0) {
    throw new Error("O email não pode estar vazio.");
  }

  const emailRegex = /^[^\s]+@[^\s]+\.[^\s]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Email inválido.");
  }

  // Validação: telefone deve ter formato (00) 00000-0000 
  if (!phone || phone.trim().length === 0) {
    throw new Error("O telefone não pode estar vazio.");
  }

  const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Telefone inválido. Use o formato (00) 00000-0000.");
  }

  const phoneClean = phone.replace(/\D/g, ''); // Remove caracteres não numéricos para salvar

  // Validação: senha deve ter no mínimo 8 caracteres, 1 maiúscula e 1 minúscula
  if (!password || password.length < 8) {
    throw new Error("A senha deve ter no mínimo 8 caracteres.");
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!senhaRegex.test(password)) {
    throw new Error("A senha deve conter pelo menos uma letra maiúscula e uma minúscula.");
  }

  // Verifica se email já está cadastrado
  const userExists = await executeQuery(
    "SELECT id FROM users WHERE email = ?",
    [email.trim().toLowerCase()]
  );

  if (userExists.length > 0) {
    throw new Error("Usuário já existe");
  }

  // Gera código aleatório de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Define expiração do código (15 minutos)
  const expiresAt = Date.now() + 15 * 60 * 1000;

  // Criptografa senha com bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Armazena dados temporariamente até verificação do código
  const emailNormalized = email.trim().toLowerCase();
  verificationCodes.set(emailNormalized, {
    code,
    expiresAt,
    userData: { name: name.trim(), email: emailNormalized, phone: phoneClean, password: hashedPassword }
  });

  // Envia email de verificação
  try {
    const { sendVerificationEmail } = await import("./emailService");
    await sendVerificationEmail(emailNormalized, code, name.trim());
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error("Erro ao enviar email de verificação. Tente novamente mais tarde.");
  }

  return {
    message: "Código de verificação enviado para o email"
  };
}

/**
 * Verifica código de confirmação e cria usuário no banco
 * email - Email do usuário
 * code - Código de 6 dígitos recebido por email
 * Retorna dados do usuário criado
 */
export async function verifyRegistrationCode(email: string, code: string) {
  // Validação: código deve ter exatamente 6 dígitos
  if (!code || !/^\d{6}$/.test(code)) {
    throw new Error("Código inválido. Deve conter 6 dígitos.");
  }

  const emailNormalized = email.trim().toLowerCase();
  const stored = verificationCodes.get(emailNormalized);

  // Verifica se código existe
  if (!stored) {
    throw new Error("Código não encontrado ou expirado");
  }

  // Verifica se código expirou (15 minutos)
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(emailNormalized);
    throw new Error("Código expirado");
  }

  // Verifica se código está correto
  if (stored.code !== code) {
    throw new Error("Código inválido");
  }

  // Código válido - cria usuário no banco de dados
  const { name, email: userEmail, phone, password } = stored.userData;
  
  const result = await executeQuery(
    "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)",
    [name, userEmail, phone, password]
  );

  // Remove código usado da memória
  verificationCodes.delete(emailNormalized);

  return {
    id: result.insertId,
    name,
    email: userEmail,
    phone
  };
}

/**
 * Autentica usuário e gera token JWT
 * email - Email do usuário
 * password - Senha em texto plano
 * Retorna token JWT e dados do usuário
 */
export async function loginUser(email: string, password: string) {
  // Validação: email não pode estar vazio
  if (!email || email.trim().length === 0) {
    throw new Error("O email não pode estar vazio.");
  }

  // Validação: senha não pode estar vazia
  if (!password || password.length === 0) {
    throw new Error("A senha não pode estar vazia.");
  }

  const emailNormalized = email.trim().toLowerCase();

  // Busca usuário no banco de dados
  const users = await executeQuery(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [emailNormalized]
  );

  if (users.length === 0) {
    throw new Error("Usuário não encontrado");
  }

  const user = users[0];

  // Compara senha fornecida com hash armazenado
  const senhaValida = await bcrypt.compare(password, user.password_hash);
  if (!senhaValida) {
    throw new Error("Senha incorreta");
  }

  // Gera token JWT válido por 24 horas
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "24h" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}
