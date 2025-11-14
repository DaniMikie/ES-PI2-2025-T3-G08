/**
 * Autor: Gustavo Alves e Daniela Mikie
 * Projeto: Projeto NotaDez
 * Arquivo: server.ts
 * Data: 18/09/2025
 * 
 * Servidor Principal da API
 * Configuração do Express e registro de rotas
 */

// Importações principais do Express e middlewares
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./db/database";

// Importação de todas as rotas da API
import authRoutes from "./routes/authRoutes";
import passwordRoutes from "./routes/passwordRoutes";
import institutionRoutes from "./routes/institutionRoutes";
import courseRoutes from "./routes/courseRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import classRoutes from "./routes/classRoutes";
import studentRoutes from "./routes/studentRoutes";
import gradeComponentRoutes from "./routes/gradeComponentRoutes";
import gradeRoutes from "./routes/gradeRoutes";

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa aplicação Express
const app = express();
const port = process.env.PORT || 3000;

// Configuração de middlewares
app.use(bodyParser.json()); // Parse de requisições JSON
app.use(cors()); // Habilita CORS para requisições cross-origin

// Testa conexão com banco de dados ao iniciar
testConnection();

// Rota raiz para verificar se API está funcionando
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API NotaDez - Backend funcionando!" });
});

// Registro de rotas da API
app.use("/api/auth", authRoutes); // Autenticação (login, registro)
app.use("/api/password", passwordRoutes); // Recuperação de senha
app.use("/api/institutions", institutionRoutes); // Instituições de ensino
app.use("/api/courses", courseRoutes); // Cursos
app.use("/api/subjects", subjectRoutes); // Disciplinas
app.use("/api/classes", classRoutes); // Turmas
app.use("/api/students", studentRoutes); // Alunos
app.use("/api/grade-components", gradeComponentRoutes); // Componentes de avaliação
app.use("/api/grades", gradeRoutes); // Notas

// Inicia servidor HTTP na porta especificada
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📍 http://localhost:${port}`);
});
