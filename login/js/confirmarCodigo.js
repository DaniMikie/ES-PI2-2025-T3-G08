/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: confirmarCodigo.js
    Data: 18/09/2025
*/

// Captura os parâmetros da URL (para saber de qual fluxo veio)
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura os elementos do HTML
const form = document.getElementById("formCodigoConta");
const inputCodigo = document.getElementById("txtCodigo");
const btnProximo = document.getElementById('btnProximo');
const msgAviso = document.getElementById("msgAviso");

btnProximo.style.display = 'none';

// mostra/esconde botão enquanto digita
inputCodigo.addEventListener('input', () => {
    if (inputCodigo.value.trim() !== '') {
        btnProximo.style.display = 'inline-block';
        msgAviso.style.display = 'none';
    } 
    else {
        btnProximo.style.display = 'none';
    }
});

// Apos clicar no botao, define para onde o usuário vai com base no fluxo 
btnProximo.addEventListener('click', (e) => {
    e.preventDefault(); // Impede que o form seja submetido automaticamente

    if (inputCodigo.value.trim() === '') {
        msgAviso.textContent = "O campo não pode ficar vazio!";
        msgAviso.style.display = 'block';
        return; // Não redireciona se o campo estiver vazio
    } 
    else {
        msgAviso.style.display = 'none';
    }

    // Redireciona conforme fluxo
    if (fluxo === 'cadastro') {
        window.location.href = 'sucesso.html?fluxo=cadastro';
    } 
    else if (fluxo === 'esqueciSenha') {
        window.location.href = 'alteracaoSenha.html';
    }
});

