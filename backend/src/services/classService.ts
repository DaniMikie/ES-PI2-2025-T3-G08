/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: classService.ts
 * Data: 18/10/2025
 * 
 * Serviço de Turmas
 * Gerencia CRUD de turmas das disciplinas
 */

import { executeQuery } from "../db/database";

/**
 * Cria nova turma em uma disciplina
 * subjectId - ID da disciplina
 * name - Nome da turma
 * code - Código da turma
 */
export async function createClass(subjectId: number, name: string, code: string) {
  // Validação: nome não pode estar vazio e deve conter apenas letras, números e espaços (máscara frontend)
  if (!name || name.trim().length === 0) {
    throw new Error("O nome da turma não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error("O nome da turma deve conter apenas letras, números e espaços.");
  }

  // Validação: código não pode estar vazio
  if (!code || code.trim().length === 0) {
    throw new Error("O código da turma não pode estar vazio.");
  }

  // Validação: código deve ter 1 letra maiúscula + 1 a 3 números (ex: T101, G204)
  if (!/^[A-Z]\d{1,3}$/.test(code.trim())) {
    throw new Error("O código da turma deve ter 1 letra maiúscula seguida de 1 a 3 números (ex: T101, G204).");
  }

  // Verifica duplicata de nome na mesma disciplina
  const existingName = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND name = ?",
    [subjectId, name.trim()]
  );

  if (existingName.length > 0) {
    throw new Error(`Já existe uma turma cadastrada com o nome "${name}" nesta disciplina.`);
  }

  // Verifica duplicata de código na mesma disciplina
  const existingCode = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND code = ?",
    [subjectId, code.trim()]
  );

  if (existingCode.length > 0) {
    throw new Error(`Já existe uma turma cadastrada com o código "${code}" nesta disciplina.`);
  }

  const result = await executeQuery(
    "INSERT INTO classes (subject_id, name, code) VALUES (?, ?, ?)",
    [subjectId, name.trim(), code.trim()]
  );

  return {
    id: result.insertId,
    subjectId,
    name: name.trim(),
    code: code.trim()
  };
}

/**
 * Lista todas as turmas de uma disciplina
 * subjectId - ID da disciplina
 */
export async function getClasses(subjectId: number) {
  const classes = await executeQuery(
    "SELECT id, name, code FROM classes WHERE subject_id = ? ORDER BY id DESC",
    [subjectId]
  );

  return classes;
}

/**
 * Atualiza dados de uma turma
 * classId - ID da turma
 * name - Novo nome
 * code - Novo código
 */
export async function updateClass(classId: number, name: string, code: string) {
  // Validação: nome não pode estar vazio e deve conter apenas letras, números e espaços (máscara frontend)
  if (!name || name.trim().length === 0) {
    throw new Error("O nome da turma não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error("O nome da turma deve conter apenas letras, números e espaços.");
  }

  // Validação: código não pode estar vazio
  if (!code || code.trim().length === 0) {
    throw new Error("O código da turma não pode estar vazio.");
  }

  // Validação: código deve ter 1 letra maiúscula + 1 a 3 números (ex: T101, G204)
  if (!/^[A-Z]\d{1,3}$/.test(code.trim())) {
    throw new Error("O código da turma deve ter 1 letra maiúscula seguida de 1 a 3 números (ex: T101, G204).");
  }

  // Busca a disciplina da turma
  const classData = await executeQuery(
    "SELECT subject_id FROM classes WHERE id = ?",
    [classId]
  );

  if (classData.length === 0) {
    throw new Error("Turma não encontrada.");
  }

  // Verifica duplicata de nome na mesma disciplina (exceto a própria turma)
  const existingName = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND name = ? AND id != ?",
    [classData[0].subject_id, name.trim(), classId]
  );

  if (existingName.length > 0) {
    throw new Error(`Já existe outra turma cadastrada com o nome "${name}" nesta disciplina.`);
  }

  // Verifica duplicata de código na mesma disciplina (exceto a própria turma)
  const existingCode = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND code = ? AND id != ?",
    [classData[0].subject_id, code.trim(), classId]
  );

  if (existingCode.length > 0) {
    throw new Error(`Já existe outra turma cadastrada com o código "${code}" nesta disciplina.`);
  }

  await executeQuery(
    "UPDATE classes SET name = ?, code = ? WHERE id = ?",
    [name.trim(), code.trim(), classId]
  );

  return { success: true };
}

/**
 * Busca informações sobre o que será excluído ao deletar uma turma
 * classId - ID da turma
 */
export async function getClassDeletionInfo(classId: number) {
  // Busca informações da turma
  const classInfo = await executeQuery(
    "SELECT name, code FROM classes WHERE id = ?",
    [classId]
  );

  if (classInfo.length === 0) {
    throw new Error("Turma não encontrada.");
  }

  // Conta quantos alunos serão excluídos
  const students = await executeQuery(
    "SELECT COUNT(*) as count FROM students WHERE class_id = ?",
    [classId]
  );

  // Conta quantas notas serão excluídas
  const grades = await executeQuery(
    "SELECT COUNT(*) as count FROM grades WHERE student_id IN (SELECT id FROM students WHERE class_id = ?)",
    [classId]
  );

  // Monta a mensagem completa
  let message = `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n`;
  message += `Ao excluir a turma "${classInfo[0].name}" (${classInfo[0].code}), serão excluídos:\n\n`;
  message += `• ${students[0].count} aluno(s) cadastrado(s)\n`;
  message += `• ${grades[0].count} nota(s) registrada(s)\n\n`;
  message += `Os componentes de nota e fórmula da disciplina NÃO serão excluídos (são compartilhados entre turmas).\n\n`;
  message += `Tem certeza que deseja continuar?`;

  return {
    message: message
  };
}

/**
 * Deleta turma e todos os dados relacionados (alunos, notas)
 * classId - ID da turma
 * userId - ID do usuário que está deletando (para auditoria)
 */
export async function deleteClass(classId: number, userId: number) {
  // Busca todas as notas dos alunos da turma para registrar na auditoria
  const grades = await executeQuery(
    `SELECT g.id, g.student_id, g.grade_component_id, g.grade
     FROM grades g
     INNER JOIN students s ON g.student_id = s.id
     WHERE s.class_id = ?`,
    [classId]
  );

  // Registra auditoria para cada nota excluída
  const { createAuditLog } = await import("./gradeAuditService");
  for (const grade of grades) {
    await createAuditLog(
      grade.student_id,
      grade.grade_component_id,
      grade.grade,
      null,
      'DELETE',
      userId
    );
  }

  // Deleta a turma (CASCADE vai excluir alunos e notas automaticamente)
  await executeQuery("DELETE FROM classes WHERE id = ?", [classId]);
  return { success: true };
}
