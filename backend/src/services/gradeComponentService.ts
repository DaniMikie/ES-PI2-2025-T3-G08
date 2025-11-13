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

  // Busca componentes existentes
  const componentesExistentes = await executeQuery(
    "SELECT id, name FROM grade_components WHERE subject_id = ?",
    [subjectId]
  );

  // Identifica componentes que foram removidos
  const nomesNovos = components.map(c => c.name);
  const componentesRemovidos = componentesExistentes.filter(
    (comp: any) => !nomesNovos.includes(comp.name)
  );

  // Se houver componentes removidos, registra DELETE na auditoria
  if (componentesRemovidos.length > 0) {
    const { createAuditLog } = await import("./gradeAuditService");
    
    for (const compRemovido of componentesRemovidos) {
      // Busca todas as notas desse componente para registrar na auditoria
      const notasRemovidas = await executeQuery(
        "SELECT student_id, grade FROM grades WHERE grade_component_id = ?",
        [compRemovido.id]
      );

      // Registra DELETE para cada nota
      for (const nota of notasRemovidas) {
        await createAuditLog(
          nota.student_id,
          compRemovido.id,
          nota.grade,
          null,
          'DELETE',
          userId
        );
      }
    }
  }

  // Remove componentes antigos
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
