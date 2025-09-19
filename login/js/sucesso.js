/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: sucesso.js
    Data: 18/09/2025
*/

// Captura os parâmetros da URL para identificar o fluxo
const parametroAnterior = new URLSearchParams(window.location.search);
const fluxo = parametroAnterior.get('fluxo');

// Define a mensagem de sucesso conforme o fluxo
if (fluxo === 'cadastro') {

    // Exibe a mensagem de "Usuario cadastrado com sucesso!" para o usuario
    document.getElementById("mensagemSucesso").textContent = "Usuario cadastrado com sucesso!"; 
}

// Fluxo da senha
else if (fluxo === 'esqueciSenha') {

    // Cria a variavel 'mensagem' e guarda o elemento do HTML nela
    const mensagem = document.getElementById("mensagemSucesso"); 

    // Permite quebra de linha no texto
    mensagem.style.whiteSpace = 'pre-line';

    // Exibe a mensagem de "Senha alterada com sucesso" para o usuario  
    mensagem.textContent = "Senha alterada \n com sucesso!";   
}
