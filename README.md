# ES-PI2-2025-T3-G08
# Projeto NotaDez - Sistema de Gerenciamento de Notas Acadêmicas 

Sistema completo de gerenciamento de notas acadêmicas desenvolvido com arquitetura cliente-servidor, utilizando Node.js/TypeScript no backend e HTML/CSS/JavaScript no frontend.

## Visão Geral

O NotaDez é uma plataforma web para gerenciamento acadêmico que permite o controle completo de instituições de ensino, cursos, disciplinas, turmas e alunos. O sistema oferece funcionalidades de cadastro de notas, cálculo automático de médias com fórmulas personalizadas, importação/exportação de dados via CSV e sistema completo de auditoria.

## Tecnologias Utilizadas

### Backend
- Node.js 
- TypeScript
- Express.js
- MySQL 
- JWT (JSON Web Tokens)
- bcryptjs
- Nodemailer

### Frontend
- HTML
- CSS
- JavaScript 
- Bootstrap 
- jQuery
- jQuery Mask Plugin

## Arquitetura do Sistema

```
pi_2/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Controladores da API REST
│   │   ├── services/           # Camada de lógica de negócio
│   │   ├── routes/             # Definição de rotas da API
│   │   ├── middlewares/        # Middlewares (autenticação, validação)
│   │   ├── db/                 # Configuração e conexão com banco de dados
│   │   └── server.ts           # Ponto de entrada do servidor
│   ├── .env                    # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── login/
│   │   ├── html/               # Páginas de autenticação
│   │   ├── js/                 # Scripts de login e cadastro
│   │   └── styles/             # Estilos do módulo de login
│   └── dashboard/
│       ├── html/               # Páginas do dashboard
│       ├── js/                 # Scripts do dashboard
│       └── styles/             # Estilos do dashboard
└── database/
    └── schema.sql              # Schema completo do banco de dados
```

## Funcionalidades Principais

### Módulo de Autenticação
- Cadastro de usuários com validação de email
- Sistema de verificação por código (6 dígitos)
- Login com autenticação JWT
- Recuperação de senha via email
- Validação de senha (mínimo 8 caracteres, maiúsculas e minúsculas)

### Módulo de Gerenciamento
- **Instituições e Cursos**: Cadastro, edição e exclusão de instituições de ensino e seus respectivos cursos
- **Disciplinas**: Gerenciamento de disciplinas por curso com código, sigla e período
- **Turmas**: Criação e gerenciamento de turmas por disciplina
- **Alunos**: Cadastro completo de alunos com RA e nome

### Sistema de Notas
- Criação de componentes de avaliação personalizados (provas, trabalhos, etc.)
- Definição de fórmulas customizadas para cálculo de média
- Lançamento de notas com formatação automática (1 casa decimal)
- Cálculo automático de média final
- Validação de fórmulas matemáticas
- Histórico completo de alterações (auditoria)

### Importação e Exportação
- Importação de alunos via arquivo CSV
- Exportação de lista de alunos (RA e Nome)
- Validação de dados durante importação
- Remoção automática de acentos na exportação

## Requisitos do Sistema

### Servidor
- Node.js versão 14.0 ou superior
- MySQL versão 5.7 ou superior
- 512MB RAM mínimo
- 1GB espaço em disco

### Cliente
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript habilitado
- Resolução mínima: 1280x720

## Instalação e Configuração

### 1. Configuração do Banco de Dados

Execute o script SQL para criar o banco de dados e as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Configuração do Backend

Instale as dependências:

```bash
cd backend
npm install
```

Configure as variáveis de ambiente no arquivo `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=notadezbd
PORT=3000
JWT_SECRET=chave_secreta_segura
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=senha_app_gmail
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Para produção:

```bash
npm run build
npm start
```

### 3. Configuração do Frontend

Abra o arquivo `frontend/login/html/login.html` em um servidor HTTP local (recomendado: Live Server do VS Code).

## API REST

### Endpoints de Autenticação

```
POST   /api/auth/register          # Registrar novo usuário
POST   /api/auth/verify-code       # Verificar código de confirmação
POST   /api/auth/login             # Autenticar usuário
POST   /api/password/request-reset # Solicitar recuperação de senha
POST   /api/password/verify-code   # Verificar código de recuperação
POST   /api/password/reset-password # Redefinir senha
```

### Endpoints de Instituições

```
GET    /api/institutions           # Listar todas as instituições
POST   /api/institutions           # Criar nova instituição
GET    /api/institutions/:id       # Buscar instituição por ID
PUT    /api/institutions/:id       # Atualizar instituição
DELETE /api/institutions/:id       # Deletar instituição
```

### Endpoints de Cursos

```
GET    /api/courses/:id            # Buscar curso por ID
```

### Endpoints de Disciplinas

```
GET    /api/subjects/course/:courseId  # Listar disciplinas do curso
POST   /api/subjects                   # Criar nova disciplina
GET    /api/subjects/:id                # Buscar disciplina por ID
PUT    /api/subjects/:id                # Atualizar disciplina
DELETE /api/subjects/:id                # Deletar disciplina
```

### Endpoints de Turmas

```
GET    /api/classes/subject/:subjectId # Listar turmas da disciplina
POST   /api/classes                    # Criar nova turma
PUT    /api/classes/:id                # Atualizar turma
DELETE /api/classes/:id                # Deletar turma
```

### Endpoints de Alunos

```
GET    /api/students/class/:classId   # Listar alunos da turma
POST   /api/students                  # Criar novo aluno
PUT    /api/students/:id              # Atualizar aluno
DELETE /api/students/:id              # Deletar aluno
```

### Endpoints de Notas

```
GET    /api/grades/class/:classId           # Listar notas da turma
POST   /api/grades                          # Criar/atualizar nota
GET    /api/grade-components/subject/:id   # Listar componentes de avaliação
POST   /api/grade-components               # Criar componente de avaliação
PUT    /api/grade-components/:id           # Atualizar componente
DELETE /api/grade-components/:id           # Deletar componente
```

### Autenticação

Todas as rotas protegidas requerem token JWT no header:

```
Authorization: Bearer <token>
```

## Segurança

- Senhas criptografadas com bcrypt (salt rounds: 10)
- Autenticação baseada em JWT com expiração de 24 horas
- Validação de entrada em todas as rotas
- Proteção contra SQL Injection via prepared statements
- CORS configurado para ambiente de desenvolvimento
- Códigos de verificação com expiração de 15 minutos

## Banco de Dados

### Principais Tabelas

- **users**: Usuários do sistema
- **verification_codes**: Códigos de verificação temporários
- **institutions**: Instituições de ensino
- **courses**: Cursos oferecidos
- **subjects**: Disciplinas dos cursos
- **classes**: Turmas das disciplinas
- **students**: Alunos matriculados
- **grade_components**: Componentes de avaliação
- **grades**: Notas dos alunos
- **audit_log**: Registro de auditoria

### Integridade Referencial

O banco de dados utiliza CASCADE DELETE para manter a integridade referencial, garantindo que a exclusão de registros pai remova automaticamente os registros filhos relacionados.

## Desenvolvimento

### Compilar TypeScript

```bash
cd backend
npm run build
```

### Executar Testes

```bash
npm test
```

## Autores

Gustavo Alves  
Daniela Mikie
Pedro Bellinetti
Equipe PI II - Engenharia de Software  
PUC-Campinas

## Licença

Este projeto é parte do Projeto Integrador II do curso de Engenharia de Software da PUC-Campinas, desenvolvido no ano de 2025.

