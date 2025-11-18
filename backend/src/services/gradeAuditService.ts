/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: gradeAuditService.ts
 * Data: 28/10/2025
 * 
 * Serviço de Auditoria de Notas
 * Registra histórico de alterações em notas
 */

import { executeQuery } from "../db/database";

export async function createAuditLog(
  studentId: number,
  gradeComponentId: number,
  oldGrade: number | null,
  newGrade: number | null,
  actionType: 'INSERT' | 'UPDATE' | 'DELETE',
  userId: number
) {
  try {
    await executeQuery(
      `INSERT INTO grade_audit (student_id, grade_component_id, old_grade, new_grade, action_type, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, gradeComponentId, oldGrade, newGrade, actionType, userId]
    );
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    // Não lança erro para não interromper a operação principal
  }
}
