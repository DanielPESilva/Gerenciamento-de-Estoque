-- --------------------------------------------------------
-- Banco de Dados: DressFy - Gerenciamento de Estoque
-- Data de Criação: 9 de setembro de 2025
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Criando banco de dados
CREATE DATABASE IF NOT EXISTS `dressfy_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dressfy_db`;

-- Estrutura da tabela `usuarios`
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `cliente`
CREATE TABLE IF NOT EXISTS `cliente` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `roupas`
CREATE TABLE IF NOT EXISTS `roupas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tamanho` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cor` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `preco` double NOT NULL,
  `quantidade` int unsigned NOT NULL DEFAULT '0',
  `usuarios_id` int unsigned NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuarios_id`) USING BTREE,
  CONSTRAINT `FK_roupas_usuarios` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `compras`
CREATE TABLE IF NOT EXISTS `compras` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `data_compra` date DEFAULT (now()),
  `forma_pgto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `valor_pago` double NOT NULL,
  `fornecendor` varchar(255) DEFAULT NULL,
  `telefone_forncedor` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `compras_itens`
CREATE TABLE IF NOT EXISTS `compras_itens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roupas_id` int unsigned NOT NULL,
  `compras_id` int unsigned NOT NULL,
  `quatidade` int unsigned NOT NULL,
  `valor_peça` int unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `roupa_id` (`roupas_id`) USING BTREE,
  KEY `FK_compras_itens_compras` (`compras_id`),
  CONSTRAINT `FK_compras_itens_compras` FOREIGN KEY (`compras_id`) REFERENCES `compras` (`id`),
  CONSTRAINT `FK_compras_itens_roupas` FOREIGN KEY (`roupas_id`) REFERENCES `roupas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `vendas`
CREATE TABLE IF NOT EXISTS `vendas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `data_venda` date DEFAULT (now()),
  `forma_pgto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `valor_total` double NOT NULL,
  `desconto` double NOT NULL DEFAULT '0',
  `valor_pago` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `vendas_itens`
CREATE TABLE IF NOT EXISTS `vendas_itens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roupas_id` int unsigned NOT NULL,
  `vendas_id` int unsigned NOT NULL,
  `quatidade` int unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `roupa_id` (`roupas_id`) USING BTREE,
  KEY `FK_vendas_itens_vendas` (`vendas_id`) USING BTREE,
  CONSTRAINT `FK_vendas_itens_roupas` FOREIGN KEY (`roupas_id`) REFERENCES `roupas` (`id`),
  CONSTRAINT `FK_vendas_itens_vendas` FOREIGN KEY (`vendas_id`) REFERENCES `vendas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `condicionais`
CREATE TABLE IF NOT EXISTS `condicionais` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned NOT NULL,
  `data` date NOT NULL DEFAULT (now()),
  `data_devolucao` date NOT NULL,
  `devolvido` tinyint NOT NULL DEFAULT (0),
  PRIMARY KEY (`id`),
  KEY `FK_condicionais_cliente` (`cliente_id`),
  CONSTRAINT `FK_condicionais_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `condicionais_itens`
CREATE TABLE IF NOT EXISTS `condicionais_itens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roupas_id` int unsigned NOT NULL,
  `condicionais_id` int unsigned NOT NULL,
  `quatidade` int unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `roupa_id` (`roupas_id`) USING BTREE,
  KEY `FK_condicionais_itens_condicionais` (`condicionais_id`),
  CONSTRAINT `FK_condicionais_itens_condicionais` FOREIGN KEY (`condicionais_id`) REFERENCES `condicionais` (`id`),
  CONSTRAINT `FK_condicionais_itens_roupas` FOREIGN KEY (`roupas_id`) REFERENCES `roupas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `historico_status`
CREATE TABLE IF NOT EXISTS `historico_status` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roupas_id` int unsigned DEFAULT NULL,
  `status_anterior` enum('disponivel','em_condicional','vendido') DEFAULT NULL,
  `status_novo` enum('disponivel','em_condicional','vendido') DEFAULT NULL,
  `alterado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `roupa_id` (`roupas_id`) USING BTREE,
  CONSTRAINT `FK_historico_status_roupas` FOREIGN KEY (`roupas_id`) REFERENCES `roupas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estrutura da tabela `baixa`
CREATE TABLE IF NOT EXISTS `baixa` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roupa_id` int unsigned NOT NULL,
  `quantidade` int unsigned NOT NULL,
  `data_baixa` date DEFAULT (now()),
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
