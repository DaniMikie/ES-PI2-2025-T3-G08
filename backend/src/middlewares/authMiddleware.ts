/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: authMiddleware.ts
 * Data: 18/09/2025
 * 
 * Middleware de Autenticação JWT
 * Verifica se requisição possui token válido no header Authorization
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Chave secreta para validar tokens JWT
const SECRET = process.env.JWT_SECRET || "seuSegredoSuperSeguro123";

/**
 * Middleware que valida token JWT em rotas protegidas
 * Formato esperado: Authorization: Bearer <token>
 * req - Requisição HTTP
 * res - Resposta HTTP
 * next - Função para passar para próximo middleware
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Busca header Authorization
  const authHeader = req.headers.authorization;

  // Retorna erro se header não existir
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  // Extrai token do formato "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verifica e decodifica token JWT
    const decoded = jwt.verify(token, SECRET);
    
    // Adiciona dados do usuário na requisição para uso posterior
    (req as any).user = decoded;
    
    // Permite que requisição continue para rota
    next();
  } catch (error) {
    // Retorna erro se token for inválido ou expirado
    return res.status(401).json({ error: "Token inválido" });
  }
}
