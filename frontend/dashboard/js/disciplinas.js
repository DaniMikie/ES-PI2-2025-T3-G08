/*
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: disciplinas.js
    Data: 09/10/2025
*/

$(document).ready(function () {

  // ======== CURSO NA TELA ========
  const urlParams = new URLSearchParams(window.location.search);
  const curso = urlParams.get('curso');
  document.querySelector('#msgCurso').textContent = curso ? `Curso: ${curso}` : 'Curso não informado';


  // ======== ELEMENTOS ========
  const btnCadastrar = document.querySelector("#btnCadastrar");
  const btnVoltar = document.querySelector("#btnVoltar");
  const formDisc = document.querySelector("#formDisc");
  const tabela = document.querySelector("#tabelaDisc");
  const nomeDisc = document.querySelector("#nomeDisc");
  const siglaDisc = document.querySelector("#siglaDisc");
  const codDisc = document.querySelector("#codDisc");
  const periodoDisc = document.querySelector("#periodoDisc");
  const avisoNomeDisc = document.querySelector("#avisoNomeDisc");
  const aviso = document.querySelector("#aviso");
  const avisoPeriodo = document.querySelector("#avisoPeriodo");
  const avisoSigla = document.querySelector("#avisoSigla");


  // ======== MÁSCARAS ========
  $('#codDisc').mask('00000');

  $('#siglaDisc').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
    $(this).val(val.toUpperCase());
  });

  $('#nomeDisc').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
    $(this).val(val);
  });

  $('#periodoDisc').on('input', function () {
    let val = $(this).val().replace(/\D/g, '').slice(0, 2);
    let num = parseInt(val, 10);
    if (!isNaN(num) && num > 12) num = 12;
    if (isNaN(num) || num === 0) val = '';
    else val = num.toString();

    if (val.length === 0) $(this).val('');
    else {
      $(this).val(val + '° Semestre');
      this.setSelectionRange(val.length, val.length);
    }
  });


  // ======== VARIÁVEIS DE CONTROLE ========
  let botaoExcluir = null;
  let linhaEditando = null;
  let valoresOriginaisLinha = null;

  // ======== DESABILITA O BOTÃO CADASTRAR ========
  btnCadastrar.disabled = true;


  // ======== VERIFICAÇÕES ========
  nomeDisc.onkeyup = onInputKeyUp;
  siglaDisc.onkeyup = onInputKeyUp;
  codDisc.onkeyup = onInputKeyUp;
  periodoDisc.onkeyup = onInputKeyUp;

  function codigoDuplicado(codigo) {
    let duplicado = false;
    $('#tabelaDisc tbody tr').each(function () {
      const codigoExistente = $(this).find('.codDisc').val().trim();
      if (codigoExistente === codigo) {
        duplicado = true;
        return false;
      }
    });
    return duplicado;
  }

  function nomeDuplicado(nome) {
    let duplicado = false;
    const nomeUpper = nome.trim().toUpperCase();
    $('#tabelaDisc tbody tr').each(function () {
      const nomeExistente = $(this).find('.nomeDisc').val().trim().toUpperCase();
      if (nomeExistente === nomeUpper) {
        duplicado = true;
        return false;
      }
    });
    return duplicado;
  }

  function onInputKeyUp(_event) {
    const target = _event.target;

    if (target.id === 'nomeDisc') {
      if (nomeDisc.value.trim().length === 0) {
        nomeDisc.classList.add("inputErrado");
      }
      else if (nomeDuplicado(nomeDisc.value.trim())) {
        nomeDisc.classList.add("inputErrado");
        avisoNomeDisc.style.display = "flex";
        avisoNomeDisc.textContent = "Já existe uma disciplina com esse nome!";
      }
      else {
        nomeDisc.classList.remove("inputErrado");
        avisoNomeDisc.style.display = "none";
      }
    }

    else if (target.id === 'siglaDisc') {
      if (siglaDisc.value.trim().length < 2) {
        siglaDisc.classList.add("inputErrado");
        avisoSigla.style.display = "flex";
      }
      else {
        siglaDisc.classList.remove("inputErrado");
        avisoSigla.style.display = "none";
      }
    }

    else if (target.id === 'codDisc') {
      if (codDisc.value.trim().length !== 5) {
        aviso.style.display = "flex";
        aviso.textContent = "Digite cinco dígitos";
        codDisc.classList.add("inputErrado");
      }
      else if (codigoDuplicado(codDisc.value.trim())) {
        aviso.style.display = "flex";
        aviso.textContent = "Esse código já existe!";
        codDisc.classList.add("inputErrado");
      }
      else {
        codDisc.classList.remove("inputErrado");
        aviso.style.display = "none";
      }
    }

    else if (target.id === 'periodoDisc') {
      if (periodoDisc.value.trim().length === 0) {
        periodoDisc.classList.add("inputErrado");
        avisoPeriodo.style.display = "flex";
      }
      else {
        periodoDisc.classList.remove("inputErrado");
        avisoPeriodo.style.display = "none";
      }
    }

    const isNotEmpty = (
      nomeDisc.value.trim().length > 0 &&
      siglaDisc.value.trim().length > 0 &&
      codDisc.value.trim().length > 0 &&
      periodoDisc.value.trim().length > 0
    );

    const nomeIgual = nomeDuplicado(nomeDisc.value.trim());
    const codIgual = codigoDuplicado(codDisc.value.trim());
    const isCodValid = codDisc.value.trim().length === 5;

    btnCadastrar.disabled = !(isNotEmpty && isCodValid && !nomeIgual && !codIgual);
  }

  // ======== CADASTRAR NOVA DISCIPLINA ========
  formDisc.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = nomeDisc.value.trim();
    const sigla = siglaDisc.value.trim();
    const codigo = codDisc.value.trim();
    const periodo = periodoDisc.value.trim();

    if (!nome || !sigla || !codigo || !periodo) return;

    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
      <td><input type="text" value="${nome}" disabled class="nomeDisc form-control form-control-sm" style="width: 250px;"></td>
      <td><input type="text" value="${sigla}" disabled class="siglaDisc form-control form-control-sm" style="width: 75px;"></td>
      <td><input type="text" value="${codigo}" disabled class="codDisc form-control form-control-sm" style="width: 60px;"></td>
      <td><input type="text" value="${periodo}" disabled class="periodoDisc form-control form-control-sm" style="width: 105px;"></td>
      <td class="text-center">
        <button class="btn-ver btn btn-sm btn-outline-primary me-2">Ver disciplina</button>
        <button class="btn-editar btn btn-sm btn-outline-secondary me-2">Editar</button>
        <button class="btn-excluir btn btn-sm btn-outline-danger me-2">Excluir</button>
      </td>
    `;

    tabela.querySelector("tbody").appendChild(novaLinha);
    formDisc.reset();
    btnCadastrar.disabled = true;
  });

  // ======== EDITAR DISCIPLINA ========
  document.addEventListener("click", (event) => {
    const btn = event.target;

    if (!btn.classList.contains("btn-editar")) return;
    event.stopPropagation();

    const linha = btn.closest("tr");
    const btnVer = linha.querySelector(".btn-ver");
    const inputNome = linha.querySelector(".nomeDisc");
    const inputSigla = linha.querySelector(".siglaDisc");
    const inputCod = linha.querySelector(".codDisc");
    const inputPeriodo = linha.querySelector(".periodoDisc");

    const salvando = btn.textContent === "Salvar";

    // Se já existe uma linha em edição e o usuário tenta editar outra
    if (!salvando && linhaEditando && linhaEditando !== linha) {
      alert("Conclua ou cancele a edição atual antes de editar outra linha.");
      return;
    }

    if (salvando) {
      // ======== SALVAR ========
      inputNome.disabled = true;
      inputSigla.disabled = true;
      inputCod.disabled = true;
      inputPeriodo.disabled = true;
      btnVer.disabled = false;

      btn.textContent = "Editar";
      btn.classList.remove("btn-success");
      btn.classList.add("btn-outline-secondary");

      linhaEditando = null;
      valoresOriginaisLinha = null;
    }
    else {
      // ======== MODO EDIÇÃO ========
      valoresOriginaisLinha = {
        nome: inputNome.value,
        sigla: inputSigla.value,
        codigo: inputCod.value,
        periodo: inputPeriodo.value,
      };

      inputNome.disabled = false;
      inputSigla.disabled = false;
      inputCod.disabled = false;
      inputPeriodo.disabled = false;
      btnVer.disabled = true;

      btn.textContent = "Salvar";
      btn.classList.remove("btn-outline-secondary");
      btn.classList.add("btn-success");
      linhaEditando = linha;

      aplicarMascarasEdicao(inputNome, inputSigla, inputCod, inputPeriodo);

      // ======== VALIDAÇÃO ONKEYUP ========
      function validarEdicao() {
        const nome = inputNome.value.trim().toUpperCase();
        const sigla = inputSigla.value.trim();
        const codigo = inputCod.value.trim();
        const periodo = inputPeriodo.value.trim();

        let nomeJaExiste = false;
        let codJaExiste = false;

        // Verifica duplicidade (ignora a própria linha)
        document.querySelectorAll("#tabelaDisc tbody tr").forEach((tr) => {
          if (tr === linha) return;
          const nomeExistente = tr.querySelector(".nomeDisc").value.trim().toUpperCase();
          const codExistente = tr.querySelector(".codDisc").value.trim();
          if (nomeExistente === nome) nomeJaExiste = true;
          if (codExistente === codigo) codJaExiste = true;
        });

        // ===== Validações =====
        inputNome.classList.toggle("inputErrado", nome.length === 0 || nomeJaExiste);
        inputSigla.classList.toggle("inputErrado", sigla.length < 2);
        inputCod.classList.toggle("inputErrado", codigo.length !== 5 || codJaExiste);
        inputPeriodo.classList.toggle("inputErrado", periodo.length === 0);

        const valido =
          nome.length > 0 &&
          sigla.length >= 2 &&
          codigo.length === 5 &&
          periodo.length > 0 &&
          !nomeJaExiste &&
          !codJaExiste;

        btn.disabled = !valido;
      }

      // Eventos de digitação
      [inputNome, inputSigla, inputCod, inputPeriodo].forEach(input => {
        input.addEventListener("keyup", validarEdicao);
      });

      validarEdicao();
    }
  });

  // ======== CANCELAR EDIÇÃO AO CLICAR FORA ========
  document.addEventListener("click", (event) => {
    if (!linhaEditando || !valoresOriginaisLinha) return;

    const clicouDentro = linhaEditando.contains(event.target);
    if (clicouDentro) return;

    const btnEditar = linhaEditando.querySelector(".btn-editar");
    const btnVer = linhaEditando.querySelector(".btn-ver");
    const inputNome = linhaEditando.querySelector(".nomeDisc");
    const inputSigla = linhaEditando.querySelector(".siglaDisc");
    const inputCod = linhaEditando.querySelector(".codDisc");
    const inputPeriodo = linhaEditando.querySelector(".periodoDisc");

    // Restaura valores originais
    inputNome.value = valoresOriginaisLinha.nome;
    inputSigla.value = valoresOriginaisLinha.sigla;
    inputCod.value = valoresOriginaisLinha.codigo;
    inputPeriodo.value = valoresOriginaisLinha.periodo;

    // Desativa inputs
    inputNome.disabled = true;
    inputSigla.disabled = true;
    inputCod.disabled = true;
    inputPeriodo.disabled = true;

    // Restaura tudo para o estado original
    btnEditar.textContent = "Editar";
    btnEditar.classList.remove("btn-success");
    btnEditar.classList.add("btn-outline-secondary");
    btnEditar.disabled = false;
    btnVer.disabled = false;

    inputNome.classList.remove("inputErrado");
    inputSigla.classList.remove("inputErrado");
    inputCod.classList.remove("inputErrado");
    inputPeriodo.classList.remove("inputErrado");

    linhaEditando = null;
    valoresOriginaisLinha = null;
  });

  // ======== FUNÇÃO PARA MÁSCARAS DURANTE EDIÇÃO ========
  function aplicarMascarasEdicao(inputNome, inputSigla, inputCod, inputPeriodo) {
    // Código
    $(inputCod).mask('00000');

    // Nome
    $(inputNome).on('input', function () {
      let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
      $(this).val(val);
    });

    // Sigla
    $(inputSigla).on('input', function () {
      let val = $(this).val().replace(/[^a-zA-Z0-9]/g, '');
      if (val.length > 4) val = val.slice(0, 4);
      $(this).val(val.toUpperCase());
    });


    // Período
    $(inputPeriodo).on('input', function () {
      let val = $(this).val().replace(/\D/g, '').slice(0, 2);
      let num = parseInt(val, 10);
      if (!isNaN(num) && num > 12) num = 12;
      if (isNaN(num) || num === 0) val = '';
      else val = num.toString();

      if (val.length === 0) $(this).val('');
      else {
        $(this).val(val + '° Semestre');
        this.setSelectionRange(val.length, val.length);
      }
    });
  }

  // ======== EXCLUIR ========
  document.addEventListener("click", function (event) {
    const btn = event.target;

    if (btn.classList.contains("btn-excluir")) {
      event.preventDefault();
      event.stopPropagation();

      if (btn === botaoExcluir) {
        btn.closest("tr").remove();
        botaoExcluir = null;
      } else {
        if (botaoExcluir) resetarBotaoExcluir(botaoExcluir);
        botaoExcluir = btn;
        btn.textContent = "Confirma?";
        btn.classList.remove("btn-outline-danger");
        btn.classList.add("btn-danger");
      }
    } else {
      if (botaoExcluir) {
        resetarBotaoExcluir(botaoExcluir);
        botaoExcluir = null;
      }
    }
  });

  // ======== RESETAR BOTÃO EXCLUIR ========
  function resetarBotaoExcluir(btn) {
    btn.textContent = "Excluir";
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-danger");
  }

  // ======== VER DISCIPLINA ========
  $(document).on('click', '.btn-ver', function () {
    formDisc.reset();
    const linha = $(this).closest('tr');
    const disciplina = linha.find('.nomeDisc').val().trim();
    const url = 'turmas.html?disciplina=' + encodeURIComponent(disciplina);
    window.location.href = url;
  });

  // ======== VOLTAR ========
  btnVoltar.addEventListener('click', function (event) {
    event.preventDefault();
    window.history.back();
  });

});
