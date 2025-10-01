-- ========================================
-- DressFy - Inicialização do Banco
-- ========================================

-- Criar banco se não existir
CREATE DATABASE IF NOT EXISTS dressfy_db;
USE dressfy_db;

-- Configurações de performance
SET GLOBAL innodb_buffer_pool_size = 134217728; -- 128MB
SET GLOBAL max_connections = 100;