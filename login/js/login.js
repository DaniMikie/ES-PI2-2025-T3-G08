/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: login.js
    Data: 18/09/2025
*/

// Evento de envio do formulário de login
formLogin.addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o reload da página

    // Captura os valores digitados
    const email = document.getElementById("txtEmail").value;
    const senha = document.getElementById("txtSenha").value;

    // Apenas para testes (mostra no console)
    console.log("E-mail digitado:", email);
    console.log("Senha digitada:", senha);

    // Exibe mensagem de status para o usuário
    document.getElementById("mensagem").textContent = "Tentando logar...";

    // Limpa os campos do formulário
    formLogin.reset();
});
