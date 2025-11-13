/**
 * Controller de Notas
 * Gerencia requisições HTTP de lançamento e consulta de notas
 */

import { Request, Response } from "express";
import * as gradeService from "../services/gradeService";

export async function save(req: Request, res: Response) {
  const { studentId, gradeComponentId, grade } = req.body;
  const userId = (req as any).user.id; // ID do usuário autenticado

  try {
    const result = await gradeService.saveGrade(studentId, gradeComponentId, grade, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getByStudent(req: Request, res: Response) {
  const { studentId } = req.params;

  try {
    const grades = await gradeService.getGrades(Number(studentId));
    res.status(200).json(grades);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getByClass(req: Request, res: Response) {
  const { classId } = req.params;

  try {
    const grades = await gradeService.getGradesByClass(Number(classId));
    res.status(200).json(grades);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
