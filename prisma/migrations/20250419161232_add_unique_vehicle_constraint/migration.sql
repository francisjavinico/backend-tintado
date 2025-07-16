/*
  Warnings:

  - A unique constraint covering the columns `[marca,modelo,año,numeroPuertas]` on the table `Vehiculo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Vehiculo_marca_modelo_año_numeroPuertas_key` ON `Vehiculo`(`marca`, `modelo`, `año`, `numeroPuertas`);
