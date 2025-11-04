/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: login.js
    Data: 18/09/2025
*/

// Captura os elementos do HTML
const email = document.querySelector("#txtEmail");
const senha = document.querySelector("#txtSenha");
const btnLogin = document.querySelector("#btnLogin");
const mensagem = document.querySelector("#mensagem");
const form = document.querySelector("#formLogin")

// Funcao para validar emails 
const validarEmail = (email) => {

    // Padrao do email TEXTO@TEXTO.TEXTO
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/
    return regex.test(email);
}

// Função para validar a senha
const validarSenha = (senha) => {
    // Pelo menos 8 caracteres, 1 maiúscula e 1 minúscula
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Deixa o botão desabilitado
btnLogin.disabled = true;
btnLogin.classList.add("btnDesativado");

// Adiciona os eventos
email.onkeyup = onInputKeyUp;
senha.onkeyup = onInputKeyUp;

// Funcao ativada quando o usuario digita via teclado
function onInputKeyUp(_event) {
    // Verifica se os campos nao estao vazios
    const isNotEmpty = email.value.trim().length > 0 &&
        senha.value.trim().length > 0;

    // Verifica se o email e esta no padrao
    const isEmailValid = validarEmail(email.value);
    const isSenhaValid = validarSenha(senha.value);

    // Deixa a caixa vermelha quando senha fora do padrao
    if(senha.value.trim().length > 0) {
        if (!isSenhaValid) {
            senha.classList.add("inputErrado");
        } 
        else {
            senha.classList.remove("inputErrado");
            senha.classList.add("input");
        }
    }

    // Deixa a caixa vermelha quando email fora do padrao
    if(email.value.trim().length > 0) {
        if (!isEmailValid){
            email.classList.add("inputErrado");
        }
        else {
            email.classList.remove("inputErrado");
            email.classList.add("input");
        }
    } 

    // Habilita o botao
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

// Quando o form do login for enviado
form.addEventListener("submit", (event) => {
    // Impede o reload
    event.preventDefault();

    // Envia o cadastro para o back e valida

    // Limpa os campos do formulário
    formLogin.reset();

    // Se autenticado faz o login e vai para a dashboard
    window.location.href='/frontend/dashboard/html/instituicoes.html'
});
