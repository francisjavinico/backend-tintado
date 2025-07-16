/*
  Warnings:

  - Added the required column `servicios` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicios` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cita` ADD COLUMN `servicios` JSON NOT NULL DEFAULT ('[]');

-- AlterTable
ALTER TABLE `factura` ADD COLUMN `servicios` JSON NOT NULL DEFAULT ('[]');
