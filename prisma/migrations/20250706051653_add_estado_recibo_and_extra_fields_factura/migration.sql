-- AlterTable
ALTER TABLE `factura` ADD COLUMN `direccion_completa` VARCHAR(191) NULL,
    ADD COLUMN `dni_nie` VARCHAR(191) NULL,
    ADD COLUMN `matricula` VARCHAR(191) NULL,
    ADD COLUMN `nombre_cliente` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `recibo` ADD COLUMN `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente';
