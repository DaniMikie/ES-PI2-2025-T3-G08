/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: alunos.js (Completo com Sistema de Notas Integrado)
    Data: 09/10/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

$(document).ready(function () {

    // Verifica autenticação do usuário
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

    // Recupera informações da turma pela URL
    const urlParams = new URLSearchParams(window.location.search);
    const turma = urlParams.get('turma');
    const classId = urlParams.get('classId');
    const subjectId = urlParams.get('subjectId');

    // ======== BREADCRUMB: Monta navegação (Instituição > Curso > Disciplina > Turma) ========
    async function carregarBreadcrumb() {
        if (!subjectId || !classId) {
            document.querySelector('#msgTurma').textContent = 'Turma não informada';
            return;
        }

        try {
            // BREADCRUMB PASSO 1: Busca dados da disciplina pelo ID
            const subjectResponse = await fetch(`${API_URL}/subjects/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (subjectResponse.ok) {
                const subject = await subjectResponse.json();

                // BREADCRUMB PASSO 2: Busca dados do curso usando course_id da disciplina
                const courseResponse = await fetch(`${API_URL}/courses/${subject.course_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (courseResponse.ok) {
                    const course = await courseResponse.json();

                    // BREADCRUMB PASSO 3: Busca dados da instituição usando institution_id do curso
                    const instResponse = await fetch(`${API_URL}/institutions/${course.institution_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (instResponse.ok) {
                        const institution = await instResponse.json();

                        // BREADCRUMB PASSO 4: Monta o HTML do breadcrumb com links clicáveis
                        const breadcrumb = `
                            <a href="instituicoes.html" class="breadcrumb-link">${institution.name}</a> <span style="color: #616161;">></span> 
                            <a href="disciplinas.html?curso=${encodeURIComponent(course.name)}&courseId=${course.id}" class="breadcrumb-link">${course.name}</a> <span style="color: #616161;">></span> 
                            <a href="turmas.html?disciplina=${encodeURIComponent(subject.name)}&subjectId=${subject.id}" class="breadcrumb-link">${subject.name}</a> <span style="color: #616161;">></span> 
                            <span class="breadcrumb-atual">${turma}</span>
                        `;
                        // BREADCRUMB PASSO 5: Exibe o breadcrumb na tela
                        document.querySelector('#msgTurma').innerHTML = `<small>${breadcrumb}</small>`;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar breadcrumb:', error);
            document.querySelector('#msgTurma').textContent = `Turma: ${turma}`;
        }
    }

    // Executa a função para carregar o breadcrumb
    carregarBreadcrumb();

    // Captura os elementos do HTML pelo ID
    const btnCadastrar = document.querySelector("#btnCadastrar");
    const btnVoltar = document.querySelector("#btnVoltar");
    const btnNota = document.querySelector("#btnNota");
    const formAluno = document.querySelector("#formAluno");
    const raAluno = document.querySelector("#raAluno");
    const nomeAluno = document.querySelector("#nomeAluno");
    const aviso = document.querySelector("#aviso");
    const tabela = document.querySelector("#tabelaAlunos");

    // Variáveis de controle
    let botaoExcluir = null;
    let botaoSair = null;
    let linhaEditando = null;
    let valoresOriginaisLinha = null;
    let componentesNota = [];
    let temNotas = false;

    // Máscaras
    $('#nomeAluno').on('input', function () {
        $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
    });

    $('#raAluno').mask('00000000');

    btnCadastrar.disabled = true;

    // ======== CARREGAR COMPONENTES DE NOTA ========
    async function carregarComponentesNota() {
        if (!subjectId) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.components && data.components.length > 0) {
                    componentesNota = data.components.map(c => ({
                        id: c.id,
                        nome: c.name,
                        descricao: c.description
                    }));
                    formulaAtual = data.formula;
                    temNotas = true;
                    atualizarTabelaComponentes();
                    await carregarNotasDaTurma();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar componentes:', error);
        }
    }

    // ======== CARREGAR ALUNOS ========
    async function carregarAlunos() {
        if (!classId) return;

        try {
            const response = await fetch(`${API_URL}/students/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const students = await response.json();
                tabela.querySelector("tbody").innerHTML = '';

                students.forEach(student => {
                    adicionarLinhaTabela(student.id, student.student_id, student.name);
                });

                if (temNotas) {
                    await carregarNotasDaTurma();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    }

    // ======== CARREGAR NOTAS DA TURMA ========
    async function carregarNotasDaTurma() {
        if (!classId) return;

        try {
            const response = await fetch(`${API_URL}/grades/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const grades = await response.json();

                grades.forEach(g => {
                    const linha = document.querySelector(`tr[data-student-id="${g.student_id}"]`);
                    if (linha) {
                        const comp = componentesNota.find(c => c.id === g.grade_component_id);
                        if (comp) {
                            const input = linha.querySelector(`input[data-componente="${comp.nome}"]`);
                            if (input && g.grade !== null) {
                                // Formata nota com 1 casa decimal
                                const notaFormatada = parseFloat(g.grade).toFixed(1);
                                input.value = notaFormatada;
                            }
                        }
                    }
                });

                // Calcula médias
                document.querySelectorAll('#tabelaAlunos tbody tr').forEach(linha => {
                    calcularMediaAluno(linha);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
        }
    }

    function adicionarLinhaTabela(id, ra, nome) {
        const novaLinha = document.createElement("tr");
        novaLinha.dataset.studentId = id;

        novaLinha.innerHTML = `
      <td><input type="text" value="${ra}" disabled class="ra form-control form-control-sm"></td>
      <td><input type="text" value="${nome}" disabled class="nome form-control form-control-sm"></td>
    `;

        if (temNotas) {
            componentesNota.forEach(comp => {
                const td = document.createElement("td");
                td.innerHTML = `
          <input type="text" class="nota form-control form-control-sm me-2" data-componente="${comp.nome}" data-component-id="${comp.id}" disabled>
        `;
                novaLinha.appendChild(td);
            });

            const tdMedia = document.createElement("td");
            tdMedia.style.textAlign = "center";
            tdMedia.innerHTML = `<input type="text" value="" disabled class="mediaFinal form-control form-control-sm" style="width:50px; text-align:center;">`;
            novaLinha.appendChild(tdMedia);
        }

        const tdAcoes = document.createElement("td");
        tdAcoes.classList.add("text-center", "td-acoes");
        tdAcoes.innerHTML = `
      <button class="btn btn-sm btn-outline-secondary me-1 btn-editar">Editar</button>
      <button class="btn btn-sm btn-outline-danger me-1 btn-excluir">Excluir</button>
    `;
        novaLinha.appendChild(tdAcoes);

        tabela.querySelector("tbody").appendChild(novaLinha);
    }

    // Inicializa
    carregarComponentesNota().then(() => carregarAlunos());

    // Validação dos inputs
    nomeAluno.onkeyup = onInputKeyUp;
    raAluno.onkeyup = onInputKeyUp;

    function onInputKeyUp(_event) {
        const target = _event.target;
        const raValor = raAluno.value.trim();
        const nomeValor = nomeAluno.value.trim();

        const rasExistentes = Array.from(document.querySelectorAll("#tabelaAlunos tbody .ra"))
            .map(input => input.value.trim());
        const raDuplicado = rasExistentes.includes(raValor);

        if (target.id === 'raAluno') {
            if (raValor.length !== 8) {
                raAluno.classList.add("inputErrado");
                aviso.textContent = "O RA deve conter exatamente 8 dígitos.";
                aviso.style.display = "flex";
            }
            else if (raDuplicado) {
                raAluno.classList.add("inputErrado");
                aviso.textContent = `Já existe um aluno cadastrado com o RA ${raValor}.`;
                aviso.style.display = "flex";
            }
            else {
                raAluno.classList.remove("inputErrado");
                aviso.style.display = "none";
            }
        }
        else if (target.id === 'nomeAluno') {
            nomeAluno.classList.toggle("inputErrado", nomeAluno.value.trim().length === 0);
        }

        const isNotEmpty = (raValor.length > 0 && nomeValor.length > 0);
        const isRaValid = (raValor.length === 8 && !raDuplicado);

        btnCadastrar.disabled = !(isNotEmpty && isRaValid);
    }

    // Adicionar novo aluno
    formAluno.addEventListener("submit", async (event) => {
        event.preventDefault();

        const ra = raAluno.value.trim();
        const nome = nomeAluno.value.trim();

        if (ra === "" || nome === "") return;

        try {
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    classId: parseInt(classId),
                    studentId: ra,
                    name: nome
                })
            });

            if (response.ok) {
                const data = await response.json();
                adicionarLinhaTabela(data.id, ra, nome);
                formAluno.reset();
                btnCadastrar.disabled = true;
            } else {
                alert('Erro ao cadastrar aluno');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
        }
    });

    // Evento para validar e formatar as notas na tabela
    // Validação dinâmica de nota durante digitação
    $(document).on('input', '.nota', function () {
        let valor = this.value;

        // Remove caracteres não numéricos exceto ponto
        valor = valor.replace(/[^0-9.]/g, '');

        // Permite apenas um ponto decimal
        const partes = valor.split('.');
        if (partes.length > 2) {
            valor = partes[0] + '.' + partes[1];
        }

        // Limita a 2 dígitos antes do ponto e 2 depois
        if (valor.includes('.')) {
            const [inteiro, decimal] = valor.split('.');
            valor = inteiro.slice(0, 2) + '.' + decimal.slice(0, 2);
        } else {
            valor = valor.slice(0, 2);
        }

        // Limita o valor máximo a 10
        const num = parseFloat(valor);
        if (!isNaN(num) && num > 10) {
            valor = '10';
        }

        this.value = valor;
    });

    // Formatar nota quando o campo perde o foco (remove zeros desnecessários)
    $(document).on('blur', '.nota', function () {
        const input = $(this);
        let grade = input.val().trim();

        // Se vazio, não faz nada
        if (grade === '' || grade === '.') {
            input.val('');
            return;
        }

        // Converte para número e formata
        const num = parseFloat(grade);
        if (!isNaN(num)) {
            // Limita entre 0 e 10
            const notaLimitada = Math.min(Math.max(num, 0), 10);

            // Remove zeros desnecessários
            // Ex: 10.00 → 10, 8.50 → 8.5, 7.00 → 7, 9.75 → 9.75
            let notaFormatada = notaLimitada.toFixed(2);
            notaFormatada = parseFloat(notaFormatada).toString();

            input.val(notaFormatada);
        } else {
            input.val('');
        }
    });

    // Funcao que calcula a media do aluno
    function calcularMediaAluno(linha) {
        if (!formulaAtual || componentesNota.length === 0) return;

        try {
            let formula = formulaAtual;

            // Substitui cada componente pelo valor da nota (case insensitive)
            componentesNota.forEach(comp => {
                const input = linha.querySelector(`input[data-componente="${comp.nome}"]`);
                const valor = input && input.value.trim() !== "" ? input.value : "0";
                formula = formula.replace(new RegExp(comp.nome, 'gi'), valor);
            });

            // Calcula o resultado
            const resultado = eval(formula);

            const mediaInput = linha.querySelector(".mediaFinal");
            if (mediaInput && !isNaN(resultado)) {
                // Formata média com 1 casa decimal
                const mediaFormatada = resultado.toFixed(1);
                mediaInput.value = mediaFormatada;
            }
        } catch (error) {
            console.error('Erro ao calcular média:', error);
        }
    }

    // Validação dos campos dentro da tabela
    $(document).on('input', '.nome', function () {
        $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
    });
    $(document).on('input', '.ra', function () {
        $(this).val($(this).val().replace(/[^0-9]/g, '').slice(0, 8));
    });

    // Editar aluno
    tabela.addEventListener("click", async (event) => {
        const btn = event.target;

        if (btn.classList.contains("btn-editar")) {
            event.stopPropagation();

            const linha = btn.closest("tr");
            const inputsNotas = linha.querySelectorAll(".nota");
            const inputRa = linha.querySelector("input.ra");
            const inputNome = linha.querySelector("input.nome");

            const salvando = btn.textContent === "Salvar";

            if (!salvando && linhaEditando && linhaEditando !== linha) {
                alert("Conclua ou cancele a edição atual antes de editar outra linha.");
                return;
            }

            if (salvando) {
                const studentId = linha.dataset.studentId;
                const novoRa = inputRa.value.trim();
                const novoNome = inputNome.value.trim();

                try {
                    // Salva dados do aluno
                    const response = await fetch(`${API_URL}/students/${studentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            studentId: novoRa,
                            name: novoNome
                        })
                    });

                    if (response.ok) {
                        // Salva todas as notas editadas
                        for (const input of inputsNotas) {
                            const componentId = input.dataset.componentId;
                            let grade = input.value.trim();

                            if (componentId) {
                                await fetch(`${API_URL}/grades`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        studentId: parseInt(studentId),
                                        gradeComponentId: parseInt(componentId),
                                        grade: grade === '' ? null : parseFloat(grade)
                                    })
                                });
                            }
                        }

                        inputsNotas.forEach(input => input.disabled = true);
                        inputRa.disabled = true;
                        inputNome.disabled = true;

                        btn.textContent = "Editar";
                        btn.classList.remove("btn-success");
                        btn.classList.add("btn-outline-secondary");
                        btn.disabled = false;
                        btnNota.disabled = false;
                        btnImportarCSV.disabled = false;
                        btnExportarCSV.disabled = false;

                        // Reabilita todos os outros botões
                        tabela.querySelectorAll(".btn-editar, .btn-excluir").forEach(b => {
                            b.disabled = false;
                        });

                        // Calcula a média SOMENTE após salvar
                        calcularMediaAluno(linha);

                        linhaEditando = null;
                        valoresOriginaisLinha = null;
                    } else {
                        alert('Erro ao atualizar aluno');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao conectar com o servidor');
                }
            }
            else {
                valoresOriginaisLinha = {
                    ra: inputRa.value,
                    nome: inputNome.value,
                    notas: Array.from(inputsNotas).map(input => input.value)
                };

                inputsNotas.forEach(input => input.disabled = false);
                inputRa.disabled = false;
                inputNome.disabled = false;

                btn.textContent = "Salvar";
                btn.classList.remove("btn-outline-secondary");
                btn.classList.add("btn-success");
                btnNota.disabled = true;
                btnImportarCSV.disabled = true;
                btnExportarCSV.disabled = true;

                // Desabilita TODOS os botões de editar e excluir (incluindo o da própria linha)
                tabela.querySelectorAll(".btn-editar, .btn-excluir").forEach(b => {
                    if (b !== btn) {
                        b.disabled = true;
                    }
                });

                linhaEditando = linha;

                function validarEdicao() {
                    let duplicado = false;

                    const ra = inputRa.value.trim();
                    const nome = inputNome.value.trim();

                    $('#tabelaAlunos tbody tr').not(linha).each(function () {
                        const raExistente = $(this).find('td').eq(0).find('input').val().trim();

                        if (raExistente === ra) {
                            duplicado = true;
                            return false;
                        }
                    });

                    if (ra.length !== 8 || nome.length === 0 || duplicado) {
                        btn.disabled = true;
                        inputRa.classList.toggle("inputErrado", ra.length !== 8 || duplicado);
                        inputNome.classList.toggle("inputErrado", nome.length === 0);
                    }
                    else {
                        btn.disabled = false;
                        inputRa.classList.remove("inputErrado");
                        inputNome.classList.remove("inputErrado");
                    }
                }

                validarEdicao();
                inputRa.onkeyup = validarEdicao;
                inputNome.onkeyup = validarEdicao;
            }
        }
    });

    // Cancelar edição ao clicar fora
    document.addEventListener("click", (event) => {
        if (!linhaEditando) return;

        const clicouDentroDaLinha = linhaEditando.contains(event.target);

        if (!clicouDentroDaLinha) {
            const linha = linhaEditando;
            const btnEditar = linha.querySelector(".btn-editar");
            const inputsNotas = linha.querySelectorAll(".nota");
            const inputRa = linha.querySelector("input.ra");
            const inputNome = linha.querySelector("input.nome");

            inputRa.value = valoresOriginaisLinha.ra;
            inputNome.value = valoresOriginaisLinha.nome;
            inputsNotas.forEach((input, index) => {
                input.value = valoresOriginaisLinha.notas[index];
            });

            inputsNotas.forEach(input => input.disabled = true);
            inputRa.disabled = true;
            inputNome.disabled = true;

            btnEditar.textContent = "Editar";
            btnEditar.classList.remove("btn-success");
            btnEditar.classList.add("btn-outline-secondary");
            btnEditar.disabled = false;
            btnNota.disabled = false;
            btnImportarCSV.disabled = false;
            btnExportarCSV.disabled = false;

            // Reabilita todos os outros botões
            tabela.querySelectorAll(".btn-editar, .btn-excluir").forEach(b => {
                b.disabled = false;
            });

            inputRa.classList.remove("inputErrado");
            inputNome.classList.remove("inputErrado");

            linhaEditando = null;
            valoresOriginaisLinha = null;
        }
    });

    // ======== BOTÃO EDITAR NOTA NO CABEÇALHO ========
    let colunaEditando = null;
    let valoresOriginaisColuna = [];

    document.addEventListener("click", async (event) => {
        const btn = event.target.closest(".btn-editar-nota");

        // Se clicou fora da tabela e tem coluna editando, cancela
        if (!btn && colunaEditando && !event.target.closest('#tabelaAlunos')) {
            cancelarEdicaoColuna();
            return;
        }

        if (!btn) return;

        const componente = btn.dataset.componente;
        const editando = btn.classList.contains("btn-outline-success");

        if (editando) {
            // Salvando (✅ → pencil)
            btn.innerHTML = '<i class="bi bi-pencil-square"></i>';
            btn.classList.remove("btn-outline-success");
            btn.classList.add("btn-outline-secondary");

            // Salva todas as notas da coluna e calcula médias
            const inputs = document.querySelectorAll(`input[data-componente="${componente}"]`);

            for (const input of inputs) {
                const linha = input.closest("tr");
                const studentId = linha.dataset.studentId;
                const componentId = input.dataset.componentId;
                let grade = input.value.trim();

                if (studentId && componentId) {
                    try {
                        await fetch(`${API_URL}/grades`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                studentId: parseInt(studentId),
                                gradeComponentId: parseInt(componentId),
                                grade: grade === '' ? null : parseFloat(grade)
                            })
                        });
                    } catch (error) {
                        console.error('Erro ao salvar nota:', error);
                    }
                }

                input.disabled = true;

                // Calcula a média SOMENTE após salvar
                calcularMediaAluno(linha);
            }

            // Reabilita todos os outros botões
            tabela.querySelectorAll(".btn-editar, .btn-excluir, .btn-editar-nota").forEach(b => {
                b.disabled = false;
            });
            btnNota.disabled = false;
            btnImportarCSV.disabled = false;
            btnExportarCSV.disabled = false;

            colunaEditando = null;
            valoresOriginaisColuna = [];
        } else {
            // Salva valores originais
            valoresOriginaisColuna = [];
            document.querySelectorAll(`input[data-componente="${componente}"]`).forEach(input => {
                valoresOriginaisColuna.push(input.value);
            });

            // Editando (pencil → check)
            btn.innerHTML = '<i class="bi bi-check-lg"></i>';
            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-outline-success");

            document.querySelectorAll(`input[data-componente="${componente}"]`).forEach(input => {
                input.disabled = false;
            });

            // Desabilita todos os outros botões
            tabela.querySelectorAll(".btn-editar, .btn-excluir, .btn-editar-nota").forEach(b => {
                if (b !== btn) {
                    b.disabled = true;
                }
            });
            btnNota.disabled = true;
            btnImportarCSV.disabled = true;
            btnExportarCSV.disabled = true;

            colunaEditando = { btn, componente };
        }
    });

    // Função para cancelar edição da coluna
    function cancelarEdicaoColuna() {
        if (!colunaEditando) return;

        const { btn, componente } = colunaEditando;

        // Restaura valores originais
        const inputs = document.querySelectorAll(`input[data-componente="${componente}"]`);
        inputs.forEach((input, index) => {
            input.value = valoresOriginaisColuna[index];
            input.disabled = true;
        });

        // Restaura botão
        btn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        btn.classList.remove("btn-outline-success");
        btn.classList.add("btn-outline-secondary");

        // Reabilita todos os botões
        tabela.querySelectorAll(".btn-editar, .btn-excluir, .btn-editar-nota").forEach(b => {
            b.disabled = false;
        });
        btnNota.disabled = false;
        btnImportarCSV.disabled = false;
        btnExportarCSV.disabled = false;

        colunaEditando = null;
        valoresOriginaisColuna = [];
    }

    // Excluir aluno
    document.addEventListener("click", async function (event) {
        const btn = event.target;

        if (btn.classList.contains("btn-excluir")) {
            event.preventDefault();
            event.stopPropagation();

            if (btn === botaoExcluir) {
                const linha = btn.closest("tr");
                const studentId = linha.dataset.studentId;

                try {
                    const response = await fetch(`${API_URL}/students/${studentId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        linha.remove();
                    } else {
                        alert('Erro ao excluir aluno');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao conectar com o servidor');
                }

                botaoExcluir = null;
            }
            else {
                if (botaoExcluir) resetarBotaoExcluir(botaoExcluir);
                botaoExcluir = btn;
                btn.textContent = "Confirma?";
                btn.classList.remove("btn-outline-danger");
                btn.classList.add("btn-danger");
            }
        }
        else {
            if (botaoExcluir) {
                resetarBotaoExcluir(botaoExcluir);
                botaoExcluir = null;
            }
        }
    });

    function resetarBotaoExcluir(btn) {
        btn.textContent = "Excluir";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-outline-danger");
    }

    // ======== MODAL DE CADASTRAR/SELECIONAR CÁLCULO DAS NOTAS ========
    const btnAdd = document.querySelector("#btnAddComponente");
    const btnProximoFormula = document.querySelector("#btnProximoFormula");
    const btnVoltarComponentes = document.querySelector("#btnVoltarComponentes");
    const btnSalvarFormula = document.querySelector("#btnSalvarFormula");
    const btnEditarComponentes = document.querySelector("#btnEditarComponentes");
    const btnVoltarSelecao = document.querySelector("#btnVoltarSelecao");
    const btnAtualizarFormula = document.querySelector("#btnAtualizarFormula");
    const nomeInput = document.querySelector("#nomeComponente");
    const descricaoInput = document.querySelector("#descricaoComponente");
    const lista = document.querySelector("#listaComponentes");
    const formNota = document.querySelector("#formNota");
    const avisoNome = document.querySelector("#avisoNomeComponente");
    const avisoComponentes = document.querySelector("#avisoComponentes");
    const inputFormula = document.querySelector("#inputFormula");
    const avisoFormula = document.querySelector("#avisoFormula");
    const componentesDisponiveis = document.querySelector("#componentesDisponiveis");

    const etapaSelecao = document.querySelector("#etapaSelecao");
    const etapaComponentes = document.querySelector("#etapaComponentes");
    const etapaFormula = document.querySelector("#etapaFormula");
    const etapaEditarComponentes = document.querySelector("#etapaEditarComponentes");

    let componentesAdicionados = [];
    let componentesParaEditar = [];
    let formulaAtual = null;
    let veioDeEdicao = false; // Controla se veio da tela de editar componentes

    // Máscara para o nome do componente
    $('#nomeComponente').mask('A0', {
        translation: {
            'A': { pattern: /[A-Za-z]/ },
            '0': { pattern: /[0-9]/ }
        }
    });

    $('#nomeComponente').on('input', function () {
        $(this).val($(this).val().replace(/[a-z]/g, letra => letra.toUpperCase()));
    });

    // Validação do nome do componente
    nomeInput.onkeyup = function () {
        const valorNome = nomeInput.value.trim().toUpperCase();
        const isNomeValido = /^[A-Za-z][0-9]$/.test(valorNome);
        const nomeDuplicado = componentesAdicionados.some(c => c.name === valorNome);

        if (!isNomeValido || nomeDuplicado) {
            nomeInput.classList.add("inputErrado");
            avisoNome.style.display = "flex";
            avisoNome.textContent = nomeDuplicado ?
                `O componente ${valorNome} já foi adicionado.` :
                "Use o formato letra + número (ex: N1, T2).";
            btnAdd.disabled = true;
        } else {
            nomeInput.classList.remove("inputErrado");
            avisoNome.style.display = "none";
            btnAdd.disabled = nomeInput.value.trim().length === 0;
        }
    };

    // Adicionar componente
    formNota.addEventListener("submit", (event) => {
        event.preventDefault();

        const nome = nomeInput.value.trim().toUpperCase();
        const descricao = descricaoInput.value.trim() || nome;

        if (!nome) return;

        // Verifica duplicata antes de adicionar
        const nomeDuplicado = componentesAdicionados.some(c => c.name === nome);
        if (nomeDuplicado) {
            alert(`O componente ${nome} já foi adicionado.`);
            return;
        }

        componentesAdicionados.push({ name: nome, description: descricao });

        const novoItem = document.createElement("li");
        novoItem.className = "list-group-item d-flex justify-content-between align-items-center";
        novoItem.dataset.componentName = nome;
        novoItem.innerHTML = `
            <div>
                <strong>${nome}</strong> - ${descricao}
            </div>
            <button class="btn btn-sm btn-outline-danger btn-excluir-componente">Excluir</button>
        `;

        lista.appendChild(novoItem);

        formNota.reset();
        btnAdd.disabled = true;

        // Reaplica máscara
        $('#nomeComponente').mask('A0', {
            translation: {
                'A': { pattern: /[A-Za-z]/ },
                '0': { pattern: /[0-9]/ }
            }
        });

        // Atualiza estado do botão próximo e aviso
        if (componentesAdicionados.length >= 2) {
            btnProximoFormula.disabled = false;
            avisoComponentes.style.display = "none";
        } else {
            btnProximoFormula.disabled = true;
            avisoComponentes.style.display = "flex";
        }
    });

    // Excluir componente
    lista.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-excluir-componente")) {
            const item = event.target.closest("li");
            const nome = item.dataset.componentName;

            componentesAdicionados = componentesAdicionados.filter(c => c.name !== nome);
            item.remove();

            // Atualiza estado do botão próximo e aviso
            if (componentesAdicionados.length >= 2) {
                btnProximoFormula.disabled = false;
                avisoComponentes.style.display = "none";
            } else {
                btnProximoFormula.disabled = true;
                avisoComponentes.style.display = "flex";
            }
        }
    });

    // Próximo: Ir para etapa de fórmula
    btnProximoFormula.addEventListener("click", () => {
        etapaComponentes.style.display = "none";
        etapaFormula.style.display = "block";

        // Mostra componentes disponíveis
        componentesDisponiveis.innerHTML = "";
        componentesAdicionados.forEach(comp => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn-sm btn-outline-primary";
            btn.textContent = comp.name;
            btn.onclick = () => {
                inputFormula.value += comp.name;
                inputFormula.focus();
                validarFormula();
            };
            componentesDisponiveis.appendChild(btn);
        });
    });

    // Voltar para componentes
    btnVoltarComponentes.addEventListener("click", () => {
        etapaFormula.style.display = "none";

        // Se veio da tela de edição, volta para ela
        if (veioDeEdicao) {
            etapaEditarComponentes.style.display = "block";
            veioDeEdicao = false; // Reseta o controle
        } else {
            // Senão, volta para a tela de cadastrar novos
            etapaComponentes.style.display = "block";
        }
    });

    // Validar fórmula
    inputFormula.onkeyup = validarFormula;

    function validarFormula() {
        const formula = inputFormula.value.trim();

        if (formula.length === 0) {
            btnSalvarFormula.disabled = true;
            avisoFormula.style.display = "none";
            return;
        }

        // Verifica se todos os componentes estão na fórmula
        const componentesFaltando = componentesAdicionados.filter(comp => {
            const regex = new RegExp(comp.name, 'gi');
            return !regex.test(formula);
        });

        if (componentesFaltando.length > 0) {
            const nomes = componentesFaltando.map(c => c.name).join(', ');
            avisoFormula.textContent = `Fórmula incompleta! Faltam os componentes: ${nomes}`;
            avisoFormula.style.display = "flex";
            avisoFormula.style.color = "red";
            btnSalvarFormula.disabled = true;
            return;
        }

        try {
            // Substitui os componentes por valores de teste (todos = 1)
            // Aceita tanto maiúsculas quanto minúsculas
            let formulaTeste = formula;
            componentesAdicionados.forEach(comp => {
                // Substitui tanto maiúsculas quanto minúsculas
                formulaTeste = formulaTeste.replace(new RegExp(comp.name, 'gi'), '1');
            });

            // Avalia a fórmula
            const resultado = eval(formulaTeste);

            // Verifica se o resultado é exatamente 1
            if (isNaN(resultado) || resultado < 0) {
                avisoFormula.textContent = "Fórmula inválida! Com todas as notas, o resultado deve ser 1.";
                avisoFormula.style.display = "flex";
                avisoFormula.style.color = "red";
                btnSalvarFormula.disabled = true;
            } else if (Math.abs(resultado - 1) > 0.01) {
                avisoFormula.textContent = `Atenção: Com todas as notas, o resultado é ${resultado.toFixed(2)}. Deveria ser 1.`;
                avisoFormula.style.display = "flex";
                avisoFormula.style.color = "orange";
                btnSalvarFormula.disabled = true;
            } else {
                avisoFormula.textContent = `✓ Fórmula válida! Resultado com notas ${resultado.toFixed(2)}`;
                avisoFormula.style.display = "flex";
                avisoFormula.style.color = "green";
                btnSalvarFormula.disabled = false;
            }
        } catch (error) {
            avisoFormula.textContent = "Fórmula inválida! Verifique a sintaxe.";
            avisoFormula.style.display = "flex";
            avisoFormula.style.color = "red";
            btnSalvarFormula.disabled = true;
        }
    }

    function atualizarTabelaComponentes() {
        const thead = tabela.querySelector("thead tr.tabelaAlunos");
        const tbody = tabela.querySelector("tbody");

        while (thead.children.length > 3) {
            thead.removeChild(thead.children[2]);
        }

        const thAcoes = thead.querySelector("th.text-center");

        componentesNota.forEach(comp => {
            const th = document.createElement("th");
            th.classList.add("headerNotas");
            th.innerHTML = `
        <div style="text-indent: -37.5px;" class="d-flex align-items-center justify-content-center">
          <span>${comp.nome}</span>
          <button class="btn btn-sm btn-outline-secondary btn-editar-nota"
            data-componente="${comp.nome}" title="Editar notas de ${comp.nome}">
            <i class="bi bi-pencil-square"></i>
          </button>
        </div>
      `;
            thead.insertBefore(th, thAcoes);
        });

        const thMedia = document.createElement("th");
        thMedia.classList.add("headerMediaFinal");
        thMedia.textContent = "MF";
        thead.insertBefore(thMedia, thAcoes);

        tbody.querySelectorAll("tr").forEach(linha => {
            const tds = Array.from(linha.children);
            tds.forEach(td => {
                if (!td.classList.contains("td-acoes") &&
                    !td.querySelector(".ra") &&
                    !td.querySelector(".nome")) {
                    td.remove();
                }
            });

            const tdAcoes = linha.querySelector(".td-acoes");

            componentesNota.forEach(comp => {
                const td = document.createElement("td");
                td.innerHTML = `
        <input type="text"
               class="nota form-control form-control-sm me-2"
               data-componente="${comp.nome}"
               data-component-id="${comp.id}"
               disabled>
      `;
                linha.insertBefore(td, tdAcoes);
            });

            const tdMedia = document.createElement("td");
            tdMedia.style.textAlign = "center";
            tdMedia.innerHTML = `
      <input type="text" class="mediaFinal form-control form-control-sm"
             disabled style="width:50px; text-align:center;">
    `;
            linha.insertBefore(tdMedia, tdAcoes);
        });
    }

    // Salvar fórmula no backend
    btnSalvarFormula.addEventListener("click", async () => {
        // Verifica se já existe fórmula cadastrada (atualização)
        // Verifica variável local e depois verifica no banco de dados
        let existeFormula = formulaAtual !== null;

        try {
            // Busca componentes e fórmula do banco para confirmar
            const checkResponse = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (checkResponse.ok) {
                const data = await checkResponse.json();
                // Se existem componentes OU fórmula no banco, é uma atualização
                existeFormula = existeFormula || (data.components && data.components.length > 0) || (data.formula !== null);
            }
        } catch (error) {
            console.error('Erro ao verificar fórmula existente:', error);
            // Em caso de erro, mantém a verificação local
        }

        // Se já existe fórmula, mostra aviso sobre exclusão de notas
        if (existeFormula) {
            const confirmar = confirm(
                '⚠️ ATENÇÃO!\n\n' +
                'Ao salvar esta fórmula, TODAS AS NOTAS dos alunos serão APAGADAS.\n\n' +
                'As notas excluídas serão registradas no histórico de auditoria.\n\n' +
                'Deseja continuar?'
            );

            if (!confirmar) {
                return; // Cancela a operação
            }
        }

        // Normaliza a fórmula para maiúsculas antes de salvar
        let formula = inputFormula.value.trim();

        // Substitui todos os componentes para maiúsculas na fórmula
        componentesAdicionados.forEach(comp => {
            formula = formula.replace(new RegExp(comp.name, 'gi'), comp.name.toUpperCase());
        });

        const payload = {
            subjectId: parseInt(subjectId),
            components: componentesAdicionados,
            formula: formula
        };

        try {
            const response = await fetch(`${API_URL}/grade-components`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                formulaAtual = formula;
                await carregarComponentesNota();
                $('#modalCadastrarNota').modal('hide');
                alert('Cálculo de notas salvo com sucesso!');
            } else {
                const errorData = await response.json();
                console.error('Erro do servidor:', errorData);
                alert('Erro ao salvar cálculo de notas: ' + (errorData.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
        }
    });

    // Abrir modal
    btnNota.addEventListener('click', async function () {
        // Reseta o estado inicial
        lista.innerHTML = "";
        componentesAdicionados = [];
        btnProximoFormula.disabled = true;
        avisoComponentes.style.display = "flex";
        inputFormula.value = "";
        nomeInput.value = "";
        descricaoInput.value = "";
        btnAdd.disabled = true;

        // Verifica se já existe cálculo cadastrado
        try {
            const response = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.components && data.components.length > 0) {
                    // Já existe cálculo - mostra opção de selecionar ou criar novo
                    etapaSelecao.style.display = "block";
                    etapaComponentes.style.display = "none";
                    etapaFormula.style.display = "none";
                } else {
                    // Não existe - vai direto para criar
                    etapaSelecao.style.display = "none";
                    etapaComponentes.style.display = "block";
                    etapaFormula.style.display = "none";
                }
            }
        } catch (error) {
            console.error('Erro:', error);
        }

        $('#modalCadastrarNota').modal('show');
    });

    // Botão editar componentes
    btnEditarComponentes.addEventListener('click', async () => {
        // Carrega componentes existentes
        try {
            const response = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                componentesParaEditar = data.components.map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description
                }));

                mostrarComponentesParaEditar();

                etapaSelecao.style.display = "none";
                etapaEditarComponentes.style.display = "block";
                etapaComponentes.style.display = "none";
                etapaFormula.style.display = "none";
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar componentes');
        }
    });

    function mostrarComponentesParaEditar() {
        const lista = document.querySelector("#listaComponentesExistentes");
        lista.innerHTML = "";

        componentesParaEditar.forEach((comp, index) => {
            const item = document.createElement("li");
            item.className = "list-group-item d-flex justify-content-between align-items-center";
            item.innerHTML = `
                <div>
                    <strong>${comp.name}</strong> - ${comp.description}
                </div>
                <button class="btn btn-sm btn-outline-danger btn-remover-comp" data-index="${index}">Remover</button>
            `;
            lista.appendChild(item);
        });

        // Valida botão atualizar fórmula
        btnAtualizarFormula.disabled = componentesParaEditar.length < 2;
    }

    // Remover componente
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover-comp')) {
            const index = parseInt(e.target.dataset.index);

            if (componentesParaEditar.length <= 2) {
                alert('Você precisa ter pelo menos 2 componentes!');
                return;
            }

            componentesParaEditar.splice(index, 1);
            mostrarComponentesParaEditar();
        }
    });

    // Adicionar novo componente na edição
    const formNovoComponente = document.querySelector("#formNovoComponente");
    const nomeNovoInput = document.querySelector("#nomeNovoComponente");
    const descricaoNovoInput = document.querySelector("#descricaoNovoComponente");
    const avisoNomeNovo = document.querySelector("#avisoNomeNovoComponente");
    const btnAddNovo = document.querySelector("#btnAddNovoComponente");

    $('#nomeNovoComponente').mask('A0', {
        translation: {
            'A': { pattern: /[A-Za-z]/ },
            '0': { pattern: /[0-9]/ }
        }
    });

    $('#nomeNovoComponente').on('input', function () {
        $(this).val($(this).val().replace(/[a-z]/g, letra => letra.toUpperCase()));
    });

    nomeNovoInput.onkeyup = function () {
        const valorNome = nomeNovoInput.value.trim().toUpperCase();
        const isNomeValido = /^[A-Za-z][0-9]$/.test(valorNome);
        const nomeDuplicado = componentesParaEditar.some(c => c.name === valorNome);

        if (!isNomeValido || nomeDuplicado) {
            nomeNovoInput.classList.add("inputErrado");
            avisoNomeNovo.style.display = "flex";
            avisoNomeNovo.textContent = nomeDuplicado ?
                `O componente ${valorNome} já existe.` :
                "Use letra + número (ex: N1, T2).";
            btnAddNovo.disabled = true;
        } else {
            nomeNovoInput.classList.remove("inputErrado");
            avisoNomeNovo.style.display = "none";
            btnAddNovo.disabled = false;
        }
    };

    formNovoComponente.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = nomeNovoInput.value.trim().toUpperCase();
        const descricao = descricaoNovoInput.value.trim() || nome;

        if (!nome) return;

        componentesParaEditar.push({ name: nome, description: descricao });
        mostrarComponentesParaEditar();

        formNovoComponente.reset();
        btnAddNovo.disabled = true;

        // Reaplica máscara
        $('#nomeNovoComponente').mask('A0', {
            translation: {
                'A': { pattern: /[A-Za-z]/ },
                '0': { pattern: /[0-9]/ }
            }
        });
    });

    // Voltar para seleção
    btnVoltarSelecao.addEventListener('click', () => {
        etapaEditarComponentes.style.display = "none";
        etapaSelecao.style.display = "block";
        componentesParaEditar = [];
    });

    // Atualizar fórmula - redireciona para a tela de fórmulas
    btnAtualizarFormula.addEventListener('click', async () => {
        if (componentesParaEditar.length < 2) {
            alert('Você precisa ter pelo menos 2 componentes!');
            return;
        }

        try {
            // Busca a fórmula atual do banco (NÃO salva ainda)
            const response = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const formulaAtualBanco = data.formula;

                // Marca que veio da tela de edição
                veioDeEdicao = true;

                // Fecha o modal e vai para a etapa de fórmula (SEM salvar ainda)
                etapaEditarComponentes.style.display = "none";
                etapaFormula.style.display = "block";

                // Atualiza os componentes disponíveis
                componentesAdicionados = componentesParaEditar.map(c => ({
                    name: c.name,
                    description: c.description
                }));

                // Mostra componentes disponíveis
                componentesDisponiveis.innerHTML = "";
                componentesAdicionados.forEach(comp => {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "btn btn-sm btn-outline-primary";
                    btn.textContent = comp.name;
                    btn.onclick = () => {
                        inputFormula.value += comp.name;
                        inputFormula.focus();
                        validarFormula();
                    };
                    componentesDisponiveis.appendChild(btn);
                });

                // Carrega a fórmula atual no input (ou limpa se não houver)
                inputFormula.value = formulaAtualBanco || '';
                validarFormula();
            } else {
                const errorData = await response.json();
                alert(`Erro ao buscar fórmula: ${errorData.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert(`Erro ao conectar com o servidor: ${error.message}`);
        }
    });

    // Botão excluir cálculo
    const btnExcluirCalculo = document.querySelector("#btnExcluirCalculo");
    btnExcluirCalculo.addEventListener('click', async () => {
        const confirmacao = confirm(
            '⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE!\n\n' +
            'Tem certeza que deseja excluir o cálculo de notas?\n\n' +
            'Serão excluídos:\n' +
            '- Componentes (N1, N2, etc.)\n' +
            '- Fórmula\n' +
            '- TODAS as notas dos alunos\n\n' +
            'As notas excluídas serão registradas no histórico de auditoria.\n\n' +
            'Esta ação NÃO pode ser desfeita!'
        );

        if (confirmacao) {
            try {
                const response = await fetch(`${API_URL}/grade-components/subject/${subjectId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert('Cálculo excluído com sucesso!');
                    $('#modalCadastrarNota').modal('hide');
                    location.reload();
                } else {
                    alert('Erro ao excluir cálculo');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao conectar com o servidor');
            }
        }
    });

    // Limpar ao fechar modal
    $('#modalCadastrarNota').on('hidden.bs.modal', function () {
        lista.innerHTML = "";
        componentesAdicionados = [];
        inputFormula.value = "";
        nomeInput.value = "";
        descricaoInput.value = "";
        btnProximoFormula.disabled = true;
        avisoComponentes.style.display = "flex";
        etapaSelecao.style.display = "none";
        etapaComponentes.style.display = "block";
        etapaFormula.style.display = "none";
        etapaEditarComponentes.style.display = "none";
        componentesParaEditar = [];

        // Limpa form de novo componente
        document.querySelector("#formNovoComponente").reset();
        btnAddNovo.disabled = true;
    });

    // Voltar
    btnVoltar.addEventListener('click', function (event) {
        event.preventDefault();
        window.history.back();
    });

    // Sair
    document.addEventListener("click", function (event) {
        const btn = event.target;

        if (btn.classList.contains("sair")) {
            event.preventDefault();
            event.stopPropagation();

            if (btn === botaoSair) {
                localStorage.clear();
                window.location.href = '/frontend/login/html/login.html';
            }
            else {
                if (botaoSair) resetarBotaoSair(botaoSair);
                botaoSair = btn;
                btn.textContent = "Confirma?";
                btn.classList.remove("btn-outline-danger");
                btn.classList.add("btn-danger");
            }
        }
        else {
            if (botaoSair) {
                resetarBotaoSair(botaoSair);
                botaoSair = null;
            }
        }
    });

    function resetarBotaoSair(btn) {
        btn.innerHTML = '<i class="bi bi-door-open"></i> Sair';
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-outline-danger");
    }

    // ======== IMPORTAR/EXPORTAR CSV ========
    const btnImportarCSV = document.querySelector("#btnImportarCSV");
    const btnExportarCSV = document.querySelector("#btnExportarCSV");
    const inputCSV = document.querySelector("#inputCSV");

    // Botão Importar CSV
    btnImportarCSV.addEventListener("click", () => {
        inputCSV.click();
    });

    // Processar arquivo CSV
    inputCSV.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            await processarCSV(text);
        };
        reader.readAsText(file);

        // Limpa o input para permitir selecionar o mesmo arquivo novamente
        inputCSV.value = '';
    });

    // Função para remover acentos
    function removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    async function processarCSV(csvText) {
        const linhas = csvText.split('\n').filter(linha => linha.trim() !== '');

        if (linhas.length === 0) {
            alert('Arquivo CSV vazio!');
            return;
        }

        let importados = 0;
        let duplicados = 0;
        let erros = 0;

        // Pega os RAs já existentes na turma
        const rasExistentes = Array.from(document.querySelectorAll("#tabelaAlunos tbody .ra"))
            .map(input => input.value.trim());

        // Detecta se a primeira linha é cabeçalho (verifica se o primeiro campo é numérico)
        let inicioLinha = 0;
        if (linhas.length > 0) {
            const primeiraLinha = linhas[0].trim();
            const primeirasColunas = primeiraLinha.split(/[,;]/).map(col => col.trim().replace(/^"|"$/g, ''));

            // Se o primeiro campo NÃO for 8 dígitos, é cabeçalho
            if (primeirasColunas.length >= 2 && !/^\d{8}$/.test(primeirasColunas[0])) {
                inicioLinha = 1; // Pula a primeira linha
            }
        }

        for (let i = inicioLinha; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;

            // Separa por vírgula ou ponto-e-vírgula
            const colunas = linha.split(/[,;]/).map(col => col.trim().replace(/^"|"$/g, ''));

            if (colunas.length < 2) {
                console.warn(`Linha ${i + 1} ignorada: menos de 2 colunas`);
                erros++;
                continue;
            }

            const ra = colunas[0].trim();
            const nome = removerAcentos(colunas[1].trim());

            // Valida RA (exatamente 8 dígitos)
            if (!/^\d{8}$/.test(ra)) {
                console.warn(`Linha ${i + 1} ignorada: RA inválido (${ra}) - deve ter exatamente 8 dígitos`);
                erros++;
                continue;
            }

            // Valida Nome (apenas letras e espaços)
            if (!/^[A-Za-z\s]+$/.test(nome) || nome.length === 0) {
                console.warn(`Linha ${i + 1} ignorada: Nome inválido (${nome}) - deve conter apenas letras e espaços`);
                erros++;
                continue;
            }

            // Verifica duplicata
            if (rasExistentes.includes(ra)) {
                console.warn(`Linha ${i + 1} ignorada: RA ${ra} já existe`);
                duplicados++;
                continue;
            }

            // Importa o aluno
            try {
                const response = await fetch(`${API_URL}/students`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        classId: parseInt(classId),
                        studentId: ra,
                        name: nome
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    adicionarLinhaTabela(data.id, ra, nome);
                    rasExistentes.push(ra);
                    importados++;
                } else {
                    console.error(`Erro ao importar linha ${i + 1}`);
                    erros++;
                }
            } catch (error) {
                console.error(`Erro ao importar linha ${i + 1}:`, error);
                erros++;
            }
        }

        // Mostra resultado
        let mensagem = `Importação concluída!\n\n`;
        mensagem += `✅ Importados: ${importados}\n`;
        if (duplicados > 0) mensagem += `⚠️ Duplicados (ignorados): ${duplicados}\n`;
        if (erros > 0) mensagem += `❌ Erros: ${erros}`;

        alert(mensagem);
    }

    // Botão Exportar CSV - Busca dados do backend
    btnExportarCSV.addEventListener("click", async () => {
        try {
            // Faz requisição ao backend para exportar CSV
            const response = await fetch(`${API_URL}/students/class/${classId}/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao exportar CSV');
            }

            // Recebe o conteúdo CSV do backend
            const csvContent = await response.text();

            // Cria o blob e faz o download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `alunos_${turma}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            alert('Erro ao exportar CSV. Tente novamente.');
        }
    });

});
