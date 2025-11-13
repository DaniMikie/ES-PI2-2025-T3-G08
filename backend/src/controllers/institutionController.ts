/**
 * Controller de Instituições
 * Gerencia requisições HTTP de CRUD de instituições
 */

import { Request, Response } from "express";
import * as institutionService from "../services/institutionService";

export async function create(req: Request, res: Response) {
  const { institutionName, courseName } = req.body;
  const userId = (req as any).user.id;

  try {
    const result = await institutionService.createInstitution(userId, institutionName, courseName);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req: Request, res: Response) {
  const userId = (req as any).user.id;

  try {
    const institutions = await institutionService.getInstitutions(userId);
    res.status(200).json(institutions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const institution = await institutionService.getInstitution(Number(id));
    res.status(200).json(institution);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { institutionName, courseName } = req.body;
  const userId = (req as any).user.id;

  try {
    const result = await institutionService.updateInstitution(Number(id), userId, institutionName, courseName);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  const userId = (req as any).user.id;

  try {
    const result = await institutionService.deleteInstitution(Number(id), userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
