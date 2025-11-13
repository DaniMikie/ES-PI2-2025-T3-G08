/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: login.js
    Data: 18/09/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Captura os elementos do HTML
const email = document.querySelector("#txtEmail");
const senha = document.querySelector("#txtSenha");
const btnLogin = document.querySelector("#btnLogin");
const mensagem = document.querySelector("#mensagem");
const form = document.querySelector("#formLogin")

// Valida formato do email (texto@texto.texto)
const validarEmail = (email) => {
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/
    return regex.test(email);
}

// Valida senha (mínimo 8 caracteres, 1 maiúscula e 1 minúscula)
const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Inicia com botão desabilitado
btnLogin.disabled = true;
btnLogin.classList.add("btnDesativado");

// Adiciona eventos de digitação
email.onkeyup = onInputKeyUp;
senha.onkeyup = onInputKeyUp;

// Valida campos em tempo real enquanto usuário digita
function onInputKeyUp(_event) {
    const isNotEmpty = email.value.trim().length > 0 &&
        senha.value.trim().length > 0;

    const isEmailValid = validarEmail(email.value);
    const isSenhaValid = validarSenha(senha.value);

    // Marca campo senha como inválido se não atender requisitos
    if (senha.value.trim().length > 0) {
        if (!isSenhaValid) {
            senha.classList.add("inputErrado");
        }
        else {
            senha.classList.remove("inputErrado");
            senha.classList.add("input");
        }
    }

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

    // Habilita botão apenas se todos os campos forem válidos
    if (isNotEmpty && isEmailValid && isSenhaValid) {
        btnLogin.disabled = false;
        btnLogin.classList.remove("btnDesativado");
        btnLogin.classList.add("btn");
    }
    else {
        btnLogin.disabled = true;
        btnLogin.classList.add("btnDesativado");
    }
}

// Processa o login ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();

    try {
        // Envia credenciais para API
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailValue,
                password: senhaValue
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva dados do usuário no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userId', data.user.id);

            // Redireciona para dashboard
            formLogin.reset();
            window.location.href = '/frontend/dashboard/html/dashboard.html';
        } else {
            // Exibe mensagem de erro
            mensagem.textContent = data.error || 'Erro ao fazer login';
            mensagem.style.color = 'red';
        }
    } catch (error) {
        // Erro de conexão com servidor
        mensagem.textContent = 'Erro ao conectar com o servidor';
        mensagem.style.color = 'red';
        console.error('Erro:', error);
    }
});
