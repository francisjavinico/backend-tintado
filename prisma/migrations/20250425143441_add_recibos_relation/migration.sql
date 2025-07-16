/*
  Warnings:

  - A unique constraint covering the columns `[telefono]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subtotal` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `factura` ADD COLUMN `subtotal` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Recibo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `descripcion` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cliente_telefono_key` ON `Cliente`(`telefono`);

-- AddForeignKey
ALTER TABLE `Recibo` ADD CONSTRAINT `Recibo_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
