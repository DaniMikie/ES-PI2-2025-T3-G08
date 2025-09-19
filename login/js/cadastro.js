/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: cadastro.js
    Data: 18/09/2025
*/

// Captura os valores digitados
const nome = document.getElementById("txtNome").value;
const email = document.getElementById("txtEmail").value;
const telefone = document.getElementById("txtTelefone").value;
const senha = document.getElementById("txtSenha").value;

// Seleciona o elemento do HTML "btnProximo" e armazena ele na constante btnProximo
const btnProximo = document.getElementById('btnProximo');

// Quando o botão é clicado
btnProximo.addEventListener('click', () => {

    // Redireciona para confirmar código no fluxo de cadastro
    window.location.href = 'confirmarCodigo.html?fluxo=cadastro';
});
