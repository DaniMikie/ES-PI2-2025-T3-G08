/**
 * Serviço de Cursos
 * Gerencia busca de cursos
 */

import { executeQuery } from "../db/database";

/**
 * Busca curso por ID
 * courseId - ID do curso
 */
export async function getCourse(courseId: number) {
  const courses = await executeQuery(
    "SELECT id, name, institution_id FROM courses WHERE id = ?",
    [courseId]
  );

  if (courses.length === 0) {
    throw new Error("Curso não encontrado");
  }

  return courses[0];
}
