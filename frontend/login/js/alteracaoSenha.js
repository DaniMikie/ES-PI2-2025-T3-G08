/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: alteracaoSenha.js
    Data: 18/09/2025
*/

// Captura os elementos do HTML
const senha = document.querySelector("#txtSenha");
const confirmaSenha = document.querySelector("#txtConfirmaSenha");
const aviso = document.querySelector(".aviso");
const form = document.querySelector("#formAlteracaoSenha");
const btnProximo = document.querySelector('#btnProximo');

// Função para validar a senha
const validarSenha = (senha) => {
    // Pelo menos 8 caracteres, 1 maiúscula e 1 minúscula
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Deixa o botão desabilitado e esconde o aviso
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");
aviso.style.display = "none";

// Adiciona os eventos
senha.onkeyup = onInputKeyUp;
confirmaSenha.onkeyup = onInputKeyUp;
 
// Funcao ativada quando o usuario digita via teclado
function onInputKeyUp(_event) {
    // Verifica se os campos nao estao vazios
    const isNotEmpty = 
        senha.value.trim().length > 0 &&
        confirmaSenha.value.trim().length > 0;

    // Valida se as senhas são iguais e no padrão 
    const isSenhaEqual = (senha.value == confirmaSenha.value);
    const isSenhaValid = validarSenha(senha.value);

    // Deixa a caixa vermelha quando senhas diferentes, ou fora do padrao
    if(senha.value.trim().length > 0 || confirmaSenha.value.trim().length > 0) {
        if (!isSenhaValid || !isSenhaEqual) {
            confirmaSenha.classList.add("inputErrado");
            senha.classList.add("inputErrado");
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

    // Habilita o botao
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

// Quando o form for enviado
form.addEventListener("submit", (event) => {
    // Impede o reload
    event.preventDefault(); 

    // Redireciona para sucesso no fluxo da senha
    window.location.href = 'sucesso.html?fluxo=esqueciSenha';
});