/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: confirmarCodigo.js
    Data: 18/09/2025
*/

// Captura os parâmetros da URL para identificar o fluxo
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura os elementos do HTML
const form = document.querySelector("#formCodigoConta");
const btnProximo = document.querySelector('#btnProximo');
const inputCodigo = document.querySelector("#txtCodigo");

// Deixa o botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Adiciona os eventos
inputCodigo.onkeyup = onInputKeyUp;

// Funcao ativada quando o usuario digita via teclado
function onInputKeyUp(_event) {
    // Verifica se os campos nao estao vazios
    const isNotEmpty = inputCodigo.value.trim().length > 0;

    // Habilita o botao
    if (isNotEmpty) {
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
    // Redireciona conforme fluxo
    if (fluxo === 'cadastro') {
        window.location.href = 'sucesso.html?fluxo=cadastro';
    } 
    else if (fluxo === 'esqueciSenha') {
        window.location.href = 'alteracaoSenha.html';
    }
});