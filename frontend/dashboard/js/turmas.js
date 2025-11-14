/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: turmas.js (Integrado com Backend)
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

  // Recupera informações da disciplina pela URL
  const urlParams = new URLSearchParams(window.location.search);
  const disciplina = urlParams.get('disciplina');
  const subjectId = urlParams.get('subjectId');

  // ======== BREADCRUMB: Monta navegação (Instituição > Curso > Disciplina) ========
  async function carregarBreadcrumb() {
    if (!subjectId) {
      document.querySelector('#msgDisciplina').textContent = 'Disciplina não informada';
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
              <a href="instituicoes.html" class="breadcrumb-link">${institution.name}</a> > 
              <a href="disciplinas.html?curso=${encodeURIComponent(course.name)}&courseId=${course.id}" class="breadcrumb-link">${course.name}</a> > 
              <span class="breadcrumb-atual">${disciplina}</span>
            `;
            // BREADCRUMB PASSO 5: Exibe o breadcrumb na tela
            document.querySelector('#msgDisciplina').innerHTML = `<small>${breadcrumb}</small>`;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar breadcrumb:', error);
      document.querySelector('#msgDisciplina').textContent = `Disciplina: ${disciplina}`;
    }
  }

  // Executa a função para carregar o breadcrumb
  carregarBreadcrumb();

  // Captura os elementos do HTML pelo ID
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const btnVoltar = document.querySelector("#btnVoltar");
  const tabela = document.querySelector("#tabelaTurma");
  const formTurma = document.querySelector("#formTurma");
  const nomeTurma = document.querySelector("#nomeTurma");
  const avisoTurma = document.querySelector("#avisoTurma");

  // Máscara para o nome da turma, permite letras, números e espaços
  $('#nomeTurma').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
    $(this).val(val);
  });

  // Variáveis para verificar oo botoes excluir e salvar
  let botaoExcluir = null;
  let botaoSair = null;
  let linhaEditando = null;
  let valoresOriginaisLinha = null;

  // Desabilita o botão de salvar
  btnCadastrar.disabled = true;

  // ======== CARREGAR TURMAS ========
  async function carregarTurmas() {
    if (!subjectId) return;

    try {
      const response = await fetch(`${API_URL}/classes/subject/${subjectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const classes = await response.json();
        tabela.querySelector("tbody").innerHTML = '';

        // Carrega turmas uma por uma para buscar quantidade de alunos
        for (const cls of classes) {
          await adicionarLinhaTabela(cls.id, cls.name);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }

  async function adicionarLinhaTabela(id, nome) {
    const novaLinha = document.createElement("tr");
    novaLinha.dataset.classId = id;

    // Busca a quantidade de alunos
    let qtdAlunos = 0;
    try {
      const response = await fetch(`${API_URL}/students/class/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const students = await response.json();
        qtdAlunos = students.length;
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }

    novaLinha.innerHTML = `
      <td><input type="text" value="${nome}" disabled class="nomeTurma form-control form-control-sm"></td>
      <td class="text-center"><span class="badge bg-primary">${qtdAlunos}</span></td>
      <td class="text-center">
        <button class="btn-ver btn btn-sm btn-outline-primary me-2">Ver turma</button>
        <button class="btn-editar btn btn-sm btn-outline-secondary me-2">Editar</button>
        <button class="btn-excluir btn btn-sm btn-outline-danger me-2">Excluir</button>
      </td>
    `;
    tabela.querySelector("tbody").appendChild(novaLinha);
  }

  carregarTurmas();

  // Adiciona eventos para detectar quando o usuário digita nos inputs
  nomeTurma.onkeyup = onInputKeyUp;

  // Função que verifica se já existe uma turma com o mesmo nome
  function turmaDuplicada(nome) {
    let existe = false;
    const nomeUpper = nome.trim().toUpperCase();

    $('#tabelaTurma tbody tr').each(function () {
      const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
      if (nomeExistente === nomeUpper) {
        existe = true;
        return false;
      }
    });

    return existe;
  }

  // Função que verifica se os inputs estão preenchidos corretamente
  function onInputKeyUp(_event) {
    const nome = nomeTurma.value.trim();

    if (nome.length === 0) {
      nomeTurma.classList.add("inputErrado");
      btnCadastrar.disabled = true;
      return;
    } else {
      nomeTurma.classList.remove("inputErrado");
    }

    if (turmaDuplicada(nome)) {
      nomeTurma.classList.add("inputErrado");
      btnCadastrar.disabled = true;
      avisoTurma.textContent = "Já existe uma turma com esse nome";
      avisoTurma.style.display = "flex";
    } else {
      nomeTurma.classList.remove("inputErrado");
      btnCadastrar.disabled = false;
      avisoTurma.style.display = "none";
    }
  }

  // Cria um novo elemento na tabela
  formTurma.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeTurma.value.trim();

    if (nome === "") return;

    try {
      const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId: parseInt(subjectId),
          name: nome,
          code: nome // Usando o nome como código também
        })
      });

      if (response.ok) {
        const data = await response.json();
        adicionarLinhaTabela(data.id, nome);
        formTurma.reset();
        btnCadastrar.disabled = true;
      } else {
        alert('Erro ao cadastrar turma');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    }
  });

  // Evento para manipular cliques na tabela "editar"
  tabela.addEventListener("click", async (event) => {
    const btn = event.target;

    // BOTÃO DE EDITAR LINHA TODA
    if (btn.classList.contains("btn-editar")) {
      event.stopPropagation();

      const linha = btn.closest("tr");
      const inputNome = linha.querySelector("input.nomeTurma");
      const btnVer = linha.querySelector(".btn-ver");

      const salvando = btn.textContent === "Salvar";

      if (!salvando && linhaEditando && linhaEditando !== linha) {
        alert("Conclua ou cancele a edição atual antes de editar outra linha.");
        return;
      }

      if (salvando) {
        const classId = linha.dataset.classId;
        const novoNome = inputNome.value.trim();

        try {
          const response = await fetch(`${API_URL}/classes/${classId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: novoNome,
              code: novoNome
            })
          });

          if (response.ok) {
            inputNome.disabled = true;
            btnVer.disabled = false;

            btn.textContent = "Editar";
            btn.classList.remove("btn-success");
            btn.classList.add("btn-outline-secondary");

            // Reabilita todos os botões
            tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
              b.disabled = false;
            });

            linhaEditando = null;
            valoresOriginaisLinha = null;
          } else {
            alert('Erro ao atualizar turma');
          }
        } catch (error) {
          console.error('Erro:', error);
          alert('Erro ao conectar com o servidor');
        }
      }
      else {
        valoresOriginaisLinha = {
          nome: inputNome.value,
        };

        inputNome.disabled = false;
        btnVer.disabled = true;

        btn.textContent = "Salvar";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-success");

        // Desabilita todos os outros botões
        tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
          if (b !== btn) {
            b.disabled = true;
          }
        });

        linhaEditando = linha;

        function validarEdicao() {
          const nome = inputNome.value.trim().toUpperCase();

          let duplicado = false;

          $('#tabelaTurma tbody tr').not(linha).each(function () {
            const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();

            if (nomeExistente === nome) {
              duplicado = true;
              return false;
            }
          });

          if (nome.length === 0 || duplicado) {
            btn.disabled = true;

            if (nome.length === 0 || duplicado) {
              inputNome.classList.add("inputErrado");
            }
            else {
              inputNome.classList.remove("inputErrado");
            }
          }
          else {
            btn.disabled = false;
            inputNome.classList.remove("inputErrado");
          }
        }

        validarEdicao();
        inputNome.onkeyup = validarEdicao;
      }
    }
  });

  // CLICAR FORA CANCELA A EDIÇÃO
  document.addEventListener("click", (event) => {
    if (!linhaEditando) return;

    const clicouDentroDaLinha = linhaEditando.contains(event.target);

    if (!clicouDentroDaLinha) {
      const linha = linhaEditando;
      const btnEditar = linha.querySelector(".btn-editar");
      const btnVer = linha.querySelector(".btn-ver");
      const inputNome = linha.querySelector(".nomeTurma");

      inputNome.value = valoresOriginaisLinha.nome;
      inputNome.disabled = true;

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;

      inputNome.classList.remove("inputErrado");
      btnEditar.disabled = false;
      btnVer.disabled = false;

      // Reabilita todos os botões
      tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
        b.disabled = false;
      });

      linhaEditando = null;
      valoresOriginaisLinha = null;
    }
  });

  // Função para remover elemento
  document.addEventListener("click", async function (event) {
    const btn = event.target;

    if (btn.classList.contains("btn-excluir")) {
      event.preventDefault();
      event.stopPropagation();

      if (btn === botaoExcluir) {
        const linha = btn.closest("tr");
        const classId = linha.dataset.classId;

        try {
          const response = await fetch(`${API_URL}/classes/${classId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            linha.remove();
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erro ao excluir turma');
            // Reseta o botão para o estado inicial após erro
            resetarBotaoExcluir(btn);
          }
        } catch (error) {
          console.error('Erro:', error);
          alert('Erro ao conectar com o servidor');
          // Reseta o botão para o estado inicial após erro
          resetarBotaoExcluir(btn);
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

  // Ao clicar no botão ver, envia a informação para o proximo arquivo
  $(document).on('click', '.btn-ver', function () {
    formTurma.reset();
    const linha = $(this).closest('tr');
    const turma = linha.find('td').eq(0).find('input').val().trim();
    const classId = linha.data('class-id');
    const url = 'alunos.html?turma=' + encodeURIComponent(turma) + '&classId=' + classId + '&subjectId=' + subjectId;
    window.location.href = url;
  });

  // Ao clicar no botão desejado, envia a informação para o proximo arquivo
  btnVoltar.addEventListener('click', function (event) {
    event.preventDefault();
    window.history.back();
  });

  // Ao clicar em sair, volta para o login 
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

});
