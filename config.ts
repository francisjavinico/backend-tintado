/* eslint-disable n/no-process-env */

import path from "path";
import dotenv from "dotenv";
import moduleAlias from "module-alias";

// Check the env
const NODE_ENV = process.env.NODE_ENV ?? "development";

if (NODE_ENV === "development") {
  // Solo en local, carga archivo .env
  dotenv.config({
    path: path.join(__dirname, "./config/.env.development"),
  });
} else {
  // En producción (Railway), usa variables de entorno ya definidas
  dotenv.config(); // carga desde process.env directamente
}

// Configure moduleAlias
if (__filename.endsWith("js")) {
  moduleAlias.addAlias("@src", __dirname + "/dist");
}
