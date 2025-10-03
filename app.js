// Importa os pacotes
const express = require("express"); // Pacote basico para criacao de servidores web
const cors = require("cors"); // Pacote para comunicacao externa
const path = require('path');

const app = express(); // Inicializa o servidor
const PORT = 8080; // PORTA

// Inicializa o CORS
app.use(cors());


// Permite que a pasta login/html seja acessível como arquivos estáticos
app.use(express.static(path.join(__dirname, 'login')));

// Rota principal (Login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'html', 'login.html'));
});

// Rota para Cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'html', 'cadastro.html'));
});

// Rota para Alterar senha
app.get('/alteracaoSenha', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'html', 'alteracaoSenha.html'));
});

// Rota para Esqueci a senha
app.get('/esqueciSenha', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'html', 'esqueciSenha.html'));
});

// Rota para confirmar código (e-mail)
app.get('/confirmarCodigo', (req, res) => {
    const fluxo = req.query.fluxo; 
    res.sendFile(path.join(__dirname, 'login', 'html', 'confirmarCodigo.html'));
});

// Rota de confirmacao(sucesso)
app.get('/sucesso', (req, res) => {
    const fluxo = req.query.fluxo; 
    res.sendFile(path.join(__dirname, 'login', 'html', 'sucesso.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
