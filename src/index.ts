import "express-async-errors";
import { app } from "./server";
import { errorHandler } from "./middlewares/errorHandler";
import dotenv from "dotenv";
import { Router } from "express";
import router from "./routes";

dotenv.config();
const PORT = process.env.PORT ?? 3000;

app.use("/api", router);
app.use(errorHandler);
app.listen(PORT);
