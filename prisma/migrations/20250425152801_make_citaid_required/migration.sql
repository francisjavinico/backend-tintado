/*
  Warnings:

  - Made the column `citaId` on table `recibo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `recibo` DROP FOREIGN KEY `Recibo_citaId_fkey`;

-- DropIndex
DROP INDEX `Recibo_citaId_fkey` ON `recibo`;

-- AlterTable
ALTER TABLE `recibo` MODIFY `citaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Recibo` ADD CONSTRAINT `Recibo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
