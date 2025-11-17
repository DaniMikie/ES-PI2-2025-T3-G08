/**
 * Autor: Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: institutionService.ts
 * Data: 12/10/2025
 * 
 * Serviço de Instituições
 * Gerencia CRUD de instituições de ensino e seus cursos
 */

import { executeQuery, executeTransaction } from "../db/database";

/**
 * Cria nova instituição e curso associado
 * userId - ID do usuário proprietário
 * institutionName - Nome da instituição
 * courseName - Nome do curso
 */
export async function createInstitution(userId: number, institutionName: string, courseName: string) {
  // Validação: nome da instituição não pode estar vazio
  if (!institutionName || institutionName.trim().length === 0) {
    throw new Error("O nome da instituição não pode estar vazio.");
  }

  // Validação: nome do curso não pode estar vazio e deve conter apenas letras, números e espaços 
  if (!courseName || courseName.trim().length === 0) {
    throw new Error("O nome do curso não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(courseName)) {
    throw new Error("O nome do curso deve conter apenas letras, números e espaços.");
  }

  // Verifica duplicata de instituição + curso para o usuário
  // Permite mesma instituição com cursos diferentes
  const existing = await executeQuery(
    `SELECT i.id FROM institutions i
     INNER JOIN courses c ON c.institution_id = i.id
     WHERE i.user_id = ? AND i.name = ? AND c.name = ?`,
    [userId, institutionName.trim(), courseName.trim()]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe uma instituição "${institutionName}" com o curso "${courseName}" cadastrada.`);
  }

  const queries = [
    {
      query: "INSERT INTO institutions (user_id, name) VALUES (?, ?)",
      params: [userId, institutionName.trim()]
    }
  ];

  const results = await executeTransaction(queries);
  const institutionId = results[0].insertId;

  // Cria o curso associado
  await executeQuery(
    "INSERT INTO courses (institution_id, name) VALUES (?, ?)",
    [institutionId, courseName.trim()]
  );

  return {
    institutionId,
    institutionName: institutionName.trim(),
    courseName: courseName.trim()
  };
}

/**
 * Lista todas as instituições do usuário com seus cursos
 * userId - ID do usuário
 */
export async function getInstitutions(userId: number) {
  const institutions = await executeQuery(
    `SELECT i.id, i.name as institution_name, c.id as course_id, c.name as course_name
     FROM institutions i
     LEFT JOIN courses c ON c.institution_id = i.id
     WHERE i.user_id = ?
     ORDER BY i.id DESC`,
    [userId]
  );

  return institutions;
}

/**
 * Busca instituição por ID
 * institutionId - ID da instituição
 */
export async function getInstitution(institutionId: number) {
  const institutions = await executeQuery(
    "SELECT id, name FROM institutions WHERE id = ?",
    [institutionId]
  );

  if (institutions.length === 0) {
    throw new Error("Instituição não encontrada");
  }

  return institutions[0];
}

/**
 * Atualiza instituição e curso associado
 * institutionId - ID da instituição
 * userId - ID do usuário (validação de propriedade)
 * institutionName - Novo nome da instituição
 * courseName - Novo nome do curso
 */
export async function updateInstitution(institutionId: number, userId: number, institutionName: string, courseName: string) {
  // Validação: nome da instituição não pode estar vazio
  if (!institutionName || institutionName.trim().length === 0) {
    throw new Error("O nome da instituição não pode estar vazio.");
  }

  // Validação: nome do curso não pode estar vazio e deve conter apenas letras, números e espaços 
  if (!courseName || courseName.trim().length === 0) {
    throw new Error("O nome do curso não pode estar vazio.");
  }

  if (!/^[a-zA-Z0-9 ]+$/.test(courseName)) {
    throw new Error("O nome do curso deve conter apenas letras, números e espaços.");
  }

  // Verifica se a instituição pertence ao usuário
  const check = await executeQuery(
    "SELECT id FROM institutions WHERE id = ? AND user_id = ?",
    [institutionId, userId]
  );

  if (check.length === 0) {
    throw new Error("Instituição não encontrada");
  }

  // Verifica duplicata de instituição + curso para o usuário (exceto a própria)
  // Permite mesma instituição com cursos diferentes
  const existing = await executeQuery(
    `SELECT i.id FROM institutions i
     INNER JOIN courses c ON c.institution_id = i.id
     WHERE i.user_id = ? AND i.name = ? AND c.name = ? AND i.id != ?`,
    [userId, institutionName.trim(), courseName.trim(), institutionId]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe outra instituição "${institutionName}" com o curso "${courseName}" cadastrada.`);
  }

  await executeQuery(
    "UPDATE institutions SET name = ? WHERE id = ?",
    [institutionName.trim(), institutionId]
  );

  // Atualiza o curso
  await executeQuery(
    "UPDATE courses SET name = ? WHERE institution_id = ?",
    [courseName.trim(), institutionId]
  );

  return { success: true };
}

/**
 * Deleta instituição (com verificação de safe deletion)
 * institutionId - ID da instituição
 * userId - ID do usuário (validação de propriedade)
 */
export async function deleteInstitution(institutionId: number, userId: number) {
  const check = await executeQuery(
    "SELECT id FROM institutions WHERE id = ? AND user_id = ?",
    [institutionId, userId]
  );

  if (check.length === 0) {
    throw new Error("Instituição não encontrada");
  }

  // SAFE DELETION: Verifica se existem disciplinas cadastradas (através dos cursos)
  const subjects = await executeQuery(
    `SELECT COUNT(*) as count FROM subjects s
     INNER JOIN courses c ON s.course_id = c.id
     WHERE c.institution_id = ?`,
    [institutionId]
  );

  if (subjects[0].count > 0) {
    throw new Error("Não é possível excluir esta instituição e curso pois existem disciplinas cadastradas. Exclua as disciplinas primeiro.");
  }

  await executeQuery("DELETE FROM institutions WHERE id = ?", [institutionId]);

  return { success: true };
}
