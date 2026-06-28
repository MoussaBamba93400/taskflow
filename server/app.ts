import "./env"; // doit rester le tout premier import (charge les variables d'env)
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { requireAuth } from "./auth";
import tasksRouter from "./routes/tasks";
import columnsRouter from "./routes/columns";

const app = express();

// CORS_ORIGIN absent (ou "*") → on reflète l'origine de la requête (toutes
// origines autorisées : pratique en local et en serverless same-origin).
// Sinon on accepte la liste d'origines séparées par des virgules.
const rawOrigin = process.env.CORS_ORIGIN?.trim();
const ORIGIN: cors.CorsOptions["origin"] =
  !rawOrigin || rawOrigin === "*"
    ? true
    : rawOrigin.split(",").map((o) => o.trim());

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// Santé (/api/health est joignable derrière le rewrite Vercel)
app.get(["/health", "/api/health"], (_req, res) => res.json({ status: "ok" }));

// Toutes les routes /api sont protégées par l'authentification Supabase.
app.use("/api/tasks", requireAuth, tasksRouter);
app.use("/api/columns", requireAuth, columnsRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "Route introuvable" }));

// Gestionnaire d'erreurs global
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error("[taskflow-api]", err);
  res.status(500).json({ error: "Erreur serveur interne" });
});

export default app;
