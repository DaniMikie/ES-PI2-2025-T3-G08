/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: alteracaoSenha.js
    Data: 18/09/2025
*/

// Captura os valores digitados
const senha = document.getElementById("txtSenha").value;
const confirmarSenha = document.getElementById("txtConfirmarSenha").value;

// Seleciona o elemento do HTML "btnProximo" e armazena ele na constante btnProximo
const btnProximo = document.getElementById('btnProximo');

// Ao clicar, valida a senha (futuro)
btnProximo.addEventListener('click', () => {

    // Aqui futuramente deve ser feita a validação da senha

    // Redireciona para sucesso com o fluxo da senha
    window.location.href = 'sucesso.html?fluxo=esqueciSenha';
});
