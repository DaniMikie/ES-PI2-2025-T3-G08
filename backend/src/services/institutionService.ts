/**
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
  // Validação: nomes não podem estar vazios
  if (!institutionName || institutionName.trim().length === 0) {
    throw new Error("O nome da instituição não pode estar vazio.");
  }

  if (!courseName || courseName.trim().length === 0) {
    throw new Error("O nome do curso não pode estar vazio.");
  }

  // Verifica duplicata de instituição para o usuário
  const existing = await executeQuery(
    "SELECT id FROM institutions WHERE user_id = ? AND name = ?",
    [userId, institutionName.trim()]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe uma instituição cadastrada com o nome "${institutionName}".`);
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
  // Validação: nomes não podem estar vazios
  if (!institutionName || institutionName.trim().length === 0) {
    throw new Error("O nome da instituição não pode estar vazio.");
  }

  if (!courseName || courseName.trim().length === 0) {
    throw new Error("O nome do curso não pode estar vazio.");
  }

  // Verifica se a instituição pertence ao usuário
  const check = await executeQuery(
    "SELECT id FROM institutions WHERE id = ? AND user_id = ?",
    [institutionId, userId]
  );

  if (check.length === 0) {
    throw new Error("Instituição não encontrada");
  }

  // Verifica duplicata de instituição para o usuário (exceto a própria)
  const existing = await executeQuery(
    "SELECT id FROM institutions WHERE user_id = ? AND name = ? AND id != ?",
    [userId, institutionName.trim(), institutionId]
  );

  if (existing.length > 0) {
    throw new Error(`Já existe outra instituição cadastrada com o nome "${institutionName}".`);
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
 * Deleta instituição (CASCADE deleta curso, disciplinas, turmas e alunos)
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

  await executeQuery("DELETE FROM institutions WHERE id = ?", [institutionId]);

  return { success: true };
}
