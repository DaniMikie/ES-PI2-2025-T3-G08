/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: studentController.ts
 * Data: 19/09/2025
 * 
 * Controller de Alunos
 * Gerencia requisições HTTP de CRUD de alunos
 */

import { Request, Response } from "express";
import * as studentService from "../services/studentService";

export async function create(req: Request, res: Response) {
  const { classId, studentId, name } = req.body;

  try {
    const result = await studentService.createStudent(classId, studentId, name);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req: Request, res: Response) {
  const { classId } = req.params;

  try {
    const students = await studentService.getStudents(Number(classId));
    res.status(200).json(students);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { studentId, name } = req.body;

  try {
    const result = await studentService.updateStudent(Number(id), studentId, name);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const userId = (req as any).user.id; // ID do usuário autenticado

  try {
    const result = await studentService.deleteStudent(Number(id), userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function exportCSV(req: Request, res: Response) {
  const { classId } = req.params;

  try {
    const csvContent = await studentService.exportStudentsCSV(Number(classId));
    
    // Define headers para download do arquivo CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=alunos_turma_${classId}_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
