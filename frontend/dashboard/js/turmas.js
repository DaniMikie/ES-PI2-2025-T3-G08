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
  const codigoTurma = document.querySelector("#codigoTurma");
  const avisoNomeTurma = document.querySelector("#avisoNomeTurma");
  const avisoCodigoTurma = document.querySelector("#avisoCodigoTurma");

  // Máscara para o nome da turma, permite letras, números e espaços
  $('#nomeTurma').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
    $(this).val(val);
  });

  // Máscara para o código da turma: 1 letra + até 3 números (ex: T101, G201)
  $('#codigoTurma').on('input', function () {
    let val = $(this).val().toUpperCase();

    // Remove caracteres inválidos
    val = val.replace(/[^A-Z0-9]/g, '');

    // Garante que começa com letra e tem no máximo 4 caracteres (1 letra + 3 números)
    if (val.length > 0 && !/^[A-Z]/.test(val)) {
      val = '';
    }
    else if (val.length > 4) {
      val = val.substring(0, 4);
    }

    // Garante que após a primeira letra, só aceita números
    if (val.length > 1) {
      const letra = val[0];
      const numeros = val.substring(1).replace(/[^0-9]/g, '');
      val = letra + numeros;
    }

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
          await adicionarLinhaTabela(cls.id, cls.name, cls.code);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  }

  async function adicionarLinhaTabela(id, nome, codigo) {
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
    }
    catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }

    novaLinha.innerHTML = `
      <td><input type="text" value="${nome}" disabled class="nomeTurma form-control form-control-sm"></td>
      <td><input type="text" value="${codigo}" disabled class="codigoTurma form-control form-control-sm"></td>
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
  codigoTurma.onkeyup = onInputKeyUp;

  // Função que verifica se já existe uma turma com o mesmo nome
  function nomeDuplicado(nome) {
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

  // Função que verifica se já existe uma turma com o mesmo código
  function codigoDuplicado(codigo) {
    let existe = false;
    const codigoUpper = codigo.trim().toUpperCase();

    $('#tabelaTurma tbody tr').each(function () {
      const codigoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();
      if (codigoExistente === codigoUpper) {
        existe = true;
        return false;
      }
    });

    return existe;
  }

  // Função que verifica se os inputs estão preenchidos corretamente
  function onInputKeyUp(_event) {
    const nome = nomeTurma.value.trim();
    const codigo = codigoTurma.value.trim();

    let nomeValido = true;
    let codigoValido = true;

    // Validação do nome
    if (nome.length === 0) {
      nomeTurma.classList.add("inputErrado");
      avisoNomeTurma.textContent = "O nome não pode estar vazio";
      avisoNomeTurma.style.display = "flex";
      nomeValido = false;
    } else if (nomeDuplicado(nome)) {
      nomeTurma.classList.add("inputErrado");
      avisoNomeTurma.textContent = "Já existe uma turma com esse nome";
      avisoNomeTurma.style.display = "flex";
      nomeValido = false;
    } else {
      nomeTurma.classList.remove("inputErrado");
      avisoNomeTurma.style.display = "none";
    }

    // Validação do código: 1 letra + 1 a 3 números
    if (codigo.length === 0) {
      codigoTurma.classList.add("inputErrado");
      avisoCodigoTurma.textContent = "O código não pode estar vazio";
      avisoCodigoTurma.style.display = "flex";
      codigoValido = false;
    }
    else if (!/^[A-Z]\d{1,3}$/.test(codigo)) {
      codigoTurma.classList.add("inputErrado");
      avisoCodigoTurma.textContent = "Formato inválido. Use 1 letra + até 3 números (ex: T101)";
      avisoCodigoTurma.style.display = "flex";
      codigoValido = false;
    }
    else if (codigoDuplicado(codigo)) {
      codigoTurma.classList.add("inputErrado");
      avisoCodigoTurma.textContent = "Já existe uma turma com esse código";
      avisoCodigoTurma.style.display = "flex";
      codigoValido = false;
    }
    else {
      codigoTurma.classList.remove("inputErrado");
      avisoCodigoTurma.style.display = "none";
    }

    btnCadastrar.disabled = !(nomeValido && codigoValido);
  }

  // Cria um novo elemento na tabela
  formTurma.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeTurma.value.trim();
    const codigo = codigoTurma.value.trim();

    if (nome === "" || codigo === "") return;

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
          code: codigo
        })
      });

      if (response.ok) {
        const data = await response.json();
        await adicionarLinhaTabela(data.id, nome, codigo);
        formTurma.reset();
        btnCadastrar.disabled = true;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao cadastrar turma');
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

      const inputCodigo = linha.querySelector("input.codigoTurma");

      if (salvando) {
        const classId = linha.dataset.classId;
        const novoNome = inputNome.value.trim();
        const novoCodigo = inputCodigo.value.trim();

        try {
          const response = await fetch(`${API_URL}/classes/${classId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: novoNome,
              code: novoCodigo
            })
          });

          if (response.ok) {
            inputNome.disabled = true;
            inputCodigo.disabled = true;
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
          }
          else {
            const errorData = await response.json();
            alert(errorData.error || 'Erro ao atualizar turma');
          }
        } catch (error) {
          console.error('Erro:', error);
          alert('Erro ao conectar com o servidor');
        }
      } else {
        valoresOriginaisLinha = {
          nome: inputNome.value,
          codigo: inputCodigo.value,
        };

        inputNome.disabled = false;
        inputCodigo.disabled = false;
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

        // Aplica máscara no código durante edição
        $(inputCodigo).on('input', function () {
          let val = $(this).val().toUpperCase();
          val = val.replace(/[^A-Z0-9]/g, '');
          if (val.length > 0 && !/^[A-Z]/.test(val)) {
            val = '';
          } else if (val.length > 4) {
            val = val.substring(0, 4);
          } if (val.length > 1) {
            const letra = val[0];
            const numeros = val.substring(1).replace(/[^0-9]/g, '');
            val = letra + numeros;
          }
          $(this).val(val);
        });

        function validarEdicao() {
          const nome = inputNome.value.trim();
          const codigo = inputCodigo.value.trim().toUpperCase();

          let nomeValido = nome.length > 0;
          let codigoValido = /^[A-Z]\d{1,3}$/.test(codigo);

          // Verifica duplicata de nome
          let nomeDuplicado = false;
          $('#tabelaTurma tbody tr').not(linha).each(function () {
            const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
            if (nomeExistente === nome.toUpperCase()) {
              nomeDuplicado = true;
              return false;
            }
          });

          // Verifica duplicata de código
          let codigoDuplicado = false;
          $('#tabelaTurma tbody tr').not(linha).each(function () {
            const codigoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();
            if (codigoExistente === codigo) {
              codigoDuplicado = true;
              return false;
            }
          });

          if (!nomeValido || nomeDuplicado) {
            inputNome.classList.add("inputErrado");
          } else {
            inputNome.classList.remove("inputErrado");
          }

          if (!codigoValido || codigoDuplicado) {
            inputCodigo.classList.add("inputErrado");
          } else {
            inputCodigo.classList.remove("inputErrado");
          }

          btn.disabled = !(nomeValido && codigoValido && !nomeDuplicado && !codigoDuplicado);
        }

        validarEdicao();
        inputNome.onkeyup = validarEdicao;
        inputCodigo.onkeyup = validarEdicao;
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
      const inputCodigo = linha.querySelector(".codigoTurma");

      inputNome.value = valoresOriginaisLinha.nome;
      inputCodigo.value = valoresOriginaisLinha.codigo;
      inputNome.disabled = true;
      inputCodigo.disabled = true;

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;

      inputNome.classList.remove("inputErrado");
      inputCodigo.classList.remove("inputErrado");
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
          // Busca informações do backend sobre o que será excluído
          const infoResponse = await fetch(`${API_URL}/classes/${classId}/deletion-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!infoResponse.ok) {
            const errorData = await infoResponse.json();
            alert(errorData.error || 'Erro ao buscar informações da turma');
            resetarBotaoExcluir(btn);
            botaoExcluir = null;
            return;
          }

          const info = await infoResponse.json();

          // Usa a mensagem completa do backend
          const confirmacao = confirm(info.message);

          if (!confirmacao) {
            resetarBotaoExcluir(btn);
            botaoExcluir = null;
            return;
          }

          // Executa a exclusão
          const deleteResponse = await fetch(`${API_URL}/classes/${classId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (deleteResponse.ok) {
            linha.remove();
            alert('Turma excluída com sucesso!');
          } else {
            const errorData = await deleteResponse.json();
            alert(errorData.error || 'Erro ao excluir turma');
            resetarBotaoExcluir(btn);
          }
        } catch (error) {
          console.error('Erro:', error);
          alert('Erro ao conectar com o servidor');
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
    const target = event.target;
    const btn = target.classList.contains("sair") ? target : target.closest(".sair");

    if (btn) {
      event.preventDefault();
      event.stopPropagation();

      if (btn === botaoSair) {
        localStorage.clear();
        window.location.href = '/frontend/login/html/login.html';
      }
      else {
        if (botaoSair) resetarBotaoSair(botaoSair);
        botaoSair = btn;
        btn.innerHTML = '<i class="bi bi-door-open"></i> Confirma?';
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
