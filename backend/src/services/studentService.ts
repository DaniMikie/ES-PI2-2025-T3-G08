/**
 * Serviço de Alunos
 * Gerencia CRUD de alunos das turmas
 */

import { executeQuery } from "../db/database";

/**
 * Cria novo aluno em uma turma
 * classId - ID da turma
 * studentId - RA do aluno (8 dígitos)
 * name - Nome completo do aluno
 */
export async function createStudent(classId: number, studentId: string, name: string) {
  // Validação do RA: exatamente 8 dígitos
  if (!/^\d{8}$/.test(studentId)) {
    throw new Error("RA inválido. Deve conter exatamente 8 dígitos.");
  }

  // Validação do nome: apenas letras 
  if (!/^[A-Za-z\s]+$/.test(name) || name.trim().length === 0) {
    throw new Error("Nome inválido. Deve conter apenas letras e espaços.");
  }

  // Verifica duplicata de RA na mesma turma
  const existing = await executeQuery(
    "SELECT id FROM students WHERE class_id = ? AND student_id = ?",
    [classId, studentId]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe um aluno cadastrado com o RA ${studentId} nesta turma.`);
  }

  const result = await executeQuery(
    "INSERT INTO students (class_id, student_id, name) VALUES (?, ?, ?)",
    [classId, studentId, name]
  );

  return {
    id: result.insertId,
    classId,
    studentId,
    name
  };
}

/**
 * Lista todos os alunos de uma turma
 * classId - ID da turma
 */
export async function getStudents(classId: number) {
  const students = await executeQuery(
    "SELECT id, student_id, name FROM students WHERE class_id = ? ORDER BY name",
    [classId]
  );

  return students;
}

/**
 * Atualiza dados de um aluno
 * id - ID do aluno
 * studentId - Novo RA (8 dígitos)
 * name - Novo nome
 */
export async function updateStudent(id: number, studentId: string, name: string) {
  // Validação do RA: exatamente 8 dígitos
  if (!/^\d{8}$/.test(studentId)) {
    throw new Error("RA inválido. Deve conter exatamente 8 dígitos.");
  }

  // Validação do nome: apenas letras e espaços 
  if (!/^[A-Za-z\s]+$/.test(name) || name.trim().length === 0) {
    throw new Error("Nome inválido. Deve conter apenas letras e espaços.");
  }

  // Busca a turma do aluno
  const student = await executeQuery(
    "SELECT class_id FROM students WHERE id = ?",
    [id]
  );

  if (student.length === 0) {
    throw new Error("Aluno não encontrado.");
  }

  // Verifica duplicata de RA na mesma turma (exceto o próprio aluno)
  const existing = await executeQuery(
    "SELECT id FROM students WHERE class_id = ? AND student_id = ? AND id != ?",
    [student[0].class_id, studentId, id]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe outro aluno cadastrado com o RA ${studentId} nesta turma.`);
  }

  await executeQuery(
    "UPDATE students SET student_id = ?, name = ? WHERE id = ?",
    [studentId, name, id]
  );

  return { success: true };
}

/**
 * Deleta aluno e registra auditoria das notas excluídas
 * id - ID do aluno
 * userId - ID do usuário (para auditoria)
 */
export async function deleteStudent(id: number, userId: number) {
  // Busca todas as notas do aluno para registrar na auditoria
  const grades = await executeQuery(
    "SELECT grade_component_id, grade FROM grades WHERE student_id = ?",
    [id]
  );

  // Registra auditoria para cada nota excluída
  const { createAuditLog } = await import("./gradeAuditService");
  for (const grade of grades) {
    await createAuditLog(
      id,
      grade.grade_component_id,
      grade.grade,
      null,
      'DELETE',
      userId
    );
  }

  // Exclui o aluno (CASCADE vai excluir as notas automaticamente)
  await executeQuery("DELETE FROM students WHERE id = ?", [id]);
  return { success: true };
}

/**
 * Exporta alunos de uma turma em formato CSV
 * classId - ID da turma
 */
export async function exportStudentsCSV(classId: number) {
  // Busca os alunos da turma ordenados por nome
  const students = await executeQuery(
    "SELECT student_id, name FROM students WHERE class_id = ? ORDER BY name",
    [classId]
  );

  // Função para remover acentos
  const removerAcentos = (texto: string) => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Monta o CSV
  const linhas = ['RA;Nome'];
  
  students.forEach((student: any) => {
    const ra = student.student_id;
    const nome = removerAcentos(student.name);
    linhas.push(`${ra};${nome}`);
  });

  return linhas.join('\n');
}
