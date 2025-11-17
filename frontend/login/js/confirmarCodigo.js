/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: confirmarCodigo.js (Integrado com Backend)
    Data: 18/09/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Identifica o fluxo (cadastro ou esqueci senha) pela URL
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura os elementos do HTML
const form = document.querySelector("#formCodigoConta");
const btnProximo = document.querySelector('#btnProximo');
const emailUsuario = document.querySelector("#emailUsuario");
const avisoCodigo = document.querySelector("#avisoCodigo");
const inputs = [
    document.querySelector("#codigo1"),
    document.querySelector("#codigo2"),
    document.querySelector("#codigo3"),
    document.querySelector("#codigo4"),
    document.querySelector("#codigo5"),
    document.querySelector("#codigo6")
];

// Recupera email do localStorage conforme o fluxo
let email = '';
if (fluxo === 'cadastro') {
    email = localStorage.getItem('registerEmail');
} else if (fluxo === 'esqueciSenha') {
    email = localStorage.getItem('resetEmail');
}

// Exibe email na tela ou redireciona se sessão expirou
if (email) {
    emailUsuario.textContent = email;
} else {
    // Sessão expirada - redireciona para tela inicial do fluxo
    if (fluxo === 'cadastro') {
        alert('Sessão expirada. Por favor, inicie o cadastro novamente.');
        window.location.href = 'cadastro.html';
    } else {
        alert('Sessão expirada. Por favor, inicie o processo novamente.');
        window.location.href = 'esqueciSenha.html';
    }
}

// Inicia com botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Foca no primeiro input ao carregar
inputs[0].focus();

// Adiciona eventos para cada input
inputs.forEach((input, index) => {
    // Permite apenas números
    input.addEventListener('input', function (e) {
        const valor = this.value.replace(/\D/g, '');
        this.value = valor;

        // Limpa mensagem de erro ao começar a digitar
        limparErro();

        // Se digitou um número, move para o próximo input
        if (valor.length === 1 && index < 5) {
            inputs[index + 1].focus();
        }

        // Valida se todos os campos estão preenchidos
        validarCodigo();
    });

    // Permite navegar com backspace
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && this.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });

    // Permite colar código completo
    input.addEventListener('paste', function (e) {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        pasteData.split('').forEach((char, i) => {
            if (inputs[i]) {
                inputs[i].value = char;
            }
        });

        // Foca no último input preenchido ou no próximo vazio
        const nextEmpty = inputs.findIndex(inp => inp.value === '');
        if (nextEmpty !== -1) {
            inputs[nextEmpty].focus();
        }
        else {
            inputs[5].focus();
        }

        validarCodigo();
    });
});

// Valida se todos os 6 dígitos foram preenchidos
function validarCodigo() {
    const todosPreenchidos = inputs.every(input => input.value.length === 1);

    if (todosPreenchidos) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
    }
    else {
        btnProximo.disabled = true;
        btnProximo.classList.remove("btn");
        btnProximo.classList.add("btnDesativado");
    }
}

// Função para obter o código completo
function obterCodigo() {
    return inputs.map(input => input.value).join('');
}

// Função para mostrar erro visual
function mostrarErro(mensagem) {
    // Mostra mensagem de erro
    avisoCodigo.textContent = mensagem || 'Código inválido. Tente novamente.';
    avisoCodigo.style.display = 'block';

    // Adiciona classe de erro nos inputs
    inputs.forEach(input => {
        input.classList.add('erro');
        input.value = '';
    });

    // Remove a classe de erro após a animação
    setTimeout(() => {
        inputs.forEach(input => input.classList.remove('erro'));
        inputs[0].focus();
    }, 500);
}

// Função para limpar erro
function limparErro() {
    avisoCodigo.style.display = 'none';
    avisoCodigo.textContent = '';
}

// Verifica código ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = obterCodigo();

    // FLUXO DE CADASTRO: verifica código de confirmação
    if (fluxo === 'cadastro') {
        const email = localStorage.getItem('registerEmail');

        if (!email) {
            alert('Email não encontrado. Por favor, inicie o processo novamente.');
            window.location.href = 'cadastro.html';
            return;
        }

        try {
            // Envia código para validação na API
            const response = await fetch(`${API_URL}/auth/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code: codigo })
            });

            const data = await response.json();

            if (response.ok) {
                // Código válido - limpa dados e redireciona para sucesso
                localStorage.removeItem('registerEmail');
                window.location.href = 'sucesso.html?fluxo=cadastro';
            } else {
                mostrarErro(data.error || 'Código inválido');
            }
        } catch (error) {
            // Erro de conexão com servidor
            alert('Erro ao conectar com o servidor');
            console.error('Erro:', error);
        }
        return;
    }

    // FLUXO DE ESQUECI SENHA: verifica código de recuperação
    if (fluxo === 'esqueciSenha') {
        const email = localStorage.getItem('resetEmail');

        if (!email) {
            alert('Email não encontrado. Por favor, inicie o processo novamente.');
            window.location.href = 'esqueciSenha.html';
            return;
        }

        try {
            // Envia código para validação na API
            const response = await fetch(`${API_URL}/password/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code: codigo })
            });

            const data = await response.json();

            if (response.ok) {
                // Código válido - salva para próxima etapa e redireciona
                localStorage.setItem('resetCode', codigo);
                window.location.href = 'alteracaoSenha.html';
            } else {
                mostrarErro(data.error || 'Código inválido');
            }
        } catch (error) {
            // Erro de conexão com servidor
            alert('Erro ao conectar com o servidor');
            console.error('Erro:', error);
        }
    }
});
