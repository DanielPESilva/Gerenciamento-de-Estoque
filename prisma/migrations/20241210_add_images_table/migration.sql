   -- CreateTable
   CREATE TABLE `Imagens` (
       `id` INTEGER NOT NULL AUTO_INCREMENT,
       `item_id` INTEGER NOT NULL,
       `url` VARCHAR(191) NOT NULL,
       `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

       PRIMARY KEY (`id`)
   ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- AddForeignKey
   ALTER TABLE `Imagens`
   ADD CONSTRAINT `Imagens_item_id_fkey`
   FOREIGN KEY (`item_id`) REFERENCES `Roupas`(`id`)
   ON DELETE CASCADE ON UPDATE CASCADE;