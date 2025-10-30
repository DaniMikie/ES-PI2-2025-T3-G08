/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: turmas.js
    Data: 09/10/2025
*/

$(document).ready(function () {

  // Recebe a query string da URL atual
  const urlParams = new URLSearchParams(window.location.search);
  const disciplina = urlParams.get('disciplina');

  // Exibe a disciplina na tela para o usuário
  if (disciplina) {
    document.querySelector('#msgDisciplina').textContent = `Disciplina: ${disciplina}`;
  }
  else {
    document.querySelector('#msgDisciplina').textContent = 'Disciplina não informado';
  }

  // Captura os elementos do HTML pelo ID
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const btnVoltar = document.querySelector("#btnVoltar");
  const tabela = document.querySelector("#tabelaTurma");
  const formTurma = document.querySelector("#formTurma");
  const nomeTurma = document.querySelector("#nomeTurma");
  const avisoTurma = document.querySelector("#avisoTurma");

  // Máscara para o nome da turma, permite letras, números e espaços
  $('#nomeTurma').on('input', function () {
    // Remove tudo que não for letra, número ou espaço
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');

    $(this).val(val);
  });

  // Variáveis para verificar oo botoes excluir e salvar
  let botaoExcluir = null;
  let linhaEditando = null;

  // Variável para armazenar valores originais durante edição
  let valoresOriginaisLinha = null;

  // Desabilita o botão de salvar
  btnCadastrar.disabled = true;

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
        return false; // interrompe o loop each
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
  formTurma.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário

    const nome = nomeTurma.value.trim();

    if (nome === "") return;

    // Cria uma nova linha na tabela
    const novaLinha = document.createElement("tr");

    // Monta células iniciais
    novaLinha.innerHTML = `
    <td><input type="text" value="${nome}" disabled class="nomeTurma form-control form-control-sm"></td>
    <td class="text-center">
    <button class="btn-ver btn btn-sm btn-outline-primary me-2">Ver turma</button>
    <button class="btn-editar btn btn-sm btn-outline-secondary me-2">Editar</button>
    <button class="btn-excluir btn btn-sm btn-outline-danger me-2">Excluir</button>
    </td>
    `;

    tabela.querySelector("tbody").appendChild(novaLinha);

    formTurma.reset();
    btnCadastrar.disabled = true;
  });

  // Evento para manipular cliques na tabela "editar"
  tabela.addEventListener("click", (event) => {
    const btn = event.target;

    // BOTÃO DE EDITAR LINHA TODA
    if (btn.classList.contains("btn-editar")) {
      event.stopPropagation(); // evita cancelamento imediato ao clicar fora

      const linha = btn.closest("tr");
      const inputNome = linha.querySelector("input.nomeTurma");
      const btnVer = linha.querySelector(".btn-ver");

      const salvando = btn.textContent === "Salvar";

      // Se já existe uma linha em edição e o usuário tenta editar outra
      if (!salvando && linhaEditando && linhaEditando !== linha) {
        alert("Conclua ou cancele a edição atual antes de editar outra linha.");
        return;
      }

      if (salvando) {
        // ----- SALVAR -----
        inputNome.disabled = true;
        btnVer.disabled = false;

        btn.textContent = "Editar";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-secondary");
        linhaEditando = null; // nenhuma linha em edição
        valoresOriginaisLinha = null;

      }
      else {
        // ----- EDITAR -----
        // Armazena os valores originais
        valoresOriginaisLinha = {
          nome: inputNome.value,
        };

        inputNome.disabled = false;
        btnVer.disabled = true;

        btn.textContent = "Salvar";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-success");

        linhaEditando = linha;

        // Função de validação durante edição
        function validarEdicao() {
          const nome = inputNome.value.trim().toUpperCase();

          let duplicado = false;

          // Verifica se já existe outra linha com os mesmos valores
          $('#tabelaTurma tbody tr').not(linha).each(function () {
            const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();

            if (nomeExistente === nome) {
              duplicado = true;
              return false; // Interrompe a verificacao
            }
          });

          // Valida campos vazios
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

        // Validação inicial
        validarEdicao();

        // Remove ouvintes antigos antes de adicionar
        inputNome.onkeyup = validarEdicao;

      }
    }
  });

  // CLICAR FORA CANCELA A EDIÇÃO (Botao "editar" / todos os elementos)
  document.addEventListener("click", (event) => {

    // nada a fazer se nenhuma linha está em edição
    if (!linhaEditando) return;

    const clicouDentroDaLinha = linhaEditando.contains(event.target);

    // Só cancela se clicou FORA da linha e NÃO foi no botão de nota
    if (!clicouDentroDaLinha) {
      const linha = linhaEditando;
      const btnEditar = linha.querySelector(".btn-editar");
      const btnVer = linha.querySelector(".btn-ver");
      const inputNome = linha.querySelector(".nomeTurma");

      // RESTAURA OS VALORES ORIGINAIS
      inputNome.value = valoresOriginaisLinha.nome;

      // Restaura estado original
      inputNome.disabled = true;

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;

      // Limpa os parametros
      inputNome.classList.remove("inputErrado");
      btnEditar.disabled = false;
      btnVer.disabled = false;
      linhaEditando = null;
      valoresOriginaisLinha = null;
    }
  });

  // Função para remover elemento
  document.addEventListener("click", function (event) {
    const btn = event.target;

    if (btn.classList.contains("btn-excluir")) {
      event.preventDefault();
      event.stopPropagation();

      if (btn === botaoExcluir) {
        const linha = btn.closest("tr");
        linha.remove();
        botaoExcluir = null;
      }
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
    else {
      if (botaoExcluir) {
        resetarBotaoExcluir(botaoExcluir);
        botaoExcluir = null;
      }
    }
  });

  // Função para restaurar o botão excluir ao estado original
  function resetarBotaoExcluir(btn) {
    btn.textContent = "Excluir";
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-danger");
  }

  // Ao clicar no botão ver, envia a informação para o proximo arquivo
  $(document).on('click', '.btn-ver', function () {
    formTurma.reset();
    const linha = $(this).closest('tr');
    const turma = linha.find('td').eq(0).find('input').val().trim(); // pega o valor do input da 1ª coluna
    const url = 'alunos.html?turma=' + encodeURIComponent(turma);
    window.location.href = url;
  });

  // Ao clicar no botão desejado, envia a informação para o proximo arquivo
  btnVoltar.addEventListener('click', function (event) {
    event.preventDefault();
    window.history.back();  // Volta uma página no histórico
  });

});