-- CreateTable
CREATE TABLE `NumeradorFactura` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `ultimoNumero` INTEGER NOT NULL,

    UNIQUE INDEX `NumeradorFactura_year_key`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
