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
const inputCodigo = document.querySelector("#txtCodigo");
const emailUsuario = document.querySelector("#emailUsuario");

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

// Aplica máscara: apenas números, máximo 6 dígitos
inputCodigo.addEventListener('input', function () {
    let valor = this.value.replace(/\D/g, ''); // Remove não-números
    valor = valor.slice(0, 6); // Limita a 6 dígitos
    this.value = valor;
});

// Adiciona evento de digitação
inputCodigo.onkeyup = onInputKeyUp;

// Valida código em tempo real (deve ter exatamente 6 dígitos)
function onInputKeyUp(_event) {
    const codigo = inputCodigo.value.trim();
    const isValid = codigo.length === 6;

    // Habilita botão apenas se código tiver 6 dígitos
    if (isValid) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
    }
    else {
        btnProximo.disabled = true;
        btnProximo.classList.add("btnDesativado");
    }
}

// Verifica código ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = inputCodigo.value.trim();

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
                alert(data.error || 'Código inválido');
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
                alert(data.error || 'Código inválido');
            }
        } catch (error) {
            // Erro de conexão com servidor
            alert('Erro ao conectar com o servidor');
            console.error('Erro:', error);
        }
    }
});
