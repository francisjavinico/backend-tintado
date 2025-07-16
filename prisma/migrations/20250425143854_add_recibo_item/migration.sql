-- CreateTable
CREATE TABLE `ReciboItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reciboId` INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `precioUnit` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReciboItem` ADD CONSTRAINT `ReciboItem_reciboId_fkey` FOREIGN KEY (`reciboId`) REFERENCES `Recibo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
