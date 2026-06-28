import "dotenv/config";
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
const PORT = Number(process.env.API_PORT ?? 4000);
const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// Santé
app.get("/health", (_req, res) => res.json({ status: "ok" }));

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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[taskflow-api] en écoute sur http://localhost:${PORT}`);
});
