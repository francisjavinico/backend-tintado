import express from "express";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://frontend-tintado.vercel.app",
      "https://frontend-tintado-7fctaokae-francisco-nietos-projects.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
