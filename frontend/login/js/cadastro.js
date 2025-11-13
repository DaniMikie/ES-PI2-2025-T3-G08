/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: cadastro.js
    Data: 18/09/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Aplica máscara de telefone (00) 00000-0000
$(document).ready(function () {
    $('#txtTelefone').mask('(00) 00000-0000');
});

// Bloqueia números no campo nome (apenas letras e espaços)
$('#txtNome').on('input', function () {
    $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
});

// Captura os elementos do HTML
const nome = document.querySelector("#txtNome");
const email = document.querySelector("#txtEmail");
const telefone = document.querySelector("#txtTelefone");
const senha = document.querySelector("#txtSenha");
const confirmaSenha = document.querySelector("#txtConfirmaSenha");
const aviso = document.querySelector(".aviso");
const form = document.querySelector("#formCadastro");
const btnProximo = document.querySelector('#btnProximo');

// Valida formato do email (texto@texto.texto)
const validarEmail = (email) => {
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/;
    return regex.test(email);
}

// Valida formato do telefone (00) 00000-0000
const validarTelefone = (telefone) => {
    const regex = /^\(\d{2}\) \d{5}-\d{4}$/;
    return regex.test(telefone);
}

// Valida senha (mínimo 8 caracteres, 1 maiúscula e 1 minúscula)
const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Inicia com botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Adiciona eventos de digitação em todos os campos
nome.onkeyup = onInputKeyUp;
email.onkeyup = onInputKeyUp;
telefone.onkeyup = onInputKeyUp;
senha.onkeyup = onInputKeyUp;
confirmaSenha.onkeyup = onInputKeyUp;

// Valida campos em tempo real enquanto usuário digita
function onInputKeyUp(_event) {
    // Verifica se todos os campos estão preenchidos
    const isNotEmpty =
        nome.value.trim().length > 0 &&
        email.value.trim().length > 0 &&
        telefone.value.trim().length > 0 &&
        senha.value.trim().length > 0 &&
        confirmaSenha.value.trim().length > 0;

    // Valida cada campo
    const isEmailValid = validarEmail(email.value);
    const isSenhaEqual = (senha.value == confirmaSenha.value);
    const isSenhaValid = validarSenha(senha.value);
    const isTelefoneValid = validarTelefone(telefone.value);

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

    // Marca campo telefone como inválido se não atender formato
    if (telefone.value.trim().length > 0) {
        if (!isTelefoneValid) {
            telefone.classList.add("inputErrado");
        }
        else {
            telefone.classList.remove("inputErrado");
            telefone.classList.add("input");
        }
    }

    // Marca campos de senha como inválidos se não atenderem requisitos
    if (senha.value.trim().length > 0 ||
        confirmaSenha.value.trim().length > 0) {
        if (!isSenhaValid || !isSenhaEqual) {
            confirmaSenha.classList.add("inputErrado");
            senha.classList.add("inputErrado");
        }
        else {
            confirmaSenha.classList.remove("inputErrado");
            confirmaSenha.classList.add("input");
            senha.classList.remove("inputErrado");
            senha.classList.add("input");
        }
    }

    // Habilita botão apenas se todos os campos forem válidos
    if (isNotEmpty && isSenhaEqual && isEmailValid && isSenhaValid && isTelefoneValid) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
        aviso.style.display = "none";
    }
    else {
        btnProximo.disabled = true;
        btnProximo.classList.add("btnDesativado");
        aviso.style.display = "inline-block";
    }
}

// Processa o cadastro ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nomeValue = nome.value.trim();
    const emailValue = email.value.trim();
    const telefoneValue = telefone.value.trim();
    const senhaValue = senha.value.trim();

    try {
        // Envia dados do cadastro para API
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nomeValue,
                email: emailValue,
                phone: telefoneValue,
                password: senhaValue
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva email para próxima etapa (confirmação de código)
            localStorage.setItem('registerEmail', emailValue);

            // Redireciona para tela de confirmação de código
            window.location.href = 'confirmarCodigo.html?fluxo=cadastro';
        } else {
            // Exibe mensagem de erro apropriada
            if (data.error === 'Usuário já existe') {
                alert('Este email já está cadastrado. Por favor, faça login ou use outro email.');
            } else {
                alert(data.error || 'Erro ao cadastrar usuário');
            }
        }
    } catch (error) {
        // Erro de conexão com servidor
        alert('Erro ao conectar com o servidor');
        console.error('Erro:', error);
    }
});
