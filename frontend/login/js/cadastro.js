/* 
    Autor: Gustavo Alves
    Projeto: Projeto NotaDez
    Arquivo: cadastro.js
    Data: 18/09/2025
*/

// Máscara do telefone
$(document).ready(function(){
    $('#txtTelefone').mask('(00) 00000-0000');
  });

// Máscara do nome (bloqueia números)
$('#txtNome').on('input', function() {
    $(this).val($(this).val().replace(/[^A-Za-zÀ-ÿ\s]/g, ''));
  });

// Captura os elementos do HTML
const nome = document.querySelector("#txtNome");
const email = document.querySelector("#txtEmail");
const telefone = document.querySelector("#txtTelefone");
const senha = document.querySelector("#txtSenha");
const confirmaSenha = document.querySelector("#txtConfirmaSenha");
const aviso = document.querySelector(".aviso");
const form = document.querySelector("#formCadastro");
const btnProximo = document.querySelector('#btnProximo');

// Funcao para validar emails 
const validarEmail = (email) => {

    // Padrao do email TEXTO@TEXTO.TEXTO
    const regex = /^[^\s]+@[^\s]+\.[^\s]+$/;
    return regex.test(email);
}

// Funcao para validar telefones 
const validarTelefone = (telefone) => {

    // Padrao do telefone (00) 00000-0000
    const regex = /^\(\d{2}\) \d{5}-\d{4}$/;
    return regex.test(telefone);
}

// Função para validar a senha
const validarSenha = (senha) => {

    // Pelo menos 8 caracteres, 1 maiúscula e 1 minúscula
    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(senha);
};

// Deixa o botão desabilitado
btnProximo.disabled = true;
btnProximo.classList.add("btnDesativado");

// Adiciona os eventos
nome.onkeyup = onInputKeyUp;
email.onkeyup = onInputKeyUp;
telefone.onkeyup = onInputKeyUp;
senha.onkeyup = onInputKeyUp;
confirmaSenha.onkeyup = onInputKeyUp;

// Funcao ativada quando o usuario digita via teclado
function onInputKeyUp(_event) {
    // Verifica se os campos nao estao vazios
    const isNotEmpty = 
        nome.value.trim().length > 0 &&
        email.value.trim().length > 0 &&
        telefone.value.trim().length > 0 &&
        senha.value.trim().length > 0 &&
        confirmaSenha.value.trim().length > 0;

    // Verifica se o email e esta no padrao
    const isEmailValid = validarEmail(email.value);
    const isSenhaEqual = (senha.value == confirmaSenha.value);
    const isSenhaValid = validarSenha(senha.value);
    const isTelefoneValid = validarTelefone(telefone.value);

    // Deixa a caixa vermelha quando email fora do padrao
    if(email.value.trim().length > 0) {
        if (!isEmailValid){
            email.classList.add("inputErrado");
        }
        else {
            email.classList.remove("inputErrado");
            email.classList.add("input");
        }
    }   

    // Deixa a caixa vermelha quando telefone fora do padrao
    if(telefone.value.trim().length > 0) {
        if (!isTelefoneValid){
            telefone.classList.add("inputErrado");
        }
        else {
            telefone.classList.remove("inputErrado");
            telefone.classList.add("input");
        }
    }


    // Deixa a caixa vermelha quando senhas diferentes, ou fora do padrao
    if(senha.value.trim().length > 0 ||
        confirmaSenha.value.trim().length > 0) {
        if (!isSenhaValid || !isSenhaEqual) {
            confirmaSenha.classList.add("inputErrado");
            senha.classList.add("inputErrado");
        } 
        else {
            confirmaSenha.classList.remove("inputErrado");
            confirmaSenha.classList.add("input");
            senha.classList.remove("inputErrado");
            senha.classList.add("input");
        }
    }

    // Habilita o botao
    if (isNotEmpty && isSenhaEqual && isEmailValid && isSenhaValid && isTelefoneValid) {
        btnProximo.disabled = false;
        btnProximo.classList.remove("btnDesativado");
        btnProximo.classList.add("btn");
        aviso.style.display = "none";
    } 
    else {
        btnProximo.disabled = true;
        btnProximo.classList.add("btnDesativado");
        aviso.style.display = "inline-block";
    }
}

// Quando o form for enviado
form.addEventListener("submit", (event) => {
    // Impede o reload
    event.preventDefault(); 
    
    // Redireciona para confirmar código no fluxo do cadastro
    window.location.href = 'confirmarCodigo.html?fluxo=cadastro';
});
