/*
  Warnings:

  - A unique constraint covering the columns `[origen,referenciaId]` on the table `Transaccion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Transaccion_referenciaId_key` ON `transaccion`;

-- CreateIndex
CREATE UNIQUE INDEX `Transaccion_origen_referenciaId_key` ON `Transaccion`(`origen`, `referenciaId`);
