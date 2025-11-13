/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: sucesso.js
    Data: 18/09/2025
*/

// Identifica o fluxo (cadastro ou esqueci senha) pela URL
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Captura o elemento do HTML
const mensagem = document.querySelector("#mensagemSucesso");

// Exibe mensagem apropriada conforme o fluxo
if (fluxo === 'cadastro') {
    mensagem.textContent = "Usuario cadastrado com sucesso!";
}
else if (fluxo === 'esqueciSenha') {
    mensagem.style.whiteSpace = 'pre-line'; // Permite quebra de linha
    mensagem.textContent = "Senha alterada \n com sucesso!";
}
