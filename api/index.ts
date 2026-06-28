// Fonction serverless Vercel : expose l'API Express.
// Le rewrite de vercel.json envoie toutes les requêtes /api/* ici ;
// Express se charge ensuite du routage interne.
import app from "../server/app";

export default app;
