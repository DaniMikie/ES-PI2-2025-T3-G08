/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: esqueciSenha.js (Integrado com Backend)
    Data: 18/09/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Captura os elementos do HTML
const email = document.querySelector("#txtEmail");
const form = document.querySelector("#formEsqueciSenha");
const btnProximo = document.querySelector('#btnProximo');

// Inicia com botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Valida formato do email (texto@texto.texto)
const validarEmail = (email) => {
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/
    return regex.test(email);
}

// Adiciona evento de digitação
email.onkeyup = onInputKeyUp;

// Valida campo em tempo real enquanto usuário digita
function onInputKeyUp(_event) {
    const isNotEmpty = email.value.trim().length > 0;
    const isEmailValid = validarEmail(email.value);

    // Marca campo email como inválido se não atender formato
    if (email.value.trim().length > 0) {
        if (!isEmailValid) {
            email.classList.add("inputErrado");
        }
        else {
            email.classList.remove("inputErrado");
            email.classList.add("input");
        }
    }

    // Habilita botão apenas se email for válido
    if (isNotEmpty && isEmailValid) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
    }
    else {
        btnProximo.disabled = true;
        btnProximo.classList.add("btnDesativado");
    }
}

// Solicita código de recuperação ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailValue = email.value.trim();

    try {
        // Envia solicitação de recuperação para API
        const response = await fetch(`${API_URL}/password/request-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailValue })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva email para próxima etapa (confirmação de código)
            localStorage.setItem('resetEmail', emailValue);

            // Redireciona para tela de confirmação de código
            window.location.href = 'confirmarCodigo.html?fluxo=esqueciSenha';
        } else {
            // Exibe mensagem de erro apropriada
            if (data.error === 'Usuário não encontrado') {
                alert('Este email não está cadastrado. Por favor, verifique o email ou crie uma nova conta.');
            } else {
                alert(data.error || 'Erro ao solicitar recuperação de senha');
            }
        }
    } catch (error) {
        // Erro de conexão com servidor
        alert('Erro ao conectar com o servidor');
        console.error('Erro:', error);
    }
});
