/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: instituicoes.js
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

  // Captura elementos do formulário e tabela
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const formInst = document.querySelector("#formInst");
  const tabela = document.querySelector("#tabelaInst");
  const nomeInst = document.querySelector("#nomeInst");
  const cursoInst = document.querySelector("#cursoInst");
  const aviso = document.querySelector("#avisoInst")

  // Aplica máscara: apenas letras, números e espaços no campo curso
  $('#cursoInst').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
    $(this).val(val);
  });

  // Inicia com botão cadastrar desabilitado
  btnCadastrar.disabled = true;

  // Variáveis de controle para edição e exclusão
  let botaoExcluir = null; // Controla confirmação dupla de exclusão
  let botaoSair = null; // Controla confirmação dupla de logout
  let linhaEditando = null; // Linha atualmente em modo de edição
  let valoresOriginaisLinha = null; // Backup dos valores antes da edição

  // Busca e exibe todas as instituições cadastradas
  async function carregarInstituicoes() {
    try {
      const response = await fetch(`${API_URL}/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const institutions = await response.json();
        tabela.querySelector("tbody").innerHTML = ''; // Limpa tabela

        // Adiciona cada instituição na tabela
        institutions.forEach(inst => {
          adicionarLinhaTabela(inst.id, inst.institution_name, inst.course_name, inst.course_id);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    }
  }

  // Cria uma nova linha na tabela com os dados da instituição
  function adicionarLinhaTabela(instId, instName, courseName, courseId) {
    const novaLinha = document.createElement("tr");
    novaLinha.dataset.instId = instId; // Armazena ID da instituição
    novaLinha.dataset.courseId = courseId; // Armazena ID do curso

    novaLinha.innerHTML = `
        <td><input type="text" value="${instName}" disabled class="inst form-control form-control-sm"></td>
        <td><input type="text" value="${courseName}" disabled class="curso form-control form-control-sm"></td>
        <td class="text-center">
        <button class="btn-ver btn btn-sm btn-outline-primary me-2">Ver curso</button>
        <button class="btn-editar btn btn-sm btn-outline-secondary me-2">Editar</button>
        <button class="btn-excluir btn btn-sm btn-outline-danger me-2">Excluir</button>
        </td>
        `;

    tabela.querySelector("tbody").appendChild(novaLinha);
  }

  // Carrega instituições ao iniciar a página
  carregarInstituicoes();

  // Adiciona eventos de digitação nos campos
  cursoInst.onkeyup = onInputKeyUp;
  nomeInst.onkeyup = onInputKeyUp;

  // Valida campos em tempo real e verifica duplicatas
  function onInputKeyUp(_event) {
    const target = _event.target;

    // Marca campo vazio como inválido
    if (target.id === 'cursoInst') {
      cursoInst.classList.toggle("inputErrado", cursoInst.value.trim().length === 0);
    }
    else if (target.id === 'nomeInst') {
      nomeInst.classList.toggle("inputErrado", nomeInst.value.trim().length === 0);
    }

    const nome = nomeInst.value.trim().toUpperCase();
    const curso = cursoInst.value.trim().toUpperCase();
    const isNotEmpty = nome.length > 0 && curso.length > 0;

    // Verifica se já existe instituição com mesmo nome e curso
    let duplicado = false;
    $('#tabelaInst tbody tr').each(function () {
      const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
      const cursoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();

      if (nomeExistente === nome && cursoExistente === curso) {
        duplicado = true;
        return false; // Para o loop
      }
    });

    // Exibe aviso e desabilita botão se houver duplicata
    if (duplicado) {
      aviso.style.display = "flex";
      aviso.textContent = "Já existe uma instituição com esse nome e curso.";
      btnCadastrar.disabled = true;
      cursoInst.classList.add("inputErrado");
      nomeInst.classList.add("inputErrado");
    }
    // Habilita botão se campos válidos e sem duplicata
    else if (isNotEmpty) {
      aviso.style.display = "none";
      btnCadastrar.disabled = false;
      cursoInst.classList.remove("inputErrado");
      nomeInst.classList.remove("inputErrado");
    }
    // Desabilita botão se campos vazios
    else {
      aviso.style.display = "none";
      btnCadastrar.disabled = true;
    }
  }

  // Cadastra nova instituição ao enviar formulário
  formInst.addEventListener("submit", async (event) => {
    event.preventDefault();

    const inst = nomeInst.value.trim();
    const curso = cursoInst.value.trim();

    if (curso === "" || inst === "") return;

    try {
      // Envia dados para API
      const response = await fetch(`${API_URL}/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          institutionName: inst,
          courseName: curso
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Adiciona nova linha na tabela
        adicionarLinhaTabela(data.institutionId, inst, curso, 0);
        formInst.reset();
        btnCadastrar.disabled = true;
        // Recarrega para atualizar IDs corretos
        carregarInstituicoes();
      } else {
        alert('Erro ao cadastrar instituição');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    }
  });

  // Gerencia modo de edição das linhas da tabela
  tabela.addEventListener("click", async (event) => {
    const btn = event.target;

    if (btn.classList.contains("btn-editar")) {
      event.stopPropagation();

      const linha = btn.closest("tr");
      const inputInst = linha.querySelector("input.inst");
      const inputCurso = linha.querySelector("input.curso");
      const btnVer = linha.querySelector(".btn-ver");
      const salvando = btn.textContent === "Salvar";

      // Impede editar múltiplas linhas simultaneamente
      if (!salvando && linhaEditando && linhaEditando !== linha) {
        alert("Conclua ou cancele a edição atual antes de editar outra linha.");
        return;
      }

      if (salvando) {
        // MODO SALVAR: envia alterações para API
        const instId = linha.dataset.instId;
        const novoNome = inputInst.value.trim();
        const novoCurso = inputCurso.value.trim();

        try {
          const response = await fetch(`${API_URL}/institutions/${instId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              institutionName: novoNome,
              courseName: novoCurso
            })
          });

          if (response.ok) {
            inputInst.disabled = true;
            inputCurso.disabled = true;
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
            alert('Erro ao atualizar instituição');
          }
        } catch (error) {
          console.error('Erro:', error);
          alert('Erro ao conectar com o servidor');
        }
      }
      else {
        // MODO EDITAR: habilita campos para edição
        valoresOriginaisLinha = {
          inst: inputInst.value,
          curso: inputCurso.value,
        };

        inputInst.disabled = false;
        inputCurso.disabled = false;
        btnVer.disabled = true;
        btn.textContent = "Salvar";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-success");

        // Desabilita outros botões durante edição
        tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
          if (b !== btn) {
            b.disabled = true;
          }
        });

        linhaEditando = linha;

        // Valida campos durante edição (verifica duplicatas)
        function validarEdicao() {
          const nome = inputInst.value.trim().toUpperCase();
          const curso = inputCurso.value.trim().toUpperCase();
          let duplicado = false;

          $('#tabelaInst tbody tr').not(linha).each(function () {
            const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
            const cursoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();

            if (nomeExistente === nome && cursoExistente === curso) {
              duplicado = true;
              return false;
            }
          });

          if (nome.length === 0 || curso.length === 0 || duplicado) {
            btn.disabled = true;
            if (nome.length === 0 || duplicado) {
              inputInst.classList.add("inputErrado");
            } else {
              inputInst.classList.remove("inputErrado");
            }
            if (curso.length === 0 || duplicado) {
              inputCurso.classList.add("inputErrado");
            } else {
              inputCurso.classList.remove("inputErrado");
            }
          } else {
            btn.disabled = false;
            inputInst.classList.remove("inputErrado");
            inputCurso.classList.remove("inputErrado");
          }
        }

        validarEdicao();
        inputInst.onkeyup = validarEdicao;
        inputCurso.onkeyup = validarEdicao;
      }
    }
  });

  // Cancela edição ao clicar fora da linha
  document.addEventListener("click", (event) => {
    if (!linhaEditando) return;

    const clicouDentroDaLinha = linhaEditando.contains(event.target);

    // Restaura valores originais se clicar fora
    if (!clicouDentroDaLinha) {
      const linha = linhaEditando;
      const btnEditar = linha.querySelector(".btn-editar");
      const btnVer = linha.querySelector(".btn-ver");
      const inputInst = linha.querySelector(".inst");
      const inputCurso = linha.querySelector(".curso");

      inputInst.value = valoresOriginaisLinha.inst;
      inputCurso.value = valoresOriginaisLinha.curso;
      inputInst.disabled = true;
      inputCurso.disabled = true;
      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;
      inputCurso.classList.remove("inputErrado");
      inputInst.classList.remove("inputErrado");
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

  // Sistema de confirmação dupla para exclusão
  document.addEventListener("click", async function (event) {
    const btn = event.target;

    if (btn.classList.contains("btn-excluir")) {
      event.preventDefault();
      event.stopPropagation();

      // Segundo clique: confirma e exclui
      if (btn === botaoExcluir) {
        const linha = btn.closest("tr");
        const instId = linha.dataset.instId;

        try {
          const response = await fetch(`${API_URL}/institutions/${instId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            linha.remove();
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erro ao excluir instituição');
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
      // Primeiro clique: pede confirmação
      else {
        if (botaoExcluir) {
          resetarBotaoExcluir(botaoExcluir);
        }
        botaoExcluir = btn;
        btn.textContent = "Confirma?";
        btn.classList.remove("btn-outline-danger");
        btn.classList.add("btn-danger");
      }
    }
    // Clique fora: cancela confirmação
    else {
      if (botaoExcluir) {
        resetarBotaoExcluir(botaoExcluir);
        botaoExcluir = null;
      }
    }
  });

  // Reseta botão excluir para estado inicial
  function resetarBotaoExcluir(btn) {
    btn.textContent = "Excluir";
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-danger");
  }

  // Navega para página de disciplinas ao clicar em "Ver curso"
  $(document).on('click', '.btn-ver', function () {
    formInst.reset();
    const linha = $(this).closest('tr');
    const curso = linha.find('td').eq(1).find('input').val().trim();
    const courseId = linha.data('course-id');
    const url = 'disciplinas.html?curso=' + encodeURIComponent(curso) + '&courseId=' + courseId;
    window.location.href = url;
  });

  // Sistema de confirmação dupla para logout
  document.addEventListener("click", function (event) {
    const btn = event.target;

    if (btn.classList.contains("sair")) {
      event.preventDefault();
      event.stopPropagation();

      // Segundo clique: confirma e faz logout
      if (btn === botaoSair) {
        localStorage.clear();
        window.location.href = '/frontend/login/html/login.html';
      }
      // Primeiro clique: pede confirmação
      else {
        if (botaoSair) {
          resetarBotaoSair(botaoSair);
        }
        botaoSair = btn;
        btn.textContent = "Confirma?";
        btn.classList.remove("btn-outline-danger");
        btn.classList.add("btn-danger");
      }
    }
    // Clique fora: cancela confirmação
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
