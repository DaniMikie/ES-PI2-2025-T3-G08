/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: sucesso.js
    Data: 18/09/2025
*/

// Captura os parâmetros da URL para identificar o fluxo
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura o elemento do HTML
const mensagem = document.querySelector("#mensagemSucesso");

// Define a mensagem de sucesso conforme o fluxo
if (fluxo === 'cadastro') {
    // Exibe a mensagem de "Usuario cadastrado com sucesso!" para o usuario
    mensagem.textContent = "Usuario cadastrado com sucesso!"; 
}

// Fluxo da senha
else if (fluxo === 'esqueciSenha') {
    // Permite quebra de linha no texto
    mensagem.style.whiteSpace = 'pre-line';

    // Exibe a mensagem de "Senha alterada com sucesso" para o usuario  
    mensagem.textContent = "Senha alterada \n com sucesso!";   
}
