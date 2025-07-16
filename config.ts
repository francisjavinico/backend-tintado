/* eslint-disable n/no-process-env */

import dotenv from "dotenv";
dotenv.config(); // Carga .env en local, y en Railway usa process.env

import moduleAlias from "module-alias";

// Configure moduleAlias
if (__filename.endsWith("js")) {
  moduleAlias.addAlias("@src", __dirname + "/dist");
}
