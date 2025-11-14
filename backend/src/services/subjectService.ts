/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: subjectService.ts
 * Data: 18/09/2025
 * 
 * Serviço de Disciplinas
 * Gerencia CRUD de disciplinas dos cursos
 */

import { executeQuery } from "../db/database";

/**
 * Cria nova disciplina em um curso
 * courseId - ID do curso
 * name - Nome da disciplina
 * code - Código da disciplina
 * abbreviation - Sigla da disciplina
 * semester - Semestre (ex: "1° Semestre")
 */
export async function createSubject(courseId: number, name: string, code: string, abbreviation: string, semester: string) {
  // Validação: nome não pode estar vazio e deve conter apenas letras, números e espaços
  if (!name || name.trim().length === 0) {
    throw new Error("O nome da disciplina não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error("O nome da disciplina deve conter apenas letras, números e espaços.");
  }

  // Validação: código deve ter exatamente 5 dígitos (máscara: 00000)
  if (!code || !/^\d{5}$/.test(code)) {
    throw new Error("O código da disciplina deve ter exatamente 5 dígitos.");
  }

  // Validação: sigla deve ter 2-4 caracteres alfanuméricos (máscara: slice(0,4))
  if (!abbreviation || abbreviation.trim().length < 2 || abbreviation.trim().length > 4) {
    throw new Error("A sigla da disciplina deve ter entre 2 e 4 caracteres.");
  }

  if (!/^[a-zA-Z0-9]+$/.test(abbreviation)) {
    throw new Error("A sigla da disciplina deve conter apenas letras e números.");
  }

  // Validação: semestre deve ser um número de 1 a 12 (máscara: número + "° Semestre")
  if (!semester || semester.trim().length === 0) {
    throw new Error("O semestre não pode estar vazio.");
  }

  // Remove o texto "° Semestre" se vier do frontend
  const semesterNumber = semester.replace(/°\s*Semestre/gi, '').trim();
  const num = parseInt(semesterNumber, 10);
  
  if (isNaN(num) || num < 1 || num > 12) {
    throw new Error("O semestre deve ser um número entre 1 e 12.");
  }

  // Verifica duplicata de código no mesmo curso
  const existing = await executeQuery(
    "SELECT id FROM subjects WHERE course_id = ? AND code = ?",
    [courseId, code.trim()]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe uma disciplina cadastrada com o código "${code}" neste curso.`);
  }

  const result = await executeQuery(
    "INSERT INTO subjects (course_id, name, code, abbreviation, semester) VALUES (?, ?, ?, ?, ?)",
    [courseId, name.trim(), code.trim(), abbreviation.trim(), semester.trim()]
  );

  return {
    id: result.insertId,
    courseId,
    name: name.trim(),
    code: code.trim(),
    abbreviation: abbreviation.trim(),
    semester: semester.trim()
  };
}

/**
 * Lista todas as disciplinas de um curso
 * courseId - ID do curso
 */
export async function getSubjects(courseId: number) {
  const subjects = await executeQuery(
    "SELECT id, name, code, abbreviation, semester FROM subjects WHERE course_id = ? ORDER BY id DESC",
    [courseId]
  );

  return subjects;
}

/**
 * Busca disciplina por ID
 * subjectId - ID da disciplina
 */
export async function getSubject(subjectId: number) {
  const subjects = await executeQuery(
    "SELECT id, name, code, abbreviation, semester, course_id FROM subjects WHERE id = ?",
    [subjectId]
  );

  if (subjects.length === 0) {
    throw new Error("Disciplina não encontrada");
  }

  return subjects[0];
}

/**
 * Atualiza dados de uma disciplina
 * subjectId - ID da disciplina
 * name - Novo nome
 * code - Novo código
 * abbreviation - Nova sigla
 * semester - Novo semestre
 */
export async function updateSubject(subjectId: number, name: string, code: string, abbreviation: string, semester: string) {
  // Validação: nome não pode estar vazio e deve conter apenas letras, números e espaços
  if (!name || name.trim().length === 0) {
    throw new Error("O nome da disciplina não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error("O nome da disciplina deve conter apenas letras, números e espaços.");
  }

  // Validação: código deve ter exatamente 5 dígitos (máscara: 00000)
  if (!code || !/^\d{5}$/.test(code)) {
    throw new Error("O código da disciplina deve ter exatamente 5 dígitos.");
  }

  // Validação: sigla deve ter 2-4 caracteres alfanuméricos (máscara: slice(0,4))
  if (!abbreviation || abbreviation.trim().length < 2 || abbreviation.trim().length > 4) {
    throw new Error("A sigla da disciplina deve ter entre 2 e 4 caracteres.");
  }

  if (!/^[a-zA-Z0-9]+$/.test(abbreviation)) {
    throw new Error("A sigla da disciplina deve conter apenas letras e números.");
  }

  // Validação: semestre deve ser um número de 1 a 12 (máscara: número + "° Semestre")
  if (!semester || semester.trim().length === 0) {
    throw new Error("O semestre não pode estar vazio.");
  }

  // Remove o texto "° Semestre" se vier do frontend
  const semesterNumber = semester.replace(/°\s*Semestre/gi, '').trim();
  const num = parseInt(semesterNumber, 10);
  
  if (isNaN(num) || num < 1 || num > 12) {
    throw new Error("O semestre deve ser um número entre 1 e 12.");
  }

  // Busca o curso da disciplina
  const subject = await executeQuery(
    "SELECT course_id FROM subjects WHERE id = ?",
    [subjectId]
  );

  if (subject.length === 0) {
    throw new Error("Disciplina não encontrada.");
  }

  // Verifica duplicata de código no mesmo curso (exceto a própria disciplina)
  const existing = await executeQuery(
    "SELECT id FROM subjects WHERE course_id = ? AND code = ? AND id != ?",
    [subject[0].course_id, code.trim(), subjectId]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe outra disciplina cadastrada com o código "${code}" neste curso.`);
  }

  await executeQuery(
    "UPDATE subjects SET name = ?, code = ?, abbreviation = ?, semester = ? WHERE id = ?",
    [name.trim(), code.trim(), abbreviation.trim(), semester.trim(), subjectId]
  );

  return { success: true };
}

/**
 * Deleta disciplina (CASCADE deleta turmas e alunos)
 * subjectId - ID da disciplina
 */
export async function deleteSubject(subjectId: number) {
  await executeQuery("DELETE FROM subjects WHERE id = ?", [subjectId]);
  return { success: true };
}
