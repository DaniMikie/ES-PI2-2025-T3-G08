/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: esqueciSenha.js
    Data: 18/09/2025
*/

// Captura os valores digitados
const email = document.getElementById("txtEmail").value;

// Seleciona o elemento do HTML "btnProximo" e armazena ele na constante btnProximo
const btnProximo = document.getElementById('btnProximo');

// Quando o botão é clicado
btnProximo.addEventListener('click', () => {

    // Aqui futuramente deve ser feita a validação do e-mail informado

    // Redireciona para confirmar código no fluxo da senha
    window.location.href = '/confirmarCodigo?fluxo=esqueciSenha';
});
