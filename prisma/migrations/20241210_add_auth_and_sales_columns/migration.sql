-- AlterTable
ALTER TABLE `Usuarios`
ADD COLUMN `cpf` VARCHAR(191) NULL,
ADD COLUMN `cnpj` VARCHAR(191) NULL,
ADD COLUMN `reset_code` VARCHAR(191) NULL,
ADD COLUMN `reset_code_expires` DATETIME(3) NULL,
ADD UNIQUE INDEX `Usuarios_cpf_key`(`cpf`),
ADD UNIQUE INDEX `Usuarios_cnpj_key`(`cnpj`);

-- AlterTable
ALTER TABLE `Vendas`
ADD COLUMN `descricao_permuta` VARCHAR(191) NULL,
ADD COLUMN `nome_cliente` VARCHAR(191) NULL,
ADD COLUMN `telefone_cliente` VARCHAR(191) NULL;
-- AlterTable
ALTER TABLE `Usuarios`
ADD COLUMN `cpf` VARCHAR(191) NULL,
ADD COLUMN `cnpj` VARCHAR(191) NULL,
ADD COLUMN `reset_code` VARCHAR(191) NULL,
ADD COLUMN `reset_code_expires` DATETIME(3) NULL,
ADD UNIQUE INDEX `Usuarios_cpf_key`(`cpf`),
ADD UNIQUE INDEX `Usuarios_cnpj_key`(`cnpj`);

-- AlterTable
ALTER TABLE `Vendas`
ADD COLUMN `descricao_permuta` VARCHAR(191) NULL,
ADD COLUMN `nome_cliente` VARCHAR(191) NULL,
ADD COLUMN `telefone_cliente` VARCHAR(191) NULL;
