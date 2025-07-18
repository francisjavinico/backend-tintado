import express from "express";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === "http://localhost:5173" ||
        origin === "https://frontend-tintado.vercel.app" ||
        /\.vercel\.app$/.test(origin) ||
        origin === "https://www.ahumaglass.com" ||
        origin === "https://ahumaglass.com"
      ) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
