/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: dashboard.js
    Data: 10/11/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

$(document).ready(function () {
    // Verifica se usuário está autenticado
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    // Redireciona para login se não houver token
    if (!token) {
        window.location.href = '/frontend/login/html/login.html';
        return;
    }

    // Exibe nome do usuário na navbar
    if (userName) {
        $('.navbar .text-muted').html(`Olá, <strong>${userName}</strong>!`);
    }

    // Carrega estatísticas do dashboard
    carregarEstatisticas();

    // Sistema de confirmação dupla para botão sair
    let botaoSair = null;

    document.addEventListener("click", function (event) {
        const btn = event.target;

        // Detecta clique no botão sair
        if (btn.classList.contains("sair") || btn.closest(".sair")) {
            event.preventDefault();
            event.stopPropagation();

            const btnSair = btn.classList.contains("sair") ? btn : btn.closest(".sair");

            // Segundo clique: confirma e faz logout
            if (btnSair === botaoSair) {
                localStorage.clear();
                window.location.href = '/frontend/login/html/login.html';
            }
            // Primeiro clique: pede confirmação
            else {
                if (botaoSair) resetarBotaoSair(botaoSair);
                botaoSair = btnSair;
                btnSair.innerHTML = '<i class="bi bi-door-open"></i> Confirma?';
                btnSair.classList.remove("btn-outline-danger");
                btnSair.classList.add("btn-danger");
            }
        }
        // Clique fora do botão: cancela confirmação
        else {
            if (botaoSair) {
                resetarBotaoSair(botaoSair);
                botaoSair = null;
            }
        }
    });

    // Reseta botão sair para estado inicial
    function resetarBotaoSair(btn) {
        btn.innerHTML = '<i class="bi bi-door-open"></i> Sair';
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-outline-danger");
    }
});

// Carrega e exibe estatísticas do sistema
async function carregarEstatisticas() {
    const token = localStorage.getItem('token');

    let totalDisciplinas = 0;
    let totalTurmas = 0;
    let totalAlunos = 0;

    try {
        // Busca todas as instituições
        const instResponse = await fetch(`${API_URL}/institutions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (instResponse.ok) {
            const institutions = await instResponse.json();
            $('#totalInstituicoes').text(institutions.length);

            // Para cada instituição, busca dados relacionados
            for (const inst of institutions) {
                const courseId = inst.course_id;

                if (courseId) {
                    // Busca disciplinas do curso
                    const subjectsResponse = await fetch(`${API_URL}/subjects/course/${courseId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (subjectsResponse.ok) {
                        const subjects = await subjectsResponse.json();
                        totalDisciplinas += subjects.length;

                        // Para cada disciplina, busca turmas
                        for (const subject of subjects) {
                            const classesResponse = await fetch(`${API_URL}/classes/subject/${subject.id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (classesResponse.ok) {
                                const classes = await classesResponse.json();
                                totalTurmas += classes.length;

                                // Para cada turma, busca alunos
                                for (const classItem of classes) {
                                    const studentsResponse = await fetch(`${API_URL}/students/class/${classItem.id}`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });

                                    if (studentsResponse.ok) {
                                        const students = await studentsResponse.json();
                                        totalAlunos += students.length;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Atualiza cards com os totais calculados
            $('#totalDisciplinas').text(totalDisciplinas);
            $('#totalTurmas').text(totalTurmas);
            $('#totalAlunos').text(totalAlunos);
        }

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}
