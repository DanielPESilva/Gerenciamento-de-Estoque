-- CreateTable
CREATE TABLE `Baixa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roupa_id` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `data_baixa` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `motivo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `telefone` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,

    UNIQUE INDEX `Cliente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Compras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_compra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `forma_pgto` VARCHAR(191) NOT NULL,
    `valor_pago` DOUBLE NOT NULL,
    `fornecendor` VARCHAR(191) NULL,
    `telefone_forncedor` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComprasItens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roupas_id` INTEGER NOT NULL,
    `compras_id` INTEGER NOT NULL,
    `quatidade` INTEGER NOT NULL,
    `valor_peça` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Condicionais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_devolucao` DATETIME(3) NOT NULL,
    `devolvido` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CondicionaisItens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roupas_id` INTEGER NOT NULL,
    `condicionais_id` INTEGER NOT NULL,
    `quatidade` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricoStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roupas_id` INTEGER NULL,
    `status_anterior` ENUM('disponivel', 'em_condicional', 'vendido') NULL,
    `status_novo` ENUM('disponivel', 'em_condicional', 'vendido') NULL,
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roupas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `tamanho` VARCHAR(191) NOT NULL,
    `cor` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `usuarios_id` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data_venda` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `forma_pgto` VARCHAR(191) NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `desconto` DOUBLE NOT NULL DEFAULT 0,
    `valor_pago` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VendasItens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roupas_id` INTEGER NOT NULL,
    `vendas_id` INTEGER NOT NULL,
    `quatidade` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Baixa` ADD CONSTRAINT `Baixa_roupa_id_fkey` FOREIGN KEY (`roupa_id`) REFERENCES `Roupas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComprasItens` ADD CONSTRAINT `ComprasItens_compras_id_fkey` FOREIGN KEY (`compras_id`) REFERENCES `Compras`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComprasItens` ADD CONSTRAINT `ComprasItens_roupas_id_fkey` FOREIGN KEY (`roupas_id`) REFERENCES `Roupas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Condicionais` ADD CONSTRAINT `Condicionais_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondicionaisItens` ADD CONSTRAINT `CondicionaisItens_condicionais_id_fkey` FOREIGN KEY (`condicionais_id`) REFERENCES `Condicionais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CondicionaisItens` ADD CONSTRAINT `CondicionaisItens_roupas_id_fkey` FOREIGN KEY (`roupas_id`) REFERENCES `Roupas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricoStatus` ADD CONSTRAINT `HistoricoStatus_roupas_id_fkey` FOREIGN KEY (`roupas_id`) REFERENCES `Roupas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roupas` ADD CONSTRAINT `Roupas_usuarios_id_fkey` FOREIGN KEY (`usuarios_id`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendasItens` ADD CONSTRAINT `VendasItens_roupas_id_fkey` FOREIGN KEY (`roupas_id`) REFERENCES `Roupas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendasItens` ADD CONSTRAINT `VendasItens_vendas_id_fkey` FOREIGN KEY (`vendas_id`) REFERENCES `Vendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
