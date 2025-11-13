/**
 * Controller de Turmas
 * Gerencia requisições HTTP de CRUD de turmas
 */

import { Request, Response } from "express";
import * as classService from "../services/classService";

export async function create(req: Request, res: Response) {
  const { subjectId, name, code } = req.body;

  try {
    const result = await classService.createClass(subjectId, name, code);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req: Request, res: Response) {
  const { subjectId } = req.params;

  try {
    const classes = await classService.getClasses(Number(subjectId));
    res.status(200).json(classes);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, code } = req.body;

  try {
    const result = await classService.updateClass(Number(id), name, code);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const result = await classService.deleteClass(Number(id));
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
