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

  // Verifica duplicata de código na mesma disciplina
  const existing = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND code = ?",
    [subjectId, code.trim()]
  );

  if (existing.length > 0) {
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

  // Busca a disciplina da turma
  const classData = await executeQuery(
    "SELECT subject_id FROM classes WHERE id = ?",
    [classId]
  );

  if (classData.length === 0) {
    throw new Error("Turma não encontrada.");
  }

  // Verifica duplicata de código na mesma disciplina (exceto a própria turma)
  const existing = await executeQuery(
    "SELECT id FROM classes WHERE subject_id = ? AND code = ? AND id != ?",
    [classData[0].subject_id, code.trim(), classId]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe outra turma cadastrada com o código "${code}" nesta disciplina.`);
  }

  await executeQuery(
    "UPDATE classes SET name = ?, code = ? WHERE id = ?",
    [name.trim(), code.trim(), classId]
  );

  return { success: true };
}

/**
 * Deleta turma (com verificação de safe deletion)
 * classId - ID da turma
 */
export async function deleteClass(classId: number) {
  // SAFE DELETION: Verifica se existem alunos cadastrados
  const students = await executeQuery(
    "SELECT COUNT(*) as count FROM students WHERE class_id = ?",
    [classId]
  );

  if (students[0].count > 0) {
    throw new Error("Não é possível excluir esta turma pois existem alunos cadastrados. Exclua os alunos primeiro.");
  }

  await executeQuery("DELETE FROM classes WHERE id = ?", [classId]);
  return { success: true };
}
