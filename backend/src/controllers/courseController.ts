/**
 * Controller de Cursos
 * Gerencia requisições HTTP de consulta de cursos
 */

import { Request, Response } from "express";
import * as courseService from "../services/courseService";

export async function getOne(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const course = await courseService.getCourse(Number(id));
    res.status(200).json(course);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
