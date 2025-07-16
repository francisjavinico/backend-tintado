/*
  Warnings:

  - Added the required column `direccion` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroAnual` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroAnual` to the `Recibo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `direccion` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `factura` ADD COLUMN `numeroAnual` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `recibo` ADD COLUMN `numeroAnual` INTEGER NOT NULL;
