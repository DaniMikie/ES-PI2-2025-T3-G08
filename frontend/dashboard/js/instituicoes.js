/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: instituicoes.js
    Data: 09/10/2025
*/

$(document).ready(function () {

  // Captura os elementos do HTML pelo ID
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const formInst = document.querySelector("#formInst");
  const tabela = document.querySelector("#tabelaInst");
  const nomeInst = document.querySelector("#nomeInst");
  const cursoInst = document.querySelector("#cursoInst");
  const aviso = document.querySelector("#avisoInst")

  // Mácara para o curso, remove tudo que nao for letra ou número
  $('#cursoInst').on('input', function () {
    // Remove tudo que não for letra, número ou espaço
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');

    $(this).val(val);
  });

  // Desabilita o botão de salvar
  btnCadastrar.disabled = true;

  // Variáveis para verificar oo botoes excluir e salvar
  let botaoExcluir = null;
  let linhaEditando = null;

  // Variável para armazenar valores originais durante edição
  let valoresOriginaisLinha = null;

  // Adiciona eventos para detectar quando o usuário digita nos inputs
  cursoInst.onkeyup = onInputKeyUp;
  nomeInst.onkeyup = onInputKeyUp;

  // Função que verifica se os inputs estão preenchidos corretamente
  function onInputKeyUp(_event) {
    const target = _event.target;

    // Validação visual simples
    if (target.id === 'cursoInst') {
      cursoInst.classList.toggle("inputErrado", cursoInst.value.trim().length === 0);
    }
    else if (target.id === 'nomeInst') {
      nomeInst.classList.toggle("inputErrado", nomeInst.value.trim().length === 0);
    }

    const nome = nomeInst.value.trim().toUpperCase();
    const curso = cursoInst.value.trim().toUpperCase();

    const isNotEmpty = nome.length > 0 && curso.length > 0;

    // Verificação de duplicidade (nome e curso iguais)
    let duplicado = false;
    $('#tabelaInst tbody tr').each(function () {
      const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
      const cursoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();

      if (nomeExistente === nome && cursoExistente === curso) {
        duplicado = true;
        return false; //
      }
    });

    if (duplicado) {
      aviso.style.display = "flex";
      aviso.textContent = "Já existe uma instituição com esse nome e curso.";
      btnCadastrar.disabled = true;
      cursoInst.classList.add("inputErrado");
      nomeInst.classList.add("inputErrado");

    }
    else if (isNotEmpty) {
      aviso.style.display = "none";
      btnCadastrar.disabled = false;
      cursoInst.classList.remove("inputErrado");
      nomeInst.classList.remove("inputErrado");
    }
    else {
      aviso.style.display = "none";
      btnCadastrar.disabled = true;
    }
  }

  // Cria um novo elemento na tabela
  formInst.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário

    const inst = nomeInst.value.trim();
    const curso = cursoInst.value.trim();

    if (curso === "" || inst === "") return;

    // Cria uma nova linha na tabela
    const novaLinha = document.createElement("tr");

    // Monta células iniciais
    novaLinha.innerHTML = `
        <td><input type="text" value="${inst}" disabled class="inst form-control form-control-sm"></td>
        <td><input type="text" value="${curso}" disabled class="curso form-control form-control-sm"></td>
        <td class="text-center">
        <button class="btn-ver btn btn-sm btn-outline-primary me-2">Ver curso</button>
        <button class="btn-editar btn btn-sm btn-outline-secondary me-2">Editar</button>
        <button class="btn-excluir btn btn-sm btn-outline-danger me-2">Excluir</button>
        </td>
        `;

    tabela.querySelector("tbody").appendChild(novaLinha);

    formInst.reset();
    btnCadastrar.disabled = true;
  });

  // Evento para manipular cliques na tabela "editar"
  tabela.addEventListener("click", (event) => {
    const btn = event.target;

    // BOTÃO DE EDITAR LINHA TODA
    if (btn.classList.contains("btn-editar")) {
      event.stopPropagation(); // evita cancelamento imediato ao clicar fora

      const linha = btn.closest("tr");
      const inputInst = linha.querySelector("input.inst");
      const inputCurso = linha.querySelector("input.curso");
      const btnVer = linha.querySelector(".btn-ver");

      const salvando = btn.textContent === "Salvar";

      // Se já existe uma linha em edição e o usuário tenta editar outra
      if (!salvando && linhaEditando && linhaEditando !== linha) {
        alert("Conclua ou cancele a edição atual antes de editar outra linha.");
        return;
      }

      if (salvando) {
        // ----- SALVAR -----
        inputInst.disabled = true;
        inputCurso.disabled = true;
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
          inst: inputInst.value,
          curso: inputCurso.value,
        };

        inputInst.disabled = false;
        inputCurso.disabled = false;
        btnVer.disabled = true;

        btn.textContent = "Salvar";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-success");

        linhaEditando = linha;

        // Função de validação durante edição
        function validarEdicao() {
          const nome = inputInst.value.trim().toUpperCase();
          const curso = inputCurso.value.trim().toUpperCase();

          let duplicado = false;

          // Verifica se já existe outra linha com os mesmos valores
          $('#tabelaInst tbody tr').not(linha).each(function () {
            const nomeExistente = $(this).find('td').eq(0).find('input').val().trim().toUpperCase();
            const cursoExistente = $(this).find('td').eq(1).find('input').val().trim().toUpperCase();

            if (nomeExistente === nome && cursoExistente === curso) {
              duplicado = true;
              return false; // Interrompe a verificacao
            }
          });

          // Valida campos vazios
          if (nome.length === 0 || curso.length === 0 || duplicado) {
            btn.disabled = true;

            if (nome.length === 0 || duplicado) {
              inputInst.classList.add("inputErrado");
            }
            else {
              inputInst.classList.remove("inputErrado");
            }

            if (curso.length === 0 || duplicado) {
              inputCurso.classList.add("inputErrado");
            }
            else {
              inputCurso.classList.remove("inputErrado");
            }

          } else {
            btn.disabled = false;
            inputInst.classList.remove("inputErrado");
            inputCurso.classList.remove("inputErrado");
          }
        }

        // Validação inicial
        validarEdicao();

        // Remove ouvintes antigos antes de adicionar
        inputInst.onkeyup = validarEdicao;
        inputCurso.onkeyup = validarEdicao;

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
      const inputInst = linha.querySelector(".inst");
      const inputCurso = linha.querySelector(".curso");

      // RESTAURA OS VALORES ORIGINAIS
      inputInst.value = valoresOriginaisLinha.inst;
      inputCurso.value = valoresOriginaisLinha.curso;

      // Restaura estado original
      inputInst.disabled = true;
      inputCurso.disabled = true;

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;

      inputCurso.classList.remove("inputErrado");
      inputInst.classList.remove("inputErrado");

      // Limpa os parametros
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
    formInst.reset();
    const linha = $(this).closest('tr');
    const curso = linha.find('td').eq(1).find('input').val().trim(); // pega o valor do input da 2ª coluna
    const url = 'disciplinas.html?curso=' + encodeURIComponent(curso);
    window.location.href = url;
  });

});