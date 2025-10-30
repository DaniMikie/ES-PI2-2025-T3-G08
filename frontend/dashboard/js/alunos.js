/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: alunos.js
    Data: 09/10/2025
*/

$(document).ready(function () {

  // Recebe a query string da URL atual
  const urlParams = new URLSearchParams(window.location.search);
  const turma = urlParams.get('turma');

  // Exibe a disciplina na tela para o usuário
  if (turma) {
    document.querySelector('#msgTurma').textContent = `Nome da turma: ${turma}`;
  }
  else {
    document.querySelector('#msgTurma').textContent = 'Turma não informada';
  }

  // Captura os elementos do HTML pelo ID
  const modalCadastrarNota = document.querySelector("#modalCadastrarNota");
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const btnVoltar = document.querySelector("#btnVoltar");
  const btnNota = document.querySelector("#btnNota");
  const formAluno = document.querySelector("#formAluno");
  const raAluno = document.querySelector("#raAluno");
  const nomeAluno = document.querySelector("#nomeAluno");
  const aviso = document.querySelector("#aviso");
  const tabela = document.querySelector("#tabelaAlunos");

  // Deixa o card de cadastrar a nota apagado
  modalCadastrarNota.style.display = "none";


  // Variáveis para verificar oo botoes excluir e salvar
  let botaoExcluir = null;
  let linhaEditando = null;
  let notaEditando = null;

  // Variáveis para armazenar valores originais durante edição
  let valorOriginalNota = null;
  let valoresOriginaisLinha = null;

  // Variáveis para armazenar valores da nota e alunos
  let componentesNota = []; // Armazena os componentes criados (ex.: [{nome: 'N1', peso: 30}, ...])
  let temNotas = false; // Flag que indica se já há componentes de nota cadastrados

  // Remove tudo que não for letra (A–Z ou a–z, incluindo acentos e espaços)
  $('#nomeAluno').on('input', function () {
    $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
  });

  // Remove tudo que não for número do "raAluno", e limita a 8 dígitos
  $('#raAluno').mask('00000000');

  // Desabilita o botão de salvar inicialmente
  btnCadastrar.disabled = true;

  // Adiciona eventos para detectar quando o usuário digita nos inputs
  nomeAluno.onkeyup = onInputKeyUp;
  raAluno.onkeyup = onInputKeyUp;

  // Função que verifica se os inputs estão preenchidos corretamente 
  function onInputKeyUp(_event) {
    const target = _event.target; // O campo que disparou o evento
    const raValor = raAluno.value.trim();
    const nomeValor = nomeAluno.value.trim();

    // Verifica se o RA já existe na tabela
    const rasExistentes = Array.from(document.querySelectorAll("#tabelaAlunos tbody .ra"))
      .map(input => input.value.trim());
    const raDuplicado = rasExistentes.includes(raValor);

    // ----- Validação do RA -----
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

    // ----- Validação do Nome -----
    else if (target.id === 'nomeAluno') {
      nomeAluno.classList.toggle("inputErrado", nomeAluno.value.trim().length === 0);
    }


    // ----- Habilita/Desabilita o botão de Cadastrar -----
    const isNotEmpty = (raValor.length > 0 && nomeValor.length > 0);
    const isRaValid = (raValor.length === 8 && !raDuplicado);

    if (isNotEmpty && isRaValid) {
      btnCadastrar.disabled = false;
    }
    else {
      btnCadastrar.disabled = true;
    }
  }

  // Adicionar novo aluno à tabela
  formAluno.addEventListener("submit", (event) => {
    event.preventDefault();

    const ra = raAluno.value.trim();
    const nome = nomeAluno.value.trim();

    if (ra === "" || nome === "") return;

    // Cria uma nova linha na tabela
    const novaLinha = document.createElement("tr");

    // Monta células iniciais
    novaLinha.innerHTML = `
      <td><input type="text" value="${ra}" disabled class="ra form-control form-control-sm"></td>
      <td><input type="text" value="${nome}" disabled class="nome form-control form-control-sm"></td>
    `;

    // Se já houver notas cadastradas, adiciona colunas de notas + média
    if (temNotas) {
      componentesNota.forEach(comp => {
        const td = document.createElement("td");
        td.innerHTML = `
          <div class="nota-container d-flex align-items-center">
            <input type="text" class="nota form-control form-control-sm me-2" data-componente="${comp.nome}" disabled>
            <button class="btn btn-sm btn-outline-secondary btn-editar-nota">✏️</button>
          </div>
        `;
        novaLinha.appendChild(td);
      });

      const tdMedia = document.createElement("td");
      tdMedia.innerHTML = `<input type="text" value="" disabled class="mediaFinal form-control form-control-sm" style="width:46px;">`;
      novaLinha.appendChild(tdMedia);
    }

    // Coluna de ações
    const tdAcoes = document.createElement("td");
    tdAcoes.classList.add("text-center", "td-acoes");
    tdAcoes.innerHTML = `
      <button class="btn btn-sm btn-outline-secondary me-1 btn-editar" title="Editar todos os elementos">Editar</button>
      <button class="btn btn-sm btn-outline-danger me-1 btn-excluir" title="Excluir alunos">Excluir</button>
    `;
    novaLinha.appendChild(tdAcoes);

    tabela.querySelector("tbody").appendChild(novaLinha);

    formAluno.reset();
    btnCadastrar.disabled = true;
  });

  // Evento para validar e formatar as notas na tabela
  $(document).on('input', '.nota', function () {
    let valor = this.value;
    valor = valor.replace(/[^0-9.]/g, '');
    const partes = valor.split('.');
    if (partes.length > 2) {
      valor = partes[0] + '.' + partes[1];
    }
    if (valor.includes('.')) {
      const [inteiro, decimal] = valor.split('.');
      valor = inteiro.slice(0, 2) + '.' + decimal.slice(0, 1);
    }
    else {
      valor = valor.slice(0, 2);
    }
    const num = parseFloat(valor);
    if (!isNaN(num) && num > 10) {
      valor = '10.0';
    }
    this.value = valor;
  });

  // Funcao que calcula a media do aluno
  function calcularMediaAluno(linha) {
    let soma = 0;

    componentesNota.forEach(comp => {
      const input = linha.querySelector(`input[data-componente="${comp.nome}"]`);
      if (input && input.value.trim() !== "") {
        soma += (parseFloat(input.value) * comp.peso) / 100;
      }
    });

    const mediaInput = linha.querySelector(".mediaFinal");
    mediaInput.value = soma.toFixed(2);
  }

  // Validação dos campos 'nome' e 'ra' dentro da tabela
  $(document).on('input', '.nome', function () {
    $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
  });
  $(document).on('input', '.ra', function () {
    $(this).val($(this).val().replace(/[^0-9]/g, '').slice(0, 8));
  });

  // Evento para manipular cliques na tabela (editar nota individual, editar linha toda)
  tabela.addEventListener("click", (event) => {
    const btn = event.target;

    //  BOTÃO DE EDITAR NOTA INDIVIDUAL
    if (btn.classList.contains("btn-editar-nota")) {
      const td = btn.closest("td");
      const inputNota = td.querySelector("input.nota");
      const editando = !inputNota.disabled;

      if (editando) {
        // Ao salvar a nota
        inputNota.disabled = true;
        btn.textContent = "✏️";
        btn.classList.remove("btn-outline-success");
        btn.classList.add("btn-outline-secondary");

        // Atualiza média ao salvar nota individual
        const linha = btn.closest("tr");
        calcularMediaAluno(linha);

        // Limpa sa variáveis para indicar que nada mais está em edição
        notaEditando = null;
        valorOriginalNota = null;

      }
      else {
        // Ao começar a editar
        valorOriginalNota = inputNota.value; // armazena o valor original
        inputNota.disabled = false;
        inputNota.focus();
        btn.textContent = "✅";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-outline-success");

        // Define a variável para rastrear qual botão está ativo
        notaEditando = btn;

      }
    }

    //  BOTÃO DE EDITAR LINHA TODA
    if (btn.classList.contains("btn-editar")) {
      event.stopPropagation(); // impede o clique fora de cancelar imediatamente

      const linha = btn.closest("tr");
      const inputsNotas = linha.querySelectorAll(".nota");
      const inputRa = linha.querySelector("input.ra");
      const inputNome = linha.querySelector("input.nome");
      const btnLapis = linha.querySelectorAll(".btn-editar-nota");

      const salvando = btn.textContent === "Salvar";

      // Se já existe uma linha em edição e o usuário tenta editar outra
      if (!salvando && linhaEditando && linhaEditando !== linha) {
        alert("Conclua ou cancele a edição atual antes de editar outra linha.");
        return;
      }

      if (salvando) {

        // ----- SALVAR -----
        inputsNotas.forEach(input => input.disabled = true);
        inputRa.disabled = true;
        inputNome.disabled = true;
        btnLapis.forEach(btn => btn.style.display = "flex");

        btn.textContent = "Editar";
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-secondary");
        btn.disabled = false;

        // Atualiza média ao salvar edição completa
        calcularMediaAluno(linha);

        linhaEditando = null; // nenhuma linha mais em edição
        valoresOriginaisLinha = null; // Limpa os valores originais
      }
      else {

        // ARMAZENA OS VALORES ORIGINAIS ANTES DE EDITAR
        valoresOriginaisLinha = {
          ra: inputRa.value,
          nome: inputNome.value,
          notas: Array.from(inputsNotas).map(input => input.value)
        };

        // ----- EDITAR -----
        inputsNotas.forEach(input => input.disabled = false);
        inputRa.disabled = false;
        inputNome.disabled = false;
        btnLapis.forEach(btn => btn.style.display = "none");

        btn.textContent = "Salvar";
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-success");

        linhaEditando = linha; // guarda a linha atual em edição

        // Validação ao digitar
        function validarEdicao() {

          let duplicado = false;

          const ra = inputRa.value.trim();
          const nome = inputNome.value.trim();

          // Verifica se já existe outra linha com os mesmos valores
          $('#tabelaAlunos tbody tr').not(linha).each(function () {
            const raExistente = $(this).find('td').eq(0).find('input').val().trim();

            if (raExistente === ra) {
              duplicado = true;
              return false; // Interrompe a verificacao
            }
          });

          if (ra.length !== 8 || nome.length === 0 || duplicado) {
            btn.disabled = true;

            if (ra.length !== 8 || duplicado) {
              inputRa.classList.add("inputErrado");
            }
            else {
              inputRa.classList.remove("inputErrado");
            }

            if (nome.length === 0) {
              inputNome.classList.add("inputErrado");
            }
            else {
              inputNome.classList.remove("inputErrado")
            }
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

  // CLICAR FORA CANCELA A EDIÇÃO (Botao "editar" / todos os elementos)
  document.addEventListener("click", (event) => {

    // nada a fazer se nenhuma linha está em edição
    if (!linhaEditando) return;

    const clicouDentroDaLinha = linhaEditando.contains(event.target);

    // Só cancela se clicou FORA da linha e NÃO foi no botão de nota
    if (!clicouDentroDaLinha) {
      const linha = linhaEditando;
      const btnEditar = linha.querySelector(".btn-editar");
      const inputsNotas = linha.querySelectorAll(".nota");
      const inputRa = linha.querySelector("input.ra");
      const inputNome = linha.querySelector("input.nome");
      const btnLapis = linha.querySelectorAll(".btn-editar-nota");

      // RESTAURA OS VALORES ORIGINAIS
      inputRa.value = valoresOriginaisLinha.ra;
      inputNome.value = valoresOriginaisLinha.nome;
      inputsNotas.forEach((input, index) => {
        input.value = valoresOriginaisLinha.notas[index];
      });

      // Restaura estado original
      inputsNotas.forEach(input => input.disabled = true);
      inputRa.disabled = true;
      inputNome.disabled = true;
      btnLapis.forEach(btn => btn.style.display = "flex");

      btnEditar.textContent = "Editar";
      btnEditar.classList.remove("btn-success");
      btnEditar.classList.add("btn-outline-secondary");
      btnEditar.disabled = false;

      inputRa.classList.remove("inputErrado");
      inputNome.classList.remove("inputErrado");

      // Limpa os parametros
      btnEditar.disabled = false;
      linhaEditando = null;
      valoresOriginaisLinha = null;
    }
  });

  // CLICAR FORA CANCELA A EDIÇÃO (Botao lapis / somente um elemento)
  document.addEventListener("click", (event) => {
    // Nada a fazer se nenhuma nota está em edição
    if (!notaEditando) return;

    // Seleciona a nota e o botao que foram acionados
    const td = notaEditando.closest("td");
    const clicouNoBotao = event.target.closest(".btn-editar-nota");

    // Se clicou fora da célula e fora do botão, reseta
    if (!td.contains(event.target) && !clicouNoBotao) {
      const inputNota = td.querySelector("input.nota");

      // RESTAURA O VALOR ORIGINAL
      inputNota.value = valorOriginalNota;

      inputNota.disabled = true;
      notaEditando.textContent = "✏️";
      notaEditando.classList.remove("btn-outline-success");
      notaEditando.classList.add("btn-outline-secondary");

      // Limpa os parametros 
      notaEditando = null;
      valorOriginalNota = null;
    }
  });

  // Função para remover aluno
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

  // Botão voltar para página anterior
  btnVoltar.addEventListener('click', function (event) {
    event.preventDefault();
    window.history.back();
  });

  // Botão que faz o modal de nota aparecer
  btnNota.addEventListener('click', function (event) {

    // Mostra o modal
    $('#modalCadastrarNota').modal('show');

    // Desabilita botões e mostra aviso
    btnSalvarNota.disabled = true;
    btnAdd.disabled = true;
    avisoCadastrarNota.style.display = "flex";
  });

  // Evento para quando o modal for fechado (limpa os dados)
  $('#modalCadastrarNota').on('hidden.bs.modal', function () {

    // Limpa a lista e volta ao estado inicial
    lista.innerHTML = "";
    nomeInput.disabled = false;
    pesoInput.disabled = false;
    btnSalvarNota.disabled = true;
    pesoFinal = 0;
  });

  // Declarando constantes para criar/alterar/excluir o componente nota
  const btnAdd = document.querySelector("#btnAddComponente");
  const btnSalvarNota = document.querySelector("#btnSalvarNota");
  const nomeInput = document.querySelector("#nomeComponente");
  const pesoInput = document.querySelector("#pesoComponente");
  const lista = document.querySelector("#listaComponentes");
  const formNota = document.querySelector("#formNota");
  const avisoNome = document.querySelector("#avisoNomeComponente");
  const avisoCadastrarNota = document.querySelector("#avisoCadastrarNota");

  // Variável para guardar o peso total acumulado (inicia em 0)
  let pesoFinal = 0;

  // Aplica a máscara ao peso (formata como 99.99)
  $('#pesoComponente').mask('999.99');

  // Evento para adicionar '%' ao sair do campo 
  $('#pesoComponente').on('blur', function () {
    let val = $(this).val().trim();
    if (val && !val.includes('%')) {
      $(this).val(val + '%');
    }
  });

  // Aplica a máscara ao nome (Uma letra e um número, ex.: N1, T2, P3)
  $('#nomeComponente').mask('A0', {
    translation: {
      'A': { pattern: /[A-Za-z]/ }, // qualquer letra
      '0': { pattern: /[0-9]/ }     // um número
    }
  });
  // Converte letras minúsculas em maiúsculas enquanto o usuário digita
  $('#nomeComponente').on('input', function () {
    $(this).val($(this).val().replace(/[a-z]/g, function (letra) {
      return letra.toUpperCase();
    }));
  });

  // Adiciona eventos
  nomeInput.onkeyup = onInputKeyUpComponente;
  pesoInput.onkeyup = onInputKeyUpComponente;

  // Validação dos campos Nome e Pes
  function onInputKeyUpComponente(_event) {
    const target = _event.target; // O campo que disparou o evento

    let nomeDuplicado = false;

    // Habilita os inputs se o peso final for menor que 100
    if (pesoFinal < 100) {
      nomeInput.disabled = false;
      pesoInput.disabled = false;
      btnSalvarNota.disabled = true;
      avisoCadastrarNota.style.display = "flex";
    }

    // Sempre pega o valor atual do nome (independente de qual campo está sendo alterado)
    const valorNome = nomeInput.value.trim().toUpperCase();
    const isNomeValido = /^[A-Za-z][0-9]$/.test(valorNome);

    // Coleta todos os nomes já cadastrados
    const nomesExistentes = Array.from(lista.querySelectorAll("li"))
      .map(li => li.textContent.split(" - ")[0].trim().toUpperCase());

    // Atualiza se o nome já existe
    nomeDuplicado = nomesExistentes.includes(valorNome);

    // Valida o campo nome apenas se o usuário está digitando nele
    if (target.id === 'nomeComponente') {
      if (!isNomeValido || nomeDuplicado) {
        nomeInput.classList.add("inputErrado");
        avisoNome.style.display = "flex";

        if (nomeDuplicado) {
          avisoNome.textContent = `O componente ${valorNome} já foi adicionado.`;
        }
        else {
          avisoNome.textContent = "Use o formato letra + número (ex: N1, T2).";
        }
      } else {
        nomeInput.classList.remove("inputErrado");
        avisoNome.style.display = "none";
      }
    }

    // Validação do campo peso
    if (target.id === 'pesoComponente') {
      let valorPeso = pesoInput.value.replace('%', '').trim();
      let numPeso = parseFloat(valorPeso);

      const pesoDisponivel = 100 - pesoFinal;
      if (!isNaN(numPeso) && numPeso > pesoDisponivel) {
        numPeso = pesoDisponivel;
        pesoInput.value = numPeso.toFixed(2) + '%';
      }

      if (pesoInput.value.trim().length === 0) {
        pesoInput.classList.add("inputErrado");
      }
      else {
        pesoInput.classList.remove("inputErrado");
      }
    }

    // Verifica se ambos os campos não estão vazios
    const camposNotEmpty = (
      nomeInput.value.trim().length > 0 &&
      pesoInput.value.trim().length > 0
    );

    // Habilita o botão apenas se tudo for válido e o nome não for duplicado
    btnAdd.disabled = (!camposNotEmpty || nomeDuplicado || !isNomeValido);
  }

  // Evento de submit do formulário
  formNota.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o reload da página

    const nome = nomeInput.value.trim();
    const pesoStr = pesoInput.value.replace('%', '').trim();
    const peso = parseFloat(pesoStr);

    // Adiciona o peso ao total
    pesoFinal += peso;

    // Cria um novo item na lista (<li>)
    const novoItem = document.createElement("li");
    novoItem.className = "list-group-item d-flex justify-content-between align-items-center";
    novoItem.innerHTML = `
      ${nome} - ${peso.toFixed(2)}% da média final
      <button class="btn btn-sm btn-outline-danger btn-excluir-componente" title="Excluir componente">Excluir</button>
    `;

    // Adiciona à lista
    lista.appendChild(novoItem);

    // Verifica se o peso final atingiu ou passou de 100%
    if (pesoFinal >= 100) {
      // Bloqueia os inputs e botão de adicionar
      btnAdd.disabled = true;
      nomeInput.disabled = true;
      pesoInput.disabled = true;
      // Habilita o botão de salvar nota
      btnSalvarNota.disabled = false;
      avisoCadastrarNota.style.display = "none";
    }
    else {
      // Mantém inputs habilitados e botão de salvar desabilitado
      btnAdd.disabled = true; // porque o formulário será resetado
      nomeInput.disabled = false;
      pesoInput.disabled = false;
      btnSalvarNota.disabled = true;
      avisoCadastrarNota.style.display = "flex";
    }

    // Limpa o formulário
    formNota.reset();
    btnAdd.disabled = true;

    // Reaplica máscaras após reset
    $('#pesoComponente').mask('999.99');
    $('#nomeComponente').mask('A0', {
      translation: {
        'A': { pattern: /[A-Za-z]/ },
        '0': { pattern: /[0-9]/ }
      }
    });
  });

  // Evento para excluir componente da nota (Ex N1)
  lista.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-excluir-componente")) {
      const item = event.target.closest("li");
      const texto = item.textContent; // Ex.: "N1 - 50.00% Excluir"
      const pesoMatch = texto.match(/(\d+\.\d+)%/); // Extrai o peso
      if (pesoMatch) {
        const peso = parseFloat(pesoMatch[1]);
        pesoFinal -= peso; // Subtrai do total
      }

      // Remove o item
      item.remove();

      // Verifica se o peso final atingiu ou passou de 100%
      if (pesoFinal < 100) {

        nomeInput.disabled = false;
        pesoInput.disabled = false;

        // Desabilita o botão de salvar nota
        btnSalvarNota.disabled = true;
        avisoCadastrarNota.style.display = "flex";
      }
    }
  });

  // Função para resetar o botão "salvarNota" para o estado original
  function resetBtn() {
    btnSalvarNota.textContent = "Salvar Nota";
    btnSalvarNota.dataset.confirm = "false";
    document.removeEventListener("click", clickFora);
  }

  // Função que trata clique fora do botão "salvarNota"
  function clickFora(event) {
    if (event.target !== btnSalvarNota) {
      resetBtn();
    }
  }

  // Função que atualiza a tabela quando a nota e gerada
  function atualizarTabelaComponentes() {
    const thead = tabela.querySelector("thead tr.tabelaAlunos");
    const tbody = tabela.querySelector("tbody");

    // Remove colunas de notas antigas (mantém RA, Nome e Ações)
    while (thead.children.length > 2 && !thead.lastElementChild.classList.contains("text-center")) {
      thead.removeChild(thead.children[2]);
    }

    // Adiciona colunas de notas dinamicamente
    componentesNota.forEach(comp => {
      const th = document.createElement("th");
      th.classList.add("headerNotas");
      th.textContent = comp.nome;
      thead.insertBefore(th, thead.querySelector("th.text-center"));
    });

    // Adiciona a coluna de Média Final (se não existir)
    if (!thead.querySelector(".headerMediaFinal")) {
      const thMedia = document.createElement("th");
      thMedia.classList.add("headerMediaFinal");
      thMedia.textContent = "MF";
      thead.insertBefore(thMedia, thead.querySelector("th.text-center"));
    }

    // Atualiza cada linha da tabela
    tbody.querySelectorAll("tr").forEach(linha => {
      // Remove antigas células de nota e média, preservando RA, Nome e Ações
      const celulas = Array.from(linha.children);
      celulas.forEach(td => {
        if (!td.classList.contains("td-acoes") && !td.querySelector(".ra") && !td.querySelector(".nome")) {
          td.remove();
        }
      });

      // Adiciona células de notas conforme os componentes
      componentesNota.forEach(comp => {
        const td = document.createElement("td");
        td.innerHTML = `
        <div class="nota-container d-flex align-items-center">
          <input type="text" class="nota form-control form-control-sm me-2" data-componente="${comp.nome}" disabled>
          <button class="btn btn-sm btn-outline-secondary btn-editar-nota">✏️</button>
        </div>
      `;
        linha.insertBefore(td, linha.querySelector(".td-acoes"));
      });

      // Adiciona a célula da média final (se não existir)
      if (!linha.querySelector(".mediaFinal")) {
        const tdMedia = document.createElement("td");
        tdMedia.innerHTML = `
        <input type="text" value="" disabled class="mediaFinal form-control form-control-sm" style="width: 46px;">
      `;
        linha.insertBefore(tdMedia, linha.querySelector(".td-acoes"));
      }
    });
  }

  // Salva o componente da nota e guarda 
  btnSalvarNota.addEventListener("click", (event) => {
    if (btnSalvarNota.dataset.confirm !== "true") {
      event.preventDefault();
      btnSalvarNota.textContent = "Confirma?";
      btnSalvarNota.dataset.confirm = "true";
      setTimeout(() => document.addEventListener("click", clickFora), 0);
    }
    else {
      resetBtn();

      // ---- REMOVE AS NOTAS ANTIGAS ----
      const thead = tabela.querySelector("thead tr.tabelaAlunos");
      const tbody = tabela.querySelector("tbody");

      if (thead && tbody) {
        while (thead.children.length > 3) {
          thead.removeChild(thead.children[2]);
        }

        tbody.querySelectorAll("tr").forEach(linha => {
          while (linha.children.length > 3) {
            linha.removeChild(linha.children[2]);
          }
        });
      }

      componentesNota = [];
      lista.querySelectorAll("li").forEach(li => {
        const texto = li.textContent.trim();
        const match = texto.match(/^(.+?) - (\d+(\.\d+)?)%/);
        if (match) {
          componentesNota.push({ nome: match[1].trim(), peso: parseFloat(match[2]) });
        }
      });

      temNotas = componentesNota.length > 0; // Atualiza a flag
      atualizarTabelaComponentes(); // Gera as colunas dinamicamente

      $('#modalCadastrarNota').modal('hide');
    }
  });

});
