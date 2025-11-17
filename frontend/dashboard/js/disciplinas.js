/*
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: disciplinas.js (Integrado com Backend)
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

  // Recupera informações do curso pela URL
  const urlParams = new URLSearchParams(window.location.search);
  const curso = urlParams.get('curso');
  const courseId = urlParams.get('courseId');

  // ======== BREADCRUMB: Monta navegação (Instituição > Curso) ========
  async function carregarBreadcrumb() {
    if (!courseId) {
      document.querySelector('#msgCurso').textContent = 'Curso não informado';
      return;
    }

    try {
      // BREADCRUMB PASSO 1: Busca dados do curso pelo ID
      const courseResponse = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (courseResponse.ok) {
        const course = await courseResponse.json();

        // BREADCRUMB PASSO 2: Busca dados da instituição usando institution_id do curso
        const instResponse = await fetch(`${API_URL}/institutions/${course.institution_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (instResponse.ok) {
          const institution = await instResponse.json();

          // BREADCRUMB PASSO 3: Monta o HTML do breadcrumb com links clicáveis
          const breadcrumb = `
            <a href="instituicoes.html" class="breadcrumb-link">${institution.name}</a> > 
            <span class="breadcrumb-atual">${curso}</span>
          `;
          // BREADCRUMB PASSO 4: Exibe o breadcrumb na tela
          document.querySelector('#msgCurso').innerHTML = `<small>${breadcrumb}</small>`;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar breadcrumb:', error);
      document.querySelector('#msgCurso').textContent = `Curso: ${curso}`;
    }
  }

  // Executa a função para carregar o breadcrumb
  carregarBreadcrumb();

  // Captura elementos do formulário e tabela
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

  // Aplica máscara de 5 dígitos no código
  $('#codDisc').mask('00000');

  // Máscara sigla: 4 caracteres alfanuméricos em maiúsculo
  $('#siglaDisc').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
    $(this).val(val.toUpperCase());
  });

  // Máscara nome: apenas letras, números e espaços
  $('#nomeDisc').on('input', function () {
    let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
    $(this).val(val);
  });

  // Máscara período: número de 1 a 12 + "° Semestre"
  $('#periodoDisc').on('input', function () {
    let val = $(this).val().replace(/\D/g, '').slice(0, 2);
    let num = parseInt(val, 10);
    if (!isNaN(num) && num > 12) num = 12; // Limita a 12 semestres
    if (isNaN(num) || num === 0) val = '';
    else val = num.toString();

    if (val.length === 0) $(this).val('');
    else {
      $(this).val(val + '° Semestre');
      this.setSelectionRange(val.length, val.length); // Mantém cursor antes do texto
    }
  });

  // Variáveis de controle para edição e exclusão
  let botaoExcluir = null; // Controla confirmação dupla de exclusão
  let botaoSair = null; // Controla confirmação dupla de logout
  let linhaEditando = null; // Linha atualmente em modo de edição
  let valoresOriginaisLinha = null; // Backup dos valores antes da edição

  // Inicia com botão cadastrar desabilitado
  btnCadastrar.disabled = true;

  // Busca e exibe todas as disciplinas do curso
  async function carregarDisciplinas() {
    if (!courseId) return;

    try {
      const response = await fetch(`${API_URL}/subjects/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const subjects = await response.json();
        tabela.querySelector("tbody").innerHTML = ''; // Limpa tabela

        // Adiciona cada disciplina na tabela
        subjects.forEach(subj => {
          adicionarLinhaTabela(subj.id, subj.name, subj.abbreviation, subj.code, subj.semester);
        });
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    }
  }

  // Cria uma nova linha na tabela com os dados da disciplina
  function adicionarLinhaTabela(id, nome, sigla, codigo, periodo) {
    const novaLinha = document.createElement("tr");
    novaLinha.dataset.subjectId = id;
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
  }

  carregarDisciplinas();

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
  formDisc.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeDisc.value.trim();
    const sigla = siglaDisc.value.trim();
    const codigo = codDisc.value.trim();
    const periodo = periodoDisc.value.trim();

    if (!nome || !sigla || !codigo || !periodo) return;

    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          name: nome,
          code: codigo,
          abbreviation: sigla,
          semester: periodo
        })
      });

      if (response.ok) {
        const data = await response.json();
        adicionarLinhaTabela(data.id, nome, sigla, codigo, periodo);
        formDisc.reset();
        btnCadastrar.disabled = true;
      } else {
        alert('Erro ao cadastrar disciplina');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor');
    }
  });

  // ======== EDITAR DISCIPLINA ========
  document.addEventListener("click", async (event) => {
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

    if (!salvando && linhaEditando && linhaEditando !== linha) {
      alert("Conclua ou cancele a edição atual antes de editar outra linha.");
      return;
    }

    if (salvando) {
      const subjectId = linha.dataset.subjectId;
      const novoNome = inputNome.value.trim();
      const novaSigla = inputSigla.value.trim();
      const novoCodigo = inputCod.value.trim();
      const novoPeriodo = inputPeriodo.value.trim();

      try {
        const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: novoNome,
            code: novoCodigo,
            abbreviation: novaSigla,
            semester: novoPeriodo
          })
        });

        if (response.ok) {
          inputNome.disabled = true;
          inputSigla.disabled = true;
          inputCod.disabled = true;
          inputPeriodo.disabled = true;
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
          alert('Erro ao atualizar disciplina');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
      }
    }
    else {
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

      // Desabilita todos os outros botões
      tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
        if (b !== btn) {
          b.disabled = true;
        }
      });

      linhaEditando = linha;

      aplicarMascarasEdicao(inputNome, inputSigla, inputCod, inputPeriodo);

      function validarEdicao() {
        const nome = inputNome.value.trim().toUpperCase();
        const sigla = inputSigla.value.trim();
        const codigo = inputCod.value.trim();
        const periodo = inputPeriodo.value.trim();

        let nomeJaExiste = false;
        let codJaExiste = false;

        document.querySelectorAll("#tabelaDisc tbody tr").forEach((tr) => {
          if (tr === linha) return;
          const nomeExistente = tr.querySelector(".nomeDisc").value.trim().toUpperCase();
          const codExistente = tr.querySelector(".codDisc").value.trim();
          if (nomeExistente === nome) nomeJaExiste = true;
          if (codExistente === codigo) codJaExiste = true;
        });

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

    inputNome.value = valoresOriginaisLinha.nome;
    inputSigla.value = valoresOriginaisLinha.sigla;
    inputCod.value = valoresOriginaisLinha.codigo;
    inputPeriodo.value = valoresOriginaisLinha.periodo;

    inputNome.disabled = true;
    inputSigla.disabled = true;
    inputCod.disabled = true;
    inputPeriodo.disabled = true;

    btnEditar.textContent = "Editar";
    btnEditar.classList.remove("btn-success");
    btnEditar.classList.add("btn-outline-secondary");
    btnEditar.disabled = false;
    btnVer.disabled = false;

    inputNome.classList.remove("inputErrado");
    inputSigla.classList.remove("inputErrado");
    inputCod.classList.remove("inputErrado");
    inputPeriodo.classList.remove("inputErrado");

    // Reabilita todos os botões
    tabela.querySelectorAll('.btn-editar, .btn-excluir, .btn-ver').forEach(b => {
      b.disabled = false;
    });

    linhaEditando = null;
    valoresOriginaisLinha = null;
  });

  // ======== FUNÇÃO PARA MÁSCARAS DURANTE EDIÇÃO ========
  function aplicarMascarasEdicao(inputNome, inputSigla, inputCod, inputPeriodo) {
    $(inputCod).mask('00000');

    $(inputNome).on('input', function () {
      let val = $(this).val().replace(/[^a-zA-Z0-9 ]/g, '');
      $(this).val(val);
    });

    $(inputSigla).on('input', function () {
      let val = $(this).val().replace(/[^a-zA-Z0-9]/g, '');
      if (val.length > 4) val = val.slice(0, 4);
      $(this).val(val.toUpperCase());
    });

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
  document.addEventListener("click", async function (event) {
    const btn = event.target;

    if (btn.classList.contains("btn-excluir")) {
      event.preventDefault();
      event.stopPropagation();

      if (btn === botaoExcluir) {
        const linha = btn.closest("tr");
        const subjectId = linha.dataset.subjectId;

        try {
          const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            linha.remove();
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erro ao excluir disciplina');
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
    const subjectId = linha.data('subject-id');
    const url = 'turmas.html?disciplina=' + encodeURIComponent(disciplina) + '&subjectId=' + subjectId;
    window.location.href = url;
  });

  // ======== VOLTAR ========
  btnVoltar.addEventListener('click', function (event) {
    event.preventDefault();
    window.history.back();
  });

  // ======== SAIR ========
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
