-- AlterTable
ALTER TABLE `factura` ADD COLUMN `citaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `recibo` ADD COLUMN `citaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Factura` ADD CONSTRAINT `Factura_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recibo` ADD CONSTRAINT `Recibo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
