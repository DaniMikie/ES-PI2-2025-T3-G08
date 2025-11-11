-- NotaDez - Sistema de Gerenciamento de Notas Acadêmicas
-- Projeto Integrador II - Engenharia de Software - PUC-Campinas 2025
-- Banco de dados MySQL - Estrutura simplificada mas completa


--Autor: Daniela Mikie
--Projeto: Projeto NotaDez
--Arquivo: schema.sql
--Data: 26/10/2025

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS notadezbd_final_teste CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE notadezbd_final_teste;

-- 1. Tabela de usuários (professores)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela de instituições
CREATE TABLE institutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabela de cursos
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    institution_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
);

-- 4. Tabela de disciplinas
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    final_grade_formula TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. Tabela de turmas
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 6. Tabela de alunos
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_class (class_id, student_id)
);

-- 7. Tabela de componentes de nota
CREATE TABLE grade_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 8. Tabela de notas
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    grade_component_id INT NOT NULL,
    grade DECIMAL(4,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_component_id) REFERENCES grade_components(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_component (student_id, grade_component_id)
);

-- 9. Tabela de auditoria (log de alterações)
-- IMPORTANTE: IDs são preservados mesmo após exclusões para manter histórico completo
CREATE TABLE grade_audit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NULL,
    grade_component_id INT NULL,
    old_grade DECIMAL(4,2) NULL,
    new_grade DECIMAL(4,2) NULL,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Sem FOREIGN KEYs para preservar IDs após exclusões
);

--SELECTS
--SHOW TABLES;
--SELECT*FROM users;
--SELECT*FROM institutions;
--SELECT*FROM courses;
--SELECT*FROM subjects;
--SELECT*FROM classes;
--SELECT*FROM students;
--SELECT*FROM grade_components;
--SELECT*FROM grades;
--SELECT*FROM grade_audit;
