/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: gradeService.ts
 * Data: 18/09/2025
 * 
 * Serviço de Notas
 * Gerencia lançamento e consulta de notas dos alunos
 */

import { executeQuery } from "../db/database";
import { createAuditLog } from "./gradeAuditService";

/**
 * Salva ou atualiza nota de um aluno (com auditoria)
 * studentId - ID do aluno
 * gradeComponentId - ID do componente de avaliação
 * grade - Nota (0-10 com até 2 casas decimais) ou null
 * userId - ID do usuário (para auditoria)
 */
export async function saveGrade(studentId: number, gradeComponentId: number, grade: number | null, userId: number) {
  // Validação da nota: deve estar entre 0 e 10, com no máximo 2 casas decimais
  if (grade !== null) {
    // Converte para número se vier como string
    const gradeNum = typeof grade === 'string' ? parseFloat(grade) : grade;
    
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
      throw new Error("Nota inválida. Deve estar entre 0 e 10.");
    }

    // Verifica se tem no máximo 2 casas decimais
    const gradeStr = gradeNum.toString();
    const decimalPlaces = (gradeStr.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new Error("Nota inválida. Deve ter no máximo 2 casas decimais.");
    }

    // Arredonda para 2 casas decimais para garantir formato correto (00.00)
    grade = Math.round(gradeNum * 100) / 100;
  }

  // Verifica se já existe uma nota
  const existing = await executeQuery(
    "SELECT id, grade FROM grades WHERE student_id = ? AND grade_component_id = ?",
    [studentId, gradeComponentId]
  );

  if (existing.length > 0) {
    // Atualiza
    const oldGrade = existing[0].grade;
    
    await executeQuery(
      "UPDATE grades SET grade = ? WHERE student_id = ? AND grade_component_id = ?",
      [grade, studentId, gradeComponentId]
    );

    // Registra auditoria
    await createAuditLog(studentId, gradeComponentId, oldGrade, grade, 'UPDATE', userId);
  } else {
    // Insere
    await executeQuery(
      "INSERT INTO grades (student_id, grade_component_id, grade) VALUES (?, ?, ?)",
      [studentId, gradeComponentId, grade]
    );

    // Registra auditoria
    await createAuditLog(studentId, gradeComponentId, null, grade, 'INSERT', userId);
  }

  return { success: true };
}

export async function getGrades(studentId: number) {
  const grades = await executeQuery(
    "SELECT grade_component_id, grade FROM grades WHERE student_id = ?",
    [studentId]
  );

  return grades;
}

export async function getGradesByClass(classId: number) {
  const grades = await executeQuery(
    `SELECT g.student_id, g.grade_component_id, g.grade, gc.name as component_name
     FROM grades g
     INNER JOIN students s ON g.student_id = s.id
     INNER JOIN grade_components gc ON g.grade_component_id = gc.id
     WHERE s.class_id = ?`,
    [classId]
  );

  return grades;
}
