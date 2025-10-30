/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: esqueciSenha.js
    Data: 18/09/2025
*/

// Captura os elementos do HTML
const email = document.querySelector("#txtEmail");
const form = document.querySelector("#formEsqueciSenha");
const btnProximo = document.querySelector('#btnProximo');

// Deixa o botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Funcao para validar emails 
const validarEmail = (email) => {

    // Padrao do email TEXTO@TEXTO.TEXTO
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/
    return regex.test(email);
}

// Adiciona os eventos
email.onkeyup = onInputKeyUp;

// Funcao ativada quando o usuario digita via teclado
function onInputKeyUp(_event) {
    // Verifica se os campos nao estao vazios
    const isNotEmpty = email.value.trim().length > 0;

    // Verifica se o email está no padrão
    const isEmailValid = validarEmail(email.value);

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

// Quando o botão é clicado
form.addEventListener("submit", (event) => {
    // Redireciona para confirmar código no fluxo da senha
    window.location.href = 'confirmarCodigo.html?fluxo=esqueciSenha';
    
    // Impede o reload
    event.preventDefault();
});
