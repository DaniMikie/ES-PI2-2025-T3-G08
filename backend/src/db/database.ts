/**
 * Configuração do banco de dados MySQL
 * Autor: Equipe PI II - PUC Campinas
 * Descrição: Gerenciamento de conexões com MySQL usando pool de conexões
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do pool de conexões MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost', // Endereço do servidor MySQL
    user: process.env.DB_USER || 'root', // Usuário do banco
    password: process.env.DB_PASSWORD || '', // Senha do banco
    database: process.env.DB_NAME || 'notadezbd', // Nome do banco de dados
    waitForConnections: true, // Aguarda conexão disponível se pool estiver cheio
    connectionLimit: 10, // Máximo de 10 conexões simultâneas
    queueLimit: 0, // Sem limite de requisições na fila
    charset: 'utf8mb4' // Suporte a caracteres especiais e emojis
};

// Cria pool de conexões reutilizáveis
const pool = mysql.createPool(dbConfig);

/**
 * Testa conexão com banco de dados ao iniciar servidor
 * Retorna Promise<boolean> - true se conectado, false se erro
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com MySQL estabelecida com sucesso');
        connection.release(); // Libera conexão de volta ao pool
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com MySQL:', error);
        return false;
    }
};

/**
 * Executa query SQL com prepared statements (proteção contra SQL Injection)
 * query - Query SQL com placeholders (?)
 * params - Array de parâmetros para substituir placeholders
 * Retorna Promise<any> - Resultado da query
 */
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Erro ao executar query:', error);
        throw error;
    }
};

/**
 * Executa múltiplas queries em uma transação (tudo ou nada)
 * Se alguma query falhar, todas são revertidas (rollback)
 * queries - Array de objetos com query e params
 * Retorna Promise<any> - Array com resultados de todas as queries
 */
export const executeTransaction = async (queries: { query: string; params: any[] }[]): Promise<any> => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction(); // Inicia transação
        
        const results = [];
        // Executa cada query sequencialmente
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit(); // Confirma todas as alterações
        return results;
    } catch (error) {
        await connection.rollback(); // Reverte todas as alterações em caso de erro
        throw error;
    } finally {
        connection.release(); // Libera conexão de volta ao pool
    }
};

export default pool;