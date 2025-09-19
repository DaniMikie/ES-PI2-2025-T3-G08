/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: confirmarCodigo.js
    Data: 18/09/2025
*/

// Captura os parâmetros da URL (para saber de qual fluxo veio)
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura os valores digitados
const codigo = document.getElementById("txtCodigo").value;

// Seleciona o elemento do HTML "btnProximo" e armazena ele na constante btnProximo
const btnProximo = document.getElementById('btnProximo');

// Apos clicar no botao, define para onde o usuário vai com base no fluxo 
btnProximo.addEventListener('click', () => {

    // Fluxo do cadastro
    if (fluxo === 'cadastro') {
        window.location.href = 'sucesso.html?fluxo=cadastro';

    // Fluxo da senha
    } else if (fluxo === 'esqueciSenha') {
        window.location.href = 'alteracaoSenha.html';
    } 
});
