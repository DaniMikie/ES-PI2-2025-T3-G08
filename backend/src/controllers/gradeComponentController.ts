/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: gradeComponentController.ts
 * Data: 18/09/2025
 * 
 * Controller de Componentes de Avaliação
 * Gerencia requisições HTTP de CRUD de componentes de notas
 */

import { Request, Response } from "express";
import * as gradeComponentService from "../services/gradeComponentService";

export async function create(req: Request, res: Response) {
  const { subjectId, components, formula } = req.body;
  const userId = (req as any).user.id; // ID do usuário autenticado

  // Validação dos dados
  if (!subjectId || !components || !formula) {
    return res.status(400).json({ 
      error: 'Dados incompletos. Necessário: subjectId, components e formula',
      received: { subjectId, components, formula }
    });
  }

  if (!Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ 
      error: 'Components deve ser um array não vazio',
      received: components
    });
  }

  try {
    const result = await gradeComponentService.createGradeComponents(subjectId, components, formula, userId);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao criar componentes:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req: Request, res: Response) {
  const { subjectId } = req.params;

  try {
    const components = await gradeComponentService.getGradeComponents(Number(subjectId));
    const formula = await gradeComponentService.getFormula(Number(subjectId));
    
    // Retorna array vazio se não houver componentes
    res.status(200).json({ 
      components: components || [], 
      formula: formula || null 
    });
  } catch (error: any) {
    console.error('Erro ao buscar componentes:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  const { subjectId } = req.params;
  const userId = (req as any).user.id; // ID do usuário autenticado

  try {
    const result = await gradeComponentService.deleteGradeComponents(Number(subjectId), userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
