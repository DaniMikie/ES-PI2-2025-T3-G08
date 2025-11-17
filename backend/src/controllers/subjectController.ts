/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: subjectController.ts
 * Data: 15/10/2025
 * 
 * Controller de Disciplinas
 * Gerencia requisições HTTP de CRUD de disciplinas
 */

import { Request, Response } from "express";
import * as subjectService from "../services/subjectService";

export async function create(req: Request, res: Response) {
  const { courseId, name, code, abbreviation, semester } = req.body;

  try {
    const result = await subjectService.createSubject(courseId, name, code, abbreviation, semester);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req: Request, res: Response) {
  const { courseId } = req.params;

  try {
    const subjects = await subjectService.getSubjects(Number(courseId));
    res.status(200).json(subjects);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const subject = await subjectService.getSubject(Number(id));
    res.status(200).json(subject);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, code, abbreviation, semester } = req.body;

  try {
    const result = await subjectService.updateSubject(Number(id), name, code, abbreviation, semester);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const result = await subjectService.deleteSubject(Number(id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
