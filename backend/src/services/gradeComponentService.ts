/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: gradeComponentService.ts
 * Data: 28/10/2025
 * 
 * Serviço de Componentes de Nota
 * Gerencia componentes de avaliação e fórmulas de cálculo
 */

import { executeQuery } from "../db/database";

export async function createGradeComponents(subjectId: number, components: { name: string; description: string }[], formula: string, userId: number = 0) {
  // Validação: deve ter pelo menos 2 componentes
  if (components.length < 2) {
    throw new Error("É necessário cadastrar pelo menos 2 componentes de nota.");
  }

  // Validação: formato do nome (letra + número)
  const nomesDuplicados = new Set<string>();
  for (const comp of components) {
    if (!/^[A-Za-z]\d$/.test(comp.name)) {
      throw new Error(`Nome de componente inválido: ${comp.name}. Use o formato letra + número (ex: N1, T2).`);
    }

    // Verifica duplicatas
    const nomeUpper = comp.name.toUpperCase();
    if (nomesDuplicados.has(nomeUpper)) {
      throw new Error(`Componente duplicado: ${comp.name}`);
    }
    nomesDuplicados.add(nomeUpper);
  }

  // Validação: fórmula não pode estar vazia
  if (!formula || formula.trim().length === 0) {
    throw new Error("A fórmula de cálculo não pode estar vazia.");
  }

  // Validação: todos os componentes devem estar na fórmula
  for (const comp of components) {
    const regex = new RegExp(comp.name, 'gi');
    if (!regex.test(formula)) {
      throw new Error(`A fórmula está incompleta. Falta o componente: ${comp.name}`);
    }
  }

  // Validação: testa a fórmula substituindo componentes por 1 
  try {
    let formulaTeste = formula;
    
    // Substitui todos os componentes por 1
    for (const comp of components) {
      const regex = new RegExp(comp.name, 'gi');
      formulaTeste = formulaTeste.replace(regex, '1');
    }

    // Avalia a fórmula usando Function (mais seguro que eval)
    const resultado = new Function(`return ${formulaTeste}`)();

    // Verifica se o resultado é um número válido
    if (isNaN(resultado) || resultado < 0) {
      throw new Error("Fórmula inválida! Com todas as notas = 1, o resultado deve ser um número positivo.");
    }

    // Verifica se o resultado é aproximadamente 1 (tolerância de 0.01)
    if (Math.abs(resultado - 1) > 0.01) {
      throw new Error(`Fórmula inválida! Com todas as notas = 1, o resultado é ${resultado.toFixed(2)}. Deveria ser 1.`);
    }
  } catch (error: any) {
    if (error.message.includes("Fórmula inválida")) {
      throw error;
    }
    throw new Error(`Erro ao validar fórmula: ${error.message}`);
  }

  // Busca componentes existentes
  const componentesExistentes = await executeQuery(
    "SELECT id, name FROM grade_components WHERE subject_id = ?",
    [subjectId]
  );

  // Se existem componentes, registra TODAS as notas na auditoria antes de excluir
  if (componentesExistentes.length > 0) {
    const { createAuditLog } = await import("./gradeAuditService");
    
    // Busca TODAS as notas de TODOS os componentes da disciplina
    const todasNotasRemovidas = await executeQuery(
      `SELECT g.student_id, g.grade_component_id, g.grade
       FROM grades g
       INNER JOIN grade_components gc ON g.grade_component_id = gc.id
       WHERE gc.subject_id = ?`,
      [subjectId]
    );

    // Registra DELETE na auditoria para CADA nota
    for (const nota of todasNotasRemovidas) {
      await createAuditLog(
        nota.student_id,
        nota.grade_component_id,
        nota.grade,
        null,
        'DELETE',
        userId
      );
    }
  }

  // Remove componentes antigos (CASCADE vai excluir as notas automaticamente)
  await executeQuery("DELETE FROM grade_components WHERE subject_id = ?", [subjectId]);

  // Insere novos componentes
  for (const comp of components) {
    await executeQuery(
      "INSERT INTO grade_components (subject_id, name, abbreviation, description) VALUES (?, ?, ?, ?)",
      [subjectId, comp.name, comp.name, comp.description]
    );
  }

  // Salva a fórmula na disciplina
  await executeQuery(
    "UPDATE subjects SET final_grade_formula = ? WHERE id = ?",
    [formula, subjectId]
  );

  return { success: true };
}

export async function getGradeComponents(subjectId: number) {
  try {
    const components = await executeQuery(
      "SELECT id, name, abbreviation, description FROM grade_components WHERE subject_id = ? ORDER BY id",
      [subjectId]
    );

    return components || [];
  } catch (error) {
    console.error('Erro ao buscar componentes:', error);
    return [];
  }
}

export async function getFormula(subjectId: number) {
  try {
    const result = await executeQuery(
      "SELECT final_grade_formula FROM subjects WHERE id = ?",
      [subjectId]
    );

    return result.length > 0 ? result[0].final_grade_formula : null;
  } catch (error) {
    console.error('Erro ao buscar fórmula:', error);
    return null;
  }
}

export async function deleteGradeComponents(subjectId: number, userId: number) {
  // Busca todas as notas que serão excluídas para auditoria
  const gradesToDelete = await executeQuery(
    `SELECT g.id, g.student_id, g.grade_component_id, g.grade
     FROM grades g
     INNER JOIN grade_components gc ON g.grade_component_id = gc.id
     WHERE gc.subject_id = ?`,
    [subjectId]
  );

  // Registra auditoria para cada nota excluída
  const { createAuditLog } = await import("./gradeAuditService");
  for (const grade of gradesToDelete) {
    await createAuditLog(
      grade.student_id,
      grade.grade_component_id,
      grade.grade,
      null,
      'DELETE',
      userId
    );
  }

  await executeQuery("DELETE FROM grade_components WHERE subject_id = ?", [subjectId]);
  await executeQuery("UPDATE subjects SET final_grade_formula = NULL WHERE id = ?", [subjectId]);
  return { success: true };
}
