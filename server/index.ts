// Point d'entrée pour le développement local (process Node persistant).
// En production sur Vercel, c'est api/index.ts qui sert l'app Express
// en fonction serverless — ce fichier n'y est pas utilisé.
import app from "./app";

const PORT = Number(process.env.API_PORT ?? 4000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[taskflow-api] en écoute sur http://localhost:${PORT}`);
});
