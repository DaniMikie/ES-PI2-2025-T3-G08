/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: alteracaoSenha.js (Integrado com Backend)
    Data: 18/09/2025
*/

// URL base da API
const API_URL = 'http://localhost:3000/api';

// Captura os elementos do HTML
const senha = document.querySelector("#txtSenha");
const confirmaSenha = document.querySelector("#txtConfirmaSenha");
const aviso = document.querySelector(".aviso");
const form = document.querySelector("#formAlteracaoSenha");
const btnProximo = document.querySelector('#btnProximo');

// Valida senha (mínimo 8 caracteres, 1 maiúscula e 1 minúscula)
const validarSenha = (senha) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Inicia com botão desabilitado e aviso oculto
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");
aviso.style.display = "none";

// Adiciona eventos de digitação
senha.onkeyup = onInputKeyUp;
confirmaSenha.onkeyup = onInputKeyUp;

// Valida campos em tempo real enquanto usuário digita
function onInputKeyUp(_event) {
    const isNotEmpty =
        senha.value.trim().length > 0 &&
        confirmaSenha.value.trim().length > 0;

    const isSenhaEqual = (senha.value == confirmaSenha.value);
    const isSenhaValid = validarSenha(senha.value);

    // Marca campos como inválidos se não atenderem requisitos
    if (senha.value.trim().length > 0 || confirmaSenha.value.trim().length > 0) {
        if (!isSenhaValid || !isSenhaEqual) {
            confirmaSenha.classList.add("inputErrado");
            senha.classList.add("inputErrado");
            // Exibe aviso apenas se senhas forem diferentes
            if (!isSenhaEqual) aviso.style.display = "inline-block";
            else aviso.style.display = "none";
        }
        else {
            confirmaSenha.classList.remove("inputErrado");
            confirmaSenha.classList.add("input");
            senha.classList.remove("inputErrado");
            senha.classList.add("input");
            aviso.style.display = "none";
        }
    }

    // Habilita botão apenas se senhas forem válidas e iguais
    if (isNotEmpty && isSenhaEqual && isSenhaValid) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
    }
    else {
        btnProximo.disabled = true;
        btnProximo.classList.add("btnDesativado");
    }
}

// Redefine senha ao enviar o formulário
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Recupera dados da sessão
    const email = localStorage.getItem('resetEmail');
    const code = localStorage.getItem('resetCode');
    const newPassword = senha.value.trim();

    // Verifica se sessão ainda é válida
    if (!email || !code) {
        alert('Sessão expirada. Por favor, inicie o processo novamente.');
        window.location.href = 'esqueciSenha.html';
        return;
    }

    try {
        // Envia nova senha para API
        const response = await fetch(`${API_URL}/password/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            // Senha redefinida com sucesso - limpa dados e redireciona
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('resetCode');
            window.location.href = 'sucesso.html?fluxo=esqueciSenha';
        } else {
            alert(data.error || 'Erro ao redefinir senha');
        }
    } catch (error) {
        // Erro de conexão com servidor
        alert('Erro ao conectar com o servidor');
        console.error('Erro:', error);
    }
});
