/*
  Warnings:

  - You are about to drop the column `presupuestoMin` on the `Cita` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Cita` DROP COLUMN `presupuestoMin`,
    MODIFY `presupuestoMax` DOUBLE NULL;
